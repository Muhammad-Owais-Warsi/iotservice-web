import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../../context/AuthContext';
import { SensorContext } from '../../context/SensorContext';
import socketService from '../../services/socketService';
import MetricsCard from './MetricsCard';
import RealtimeChart from './RealtimeChart';
import { motion } from 'framer-motion';
import {
    Thermometer,
    Droplets,
    Bell,
    Cpu,
    ArrowUpRight,
    RefreshCw,
    AlertCircle,
    Activity
} from 'lucide-react';

import { useParams } from 'react-router-dom';

function Dashboard() {
    const { user } = useContext(AuthContext);
    const { sensorData, alerts } = useContext(SensorContext);
    const { companyId: paramCompanyId } = useParams();
    const [currentTime, setCurrentTime] = useState(new Date());

    useEffect(() => {
        const timer = setInterval(() => setCurrentTime(new Date()), 1000);
        return () => clearInterval(timer);
    }, []);

    // Effective companyId: either from URL (for admin) or from user profile
    const effectiveCompanyId = (user?.role === 'CUERON_ADMIN' || user?.role === 'CUERON_EMPLOYEE')
        ? (paramCompanyId || user?.companyId)
        : user?.companyId;

    const [liveMetrics, setLiveMetrics] = useState({
        temperature: 0,
        humidity: 0,
        activeAlerts: 0,
        devicesOnline: 0
    });

    useEffect(() => {
        if (!effectiveCompanyId) return;

        socketService.emit('subscribe-company', effectiveCompanyId);

        // Listen for real-time sensor updates for this specific company
        const handleSensorUpdate = (data) => {
            if (data.companyId === effectiveCompanyId) {
                // Update basic metrics based on latest data
                setLiveMetrics(prev => ({
                    ...prev,
                    temperature: data.readings[0]?.temperature || prev.temperature,
                    humidity: data.readings[0]?.humidity || prev.humidity
                }));
            }
        };

        socketService.on('sensor-update', handleSensorUpdate);

        socketService.on('metrics-update', (metrics) => {
            setLiveMetrics(metrics);
        });

        return () => {
            socketService.off('sensor-update', handleSensorUpdate);
            socketService.off('metrics-update');
        };
    }, [effectiveCompanyId]);

    return (
        <div className="space-y-12 pb-12">
            {/* Header Area */}
            <div className="flex flex-col xl:flex-row xl:items-end justify-between gap-8 pb-4 border-b border-slate-100">
                <div className="space-y-4">
                    <motion.div
                        initial={{ opacity: 0, y: -20 }}
                        animate={{ opacity: 1, y: 0 }}
                        className="inline-flex items-center space-x-2 bg-slate-50 px-3 py-1 rounded-full border border-slate-200"
                    >
                        <div className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse"></div>
                        <span className="text-[10px] font-black tracking-widest uppercase text-slate-500">System Nominal</span>
                    </motion.div>
                    <div>
                        <motion.h1
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            className="text-6xl font-black text-slate-900 tracking-tighter"
                        >
                            ColdChain <span className="text-blue-600">Intelligence</span>
                        </motion.h1>
                        <p className="text-slate-400 mt-2 font-bold text-lg tracking-tight">
                            Real-time sensor telemetry and environmental analysis
                        </p>
                    </div>
                </div>

                <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-4">
                    <div className="hidden md:block text-right mr-4">
                        <p className="text-3xl font-black text-slate-900 tracking-tighter tabular-nums">
                            {currentTime.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </p>
                        <p className="text-xs font-bold text-slate-400 uppercase tracking-widest">
                            {currentTime.toLocaleDateString(undefined, { weekday: 'long', month: 'long', day: 'numeric' })}
                        </p>
                    </div>
                    <div className="flex items-center gap-3">
                        <button className="bg-white px-6 py-4 rounded-2xl text-xs font-black text-slate-700 hover:text-blue-600 hover:bg-slate-50 transition-all flex items-center border border-slate-200 shadow-sm hover:shadow-md uppercase tracking-widest whitespace-nowrap">
                            <RefreshCw size={14} className="mr-3" />
                            Sync Node
                        </button>
                        <button className="bg-slate-900 border border-slate-800 text-white px-8 py-4 rounded-2xl text-xs font-black transition-all shadow-xl shadow-slate-900/10 hover:shadow-2xl hover:shadow-slate-900/20 hover:-translate-y-1 flex items-center uppercase tracking-widest group whitespace-nowrap">
                            Export Data
                            <ArrowUpRight size={14} className="ml-3 group-hover:translate-x-1 group-hover:-translate-y-1 transition-transform" />
                        </button>
                    </div>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricsCard
                    title="Current Thermal"
                    value={`${liveMetrics.temperature}°C`}
                    trend="↓ 0.2°C stable"
                    color="blue"
                    icon={Thermometer}
                />
                <MetricsCard
                    title="Atmospheric Humidity"
                    value={`${liveMetrics.humidity}%`}
                    trend="→ 62% nominal"
                    color="green"
                    icon={Droplets}
                />
                <MetricsCard
                    title="Escalations"
                    value={liveMetrics.activeAlerts}
                    trend="⚠️ 2 pending"
                    color="red"
                    icon={Bell}
                />
                <MetricsCard
                    title="Active Gateways"
                    value={liveMetrics.devicesOnline}
                    trend="✅ 100% online"
                    color="yellow"
                    icon={Cpu}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8 items-start min-h-[calc(100vh-200px)]"> {/* Added min-h for layout stretch */}
                {/* Charts Area */}
                <div className="xl:col-span-2 space-y-8 h-full flex flex-col">
                    <RealtimeChart type="temperature" data={sensorData} />
                    <RealtimeChart type="humidity" data={sensorData} />
                </div>

                {/* Info Side Panel */}
                <div className="space-y-8 h-full flex flex-col">
                    {/* Alerts Panel - Dynamic height to match charts approx */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm relative overflow-hidden flex-grow flex flex-col">
                        <div className="absolute top-0 right-0 w-64 h-64 bg-rose-50/50 blur-[80px] rounded-full -mr-20 -mt-20 pointer-events-none"></div>

                        <div className="flex items-center justify-between mb-8 relative z-10 shrink-0">
                            <div>
                                <h2 className="text-xl font-black text-slate-900 uppercase tracking-tight">Security Log</h2>
                                <p className="text-[10px] text-slate-400 font-bold uppercase tracking-widest mt-1">Real-time threat detection</p>
                            </div>
                            <span className="text-[9px] bg-rose-50 text-rose-600 px-3 py-1.5 rounded-xl font-black uppercase tracking-widest border border-rose-100 shadow-sm">Live Feed</span>
                        </div>

                        <div className="space-y-4 relative z-10 flex-grow overflow-y-auto custom-scrollbar pr-2 -mr-2 max-h-[500px]">
                            {Array.isArray(alerts) && alerts.length > 0 ? alerts.slice(0, 5).map((alert, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, x: 10 }}
                                    animate={{ opacity: 1, x: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={alert.id || idx}
                                    className={`p-5 rounded-2xl bg-slate-50/50 border border-slate-100 relative group cursor-pointer transition-all duration-300 hover:bg-white hover:shadow-md ${alert.severity === 'critical' ? 'hover:border-rose-200' : 'hover:border-blue-200'}`}
                                >
                                    <div className="flex items-start justify-between mb-2">
                                        <div className="flex items-center gap-3">
                                            <div className={`w-2 h-2 rounded-full ${alert.severity === 'critical' ? 'bg-rose-500' : 'bg-blue-500'}`}></div>
                                            <p className="font-bold text-xs text-slate-900">{alert.title}</p>
                                        </div>
                                        <span className="text-[9px] text-slate-400 font-bold uppercase tabular-nums">
                                            {alert.createdAt ? new Date(alert.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }) : 'Now'}
                                        </span>
                                    </div>
                                    <p className="text-[11px] text-slate-500 leading-relaxed font-medium pl-5">{alert.message}</p>
                                </motion.div>
                            )) : (
                                <div className="h-full flex flex-col items-center justify-center text-center py-12 border-2 border-dashed border-slate-100 rounded-3xl">
                                    <Bell size={32} className="mx-auto text-slate-300 mb-4" />
                                    <p className="text-slate-900 font-black text-[10px] uppercase tracking-[0.2em]">System Secure</p>
                                    <p className="text-slate-400 text-[10px] mt-2 font-bold">No active anomalies detected.</p>
                                </div>
                            )}
                        </div>

                        {alerts.length > 5 && (
                            <div className="pt-6 mt-2 border-t border-slate-100 shrink-0">
                                <button className="w-full py-4 rounded-xl text-[10px] font-black text-slate-500 hover:text-blue-600 hover:bg-blue-50 transition-all bg-slate-50/50 border border-transparent hover:border-blue-100 uppercase tracking-widest">
                                    View Full Security Log
                                </button>
                            </div>
                        )}
                    </div>

                    {/* Operational Efficiency Card */}
                    <div className="bg-white rounded-[2.5rem] p-8 border border-slate-100 shadow-sm overflow-hidden relative group shrink-0">
                        <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-500 via-indigo-500 to-purple-500"></div>
                        <div className="flex items-center justify-between mb-6">
                            <h3 className="text-slate-900 font-black uppercase tracking-tight text-lg">Node Health</h3>
                            <Activity size={18} className="text-slate-300" />
                        </div>
                        <div className="space-y-5 relative z-10">
                            {[
                                { label: 'Satellite Uplink', value: '99.9%', color: 'bg-emerald-500' },
                                { label: 'Quantum Sync', value: '0.4ms', color: 'bg-blue-500' },
                                { label: 'CPU Efficiency', value: '94%', color: 'bg-indigo-500' }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-[10px] mb-2 font-black uppercase tracking-[0.1em] text-slate-400">
                                        <span>{stat.label}</span>
                                        <span className="text-slate-900 tabular-nums">{stat.value}</span>
                                    </div>
                                    <div className="h-2 w-full bg-slate-50 rounded-full overflow-hidden border border-slate-100">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: stat.value }}
                                            transition={{ duration: 1.5, ease: [0.16, 1, 0.3, 1], delay: 0.2 + (i * 0.1) }}
                                            className={`h-full ${stat.color} shadow-sm`}
                                        ></motion.div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
