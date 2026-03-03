import React from 'react';
import {
    LayoutDashboard, Map, Camera, FileText, Upload, Settings, Users, Shield, Zap, Activity
} from 'lucide-react';

const Sidebar = ({ activeTab, setActiveTab }) => {
    const menu = [
        { id: 'dashboard', label: 'Live Monitor', icon: LayoutDashboard },
        { id: 'map', label: 'Camera Map', icon: Map },
        { id: 'cameras', label: 'Camera Management', icon: Camera },
        { id: 'criminals', label: 'Criminal Database', icon: Users },
        { id: 'reports', label: 'Incident Reports', icon: FileText },
        { id: 'analysis', label: 'Video Analysis', icon: Upload },
    ];

    const bottomMenu = [
        { id: 'settings', label: 'Settings', icon: Settings },
    ]

    return (
        <div className="h-full w-64 bg-[#0b0e14] border-r border-[#1c232b] flex flex-col flex-shrink-0">
            {/* Brand */}
            <div className="h-20 flex items-center gap-3 px-6">
                <div className="w-8 h-8 rounded-lg bg-[#11161d] border border-[#1c232b] flex items-center justify-center">
                    <Shield className="text-[#10b981]" size={18} fill="rgba(16,185,129,0.2)" />
                </div>
                <div>
                    <h1 className="text-lg font-bold text-white leading-tight">Sangini</h1>
                    <p className="text-[10px] text-gray-500">Admin Console</p>
                </div>
            </div>

            {/* System Status Pill */}
            <div className="px-6 mb-6">
                <div className="bg-[#11161d] border border-[#1c232b] rounded-lg p-3 flex items-center gap-3 shadow-inner">
                    <Activity size={16} className="text-[#10b981]" />
                    <span className="text-xs font-bold text-[#10b981]">System Online</span>
                </div>
            </div>

            {/* Menu */}
            <nav className="flex-1 px-4 space-y-1">
                {menu.map((item) => {
                    const Icon = item.icon;
                    const isActive = activeTab === item.id;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className={`w-full flex items-center justify-between px-4 py-3.5 rounded-lg text-xs font-medium transition-all group ${isActive
                                ? 'bg-gradient-to-r from-[#11161d] to-transparent text-[#10b981] border-l-2 border-[#10b981]'
                                : 'text-gray-400 hover:text-white hover:bg-[#11161d]'
                                }`}
                        >
                            <div className="flex items-center gap-3">
                                <Icon size={18} className={isActive ? 'text-[#10b981]' : 'group-hover:text-white opacity-70'} />
                                <span>{item.label}</span>
                            </div>
                            {item.badge && (
                                <span className="bg-[#1c232b] text-gray-300 text-[10px] px-2 py-0.5 rounded-full">
                                    {item.badge}
                                </span>
                            )}
                        </button>
                    );
                })}
            </nav>

            <div className="px-4 py-4 border-t border-[#1c232b] space-y-1">
                {bottomMenu.map((item) => {
                    const Icon = item.icon;
                    return (
                        <button
                            key={item.id}
                            onClick={() => setActiveTab(item.id)}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-lg text-xs font-medium text-gray-500 hover:text-white hover:bg-[#11161d] transition-all"
                        >
                            <Icon size={18} />
                            <span>{item.label}</span>
                        </button>
                    )
                })}
            </div>

            {/* Operator Status */}
            <div className="p-4 mt-auto">
                <div className="flex items-center gap-3 px-2">
                    <div className="w-2 h-2 rounded-full bg-[#10b981]"></div>
                    <div>
                        <p className="text-xs font-bold text-white">Operator</p>
                        <p className="text-[10px] text-gray-500">Shift A - Active</p>
                    </div>
                    <div className="ml-auto w-8 h-8 rounded-full bg-[#11161d] border border-[#1c232b] flex items-center justify-center text-xs text-gray-400">
                        OP
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Sidebar;
