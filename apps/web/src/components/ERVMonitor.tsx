import React from 'react';
import { useERVSystem } from '../hooks/useERVSystem';

interface ERVMonitorProps {
  systemId: string;
}

const ERVMonitor: React.FC<ERVMonitorProps> = ({ systemId }) => {
  const {
    ervSystem,
    isLoading,
    error,
    getHeatRecovery,
    getMoistureRecovery,
    getEnergySavings,
  } = useERVSystem();

  if (isLoading) {
    return (
      <div className="p-4 bg-gray-100 rounded-lg">
        <p>Loading ERV system data...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-4 bg-red-100 text-red-800 rounded-lg">
        <p>Error: {error}</p>
      </div>
    );
  }

  if (!ervSystem) {
    return (
      <div className="p-4 bg-yellow-100 text-yellow-800 rounded-lg">
        <p>ERV system not initialized</p>
      </div>
    );
  }

  const heatRecovery = getHeatRecovery();
  const moistureRecovery = getMoistureRecovery();
  const energySavings = getEnergySavings();

  return (
    <div className="p-6 bg-white rounded-xl shadow-md border border-gray-200">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-xl font-bold text-gray-800">{ervSystem.name}</h2>
        <span className={`px-3 py-1 rounded-full text-sm font-medium ${
          ervSystem.isActive 
            ? 'bg-green-100 text-green-800' 
            : 'bg-red-100 text-red-800'
        }`}>
          {ervSystem.isActive ? 'Active' : 'Inactive'}
        </span>
      </div>

      {ervSystem.currentData ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Current Conditions</h3>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Supply Air Temp:</span>
              <span className="font-medium">{ervSystem.currentData.supplyAirTemp.toFixed(1)}°C</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Exhaust Air Temp:</span>
              <span className="font-medium">{ervSystem.currentData.exhaustAirTemp.toFixed(1)}°C</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Supply Humidity:</span>
              <span className="font-medium">{ervSystem.currentData.supplyAirHumidity.toFixed(1)}%</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Exhaust Humidity:</span>
              <span className="font-medium">{ervSystem.currentData.exhaustAirHumidity.toFixed(1)}%</span>
            </div>
          </div>

          <div className="space-y-3">
            <h3 className="font-semibold text-gray-700">Performance Metrics</h3>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Heat Recovery:</span>
              <span className="font-medium">
                {heatRecovery ? heatRecovery.toFixed(1) : 'N/A'}°C
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Moisture Recovery:</span>
              <span className="font-medium">
                {moistureRecovery ? moistureRecovery.toFixed(1) : 'N/A'}%
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Energy Savings:</span>
              <span className="font-medium">
                {energySavings ? energySavings.toFixed(2) : 'N/A'} kW
              </span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Efficiency:</span>
              <span className="font-medium">{ervSystem.currentData.efficiency.toFixed(1)}%</span>
            </div>
            
            <div className="flex justify-between">
              <span className="text-gray-600">Power Consumption:</span>
              <span className="font-medium">{ervSystem.currentData.powerConsumption.toFixed(1)} W</span>
            </div>
          </div>
        </div>
      ) : (
        <p className="text-gray-500 italic">No data available</p>
      )}

      <div className="mt-4 text-xs text-gray-500">
        Last updated: {ervSystem.currentData?.timestamp.toLocaleString() || 'Never'}
      </div>
    </div>
  );
};

export default ERVMonitor;