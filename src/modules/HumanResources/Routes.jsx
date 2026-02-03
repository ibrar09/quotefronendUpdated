import React, { lazy } from 'react';
import { Routes, Route } from 'react-router-dom';

const Attendance = lazy(() => import('./pages/Attendance'));
const Services = lazy(() => import('./pages/Services'));
const Leaves = lazy(() => import('./pages/Leaves'));
const Expenses = lazy(() => import('./pages/Expenses'));

const HRRoutes = () => {
    return (
        <Routes>
            <Route path="attendance" element={<Attendance />} />
            <Route path="services" element={<Services />} />
            <Route path="leaves" element={<Leaves />} />
            <Route path="expenses" element={<Expenses />} />
        </Routes>
    );
};

export default HRRoutes;
