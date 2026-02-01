import React, { useState, useEffect, useRef } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import Webcam from 'react-webcam';
import {
    MapPin, Clock, Camera as CameraIcon, CheckCircle,
    XCircle, RefreshCw, Smartphone, Navigation, LogOut, X
} from 'lucide-react';
import { markAttendance, getCurrentAttendance, updateLiveLocation } from '../../UserPortal/services/portal.service';
import { toast } from 'react-hot-toast';

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

    // Overtime State
    const [isOvertime, setIsOvertime] = useState(false);
    const [hasCompletedRegularToday, setHasCompletedRegularToday] = useState(false);

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

            // 1. Shift Timer
            const diffFn = () => Math.floor((new Date() - startTime) / 1000);
            setShiftTimer(Math.max(0, diffFn()));
            shiftInterval = setInterval(() => {
                setShiftTimer(Math.max(0, diffFn()));
            }, 1000);

            // 2. Continuous Location Tracking (Trace everything)
            const sendUpdate = async () => {
                try {
                    console.log('📡 Background Tracking: Fetching GPS...');
                    const loc = await getLocation();
                    await updateLiveLocation({
                        lat: loc.lat,
                        lng: loc.lng,
                        accuracy: loc.accuracy
                    });
                    console.log('✅ Background Tracking: Sync successful');
                } catch (err) {
                    console.error('❌ Background Tracking Sync Failed:', err);
                }
            };

            // Initial immediate update when starting/syncing
            sendUpdate();
            // Then every 5 minutes
            trackingInterval = setInterval(sendUpdate, 5 * 60 * 1000);
        } else {
            setShiftTimer(0);
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

    const handleCheckIn = async () => {
        console.log('🚀 handleCheckIn triggered. Current imgSrc exists?', !!imgSrc, '| Camera Open?', showCamera);
        if (!imgSrc) {
            if (showCamera) {
                console.log('📸 Camera is already open, triggering capture...');
                capture();
                return;
            }
            console.log('📸 No image found, opening camera...');
            setShowCamera(true);
            return;
        }
        setLoading(true);
        setGpsError(null);
        try {
            const loc = await getLocation();
            console.log('📍 Location verified. Sending to server...');
            setGpsLocation(loc);

            const res = await markAttendance({
                type: 'CHECK_IN',
                location: { lat: loc.lat, lng: loc.lng },
                accuracy: loc.accuracy,
                image: imgSrc,
                device_info: navigator.userAgent,
                is_overtime: isOvertime || (currentTime.getHours() >= 17 || hasCompletedRegularToday)
            });

            console.log('✅ Server Response:', res);
            if (res.attendance) {
                setStatus('IN');
                setStartTime(new Date(res.attendance.clock_in));
                setIsOvertime(res.attendance.tag === 'OVERTIME');
                setImgSrc(null);
                toast.success(res.attendance.tag === 'OVERTIME' ? "Overtime Started!" : "Checked In Successfully!");
            }
        } catch (error) {
            console.error('❌ Detailed Check-In Error:', error);
            if (typeof error === 'string') {
                setGpsError(error);
            } else {
                toast.error("Check In Failed: " + (error.response?.data?.message || 'Server Error'));
            }
        } finally {
            setLoading(false);
        }
    };

    const handleCheckOut = async () => {
        if (confirm("End your shift?")) {
            setLoading(true);
            try {
                console.log('📡 Starting Check-Out Process...');
                // Attempt to get location, but fall back if it fails so session can still end
                let loc = { lat: null, lng: null, accuracy: null };
                try {
                    loc = await getLocation();
                } catch (gpsErr) {
                    console.warn("⚠️ GPS Failed during check-out, proceeding without coordinates:", gpsErr);
                    toast.error("Location signal weak. Ending session without GPS.");
                }

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
                                        {isOvertime ? 'Overtime Time' : 'Shift Time'}
                                    </span>
                                    <div className="text-3xl font-mono font-black tabular-nums mt-1">
                                        {formatTime(shiftTimer)}
                                    </div>
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
                            {showCamera ? (
                                <div className="relative w-full h-64 bg-black rounded-2xl overflow-hidden mb-6">
                                    <div className="absolute inset-0 flex items-center justify-center text-white/50 bg-gray-900 pointer-events-none">
                                        <div className="animate-pulse">Loading Camera...</div>
                                    </div>
                                    <button
                                        onClick={() => setShowCamera(false)}
                                        className="absolute top-4 right-4 z-20 p-2 bg-black/50 text-white rounded-full hover:bg-black/70 transition-colors"
                                    >
                                        <X size={20} />
                                    </button>
                                    <Webcam
                                        audio={false}
                                        ref={webcamRef}
                                        screenshotFormat="image/jpeg"
                                        forceScreenshotSourceSize={true}
                                        className="w-full h-full object-cover relative z-10"
                                        videoConstraints={{ facingMode: "user" }}
                                        onUserMedia={() => {
                                            console.log('🎥 Webcam Stream Connected Successfully');
                                            toast.success("Camera is ready!");
                                        }}
                                        onUserMediaError={(err) => {
                                            console.error('🎥 Webcam Media Error:', err);
                                            if (err.name === 'NotAllowedError' || err.name === 'PermissionDeniedError') {
                                                setCameraError('PERMISSION_DENIED');
                                            } else {
                                                toast.error("Camera Hardware Error: " + err.name);
                                                setShowCamera(false);
                                            }
                                        }}
                                    />
                                    {cameraError === 'PERMISSION_DENIED' && (
                                        <div className="absolute inset-0 z-20 bg-gray-900/95 flex flex-col items-center justify-center p-6 text-center text-white">
                                            <CameraIcon size={48} className="text-red-500 mb-4" />
                                            <h3 className="text-lg font-bold mb-2">Camera Access Blocked</h3>
                                            <p className="text-xs text-gray-400 mb-6">
                                                Please click the 🔓 icon in your browser's address bar and set Camera to <b>"Allow"</b>, then click Reset.
                                            </p>
                                            <button
                                                onClick={() => {
                                                    setCameraError(null);
                                                    setShowCamera(false);
                                                    setTimeout(() => setShowCamera(true), 100);
                                                }}
                                                className="px-6 py-2 bg-blue-600 rounded-lg text-sm font-bold active:scale-95 transition-transform"
                                            >
                                                Reset & Retry
                                            </button>
                                        </div>
                                    )}
                                    <button
                                        onClick={capture}
                                        className="absolute bottom-4 left-1/2 transform -translate-x-1/2 p-4 bg-white rounded-full shadow-lg active:scale-90 transition-transform"
                                    >
                                        <div className="w-4 h-4 rounded-full bg-red-500"></div>
                                    </button>
                                </div>
                            ) : imgSrc ? (
                                <div className="relative w-40 h-40 mb-6 group cursor-pointer" onClick={retakePhoto}>
                                    <img src={imgSrc} alt="Selfie" className="w-full h-full object-cover rounded-full border-4 border-blue-500 shadow-xl" />
                                    <div className="absolute inset-0 bg-black/40 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                        <RefreshCw className="text-white" />
                                    </div>
                                    <div className="absolute bottom-0 right-0 bg-green-500 text-white p-1.5 rounded-full border-2 border-white">
                                        <CheckCircle size={16} />
                                    </div>
                                </div>
                            ) : (
                                <div
                                    onClick={() => setShowCamera(true)}
                                    className={`w-40 h-40 mb-6 rounded-full flex flex-col items-center justify-center cursor-pointer border-4 border-dashed transition-all
                                    ${darkMode ? 'border-gray-700 hover:border-blue-500 hover:bg-gray-800' : 'border-gray-200 hover:border-blue-400 hover:bg-blue-50'}`}
                                >
                                    <CameraIcon size={40} className="text-gray-400 mb-2" />
                                    <span className="text-xs font-bold text-gray-400">Tap to Take Selfie</span>
                                </div>
                            )}

                            <div className="w-full space-y-3">
                                <button
                                    onClick={handleCheckIn}
                                    disabled={loading}
                                    className={`w-full py-4 rounded-xl font-black text-lg shadow-xl flex items-center justify-center gap-2 transition-all active:scale-95
                                    ${loading
                                            ? 'bg-gray-200 text-gray-400 cursor-not-allowed dark:bg-gray-800'
                                            : (imgSrc
                                                ? (isOvertime || currentTime.getHours() >= 17 || hasCompletedRegularToday
                                                    ? 'bg-gradient-to-r from-orange-600 to-red-600 text-white shadow-orange-500/30'
                                                    : 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-blue-500/30'
                                                )
                                                : 'bg-gray-900 text-white'
                                            )
                                        }`}
                                >
                                    {loading
                                        ? 'Verifying...'
                                        : (imgSrc
                                            ? (isOvertime || currentTime.getHours() >= 17 || hasCompletedRegularToday
                                                ? <><MapPin size={20} /> START OVERTIME</>
                                                : <><MapPin size={20} /> START SHIFT</>
                                            )
                                            : (showCamera
                                                ? <><CameraIcon size={20} /> SNAP PHOTO</>
                                                : <><CameraIcon size={20} /> TAKE SELFIE</>
                                            )
                                        )
                                    }
                                </button>
                                {!imgSrc && !loading && (
                                    <p className="text-xs text-center text-gray-400 font-medium">
                                        * Selfie & GPS required to start
                                    </p>
                                )}
                            </div>
                        </>
                    )}
                </div>
            </div>

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
