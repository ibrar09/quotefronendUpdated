import React from 'react';
import { useTheme } from '../../../context/ThemeContext';
import { Clock } from 'lucide-react';

const Expenses = () => {
    const { darkMode } = useTheme();

    return (
        <div className="h-full flex flex-col items-center justify-center p-6 animate-[fadeIn_0.3s_ease-out]">
            <div className={`text-center p-10 rounded-3xl border-4 border-dashed ${darkMode ? 'border-gray-700 bg-gray-800' : 'border-gray-200 bg-white'}`}>
                <div className={`w-24 h-24 mx-auto mb-6 rounded-full flex items-center justify-center ${darkMode ? 'bg-gray-700 text-gray-400' : 'bg-gray-100 text-gray-400'}`}>
                    <Clock size={48} />
                </div>
                <h1 className={`text-4xl font-black mb-4 ${darkMode ? 'text-white' : 'text-gray-900'}`}>Coming Soon</h1>
                <p className={`text-lg font-medium max-w-md ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>
                    The Expenses (Fatora) module is currently under development. Stay tuned for updates!
                </p>
            </div>
        </div>
    );
};

export default Expenses;
