import { createContext } from 'react';

export const SensorContext = createContext({
    sensorData: [],
    setSensorData: () => { },
    alerts: [],
    setAlerts: () => { }
});
