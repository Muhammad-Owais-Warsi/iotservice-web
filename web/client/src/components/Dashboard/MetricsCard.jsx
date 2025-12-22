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
            whileHover={{ y: -4, scale: 1.02 }}
            className={`glass-card p-6 rounded-3xl relative overflow-hidden flex flex-col justify-between h-full border ${selectedVariant.split(' ').pop()}`}
        >
            {/* Background Glow */}
            <div className={`absolute -top-12 -right-12 w-24 h-24 blur-3xl rounded-full opacity-20 bg-gradient-to-br ${selectedVariant}`}></div>

            <div className="flex items-start justify-between mb-4 relative z-10">
                <div className="space-y-1">
                    <p className="text-slate-400 text-xs font-semibold uppercase tracking-wider">{title}</p>
                    <motion.h2
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        className="text-3xl font-bold text-white tracking-tight"
                    >
                        {value}
                    </motion.h2>
                </div>
                {Icon && (
                    <div className={`p-3 rounded-2xl glass border border-white/5 ${selectedVariant.split(' ').filter(c => c.startsWith('text-')).join(' ')}`}>
                        <Icon size={20} />
                    </div>
                )}
            </div>

            <div className="flex items-center space-x-2 relative z-10">
                <div className={`flex items-center px-2 py-1 rounded-lg text-xs font-bold glass border border-white/5 ${isPositive ? 'text-emerald-400' : isNegative ? 'text-rose-400' : 'text-slate-400'
                    }`}>
                    {isPositive ? <TrendingUp size={12} className="mr-1" /> : isNegative ? <TrendingDown size={12} className="mr-1" /> : <Minus size={12} className="mr-1" />}
                    {trend}
                </div>
                <span className="text-[10px] text-slate-500 font-medium uppercase tracking-tighter">vs last hour</span>
            </div>
        </motion.div>
    );
}

export default MetricsCard;
