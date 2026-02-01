import React, { useState, useEffect } from 'react';
import PayrollList from './PayrollList';
import CreatePayroll from './CreatePayroll';
import BatchPayroll from './BatchPayroll';
import SalarySlip from './SalarySlip';
import axios from 'axios';
import API_BASE_URL from '../../../../config/api';
import toast from 'react-hot-toast';

const Payroll = ({ employees = [] }) => {
    const [selectedMonth, setSelectedMonth] = useState(new Date().toISOString().slice(0, 7)); // YYYY-MM
    const [payrollData, setPayrollData] = useState([]);
    const [loading, setLoading] = useState(false);

    // Fetch Payrolls from API
    const fetchPayrolls = async () => {
        try {
            const [year, month] = selectedMonth.split('-');
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/payroll`, {
                params: { month: parseInt(month), year: parseInt(year) },
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setPayrollData(res.data.data);
            }
        } catch (error) {
            console.error("Error fetching payrolls:", error);
            // toast.error("Failed to load payroll data");
        }
    };

    useEffect(() => {
        fetchPayrolls();
    }, [selectedMonth]);

    // Generate Payroll (Bulk)
    const handleGenerate = async () => {
        const [year, month] = selectedMonth.split('-');
        const toastId = toast.loading("Generating Payroll...");
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/api/payroll/generate`,
                { month: parseInt(month), year: parseInt(year) },
                { headers: { Authorization: `Bearer ${token}` } }
            );
            if (res.data.success) {
                setPayrollData(res.data.data);
                toast.success("Payroll Generated Successfully", { id: toastId });
            }
        } catch (error) {
            console.error(error);
            toast.error("Generation Failed", { id: toastId });
        }
    };

    const processPayment = async (paymentRecord) => {
        // "Confirm Payment" usually means Mark as Paid or Update & Pay?
        // In this UI context, it seems to be "Confirm/Save" the single record.
        // We will call Update + Mark Paid? Or just Update?
        // Let's assume Update + Mark Paid if status is 'Paid'.

        try {
            const token = localStorage.getItem('token');

            // Check if ID is a temp timestamp (Length comparison or type check)
            // UUIDs are 36 chars. Timestamps are usually 13 digits (numbers).
            const isNew = !String(paymentRecord.id).includes('-');

            if (isNew) {
                // CREATE (POST)
                console.log("Creating New Payroll Record:", paymentRecord);
                await axios.post(`${API_BASE_URL}/api/payroll`, paymentRecord, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                // UPDATE (PUT)
                await axios.put(`${API_BASE_URL}/api/payroll/${paymentRecord.id}`, paymentRecord, {
                    headers: { Authorization: `Bearer ${token}` }
                });

                // If updating and status is PAID, ensure it's marked
                if (paymentRecord.status === 'Paid' || paymentRecord.status === 'PAID') {
                    await axios.put(`${API_BASE_URL}/api/payroll/${paymentRecord.id}/pay`, {}, {
                        headers: { Authorization: `Bearer ${token}` }
                    });
                }
            }

            toast.success("Payment Processed");
            fetchPayrolls();
        } catch (error) {
            console.error(error);
            toast.error("Failed to process payment");
        }
    };

    const updatePayment = async (updatedRecord) => {
        // Same logic as process, simplified
        processPayment(updatedRecord);
    };

    const processBulkPayment = async (records) => {
        const toastId = toast.loading(`Processing ${records.length} payments...`);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.post(`${API_BASE_URL}/api/payroll/bulk`,
                { records: records },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            if (res.data.success) {
                toast.success(res.data.message, { id: toastId });
                fetchPayrolls(); // Refresh list
                setViewMode('list');
                setSelectedForBatch([]);
                setSelectedIds(new Set());
            }
        } catch (error) {
            console.error("Bulk Process Error:", error);
            toast.error("Bulk Processing Failed", { id: toastId });
        }
    };

    const [viewMode, setViewMode] = useState('list'); // 'list' | 'create' | 'edit' | 'batch' | 'slip'
    const [selectedEmployee, setSelectedEmployee] = useState(null);
    const [selectedRecord, setSelectedRecord] = useState(null); // For editing
    const [selectedForBatch, setSelectedForBatch] = useState([]);
    const [selectedIds, setSelectedIds] = useState(new Set());

    const toggleSelection = (id) => {
        const newSet = new Set(selectedIds);
        if (newSet.has(id)) {
            newSet.delete(id);
        } else {
            newSet.add(id);
        }
        setSelectedIds(newSet);
    };

    const toggleSelectAll = (currentFilteredEmployees) => {
        if (selectedIds.size === currentFilteredEmployees.length && currentFilteredEmployees.length > 0) {
            setSelectedIds(new Set());
        } else {
            const allIds = currentFilteredEmployees.map(e => e.id);
            setSelectedIds(new Set(allIds));
        }
    };

    const handleBatchProcessStart = (selectedEmployees) => {
        setSelectedForBatch(selectedEmployees);
        setViewMode('batch');
    };

    // Render Logic
    if (viewMode === 'create' || viewMode === 'edit') {
        return (
            <CreatePayroll
                employee={selectedEmployee}
                onBack={() => { setViewMode('list'); setSelectedEmployee(null); setSelectedRecord(null); }}
                processPayment={processPayment}
                updatePayment={updatePayment}
                selectedMonth={selectedMonth}
                initialData={selectedRecord}
            />
        );
    }

    if (viewMode === 'batch') {
        return (
            <BatchPayroll
                employeesToProcess={selectedForBatch}
                onBack={() => { setViewMode('list'); setSelectedForBatch([]); setSelectedIds(new Set()); }}
                processBulkPayment={processBulkPayment}
                selectedMonth={selectedMonth}
            />
        );
    }

    return (
        <>
            <PayrollList
                employees={employees} // We might want to use payrollData directly, but keeping structure
                payrollHistory={payrollData} // Passing REAL DB data as history
                selectedMonth={selectedMonth}
                setSelectedMonth={setSelectedMonth}
                onBatchStart={handleBatchProcessStart}
                onGenerate={handleGenerate} // Pass Generate Handler
                onSingleProcess={(emp) => { setSelectedEmployee(emp); setSelectedRecord(emp.paymentRecord); setViewMode('create'); }}
                onEditPayment={(emp) => { setSelectedEmployee(emp); setSelectedRecord(emp.paymentRecord); setViewMode('edit'); }}
                onMarkPaid={async (emp) => {
                    const toastId = toast.loading('Marking as Paid...');
                    try {
                        const token = localStorage.getItem('token');
                        await axios.put(`${API_BASE_URL}/api/payroll/${emp.paymentRecord.id}/pay`, {}, {
                            headers: { Authorization: `Bearer ${token}` }
                        });
                        toast.success('Marked as Paid', { id: toastId });
                        fetchPayrolls();
                    } catch (error) {
                        toast.error('Failed to mark as paid', { id: toastId });
                    }
                }}
                onViewSlip={(emp) => { setSelectedEmployee(emp); setViewMode('slip'); }}
                selectedIds={selectedIds}
                toggleSelection={toggleSelection}
                toggleSelectAll={toggleSelectAll}
            />

            {viewMode === 'slip' && selectedEmployee && (
                <SalarySlip
                    employee={selectedEmployee}
                    onClose={() => { setViewMode('list'); setSelectedEmployee(null); }}
                    getPaymentRecord={(id) => payrollData.find(p => p.employee_id === id)}
                    selectedMonth={selectedMonth}
                />
            )}
        </>
    );
};

export default Payroll;
