import React from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
    Filler
);

function RealtimeChart({ type, data }) {
    const isTemp = type === 'temperature';
    const accentColor = isTemp ? '#f43f5e' : '#0ea5e9';
    const accentGradient = isTemp ? 'rgba(244, 63, 94, 0.2)' : 'rgba(14, 165, 233, 0.2)';

    const chartData = {
        labels: data.slice(-20).map(d => new Date(d.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })),
        datasets: [
            {
                label: isTemp ? 'Temperature (°C)' : 'Humidity (%)',
                data: data.slice(-20).map(d => isTemp ? d.readings?.[0]?.temperature || d.temperature : d.readings?.[0]?.humidity || d.humidity),
                borderColor: accentColor,
                backgroundColor: (context) => {
                    const ctx = context.chart.ctx;
                    const gradient = ctx.createLinearGradient(0, 0, 0, 400);
                    gradient.addColorStop(0, accentGradient);
                    gradient.addColorStop(1, 'rgba(0, 0, 0, 0)');
                    return gradient;
                },
                fill: true,
                tension: 0.4,
                borderWidth: 3,
                pointRadius: 0,
                pointHoverRadius: 6,
                pointHoverBackgroundColor: accentColor,
                pointHoverBorderColor: '#fff',
                pointHoverBorderWidth: 2,
            },
        ],
    };

    const options = {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
            legend: {
                display: false,
            },
            tooltip: {
                backgroundColor: 'rgba(255, 255, 255, 0.95)',
                titleColor: '#0f172a',
                bodyColor: '#475569',
                titleFont: { size: 12, weight: 'bold' },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 16,
                displayColors: false,
                borderWidth: 1,
                borderColor: '#e2e8f0',
                shadowColor: 'rgba(0,0,0,0.1)',
                shadowBlur: 10
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: '#94a3b8', font: { size: 10, weight: '600' } }
            },
            y: {
                grid: { color: '#f1f5f9' },
                ticks: { color: '#94a3b8', font: { size: 10, weight: '600' } },
                border: { display: false }
            },
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
    };

    return (
        <div className="bg-white p-10 rounded-[2.5rem] h-[450px] border border-slate-100 shadow-sm relative overflow-hidden group hover:shadow-xl transition-all duration-500">
            <div className="flex items-center justify-between mb-8 relative z-10">
                <div>
                    <h3 className="text-slate-900 font-black text-xl tracking-tight">{isTemp ? 'Thermal Telemetry' : 'Hydrographic Data'}</h3>
                    <p className="text-slate-400 text-[10px] uppercase tracking-[0.2em] font-black mt-1">Live Sensor Array Uplink</p>
                </div>
                <div className="flex items-center space-x-2 bg-slate-50 px-3 py-1.5 rounded-full border border-slate-100">
                    <div className={`w-2 h-2 rounded-full ${isTemp ? 'bg-rose-500 animate-pulse' : 'bg-blue-500 animate-pulse'}`}></div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest">Active</span>
                </div>
            </div>
            <div className="flex-1 h-[320px] relative z-10">
                <Line options={options} data={chartData} />
            </div>
            {/* Subtle Texture Overlay */}
            <div className="absolute inset-x-0 bottom-0 h-32 bg-gradient-to-t from-slate-50/50 to-transparent pointer-events-none"></div>
        </div>
    );
}

export default RealtimeChart;
