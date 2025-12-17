import React from 'react';

function MetricsCard({ title, value, trend, color }) {
    const colorClasses = {
        blue: 'text-blue-600 bg-blue-50',
        green: 'text-green-600 bg-green-50',
        red: 'text-red-600 bg-red-50',
        yellow: 'text-yellow-600 bg-yellow-50',
    };

    const selectedColor = colorClasses[color] || colorClasses.blue;

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between mb-4">
                <h3 className="text-gray-500 text-sm font-medium">{title}</h3>
                <span className={`px-2 py-1 rounded text-xs font-semibold ${selectedColor}`}>
                    {trend}
                </span>
            </div>
            <div className="flex items-baseline">
                <span className="text-2xl font-bold text-gray-900">{value}</span>
            </div>
        </div>
    );
}

export default MetricsCard;
