import React, { useContext, useEffect, useState } from 'react';
import { SensorContext } from '../../context/SensorContext';
import socketService from '../../services/socketService';
import MetricsCard from './MetricsCard';
import RealtimeChart from './RealtimeChart';

function Dashboard() {
    const { sensorData, alerts } = useContext(SensorContext);
    const [liveMetrics, setLiveMetrics] = useState({
        temperature: 0,
        humidity: 0,
        activeAlerts: 0,
        devicesOnline: 0
    });

    useEffect(() => {
        // Subscribe to live metrics
        socketService.emit('subscribe-company', 'company-123');

        // Listen for metric updates
        socketService.on('metrics-update', (metrics) => {
            setLiveMetrics(metrics);
        });

        return () => {
            socketService.off('metrics-update');
        };
    }, []);

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
                <p className="text-gray-600">Real-time cold chain monitoring</p>
            </div>

            {/* Metrics Grid */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                <MetricsCard
                    title="Temperature"
                    value={`${liveMetrics.temperature}°C`}
                    trend="↓ 0.5°C"
                    color="blue"
                />
                <MetricsCard
                    title="Humidity"
                    value={`${liveMetrics.humidity}%`}
                    trend="→ 65%"
                    color="green"
                />
                <MetricsCard
                    title="Active Alerts"
                    value={liveMetrics.activeAlerts}
                    trend="⚠️ 2 critical"
                    color="red"
                />
                <MetricsCard
                    title="Devices Online"
                    value={liveMetrics.devicesOnline}
                    trend="✅ All active"
                    color="green"
                />
            </div>

            {/* Charts */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <RealtimeChart type="temperature" data={sensorData} />
                <RealtimeChart type="humidity" data={sensorData} />
            </div>

            {/* Recent Alerts */}
            <div className="mt-6 bg-white rounded-lg shadow p-6">
                <h2 className="text-lg font-semibold mb-4">Recent Alerts</h2>
                <div className="space-y-3">
                    {alerts.slice(0, 5).map(alert => (
                        <div
                            key={alert.id}
                            className={`p-4 rounded border-l-4 ${alert.severity === 'critical' ? 'border-red-500 bg-red-50' : 'border-yellow-500 bg-yellow-50'
                                }`}
                        >
                            <p className="font-semibold">{alert.title}</p>
                            <p className="text-sm text-gray-600">{alert.message}</p>
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
}

export default Dashboard;
