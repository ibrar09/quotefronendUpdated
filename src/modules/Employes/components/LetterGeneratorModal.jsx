import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import {
    X, Printer, Download, Copy, FileText, ChevronDown, Check, Wand2,
    ChevronRight, Edit3, Eye, Loader2, Search
} from 'lucide-react';
import { PLACEHOLDER_LOGO } from '../../../config/constants';
import { LETTER_TEMPLATES, LETTER_CATEGORIES } from './LetterTemplates';
import logoSrc from '../../../assets/Maaj-Logo 04.png';
import toast from 'react-hot-toast';

import jsPDF from 'jspdf';
import html2canvas from 'html2canvas';

const LetterGeneratorModal = ({ employee, onClose, initialTemplateId = null }) => {
    const { darkMode } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState(LETTER_CATEGORIES.STATUS);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [letterContent, setLetterContent] = useState('');
    const [templateSearch, setTemplateSearch] = useState('');
    const [isEditing, setIsEditing] = useState(false);
    const [isDownloading, setIsDownloading] = useState(false);

    useEffect(() => {
        if (initialTemplateId) {
            // Find template in all categories
            for (const category in LETTER_TEMPLATES) {
                const found = LETTER_TEMPLATES[category].find(t => t.id === initialTemplateId);
                if (found) {
                    setSelectedCategory(category);
                    handleTemplateSelect(found);
                    break;
                }
            }
        }
    }, [initialTemplateId]);

    // Pre-select first template of default category
    useEffect(() => {
        if (selectedCategory && LETTER_TEMPLATES[selectedCategory]?.length > 0) {
            handleTemplateSelect(LETTER_TEMPLATES[selectedCategory][0]);
        }
    }, [selectedCategory]);

    const handleTemplateSelect = (template) => {
        setSelectedTemplate(template);
        if (employee) {
            // Dynamic Replacement Logic
            let text = template.content;

            // Standard Info
            text = text.replace(/{name}/g, employee.name || `${employee.first_name} ${employee.last_name}` || 'N/A');
            text = text.replace(/{role}/g, employee.position || employee.role || 'N/A');
            text = text.replace(/{id}/g, employee.emp_id || employee.id || 'N/A');
            text = text.replace(/{emp_id}/g, employee.employee_id || employee.emp_id || employee.id || 'N/A');
            text = text.replace(/{department}/g, employee.department || 'N/A');
            text = text.replace(/{nationality}/g, employee.nationality || 'N/A');
            text = text.replace(/{sponsor}/g, employee.sponsor_name || 'MAAJ GROUP');
            text = text.replace(/{iqama}/g, employee.iqama_no || employee.iqama || employee.id_number || 'N/A');
            text = text.replace(/{joining_date}/g, employee.joining_date ? new Date(employee.joining_date).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'N/A');

            // Performance / Promotion Specifics
            text = text.replace(/{manager_name}/g, '[Manager Name]');
            text = text.replace(/{manager_role}/g, '[Manager Position]');
            text = text.replace(/{old_salary}/g, '[Previous Salary]');
            text = text.replace(/{hr_name}/g, 'HR Department');

            // Salary Info
            const basic = Number(employee.basic_salary) || 0;
            const housing = Number(employee.housing_allowance) || 0;
            const transport = Number(employee.transport_allowance) || 0;
            const other = Number(employee.other_allowance) || 0;
            const total = basic + housing + transport + other;

            text = text.replace(/{basic_salary}/g, basic.toLocaleString());
            text = text.replace(/{housing_allowance}/g, housing.toLocaleString());
            text = text.replace(/{transport_allowance}/g, transport.toLocaleString());
            text = text.replace(/{allowances}/g, (housing + transport + other).toLocaleString());
            text = text.replace(/{total_salary}/g, total.toLocaleString());

            // Dates
            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            text = text.replace(/{date}/g, today);
            text = text.replace(/{year}/g, new Date().getFullYear());

            // Fallbacks for missing dates
            const expDate = new Date();
            expDate.setDate(expDate.getDate() + 7);

            const termNoticeDate = new Date();
            termNoticeDate.setDate(termNoticeDate.getDate() + 7); // Legal 7-day notice

            text = text.replace(/{expiry_date}/g, expDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));
            text = text.replace(/{termination_date}/g, termNoticeDate.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }));

            // Probation & Confirmation Dates
            if (employee.joining_date) {
                const joinDate = new Date(employee.joining_date);
                const probEndDate = new Date(joinDate);
                const days = template.id === 'probation_extension' ? 180 : 90;
                probEndDate.setDate(probEndDate.getDate() + days);

                const confDate = new Date(probEndDate);
                confDate.setDate(confDate.getDate() + 1);

                const formatDate = (d) => d.toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });

                text = text.replace(/{probation_end_date}/g, formatDate(probEndDate));
                text = text.replace(/{confirmation_date}/g, formatDate(confDate));
            } else {
                text = text.replace(/{probation_end_date}/g, '[Probation End Date]');
                text = text.replace(/{confirmation_date}/g, '[Confirmation Date]');
            }

            setLetterContent(text);
        }
    };

    const handleDownload = async () => {
        const element = document.getElementById('letter-content-area');
        if (!element) return;

        setIsDownloading(true);
        try {
            // Scroll to top to ensure capturing correctly
            window.scrollTo(0, 0);

            const canvas = await html2canvas(element, {
                scale: 3, // Higher scale for better quality
                useCORS: true,
                logging: false,
                backgroundColor: '#ffffff',
                windowWidth: 1200, // Fixed width for consistent rendering
                onclone: (clonedDoc) => {
                    const clonedElement = clonedDoc.getElementById('letter-content-area');
                    if (clonedElement) {
                        clonedElement.style.boxShadow = 'none';
                        clonedElement.style.borderRadius = '0';
                    }

                    // html2canvas doesn't support oklch() colors which are common in modern Tailwind/DaisyUI
                    // We need to strip or replace them in the cloned document to prevent the parser from crashing
                    const elements = clonedDoc.getElementsByTagName('*');
                    for (let i = 0; i < elements.length; i++) {
                        const el = elements[i];
                        const computedStyle = window.getComputedStyle(el);

                        // Check common color properties
                        if (computedStyle.color?.includes('oklch')) el.style.color = '#1a1a1a';
                        if (computedStyle.backgroundColor?.includes('oklch')) {
                            el.style.backgroundColor = el.id === 'letter-content-area' ? '#ffffff' : 'transparent';
                        }
                        if (computedStyle.borderColor?.includes('oklch')) el.style.borderColor = '#000000';
                        if (computedStyle.fill?.includes('oklch')) el.style.fill = 'currentColor';
                        if (computedStyle.stroke?.includes('oklch')) el.style.stroke = 'currentColor';
                    }
                }
            });

            const imgData = canvas.toDataURL('image/png', 1.0);
            const pdf = new jsPDF('p', 'mm', 'a4');
            const pdfWidth = pdf.internal.pageSize.getWidth();
            const pdfHeight = pdf.internal.pageSize.getHeight();

            // Add image covering the full page
            pdf.addImage(imgData, 'PNG', 0, 0, pdfWidth, pdfHeight);
            pdf.save(`HR_Document_${employee.name.replace(/\s+/g, '_')}.pdf`);

            toast.success("PDF Downloaded Successfully!");
        } catch (error) {
            console.error('PDF Generation failed:', error);
            toast.error("Failed to generate PDF. Please try the Print option.");
        } finally {
            setIsDownloading(false);
        }
    };

    const handlePrint = () => {
        const printWindow = window.open('', '_blank');
        const today = new Date().toLocaleDateString();

        // Use the logoSrc from imports
        const logoUrl = window.location.origin + logoSrc;

        printWindow.document.write(`
            <html>
            <head>
                <title>Offer_Letter_${employee.name.replace(/\s+/g, '_')}</title>
                <style>
                    @import url('https://fonts.googleapis.com/css2?family=Montserrat:wght@400;700;900&family=Lora:ital,wght@0,400;0,500;0,600;1,400&display=swap');
                    
                    @page {
                        size: A4;
                        margin: 0;
                    }

                    body { 
                        font-family: 'Lora', serif; 
                        line-height: 1.6; 
                        padding: 1.5cm 2cm; 
                        color: #1a1a1a;
                        background: #fff;
                        margin: 0;
                        -webkit-print-color-adjust: exact;
                    }

                    .letter-head { 
                        display: flex; 
                        justify-content: space-between; 
                        align-items: flex-end;
                        margin-bottom: 40px; 
                        border-bottom: 3px solid #000; 
                        padding-bottom: 15px; 
                        font-family: 'Montserrat', sans-serif;
                    }

                    .date-container { 
                        text-align: right; 
                        font-weight: 700;
                        font-size: 10pt;
                        color: #000;
                        letter-spacing: 0.5px;
                        text-transform: uppercase;
                    }

                    .logo-container img { 
                        height: 65px; 
                        max-width: 220px;
                        object-fit: contain;
                    }

                    .content { 
                        white-space: pre-wrap; 
                        font-size: 11pt; 
                        min-height: 16cm;
                        color: #1a1a1a;
                        font-weight: 400;
                        margin-top: 30px;
                        text-align: justify;
                        letter-spacing: 0.1px;
                        display: flex;
                        flex-direction: column;
                        gap: 15px;
                    }

                    .stamp-container {
                        margin-top: 40px;
                        display: flex;
                        justify-content: center;
                    }
                    
                    .company-stamp {
                        width: 120px;
                        height: 120px;
                        opacity: 0.15;
                        filter: grayscale(1);
                        border: 3px double #000;
                        border-radius: 50%;
                        display: flex;
                        align-items: center;
                        justify-content: center;
                        font-weight: 900;
                        font-size: 8pt;
                        text-align: center;
                        transform: rotate(-15deg);
                    }

                    .footer { 
                        margin-top: 30px; 
                        display: flex;
                        justify-content: space-between;
                        align-items: flex-end;
                        border-top: 1px solid #eee;
                        padding-top: 20px;
                        font-family: 'Montserrat', sans-serif;
                    }

                    .signature-box { 
                        width: 280px; 
                    }

                    .signature-line {
                        border-top: 2.5px solid #000;
                        margin-top: 50px;
                        padding-top: 8px;
                        font-weight: 900;
                        font-size: 10.5pt;
                        text-transform: uppercase;
                        letter-spacing: 1.5px;
                        color: #000;
                    }

                    .signature-title {
                        font-size: 8.5pt;
                        color: #444;
                        font-weight: 700;
                        margin-top: 4px;
                        text-transform: uppercase;
                        letter-spacing: 0.8px;
                    }

                    .date-stamp {
                        font-size: 8pt;
                        color: #999;
                        font-weight: 600;
                        text-align: right;
                        letter-spacing: 1px;
                        text-transform: uppercase;
                    }

                    @media print {
                        body { 
                            padding: 1.5cm 2cm; 
                        }
                    }
                </style>
            </head>
            <body>
                <div class="letter-head">
                    <div class="logo-container">
                        <img src="${logoUrl}" alt="Company Logo" onerror="this.src='${PLACEHOLDER_LOGO}'" />
                    </div>
                    <div class="date-container">
                        Date: ${today}<br/>
                        Ref: ${employee.employee_id || employee.id}/${new Date().getFullYear()}
                    </div>
                </div>
                <div class="content">${letterContent}</div>
                <div class="stamp-container">
                    <div class="company-stamp">
                        OFFICIAL SEAL<br/>MAAJ GROUP<br/>HR DEPT
                    </div>
                </div>
                <div class="footer">
                    <div class="signature-box">
                        <div class="signature-line">Authorized Signatory</div>
                        <div class="signature-title">Human Resources Operations Department</div>
                    </div>
                    <div class="date-stamp">
                        REF: MAAJ-HR-${new Date().getFullYear()}-${employee.employee_id || employee.id}<br/>
                        PRINTED ON: ${today}
                    </div>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();

        // Wait for images to load before printing
        setTimeout(() => {
            printWindow.print();
        }, 800);
    };

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-md animate-[fadeIn_0.3s_ease-out]">
            <div className={`relative w-full max-w-6xl h-[90vh] rounded-3xl shadow-2xl flex overflow-hidden border
                ${darkMode ? 'bg-gray-900 border-gray-700 text-white' : 'bg-white border-gray-200 text-gray-900'}`}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-6 right-6 z-20 p-2.5 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                >
                    <X size={20} />
                </button>

                {/* LEFT SIDEBAR: Categories & Templates */}
                <div className={`w-80 border-r flex flex-col ${darkMode ? 'border-gray-700 bg-gray-800/50' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="p-6 border-b dark:border-gray-700">
                        <div className="flex items-center gap-2 mb-2">
                            <div className="p-2 bg-blue-600 rounded-lg text-white">
                                <FileText size={20} />
                            </div>
                            <h2 className="font-black text-xl tracking-tight">Letters</h2>
                        </div>
                        <p className="text-xs text-gray-500 font-medium">Professional Document Engine</p>
                    </div>

                    {/* Category Selector */}
                    <div className="p-4">
                        <label className="text-[10px] font-black uppercase text-gray-400 mb-2 block tracking-widest">Document Category</label>
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className={`w-full p-3 rounded-xl border text-sm font-bold focus:ring-2 focus:ring-blue-500 outline-none transition-all
                            ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                        >
                            {Object.values(LETTER_CATEGORIES).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Template List with Search */}
                    <div className="flex-1 overflow-y-auto px-4 pb-4 space-y-2 custom-scrollbar">
                        <div className="mb-4 relative group">
                            <Search size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" />
                            <input
                                type="text"
                                placeholder="Search suggestions..."
                                value={templateSearch}
                                onChange={(e) => setTemplateSearch(e.target.value)}
                                className={`w-full pl-9 pr-3 py-2 rounded-xl border text-xs outline-none transition-all
                                ${darkMode ? 'bg-gray-700/50 border-gray-600' : 'bg-white border-gray-200 focus:border-blue-300'}`}
                            />
                        </div>

                        {(LETTER_TEMPLATES[selectedCategory] || [])
                            .filter(tpl => tpl.title.toLowerCase().includes(templateSearch.toLowerCase()))
                            .map(tpl => (
                                <button
                                    key={tpl.id}
                                    onClick={() => handleTemplateSelect(tpl)}
                                    className={`w-full text-left p-4 rounded-2xl text-sm font-bold transition-all flex items-center justify-between group
                                    ${selectedTemplate?.id === tpl.id
                                            ? 'bg-blue-600 text-white shadow-xl scale-[1.02]'
                                            : (darkMode ? 'hover:bg-gray-700 text-gray-400' : 'hover:bg-white hover:shadow-md text-gray-600')
                                        }`}
                                >
                                    <span className="truncate">{tpl.title}</span>
                                    <ChevronRight size={16} className={`transition-transform ${selectedTemplate?.id === tpl.id ? 'translate-x-1' : 'opacity-0'}`} />
                                </button>
                            ))}
                    </div>

                    {/* Placeholder Suggestions Legend */}
                    <div className={`p-4 mt-auto border-t text-[10px] ${darkMode ? 'border-gray-700 bg-gray-900/50' : 'border-gray-200 bg-gray-100/50'}`}>
                        <p className="font-black text-gray-400 mb-3 uppercase tracking-widest">Available Suggestions</p>
                        <div className="grid grid-cols-2 gap-x-2 gap-y-1.5 overflow-hidden">
                            {[
                                { k: '{name}', v: 'Employee' },
                                { k: '{role}', v: 'Position' },
                                { k: '{total_salary}', v: 'New Salary' },
                                { k: '{old_salary}', v: 'Old Salary' },
                                { k: '{date}', v: 'Current Date' },
                                { k: '{iqama}', v: 'Iqama/ID' },
                                { k: '{probation_end_date}', v: 'Review Date' },
                                { k: '{termination_date}', v: 'Notice End' }
                            ].map(item => (
                                <div key={item.k} className="flex flex-col">
                                    <span className="text-blue-500 font-bold font-mono py-0.5 rounded tracking-tighter overflow-hidden text-ellipsis whitespace-nowrap" title={item.k}>{item.k}</span>
                                    <span className="text-gray-400 font-medium truncate italic text-[9px]">{item.v}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                {/* RIGHT SIDE: Editor & Preview */}
                <div className={`flex-1 flex flex-col h-full ${darkMode ? 'bg-gray-950/30' : 'bg-gray-100/50'}`}>
                    <div className="p-4 border-b dark:border-gray-800 flex justify-between items-center bg-white/50 dark:bg-gray-900/50 backdrop-blur-sm">
                        <div className="flex items-center gap-4">
                            <h3 className="font-bold text-gray-500 text-sm">Preview & Edit</h3>
                            <div className="h-4 w-[1px] bg-gray-300 dark:bg-gray-700"></div>
                            <span className="text-xs font-mono bg-blue-100 text-blue-600 px-2 py-0.5 rounded uppercase font-black">{selectedTemplate?.id}</span>
                        </div>
                        <button
                            onClick={() => setIsEditing(!isEditing)}
                            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-xs font-black transition-all
                                ${isEditing ? 'bg-green-100 text-green-700 shadow-sm' : 'bg-gray-100 dark:bg-gray-800 text-gray-600'}`}
                        >
                            {isEditing ? <Eye size={16} /> : <Edit3 size={16} />}
                            {isEditing ? 'FINISH EDITING' : 'EDIT CONTENT'}
                        </button>
                    </div>

                    <div className="flex-1 p-8 overflow-y-auto custom-scrollbar flex justify-center bg-gray-200/50 dark:bg-gray-950/80">
                        {/* THE WRAPPER DIV for html2canvas - needs to be fixed width/height for capturing */}
                        <div id="letter-content-area" className="w-[210mm] min-h-[297mm] p-[1.5cm_2cm] bg-white text-gray-900 shadow-2xl relative flex flex-col items-center overflow-hidden">
                            <div className="w-full h-full font-['Lora'] flex flex-col">
                                {/* Letter Header */}
                                <div className="flex justify-between items-end border-b-[3px] border-black pb-4 mb-10 w-full font-['Montserrat']">
                                    <div className="logo-container">
                                        <img src={logoSrc} alt="Logo" className="h-16 max-w-[200px] object-contain" />
                                    </div>
                                    <div className="text-right">
                                        <div className="text-[10pt] font-black text-black tracking-widest uppercase">
                                            Date: {new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                                        </div>
                                    </div>
                                </div>

                                {isEditing ? (
                                    <textarea
                                        value={letterContent}
                                        onChange={(e) => setLetterContent(e.target.value)}
                                        className="w-full h-[800px] resize-none outline-none font-['Lora'] text-[11pt] leading-[1.6] bg-blue-50/5 border-2 border-dashed border-blue-100 p-8 rounded-2xl focus:bg-white transition-all ring-0 text-justify"
                                        spellCheck="false"
                                        autoFocus
                                    />
                                ) : (
                                    <div className="font-['Lora'] text-[11pt] leading-[1.6] whitespace-pre-wrap text-black min-h-[700px] text-justify tracking-normal">
                                        {letterContent}
                                    </div>
                                )}

                                {/* Letter Footer */}
                                <div className="mt-auto pt-10 flex justify-between items-end w-full font-['Montserrat']">
                                    <div className="w-80">
                                        <div className="border-t-[3px] border-black pt-4">
                                            <p className="font-black text-[10.5pt] uppercase text-black tracking-[1.5px]">Authorized Signatory</p>
                                            <p className="text-[9px] text-gray-500 font-bold mt-1 uppercase tracking-wider">Human Resources Operations Department</p>
                                        </div>
                                    </div>
                                    <div className="text-[9pt] text-gray-300 font-black italic tracking-widest uppercase">
                                        MAAJ-EMP-{employee.employee_id || employee.id}
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className={`p-6 border-t flex justify-between items-center shadow-2xl
                        ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <div className="text-xs text-gray-500 font-medium">
                            <span className="font-black text-blue-500">PRO TIP:</span> Use 'Edit' mode to manually tweak wording before printing.
                        </div>
                        <div className="flex gap-3">
                            <button onClick={onClose} className="px-6 py-2.5 text-sm font-black text-gray-400 hover:text-red-500 transition-colors">
                                Discard
                            </button>
                            <button
                                onClick={handleDownload}
                                disabled={isDownloading}
                                className="flex items-center gap-2 px-6 py-3 bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 rounded-2xl font-black hover:bg-gray-200 dark:hover:bg-gray-700 transition-all"
                            >
                                {isDownloading ? <Loader2 size={18} className="animate-spin" /> : <Download size={18} />}
                                {isDownloading ? 'GENERATING...' : 'DOWNLOAD PDF'}
                            </button>
                            <button
                                onClick={handlePrint}
                                className="flex items-center gap-2 px-8 py-3 bg-blue-600 text-white rounded-2xl font-black hover:bg-blue-700 shadow-xl hover:shadow-blue-500/40 transition-all scale-100 hover:scale-[1.05]"
                            >
                                <Printer size={20} /> PRINT DOCUMENT
                            </button>
                        </div>
                    </div>
                </div>
            </div>

            <style>{`
                .custom-scrollbar::-webkit-scrollbar { width: 6px; }
                .custom-scrollbar::-webkit-scrollbar-track { background: transparent; }
                .custom-scrollbar::-webkit-scrollbar-thumb { background: #3b82f644; border-radius: 10px; }
                .custom-scrollbar::-webkit-scrollbar-thumb:hover { background: #3b82f6; }
                @keyframes fadeIn {
                    from { opacity: 0; transform: scale(0.98); }
                    to { opacity: 1; transform: scale(1); }
                }
            `}</style>
        </div>
    );
};

export default LetterGeneratorModal;
