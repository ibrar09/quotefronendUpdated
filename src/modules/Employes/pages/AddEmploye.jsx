import React, { useState } from 'react'
import { Upload, FileText, CheckCircle, ArrowLeft } from 'lucide-react'
import { useTheme } from '../../../context/ThemeContext'
import { useNavigate } from 'react-router-dom'
import EmployeeService from '../../../services/EmployeeService'

const AddEmploye = ({ onAdd }) => {
    const { darkMode } = useTheme();
    const navigate = useNavigate();
    const [loading, setLoading] = useState(false);

    // Form State
    const [formData, setFormData] = useState({
        first_name: '',
        father_name: '',
        last_name: '',
        email: '',
        nationality: '',
        sponsor_name: '',
        phone_primary: '',
        dob: '',
        position: '',
        skills: '',
        bank_name: '',
        account_number: '',
        iban_number: '',
        iqama_no: '',
        muqeem_no: '',
        iqama_expiry: '',
        passport_no: '',
        passport_expiry: '',
        gosi_no: '',
        address1: '',
        address2: '',
        basic_salary: '',
        housing_allowance: '',
        transport_allowance: '',
        other_allowance: '',
        recurring_deduction: '',
        overtime_rate: '1.5',
        total_salary: '',
        joining_date: ''
    });

    const handleChange = (e) => {
        const { name, value } = e.target;

        // Auto-calculate total salary
        if (['basic_salary', 'housing_allowance', 'transport_allowance', 'other_allowance'].includes(name)) {
            const basic = name === 'basic_salary' ? Number(value) : Number(formData.basic_salary || 0);
            const housing = name === 'housing_allowance' ? Number(value) : Number(formData.housing_allowance || 0);
            const transport = name === 'transport_allowance' ? Number(value) : Number(formData.transport_allowance || 0);
            const other = name === 'other_allowance' ? Number(value) : Number(formData.other_allowance || 0);

            setFormData(prev => ({
                ...prev,
                [name]: value,
                total_salary: (basic + housing + transport + other).toFixed(2)
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [name]: value
            }));
        }
    };

    const handleFileChange = (e) => {
        const { id, files } = e.target;
        if (files && files[0]) {
            setFormData(prev => ({
                ...prev,
                [id]: files[0] // Store File object
            }));
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        const processedData = {
            ...formData,
            skills: formData.skills ? formData.skills.split(',').map(s => s.trim()) : [],
            role: formData.position,
            address: formData.address1 // [FIX] Map address1 to DB address field
        };

        // Note: EmployeeService handles conversion to FormData if files exist

        try {
            await EmployeeService.addEmployee(processedData);
            if (onAdd) await onAdd(); // Reload the list
            navigate('/employes');
        } catch (error) {
            console.error("Failed to add employee", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className={`p-8 rounded-xl shadow-sm border h-full overflow-y-auto scrollbar-thin
            ${darkMode ? 'bg-gray-900 border-gray-800 scrollbar-thumb-gray-700' : 'bg-white border-gray-200 scrollbar-thumb-gray-300'}`}>

            <form className="w-full pb-20" onSubmit={handleSubmit}>
                <div className="flex items-center gap-4 mb-8 border-b pb-4 dark:border-gray-800">
                    <button
                        type="button"
                        onClick={() => navigate(-1)}
                        className={`p-2 rounded-full hover:bg-gray-100 dark:hover:bg-gray-800 transition-colors
                            ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}
                    >
                        <ArrowLeft size={24} />
                    </button>
                    <h2 className={`text-xl font-bold ${darkMode ? 'text-white' : 'text-gray-800'}`}>
                        New Employee Details
                    </h2>
                </div>

                {/* Grid Container */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-x-8 gap-y-2">

                    {/* --- Column 1: Personal --- */}
                    <div className="md:col-span-1">
                        <h3 className="text-sm font-semibold text-blue-600 mb-4 uppercase tracking-wider">Personal</h3>

                        {/* Profile Image Upload */}
                        <div className="mb-6 flex justify-center">
                            <div className="relative group">
                                <div className="w-24 h-24 rounded-full overflow-hidden border-2 border-dashed border-gray-400 flex items-center justify-center bg-gray-50 dark:bg-gray-800">
                                    {formData.avatar ? (
                                        <img src={URL.createObjectURL(formData.avatar)} alt="Preview" className="w-full h-full object-cover" />
                                    ) : (
                                        <Upload className="text-gray-400" />
                                    )}
                                </div>
                                <label htmlFor="avatar" className="absolute inset-0 cursor-pointer flex items-center justify-center opacity-0 group-hover:opacity-100 bg-black/50 rounded-full transition-opacity text-white text-xs font-bold">
                                    Change
                                </label>
                                <input type="file" id="avatar" onChange={handleFileChange} className="hidden" accept="image/*" />
                            </div>
                        </div>

                        <FloatingInput id="first_name" label="First Name" value={formData.first_name} onChange={handleChange} darkMode={darkMode} required />
                        <FloatingInput id="father_name" label="Father Name" value={formData.father_name} onChange={handleChange} darkMode={darkMode} />
                        <FloatingInput id="last_name" label="Family Name" value={formData.last_name} onChange={handleChange} darkMode={darkMode} required />
                        <div className="grid grid-cols-2 gap-4">
                            <FloatingInput id="nationality" label="Nationality" value={formData.nationality} onChange={handleChange} darkMode={darkMode} />
                            <FloatingInput id="sponsor_name" label="Sponsor / Company" value={formData.sponsor_name} onChange={handleChange} darkMode={darkMode} />
                        </div>
                        <FloatingInput id="email" label="Email Address" type="email" value={formData.email} onChange={handleChange} darkMode={darkMode} required />
                        <div className="grid grid-cols-2 gap-4">
                            <FloatingInput id="phone_primary" label="Phone Number" type="tel" value={formData.phone_primary} onChange={handleChange} darkMode={darkMode} />
                            <FloatingInput id="dob" label="Date of Birth" type="date" value={formData.dob} onChange={handleChange} darkMode={darkMode} />
                        </div>
                        <div className="grid grid-cols-2 gap-4">
                            <FloatingInput id="position" label="Position / Role" value={formData.position} onChange={handleChange} darkMode={darkMode} />
                            <FloatingInput id="skills" label="Skills (comma separated)" value={formData.skills} onChange={handleChange} darkMode={darkMode} />
                        </div>
                        <FileUploadCompact id="cv_file" label={formData.cv_file?.name || "CV / Resume"} onChange={handleFileChange} darkMode={darkMode} />

                        <h3 className="text-sm font-semibold text-blue-600 mb-4 uppercase tracking-wider mt-6">Bank Details</h3>
                        <FloatingInput id="bank_name" label="Bank Name" value={formData.bank_name} onChange={handleChange} darkMode={darkMode} />
                        <div className="grid grid-cols-2 gap-4">
                            <FloatingInput id="account_number" label="Account Number" value={formData.account_number} onChange={handleChange} darkMode={darkMode} />
                            <FloatingInput id="iban_number" label="IBAN" value={formData.iban_number} onChange={handleChange} darkMode={darkMode} />
                        </div>
                    </div>

                    {/* --- Column 2: Identity & Docs --- */}
                    <div className="md:col-span-1">
                        <h3 className="text-sm font-semibold text-blue-600 mb-4 uppercase tracking-wider">Identity (Saudi)</h3>
                        <div className="grid grid-cols-2 gap-4">
                            <FloatingInput id="iqama_no" label="Iqama ID" value={formData.iqama_no} onChange={handleChange} darkMode={darkMode} />
                            <FloatingInput id="muqeem_no" label="Muqeem No" value={formData.muqeem_no} onChange={handleChange} darkMode={darkMode} />
                        </div>
                        <FloatingInput id="iqama_expiry" label="Iqama Expiry (Hijri/Gregorian)" type="date" value={formData.iqama_expiry} onChange={handleChange} darkMode={darkMode} />
                        <FileUploadCompact id="iqama_file" label={formData.iqama_file?.name || "Iqama Copy"} onChange={handleFileChange} darkMode={darkMode} />

                        <div className="grid grid-cols-2 gap-4 mt-4">
                            <FloatingInput id="passport_no" label="Passport No" value={formData.passport_no} onChange={handleChange} darkMode={darkMode} />
                            <FloatingInput id="passport_expiry" label="Expiry Date" type="date" value={formData.passport_expiry} onChange={handleChange} darkMode={darkMode} />
                        </div>
                        <FileUploadCompact id="passport_file" label={formData.passport_file?.name || "Passport Copy"} onChange={handleFileChange} darkMode={darkMode} />

                        <div className="mt-4">
                            <FloatingInput id="gosi_no" label="GOSI Number" type="number" value={formData.gosi_no} onChange={handleChange} darkMode={darkMode} />
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <FloatingInput id="license_no" label="Driving License" value={formData.license_no} onChange={handleChange} darkMode={darkMode} />
                            <FileUploadCompact id="license_file" label={formData.license_file?.name || "License Copy"} onChange={handleFileChange} darkMode={darkMode} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FloatingInput id="contract_id" label="Contract Ref" value={formData.contract_id} onChange={handleChange} darkMode={darkMode} />
                            <FileUploadCompact id="contract_file" label={formData.contract_file?.name || "Contract File"} onChange={handleFileChange} darkMode={darkMode} />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <FloatingInput id="cert_name" label="Certificate Name" value={formData.cert_name} onChange={handleChange} darkMode={darkMode} />
                            <FileUploadCompact id="cert_file" label={formData.cert_file?.name || "Certificate File"} onChange={handleFileChange} darkMode={darkMode} />
                        </div>
                    </div>

                    {/* --- Column 3: Address & Salary --- */}
                    <div className="md:col-span-1">
                        <h3 className="text-sm font-semibold text-blue-600 mb-4 uppercase tracking-wider">Details</h3>
                        <FloatingInput id="address1" label="Address Line 1" value={formData.address1} onChange={handleChange} darkMode={darkMode} />
                        <FloatingInput id="address2" label="City / District" value={formData.address2} onChange={handleChange} darkMode={darkMode} />

                        <div className="grid grid-cols-2 gap-4 mt-2">
                            <FloatingInput id="contact1" label="Emergency 1" value={formData.contact1} onChange={handleChange} darkMode={darkMode} />
                            <FloatingInput id="contact2" label="Emergency 2" value={formData.contact2} onChange={handleChange} darkMode={darkMode} />
                        </div>

                        <FloatingInput id="joining_date" label="Joining Date" type="date" value={formData.joining_date} onChange={handleChange} darkMode={darkMode} />

                        <h3 className="text-sm font-semibold text-blue-600 mb-4 uppercase tracking-wider mt-6">Salary Breakdown</h3>
                        <div className="space-y-2">
                            <FloatingInput id="basic_salary" label="Basic Salary" type="number" value={formData.basic_salary} onChange={handleChange} darkMode={darkMode} required />
                            <div className="grid grid-cols-2 gap-4">
                                <FloatingInput id="housing_allowance" label="Housing" type="number" value={formData.housing_allowance} onChange={handleChange} darkMode={darkMode} />
                                <FloatingInput id="transport_allowance" label="Transport" type="number" value={formData.transport_allowance} onChange={handleChange} darkMode={darkMode} />
                            </div>
                            <div className="grid grid-cols-2 gap-4">
                                <FloatingInput id="other_allowance" label="Other / Bonus" type="number" value={formData.other_allowance} onChange={handleChange} darkMode={darkMode} />
                                <FloatingInput id="recurring_deduction" label="Recurring Deduction" type="number" value={formData.recurring_deduction} onChange={handleChange} darkMode={darkMode} />
                            </div>
                            <div className="relative">
                                <FloatingInput id="overtime_rate" label="Overtime Rate" value={formData.overtime_rate} onChange={handleChange} type="number" step="0.1" darkMode={darkMode} />
                                <p className="text-[10px] text-gray-500 -mt-3 ml-1 mb-2">
                                    Enter <strong>1.5</strong> for Multiplier (1.5x) OR <strong>15+</strong> for Fixed Rate (SAR/Hr)
                                </p>
                            </div>

                            <div className="pt-2 border-t dark:border-gray-700">
                                <FloatingInput id="total_salary" label="Total Monthly Salary" type="number" value={formData.total_salary} onChange={handleChange} darkMode={darkMode} />
                            </div>
                        </div>
                    </div>
                </div>

                <div className="mt-8 flex justify-end gap-4">
                    <button type="button" className={`px-6 py-2.5 rounded-lg text-sm font-medium transition-colors
                        ${darkMode ? 'text-gray-300 hover:bg-gray-800' : 'text-gray-600 hover:bg-gray-100'}`}>
                        Reset
                    </button>
                    <button type="submit" disabled={loading} className="text-white bg-blue-600 hover:bg-blue-700 focus:ring-4 focus:ring-blue-300 font-medium rounded-lg text-sm px-8 py-2.5 focus:outline-none shadow-lg shadow-blue-500/30">
                        {loading ? 'Creating...' : 'Create Employee'}
                    </button>
                </div>
            </form >
        </div >
    )
}

// Reusable Components Outside Main
const FloatingInput = ({ label, id, type = "text", required = false, value, onChange, darkMode }) => (
    <div className="relative z-0 w-full mb-5 group">
        <input
            type={type}
            name={id}
            id={id}
            value={value || ''}
            onChange={onChange}
            className={`block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 appearance-none focus:outline-none focus:ring-0 peer
                ${darkMode
                    ? 'text-white border-gray-600 focus:border-blue-500'
                    : 'text-gray-900 border-gray-300 focus:border-blue-600'}`}
            placeholder=" "
            required={required}
        />
        <label
            htmlFor={id}
            className={`absolute text-sm duration-300 transform -translate-y-6 scale-75 top-3 -z-10 origin-[0] peer-focus:start-0 peer-placeholder-shown:scale-100 peer-placeholder-shown:translate-y-0 peer-focus:scale-75 peer-focus:-translate-y-6 
                ${darkMode
                    ? 'text-gray-400 peer-focus:text-blue-500'
                    : 'text-gray-500 peer-focus:text-blue-600'}`}
        >
            {label}
        </label>
    </div>
);

const FileUploadCompact = ({ label, id, onChange, darkMode }) => (
    <div className="relative z-0 w-full mb-5 group flex items-end gap-3">
        <div className="flex-1 relative">
            <input
                type="text"
                disabled
                className={`block py-2.5 px-0 w-full text-sm bg-transparent border-0 border-b-2 appearance-none focus:outline-none peer
                   ${darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-300 text-gray-500'}`}
                placeholder=" "
                value={label}
                readOnly
            />
        </div>
        <label htmlFor={id} className="cursor-pointer text-gray-400 hover:text-blue-600 transition-colors pb-2">
            <Upload size={20} />
            <input type="file" id={id} onChange={onChange} className="hidden" />
        </label>
    </div>
);

export default AddEmploye