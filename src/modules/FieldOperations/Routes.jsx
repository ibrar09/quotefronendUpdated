import React from 'react';
import { Routes, Route } from 'react-router-dom';
import FieldDashboard from './pages/FieldDashboard';
import WorkAssignmentPage from './pages/WorkAssignment';
import CommunicationHub from './pages/CommunicationHub';
import JobDetails from './pages/JobDetails';
import FieldOpsLayout from './layouts/FieldOpsLayout';
// Field Ops Routes

import TechnicianList from './pages/TechnicianList';
import TechnicianProfile from './pages/TechnicianProfile';
import FieldSchedule from './pages/FieldSchedule';
import FieldSettings from './pages/FieldSettings';

const FieldOperationsRoutes = () => {
    return (
        <Routes>
            <Route element={<FieldOpsLayout />}>
                <Route path="/" element={<FieldDashboard />} />
                <Route path="/assign" element={<WorkAssignmentPage />} />
                <Route path="/jobs/:id" element={<JobDetails />} />
                <Route path="/technicians" element={<TechnicianList />} />
                <Route path="/technicians/:id" element={<TechnicianProfile />} />
                <Route path="/schedule" element={<FieldSchedule />} />
                <Route path="/settings" element={<FieldSettings />} />
                <Route path="/messages" element={<CommunicationHub />} />
                <Route path="*" element={<FieldDashboard />} />
            </Route>
        </Routes>
    );
};

export default FieldOperationsRoutes;
