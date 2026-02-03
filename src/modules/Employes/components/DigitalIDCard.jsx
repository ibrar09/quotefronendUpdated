import React, { useState, useEffect } from 'react';
import QRCode from "react-qr-code";
import logoSrc from '../../../assets/Maaj-Logo 04.png';
import { User, Rocket, Edit2 } from 'lucide-react';
import API_BASE_URL from '../../../config/api';
import { resolveUrl } from '../../../utils/url';
import html2canvas from 'html2canvas';

const DigitalIDCard = ({ employee, darkMode }) => {
    // State for manual date overrides
    const [expiryDate, setExpiryDate] = useState(() => {
        const d = new Date();
        d.setFullYear(d.getFullYear() + 1); // Default 1 year validity
        return d.toISOString().split('T')[0];
    });
    const [issueDate, setIssueDate] = useState(new Date().toISOString().split('T')[0]);
    const [isPrinting, setIsPrinting] = useState(false);


    const avatarUrl = resolveUrl(employee.passport_photo || employee.avatar || employee.avatar_url);

    // QR Data - Expanded as requested
    const qrData = JSON.stringify({
        id: employee.custom_id || employee.emp_id || employee.id,
        name: `${employee.first_name} ${employee.last_name}`,
        iqama: employee.iqama_no,
        job: employee.position || employee.role || employee.job_title || 'Employee',
        company: "Operation Support Company",
        expiry: expiryDate
    });

    console.log("QR Data Payload:", qrData);
    console.log("Signature URL:", `${API_BASE_URL}/assets/signature.jpeg`);

    // Print Handler with html2canvas (WYSIWYG)
    const handlePrint = async () => {
        setIsPrinting(true);
        const element = document.getElementById('digital-id-card-content');

        try {
            console.log('Starting ID Card Capture...');
            // Wait a moment for images to be ready if needed, though they should be loaded
            const canvas = await html2canvas(element, {
                useCORS: true,
                scale: 4, // High Resolution for Print (300DPI equivalent)
                backgroundColor: null, // Transparent background
                logging: true,
            });

            const imgData = canvas.toDataURL('image/png');

            const printWindow = window.open('', '_blank');
            printWindow.document.write(`
                <html>
                    <head>
                        <title>Print ID Card - ${employee.first_name}</title>
                        <style>
                            body {
                                margin: 0;
                                display: flex;
                                justify-content: center;
                                align-items: center;
                                height: 100vh;
                                background-color: white;
                            }
                            img {
                                width: 54mm;
                                height: 85.6mm;
                                border: 1px solid #ddd; /* Subtle border for cutting guide */
                                border-radius: 3mm;
                            }
                            @media print {
                                body { margin: 0; }
                                img { border: none; }
                            }
                        </style>
                    </head>
                    <body>
                        <img src="${imgData}" onload="window.print(); window.close();" />
                    </body>
                </html>
            `);
            printWindow.document.close();
        } catch (error) {
            console.error("Print Error:", error);
            alert("Failed to generate ID card image. Please check console for details.");
        } finally {
            setIsPrinting(false);
        }
    };

    return (
        <div className="flex flex-col lg:flex-row items-start gap-8 animate-[fadeIn_0.5s_ease-out] w-full max-w-4xl">

            {/* Left Side: Controls */}
            <div className="flex-1 w-full space-y-6">
                <div className="bg-white dark:bg-gray-800 p-6 rounded-2xl border border-gray-100 dark:border-gray-700 shadow-sm">
                    <h3 className="text-lg font-bold mb-4 flex items-center gap-2">
                        <Edit2 size={18} className="text-orange-500" />
                        Card Configuration
                    </h3>

                    <div className="grid grid-cols-1 gap-4">
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Issue Date</label>
                            <input
                                type="date"
                                value={issueDate}
                                onChange={(e) => setIssueDate(e.target.value)}
                                className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 font-mono text-sm"
                            />
                        </div>
                        <div>
                            <label className="text-xs font-bold uppercase text-gray-400 mb-1 block">Expiry Date (Valid 1 Year)</label>
                            <input
                                type="date"
                                value={expiryDate}
                                onChange={(e) => setExpiryDate(e.target.value)}
                                className="w-full p-2 rounded-lg border dark:bg-gray-700 dark:border-gray-600 font-mono text-sm"
                            />
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t border-gray-100 dark:border-gray-700">
                        <button
                            onClick={handlePrint}
                            className="w-full flex items-center justify-center gap-2 px-6 py-4 bg-gradient-to-r from-yellow-500 to-orange-600 text-white rounded-xl font-black shadow-lg shadow-orange-500/20 hover:scale-[1.02] active:scale-95 transition-all"
                        >
                            <Rocket size={20} />
                            PRINT OFFICIAL CARD
                        </button>
                        <p className="text-[10px] text-center mt-3 text-gray-400">
                            Formats automatically to CR80 ID Card size (Portrait).
                        </p>
                    </div>
                </div>
            </div>

            {/* Right Side: Preview */}
            <div className="flex-1 w-full flex justify-center sticky top-8">
                <div className="relative group perspective-1000">
                    <div id="digital-id-card-content" className="id-card-container relative overflow-hidden transition-transform duration-500 transform group-hover:scale-105"
                        style={{
                            width: '320px', // Increased width for better visibility
                            height: '506px', // Proportional height (scale ~1.5x)
                            background: 'linear-gradient(135deg, #fbbf24 0%, #d97706 100%)',
                            borderRadius: '16px',
                            boxShadow: '0 10px 30px rgba(217, 119, 6, 0.3)',
                            fontFamily: "'Inter', sans-serif",
                            color: 'white'
                        }}
                    >
                        {/* Background Texture */}
                        <div className="absolute inset-0 opacity-10"
                            style={{ backgroundImage: `url("data:image/svg+xml,%3Csvg width='20' height='20' viewBox='0 0 20 20' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='%23ffffff' fill-opacity='1' fill-rule='evenodd'%3E%3Ccircle cx='3' cy='3' r='3'/%3E%3Ccircle cx='13' cy='13' r='3'/%3E%3C/g%3E%3C/svg%3E")` }}>
                        </div>

                        {/* Content Layer */}
                        <div className="absolute inset-0 p-4 flex flex-col items-center text-center z-10 h-full justify-between">

                            {/* Top Section: Logo & Photo */}
                            <div className="w-full flex flex-col items-center">
                                {/* Header: Logo */}
                                <div className="mb-2 mt-1">
                                    <img
                                        src={logoSrc}
                                        alt="Logo"
                                        className="h-8 object-contain brightness-0 invert drop-shadow-md"
                                        crossOrigin="anonymous"
                                    />
                                </div>

                                {/* Employee Photo */}
                                <div className="relative mb-1">
                                    <div className="w-24 h-24 rounded-full border-[3px] p-0.5 overflow-hidden mx-auto"
                                        style={{
                                            borderColor: 'rgba(255, 255, 255, 0.4)',
                                            backgroundColor: 'rgba(255, 255, 255, 0.1)',
                                            backdropFilter: 'blur(4px)',
                                            boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)'
                                        }}
                                    >
                                        {avatarUrl ? (
                                            <img
                                                src={avatarUrl}
                                                className="w-full h-full rounded-full object-cover bg-white"
                                                alt="Avatar"
                                                crossOrigin="anonymous"
                                            />
                                        ) : (
                                            <div className="w-full h-full rounded-full bg-gray-200 flex items-center justify-center text-gray-500">
                                                <User size={40} />
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {/* Employee Details */}
                                <div className="w-full px-2">
                                    <h3 className="text-xl font-black leading-snug overall-text uppercase tracking-wide w-full">
                                        {employee.first_name}
                                    </h3>
                                    <h3 className="text-xl font-black leading-snug mb-1.5 overall-text uppercase tracking-wide w-full">
                                        {employee.last_name}
                                    </h3>
                                    <div className="inline-block px-3 py-1 rounded-lg mb-1 border"
                                        style={{
                                            backgroundColor: 'rgba(255, 255, 255, 0.25)',
                                            borderColor: 'rgba(255, 255, 255, 0.2)',
                                            backdropFilter: 'blur(12px)'
                                        }}
                                    >
                                        <p className="text-[9px] font-bold text-white uppercase tracking-widest shadow-sm">
                                            {employee.position || employee.role || employee.job_title || 'EMPLOYEE'}
                                        </p>
                                    </div>
                                    <p className="text-[9px] font-mono font-bold tracking-widest opacity-90 drop-shadow-sm">
                                        {(employee.custom_id || employee.emp_id || employee.id).toString().slice(0, 10)}
                                    </p>
                                </div>
                            </div>

                            {/* Middle Section: Dates */}
                            <div className="w-full flex justify-center gap-8 border-t border-b py-1.5 my-0.5"
                                style={{
                                    borderColor: 'rgba(255, 255, 255, 0.1)',
                                    backgroundColor: 'rgba(0, 0, 0, 0.05)',
                                    backdropFilter: 'blur(2px)'
                                }}
                            >
                                <div>
                                    <p className="text-[8px] uppercase opacity-75 font-bold tracking-wider mb-0.5">Issue Date</p>
                                    <p className="text-[10px] font-bold">{issueDate}</p>
                                </div>
                                <div>
                                    <p className="text-[8px] uppercase opacity-75 font-bold tracking-wider mb-0.5">Expiry Date</p>
                                    <p className="text-[10px] font-bold text-white">{expiryDate}</p>
                                </div>
                            </div>

                            {/* Bottom Section: QR & Signature */}
                            <div className="w-full flex flex-col items-center gap-1 pb-2">
                                {/* QR Code */}
                                <div className="bg-white p-1 rounded-xl shrink-0" style={{ boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1)' }}>
                                    <QRCode
                                        value={qrData}
                                        size={58}
                                        fgColor="#000000"
                                        level="M"
                                    />
                                </div>

                                {/* Signature & Company Name */}
                                <div className="w-full pt-0.5 flex flex-col items-center">
                                    {/* Signature Image */}
                                    <div className="h-8 mb-0.5">
                                        <img
                                            src={`${API_BASE_URL}/assets/signature.jpeg`}
                                            alt="Signature"
                                            className="h-full object-contain"
                                            style={{
                                                mixBlendMode: 'multiply',
                                                filter: 'contrast(1.2) brightness(0.9)',
                                            }}
                                            crossOrigin="anonymous"
                                            onError={(e) => { e.target.style.display = 'none'; }}
                                        />
                                    </div>

                                    <div className="w-28 border-b mb-0.5" style={{ borderColor: 'rgba(255, 255, 255, 0.6)' }}></div>
                                    <p className="text-[7px] uppercase tracking-widest opacity-80 font-bold mb-0.5" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>Authorized Signature</p>
                                    <p className="text-[8px] font-black uppercase tracking-[0.2em] opacity-95" style={{ textShadow: '0 1px 2px rgba(0,0,0,0.1)' }}>
                                        Operation Support Company
                                    </p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default DigitalIDCard;
