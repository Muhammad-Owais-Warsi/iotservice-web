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
    ChevronRight,
    Ticket,
    Users,
    Shield
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

    // Role-based navigation items
    const getNavItems = () => {
        const baseItems = [
            { path: '/sensors', label: 'Monitor', icon: Activity },
            { path: '/alerts', label: 'Alert Center', icon: AlertTriangle },
            { path: '/analytics', label: 'Insights', icon: BarChart2 },
            { path: '/devices', label: 'Infrastructure', icon: Server },
            { path: '/tickets', label: 'Ticketing', icon: Ticket },
        ];

        if (user?.role === 'CUERON_ADMIN' || user?.role === 'CUERON_EMPLOYEE') {
            return [
                { path: '/', label: 'Admin Dashboard', icon: Shield },
                ...baseItems
            ];
        } else if (user?.role === 'MASTER') {
            return [
                { path: '/', label: 'Overview', icon: LayoutDashboard },
                { path: '/users', label: 'Manage Users', icon: Users },
                ...baseItems
            ];
        } else {
            return [
                { path: '/', label: 'Overview', icon: LayoutDashboard },
                ...baseItems
            ];
        }
    };

    const navItems = getNavItems();

    return (
        <div className="flex h-screen overflow-hidden text-slate-900 bg-[#f8fafc]">
            {/* Sidebar */}
            <motion.aside
                initial={{ x: -280 }}
                animate={{ x: 0 }}
                className="w-72 bg-white/90 backdrop-blur-2xl border-r border-slate-200 flex flex-col z-50 shadow-sm"
            >
                <div className="p-8">
                    <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-xl flex items-center justify-center shadow-lg shadow-blue-500/20">
                            <Activity className="text-white w-6 h-6" />
                        </div>
                        <span className="text-2xl font-black tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-blue-700 to-indigo-800">
                            COLDCHAIN
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
                                    className={`group flex items-center justify-between px-4 py-3.5 rounded-2xl transition-all duration-400 ${isActive
                                        ? 'bg-blue-50 text-blue-700 border border-blue-100/50 shadow-sm shadow-blue-500/5'
                                        : 'text-slate-500 hover:text-blue-700 hover:bg-slate-50'
                                        }`}
                                >
                                    <div className="flex items-center">
                                        <Icon className={`w-5 h-5 mr-3 transition-all duration-300 ${isActive ? 'text-blue-600' : 'group-hover:text-blue-600'}`} />
                                        <span className={`font-bold text-sm ${isActive ? 'translate-x-1' : 'group-hover:translate-x-1'} transition-transform duration-300`}>{item.label}</span>
                                    </div>
                                    {isActive && (
                                        <motion.div layoutId="active" className="w-1.5 h-1.5 rounded-full bg-blue-600 shadow-[0_0_8px_rgba(37,99,235,0.4)]" />
                                    )}
                                </motion.div>
                            </Link>
                        );
                    })}
                </nav>

                <div className="p-6 mt-auto border-t border-slate-100">
                    <div className="flex items-center p-3 rounded-2xl bg-slate-50 border border-slate-100 mb-4 px-4 overflow-hidden group hover:border-blue-200 transition-colors">
                        <div className="relative shrink-0">
                            <div className="absolute -inset-0.5 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full opacity-10 group-hover:opacity-30 transition duration-500 blur-sm"></div>
                            <div className="relative w-10 h-10 rounded-full bg-white border border-slate-200 flex items-center justify-center text-sm font-black text-blue-600 shrink-0">
                                {user?.firstName?.charAt(0) || user?.email?.charAt(0) || 'U'}
                            </div>
                        </div>
                        <div className="ml-4 truncate">
                            <p className="text-[10px] font-black text-slate-900 truncate uppercase tracking-wider">
                                {user?.firstName && user?.lastName
                                    ? `${user.firstName} ${user.lastName}`
                                    : user?.email || 'User'}
                            </p>
                            <p className="text-[9px] text-slate-400 truncate font-bold uppercase tracking-widest mt-0.5">
                                {user?.role === 'CUERON_ADMIN' ? 'System Admin' :
                                    user?.role === 'CUERON_EMPLOYEE' ? 'Staff Admin' :
                                        user?.role === 'MASTER' ? 'Lead Controller' :
                                            user?.role === 'EMPLOYEE' ? 'Field Operator' : 'User Session'}
                            </p>
                        </div>
                    </div>
                    <motion.button
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        onClick={handleLogout}
                        className="flex items-center w-full px-4 py-3.5 text-xs font-black text-slate-400 hover:text-rose-600 hover:bg-rose-50 rounded-2xl transition-all border border-transparent hover:border-rose-100 uppercase tracking-widest"
                    >
                        <LogOut className="w-4 h-4 mr-3" />
                        Terminate Session
                    </motion.button>
                </div>
            </motion.aside>

            {/* Main Content */}
            <main className="flex-1 relative overflow-hidden flex flex-col bg-[#f8fafc]">
                <div className="absolute top-0 left-0 w-full h-[400px] bg-gradient-to-b from-blue-500/5 via-transparent to-transparent pointer-events-none"></div>

                <div className="flex-1 overflow-auto custom-scrollbar relative z-10">
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={location.pathname}
                            initial={{ opacity: 0, y: 10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, y: -10 }}
                            transition={{ duration: 0.4, cubicBezier: [0.16, 1, 0.3, 1] }}
                            className="p-10 max-w-[1700px] mx-auto min-h-full"
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
