import { useContext, useState } from 'react';
import { ERVSystemContext } from '../app/root';

// Types for ERV system
interface ERVData {
  supplyAirTemp: number; // Supply air temperature (°C)
  exhaustAirTemp: number; // Exhaust air temperature (°C)
  supplyAirHumidity: number; // Supply air humidity (%)
  exhaustAirHumidity: number; // Exhaust air humidity (%)
  airflowRate: number; // Airflow rate (m³/h)
  efficiency: number; // Heat recovery efficiency (%)
  powerConsumption: number; // Power consumption (W)
  timestamp: Date; // Data timestamp
}

interface ERVSystem {
  id: string;
  name: string;
  locationId: string;
  isActive: boolean;
  currentData: ERVData | null;
}

// ERV calculation functions
const calculateHeatRecovery = (
  supplyInletTemp: number,
  exhaustInletTemp: number,
  efficiency: number
): number => {
  // Formula: Recovered Temperature = Supply Inlet + (Efficiency × (Exhaust Inlet - Supply Inlet))
  return supplyInletTemp + (efficiency / 100) * (exhaustInletTemp - supplyInletTemp);
};

const calculateMoistureRecovery = (
  supplyInletHumidity: number,
  exhaustInletHumidity: number,
  efficiency: number
): number => {
  // Formula: Recovered Humidity = Supply Inlet + (Efficiency × (Exhaust Inlet - Supply Inlet))
  return supplyInletHumidity + (efficiency / 100) * (exhaustInletHumidity - supplyInletHumidity);
};

const calculateEnergySavings = (
  airflowRate: number,
  supplyInletTemp: number,
  recoveredTemp: number,
  specificHeat: number = 1.006 // Specific heat of air kJ/kg·K
): number => {
  // Formula: Energy Savings = Airflow Rate × Density × Specific Heat × ΔT
  const density = 1.2; // kg/m³ (approximate density of air)
  const deltaT = Math.abs(recoveredTemp - supplyInletTemp);
  return (airflowRate * density * specificHeat * deltaT) / 1000; // kW
};

// Custom hook for ERV System
export const useERVSystem = () => {
  const { system, updateSystem } = useContext(ERVSystemContext);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Initialize ERV system
  const initializeERV = (systemData: ERVSystem) => {
    try {
      setIsLoading(true);
      updateSystem(systemData);
      setIsLoading(false);
    } catch (err) {
      setError('Failed to initialize ERV system');
      setIsLoading(false);
    }
  };

  // Update ERV data
  const updateERVData = (data: ERVData) => {
    if (!system) {
      setError('ERV system not initialized');
      return;
    }
    
    try {
      setIsLoading(true);
      updateSystem({
        ...system,
        currentData: data,
      });
      setIsLoading(false);
    } catch (err) {
      setError('Failed to update ERV data');
      setIsLoading(false);
    }
  };

  // Calculate heat recovery
  const getHeatRecovery = (): number | null => {
    if (!system?.currentData) return null;
    
    const { supplyAirTemp, exhaustAirTemp, efficiency } = system.currentData;
    return calculateHeatRecovery(supplyAirTemp, exhaustAirTemp, efficiency);
  };

  // Calculate moisture recovery
  const getMoistureRecovery = (): number | null => {
    if (!system?.currentData) return null;
    
    const { supplyAirHumidity, exhaustAirHumidity, efficiency } = system.currentData;
    return calculateMoistureRecovery(supplyAirHumidity, exhaustAirHumidity, efficiency);
  };

  // Calculate energy savings
  const getEnergySavings = (): number | null => {
    if (!system?.currentData) return null;
    
    const { airflowRate, supplyAirTemp, efficiency, exhaustAirTemp } = system.currentData;
    const recoveredTemp = calculateHeatRecovery(supplyAirTemp, exhaustAirTemp, efficiency);
    return calculateEnergySavings(airflowRate, supplyAirTemp, recoveredTemp);
  };

  // Toggle ERV system on/off
  const toggleERVSystem = () => {
    if (!system) {
      setError('ERV system not initialized');
      return;
    }
    
    try {
      setIsLoading(true);
      updateSystem({
        ...system,
        isActive: !system.isActive,
      });
      setIsLoading(false);
    } catch (err) {
      setError('Failed to toggle ERV system');
      setIsLoading(false);
    }
  };

  // Simulate ERV data update (for demonstration)
  const simulateERVData = () => {
    if (!system) {
      setError('ERV system not initialized');
      return;
    }

    try {
      setIsLoading(true);
      // Generate realistic simulation data
      const newData: ERVData = {
        supplyAirTemp: 20 + (Math.random() * 10 - 5), // 15-25°C
        exhaustAirTemp: 25 + (Math.random() * 15 - 7.5), // 17.5-32.5°C
        supplyAirHumidity: 40 + (Math.random() * 20 - 10), // 30-50%
        exhaustAirHumidity: 50 + (Math.random() * 30 - 15), // 35-65%
        airflowRate: 100 + Math.random() * 400, // 100-500 m³/h
        efficiency: 70 + Math.random() * 25, // 70-95%
        powerConsumption: 50 + Math.random() * 100, // 50-150W
        timestamp: new Date(),
      };

      updateSystem({
        ...system,
        currentData: newData,
      });
      setIsLoading(false);
    } catch (err) {
      setError('Failed to simulate ERV data');
      setIsLoading(false);
    }
  };

  return {
    ervSystem: system,
    isLoading,
    error,
    initializeERV,
    updateERVData,
    getHeatRecovery,
    getMoistureRecovery,
    getEnergySavings,
    toggleERVSystem,
    simulateERVData,
  };
};

export type { ERVData, ERVSystem };