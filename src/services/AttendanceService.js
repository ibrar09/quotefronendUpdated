import axios from 'axios';
import API_BASE_URL from '../config/api';

const AttendanceService = {
    // 1. Get Current Status (In/Out)
    getStatus: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/attendance/status`);
            return response.data;
        } catch (error) {
            console.error("Attendance Status Error:", error);
            return { success: false, status: 'OUT' }; // Fallback
        }
    },

    // 2. Start Shift (Clock In)
    clockIn: async (photoData, location) => {
        try {
            const payload = {
                photo: photoData,
                lat: location?.coords?.latitude,
                lng: location?.coords?.longitude
            };
            const response = await axios.post(`${API_BASE_URL}/api/attendance/clock-in`, payload);
            return response.data;
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    },

    // 3. End Shift (Clock Out)
    clockOut: async (location) => {
        try {
            const payload = {
                lat: location?.coords?.latitude,
                lng: location?.coords?.longitude
            };
            const response = await axios.post(`${API_BASE_URL}/api/attendance/clock-out`, payload);
            return response.data;
        } catch (error) {
            return { success: false, message: error.response?.data?.message || error.message };
        }
    }
};

export default AttendanceService;
