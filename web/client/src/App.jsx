import React, { useEffect, useState } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthContext } from './context/AuthContext';
import { SensorContext } from './context/SensorContext';
import socketService from './services/socketService';

// Pages
import Login from './pages/Login';
import Layout from './pages/Layout';
import Dashboard from './components/Dashboard/Dashboard';
import SensorMonitor from './components/Sensors/SensorMonitor';
import AlertCenter from './components/Alerts/AlertCenter';
import Analytics from './components/Analytics/Analytics';
import DeviceList from './components/Devices/DeviceList';
import TicketCenter from './components/Ticketing/TicketCenter';

function App() {
  const [authUser, setAuthUser] = useState(null);
  const [sensorData, setSensorData] = useState([]);
  const [alerts, setAlerts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Initialize socket connection
  useEffect(() => {
    socketService.connect();

    // Listen for real-time sensor updates
    socketService.on('sensor-update', (data) => {
      setSensorData(prev => [...prev, data]);
    });

    // Listen for real-time alerts
    socketService.on('alert', (alert) => {
      setAlerts(prev => [alert, ...prev]);
    });

    return () => {
      socketService.disconnect();
    };
  }, []);

  // Check authentication
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      // Verify token with backend
      fetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api/auth/verify`, {
        headers: { Authorization: `Bearer ${token}` }
      })
        .then(res => res.json())
        .then(data => {
          if (data.success) {
            setAuthUser(data.user);
          } else {
            localStorage.removeItem('token');
            setLoading(false); // Ensure loading stops even on failure
          }
        })
        .catch(() => {
          localStorage.removeItem('token');
          setLoading(false);
        })
        .finally(() => setLoading(false));
    } else {
      setLoading(false);
    }
  }, []);

  if (loading) {
    return <div className="flex items-center justify-center h-screen">Loading...</div>;
  }

  return (
    <AuthContext.Provider value={{ user: authUser, setUser: setAuthUser }}>
      <SensorContext.Provider value={{ sensorData, setSensorData, alerts, setAlerts }}>
        <Router>
          <Routes>
            <Route path="/login" element={<Login />} />

            {/* Temporarily allow access even if not logged in for dev, or follow strict guide */}
            {/* Guide logic: */}
            {authUser ? (
              <Route element={<Layout />}>
                <Route path="/" element={<Dashboard />} />
                <Route path="/sensors" element={<SensorMonitor />} />
                <Route path="/alerts" element={<AlertCenter />} />
                <Route path="/analytics" element={<Analytics />} />
                <Route path="/devices" element={<DeviceList />} />
                <Route path="/tickets" element={<TicketCenter />} />
              </Route>
            ) : (
              <Route path="*" element={<Navigate to="/login" />} />
            )}
          </Routes>
        </Router>
      </SensorContext.Provider>
    </AuthContext.Provider>
  );
}

export default App;