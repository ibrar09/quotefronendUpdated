import React, { useState } from 'react'
import EmployeList from '../components/EmployeList'
import AddEmploye from './AddEmploye'
import EditEmploye from './EditEmploye'
import EmployeDetails from './EmployeDetails'
import TerminatedEmployees from './TerminatedEmployees'

const MainPage = ({ employees: propEmployees, setEmployees: propSetEmployees }) => {

    const [editingEmployee, setEditingEmployee] = useState(null);
    const [viewingEmployee, setViewingEmployee] = useState(null);

    // Fallback if not passed (though it should be)
    const employees = propEmployees || [];
    const setEmployees = propSetEmployees || (() => { });

    // Initial Mock Data removed - lifted to EmployeHome

    const [terminatedEmployees, setTerminatedEmployees] = useState([]);

    const handleEdit = (employee) => {
        setEditingEmployee(employee);
        setViewingEmployee(null);
    };

    const handleView = (employee) => {
        setViewingEmployee(employee);
        setEditingEmployee(null);
    };

    const handleBack = () => {
        setEditingEmployee(null);
        setViewingEmployee(null);
    };

    // TERMINATION LOGIC
    const handleTerminate = (employeeId) => {
        const empToTerminate = employees.find(e => e.id === employeeId);
        if (empToTerminate) {
            setEmployees(prev => prev.filter(e => e.id !== employeeId));
            setTerminatedEmployees(prev => [...prev, { ...empToTerminate, status: 'Terminated' }]);
            handleBack(); // Return to list after clicking terminate in details
        }
    };

    // RESTORE LOGIC
    const handleRestore = (employee) => {
        setTerminatedEmployees(prev => prev.filter(e => e.id !== employee.id));
        setEmployees(prev => [...prev, { ...employee, status: 'Offline' }]); // Default back to offline
    };

    // Derived state for what to show
    const isDetailView = !!editingEmployee || !!viewingEmployee;

    return (
        <div className='bg-[#F9F7F1] h-full flex flex-col overflow-hidden'>
            <div className='flex-1 overflow-hidden p-2'>

                {editingEmployee ? (
                    <EditEmploye employee={editingEmployee} onBack={handleBack} />
                ) : viewingEmployee ? (
                    <EmployeDetails
                        employee={viewingEmployee}
                        onBack={handleBack}
                        onEdit={handleEdit}
                        onTerminate={handleTerminate} // Pass terminate handler
                    />
                ) : (
                    <EmployeList
                        employees={employees}   // Pass active employees
                        onEdit={handleEdit}
                        onView={handleView}
                    />
                )}
            </div>
        </div>
    )
}

export default MainPage