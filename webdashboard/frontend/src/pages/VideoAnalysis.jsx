import React, { useState } from 'react';
import axios from 'axios';
import { UploadCloud, FileVideo, Activity, CheckCircle, AlertTriangle } from 'lucide-react';

const BACKEND = "http://localhost:5000";

const VideoAnalysis = () => {
    const [file, setFile] = useState(null);
    const [jobId, setJobId] = useState(null);
    const [status, setStatus] = useState(null);
    const [uploading, setUploading] = useState(false);

    const [options, setOptions] = useState({
        violence: true,
        gender: true,
        criminal: true
    });

    const handleFileChange = (e) => {
        setFile(e.target.files[0]);
    };

    const handleUpload = async () => {
        if (!file) return;
        setUploading(true);
        const formData = new FormData();
        formData.append('file', file);
        formData.append('violence', options.violence);
        formData.append('gender', options.gender);
        formData.append('criminal', options.criminal);

        try {
            const res = await axios.post(`${BACKEND}/upload_video`, formData);
            setJobId(res.data.job_id);
            pollStatus(res.data.job_id);
        } catch (err) {
            alert("Upload failed");
        }
        setUploading(false);
    };

    const pollStatus = (id) => {
        const interval = setInterval(async () => {
            try {
                const res = await axios.get(`${BACKEND}/analysis_status/${id}`);
                setStatus(res.data);
                if (res.data.status === 'completed' || res.data.status === 'failed') {
                    clearInterval(interval);
                }
            } catch (e) { clearInterval(interval); }
        }, 1000);
    };

    return (
        <div className="h-full p-8 flex flex-col items-center justify-center">
            {!jobId ? (
                <div className="text-center">
                    <div className="w-24 h-24 bg-[#11161d] rounded-full flex items-center justify-center mb-6 border border-[#23303d] mx-auto">
                        <UploadCloud size={40} className="text-[#0ea5e9]" />
                    </div>
                    <h2 className="text-2xl font-bold text-white mb-2">Video Analysis Lab</h2>
                    <p className="text-gray-400 max-w-md mb-8">
                        Upload forensic footage for offline processing.
                        Select features to detect below.
                    </p>

                    {/* Feature Toggles */}
                    <div className="flex gap-4 justify-center mb-8">
                        <Toggle
                            label="Violence Detection"
                            active={options.violence}
                            onClick={() => setOptions({ ...options, violence: !options.violence })}
                            color="bg-rose-500"
                        />
                        <Toggle
                            label="Gender Detection"
                            active={options.gender}
                            onClick={() => setOptions({ ...options, gender: !options.gender })}
                            color="bg-blue-500"
                        />
                        <Toggle
                            label="Criminal ID"
                            active={options.criminal}
                            onClick={() => setOptions({ ...options, criminal: !options.criminal })}
                            color="bg-orange-500"
                        />
                    </div>

                    <input
                        type="file"
                        accept="video/*"
                        id="video-upload"
                        className="hidden"
                        onChange={handleFileChange}
                    />

                    <div className="flex flex-col gap-4 items-center">
                        <label
                            htmlFor="video-upload"
                            className="btn bg-[#1c2630] border border-[#23303d] text-gray-300 hover:text-white cursor-pointer min-w-[200px] justify-center"
                        >
                            {file ? file.name : "Select Video File"}
                        </label>

                        {file && (
                            <button
                                onClick={handleUpload}
                                disabled={uploading}
                                className="btn bg-[#0ea5e9] text-white hover:bg-[#0284c7] min-w-[200px] justify-center"
                            >
                                {uploading ? "Uploading..." : "Start Analysis"}
                            </button>
                        )}
                    </div>
                </div>
            ) : (
                <div className="w-full max-w-2xl bg-[#11161d] border border-[#1c232b] rounded-xl p-8">
                    <div className="flex items-center justify-between mb-8">
                        <h3 className="text-xl font-bold text-white flex items-center gap-2">
                            <Activity className="text-[#0ea5e9]" /> Analysis in Progress
                        </h3>
                        <span className="font-mono text-[#0ea5e9]">{status?.progress || 0}%</span>
                    </div>

                    {/* Progress Bar */}
                    <div className="h-2 bg-[#1c232b] rounded-full overflow-hidden mb-8">
                        <div
                            className="h-full bg-[#0ea5e9] transition-all duration-300"
                            style={{ width: `${status?.progress || 0}%` }}
                        ></div>
                    </div>

                    {status?.status === "completed" ? (
                        <div className="text-center">
                            <div className="inline-flex items-center gap-2 text-green-500 font-bold mb-4">
                                <CheckCircle /> Analysis Complete
                            </div>
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <StatBox label="Violence" value={status.detections.violence} color="text-rose-500" />
                                <StatBox label="Gender" value={status.detections.gender} color="text-blue-500" />
                                <StatBox label="Faces" value={status.detections.faces} color="text-orange-500" />
                            </div>
                            <a
                                href={`${BACKEND}/download_video/${status.output_file}`}
                                className="btn bg-[#10b981] text-white w-full justify-center"
                                target="_blank"
                            >
                                <FileVideo size={18} /> Download Processed Video
                            </a>
                        </div>
                    ) : (
                        <p className="text-center text-gray-500 animate-pulse">Processing frames... please wait.</p>
                    )}
                </div>
            )}
        </div>
    );
};

const StatBox = ({ label, value, color }) => (
    <div className="bg-[#1c232b] p-4 rounded text-center">
        <p className="text-xs text-gray-500 uppercase font-bold">{label}</p>
        <p className={`text-2xl font-mono font-bold ${color}`}>{value}</p>
    </div>
);

const Toggle = ({ label, active, onClick, color }) => (
    <button
        onClick={onClick}
        className={`flex items-center gap-2 px-3 py-2 rounded-lg border transition-all ${active
                ? `bg-[#1c2630] border-[#23303d] text-white`
                : 'bg-transparent border-transparent text-gray-500 hover:text-gray-300'
            }`}
    >
        <div className={`w-3 h-3 rounded-full ${active ? color : 'bg-gray-600'}`}></div>
        <span className="text-xs font-bold">{label}</span>
        {active && <CheckCircle size={12} className="text-gray-400" />}
    </button>
);

export default VideoAnalysis;
