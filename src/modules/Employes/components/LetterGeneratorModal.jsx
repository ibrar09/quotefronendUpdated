import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { X, Printer, Download, FileText, ChevronRight } from 'lucide-react';
import { LETTER_TEMPLATES, LETTER_CATEGORIES } from './LetterTemplates';

const LetterGeneratorModal = ({ employee, onClose }) => {
    const { darkMode } = useTheme();
    const [selectedCategory, setSelectedCategory] = useState(LETTER_CATEGORIES.STATUS);
    const [selectedTemplate, setSelectedTemplate] = useState(null);
    const [letterContent, setLetterContent] = useState('');

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
            text = text.replace(/{name}/g, employee.name);
            text = text.replace(/{role}/g, employee.role);
            text = text.replace(/{id}/g, employee.id);
            text = text.replace(/{salary}/g, employee.salary || 'SAR X,XXX'); // fallback if missing
            text = text.replace(/{joining_date}/g, employee.joining_date || '[Joining Date]');
            text = text.replace(/{iqama}/g, employee.iqama || '[Iqama No]');
            text = text.replace(/{passport}/g, employee.passport || '[Passport No]');

            const today = new Date().toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' });
            text = text.replace(/{date}/g, today);

            setLetterContent(text);
        }
    };

    const handlePrint = () => {
        // Open a new window for clean printing
        const printWindow = window.open('', '_blank');
        printWindow.document.write(`
            <html>
            <head>
                <title>${selectedTemplate?.title || 'Letter'} - ${employee.name}</title>
                <style>
                    body { font-family: 'Times New Roman', serif; line-height: 1.6; padding: 40px; color: #000; }
                    .header { text-align: center; margin-bottom: 40px; border-bottom: 2px solid #333; padding-bottom: 20px; }
                    .content { white-space: pre-wrap; font-size: 12pt; }
                    .footer { margin-top: 60px; }
                </style>
            </head>
            <body>
                <div class="header">
                    <h1>COMPANY NAME</h1>
                    <p>123 Business Rd, Riyadh, Saudi Arabia</p>
                </div>
                <div class="content">${letterContent}</div>
                <div class="footer">
                    <p>__________________________<br>Authorized Signatory</p>
                </div>
            </body>
            </html>
        `);
        printWindow.document.close();
        printWindow.print();
    };

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]">
            <div className={`relative w-full max-w-5xl h-[85vh] rounded-2xl shadow-2xl flex overflow-hidden
                ${darkMode ? 'bg-gray-900 text-white' : 'bg-white text-gray-900'}`}>

                {/* Close Button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full hover:bg-gray-200 dark:hover:bg-gray-700 transition"
                >
                    <X size={20} />
                </button>

                {/* LEFT SIDEBAR: Categories & Templates */}
                <div className={`w-1/3 border-r flex flex-col ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-gray-50'}`}>
                    <div className="p-4 border-b dark:border-gray-700">
                        <h2 className="font-bold text-lg mb-1">Letter Generator</h2>
                        <p className="text-xs text-gray-500">Select a category and template.</p>
                    </div>

                    {/* Category Selector */}
                    <div className="p-3">
                        <select
                            value={selectedCategory}
                            onChange={(e) => setSelectedCategory(e.target.value)}
                            className={`w-full p-2.5 rounded-lg border text-sm focus:ring-2 focus:ring-blue-500 outline-none
                            ${darkMode ? 'bg-gray-700 border-gray-600 text-white' : 'bg-white border-gray-300 text-gray-900'}`}
                        >
                            {Object.values(LETTER_CATEGORIES).map(cat => (
                                <option key={cat} value={cat}>{cat}</option>
                            ))}
                        </select>
                    </div>

                    {/* Template List */}
                    <div className="flex-1 overflow-y-auto p-3 space-y-2">
                        {LETTER_TEMPLATES[selectedCategory]?.map(tpl => (
                            <button
                                key={tpl.id}
                                onClick={() => handleTemplateSelect(tpl)}
                                className={`w-full text-left p-3 rounded-lg text-sm font-medium transition-all flex items-center justify-between group
                                ${selectedTemplate?.id === tpl.id
                                        ? 'bg-blue-600 text-white shadow-md'
                                        : (darkMode ? 'hover:bg-gray-700 text-gray-300' : 'hover:bg-white hover:shadow-sm text-gray-700')
                                    }`}
                            >
                                {tpl.title}
                                {selectedTemplate?.id === tpl.id && <ChevronRight size={16} />}
                            </button>
                        ))}
                    </div>
                </div>

                {/* RIGHT SIDE: Editor & Preview */}
                <div className="flex-1 flex flex-col h-full bg-white dark:bg-gray-900/50">
                    <div className="flex-1 p-8 overflow-y-auto">
                        <div className={`max-w-2xl mx-auto shadow-xl min-h-[600px] p-10 bg-white text-black rounded-sm border
                             ${darkMode ? 'border-gray-700' : 'border-gray-200'}`}>

                            {/* Paper Header (Visual Only) */}
                            <div className="border-b-2 border-gray-800 pb-4 mb-8 text-center opacity-80">
                                <h1 className="font-serif text-2xl font-bold tracking-widest">COMPANY LOGO</h1>
                            </div>

                            <textarea
                                value={letterContent}
                                onChange={(e) => setLetterContent(e.target.value)}
                                className="w-full h-[500px] resize-none outline-none font-serif text-lg leading-relaxed bg-transparent border-none p-0 focus:ring-0"
                                spellCheck="false"
                            />

                            {/* Paper Footer */}
                            <div className="mt-12 pt-8">
                                <p className="font-serif">Authorized Signatory</p>
                            </div>
                        </div>
                    </div>

                    {/* Action Footer */}
                    <div className={`p-4 border-t flex justify-end gap-3 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <button onClick={onClose} className="px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700">
                            Cancel
                        </button>
                        <button
                            onClick={handlePrint}
                            className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg font-bold hover:bg-blue-700 shadow-lg hover:shadow-blue-500/30 transition-all"
                        >
                            <Printer size={18} /> Print / Save PDF
                        </button>
                    </div>
                </div>

            </div>
        </div>
    );
};

export default LetterGeneratorModal;
