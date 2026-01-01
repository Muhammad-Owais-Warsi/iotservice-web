import React, { useEffect, useState } from "react";
import {
    BrowserRouter as Router,
    Routes,
    Route,
    Navigate,
} from "react-router-dom";
import { AuthContext } from "./context/AuthContext";
import { SensorContext } from "./context/SensorContext";
import socketService from "./services/socketService";

// Pages
import Login from "./pages/Login";
import Layout from "./pages/Layout";
import Dashboard from "./components/Dashboard/Dashboard";
import SensorMonitor from "./components/Sensors/SensorMonitor";
import AlertCenter from "./components/Alerts/AlertCenter";
import Analytics from "./components/Analytics/Analytics";
import DeviceList from "./components/Devices/DeviceList";
import TicketCenter from "./components/Ticketing/TicketCenter";
import AdminDashboard from "./components/Admin/AdminDashboard";
import UserManagement from "./components/Users/UserManagement";

function App() {
    const [authUser, setAuthUser] = useState(null);
    const [sensorData, setSensorData] = useState([]);
    const [alerts, setAlerts] = useState([]);
    const [loading, setLoading] = useState(true);

    // Initialize socket connection
    useEffect(() => {
        socketService.connect();

        // Listen for real-time sensor updates
        socketService.on("sensor-update", (data) => {
            setSensorData((prev) => [...prev, data]);
        });

        // Listen for real-time alerts
        socketService.on("alert", (alert) => {
            setAlerts((prev) => [alert, ...prev]);
        });

        return () => {
            socketService.disconnect();
        };
    }, []);

    // Check authentication
    useEffect(() => {
        const token = localStorage.getItem("token");
        if (token) {
            // Verify token with backend
            fetch(
                `${import.meta.env.VITE_API_URL || "http://localhost:5000"}/api/auth/verify`,
                {
                    headers: { Authorization: `Bearer ${token}` },
                },
            )
                .then((res) => res.json())
                .then((data) => {
                    if (data.success) {
                        setAuthUser(data.user);
                    } else {
                        localStorage.removeItem("token");
                    }
                })
                .catch(() => {
                    localStorage.removeItem("token");
                })
                .finally(() => setLoading(false));
        } else {
            setLoading(false);
        }
    }, []);

    if (loading) {
        return (
            <div className="flex items-center justify-center h-screen bg-slate-900 text-white">
                <div className="flex flex-col items-center">
                    <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mb-4"></div>
                    <p className="font-bold tracking-widest uppercase text-xs text-slate-400">
                        Loading ColdChain Intelligence...
                    </p>
                </div>
            </div>
        );
    }

    return (
        <AuthContext.Provider value={{ user: authUser, setUser: setAuthUser }}>
            <SensorContext.Provider
                value={{ sensorData, setSensorData, alerts, setAlerts }}
            >
                <Router>
                    <Routes>
                        <Route path="/login" element={<Login />} />

                        {/* Role-based routing */}
                        {authUser ? (
                            <Route element={<Layout />}>
                                {/* CUERON staff routes */}
                                {(authUser.role === "admin" ||
                                    authUser.role === "CUERON_EMPLOYEE") && (
                                    <>
                                        <Route
                                            path="/"
                                            element={<AdminDashboard />}
                                        />
                                        <Route
                                            path="/admin"
                                            element={<AdminDashboard />}
                                        />
                                        <Route
                                            path="/client/:companyId"
                                            element={<Dashboard />}
                                        />
                                    </>
                                )}

                                {/* MASTER staff routes */}
                                {authUser.role === "MASTER" && (
                                    <>
                                        <Route
                                            path="/"
                                            element={<Dashboard />}
                                        />
                                        <Route
                                            path="/users"
                                            element={<UserManagement />}
                                        />
                                    </>
                                )}

                                {/* EMPLOYEE routes */}
                                {authUser.role === "EMPLOYEE" && (
                                    <Route path="/" element={<Dashboard />} />
                                )}

                                {/* Shared routes */}
                                <Route
                                    path="/sensors"
                                    element={<SensorMonitor />}
                                />
                                <Route
                                    path="/alerts"
                                    element={<AlertCenter />}
                                />
                                <Route
                                    path="/analytics"
                                    element={<Analytics />}
                                />
                                <Route
                                    path="/devices"
                                    element={<DeviceList />}
                                />
                                <Route
                                    path="/tickets"
                                    element={<TicketCenter />}
                                />
                            </Route>
                        ) : (
                            <Route
                                path="*"
                                element={<Navigate to="/login" />}
                            />
                        )}
                    </Routes>
                </Router>
            </SensorContext.Provider>
        </AuthContext.Provider>
    );
}

export default App;
