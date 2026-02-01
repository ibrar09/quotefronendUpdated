import axios from 'axios';
import API_BASE_URL from '../config/api';

const EmployeeService = {
    getAllEmployees: async () => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/employees`);
            return response.data;
        } catch (error) {
            console.error("Fetch Employees Error:", error);
            return { success: false, message: error.message };
        }
    },

    getEmployeeById: async (id) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/employees/${id}`);
            return response.data;
        } catch (error) {
            console.error("Fetch Employee Error:", error);
            return { success: false, message: error.message };
        }
    },

    // FOR FIELD OPERATIONS
    getTechnicians: async () => {
        try {
            // Return all employees so they can be assigned to jobs
            // Previously filtered by department/position, but now showing all
            const response = await axios.get(`${API_BASE_URL}/api/employees`);
            if (response.data.success) {
                // Transform employee data to match expected technician format
                const technicians = response.data.data.map(e => ({
                    ...e,
                    // Ensure these fields exist for the assignment UI
                    name: e.name || `${e.first_name} ${e.last_name}`,
                    avatar: e.first_name?.charAt(0) + e.last_name?.charAt(0) || 'UN',
                    status: e.status || 'Active',
                    activeJobs: e.activeJobs || 0,
                    region: e.region || 'N/A',
                    skills: e.skills || []
                }));
                return { success: true, data: technicians };
            }
            return response.data;
        } catch (error) {
            console.error("Fetch Technicians Error:", error);
            return { success: false, message: error.message };
        }
    },

    addEmployee: async (employeeData) => {
        try {
            let payload = employeeData;
            let headers = {};

            // If FormData is passed, axios handles headers automatically
            // If plain object and has image file, convert to FormData
            const hasFile = employeeData instanceof FormData || (employeeData.avatar instanceof File);

            if (hasFile && !(employeeData instanceof FormData)) {
                // Convert to FormData logic if user passed object with File
                const formData = new FormData();
                Object.keys(employeeData).forEach(key => {
                    formData.append(key, employeeData[key]);
                });
                payload = formData;
                headers = { 'Content-Type': 'multipart/form-data' };
            }

            const response = await axios.post(`${API_BASE_URL}/api/employees`, payload, { headers });
            return response.data;
        } catch (error) {
            console.error("Add Employee Error:", error);
            return { success: false, message: error.message };
        }
    },

    updateEmployee: async (id, updates) => {
        try {
            let payload = updates;
            let headers = {};

            // Check if updates is FormData
            if (updates instanceof FormData) {
                headers = { 'Content-Type': 'multipart/form-data' };
            }

            const response = await axios.put(`${API_BASE_URL}/api/employees/${id}`, payload, { headers });
            return response.data;
        } catch (error) {
            console.error("Update Employee Error:", error);
            return { success: false, message: error.message };
        }
    }
};

export default EmployeeService;
