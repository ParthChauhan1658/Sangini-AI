import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Trash2, Camera, Settings as SettingsIcon, MonitorPlay } from 'lucide-react';

const BACKEND = "http://localhost:5000";

const CameraManagement = () => {
    const [cameras, setCameras] = useState([]);
    const [newCam, setNewCam] = useState({ name: '', source: '', lat: '', lng: '' });
    const [loading, setLoading] = useState(false);

    const fetchCameras = async () => {
        try {
            const res = await axios.get(`${BACKEND}/cameras`);
            setCameras(res.data);
        } catch (err) { console.error(err); }
    };

    useEffect(() => { fetchCameras(); }, []);

    const handleAdd = async (e) => {
        e.preventDefault();
        if (!newCam.name || !newCam.source) return;
        setLoading(true);
        try {
            await axios.post(`${BACKEND}/cameras`, newCam);
            setNewCam({ name: '', source: '', lat: '', lng: '' });
            fetchCameras();
        } catch (err) { alert("Failed to add camera"); }
        setLoading(false);
    };

    const handleRemove = async (id) => {
        if (!confirm("Remove this camera?")) return;
        try {
            await axios.delete(`${BACKEND}/cameras/${id}`);
            fetchCameras();
        } catch (err) { alert("Failed to remove"); }
    };

    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="flex items-center justify-between mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Camera Management</h2>
                    <p className="text-gray-400 text-sm">Configure active surveillance nodes.</p>
                </div>
                <div className="bg-[#1c2630] px-4 py-2 rounded border border-[#23303d] text-sm text-gray-300">
                    Active Nodes: <span className="text-[#0ea5e9] font-bold">{cameras.length}</span>
                </div>
            </div>

            {/* Add Camera Form */}
            <div className="panel p-6 mb-8">
                <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Plus size={20} className="text-[#0ea5e9]" /> Add New Node
                </h3>
                <form onSubmit={handleAdd} className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-4">
                    <input
                        type="text"
                        placeholder="Camera Name (e.g. Main Gate)"
                        className="bg-[#0b1116] border border-[#23303d] text-white p-3 rounded focus:border-[#0ea5e9] outline-none"
                        value={newCam.name}
                        onChange={e => setNewCam({ ...newCam, name: e.target.value })}
                    />
                    <input
                        type="text"
                        placeholder="Source (RTSP / 0 for Webcam / YouTube)"
                        className="bg-[#0b1116] border border-[#23303d] text-white p-3 rounded focus:border-[#0ea5e9] outline-none"
                        value={newCam.source}
                        onChange={e => setNewCam({ ...newCam, source: e.target.value })}
                    />
                    <input
                        type="number"
                        step="any"
                        placeholder="Latitude (e.g. 28.6139)"
                        className="bg-[#0b1116] border border-[#23303d] text-white p-3 rounded focus:border-[#0ea5e9] outline-none"
                        value={newCam.lat}
                        onChange={e => setNewCam({ ...newCam, lat: e.target.value })}
                    />
                    <input
                        type="number"
                        step="any"
                        placeholder="Longitude (e.g. 77.2090)"
                        className="bg-[#0b1116] border border-[#23303d] text-white p-3 rounded focus:border-[#0ea5e9] outline-none"
                        value={newCam.lng}
                        onChange={e => setNewCam({ ...newCam, lng: e.target.value })}
                    />
                    <button
                        type="submit"
                        disabled={loading}
                        className="bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold p-3 rounded transition-colors"
                    >
                        {loading ? 'Adding...' : 'Add Camera'}
                    </button>
                </form>
            </div>

            {/* Camera List */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {cameras.map(cam => (
                    <div key={cam.id} className="panel p-0 overflow-hidden group">
                        <div className="h-40 bg-black relative flex items-center justify-center border-b border-[#23303d]">
                            <MonitorPlay size={40} className="text-[#23303d]" />
                            <div className="absolute top-2 right-2 flex gap-2">
                                <span className="bg-green-500/20 text-green-500 text-[10px] px-2 py-0.5 rounded font-bold uppercase">Online</span>
                            </div>
                        </div>
                        <div className="p-4">
                            <div className="flex justify-between items-start mb-2">
                                <div>
                                    <h4 className="text-white font-semibold text-lg">{cam.name}</h4>
                                    <p className="text-xs text-gray-500 font-mono truncate max-w-[200px]">{cam.source}</p>
                                </div>
                                <SettingsIcon size={16} className="text-gray-500 cursor-pointer hover:text-white" />
                            </div>

                            <div className="flex gap-2 mt-4">
                                <div className="flex-1 text-xs text-gray-400 grid grid-cols-2 gap-1">
                                    <span className={cam.settings?.violence ? "text-red-400" : "text-gray-600"}>Violence: {cam.settings?.violence ? 'ON' : 'OFF'}</span>
                                    <span className={cam.settings?.face ? "text-orange-400" : "text-gray-600"}>Face: {cam.settings?.face ? 'ON' : 'OFF'}</span>
                                </div>
                                <button
                                    onClick={() => handleRemove(cam.id)}
                                    className="text-red-500 hover:bg-red-500/10 p-2 rounded transition-colors"
                                >
                                    <Trash2 size={18} />
                                </button>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default CameraManagement;
