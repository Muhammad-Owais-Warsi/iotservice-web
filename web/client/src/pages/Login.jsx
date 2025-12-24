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
            {/* Ambient Background Elements */}
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-slate-200/40 blur-[120px] rounded-full"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-blue-100/40 blur-[120px] rounded-full"></div>

            <div className="relative z-10 w-full max-w-lg px-6">
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ duration: 0.6, ease: "easeOut" }}
                    className="glass-card p-10 rounded-[3rem] border border-slate-100 shadow-2xl bg-white/80 backdrop-blur-2xl"
                >
                    <div className="text-center mb-10">
                        <motion.div
                            initial={{ scale: 0.5, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            transition={{ delay: 0.2, type: "spring", stiffness: 200 }}
                            className="inline-flex items-center justify-center w-20 h-20 rounded-3xl bg-slate-900 mb-6 shadow-xl shadow-slate-900/10"
                        >
                            <ShieldCheck className="text-white w-10 h-10" />
                        </motion.div>
                        <h1 className="text-4xl font-black text-slate-900 tracking-tight-head mb-2">
                            Security Gateway
                        </h1>
                        <p className="text-slate-500 font-medium tracking-wide">Authorized Personnel Only</p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        {error && (
                            <motion.div
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                className="bg-rose-50 border border-rose-100 text-rose-600 p-4 rounded-2xl text-sm font-bold flex items-center"
                            >
                                <Lock size={16} className="mr-3" />
                                {error}
                            </motion.div>
                        )}

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                                Identification
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                                    <Mail size={18} />
                                </div>
                                <input
                                    type="email"
                                    required
                                    placeholder="operator@coldchain.inc"
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-medium"
                                    value={email}
                                    onChange={(e) => setEmail(e.target.value)}
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <label className="text-xs font-black text-slate-400 uppercase tracking-[0.2em] ml-2">
                                Security Key
                            </label>
                            <div className="relative group">
                                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-slate-400 group-focus-within:text-slate-900 transition-colors">
                                    <Lock size={18} />
                                </div>
                                <input
                                    type="password"
                                    required
                                    placeholder="••••••••"
                                    className="block w-full pl-12 pr-4 py-4 bg-slate-50 border border-slate-100 rounded-2xl text-slate-900 placeholder-slate-300 focus:outline-none focus:ring-2 focus:ring-slate-900/5 focus:border-slate-900 transition-all font-medium"
                                    value={password}
                                    onChange={(e) => setPassword(e.target.value)}
                                />
                            </div>
                        </div>

                        <motion.button
                            whileHover={{ scale: 1.01, y: -2 }}
                            whileTap={{ scale: 0.99 }}
                            type="submit"
                            className="w-full flex justify-center items-center py-5 px-6 bg-slate-900 text-white rounded-2xl font-black text-sm uppercase tracking-widest transition-all shadow-xl shadow-slate-900/10 group active:scale-95"
                        >
                            Authorize Access
                            <ArrowRight size={18} className="ml-3 group-hover:translate-x-1 transition-transform" />
                        </motion.button>
                    </form>

                    <div className="mt-10 pt-8 border-t border-slate-50 text-center">
                        <p className="text-slate-400 text-[10px] font-bold uppercase tracking-widest leading-loose">
                            Secured Industrial Node v4.1.0<br />
                            © ColdChain Dynamics 2024
                        </p>
                    </div>
                </motion.div>

                {/* Visual Accent */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 1 }}
                    className="mt-8 flex justify-center space-x-6 text-slate-400 font-bold text-[10px] uppercase tracking-[0.3em]"
                >
                    <span className="cursor-pointer hover:text-slate-900 transition-colors">Support</span>
                    <span className="cursor-pointer hover:text-slate-900 transition-colors">Internal API</span>
                    <span className="cursor-pointer hover:text-slate-900 transition-colors">Nodes</span>
                </motion.div>
            </div>
        </div>
    );
}

export default Login;
