import React, { useContext, useEffect } from 'react';
import { ERVSystemContext } from '../app/root';
import ERVMonitor from './ERVMonitor';

// Example component demonstrating ERV system usage
const ERVExample: React.FC = () => {
  const { system, updateSystem } = useContext(ERVSystemContext);

  // Initialize a sample ERV system
  useEffect(() => {
    if (!system) {
      updateSystem({
        id: 'erv-001',
        name: 'Main Facility ERV',
        locationId: 'loc-123',
        isActive: true,
        currentData: {
          supplyAirTemp: 22.5,
          exhaustAirTemp: 28.3,
          supplyAirHumidity: 45.2,
          exhaustAirHumidity: 58.7,
          airflowRate: 350,
          efficiency: 82.5,
          powerConsumption: 125,
          timestamp: new Date(),
        },
      });
    }
  }, [system, updateSystem]);

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Energy Recovery Ventilator System</h1>
      
      {system ? (
        <div className="space-y-6">
          <ERVMonitor systemId={system.id} />
          
          <div className="bg-blue-50 p-4 rounded-lg">
            <h2 className="text-lg font-semibold mb-2">System Information</h2>
            <p><strong>ID:</strong> {system.id}</p>
            <p><strong>Name:</strong> {system.name}</p>
            <p><strong>Location:</strong> {system.locationId}</p>
            <p><strong>Status:</strong> {system.isActive ? 'Active' : 'Inactive'}</p>
          </div>
        </div>
      ) : (
        <div className="bg-gray-100 p-4 rounded-lg">
          <p>Initializing ERV system...</p>
        </div>
      )}
    </div>
  );
};

export default ERVExample;