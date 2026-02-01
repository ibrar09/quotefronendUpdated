import axios from 'axios';
import API_BASE_URL from '../config/api';
import EmployeeService from './EmployeeService';

const FieldOperationsService = {
    // ========== QUOTATION INTEGRATION ==========

    getPendingQuotations: async (filters = {}) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/quotations`, {
                params: {
                    quote_status: filters.status && filters.status !== 'ALL'
                        ? filters.status
                        : 'READY_TO_SEND,DRAFT,SENT' // Default to these 3
                }
            });

            let results = response.data.data || [];
            if (filters.search) {
                const s = filters.search.toLowerCase();
                results = results.filter(q =>
                    q.quote_no.toLowerCase().includes(s) ||
                    q.brand?.toLowerCase().includes(s)
                );
            }
            return { data: results };
        } catch (error) {
            console.error("Fetch Pending Quotes Error:", error);
            return { data: [] };
        }
    },

    assignQuotationToTech: async (quotationId, techId, notes = '', quoteNo) => {
        try {
            const payload = {
                job_id: quotationId,
                employee_id: techId,
                technician_notes: notes,
                scheduled_date: new Date()
            };

            console.log('📝 [FRONTEND] Assigning job:', payload);
            const response = await axios.post(`${API_BASE_URL}/api/field-ops/assign`, payload);
            console.log('✅ [FRONTEND] Assignment successful:', response.data);
            return response.data;

        } catch (error) {
            console.error("❌ [FRONTEND] Assignment failed:", error);
            return {
                success: false,
                message: error.response?.data?.message || "Internal Assignment Error"
            };
        }
    },

    // ========== JOB MANAGEMENT ==========

    getAssignedJobs: async (filters = {}) => {
        try {
            console.log('🔍 [FRONTEND] Fetching assigned jobs...');
            const response = await axios.get(`${API_BASE_URL}/api/field-ops`);
            let jobs = response.data.data;

            console.log(`✅ [FRONTEND] Received ${jobs?.length || 0} jobs:`, jobs);

            if (filters.status && filters.status !== 'ALL') {
                jobs = jobs.filter(j => j.status === filters.status);
            }

            return { success: true, data: jobs };

        } catch (error) {
            console.error("❌ [FRONTEND] Fetch Assignments Error:", error);
            return { success: false, data: [] };
        }
    },

    getJobDetails: async (assignmentId) => {
        try {
            console.log('🔍 [FRONTEND] Fetching job details for:', assignmentId);
            const response = await axios.get(`${API_BASE_URL}/api/field-ops/${assignmentId}`);
            console.log('✅ [FRONTEND] Job details received:', response.data);
            // Backend returns { success: true, data: jobDetails }
            // So we return jobDetails directly, not wrapped again
            return response.data.data; // Return the actual job details object
        } catch (error) {
            console.error("❌ [FRONTEND] Fetch Job Details Error:", error);
            return null;
        }
    },

    uploadJobImage: async (assignmentId, imageData) => {
        try {
            console.log('📸 [FRONTEND] Uploading image for assignment:', assignmentId);
            const response = await axios.post(`${API_BASE_URL}/api/field-ops/${assignmentId}/upload-image`, imageData);
            console.log('✅ [FRONTEND] Image uploaded successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error("❌ [FRONTEND] Upload Image Error:", error);
            return { success: false, message: error.message };
        }
    },

    // New Media Upload (Multipart) - Matches JobCompletionModal
    uploadJobMedia: async (jobId, formData) => {
        try {
            console.log('📸 [FRONTEND] Uploading media for job:', jobId);
            const response = await axios.post(`${API_BASE_URL}/api/jobs/${jobId}/upload-media`, formData, {
                headers: { 'Content-Type': 'multipart/form-data' }
            });
            console.log('✅ [FRONTEND] Media uploaded successfully:', response.data);
            return response.data;
        } catch (error) {
            console.error("❌ [FRONTEND] Upload Media Error:", error);
            return { success: false, message: error.response?.data?.message || error.message };
        }
    },

    updateJobProgress: async (jobId, progressData) => {
        try {
            const response = await axios.put(`${API_BASE_URL}/api/field-ops/${jobId}`, progressData);
            return response.data;
        } catch (error) {
            console.error("Update Progress Error:", error);
            return { success: false, message: error.message };
        }
    },

    completeJob: async (jobId, completionData) => {
        try {
            const payload = {
                status: 'COMPLETED',
                technician_notes: completionData.notes
            };
            const response = await axios.put(`${API_BASE_URL}/api/field-ops/${jobId}`, payload);
            return response.data;
        } catch (error) {
            return { success: false, message: error.message };
        }
    },

    // Daily Logs
    getJobLogs: async (assignmentId) => {
        try {
            const response = await axios.get(`${API_BASE_URL}/api/field-ops/${assignmentId}/logs`);
            return response.data;
        } catch (error) {
            console.error("Fetch Logs Error:", error);
            return { success: false, data: [], message: error.message };
        }
    },

    addJobLog: async (assignmentId, logData) => {
        try {
            const response = await axios.post(`${API_BASE_URL}/api/field-ops/${assignmentId}/logs`, logData);
            return response.data;
        } catch (error) {
            console.error("Add Log Error:", error);
            return { success: false, message: error.message };
        }
    },

    // ========== TECHNICIAN MANAGEMENT ==========

    getTechnicians: async (filters = {}) => {
        try {
            const response = await EmployeeService.getTechnicians();
            if (response.success) {
                let results = response.data;
                if (filters.status && filters.status !== 'ALL') {
                    results = results.filter(t => t.status === filters.status);
                }
                return { success: true, data: results };
            }
            return { success: false, data: [] };
        } catch (error) {
            console.error("Failed to fetch technicians", error);
            return { success: false, data: [] };
        }
    },

    getTechnicianDetails: async (techId) => {
        try {
            const empRes = await EmployeeService.getEmployeeById(techId);
            if (!empRes.success) return { success: false, message: 'Tech not found' };

            const assignmentsRes = await axios.get(`${API_BASE_URL}/api/field-ops`);
            const allJobs = assignmentsRes.data.data;
            const techJobs = allJobs.filter(j => j.employee_id === techId);

            return {
                success: true,
                data: {
                    ...empRes.data,
                    currentJobs: techJobs.filter(j => j.status !== 'COMPLETED'),
                    completedJobs: techJobs.filter(j => j.status === 'COMPLETED')
                }
            };

        } catch (error) {
            return { success: false, message: 'Error fetching details' };
        }
    },

    getStats: async () => {
        try {
            const [quotesRes, jobsRes, techsRes] = await Promise.all([
                axios.get(`${API_BASE_URL}/api/quotations?quote_status=APPROVED`),
                axios.get(`${API_BASE_URL}/api/field-ops`),
                EmployeeService.getTechnicians()
            ]);

            const quotes = quotesRes.data.data || [];
            const jobs = jobsRes.data.data || [];
            const techs = techsRes.data || [];

            const stats = {
                pendingAssignment: quotes.length,
                activeJobs: jobs.filter(j => j.status === 'IN_PROGRESS').length,
                assignedJobs: jobs.filter(j => j.status === 'ASSIGNED').length,
                completedJobs: jobs.filter(j => j.status === 'COMPLETED').length,
                techsActive: techs.filter(t => t.status === 'Active').length,
                techsIdle: techs.filter(t => t.status !== 'Active').length
            };
            return { data: stats };

        } catch (error) {
            return { data: {} };
        }
    }
};

export default FieldOperationsService;
