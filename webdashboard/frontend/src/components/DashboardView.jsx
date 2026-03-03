import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { Shield, Activity, Bell, Map, ChevronRight, Phone, Siren, Maximize2 } from 'lucide-react';
import { LineChart, Line, ResponsiveContainer } from 'recharts';

const BACKEND = "http://localhost:5000";

const DashboardView = () => {
    const [alerts, setAlerts] = useState([]);
    const [cameras, setCameras] = useState([]);
    const [stats, setStats] = useState({ violence: 0, criminal: 0, gender_counts: {} });
    const [loading, setLoading] = useState(true);

    // Mock Data for "Camera Map" Chart
    const mockMapData = [
        { name: 'A', x: 20, y: 50 },
        { name: 'B', x: 40, y: 30 },
        { name: 'C', x: 60, y: 70 },
        { name: 'D', x: 80, y: 40 },
    ];

    const fetchData = async () => {
        try {
            // Parallel fetch for speed
            const [alertsRes, statsRes, camRes] = await Promise.all([
                axios.get(`${BACKEND}/alerts`).catch(() => ({ data: [] })),
                axios.get(`${BACKEND}/stats`).catch(() => ({ data: { violence: 0, criminal: 0, gender_counts: {} } })),
                axios.get(`${BACKEND}/cameras`).catch(() => ({ data: [] }))
            ]);
            setAlerts(alertsRes.data);
            setStats(statsRes.data);
            setCameras(camRes.data);
        } catch (e) { console.error(e); }
    };

    useEffect(() => {
        fetchData();
        const timer = setInterval(fetchData, 2000);
        return () => clearInterval(timer);
    }, []);

    const toggleSetting = async (id, key, val) => {
        try {
            await axios.post(`${BACKEND}/cameras/${id}/settings`, { [key]: val });
            // Optimistic update or wait for refetch (fetchData loop will catch it)
            setCameras(prev => prev.map(c => c.id === id ? { ...c, settings: { ...c.settings, [key]: val } } : c));
        } catch (e) { console.error(e); }
    };

    const handleEnableToggle = (id, enabled) => {
        // Optimistic update
        setCameras(prev => prev.map(c => c.id === id ? { ...c, enabled } : c));
    };

    return (
        <div className="h-full w-full flex bg-[#0b0e14]">

            {/* CENTER PANEL: LIVE MONITOR (Grid) */}
            <div className="flex-1 flex flex-col p-6 min-w-0 border-r border-[#1c232b]">
                <div className="flex justify-between items-end mb-6">
                    <div>
                        <h1 className="text-3xl font-bold text-white mb-1">Live Monitor</h1>
                        <p className="text-gray-400 text-sm">Real-time surveillance across <span className="text-white font-mono">{cameras.length}</span> active cameras</p>
                    </div>
                    <div className="flex gap-4 text-xs font-mono">
                        <div className="flex items-center gap-2 text-emerald-500">
                            <span className="w-2 h-2 rounded-full bg-emerald-500"></span> {cameras.length} Normal
                        </div>
                        <div className="flex items-center gap-2 text-rose-500">
                            <span className="w-2 h-2 rounded-full bg-rose-500 animate-pulse"></span> {alerts.length} Alert
                        </div>
                    </div>
                </div>

                {/* Camera Grid */}
                <div className="flex-1 overflow-y-auto grid grid-cols-1 xl:grid-cols-2 gap-6 custom-scrollbar pr-2">
                    {cameras.length === 0 && (
                        <div className="col-span-full h-64 flex items-center justify-center border-2 border-dashed border-[#1c232b] rounded-xl text-gray-500">
                            No active cameras. Add via Management Panel.
                        </div>
                    )}
                    {cameras.map((cam, idx) => (
                        <SafeCityCamCard key={cam.id} cam={cam} idx={idx} onToggle={toggleSetting} onEnableToggle={handleEnableToggle} />
                    ))}
                </div>
            </div>

            {/* RIGHT PANEL: INTELLIGENCE */}
            <div className="w-96 flex-shrink-0 bg-[#0b0e14] flex flex-col border-l border-[#1c232b]">
                <div className="p-6 border-b border-[#1c232b]">
                    <h3 className="font-bold text-white flex items-center gap-2">
                        <Activity size={18} className="text-emerald-400" />
                        Real-Time Intelligence
                    </h3>
                </div>

                <div className="p-6 flex-1 overflow-y-auto custom-scrollbar space-y-6">

                    {/* Status Block */}
                    <div className="grid grid-cols-2 gap-4">
                        <div className="bg-[#11161d] p-4 rounded-lg border border-[#1c232b]">
                            <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">System Status</p>
                            <p className="text-xl font-bold text-emerald-500">Online</p>
                        </div>
                        <div className="bg-[#11161d] p-4 rounded-lg border border-[#1c232b]">
                            <p className="text-[10px] uppercase text-gray-500 font-bold mb-1">Active Cameras</p>
                            <p className="text-xl font-bold text-[#38bdf8] font-mono">{cameras.length}</p>
                        </div>
                    </div>

                    {/* Alert Feed */}
                    <div>
                        <div className="flex justify-between items-center mb-3">
                            <h4 className="text-sm font-bold text-gray-300 flex items-center gap-2">
                                <Bell size={14} className="text-amber-500" /> Alert Feed
                            </h4>
                            <span className="text-[10px] text-gray-500">{alerts.length} active</span>
                        </div>
                        <div className="space-y-2">
                            {alerts.slice(0, 5).map((alert, i) => (
                                <div key={i} className={`p-3 rounded border text-xs relative overflow-hidden group cursor-pointer transition-all hover:translate-x-1 ${alert.level === 'danger' ? 'bg-[#1f1212] border-[#451a1a] text-rose-400' : 'bg-[#1a1710] border-[#3f2c10] text-amber-400'
                                    }`}>
                                    <div className="flex justify-between mb-1">
                                        <span className="font-bold">{alert.level === 'danger' ? 'Violence Score Spike' : 'Unusual Activity'}</span>
                                        <ChevronRight size={12} className="opacity-50 group-hover:opacity-100" />
                                    </div>
                                    <div className="flex items-center gap-2 text-[10px] opacity-70">
                                        <span className="w-1.5 h-1.5 rounded-full bg-current"></span>
                                        {alert.source || "Unknown Cam"}
                                        <span className="ml-auto font-mono">{alert.timestamp.split(" ")[1]}</span>
                                    </div>
                                </div>
                            ))}
                            {alerts.length === 0 && <p className="text-xs text-gray-600 italic">No active alerts</p>}
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
};

// --- Sub Components ---

const SafeCityCamCard = ({ cam, idx, onToggle, onEnableToggle }) => {
    // Use backend enabled state, default to true if not set
    const disabled = cam.enabled === false;
    // Alert only shows if violence is detected by backend (returned in alerts feed)
    const isAlert = false; // TODO: Connect to actual backend alert state per camera

    const handleEnableToggle = async () => {
        const newEnabled = !cam.enabled;
        try {
            await axios.post(`${BACKEND}/cameras/${cam.id}/enable`, { enabled: newEnabled });
            if (onEnableToggle) onEnableToggle(cam.id, newEnabled);
        } catch (e) { console.error(e); }
    };

    return (
        <div className={`rounded-lg border bg-[#11161d] overflow-hidden flex flex-col relative group transition-all duration-300 ${disabled ? 'opacity-50' : ''} ${isAlert ? 'border-rose-500/50 shadow-[0_0_20px_rgba(244,63,94,0.1)]' : 'border-[#1c232b] hover:border-[#38bdf8]/30'
            }`}>
            {/* Header */}
            <div className="p-3 flex justify-between items-center bg-[#151b24] border-b border-[#1c232b]">
                <div className="flex gap-3 items-center">
                    <button
                        onClick={handleEnableToggle}
                        className={`p-1.5 rounded transition-all ${disabled ? 'bg-gray-600/20 text-gray-500' : 'bg-emerald-500/20 text-emerald-500 hover:bg-emerald-500/30'}`}
                        title={disabled ? "Enable Camera" : "Disable Camera"}
                    >
                        <Phone size={12} />
                    </button>
                    <span className="text-[10px] font-mono text-gray-500">CAM-{String(idx + 1).padStart(3, '0')}</span>
                    <span className="text-xs font-bold text-gray-200">{cam.name}</span>
                </div>
                {disabled ? (
                    <span className="bg-gray-500/20 text-gray-500 text-[10px] font-bold px-2 py-0.5 rounded border border-gray-500/20">
                        DISABLED
                    </span>
                ) : isAlert ? (
                    <span className="bg-rose-500/20 text-rose-500 text-[10px] font-bold px-2 py-0.5 rounded border border-rose-500/20 animate-pulse">
                        ⚠ ALERT
                    </span>
                ) : (
                    <span className="bg-emerald-500/10 text-emerald-500 text-[10px] font-bold px-2 py-0.5 rounded border border-emerald-500/20 flex items-center gap-1">
                        <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse"></span> LIVE
                    </span>
                )}
            </div>

            {/* Video Area */}
            <div className="relative aspect-video bg-black flex items-center justify-center overflow-hidden">
                {disabled ? (
                    <div className="flex flex-col items-center justify-center text-gray-500">
                        <Phone size={40} className="mb-2 opacity-50" />
                        <span className="text-sm font-bold">FEED PAUSED</span>
                    </div>
                ) : (
                    <img
                        src={`${BACKEND}/video_feed/${cam.id}`}
                        className="w-full h-full object-contain"
                        onError={(e) => {
                            e.target.onerror = null;
                            e.target.src = "https://via.placeholder.com/640x360/000000/333333?text=NO+SIGNAL";
                        }}
                    />
                )}

                {/* HUD Overlay (SafeCity Style) */}
                <div className="absolute inset-4 border border-white/10 rounded pointer-events-none">
                    <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-white/30"></div>
                    <div className="absolute top-0 right-0 w-2 h-2 border-t-2 border-r-2 border-white/30"></div>
                    <div className="absolute bottom-0 left-0 w-2 h-2 border-b-2 border-l-2 border-white/30"></div>
                    <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-white/30"></div>
                </div>

                {isAlert && !disabled && (
                    <div className="absolute inset-0 flex items-center justify-center bg-rose-500/10">
                        <div className="border border-rose-500 bg-rose-500/20 px-4 py-2 rounded text-rose-500 font-bold tracking-widest animate-pulse backdrop-blur-sm">
                            VIOLENCE DETECTED
                        </div>
                    </div>
                )}
            </div>

            {/* Actions / Toggles */}
            <div className="p-3 bg-[#151b24] border-t border-[#1c232b]">
                <div className="flex items-center justify-between">
                    <div className="flex gap-2">
                        <ToggleBtn
                            label="Violence"
                            active={cam.settings?.violence}
                            color="text-rose-500"
                            onClick={() => onToggle(cam.id, 'violence', !cam.settings?.violence)}
                        />
                        <ToggleBtn
                            label="Face"
                            active={cam.settings?.face}
                            color="text-orange-500"
                            onClick={() => onToggle(cam.id, 'face', !cam.settings?.face)}
                        />
                        <ToggleBtn
                            label="Gender"
                            active={cam.settings?.gender}
                            color="text-blue-500"
                            onClick={() => onToggle(cam.id, 'gender', !cam.settings?.gender)}
                        />
                    </div>
                    <span className="text-[10px] font-mono text-gray-600">ID: {cam.id.split('_')[1]}</span>
                </div>
            </div>
        </div>
    )
}

const ToggleBtn = ({ label, active, color, onClick }) => (
    <button
        onClick={onClick}
        className={`px-2 py-1 rounded text-[10px] font-bold border transition-all ${active
            ? `bg-[#0b0e14] ${color} border-${color.split('-')[1]}-500/30 shadow-[0_0_10px_rgba(0,0,0,0.5)]`
            : 'bg-transparent text-gray-600 border-transparent hover:bg-[#1c232b]'
            }`}
    >
        <div className="flex items-center gap-1">
            <div className={`w-1.5 h-1.5 rounded-full ${active ? 'bg-current' : 'bg-gray-600'}`}></div>
            {label}
        </div>
    </button>
);

// Add toggleSetting helper to DashboardView
const toggleSetting = async (id, key, val) => {
    try {
        await axios.post(`${BACKEND}/cameras/${id}/settings`, { [key]: val });
    } catch (e) { console.error(e); }
};

export default DashboardView;
