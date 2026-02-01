import React, { useState } from 'react';
import { Outlet } from 'react-router-dom';
import FieldOpsSidebar from '../components/FieldOpsSidebar';
import { useTheme } from '../../../context/ThemeContext';
import { Menu } from 'lucide-react';

const FieldOpsLayout = () => {
    const { darkMode } = useTheme();
    const [sidebarOpen, setSidebarOpen] = useState(false);

    return (
        <div className={`flex h-screen overflow-hidden ${darkMode ? 'bg-slate-900 text-slate-100' : 'bg-slate-50 text-slate-800'}`}>
            {/* Sidebar */}
            <FieldOpsSidebar isOpen={sidebarOpen} onClose={() => setSidebarOpen(false)} />

            {/* Main Content Area */}
            <div className="flex-1 flex flex-col h-full overflow-hidden relative">

                {/* Mobile Header (Only visible on mobile) */}
                <div className="md:hidden p-4 flex items-center justify-between border-b dark:border-gray-800 bg-white dark:bg-gray-900 z-10">
                    <div className="font-black text-lg">Field<span className="text-blue-600">Ops</span></div>
                    <button onClick={() => setSidebarOpen(true)} className="p-2 rounded-lg bg-gray-100 dark:bg-gray-800">
                        <Menu size={20} />
                    </button>
                </div>

                <main className="flex-1 overflow-y-auto scroll-smooth relative">
                    <Outlet />
                </main>
            </div>
        </div>
    );
};

export default FieldOpsLayout;
