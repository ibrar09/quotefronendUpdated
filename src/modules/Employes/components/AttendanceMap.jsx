import React, { useState, useEffect } from 'react';
import { MapContainer, TileLayer, Marker, Popup, useMap } from 'react-leaflet';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import { ShieldCheck, Plus, Minus, Layers, Maximize, Target } from 'lucide-react';
import {
    LEAFLET_TILE_DARK, LEAFLET_TILE_LIGHT,
    LEAFLET_ICON_RETINA, LEAFLET_ICON_DEFAULT, LEAFLET_ICON_SHADOW
} from '../../../config/constants';
import API_BASE_URL from '../../../config/api';
import { resolveUrl } from '../../../utils/url';

// Fix for default marker icons in Leaflet
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
    iconRetinaUrl: LEAFLET_ICON_RETINA,
    iconUrl: LEAFLET_ICON_DEFAULT,
    shadowUrl: LEAFLET_ICON_SHADOW,
});

// Helper to recenter map smoothly
const MapRecenter = ({ center, markers }) => {
    const map = useMap();

    useEffect(() => {
        if (center && center[0] && center[1]) {
            map.flyTo(center, 15, { duration: 1.5 });
        }
    }, [center, map]);

    return null;
};

// Internal Controls for Zoom and Fit
const MapControls = ({ onFitAll, onZoomIn, onZoomOut }) => {
    const map = useMap();
    return null; // This component handles side effects or exposure if needed, but here we'll use a different pattern
};

// We need a way to trigger actions on the map from outside or via refs, 
// but in Leaflet with React, a Helper component is often cleanest.
const MapActions = ({ triggerFitAll, markers }) => {
    const map = useMap();

    useEffect(() => {
        if (triggerFitAll && markers && markers.length > 0) {
            const group = new L.featureGroup(markers.map(m => L.marker([m.lat, m.lng])));
            map.fitBounds(group.getBounds().pad(0.1), { duration: 1.5 });
        }
    }, [triggerFitAll, markers, map]);

    return null;
};

const AttendanceMap = ({ darkMode, data, selectedEmployee }) => {
    const [mapStyle, setMapStyle] = useState('roadmap');
    const [showGeofence, setShowGeofence] = useState(true);
    const [fitAllTrigger, setFitAllTrigger] = useState(0);
    const [mapInstance, setMapInstance] = useState(null);

    const activeMarkers = data.filter(e => e.lat && e.lng);


    return (
        <div className="w-full h-full min-h-[600px] flex flex-col pt-0">
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

                    {/* Fit All Button */}
                    <button
                        onClick={() => setFitAllTrigger(prev => prev + 1)}
                        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-blue-600 hover:bg-blue-50 dark:hover:bg-gray-700 transition-colors"
                        title="Fit All Markers"
                    >
                        <Target size={20} />
                    </button>

                    <button
                        onClick={() => mapInstance?.zoomIn()}
                        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
                        <Plus size={20} />
                    </button>
                    <button
                        onClick={() => mapInstance?.zoomOut()}
                        className="p-2 bg-white dark:bg-gray-800 rounded-lg shadow-lg text-gray-600 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-700 transition-colors">
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
                        whenCreated={setMapInstance}
                        ref={setMapInstance}
                    >
                        <TileLayer
                            url={darkMode
                                ? LEAFLET_TILE_DARK
                                : LEAFLET_TILE_LIGHT
                            }
                            attribution='&copy; OpenStreetMap contributors'
                        />

                        <MapRecenter center={selectedEmployee ? [selectedEmployee.lat, selectedEmployee.lng] : null} />
                        <MapActions triggerFitAll={fitAllTrigger} markers={activeMarkers} />

                        {activeMarkers.map((emp) => (
                            <Marker
                                key={emp.id}
                                position={[emp.lat, emp.lng]}
                                icon={L.divIcon({
                                    className: 'custom-div-icon',
                                    html: `
                                        <div class="relative group">
                                            <div class="w-12 h-12 rounded-full border-4 shadow-2xl overflow-hidden relative z-20 flex items-center justify-center transition-all duration-300
                                                ${darkMode ? 'border-gray-800' : 'border-white'}
                                                ${emp.onlineStatus === 'Online' ? (darkMode ? 'ring-2 ring-green-500 shadow-[0_0_15px_rgba(34,197,94,0.6)]' : 'ring-2 ring-green-400 shadow-[0_0_15px_rgba(34,197,94,0.4)]') : ''}
                                                ${emp.status === 'LATE' ? 'bg-orange-100' : 'bg-blue-100'}">
                                                ${resolveUrl(emp.avatar)
                                            ? `<img src="${resolveUrl(emp.avatar)}" class="w-full h-full object-cover"/>`
                                            : `<span class="font-bold text-gray-700 text-sm">${emp.name.charAt(0)}</span>`
                                        }
                                            </div>
                                            <div class="absolute -bottom-1 left-1/2 transform -translate-x-1/2 w-4 h-4 rotate-45 z-10
                                                ${darkMode ? 'bg-gray-800' : 'bg-white'}"></div>
                                            <div class="absolute -top-0.5 -right-0.5 w-4.5 h-4.5 border-[2.5px] rounded-full z-30 shadow-md
                                                ${darkMode ? 'border-gray-800' : 'border-white'}
                                                ${emp.onlineStatus === 'Online' ? 'bg-[#22C55E] shadow-[0_0_12px_rgba(34,197,94,0.9)] animate-[pulse_1.5s_infinite]' : 'bg-gray-400'}"></div>
                                        </div>
                                    `,
                                    iconSize: [48, 48],
                                    iconAnchor: [24, 48]
                                })}
                            >
                                <Popup>
                                    <div className="p-2 min-w-[150px]">
                                        <div className="flex items-center gap-3 mb-2">
                                            <div className="w-10 h-10 rounded-full bg-blue-100 flex items-center justify-center font-bold overflow-hidden border border-blue-200">
                                                {resolveUrl(emp.avatar) ? (
                                                    <img src={resolveUrl(emp.avatar)} className="w-full h-full object-cover" />
                                                ) : emp.name.charAt(0)}
                                            </div>
                                            <div>
                                                <div className="font-bold text-sm text-blue-900">{emp.name}</div>
                                                <div className="text-[10px] text-gray-500 uppercase font-black">{emp.role}</div>
                                            </div>
                                        </div>
                                        <div className="space-y-1.5 text-xs">
                                            <div className="flex justify-between items-center pb-1 border-b border-gray-100">
                                                <span className="text-gray-500">Status:</span>
                                                <span className={`font-bold ${emp.status === 'PRESENT' ? 'text-green-600' : 'text-orange-600'}`}>{emp.status}</span>
                                            </div>
                                            <div className="flex justify-between items-center">
                                                <span className="text-gray-500">Check-In:</span>
                                                <span className="font-mono">{emp.timeIn}</span>
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
