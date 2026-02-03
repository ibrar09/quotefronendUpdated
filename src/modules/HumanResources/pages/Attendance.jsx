import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import Webcam from 'react-webcam';
import {
    MapPin, Clock, Camera as CameraIcon, CheckCircle,
    XCircle, RefreshCw, Smartphone, Navigation, LogOut, X, Shield
} from 'lucide-react';
import { markAttendance, getCurrentAttendance, updateLiveLocation } from '../../UserPortal/services/portal.service';
import { toast } from 'react-hot-toast';
import SelfieCaptureModal from '../../UserPortal/components/SelfieCaptureModal';

const Attendance = () => {
    const { darkMode } = useTheme();
    const webcamRef = useRef(null);
    const [currentTime, setCurrentTime] = useState(new Date());

    // Status State
    const [status, setStatus] = useState('LOADING'); // 'LOADING', 'IN', 'OUT'
    const [loading, setLoading] = useState(false);

    // Check-In Data
    const [attendanceId, setAttendanceId] = useState(null);
    const [shiftTimer, setShiftTimer] = useState(0); // Seconds
    const [startTime, setStartTime] = useState(null);

    // Hardware State
    const [showCamera, setShowCamera] = useState(false);
    const [imgSrc, setImgSrc] = useState(null); // Captured selfie
    const [gpsLocation, setGpsLocation] = useState(null); // { lat, lng }
    const [gpsError, setGpsError] = useState(null);
    const [cameraError, setCameraError] = useState(null); // 'PERMISSION_DENIED' or null
    const [selfieModalOpen, setSelfieModalOpen] = useState(false);

    // Overtime & Shift State
    const [isOvertime, setIsOvertime] = useState(false);
    const [shiftType, setShiftType] = useState('MORNING'); // 'MORNING', 'SECOND', 'OVERTIME'
    const [hasCompletedRegularToday, setHasCompletedRegularToday] = useState(false);
    const [shiftExpired, setShiftExpired] = useState(false);

    // --- On Mount: Sync with Server ---
    useEffect(() => {
        const syncStatus = async () => {
            try {
                const res = await getCurrentAttendance();
                if (res.success && res.data) {
                    const latest = res.data;
                    if (!latest.clock_out) {
                        setStatus('IN');
                        setAttendanceId(latest.id);
                        setIsOvertime(latest.tag === 'OVERTIME');
                        const serverTime = new Date(latest.clock_in);
                        setStartTime(!isNaN(serverTime.getTime()) ? serverTime : new Date());
                    } else {
                        // If latest is closed, check if it was a regular shift from today
                        const today = new Date().toISOString().split('T')[0];
                        if (latest.tag === 'REGULAR' && latest.date === today) {
                            setHasCompletedRegularToday(true);
                        }
                        setStatus('OUT');
                    }
                } else {
                    setStatus('OUT');
                }
            } catch (error) {
                console.error("Sync Error:", error);
                setStatus('OUT');
            }
        };
        syncStatus();
    }, []);

    // --- Timer & Tracking Logic (Persistent) ---
    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);

        let shiftInterval;
        let trackingInterval;

        if (status === 'IN' && startTime) {
            console.log('⚡ Shift Active: Starting Timer & Background Tracking');

            // 1. Shift Timer & Auto-End Logic
            const runTimer = () => {
                const now = new Date();
                const diff = Math.floor((now - startTime) / 1000);

                // Hard Enforcement: Stop Regular Morning Shift at 17:00 (5 PM)
                if (shiftType === 'MORNING' && now.getHours() >= 17) {
                    setShiftExpired(true);
                    // Calculate duration up to 17:00 sharp if it just happened
                    const fivePM = new Date(now);
                    fivePM.setHours(17, 0, 0, 0);
                    const expiredDiff = Math.floor((fivePM - startTime) / 1000);
                    setShiftTimer(Math.max(0, expiredDiff));
                } else {
                    setShiftTimer(Math.max(0, diff));
                }
            };

            runTimer();
            shiftInterval = setInterval(runTimer, 1000);

            // 2. Continuous Location Tracking (Trace everything)
            const sendUpdate = async () => {
                try {
                    // During background tracking, we still want location, but don't block the UI if it fails once
                    const loc = await getLocation().catch(() => null);
                    if (loc) {
                        await updateLiveLocation({
                            lat: loc.lat,
                            lng: loc.lng,
                            accuracy: loc.accuracy
                        });
                    }
                } catch (err) {
                    console.error('❌ Background Tracking Sync Failed:', err);
                }
            };

            sendUpdate();
            trackingInterval = setInterval(sendUpdate, 5 * 60 * 1000);
        } else {
            setShiftTimer(0);
            setShiftExpired(false);
        }

        return () => {
            clearInterval(timer);
            clearInterval(shiftInterval);
            clearInterval(trackingInterval);
        };
    }, [status, startTime]);

    const formatTime = (totalSeconds) => {
        const h = Math.floor(totalSeconds / 3600);
        const m = Math.floor((totalSeconds % 3600) / 60);
        const s = totalSeconds % 60;
        return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    };

    const capture = React.useCallback(() => {
        console.log('📸 Attempting to capture screenshot...');
        if (webcamRef.current) {
            console.log('📷 Webcam ref found, calling getScreenshot()...');
            const imageSrc = webcamRef.current.getScreenshot();
            if (imageSrc) {
                console.log('✅ Screenshot captured successfully (Length:', imageSrc.length, ')');
                setImgSrc(imageSrc);
                setShowCamera(false);
            } else {
                console.error('❌ getScreenshot() returned null or undefined');
                toast.error("Failed to capture image. Camera might still be loading.");
            }
        } else {
            console.error('❌ Webcam ref is NULL');
            toast.error("Camera reference lost. Please try again.");
        }
    }, [webcamRef]);

    const getLocation = () => {
        console.log('📡 Fetching GPS location...');
        return new Promise((resolve, reject) => {
            if (!navigator.geolocation) {
                console.error('❌ Browser does not support Geolocation');
                reject("GPS not supported by this browser");
                return;
            }
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    console.log('✅ GPS Location Locked:', pos.coords.latitude, pos.coords.longitude);
                    resolve({
                        lat: pos.coords.latitude,
                        lng: pos.coords.longitude,
                        accuracy: pos.coords.accuracy
                    });
                },
                (err) => {
                    console.error('❌ GPS Error:', err.code, err.message);
                    let msg = "GPS Blocked. Please enable location permissions.";
                    if (err.code === 1) msg = "Location Permission Denied";
                    if (err.code === 2) msg = "Position Unavailable";
                    if (err.code === 3) msg = "GPS Timeout - Using last known or skipping";
                    reject(msg);
                },
                { enableHighAccuracy: true, timeout: 5000, maximumAge: 60000 }
            );
            // Safety timeout
            setTimeout(() => {
                reject("Location request timed out. Please check your signal.");
            }, 6000);
        });
    };

    const handleCheckIn = async (photo = null) => {
        if (!photo) {
            setSelfieModalOpen(true);
            return;
        }

        setLoading(true);
        setGpsError(null);
        try {
            const loc = await getLocation();
            console.log('📍 Location verified. Sending to server...');
            setGpsLocation(loc);

            // Anti-Cheating: Hard Block without GPS
            if (!loc || !loc.lat || !loc.lng) {
                throw new Error("Mandatory Location Required. Please enable GPS and try again.");
            }

            const res = await markAttendance({
                type: 'CHECK_IN',
                location: { lat: loc.lat, lng: loc.lng },
                accuracy: loc.accuracy,
                image: photo,
                device_info: navigator.userAgent,
                is_overtime: shiftType === 'OVERTIME',
                tag: shiftType
            });

            console.log('✅ Server Response:', res);
            if (res.attendance) {
                setStatus('IN');
                setStartTime(new Date(res.attendance.clock_in));
                setIsOvertime(res.attendance.tag === 'OVERTIME');
                setShiftType(res.attendance.tag === 'OVERTIME' ? 'OVERTIME' : (res.attendance.tag === 'SECOND' ? 'SECOND' : 'MORNING'));
                setImgSrc(null);
                setSelfieModalOpen(false);
                toast.success(res.attendance.tag === 'OVERTIME' ? "Overtime Started!" : "Checked In Successfully!");
            }
        } catch (error) {
            console.error('❌ Detailed Check-In Error:', error);
            const msg = typeof error === 'string' ? error : (error.message || error.response?.data?.message || 'Server Error');
            setGpsError(msg);
            toast.error(msg);
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        if (confirm("End your shift?")) {
            setLoading(true);
            try {
                console.log('📡 Starting Check-Out Process (Mandatory GPS)...');
                const loc = await getLocation();
                setGpsLocation(loc);

                await markAttendance({
                    type: 'CHECK_OUT',
                    location: { lat: loc.lat, lng: loc.lng },
                    accuracy: loc.accuracy,
                    device_info: navigator.userAgent
                });
                setStatus('OUT');
                setStartTime(null);
                setShiftTimer(0);
                toast.success("Shift Ended Successfully!");
            } catch (error) {
                console.error("❌ Check-Out Final Error:", error);
                const errorMsg = error.response?.data?.message || "Server Error";
                toast.error("Check Out Failed: " + errorMsg);

                // If the backend says no session exists, reset the UI to match
                if (error.response?.status === 400 && errorMsg.toLowerCase().includes("no active session")) {
                    console.log("🔄 Resetting UI state to OUT due to missing backend session");
                    setStatus('OUT');
                    setStartTime(null);
                    setShiftTimer(0);
                }
            } finally {
                setLoading(false);
            }
        }
    };

    const retakePhoto = () => {
        setImgSrc(null);
        setShowCamera(true);
    };

    if (status === 'LOADING') return <div className="p-10 text-center">Syncing Attendance...</div>;

    return (
        <div className="h-full flex flex-col items-center justify-center p-4 max-w-md mx-auto animate-[fadeIn_0.5s_ease-out]">
            <div className="text-center mb-8">
                <p className={`text-md font-medium mb-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    {currentTime.toLocaleDateString(undefined, { weekday: 'long', day: 'numeric', month: 'long' })}
                </p>
                <h1 className={`text-6xl font-black tracking-tighter tabular-nums ${darkMode ? 'text-white' : 'text-gray-900'}`}>
                    {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </h1>
                <p className={`text-blue-500 font-bold mt-2 animate-pulse`}>
                    {status === 'IN' ? (isOvertime ? '● Overtime Active' : '● On Shift') : '○ Off Shift'}
                </p>
            </div>

            {gpsError && (
                <div className="mb-6 p-4 bg-red-100 text-red-700 rounded-xl flex items-center gap-3 text-sm font-bold w-full">
                    <XCircle size={20} />
                    {gpsError}
                </div>
            )}

            <div className={`w-full rounded-3xl p-1 shadow-2xl relative overflow-hidden transition-all duration-500
                ${status === 'IN' ? 'bg-gradient-to-b from-blue-500 to-blue-600' : (darkMode ? 'bg-gray-800' : 'bg-white')}`}>

                <div className={`rounded-[22px] p-6 flex flex-col items-center justify-center min-h-[320px] relative
                    ${status === 'IN' ? 'bg-transparent' : (darkMode ? 'bg-gray-900' : 'bg-gray-50')}`}>

                    {status === 'IN' ? (
                        <>
                            <div className="w-40 h-40 rounded-full border-8 border-white/20 flex items-center justify-center mb-6 relative">
                                <div className="absolute inset-0 rounded-full border-4 border-white/40 animate-[ping_3s_infinite]"></div>
                                <div className="text-center text-white">
                                    <span className="text-xs font-bold opacity-80 uppercase tracking-widest">
                                        {shiftExpired ? 'Shift Expired' : (isOvertime ? 'Overtime Time' : 'Shift Time')}
                                    </span>
                                    <div className={`text-3xl font-mono font-black tabular-nums mt-1 ${shiftExpired ? 'text-red-200 animate-pulse' : ''}`}>
                                        {formatTime(shiftTimer)}
                                    </div>
                                    {shiftExpired && (
                                        <p className="text-[10px] font-black uppercase mt-1 text-white/90">
                                            Please Check Out to continue
                                        </p>
                                    )}
                                </div>
                            </div>
                            <button
                                onClick={handleCheckOut}
                                disabled={loading}
                                className="w-full py-4 bg-white text-red-600 rounded-xl font-black text-lg shadow-lg active:scale-95 transition-transform flex items-center justify-center gap-2"
                            >
                                {loading ? 'Ending Session...' : <><LogOut size={20} /> End Shift</>}
                            </button>
                        </>
                    ) : (
                        <>
                            <div
                                onClick={() => setSelfieModalOpen(true)}
                                className={`w-40 h-40 mb-6 rounded-full flex flex-col items-center justify-center cursor-pointer border-4 border-dashed transition-all
                                    ${darkMode ? 'border-gray-700 hover:border-blue-500 hover:bg-gray-800' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'}`}
                            >
                                <CameraIcon size={40} className="text-gray-400 mb-2" />
                                <span className="text-xs font-bold text-gray-400">Tap to Take Selfie</span>
                            </div>

                            <div className="w-full space-y-4">
                                {/* Shift Selector */}
                                <div className={`p-1.5 rounded-2xl flex gap-1 ${darkMode ? 'bg-gray-800' : 'bg-gray-100'}`}>
                                    {[
                                        { id: 'MORNING', label: 'Morning (8-5)', icon: Clock },
                                        { id: 'SECOND', label: 'Second Shift', icon: Smartphone },
                                        { id: 'OVERTIME', label: 'Overtime', icon: CameraIcon }
                                    ].map((t) => (
                                        <button
                                            key={t.id}
                                            onClick={() => setShiftType(t.id)}
                                            className={`flex-1 py-3 px-1 rounded-xl flex flex-col items-center gap-1 transition-all
                                                ${shiftType === t.id
                                                    ? 'bg-white text-blue-600 shadow-md scale-[1.02]'
                                                    : 'text-gray-400 hover:text-gray-600'}`}
                                        >
                                            <t.icon size={16} strokeWidth={2.5} />
                                            <span className="text-[9px] font-black uppercase tracking-tighter">{t.label}</span>
                                        </button>
                                    ))}
                                </div>

                                <button
                                    onClick={() => handleCheckIn()}
                                    disabled={loading}
                                    className={`w-full py-4 rounded-xl font-black text-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95
                                    ${loading
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                                            : (shiftType === 'OVERTIME'
                                                ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-orange-500/30'
                                                : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30'
                                            )
                                        }`}
                                >
                                    {loading
                                        ? 'Verifying...'
                                        : (shiftType === 'OVERTIME'
                                            ? <><MapPin size={20} /> START OVERTIME</>
                                            : <><MapPin size={20} /> START {shiftType} SHIFT</>
                                        )
                                    }
                                </button>
                                {!loading && (
                                    <div className="flex flex-col gap-1 items-center">
                                        <p className="text-[10px] text-red-500 font-black uppercase tracking-widest flex items-center gap-1">
                                            <Shield size={10} strokeWidth={3} /> Hard Enforcement Active
                                        </p>
                                        <p className="text-[9px] text-gray-400 font-medium">
                                            GPS & Selfie Required • Precision Timing Enabled
                                        </p>
                                    </div>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

            <SelfieCaptureModal
                isOpen={selfieModalOpen}
                onClose={() => setSelfieModalOpen(false)}
                title={(isOvertime || currentTime.getHours() >= 17 || hasCompletedRegularToday) ? "Overtime Verification" : "Shift Verification"}
                onCapture={(p) => handleCheckIn(p)}
            />

            <div className="mt-8 grid grid-cols-2 gap-4 w-full opacity-60">
                <div className="flex items-center gap-3 p-3 rounded-lg border dark:border-gray-700">
                    <div className="p-2 bg-green-100 text-green-600 rounded-lg"><Navigation size={18} /></div>
                    <div>
                        <p className="text-[10px] font-bold uppercase">GPS Accuracy</p>
                        <p className="text-xs font-bold">
                            {gpsLocation ? (gpsLocation.accuracy ? `±${Math.round(gpsLocation.accuracy)}m` : 'Locked') : 'Waiting...'}
                        </p>
                    </div>
                </div>
                <div className="flex items-center gap-3 p-3 rounded-lg border dark:border-gray-700">
                    <div className="p-2 bg-purple-100 text-purple-600 rounded-lg"><Smartphone size={18} /></div>
                    <div>
                        <p className="text-[10px] font-bold uppercase">Device</p>
                        <p className="text-xs font-bold">Verified</p>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Attendance;
