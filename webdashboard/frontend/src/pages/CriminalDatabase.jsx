import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Plus, Search, UserX } from 'lucide-react';

const BACKEND = "http://localhost:5000";

const CriminalDatabase = () => {
    const [criminals, setCriminals] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchCriminals();
    }, []);

    const fetchCriminals = async () => {
        try {
            const res = await axios.get(`${BACKEND}/criminals`);
            setCriminals(res.data);
        } catch (err) { console.error(err); }
    }

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const formData = new FormData();
        formData.append('file', file);

        setLoading(true);
        try {
            await axios.post(`${BACKEND}/criminals`, formData);
            fetchCriminals();
        } catch (err) { alert("Upload Failed"); }
        setLoading(false);
    };

    return (
        <div className="p-8 h-full overflow-y-auto">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white">Criminal Database</h2>
                    <p className="text-gray-400 text-sm">Manage known entities and watchlists.</p>
                </div>
                <label className="btn bg-[#0ea5e9] hover:bg-[#0284c7] text-white cursor-pointer relative overflow-hidden">
                    <Plus size={18} /> Add Suspect
                    <input type="file" className="hidden" accept="image/*" onChange={handleUpload} disabled={loading} />
                </label>
            </div>

            {/* Search / Filter Bar */}
            <div className="mb-6 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={20} />
                <input
                    type="text"
                    placeholder="Search database..."
                    className="w-full bg-[#111820] border border-[#23303d] rounded-lg pl-10 pr-4 py-3 text-white focus:border-[#0ea5e9] outline-none"
                />
            </div>

            {/* Grid */}
            <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-5 gap-6">
                {criminals.map((filename, idx) => (
                    <div key={idx} className="panel group overflow-hidden hover:border-[#0ea5e9] transition-colors cursor-pointer">
                        <div className="aspect-square bg-black relative">
                            {/* Since we don't have a static file server for these easily, we rely on local paths or need a serve route. 
                            For now assuming they are just names or we add a route `GET /criminal_image/<name>` 
                            Wait, simple `src` for local files won't work in browser if not served.
                            I should add a route to serve these images in backend/app.py later.
                            For now using placeholder or assuming user setup. 
                        */}
                            <img
                                src="https://via.placeholder.com/150?text=Restricted"
                                alt={filename}
                                className="w-full h-full object-cover opacity-60 group-hover:opacity-100 transition-opacity grayscale group-hover:grayscale-0"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 to-transparent"></div>
                            <div className="absolute bottom-3 left-3">
                                <p className="text-white font-bold text-sm truncate w-32">{filename}</p>
                                <p className="text-[10px] text-red-400 uppercase tracking-widest">High Value</p>
                            </div>
                        </div>
                    </div>
                ))}

                {criminals.length === 0 && (
                    <div className="col-span-full py-20 text-center text-gray-500 flex flex-col items-center">
                        <UserX size={48} className="mb-4 opacity-20" />
                        <p>Database is empty.</p>
                    </div>
                )}
            </div>
        </div>
    );
};

export default CriminalDatabase;
