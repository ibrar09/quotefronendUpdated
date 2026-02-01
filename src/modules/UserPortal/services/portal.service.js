import axios from 'axios';
import API_BASE_URL from '../../../config/api';

const getAuthHeader = () => {
    const token = localStorage.getItem('token');
    return { headers: { Authorization: `Bearer ${token}` } };
};

export const getDashboardStats = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/portal/dashboard`, getAuthHeader());
    return response.data;
};

export const getAttendanceHistory = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/portal/attendance`, getAuthHeader());
    return response.data;
};

export const getCurrentAttendance = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/portal/attendance/current`, getAuthHeader());
    return response.data;
};

export const markAttendance = async (data) => {
    const response = await axios.post(`${API_BASE_URL}/api/portal/attendance`, data, getAuthHeader());
    return response.data;
};

export const adminMarkAttendance = async (data) => {
    const response = await axios.post(`${API_BASE_URL}/api/portal/attendance/admin`, data, getAuthHeader());
    return response.data;
};

export const updateLiveLocation = async (data) => {
    const response = await axios.post(`${API_BASE_URL}/api/portal/location`, data, getAuthHeader());
    return response.data;
};

export const getMonthlyAttendance = async (year, month) => {
    const response = await axios.get(`${API_BASE_URL}/api/portal/attendance/monthly?year=${year}&month=${month}`, getAuthHeader());
    return response.data;
};

export const getStaffMonthlyAttendance = async (year, month, employeeId = 'all') => {
    const response = await axios.get(`${API_BASE_URL}/api/portal/attendance/staff?year=${year}&month=${month}&employee_id=${employeeId}`, getAuthHeader());
    return response.data;
};

export const getStaffLiveAttendance = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/portal/attendance/live`, getAuthHeader());
    return response.data;
};

export const getMyAssets = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/portal/assets`, getAuthHeader());
    return response.data;
};

export const getMyDocuments = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/portal/documents`, getAuthHeader());
    return response.data;
};

export const getPayrollDetails = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/portal/payroll`, getAuthHeader());
    return response.data;
};

export const getLeaves = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/portal/leaves`, getAuthHeader());
    return response.data;
};

export const requestLeave = async (data) => {
    const response = await axios.post(`${API_BASE_URL}/api/portal/leaves`, data, getAuthHeader());
    return response.data;
};

export const getMessages = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/portal/messages`, getAuthHeader());
    return response.data;
};

export const sendMessage = async (data) => {
    const response = await axios.post(`${API_BASE_URL}/api/portal/messages`, data, getAuthHeader());
    return response.data;
};

export const getExpenses = async () => {
    const response = await axios.get(`${API_BASE_URL}/api/portal/expenses`, getAuthHeader());
    return response.data;
};

export const requestExpense = async (data) => {
    const response = await axios.post(`${API_BASE_URL}/api/portal/expenses`, data, getAuthHeader());
    return response.data;
};
