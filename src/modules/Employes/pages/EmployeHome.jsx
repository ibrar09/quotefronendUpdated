import { useState, useEffect } from 'react';
import { Routes, Route } from 'react-router-dom';
import Sidebar from '../components/Sidebar';
import TopBar from '../components/TopBar';
import MainPage from './MainPage';
import EmployeeDashboard from './EmployeeDashboard';
import EmployeeDocumentRepository from './EmployeeDocumentRepository';
import EmployeeService from '../../../services/EmployeeService'; // Shared Service

// Sub-Pages
import AddEmploye from './AddEmploye';
import Payroll from './Payroll';
import Attendance from './Attendance';
import AssetInventory from './AssetInventory';
import TerminatedEmployees from './TerminatedEmployees';
import RoleManagement from './RoleManagement';
import FieldOpsManager from './FieldOpsManager';
import Leaves from '../../HumanResources/pages/Leaves';
import Expenses from '../../HumanResources/pages/Expenses';
import CompanyDocuments from '../../HumanResources/pages/CompanyDocuments';

const EmployeHome = () => {
    // Centralized Employee State
    const [employees, setEmployees] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        loadEmployees();
    }, []);

    const loadEmployees = async () => {
        const response = await EmployeeService.getAllEmployees();
        if (response.success) {
            setEmployees(response.data);
        }
        setLoading(false);
    };

    return (
        <div className='flex h-screen bg-[#F9F7F1]'>
            {/* Sidebar */}
            <Sidebar />

            {/* Main Content */}
            <div className='flex-1 flex flex-col h-screen overflow-hidden'>
                {/* TopBar */}
                <TopBar />

                {/* Main area - Ensure this area does NOT scroll itself, but confines children */}
                <main className='flex-1 overflow-hidden p-4 pb-0'>
                    <Routes>
                        <Route path="dashboard" element={<EmployeeDashboard />} />
                        <Route path="documents" element={<EmployeeDocumentRepository employees={employees} />} />

                        {/* Sub Modules */}
                        <Route path="add" element={<AddEmploye />} />
                        <Route path="payroll" element={<Payroll employees={employees} />} />
                        <Route path="attendance" element={<Attendance employees={employees} />} />
                        <Route path="assets" element={<AssetInventory employees={employees} />} />
                        <Route path="terminated" element={<TerminatedEmployees />} />
                        <Route path="settings" element={<RoleManagement />} />
                        <Route path="field-ops" element={<FieldOpsManager />} />
                        <Route path="leaves" element={<Leaves />} />
                        <Route path="expenses" element={<Expenses />} />
                        <Route path="company-documents" element={<CompanyDocuments />} />

                        <Route path="/" element={<MainPage employees={employees} setEmployees={setEmployees} />} />
                        <Route path="*" element={<MainPage employees={employees} setEmployees={setEmployees} />} />
                    </Routes>
                </main>
            </div>
        </div>
    )
}

export default EmployeHome
