import React, { useEffect, useRef } from 'react';
import {
    Chart as ChartJS,
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend,
} from 'chart.js';
import { Line } from 'react-chartjs-2';

ChartJS.register(
    CategoryScale,
    LinearScale,
    PointElement,
    LineElement,
    Title,
    Tooltip,
    Legend
);

function RealtimeChart({ type, data }) {
    // Format data for Chart.js
    const chartData = {
        labels: data.slice(-20).map(d => new Date(d.timestamp).toLocaleTimeString()),
        datasets: [
            {
                label: type === 'temperature' ? 'Temperature (°C)' : 'Humidity (%)',
                data: data.slice(-20).map(d => type === 'temperature' ? d.readings?.[0]?.temperature || d.temperature : d.readings?.[0]?.humidity || d.humidity),
                borderColor: type === 'temperature' ? 'rgb(255, 99, 132)' : 'rgb(53, 162, 235)',
                backgroundColor: type === 'temperature' ? 'rgba(255, 99, 132, 0.5)' : 'rgba(53, 162, 235, 0.5)',
                tension: 0.4,
            },
        ],
    };

    const options = {
        responsive: true,
        plugins: {
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: `Real-time ${type.charAt(0).toUpperCase() + type.slice(1)}`,
            },
        },
        scales: {
            y: {
                beginAtZero: false,
            },
        },
        animation: {
            duration: 0
        }
    };

    return (
        <div className="bg-white p-4 rounded-lg shadow">
            <Line options={options} data={chartData} />
        </div>
    );
}

export default RealtimeChart;
