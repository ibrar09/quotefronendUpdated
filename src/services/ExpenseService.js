import axios from 'axios';
import API_BASE_URL from '../config/api';

const ExpenseService = {
    // HR Management Endpoints
    getAllExpenses: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get(`${API_BASE_URL}/api/hr-mgmt/expenses`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Fetch Expenses Error:", error);
            return { success: false, message: error.response?.data?.message || error.message };
        }
    },

    createExpense: async (formData) => {
        try {
            const token = localStorage.getItem('token');
            // Check if formData is already a FormData object, otherwise it's JSON
            const isMultipart = formData instanceof FormData;
            const response = await axios.post(`${API_BASE_URL}/api/hr-mgmt/expenses`, formData, {
                headers: {
                    Authorization: `Bearer ${token}`,
                    'Content-Type': isMultipart ? 'multipart/form-data' : 'application/json'
                }
            });
            return response.data;
        } catch (error) {
            console.error("Create Expense Error:", error);
            return { success: false, message: error.response?.data?.message || error.message };
        }
    },

    updateExpenseStatus: async (id, statusData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`${API_BASE_URL}/api/hr-mgmt/expenses/${id}`, statusData, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Update Expense Error:", error);
            return { success: false, message: error.response?.data?.message || error.message };
        }
    },

    deleteExpense: async (id) => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.delete(`${API_BASE_URL}/api/hr-mgmt/expenses/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            return response.data;
        } catch (error) {
            console.error("Delete Expense Error:", error);
            return { success: false, message: error.response?.data?.message || error.message };
        }
    }
};

export default ExpenseService;
