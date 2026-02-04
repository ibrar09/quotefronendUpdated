import { useState, useEffect } from 'react';
import { getStaffLiveAttendance, getStaffMonthlyAttendance, adminMarkAttendance } from '../../UserPortal/services/portal.service';
import toast from 'react-hot-toast';

export const useAttendance = (viewMode, selectedMonth, selectedYear) => {
    const [isLoading, setIsLoading] = useState(true);
    const [teamAttendance, setTeamAttendance] = useState([]);
    const [historyData, setHistoryData] = useState([]);

    useEffect(() => {
        if (viewMode === 'live') {
            fetchLiveData();
            const interval = setInterval(fetchLiveData, 30000);
            return () => clearInterval(interval);
        } else {
            fetchHistoryData();
        }
    }, [viewMode, selectedMonth, selectedYear]);

    const fetchHistoryData = async () => {
        setIsLoading(true);
        try {
            const res = await getStaffMonthlyAttendance(selectedYear, selectedMonth);
            if (res.success) {
                const grouped = {};
                res.data.forEach(r => {
                    const empId = r.Employee.id;
                    if (!grouped[empId]) {
                        grouped[empId] = {
                            id: empId,
                            name: `${r.Employee.first_name} ${r.Employee.last_name}`,
                            avatar: r.Employee.avatar_url,
                            role: r.Employee.position,
                            regMinutes: 0,
                            otMinutes: 0,
                            totalMinutes: 0,
                            status: 'PRESENT',
                            location: '-',
                            logs: []
                        };
                    }

                    const dur = r.duration_minutes || (r.clock_in ? Math.round(((r.clock_out ? new Date(r.clock_out) : new Date()) - new Date(r.clock_in)) / 60000) : 0);
                    if (r.tag === 'OVERTIME') grouped[empId].otMinutes += dur;
                    else grouped[empId].regMinutes += dur;

                    grouped[empId].totalMinutes = grouped[empId].regMinutes + grouped[empId].otMinutes;

                    const lat = r.clock_in_lat || r.clock_out_lat;
                    const lng = r.clock_in_lng || r.clock_out_lng;
                    const locationStr = lat && lng ? `${parseFloat(lat).toFixed(4)}, ${parseFloat(lng).toFixed(4)}` : '-';

                    grouped[empId].location = locationStr; // Update main row location

                    grouped[empId].logs.push({
                        date: r.date,
                        type: r.tag === 'OVERTIME' ? 'overtime' : 'regular',
                        action: `${r.tag === 'OVERTIME' ? 'Overtime' : 'Regular'}: ${Math.floor(dur / 60)}h ${dur % 60}m`,
                        time: r.clock_in ? new Date(r.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
                        location: locationStr
                    });
                });
                setHistoryData(Object.values(grouped).sort((a, b) => b.totalMinutes - a.totalMinutes));
            }
        } catch (e) {
            console.error("Error fetching history", e);
        } finally {
            setIsLoading(false);
        }
    };

    const fetchLiveData = async () => {
        try {
            const res = await getStaffLiveAttendance();
            if (res.success) {
                const mappedData = res.data.map(emp => {
                    const attendances = emp.Attendances || [];
                    const todayRecord = attendances.length > 0 ? attendances[attendances.length - 1] : null;

                    let regMin = 0;
                    let otMin = 0;
                    attendances.forEach(r => {
                        const dur = r.duration_minutes || (r.clock_in ? Math.round(((r.clock_out ? new Date(r.clock_out) : new Date()) - new Date(r.clock_in)) / 60000) : 0);
                        if (r.tag === 'OVERTIME') otMin += dur;
                        else regMin += dur;
                    });

                    const lat = emp.last_lat || todayRecord?.clock_in_lat;
                    const lng = emp.last_lng || todayRecord?.clock_in_lng;

                    let locationStr = '-';
                    if (lat && lng) {
                        const isNearHQ = Math.abs(lat - 24.7136) < 0.01 && Math.abs(lng - 46.6753) < 0.01;
                        locationStr = isNearHQ ? '📍 Main HQ (Riyadh)' : `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
                    }

                    const allLogs = [];
                    attendances.forEach(r => {
                        if (r.clock_in) {
                            allLogs.push({
                                type: 'check-in',
                                action: r.tag === 'OVERTIME' ? 'Overtime Started' : 'Shift Started',
                                time: new Date(r.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                location: 'Portal'
                            });
                        }
                        if (r.clock_out) {
                            allLogs.push({
                                type: 'check-out',
                                action: r.tag === 'OVERTIME' ? 'Overtime Ended' : 'Shift Ended',
                                time: new Date(r.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
                                location: 'Portal'
                            });
                        }
                    });

                    allLogs.sort((a, b) => new Date('1970/01/01 ' + a.time) - new Date('1970/01/01 ' + b.time));

                    const latestCheckout = attendances
                        .filter(a => a.clock_out)
                        .sort((a, b) => new Date(b.clock_out) - new Date(a.clock_out))[0];

                    return {
                        id: emp.id,
                        name: `${emp.first_name} ${emp.last_name}`,
                        avatar: emp.avatar_url,
                        role: emp.position || 'Staff',
                        timeIn: todayRecord ? new Date(todayRecord.clock_in).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
                        timeOut: latestCheckout ? new Date(latestCheckout.clock_out).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : '-',
                        status: todayRecord ? todayRecord.status : 'ABSENT',
                        tag: todayRecord?.tag || 'REGULAR',
                        isOvertime: otMin > 0,
                        regMinutes: regMin,
                        otMinutes: otMin,
                        totalMinutes: regMin + otMin,
                        onlineStatus: emp.status,
                        location: locationStr,
                        lat: lat,
                        lng: lng,
                        photo: todayRecord?.clock_in_photo,
                        logs: allLogs
                    };
                });
                setTeamAttendance(mappedData);
            }
        } catch (error) {
            console.error("Error fetching live attendance:", error);
        } finally {
            setIsLoading(false);
        }
    };

    const submitManualEntry = async (entryData) => {
        try {
            const res = await adminMarkAttendance(entryData);
            if (res.success) {
                toast.success("Attendance record added successfully");
                if (viewMode === 'live') fetchLiveData();
                else fetchHistoryData();
                return true;
            } else {
                toast.error(res.message || "Failed to add record");
                return false;
            }
        } catch (error) {
            console.error("Manual Submit Error:", error);
            toast.error("An error occurred");
            return false;
        }
    };

    return {
        isLoading,
        teamAttendance,
        historyData,
        fetchLiveData,
        fetchHistoryData,
        submitManualEntry
    };
};
