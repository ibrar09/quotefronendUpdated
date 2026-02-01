import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldCheck, Plus, Minus, Layers } from 'lucide-react';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
    iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
    shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
});

// Helper to recenter map smoothly
const MapRecenter = ({ center }) => {
    const map = useMap();
    useEffect(() => {
        if (center && center[0] && center[1]) {
            map.flyTo(center, 13, { duration: 1.5 });
        }
    }, [center, map]);
    return null;
};

const AttendanceMap = ({ darkMode, data, selectedEmployee }) => {
    const [mapStyle, setMapStyle] = useState('roadmap');
    const [showGeofence, setShowGeofence] = useState(true);

    return (
        <div className="lg:col-span-1 h-full min-h-[500px] flex flex-col pt-0 lg:pt-14">
            <div className={`relative flex-1 rounded-3xl overflow-hidden shadow-2xl border flex flex-col group
                 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>

                {/* Map Toolbar (Floating) */}
                <div className="absolute top-4 right-4 z-20 flex flex-col gap-2">
                    {/* Safe Zone Toggle */}
                    <button
                        onClick={() => setShowGeofence(!showGeofence)}
                        className={`p-2 rounded-lg shadow-lg transition-colors
                        ${showGeofence ? 'bg-green-500 text-white' : (darkMode ? 'bg-gray-800 text-gray-400' : 'bg-white text-gray-600')}`}
                        title="Toggle Safe Zones"
                    >
                        <ShieldCheck size={20} />
                    </button>
                    <div className="h-px bg-gray-200 dark:bg-gray-700 my-1"></div>

                    <button className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Plus size={20} />
                    </button>
                    <button className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Minus size={20} />
                    </button>
                    <button
                        onClick={() => setMapStyle(prev => prev === 'roadmap' ? 'satellite' : 'roadmap')}
                        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors mt-2"
                        title="Toggle Layer"
                    >
                        <Layers size={20} />
                    </button>
                </div>

                {/* Refresh Button */}
                <div className="absolute top-4 left-4 z-20">
                    <button className="flex items-center gap-2 px-3 py-1.5 bg-white/90 dark:bg-gray-800/90 backdrop-blur-md rounded-lg shadow-lg text-xs font-bold text-gray-700 dark:text-gray-300 hover:scale-105 transition-transform group">
                        <span className="relative flex h-2 w-2">
                            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                            <span className="relative inline-flex rounded-full h-2 w-2 bg-green-500"></span>
                        </span>
                        Live View
                    </button>
                </div>

                {/* Interactive Map */}
                <div className="absolute inset-0 z-10">
                    <MapContainer
                        center={[24.7136, 46.6753]} // Riyadh Default
                        zoom={11}
                        style={{ height: '100%', width: '100%' }}
                        zoomControl={false}
                    >
                        <TileLayer
                            url={darkMode
                                ? 'https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png'
                                : 'https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png'
                            }
                            attribution='&copy; OpenStreetMap contributors'
                        />

                        <MapRecenter center={selectedEmployee ? [selectedEmployee.lat, selectedEmployee.lng] : null} />

                        {data.filter(e => e.lat).map((emp) => (
                            <Marker
                                key={emp.id}
                                position={[emp.lat, emp.lng]}
                                icon={L.divIcon({
                                    className: 'custom-div-icon',
                                    html: `
                                        <div class="relative group">
                                            <div class="w-12 h-12 rounded-full border-4 shadow-2xl overflow-hidden relative z-20 flex items-center justify-center
                                                ${darkMode ? 'border-gray-800' : 'border-white'}
                                                ${emp.status === 'LATE' ? 'bg-orange-100' : 'bg-blue-100'}">
                                                ${emp.avatar
                                            ? `<img src="${emp.avatar}" class="w-full h-full object-cover"/>`
                                            : `<span class="font-bold text-gray-700 text-sm">${emp.name.charAt(0)}</span>`
                                        }
                                            </div>
                                            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 z-10
                                                ${darkMode ? 'bg-gray-800' : 'bg-white'}"></div>
                                            <div class="absolute top-0 right-0 w-3.5 h-3.5 border-2 rounded-full z-30 
                                                ${darkMode ? 'border-gray-800' : 'border-white'}
                                                ${emp.onlineStatus === 'Online' ? 'bg-green-500' : 'bg-gray-400'}"></div>
                                        </div>
                                    `,
                                    iconSize: [48, 48],
                                    iconAnchor: [24, 48]
                                })}
                            >
                                <Popup>
                                    <div className="p-2 min-w-[150px]">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold">
                                                {emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm">{emp.name}</div>
                                                <div className="text-xs text-gray-500">{emp.role}</div>
                                            </div>
                                        </div>
                                        <div className="space-y-1 text-xs">
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Status:</span>
                                                <span className={emp.status === 'PRESENT' ? 'text-green-600' : 'text-orange-600'}>{emp.status}</span>
                                            </div>
                                            <div className="flex justify-between">
                                                <span className="text-gray-500">Check-In:</span>
                                                <span>{emp.timeIn}</span>
                                            </div>
                                        </div>
                                    </div>
                                </Popup>
                            </Marker>
                        ))}
                    </MapContainer>
                </div>
            </div>

            {/* Legend */}
            <div className={`p-4 mt-4 rounded-xl border flex justify-around text-xs font-medium
                ${darkMode ? 'bg-gray-800 border-gray-700 text-gray-300' : 'bg-white border-gray-200 text-gray-600'}`}>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-green-500 shadow-[0_0_8px_rgba(34,197,94,0.5)]"></span> On Site</div>
                <div className="flex items-center gap-2"><span className="w-2.5 h-2.5 rounded-full bg-orange-500 shadow-[0_0_8px_rgba(249,115,22,0.5)]"></span> Late Arrival</div>
                <div className="flex items-center gap-2"><div className="w-2.5 h-2.5 rounded-full bg-gray-400"></div> Offline</div>
            </div>
        </div>
    );
};

export default AttendanceMap;
