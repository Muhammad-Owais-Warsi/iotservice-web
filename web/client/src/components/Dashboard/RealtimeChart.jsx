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
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                titleFont: { size: 12, weight: 'bold' },
                bodyFont: { size: 12 },
                padding: 12,
                cornerRadius: 12,
                displayColors: false,
                borderWidth: 1,
                borderColor: 'rgba(255, 255, 255, 0.1)',
            },
        },
        scales: {
            x: {
                grid: { display: false },
                ticks: { color: 'rgba(255, 255, 255, 0.4)', font: { size: 10 } }
            },
            y: {
                grid: { color: 'rgba(255, 255, 255, 0.05)' },
                ticks: { color: 'rgba(255, 255, 255, 0.4)', font: { size: 10 } },
                border: { display: false }
            },
        },
        interaction: {
            intersect: false,
            mode: 'index',
        },
    };

    return (
        <div className="glass-card p-6 rounded-3xl h-[400px] border border-white/5">
            <div className="flex items-center justify-between mb-6">
                <div>
                    <h3 className="text-white font-bold text-lg">{isTemp ? 'Thermal Dynamics' : 'Humidity Levels'}</h3>
                    <p className="text-slate-400 text-xs uppercase tracking-widest font-semibold mt-1">Live Sensor Feed</p>
                </div>
                <div className={`w-2 h-2 rounded-full ${isTemp ? 'bg-rose-500 animate-pulse' : 'bg-blue-500 animate-pulse'}`}></div>
            </div>
            <div className="flex-1 h-[300px]">
                <Line options={options} data={chartData} />
            </div>
        </div>
    );
}

export default RealtimeChart;
