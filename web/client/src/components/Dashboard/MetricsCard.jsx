import React from 'react';
import { motion } from 'framer-motion';
import { TrendingUp, TrendingDown, Minus } from 'lucide-react';

function MetricsCard({ title, value, trend, color, icon: Icon }) {
    const isPositive = trend.includes('↑') || trend.includes('✅');
    const isNegative = trend.includes('↓') || trend.includes('⚠️');

    const colorVariants = {
        blue: 'from-blue-500/20 to-cyan-500/20 text-blue-400 border-blue-500/20',
        green: 'from-emerald-500/20 to-teal-500/20 text-emerald-400 border-emerald-500/20',
        red: 'from-rose-500/20 to-red-500/20 text-rose-400 border-rose-500/20',
        yellow: 'from-amber-500/20 to-orange-500/20 text-amber-400 border-amber-500/20',
    };

    const selectedVariant = colorVariants[color] || colorVariants.blue;

    return (
        <motion.div
            whileHover={{ y: -6, scale: 1.02 }}
            className={`bg-white p-8 rounded-[2rem] relative overflow-hidden flex flex-col justify-between h-full border border-slate-100 shadow-sm transition-all duration-400 hover:shadow-xl hover:shadow-slate-200/50`}
        >
            {/* Architectural Glow */}
            <div className={`absolute -top-16 -right-16 w-32 h-32 blur-[60px] rounded-full opacity-10 bg-gradient-to-br ${selectedVariant.split(' ').slice(0, 2).join(' ')}`}></div>

            <div className="flex items-start justify-between mb-6 relative z-10">
                <div className="space-y-2">
                    <p className="text-slate-400 text-[10px] font-black uppercase tracking-[0.2em]">{title}</p>
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-4xl font-black text-slate-900 tracking-tighter"
                    >
                        {value}
                    </motion.h2>
                </div>
                {Icon && (
                    <div className={`p-4 rounded-2xl bg-white border border-slate-100 shadow-sm ${selectedVariant.split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>
                        <Icon size={24} strokeWidth={2.5} />
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-3 relative z-10">
                <div className={`flex items-center px-3 py-1.5 rounded-xl text-[10px] font-black uppercase tracking-wider border ${isPositive ? 'bg-emerald-50 text-emerald-600 border-emerald-100' : isNegative ? 'bg-rose-50 text-rose-600 border-rose-100' : 'bg-slate-50 text-slate-500 border-slate-100'
                    }`}>
                    {isPositive ? <TrendingUp size={12} className="mr-2" /> : isNegative ? <TrendingDown size={12} className="mr-2" /> : <Minus size={12} className="mr-2" />}
                    {trend}
                </div>
                <span className="text-[9px] text-slate-300 font-bold uppercase tracking-widest">vs prev epoch</span>
            </div>
        </motion.div>
    );
}

export default MetricsCard;
