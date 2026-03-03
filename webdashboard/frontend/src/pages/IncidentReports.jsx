import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { FileText, Download, Filter, Search } from 'lucide-react';

const BACKEND = "http://localhost:5000";

const IncidentReports = () => {
    const [logs, setLogs] = useState([]);

    useEffect(() => {
        // In a real app we might have a specific /reports endpoint reading the full file
        // For now, reusing /alerts which gives recent in-memory ones. 
        // Let's assume we update backend to serve file content or just show active buffer for demo.
        axios.get(`${BACKEND}/alerts`).then(res => setLogs(res.data));
    }, []);

    return (
        <div className="p-8 h-full flex flex-col">
            <div className="flex justify-between items-end mb-8">
                <div>
                    <h2 className="text-2xl font-bold text-white mb-1">Incident Reports</h2>
                    <p className="text-gray-400 text-sm">Detailed logs of detected security events.</p>
                </div>
                <button className="btn bg-[#1c2630] hover:bg-[#23303d] border border-[#23303d] text-white">
                    <Download size={16} /> Export CSV
                </button>
            </div>

            {/* Filter Bar */}
            <div className="flex gap-4 mb-6">
                <div className="relative flex-1">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500" size={18} />
                    <input
                        type="text"
                        placeholder="Search logs..."
                        className="w-full bg-[#11161d] border border-[#23303d] rounded pl-10 pr-4 py-2 text-white focus:border-[#0ea5e9] outline-none"
                    />
                </div>
                <button className="btn bg-[#11161d] border-[#23303d] text-gray-400">
                    <Filter size={18} /> Filters
                </button>
            </div>

            {/* Table */}
            <div className="flex-1 panel overflow-hidden flex flex-col">
                <div className="grid grid-cols-12 bg-[#1c2630] p-4 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-[#23303d]">
                    <div className="col-span-2">Timestamp</div>
                    <div className="col-span-2">Level</div>
                    <div className="col-span-2">Source</div>
                    <div className="col-span-6">Details</div>
                </div>
                <div className="overflow-y-auto flex-1 custom-scrollbar">
                    {logs.map((log, i) => (
                        <div key={i} className="grid grid-cols-12 p-4 text-sm border-b border-[#23303d] hover:bg-[#161b22] transition-colors">
                            <div className="col-span-2 font-mono text-gray-400">{log.timestamp}</div>
                            <div className="col-span-2">
                                <span className={`px-2 py-1 rounded text-[10px] font-bold uppercase ${log.level === 'danger' ? 'bg-rose-500/20 text-rose-500 border border-rose-500/20' :
                                        log.level === 'critical' ? 'bg-orange-500/20 text-orange-500 border border-orange-500/20' :
                                            'bg-blue-500/20 text-blue-500 border border-blue-500/20'
                                    }`}>
                                    {log.level}
                                </span>
                            </div>
                            <div className="col-span-2 text-gray-300">{log.source || "System"}</div>
                            <div className="col-span-6 text-gray-300">{log.message}</div>
                        </div>
                    ))}
                    {logs.length === 0 && (
                        <div className="p-8 text-center text-gray-500 italic">No incidents recorded in current session.</div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default IncidentReports;
