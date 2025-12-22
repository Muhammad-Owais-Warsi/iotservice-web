import React, { useContext } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion, AnimatePresence } from 'framer-motion';
import {
    LayoutDashboard,
    Activity,
    AlertTriangle,
    BarChart2,
    Server,
    LogOut,
    ChevronRight
} from 'lucide-react';

function Layout() {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();

    const handleLogout = () => {
        localStorage.removeItem('token');
        setUser(null);
        navigate('/login');
    };

    const navItems = [
        { path: '/', label: 'Overview', icon: LayoutDashboard },
        { path: '/sensors', label: 'Monitor', icon: Activity },
        { path: '/alerts', label: 'Alert Center', icon: AlertTriangle },
        { path: '/analytics', label: 'Insights', icon: BarChart2 },
        { path: '/devices', label: 'Infrastructure', icon: Server },
    ];

    return (
        <div className="flex h-screen overflow-hidden text-slate-100">
            {/* Sidebar */}
            <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                className="w-72 glass-dark border-r border-white/5 flex flex-col z-50"
            >
                <div className="p-8">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-cyan-400 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Activity className="text-white w-6 h-6" />
                        </div>
                        <span className="text-xl font-bold tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-slate-400">
                            ColdChain
                        </span>
                    </div>
                </div>

                <nav className="flex-1 px-4 space-y-1">
                    {navItems.map((item) => {
                        const Icon = item.icon;
                        const isActive = location.pathname === item.path;

                        return (
                            <Link key={item.path} to={item.path}>
                                <motion.div
                                    whileHover={{ x: 4 }}
                                    className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all duration-300 ${isActive
                                            ? 'bg-blue-600/20 text-blue-400 border border-blue-500/20'
                                            : 'text-slate-400 hover:text-slate-100 hover:bg-white/5'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <Icon className={`w-5 h-5 mr-3 transition-colors ${isActive ? 'text-blue-400' : 'group-hover:text-blue-400'}`} />
                                        <span className="font-medium">{item.label}</span>
                                    </div>
                                    {isActive && (
                                        <motion.div layoutId="active" className="w-1.5 h-1.5 rounded-full bg-blue-400 shadow-[0_0_8px_rgba(96,165,250,0.6)]" />
                                    )}
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 mt-auto border-t border-white/5">
                    <div className="flex items-center p-3 rounded-2xl bg-white/5 border border-white/5 mb-4 px-4 overflow-hidden">
                        <div className="relative group cursor-pointer shrink-0">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-cyan-400 rounded-full opacity-30 group-hover:opacity-100 transition duration-500 blur-sm"></div>
                            <div className="relative w-10 h-10 rounded-full bg-slate-900 flex items-center justify-center text-sm font-bold border border-white/10 shrink-0">
                                {user?.name?.charAt(0) || 'U'}
                            </div>
                        </div>
                        <div className="ml-4 truncate">
                            <p className="text-sm font-semibold text-white truncate">{user?.name || 'Demo User'}</p>
                            <p className="text-xs text-slate-500 truncate">{user?.role || 'Admin'}</p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3 text-sm font-medium text-slate-400 hover:text-red-400 hover:bg-red-400/10 rounded-xl transition-all border border-transparent hover:border-red-400/20"
                    >
                        <LogOut className="w-4 h-4 mr-3" />
                        Sign Out
                    </motion.button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-hidden flex flex-col">
                <div className="absolute top-0 left-0 w-full h-32 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none"></div>
                <div className="flex-1 overflow-auto custom-scrollbar relative">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.3 }}
                            className="p-8 max-w-[1600px] mx-auto min-h-full"
                        >
                            <Outlet />
                        </motion.div>
                    </AnimatePresence>
                </div>
            </main>
        </div>
    );
}

export default Layout;
