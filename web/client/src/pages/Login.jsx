import React, { useState, useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Activity, Mail, Lock, ArrowRight, ShieldCheck } from 'lucide-react';

function Login() {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        try {
            const response = await fetch(`${API_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });

            const data = await response.json();

            if (data.success) {
                localStorage.setItem('token', data.token);
                setUser(data.user);
                navigate('/');
            } else {
                setError(data.error || 'Login failed. Please check your credentials.');
            }
        } catch (err) {
            console.error('Login error:', err);
            setError('Unable to connect to security gateway.');
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center relative overflow-hidden bg-white">
            {/* Ambient Background Elements - Airy & Clean */}
            <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] bg-blue-50 blur-[130px] rounded-full opacity-60"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] bg-indigo-50 blur-[130px] rounded-full opacity-60"></div>
            <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-full h-full bg-[url('https://www.transparenttextures.com/patterns/cubes.png')] opacity-[0.03] pointer-events-none"></div>

            <div className="relative z-10 w-full max-w-lg px-6">
                <motion.div
                    initial={{ opacity: 0, y: 30 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.8, ease: [0.16, 1, 0.3, 1] }}
                    className="p-12 rounded-[3.5rem] border border-slate-100 shadow-2xl bg-white/70 backdrop-blur-3xl relative overflow-hidden"
                >
                    {/* Corner Accents */}
                    <div className="absolute top-0 right-0 w-40 h-40 bg-blue-100/30 blur-3xl -mr-20 -mt-20"></div>

                    <div className="text-center mb-12 relative">
                        <motion.div
                            initial={{ scale: 0.8, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.3, type: "spring", stiffness: 150 }}
                            className="inline-flex items-center justify-center w-24 h-24 rounded-[2rem] bg-gradient-to-br from-blue-600 to-indigo-700 mb-8 shadow-2xl shadow-blue-500/30"
                        >
                            <ShieldCheck className="text-white w-12 h-12" />
                        </motion.div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tighter uppercase mb-3 text-balance">
                            COLDCHAIN
                        </h1>
                        <p className="text-blue-600 font-black tracking-[0.25em] text-[10px] uppercase opacity-80">Security Access Terminal // Node 01</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-8 relative">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-rose-50 border border-rose-100 text-rose-600 p-5 rounded-2xl text-[11px] font-black uppercase tracking-wider flex items-center"
                            >
                                <Lock size={14} className="mr-4" />
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                                Operator Identity
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder="operator@coldchain.inc"
                                    className="block w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold text-sm"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-3">
                            <label className="text-[10px] font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                                Access Token
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-5 flex items-center pointer-events-none text-slate-300 group-focus-within:text-blue-600 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="block w-full pl-14 pr-6 py-5 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-blue-100 focus:border-blue-500 transition-all font-bold text-sm"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.02, y: -2 }}
                            whileTap={{ scale: 0.98 }}
                            type="submit"
                            className="w-full flex justify-center items-center py-6 px-8 bg-gradient-to-r from-blue-600 to-indigo-700 text-white rounded-2xl font-black text-xs uppercase tracking-[0.25em] transition-all shadow-xl shadow-blue-500/30 group active:scale-95"
                        >
                            Authorize Uplink
                            <ArrowRight size={18} className="ml-4 group-hover:translate-x-2 transition-transform duration-300" />
                        </motion.button>
                    </form>

                    <div className="mt-12 pt-10 border-t border-slate-50 text-center">
                        <p className="text-slate-400 text-[9px] font-black uppercase tracking-[0.3em] leading-loose">
                            Secured Industrial Node v4.1.0-LIGHT<br />
                            <span className="text-slate-300">© 2024 ColdChain Dynamics // Authorization Req.</span>
                        </p>
                    </div>
                </motion.div>

                {/* Visual Accent */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-10 flex justify-center space-x-10 text-slate-300 font-black text-[9px] uppercase tracking-[0.4em]"
                >
                    <span className="cursor-pointer hover:text-blue-600 transition-colors">Emergency</span>
                    <span className="cursor-pointer hover:text-blue-600 transition-colors">Protocols</span>
                    <span className="cursor-pointer hover:text-blue-600 transition-colors">Support</span>
                </motion.div>
            </div>
        </div>
    );
}

export default Login;
