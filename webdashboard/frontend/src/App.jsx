import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import DashboardView from './components/DashboardView';
import CameraMap from './pages/CameraMap';
import CameraManagement from './pages/CameraManagement';
import CriminalDatabase from './pages/CriminalDatabase';
import VideoAnalysis from './pages/VideoAnalysis';
import PlaceholderPage from './pages/PlaceholderPage';
import IncidentReports from './pages/IncidentReports';
import Settings from './pages/Settings';
import { Menu } from 'lucide-react';

function App() {
    const [activeTab, setActiveTab] = useState('dashboard');
    const [sidebarOpen, setSidebarOpen] = useState(true);

    // Apply saved theme on app load
    useEffect(() => {
        const savedTheme = localStorage.getItem('theme');
        document.documentElement.setAttribute('data-theme', savedTheme === 'light' ? 'light' : 'dark');
    }, []);

    // Safe routing to prevent crashes
    const renderContent = () => {
        try {
            switch (activeTab) {
                case 'dashboard': return <DashboardView />;
                case 'map': return <CameraMap />;
                case 'cameras': return <CameraManagement />;
                case 'criminals': return <CriminalDatabase />;
                case 'analysis': return <VideoAnalysis />;
                case 'reports': return <IncidentReports />;
                case 'settings': return <Settings />;
                default: return <PlaceholderPage title="Page Not Found" />;
            }
        } catch (e) {
            console.error("Render Error:", e);
            return <div className="p-8 text-red-500">Error rendering page: {e.message}</div>;
        }
    };

    return (
        <div className="flex h-screen w-screen bg-[#0b0e14] text-[#e2e8f0] overflow-hidden font-sans">
            {/* 1. Sidebar (Fixed Left) */}
            {sidebarOpen && <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />}

            {/* 2. Main Content Area */}
            <main className="flex-1 flex flex-col h-full min-w-0 relative bg-[#0b0e14]">
                {/* Toggle for mobile/layout */}
                <button
                    onClick={() => setSidebarOpen(!sidebarOpen)}
                    className="absolute top-4 left-4 z-50 p-2 bg-[#1c2630] rounded-lg text-gray-400 hover:text-white md:hidden"
                >
                    <Menu size={20} />
                </button>

                {/* Dynamic Content */}
                <div className="flex-1 overflow-hidden">
                    {renderContent()}
                </div>
            </main>
        </div>
    );
}

export default App;
