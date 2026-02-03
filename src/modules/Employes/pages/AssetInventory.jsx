
import React, { useState, useEffect } from 'react';
import { useTheme } from '../../../context/ThemeContext';
import {
    Laptop, Smartphone, Car, Box, Search, Plus, Filter,
    MoreHorizontal, CheckCircle, AlertCircle, User, X, Tag,
    LayoutGrid, List, DollarSign, PieChart, BarChart, UserCheck, Upload, Trash2, Wrench, HardHat, Waves, Truck, Pipette, Zap, ShieldCheck, RefreshCw
} from 'lucide-react';
import axios from 'axios';
import API_BASE_URL from '../../../config/api';
import { resolveUrl } from '../../../utils/url';
import toast from 'react-hot-toast';

const ASSET_CATEGORIES = [
    "IT & Electronics", "Vehicles & Fleet", "Heavy Machinery", "Power Tools",
    "Plumbing Equipment", "Electrical Supplies", "Measurement & Testing",
    "Water Treatment", "Field Operations", "Safety & PPE", "Office Furniture",
    "Software & Licenses", "Facilities", "Kitchen & Appliances", "Cleaning Equipment",
    "Building & Construction", "Chemicals & Laboratory", "Marketing & Branding",
    "Communication & Radio", "Workshop Equipment"
];

const ASSET_TYPES = [
    "Laptop", "Smartphone", "Tablet", "Desktop PC", "Monitor", "Printer", "Server", "Router",
    "Van", "Truck", "Pickup", "Car", "Trailer", "Excavator", "Forklift", "Backhoe", "Concrete Mixer",
    "Water Pump", "Pressure Tank", "Filter System", "Generator", "Air Compressor", "Solar Panel",
    "Power Drill", "Angle Grinder", "Welding Machine", "Impact Wrench", "Jackhammer",
    "Pipe Wrench", "Tube Cutter", "Threader", "Snake / Auger", "Turbo Charger",
    "Multimeter", "Pressure Gauge", "Leak Detector", "Flow Meter", "Water Quality Tester", "pH Meter",
    "Handheld Radio", "GPS Tracker", "Drone", "Thermal Camera", "Trenching Machine",
    "Helmet", "Safety Vest", "Safety Shoes", "Gloves", "Goggles", "First Aid Kit", "Fire Extinguisher",
    "Software License", "Cloud Subscription", "Digital Key",
    "Office Chair", "Desk", "Filing Cabinet", "Conference Table",
    "Water Dispenser", "Coffee Machine", "Refrigerator", "Microwave", "Vacuum Cleaner"
];

const ASSET_BRANDS = [
    "Apple", "Samsung", "Dell", "HP", "Lenovo", "Microsoft", "Asus",
    "Toyota", "Ford", "Nissan", "Mitsubishi", "Isuzu", "Hyundai", "Caterpillar", "JCB",
    "Makita", "Bosch", "DeWalt", "Milwaukee", "Hilti", "Grundfos", "Kärcher",
    "Fluke", "Testo", "Trimble", "Garmin", "DJI", "Motorola", "Honeywell", "3M"
];

