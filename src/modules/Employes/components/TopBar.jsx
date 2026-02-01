import { Search } from 'lucide-react'
import React from 'react'
import { useTheme } from '../../../context/ThemeContext'

const TopBar = () => {
    const { darkMode } = useTheme();

    return (
        <div className="flex flex-col w-full">

            {/* Thin top green line */}
            <div
                className={`h-4 w-full transition-colors ${darkMode ? 'bg-green-600' : 'bg-[#3A4D4E]'}`}
            />

            {/* Main TopBar Content */}
            <div
                className={`h-16 flex items-center justify-between px-8 border-b transition-colors rounded-tl-xl
          ${darkMode
                        ? 'bg-gray-900 border-gray-800'
                        : 'bg-[#F9F7F1] border border-gray-200'
                    }`}
            >
                {/* Search Bar */}
                <div
                    className={`flex items-center px-4 py-2 rounded-full w-96 transition-colors
            ${darkMode ? 'bg-gray-800' : 'bg-white shadow-sm border border-gray-100'}`}
                >
                    <input
                        type="text"
                        placeholder="Search..."
                        className={`flex-1 bg-transparent outline-none text-sm placeholder-gray-400
              ${darkMode ? 'text-white' : 'text-gray-700'}`}
                    />
                    <Search size={18} className="text-gray-400 ml-2 cursor-pointer hover:text-gray-600" />
                </div>

                <div className="flex items-center gap-4" />
            </div>
        </div>
    )
}

export default TopBar;
