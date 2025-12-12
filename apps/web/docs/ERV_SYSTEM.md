# Counter-Flow Energy Recovery Ventilator (ERV) System

## Overview

This document describes the implementation of a Counter-Flow Energy Recovery Ventilator (ERV) system within the AnythingIoT application. The ERV system is designed to recover energy from exhaust air and precondition incoming fresh air, which is particularly beneficial for cold chain logistics applications.

## System Components

### 1. Data Structures

#### ERVData Interface
```typescript
interface ERVData {
  supplyAirTemp: number;        // Supply air temperature (°C)
  exhaustAirTemp: number;       // Exhaust air temperature (°C)
  supplyAirHumidity: number;    // Supply air humidity (%)
  exhaustAirHumidity: number;   // Exhaust air humidity (%)
  airflowRate: number;          // Airflow rate (m³/h)
  efficiency: number;           // Heat recovery efficiency (%)
  powerConsumption: number;     // Power consumption (W)
  timestamp: Date;             // Data timestamp
}
```

#### ERVSystem Interface
```typescript
interface ERVSystem {
  id: string;                  // Unique identifier
  name: string;                // System name
  locationId: string;          // Associated location
  isActive: boolean;           // System status
  currentData: ERVData | null; // Current operational data
}
```

### 2. Calculation Functions

#### Heat Recovery Calculation
Calculates the temperature of air after heat recovery:
```
Recovered Temperature = Supply Inlet + (Efficiency × (Exhaust Inlet - Supply Inlet))
```

#### Moisture Recovery Calculation
Calculates the humidity level after moisture recovery:
```
Recovered Humidity = Supply Inlet + (Efficiency × (Exhaust Inlet - Supply Inlet))
```

#### Energy Savings Calculation
Calculates energy savings from the ERV system:
```
Energy Savings = Airflow Rate × Density × Specific Heat × ΔT
```

### 3. React Hook (useERVSystem)

A custom React hook that provides functionality for managing ERV systems:

#### Functions Available
- `initializeERV(system: ERVSystem)` - Initialize an ERV system
- `updateERVData(data: ERVData)` - Update system data
- `getHeatRecovery(): number | null` - Calculate heat recovery
- `getMoistureRecovery(): number | null` - Calculate moisture recovery
- `getEnergySavings(): number | null` - Calculate energy savings
- `toggleERVSystem()` - Toggle system on/off
- `simulateERVData()` - Generate simulated data for testing

### 4. React Context (ERVSystemContext)

Provides application-wide access to ERV system data:

```typescript
interface ERVSystemContextType {
  system: ERVSystem | null;
  updateSystem: (system: ERVSystem) => void;
}
```

## Implementation Files

1. `src/app/root.tsx` - Contains ERV system context and core calculations
2. `src/hooks/useERVSystem.ts` - Custom hook for ERV system management
3. `src/components/ERVMonitor.tsx` - UI component for displaying ERV data

## Usage

### Initializing an ERV System
```typescript
const { initializeERV } = useERVSystem();
initializeERV({
  id: "erv-001",
  name: "Main Facility ERV",
  locationId: "loc-123",
  isActive: true,
  currentData: null
});
```

### Updating System Data
```typescript
const { updateERVData } = useERVSystem();
updateERVData({
  supplyAirTemp: 22.5,
  exhaustAirTemp: 28.3,
  supplyAirHumidity: 45.2,
  exhaustAirHumidity: 58.7,
  airflowRate: 350,
  efficiency: 82.5,
  powerConsumption: 125,
  timestamp: new Date()
});
```

### Calculating Performance Metrics
```typescript
const { getHeatRecovery, getEnergySavings } = useERVSystem();
const recoveredTemp = getHeatRecovery(); // Returns temperature in °C
const energySaved = getEnergySavings(); // Returns energy in kW
```

## Benefits for Cold Chain Logistics

1. **Energy Efficiency**: Reduces HVAC energy consumption by recovering energy from exhaust air
2. **Environmental Control**: Maintains consistent temperature and humidity levels
3. **Cost Savings**: Lowers operational costs through reduced energy usage
4. **Sustainability**: Reduces carbon footprint of facilities
5. **Improved Air Quality**: Ensures continuous fresh air circulation

## Integration Points

The ERV system integrates with:
- Facility monitoring dashboards
- Alert systems for efficiency drops
- Reporting modules for energy savings tracking
- IoT sensors for real-time data collection

## Future Enhancements

1. Integration with predictive maintenance algorithms
2. Advanced analytics for optimization recommendations
3. Multi-unit system coordination
4. Integration with weather forecasting for proactive adjustments