import React, { useState, useEffect } from 'react';
import axios from 'axios';
import { Sun, Moon, Camera, Trash2, Download, Save, RefreshCw } from 'lucide-react';

const BACKEND = "http://localhost:5000";

const Settings = ({ onThemeChange }) => {
    // Theme state - stored in localStorage
    const [darkMode, setDarkMode] = useState(() => {
        return localStorage.getItem('theme') !== 'light';
    });

    // Default camera settings
    const [defaultSettings, setDefaultSettings] = useState({
        violence: true,
        gender: true,
        face: true
    });

    // Loading states
    const [clearing, setClearing] = useState(false);
    const [exporting, setExporting] = useState(false);
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        // Load default settings from localStorage
        const saved = localStorage.getItem('defaultCameraSettings');
        if (saved) {
            try {
                setDefaultSettings(JSON.parse(saved));
            } catch (e) { }
        }

        // Apply theme on mount using data attribute
        const savedTheme = localStorage.getItem('theme');
        document.documentElement.setAttribute('data-theme', savedTheme === 'light' ? 'light' : 'dark');
    }, []);

    // Theme toggle
    const handleThemeToggle = () => {
        const newMode = !darkMode;
        setDarkMode(newMode);
        localStorage.setItem('theme', newMode ? 'dark' : 'light');

        // Apply theme using data attribute
        document.documentElement.setAttribute('data-theme', newMode ? 'dark' : 'light');
    };

    // Save default camera settings
    const handleSaveDefaults = () => {
        setSaving(true);
        localStorage.setItem('defaultCameraSettings', JSON.stringify(defaultSettings));
        setTimeout(() => setSaving(false), 500);
    };

    // Clear all alerts
    const handleClearAlerts = async () => {
        if (!window.confirm('Are you sure you want to clear all alerts? This cannot be undone.')) return;

        setClearing(true);
        try {
            await axios.post(`${BACKEND}/alerts/clear`);
            alert('All alerts cleared successfully!');
        } catch (e) {
            alert('Failed to clear alerts: ' + e.message);
        }
        setClearing(false);
    };

    // Export logs
    const handleExportLogs = async () => {
        setExporting(true);
        try {
            const res = await axios.get(`${BACKEND}/alerts`);
            const alerts = res.data;

            // Convert to CSV
            const headers = ['Timestamp', 'Message', 'Level', 'Source'];
            const rows = alerts.map(a => [
                a.timestamp,
                a.message,
                a.level,
                a.source
            ]);

            const csvContent = [
                headers.join(','),
                ...rows.map(r => r.map(cell => `"${cell || ''}"`).join(','))
            ].join('\n');

            // Download
            const blob = new Blob([csvContent], { type: 'text/csv' });
            const url = URL.createObjectURL(blob);
            const link = document.createElement('a');
            link.href = url;
            link.download = `sangini_alerts_${new Date().toISOString().split('T')[0]}.csv`;
            link.click();
            URL.revokeObjectURL(url);
        } catch (e) {
            alert('Failed to export logs: ' + e.message);
        }
        setExporting(false);
    };

    return (
        <div className="h-full w-full bg-[#0b0e14] p-6 overflow-y-auto">
            <div className="max-w-3xl mx-auto">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-white mb-2">System Settings</h1>
                    <p className="text-gray-400">Configure your Sangini surveillance system</p>
                </div>

                {/* Theme Settings */}
                <div className="bg-[#11161d] rounded-xl border border-[#1c232b] p-6 mb-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        {darkMode ? <Moon size={20} className="text-[#0ea5e9]" /> : <Sun size={20} className="text-yellow-500" />}
                        Theme Settings
                    </h2>

                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-white font-medium">Dark Mode</p>
                            <p className="text-gray-500 text-sm">Toggle between dark and light theme</p>
                        </div>
                        <button
                            onClick={handleThemeToggle}
                            className={`relative w-14 h-7 rounded-full transition-colors ${darkMode ? 'bg-[#0ea5e9]' : 'bg-gray-600'}`}
                        >
                            <span className={`absolute top-1 w-5 h-5 rounded-full bg-white transition-all ${darkMode ? 'left-8' : 'left-1'}`}></span>
                        </button>
                    </div>
                </div>

                {/* Default Camera Settings */}
                <div className="bg-[#11161d] rounded-xl border border-[#1c232b] p-6 mb-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Camera size={20} className="text-[#0ea5e9]" />
                        Default Camera Settings
                    </h2>
                    <p className="text-gray-500 text-sm mb-4">Set default detection toggles for new cameras</p>

                    <div className="space-y-4">
                        <SettingToggle
                            label="Violence Detection"
                            description="Enable violence/weapon detection by default"
                            checked={defaultSettings.violence}
                            onChange={() => setDefaultSettings(prev => ({ ...prev, violence: !prev.violence }))}
                            color="bg-rose-500"
                        />
                        <SettingToggle
                            label="Gender Detection"
                            description="Enable gender classification by default"
                            checked={defaultSettings.gender}
                            onChange={() => setDefaultSettings(prev => ({ ...prev, gender: !prev.gender }))}
                            color="bg-blue-500"
                        />
                        <SettingToggle
                            label="Face Recognition"
                            description="Enable criminal face matching by default"
                            checked={defaultSettings.face}
                            onChange={() => setDefaultSettings(prev => ({ ...prev, face: !prev.face }))}
                            color="bg-orange-500"
                        />
                    </div>

                    <button
                        onClick={handleSaveDefaults}
                        disabled={saving}
                        className="mt-6 px-4 py-2 bg-[#0ea5e9] hover:bg-[#0284c7] text-white font-semibold rounded-lg transition-colors flex items-center gap-2"
                    >
                        {saving ? <RefreshCw size={16} className="animate-spin" /> : <Save size={16} />}
                        {saving ? 'Saving...' : 'Save Defaults'}
                    </button>
                </div>

                {/* Data Management */}
                <div className="bg-[#11161d] rounded-xl border border-[#1c232b] p-6">
                    <h2 className="text-lg font-bold text-white mb-4 flex items-center gap-2">
                        <Trash2 size={20} className="text-[#0ea5e9]" />
                        Data Management
                    </h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Clear Alerts */}
                        <div className="bg-[#0b0e14] p-4 rounded-lg border border-[#1c232b]">
                            <h3 className="text-white font-medium mb-2">Clear All Alerts</h3>
                            <p className="text-gray-500 text-sm mb-4">Remove all alerts from the system. This cannot be undone.</p>
                            <button
                                onClick={handleClearAlerts}
                                disabled={clearing}
                                className="px-4 py-2 bg-rose-500/20 border border-rose-500/30 text-rose-500 hover:bg-rose-500/30 font-semibold rounded-lg transition-colors flex items-center gap-2"
                            >
                                {clearing ? <RefreshCw size={16} className="animate-spin" /> : <Trash2 size={16} />}
                                {clearing ? 'Clearing...' : 'Clear Alerts'}
                            </button>
                        </div>

                        {/* Export Logs */}
                        <div className="bg-[#0b0e14] p-4 rounded-lg border border-[#1c232b]">
                            <h3 className="text-white font-medium mb-2">Export Alert Logs</h3>
                            <p className="text-gray-500 text-sm mb-4">Download all alerts as a CSV file for reporting.</p>
                            <button
                                onClick={handleExportLogs}
                                disabled={exporting}
                                className="px-4 py-2 bg-emerald-500/20 border border-emerald-500/30 text-emerald-500 hover:bg-emerald-500/30 font-semibold rounded-lg transition-colors flex items-center gap-2"
                            >
                                {exporting ? <RefreshCw size={16} className="animate-spin" /> : <Download size={16} />}
                                {exporting ? 'Exporting...' : 'Export CSV'}
                            </button>
                        </div>
                    </div>
                </div>

                {/* Version Info */}
                <div className="mt-8 text-center text-gray-600 text-sm">
                    <p>Sangini Dashboard v2.0</p>
                    <p className="text-xs mt-1">© 2026 Sangini Surveillance System</p>
                </div>
            </div>
        </div>
    );
};

// Toggle Component
const SettingToggle = ({ label, description, checked, onChange, color }) => (
    <div className="flex items-center justify-between py-2 border-b border-[#1c232b] last:border-0">
        <div>
            <p className="text-white font-medium">{label}</p>
            <p className="text-gray-500 text-sm">{description}</p>
        </div>
        <button
            onClick={onChange}
            className={`relative w-12 h-6 rounded-full transition-colors ${checked ? color : 'bg-gray-600'}`}
        >
            <span className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${checked ? 'left-7' : 'left-1'}`}></span>
        </button>
    </div>
);

export default Settings;