const AssetInventory = ({ employees = [] }) => {
    const { darkMode } = useTheme();
    const [filter, setFilter] = useState('All');
    const [searchTerm, setSearchTerm] = useState('');
    const [showAddModal, setShowAddModal] = useState(false);
    const [viewMode, setViewMode] = useState('grid'); // 'grid' | 'list'
    const [assets, setAssets] = useState([]);
    const [loading, setLoading] = useState(false);


    // Fetch Assets
    const fetchAssets = async () => {
        setLoading(true);
        try {
            const token = localStorage.getItem('token');
            const res = await axios.get(`${API_BASE_URL}/api/assets`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                setAssets(res.data.data);
            }
        } catch (error) {
            console.error("Fetch Assets Failed:", error);
            // toast.error("Failed to load assets");
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Are you sure you want to delete this asset?")) return;

        const toastId = toast.loading("Deleting Asset...");
        try {
            const token = localStorage.getItem('token');
            const res = await axios.delete(`${API_BASE_URL}/api/assets/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            if (res.data.success) {
                toast.success("Asset Deleted", { id: toastId });
                fetchAssets();
            }
        } catch (error) {
            console.error("Delete Asset Failed:", error);
            toast.error("Failed to delete asset", { id: toastId });
        }
    };

    useEffect(() => {
        fetchAssets();
    }, []);

    const handleQuickAssign = async (assetId, employeeId) => {
        if (!employeeId) return;
        const toastId = toast.loading("Assigning Asset...");
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/api/assets/${assetId}`, {
                status: 'Assigned',
                assigned_to: employeeId,
                assigned_date: new Date()
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Asset Assigned", { id: toastId });
            fetchAssets();
        } catch (error) {
            console.error("Assign Error:", error);
            toast.error("Assignment Failed", { id: toastId });
        }
    };

    const handleReturnAsset = async (assetId) => {
        if (!window.confirm("Return this asset to inventory?")) return;
        const toastId = toast.loading("Returning Asset...");
        try {
            const token = localStorage.getItem('token');
            await axios.put(`${API_BASE_URL}/api/assets/${assetId}`, {
                status: 'Available',
                assigned_to: null,
                assigned_date: null
            }, {
                headers: { Authorization: `Bearer ${token}` }
            });
            toast.success("Asset Returned", { id: toastId });
            fetchAssets();
        } catch (error) {
            console.error("Return Error:", error);
            toast.error("Return Failed", { id: toastId });
        }
    };

    const getIcon = (type) => {
        const t = (type || '').toLowerCase();
        if (t.includes('laptop') || t.includes('computer') || t.includes('pc')) return <Laptop size={18} />;
        if (t.includes('mobile') || t.includes('phone') || t.includes('tablet')) return <Smartphone size={18} />;
        if (t.includes('car') || t.includes('van') || t.includes('truck') || t.includes('vehicle') || t.includes('pickup')) return <Truck size={18} />;
        if (t.includes('chair') || t.includes('desk') || t.includes('furniture')) return <LayoutGrid size={18} />;
        if (t.includes('license') || t.includes('software')) return <Tag size={18} />;
        if (t.includes('tool') || t.includes('drill') || t.includes('machine') || t.includes('wrench') || t.includes('grinder')) return <Wrench size={18} />;
        if (t.includes('helmet') || t.includes('safety') || t.includes('vest') || t.includes('hat')) return <HardHat size={18} />;
        if (t.includes('water') || t.includes('pump') || t.includes('flow') || t.includes('pip')) return <Waves size={18} />;
        if (t.includes('zap') || t.includes('electr') || t.includes('solar') || t.includes('generat')) return <Zap size={18} />;
        if (t.includes('shield') || t.includes('secur') || t.includes('key')) return <ShieldCheck size={18} />;
        if (t.includes('lab') || t.includes('chem') || t.includes('pipett') || t.includes('tester')) return <Pipette size={18} />;
        return <Box size={18} />;
    };

    // Derived Stats
    const totalAssets = assets.length;
    const assignedAssets = assets.filter(a => a.status === 'Assigned').length;
    const totalValue = assets.reduce((sum, a) => sum + Number(a.cost || 0), 0).toLocaleString();

    const filteredAssets = assets.filter(asset => {
        const matchesSearch = asset.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
            (asset.serial_number && asset.serial_number.toLowerCase().includes(searchTerm.toLowerCase())) ||
            (asset.assignee && asset.assignee.name.toLowerCase().includes(searchTerm.toLowerCase()));

        const matchesFilter = filter === 'All' || asset.status === filter;

        return matchesSearch && matchesFilter;
    });

    // --- Components ---

    const StatCard = ({ title, value, icon: Icon, colorClass }) => (
        <div className={`p-5 rounded-2xl border backdrop-blur-sm transition-all hover:shadow-lg hover:-translate-y-1
            ${darkMode ? 'bg-gray-800/80 border-gray-700' : 'bg-white/80 border-gray-200'}`}>
            <div className="flex justify-between items-start">
                <div>
                    <h3 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>{value}</h3>
                    <p className={`text-xs font-medium mt-1 ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>{title}</p>
                </div>
                <div className={`p-2.5 rounded-xl ${colorClass.bg} ${colorClass.text}`}>
                    <Icon size={20} />
                </div>
            </div>
        </div>
    );

    const AddAssetModal = ({ assetToEdit, onClose }) => {
        const [formData, setFormData] = useState({
            name: assetToEdit?.name || '',
            description: assetToEdit?.description || '',
            brand: assetToEdit?.brand || '',
            model: assetToEdit?.model || '',
            serial_number: assetToEdit?.serial_number || '',
            type: assetToEdit?.type || 'Laptop',
            category: assetToEdit?.category || 'Electronics',
            cost: assetToEdit?.cost || '',
            status: assetToEdit?.status || 'Available',
            assigned_to: assetToEdit?.assigned_to || '',
            image: null // File Object
        });
        const [previewUrl, setPreviewUrl] = useState(assetToEdit?.image_url || null);
        const [uploading, setUploading] = useState(false);

        const handleFileChange = (e) => {
            const file = e.target.files[0];
            if (file) {
                setFormData({ ...formData, image: file });
                setPreviewUrl(URL.createObjectURL(file));
            }
        };

        const handleSubmit = async (e) => {
            e.preventDefault();
            setUploading(true);
            const toastId = toast.loading("Saving Asset...");

            try {
                const token = localStorage.getItem('token');

                // Use FormData for Multipart/Upload
                const data = new FormData();
                data.append('name', formData.name);
                data.append('description', formData.description);
                data.append('brand', formData.brand);
                data.append('model', formData.model);
                data.append('serial_number', formData.serial_number);
                data.append('type', formData.type);
                data.append('category', formData.category);
                data.append('cost', formData.cost);
                data.append('status', formData.status);
                if (formData.assigned_to) data.append('assigned_to', formData.assigned_to);
                if (formData.image) data.append('image', formData.image);

                if (assetToEdit) {
                    await axios.put(`${API_BASE_URL}/api/assets/${assetToEdit.id}`, data, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    toast.success("Asset Updated", { id: toastId });
                } else {
                    await axios.post(`${API_BASE_URL}/api/assets`, data, {
                        headers: {
                            Authorization: `Bearer ${token}`,
                            'Content-Type': 'multipart/form-data'
                        }
                    });
                    toast.success("Asset Created", { id: toastId });
                }

                fetchAssets(); // Refresh List
                onClose();

            } catch (error) {
                console.error("Save Asset Error:", error);
                toast.error("Failed to save asset", { id: toastId });
            } finally {
                setUploading(false);
            }
        };

        return (
            <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm animate-[fadeIn_0.2s_ease-out]" onClick={onClose}>
                <div className={`w-full max-w-2xl rounded-2xl p-6 shadow-2xl transform scale-100 transition-all max-h-[90vh] overflow-y-auto custom-scrollbar
                    ${darkMode ? 'bg-gray-800 text-white' : 'bg-white text-gray-900'}`} onClick={e => e.stopPropagation()}>

                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold flex items-center gap-2">
                            {assetToEdit ? 'Edit Asset' : <><Plus className="text-blue-500" /> Add New Asset</>}
                        </h2>
                        <button onClick={onClose} className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-full">
                            <X size={20} />
                        </button>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Suggestions Datalists */}
                        <datalist id="category-suggestions">
                            {ASSET_CATEGORIES.map(cat => <option key={cat} value={cat} />)}
                        </datalist>
                        <datalist id="type-suggestions">
                            {ASSET_TYPES.map(type => <option key={type} value={type} />)}
                        </datalist>
                        <datalist id="brand-suggestions">
                            {ASSET_BRANDS.map(brand => <option key={brand} value={brand} />)}
                        </datalist>


                        {/* Image Upload */}
                        <div className="flex justify-center mb-4">
                            <div className="relative group cursor-pointer w-full h-40 rounded-xl border-2 border-dashed border-gray-300 dark:border-gray-600 flex flex-col items-center justify-center overflow-hidden hover:border-blue-500 transition-colors">
                                {previewUrl || resolveUrl(assetToEdit?.image_url) ? (
                                    <img
                                        src={previewUrl || resolveUrl(assetToEdit?.image_url)}
                                        alt="Preview"
                                        className="w-full h-full object-contain"
                                        onError={(e) => {
                                            if (!previewUrl) {
                                                e.target.style.display = 'none';
                                                e.target.parentElement.innerHTML = '<div class="flex flex-col items-center text-gray-400"><svg class="mb-2" width="32" height="32" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="18" x="3" y="3" rx="2" ry="2"/><path d="M3 9h18"/><path d="M9 21V9"/></svg><span class="text-xs">Image Error</span></div>';
                                            }
                                        }}
                                    />
                                ) : (
                                    <div className="flex flex-col items-center text-gray-400">
                                        <Upload size={32} className="mb-2" />
                                        <span className="text-xs">Click to upload image</span>
                                    </div>
                                )}
                                <input type="file" onChange={handleFileChange} accept="image/*" className="absolute inset-0 opacity-0 cursor-pointer" />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Brand</label>
                                <input
                                    list="brand-suggestions"
                                    className={`w-full p-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500
                                    ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                    value={formData.brand}
                                    onChange={e => setFormData({ ...formData, brand: e.target.value })}
                                    placeholder="e.g. Caterpillar"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Model / Specs</label>
                                <input
                                    className={`w-full p-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500
                                    ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                    value={formData.model}
                                    onChange={e => setFormData({ ...formData, model: e.target.value })}
                                    placeholder="e.g. 320 GC"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Asset Category</label>
                                <input
                                    list="category-suggestions"
                                    className={`w-full p-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500
                                    ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                    value={formData.category}
                                    onChange={e => setFormData({ ...formData, category: e.target.value })}
                                    placeholder="Type or select category..."
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Asset Type</label>
                                <input
                                    list="type-suggestions"
                                    className={`w-full p-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500
                                    ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                    value={formData.type}
                                    onChange={e => setFormData({ ...formData, type: e.target.value })}
                                    placeholder="Type or select type..."
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Asset Name</label>
                                <input
                                    required
                                    type="text"
                                    className={`w-full p-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500
                                    ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                    value={formData.name}
                                    onChange={e => setFormData({ ...formData, name: e.target.value })}
                                    placeholder="e.g. MacBook Pro M3"
                                />
                            </div>
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Serial Number</label>
                                <input type="text" className={`w-full p-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} value={formData.serial_number} onChange={e => setFormData({ ...formData, serial_number: e.target.value })} placeholder="S/N or License Key" />
                            </div>
                        </div>

                        {/* Description Field */}
                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Description / Specs</label>
                            <textarea
                                rows="3"
                                className={`w-full p-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500
                                ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                value={formData.description}
                                onChange={e => setFormData({ ...formData, description: e.target.value })}
                                placeholder="Enter detailed specifications or notes..."
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                            <div>
                                <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Status</label>
                                <select
                                    className={`w-full p-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500
                                    ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                    value={formData.status}
                                    onChange={e => setFormData({ ...formData, status: e.target.value })}
                                >
                                    <option>Available</option>
                                    <option>Assigned</option>
                                    <option>Maintenance</option>
                                    <option>Retired</option>
                                </select>
                            </div>
                            {formData.status === 'Assigned' && (
                                <div>
                                    <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Assign To</label>
                                    <select
                                        className={`w-full p-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500
                                        ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`}
                                        value={formData.assigned_to}
                                        onChange={e => setFormData({ ...formData, assigned_to: e.target.value })}
                                    >
                                        <option value="">Select Employee</option>
                                        {employees.map(emp => (
                                            <option key={emp.id} value={emp.id}>{emp.name}</option>
                                        ))}
                                    </select>
                                </div>
                            )}
                        </div>

                        <div>
                            <label className="block text-xs font-semibold uppercase text-gray-500 mb-1">Cost (SAR)</label>
                            <input type="number" className={`w-full p-2.5 rounded-lg border text-sm outline-none focus:ring-2 focus:ring-blue-500 ${darkMode ? 'bg-gray-700 border-gray-600' : 'bg-white border-gray-300'}`} value={formData.cost} onChange={e => setFormData({ ...formData, cost: e.target.value })} />
                        </div>

                        <div className="pt-4 flex gap-3">
                            <button type="button" onClick={onClose} className="flex-1 py-2.5 rounded-xl font-semibold text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700">Cancel</button>
                            <button type="submit" disabled={uploading} className="flex-1 py-2.5 rounded-xl font-semibold bg-blue-600 text-white hover:bg-blue-700 shadow-lg shadow-blue-500/30 disabled:opacity-50">
                                {uploading ? 'Saving...' : 'Save Asset'}
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        );
    };

    const [editingAsset, setEditingAsset] = useState(null);

    return (
        <div className="h-full flex flex-col p-6 animate-[fadeIn_0.3s_ease-out] overflow-y-auto">
            {/* Header */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
                <div>
                    <h1 className={`text-2xl font-bold ${darkMode ? 'text-white' : 'text-gray-900'}`}>Asset Inventory</h1>
                    <p className={`text-sm ${darkMode ? 'text-gray-400' : 'text-gray-500'}`}>Track hardware, licenses, and office equipment</p>
                </div>
                <div className="flex items-center gap-3">
                    <div className={`flex items-center p-1 rounded-lg border ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                        <button onClick={() => setViewMode('grid')} className={`p-2 rounded-md transition-all ${viewMode === 'grid' ? (darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : 'text-gray-400'}`}><LayoutGrid size={18} /></button>
                        <button onClick={() => setViewMode('list')} className={`p-2 rounded-md transition-all ${viewMode === 'list' ? (darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-blue-600') : 'text-gray-400'}`}><List size={18} /></button>
                    </div>
                    <button
                        onClick={() => { setEditingAsset(null); setShowAddModal(true); }}
                        className="flex items-center gap-2 px-4 py-2.5 bg-blue-600 text-white rounded-lg font-medium hover:bg-blue-700 shadow-lg shadow-blue-500/30 transition-all"
                    >
                        <Plus size={18} /> Add Asset
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
                <StatCard title="Total Assets" value={totalAssets} icon={Box} colorClass={{ bg: 'bg-blue-100 dark:bg-blue-900/40', text: 'text-blue-600 dark:text-blue-400' }} />
                <StatCard title="Assigned Assets" value={assignedAssets} icon={UserCheck} colorClass={{ bg: 'bg-purple-100 dark:bg-purple-900/40', text: 'text-purple-600 dark:text-purple-400' }} />
                <StatCard title="Total Value (SAR)" value={totalValue} icon={DollarSign} colorClass={{ bg: 'bg-green-100 dark:bg-green-900/40', text: 'text-green-600 dark:text-green-400' }} />
            </div>

            {/* Filters */}
            <div className="flex flex-col md:flex-row gap-4 mb-6">
                <div className={`flex-1 relative rounded-lg border flex items-center px-3 gap-2 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <Search size={18} className="text-gray-400" />
                    <input type="text" placeholder="Search assets..." className="flex-1 bg-transparent py-2.5 outline-none text-sm" value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} />
                </div>
                <div className={`flex rounded-lg border p-1 ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    {['All', 'Available', 'Assigned'].map(f => (
                        <button key={f} onClick={() => setFilter(f)} className={`px-4 py-1.5 rounded-md text-sm font-medium transition-all ${filter === f ? (darkMode ? 'bg-gray-700 text-white' : 'bg-gray-100 text-gray-900 shadow-sm') : 'text-gray-400 hover:text-gray-500'}`}>{f}</button>
                    ))}
                </div>
            </div>

            {/* Grid View */}
            {viewMode === 'grid' && (
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 pb-20">
                    {filteredAssets.map(asset => (
                        <div key={asset.id} className={`rounded-2xl border overflow-hidden group hover:-translate-y-1 transition-all duration-300 hover:shadow-xl flex flex-col
                            ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>

                            {/* Image Area */}
                            <div className="h-40 bg-gray-100 dark:bg-gray-900 relative overflow-hidden">
                                {resolveUrl(asset.image_url) ? (
                                    <img src={resolveUrl(asset.image_url)} alt={asset.name} className="w-full h-full object-cover" />
                                ) : (
                                    <div className="w-full h-full flex items-center justify-center text-gray-300">
                                        <Box size={48} />
                                    </div>
                                )}
                                <div className={`absolute top-3 right-3 px-2 py-1 rounded-full text-[10px] font-bold uppercase tracking-wide backdrop-blur-md
                                    ${asset.status === 'Available' ? 'bg-green-500/90 text-white' : 'bg-blue-500/90 text-white'}`}>
                                    {asset.status}
                                </div>
                            </div>

                            {/* Content */}
                            <div className="p-4 flex-1 flex flex-col">
                                <div className="flex justify-between items-start mb-2">
                                    <h3 className={`font-bold text-lg truncate pr-2 ${darkMode ? 'text-white' : 'text-gray-900'}`}>{asset.name}</h3>
                                    <span className={`text-xs font-mono px-1.5 py-0.5 rounded border ${darkMode ? 'border-gray-600 text-gray-400' : 'border-gray-200 text-gray-500'}`}>
                                        {asset.serial_number ? asset.serial_number.slice(-4) : 'N/A'}
                                    </span>
                                </div>
                                {asset.brand && <p className="text-xs font-semibold text-blue-500 mb-1">{asset.brand} {asset.model}</p>}
                                <p className="text-xs text-gray-500 mb-2">{(asset.category || 'General')} • {(asset.type || 'Other')}</p>

                                {/* Description Truncated */}
                                <p className="text-xs text-gray-400 mb-4 line-clamp-2 h-8">{asset.description || "No description provided."}</p>

                                <div className={`p-3 rounded-xl mb-4 flex items-center gap-3 ${darkMode ? 'bg-gray-700/50' : 'bg-gray-50'}`}>
                                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold shadow-sm border overflow-hidden
                                        ${darkMode ? 'bg-gray-600 border-gray-500 text-gray-300' : 'bg-white border-white text-gray-600'}`}>
                                        {resolveUrl(asset.assignee?.avatar_url || asset.assignee?.avatar) ? (
                                            <img src={resolveUrl(asset.assignee?.avatar_url || asset.assignee?.avatar)} className="w-full h-full object-cover" />
                                        ) : (
                                            <span>{asset.assignee ? asset.assignee.name.charAt(0) : <User size={14} />}</span>
                                        )}
                                    </div>
                                    <div className="flex-1 min-w-0">
                                        <p className="text-[10px] uppercase text-gray-500 font-semibold">Assigned To</p>
                                        {asset.status === 'Available' ? (
                                            <select
                                                className="w-full bg-transparent text-sm font-medium border-0 focus:ring-0 p-0 text-blue-500 cursor-pointer"
                                                onChange={(e) => handleQuickAssign(asset.id, e.target.value)}
                                                value=""
                                            >
                                                <option value="" disabled>Click to Assign</option>
                                                {employees.map(emp => (
                                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="flex justify-between items-center group/assignee">
                                                <p className={`text-sm font-medium truncate ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>
                                                    {asset.assignee ? asset.assignee.name : 'Not Assigned'}
                                                </p>
                                                <button onClick={() => handleReturnAsset(asset.id)} className="opacity-0 group-hover/assignee:opacity-100 p-1 text-gray-400 hover:text-orange-500 transition-opacity">
                                                    <RefreshCw size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div className="mt-auto flex justify-between items-center pt-2 border-t dark:border-gray-700">
                                    <span className="font-bold text-sm text-green-600">SAR {Number(asset.cost).toLocaleString()}</span>
                                    <div className="flex items-center gap-3">
                                        <button
                                            onClick={() => { setEditingAsset(asset); setShowAddModal(true); }}
                                            className="text-xs font-medium text-blue-500 hover:underline">
                                            Edit
                                        </button>
                                        <button
                                            onClick={() => handleDelete(asset.id)}
                                            className="p-1.5 rounded-lg text-red-400 hover:bg-red-50 dark:hover:bg-red-900/20 transition-colors">
                                            <Trash2 size={14} />
                                        </button>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}

            {/* List View (Table) */}
            {viewMode === 'list' && (
                <div className={`rounded-xl border overflow-hidden flex-1 flex flex-col shadow-sm ${darkMode ? 'bg-gray-800 border-gray-700' : 'bg-white border-gray-200'}`}>
                    <div className="overflow-x-auto">
                        <table className="w-full text-left border-collapse">
                            <thead>
                                <tr className={`text-xs uppercase tracking-wider border-b ${darkMode ? 'bg-gray-900/50 text-gray-400 border-gray-700' : 'bg-gray-50 text-gray-500 border-gray-100'}`}>
                                    {["Asset Details", "Brand / Model", "Category / Type", "Cost", "Status", "Assigned To"].map(h => <th key={h} className="p-4 font-semibold">{h}</th>)}
                                    <th className="p-4 font-semibold text-right">Actions</th>
                                </tr>
                            </thead>
                            <tbody className="divide-y divide-gray-100 dark:divide-gray-700">
                                {filteredAssets.map(asset => <tr key={asset.id} className={`group transition-colors ${darkMode ? 'hover:bg-gray-700/50' : 'hover:bg-gray-50'}`}>
                                    <td className="p-4">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-10 h-10 rounded-lg overflow-hidden bg-gray-100 flex-shrink-0 flex items-center justify-center ${darkMode ? 'bg-gray-800' : ''}`}>
                                                {resolveUrl(asset.image_url) ? (
                                                    <img src={resolveUrl(asset.image_url)} className="w-full h-full object-cover" alt="" />
                                                ) : (
                                                    <div className="text-gray-400">{getIcon(asset.type)}</div>
                                                )}
                                            </div>
                                            <div>
                                                <div className={`font-semibold text-sm ${darkMode ? 'text-white' : 'text-gray-900'}`}>{asset.name}</div>
                                                <div className="text-[10px] text-gray-500 font-mono">{asset.serial_number || 'No S/N'}</div>
                                            </div>
                                        </div>
                                    </td>
                                    <td className="p-4">
                                        <div className={`font-medium text-sm ${darkMode ? 'text-gray-200' : 'text-gray-800'}`}>{asset.brand || '-'}</div>
                                        <div className="text-xs text-gray-500">{asset.model || '-'}</div>
                                    </td>
                                    <td className="p-4">
                                        <div className={`text-sm ${darkMode ? 'text-gray-300' : 'text-gray-600'}`}>{asset.category || 'General'}</div>
                                        <div className="text-[10px] uppercase font-bold text-gray-400">{asset.type || 'Other'}</div>
                                    </td>
                                    <td className="p-4 text-sm font-medium text-green-600 font-mono">SAR {Number(asset.cost).toLocaleString()}</td>
                                    <td className="p-4"><span className={`px-2 py-1 rounded-full text-[10px] font-bold uppercase ${asset.status === 'Available' ? 'bg-green-100 text-green-700' : asset.status === 'Assigned' ? 'bg-blue-100 text-blue-700' : 'bg-amber-100 text-amber-700'}`}>{asset.status}</span></td>
                                    <td className="p-4 text-sm text-gray-500">
                                        {asset.status === 'Available' ? (
                                            <select
                                                className="bg-transparent border-0 text-blue-500 font-medium cursor-pointer"
                                                onChange={(e) => handleQuickAssign(asset.id, e.target.value)}
                                                value=""
                                            >
                                                <option value="" disabled>Assign...</option>
                                                {employees.map(emp => (
                                                    <option key={emp.id} value={emp.id}>{emp.name}</option>
                                                ))}
                                            </select>
                                        ) : (
                                            <div className="flex items-center gap-2 group/listassign">
                                                <span>{asset.assignee ? asset.assignee.name : '-'}</span>
                                                <button onClick={() => handleReturnAsset(asset.id)} className="opacity-0 group-hover/listassign:opacity-100 p-1 text-gray-400 hover:text-orange-500" title="Return">
                                                    <RefreshCw size={12} />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                    <td className="p-4 text-right">
                                        <div className="flex justify-end items-center gap-2">
                                            <button onClick={() => { setEditingAsset(asset); setShowAddModal(true); }} className="p-2 text-gray-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/20 rounded-lg transition-all" title="Edit"><MoreHorizontal size={18} /></button>
                                            <button onClick={() => handleDelete(asset.id)} className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/20 rounded-lg transition-all" title="Delete"><Trash2 size={16} /></button>
                                        </div>
                                    </td>
                                </tr>)}
                            </tbody>
                        </table>
                    </div>
                </div>
            )}

            {filteredAssets.length === 0 && (
                <div className="flex-1 flex flex-col items-center justify-center p-12 text-gray-500">
                    <Box size={48} className="mb-4 opacity-20" />
                    <p>No assets found.</p>
                </div>
            )}

            {showAddModal && <AddAssetModal assetToEdit={editingAsset} onClose={() => { setShowAddModal(false); setEditingAsset(null); }} />}
        </div>
    );
};

export default AssetInventory;
