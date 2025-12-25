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
    AlertCircle
} from 'lucide-react';

import { useParams } from 'react-router-dom';

function Dashboard() {
    const { user } = useContext(AuthContext);
    const { sensorData, alerts } = useContext(SensorContext);
    const { companyId: paramCompanyId } = useParams();

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
        <div className="space-y-8 pb-12">
            {/* Header Area */}
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
                <div>
                    <motion.h1
                        initial={{ opacity: 0, x: -20 }}
                        animate={{ opacity: 1, x: 0 }}
                        className="text-4xl font-black text-white tracking-tight"
                    >
                        Intelligence Overview
                    </motion.h1>
                    <p className="text-slate-400 mt-1 font-medium italic">Operational status: <span className="text-emerald-400 font-bold not-italic">Optimum</span></p>
                </div>
                <div className="flex items-center space-x-3">
                    <button className="glass px-4 py-2 rounded-xl text-sm font-bold text-slate-300 hover:text-white transition-all flex items-center border border-white/5">
                        <RefreshCw size={16} className="mr-2" />
                        Live Feed
                    </button>
                    <button className="bg-blue-600 hover:bg-blue-500 text-white px-5 py-2.5 rounded-xl text-sm font-bold transition-all shadow-lg shadow-blue-500/20 flex items-center">
                        Generate Report
                        <ArrowUpRight size={16} className="ml-2" />
                    </button>
                </div>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <MetricsCard
                    title="Active Temp"
                    value={`${liveMetrics.temperature}°C`}
                    trend="↓ 0.5°C stable"
                    color="blue"
                    icon={Thermometer}
                />
                <MetricsCard
                    title="Ambient Humidity"
                    value={`${liveMetrics.humidity}%`}
                    trend="→ 65% nominal"
                    color="green"
                    icon={Droplets}
                />
                <MetricsCard
                    title="Security Status"
                    value={liveMetrics.activeAlerts}
                    trend="⚠️ 2 unresolved"
                    color="red"
                    icon={Bell}
                />
                <MetricsCard
                    title="System Nodes"
                    value={liveMetrics.devicesOnline}
                    trend="✅ 100% operational"
                    color="yellow"
                    icon={Cpu}
                />
            </div>

            {/* Main Content Grid */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Charts Area */}
                <div className="lg:col-span-2 space-y-8">
                    <RealtimeChart type="temperature" data={sensorData} />
                    <RealtimeChart type="humidity" data={sensorData} />
                </div>

                {/* Info Side Panel */}
                <div className="space-y-8">
                    {/* Alerts Panel */}
                    <div className="glass-card rounded-3xl p-6 border border-white/5 h-full">
                        <div className="flex items-center justify-between mb-6">
                            <h2 className="text-xl font-bold text-white">System Logs</h2>
                            <span className="text-[10px] bg-rose-500/20 text-rose-400 px-2 py-0.5 rounded-full font-black uppercase tracking-widest border border-rose-500/20">Critical</span>
                        </div>

                        <div className="space-y-4">
                            {alerts.length > 0 ? alerts.slice(0, 4).map((alert, idx) => (
                                <motion.div
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.1 }}
                                    key={alert.id}
                                    className={`p-4 rounded-2xl glass border border-white/5 relative group cursor-pointer overflow-hidden ${alert.severity === 'critical' ? 'hover:border-rose-500/30' : 'hover:border-amber-500/30'
                                        }`}
                                >
                                    <div className="flex items-start space-x-3 mb-1">
                                        <div className={`mt-1 ${alert.severity === 'critical' ? 'text-rose-400' : 'text-amber-400'}`}>
                                            <AlertCircle size={14} />
                                        </div>
                                        <p className="font-bold text-sm text-slate-100">{alert.title}</p>
                                    </div>
                                    <p className="text-xs text-slate-400 leading-relaxed ml-7">{alert.message}</p>
                                    <div className="mt-3 ml-7 flex items-center justify-between">
                                        <span className="text-[9px] text-slate-500 font-bold uppercase tracking-widest">2m ago</span>
                                        <ArrowUpRight size={12} className="text-slate-600 group-hover:text-blue-400 transition-colors" />
                                    </div>
                                </motion.div>
                            )) : (
                                <div className="text-center py-12">
                                    <p className="text-slate-500 font-medium">No critical alerts detected</p>
                                </div>
                            )}
                        </div>
                        {alerts.length > 4 && (
                            <button className="w-full mt-6 py-3 rounded-2xl text-xs font-black text-slate-400 uppercase tracking-widest hover:text-white transition-colors glass border border-white/5">
                                View Intelligence Logs
                            </button>
                        )}
                    </div>

                    {/* Quick Stats Asset */}
                    <div className="glass-card rounded-3xl p-6 border border-white/5 overflow-hidden relative">
                        <div className="absolute top-0 right-0 w-32 h-32 bg-blue-500/10 blur-3xl rounded-full"></div>
                        <h3 className="text-white font-bold mb-4 relative z-10">Asset Performance</h3>
                        <div className="space-y-4 relative z-10">
                            {[
                                { label: 'Gateway uptime', value: '99.9%', color: 'bg-emerald-500' },
                                { label: 'Sync latency', value: '14ms', color: 'bg-blue-500' },
                                { label: 'CPU Load', value: '23%', color: 'bg-amber-500' }
                            ].map((stat, i) => (
                                <div key={i}>
                                    <div className="flex justify-between text-xs mb-1.5 font-bold uppercase tracking-wider text-slate-400">
                                        <span>{stat.label}</span>
                                        <span className="text-white">{stat.value}</span>
                                    </div>
                                    <div className="h-1.5 w-full bg-white/5 rounded-full overflow-hidden">
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: stat.value }}
                                            className={`h-full ${stat.color} shadow-[0_0_8px_rgba(255,255,255,0.1)]`}
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
