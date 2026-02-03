import React, { useState } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { X, Printer, Download, FileText, CheckCircle, Loader2, Eye, Shield } from 'lucide-react';
import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';
import toast from 'react-hot-toast';
import logoSrc from '../../../assets/Maaj-Logo 04.png';
import API_BASE_URL from '../../../config/api';

const IDCollectionModal = ({ selectedEmployees, onClose }) => {
    const { darkMode } = useTheme();
    const [isDownloading, setIsDownloading] = useState(false);
    const [permissionHeading, setPermissionHeading] = useState('SITE ACCESS PERMISSION IDs');
    const [includeIqama, setIncludeIqama] = useState(true);
    const [includePassport, setIncludePassport] = useState(false);

    const handleDownload = async () => {
        const element = document.getElementById('id-collection-area');
        if (!element) return;

        // Prevent download if nothing selected
        if (!includeIqama && !includePassport) {
            toast.error("Please select at least one document type.");
            return;
        }

        setIsDownloading(true);
        try {
            const canvas = await html2canvas(element, {
                scale: 2,
                useCORS: true,
                backgroundColor: '#ffffff',
            });

            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = (canvas.height * pdfWidth) / canvas.width;

            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);

            // Dynamic Filename Logic
            let filename = 'Work_Permission_IDs';
            if (includeIqama && !includePassport) filename += '_Iqama_Only';
            else if (!includeIqama && includePassport) filename += '_Passport_Only';
            else filename += '_Combined';

            filename += `_${new Date().getTime()}.pdf`;

            pdf.save(filename);
            toast.success("PDF Generated successfully!");
        } catch (error) {
            console.error('PDF Generation failed:', error);
            toast.error("Failed to generate PDF.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePrint = () => {
        window.print();
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md">
            <div className={`relative w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl flex overflow-hidden border
                ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>

                {/* Sidebar Controls */}
                <div className={`w-80 border-r p-6 flex flex-col gap-6 ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                    <div>
                        <h2 className="text-xl font-black mb-1">ID Compiler</h2>
                        <p className="text-xs text-gray-500 font-medium">Work Permission Engine</p>
                    </div>

                    <div className="space-y-4">
                        <div>
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Permission Heading</label>
                            <input
                                type="text"
                                value={permissionHeading}
                                onChange={(e) => setPermissionHeading(e.target.value)}
                                className={`w-full p-3 rounded-xl border text-sm focus:ring-2 focus:ring-blue-500 outline-none transition-all
                                ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                            />
                        </div>

                        <div className="space-y-2">
                            <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Include Documents</label>
                            <button
                                onClick={() => setIncludeIqama(!includeIqama)}
                                className={`w-full p-3 rounded-xl border text-sm font-bold flex items-center justify-between transition-all
                                ${includeIqama ? 'bg-blue-600 border-blue-500 text-white shadow-md' : (darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-white border-gray-200 text-gray-600')}`}
                            >
                                <span>Iqama Copies</span>
                                {includeIqama && <CheckCircle size={16} />}
                            </button>
                            <button
                                onClick={() => setIncludePassport(!includePassport)}
                                className={`w-full p-3 rounded-xl border text-sm font-bold flex items-center justify-between transition-all
                                ${includePassport ? 'bg-blue-600 border-blue-500 text-white shadow-md' : (darkMode ? 'bg-gray-700 border-gray-600 text-gray-400' : 'bg-white border-gray-200 text-gray-600')}`}
                            >
                                <span>Passport Copies</span>
                                {includePassport && <CheckCircle size={16} />}
                            </button>
                        </div>
                    </div>

                    <div className="mt-auto pt-6 border-t dark:border-gray-700">
                        <button
                            onClick={handleDownload}
                            disabled={isDownloading}
                            className="w-full mb-3 flex items-center justify-center gap-2 py-3 bg-gray-200 dark:bg-gray-800 rounded-xl font-black text-sm hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            {isDownloading ? <Loader2 className="animate-spin" size={18} /> : <Download size={18} />}
                            DOWNLOAD PDF
                        </button>
                        <button
                            onClick={handlePrint}
                            className="w-full flex items-center justify-center gap-2 py-4 bg-blue-600 text-white rounded-xl font-black text-sm shadow-xl shadow-blue-500/30 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            <Printer size={18} /> PRINT DOCUMENTS
                        </button>
                    </div>
                </div>

                {/* Preview Area - USING INLINE STYLES TO FIX HTML2CANVAS OKLCH ERROR (Tailwind v4) */}
                <div className={`flex-1 overflow-y-auto p-8 flex justify-center ${darkMode ? 'bg-gray-950' : 'bg-gray-100'}`}>
                    <div id="id-collection-area" className="w-[210mm] shadow-2xl p-[1.5cm] flex flex-col min-h-[297mm]" style={{ backgroundColor: '#ffffff', color: '#000000' }}>
                        {/* Header */}
                        <div className="flex justify-between items-center pb-4 mb-4" style={{ borderBottom: '2px solid #000000' }}>
                            <img src={logoSrc} alt="MAAJ Logo" className="h-12 object-contain" />
                            <div className="text-right">
                                <h1 className="text-lg font-black uppercase tracking-tight">{permissionHeading}</h1>
                                <p className="text-[10px] font-bold uppercase" style={{ color: '#6b7280' }}>Generated on: {new Date().toLocaleDateString()}</p>
                                <p className="text-[10px] font-bold uppercase" style={{ color: '#6b7280' }}>Total Employees: {selectedEmployees.length}</p>
                            </div>
                        </div>

                        {/* ID Cards Grid */}
                        <div className="grid grid-cols-2 gap-x-4 gap-y-6">
                            {selectedEmployees.map((emp, index) => (
                                <React.Fragment key={emp.id}>
                                    {includeIqama && (
                                        <div className="rounded-lg p-3 break-inside-avoid" style={{ border: '1px solid #e5e7eb' }}>
                                            <div className="flex justify-between items-center mb-2 pb-1" style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                <span className="text-[10px] font-black uppercase" style={{ color: '#2563eb' }}>Iqama Copy</span>
                                                <span className="text-[10px] font-bold">{emp.name}</span>
                                            </div>
                                            <div className="aspect-[1.58/1] rounded flex items-center justify-center overflow-hidden relative" style={{ backgroundColor: '#f9fafb', border: '2px dashed #e5e7eb' }}>
                                                {(() => {
                                                    const rawPath = emp.iqama_file || emp.iqama_url;
                                                    if (!rawPath) {
                                                        return (
                                                            <div className="text-center p-4">
                                                                <Shield size={32} className="mx-auto mb-1" style={{ color: '#d1d5db' }} />
                                                                <p className="text-[8px] font-bold uppercase" style={{ color: '#9ca3af' }}>ID Image Not Provided</p>
                                                                <p className="text-[10px] font-black mt-1">{emp.iqama_no || 'No Iqama #'}</p>
                                                            </div>
                                                        );
                                                    }
                                                    // Resolve URL logic inline
                                                    let cleanPath = rawPath.replace ? rawPath.replace(/\\/g, '/') : rawPath;
                                                    if (cleanPath.startsWith('http')) {
                                                        // use as is
                                                    } else {
                                                        if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;
                                                        cleanPath = `${API_BASE_URL}${cleanPath}`;
                                                    }

                                                    return (
                                                        <img src={cleanPath} alt="Iqama" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none' }} />
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                    {includePassport && (
                                        <div className="rounded-lg p-3 break-inside-avoid" style={{ border: '1px solid #e5e7eb' }}>
                                            <div className="flex justify-between items-center mb-2 pb-1" style={{ borderBottom: '1px solid #e5e7eb' }}>
                                                <span className="text-[10px] font-black uppercase" style={{ color: '#9333ea' }}>Passport Copy</span>
                                                <span className="text-[10px] font-bold">{emp.name}</span>
                                            </div>
                                            <div className="aspect-[1.58/1] rounded flex items-center justify-center overflow-hidden relative" style={{ backgroundColor: '#f9fafb', border: '2px dashed #e5e7eb' }}>
                                                {(() => {
                                                    const rawPath = emp.passport_file || emp.passport_url;
                                                    if (!rawPath) {
                                                        return (
                                                            <div className="text-center p-4">
                                                                <FileText size={32} className="mx-auto mb-1" style={{ color: '#d1d5db' }} />
                                                                <p className="text-[8px] font-bold uppercase" style={{ color: '#9ca3af' }}>Passport Image Not Provided</p>
                                                                <p className="text-[10px] font-black mt-1">{emp.passport_no || 'No Passport #'}</p>
                                                            </div>
                                                        );
                                                    }
                                                    // Resolve URL logic inline
                                                    let cleanPath = rawPath.replace ? rawPath.replace(/\\/g, '/') : rawPath;
                                                    if (cleanPath.startsWith('http')) {
                                                        // use as is
                                                    } else {
                                                        if (!cleanPath.startsWith('/')) cleanPath = `/${cleanPath}`;
                                                        cleanPath = `${API_BASE_URL}${cleanPath}`;
                                                    }

                                                    return (
                                                        <img src={cleanPath} alt="Passport" className="w-full h-full object-contain" onError={(e) => { e.target.style.display = 'none' }} />
                                                    );
                                                })()}
                                            </div>
                                        </div>
                                    )}
                                </React.Fragment>
                            ))}
                        </div>

                        {/* Footer */}
                        <div className="mt-auto pt-8 flex justify-between items-end" style={{ borderTop: '1px solid #f3f4f6' }}>
                            <div>
                                <p className="text-[8px] font-bold uppercase tracking-widest" style={{ color: '#9ca3af' }}>Confidential Document</p>
                                <p className="text-[9px] font-black uppercase tracking-tighter">MAAJ GROUP - HR Operations Central Filing</p>
                            </div>
                            <div className="text-right">
                                <p className="text-[10px] font-bold">Authorized By</p>
                                <div className="h-10 w-32 border-b mt-1" style={{ borderColor: '#000000' }}></div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Absolute Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                >
                    <X size={20} />
                </button>
            </div>

            <style>{`
                @media print {
                    @page { margin: 0; size: auto; }
                    body { margin: 1cm; }
                    body * { visibility: hidden; }
                    #id-collection-area, #id-collection-area * { visibility: visible; }
                    #id-collection-area { position: absolute; left: 0; top: 0; width: 100%; height: auto; margin: 0; padding: 1.5cm; }
                }
            `}</style>
        </div>
    );
};

export default IDCollectionModal;
