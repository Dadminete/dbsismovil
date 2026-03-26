'use client';

import { useState, useEffect } from 'react';
import {
    TrendingUp,
    TrendingDown,
    Wallet,
    CreditCard,
    ArrowLeft,
    Plus,
    Search,
    ChevronRight,
    Calendar,
    ArrowUpRight,
    ArrowDownRight,
    DollarSign
} from 'lucide-react';
import { motion as framerMotion } from 'framer-motion';
import Link from 'next/link';

const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('es-DO', {
        style: 'currency',
        currency: 'DOP',
    }).format(amount);
};

export default function FinancePage() {
    const [data, setData] = useState<any>(null);
    const [monthlyData, setMonthlyData] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [selectedYear, setSelectedYear] = useState(new Date().getFullYear());

    const years = [2024, 2025, 2026]; // Simplified year list
    const monthNames = ['Ene', 'Feb', 'Mar', 'Abr', 'May', 'Jun', 'Jul', 'Ago', 'Sep', 'Oct', 'Nov', 'Dic'];

    useEffect(() => {
        fetchData();
        fetchMonthlyData(selectedYear);
    }, [selectedYear]);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/finance/daily-summary');
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error('Error fetching summary:', error);
        } finally {
            if (monthlyData) setLoading(false);
        }
    };

    const fetchMonthlyData = async (year: number) => {
        try {
            const res = await fetch(`/api/finance/monthly-summary?year=${year}`);
            const json = await res.json();
            setMonthlyData(json.monthly);
        } catch (error) {
            console.error('Error fetching monthly summary:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading || !data || !monthlyData) return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gold"></div>
        </div>
    );

    const maxAmount = Math.max(...monthlyData.map((m: any) => Math.max(m.income, m.expense, 1000)));

    return (
        <div className="min-h-screen bg-[#040404] text-white pb-32">
            {/* Header */}
            <header className="p-6 pt-12 flex items-center justify-between sticky top-0 bg-[#040404]/90 backdrop-blur-xl z-40 border-b border-white/10">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 glass-light rounded-2xl text-white shadow-lg">
                        <ArrowLeft size={18} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter italic gold-text-gradient">Estado Financiero</h1>
                        <p className="text-[9px] text-gold/80 font-black uppercase tracking-widest">Control Centralizado</p>
                    </div>
                </div>
                <div className="relative">
                    <select
                        value={selectedYear}
                        onChange={(e) => setSelectedYear(parseInt(e.target.value))}
                        className="bg-gold/10 text-gold border border-gold/30 rounded-xl px-4 py-2 text-xs font-black outline-none appearance-none cursor-pointer pr-10"
                    >
                        {years.map(y => <option key={y} value={y}>{y}</option>)}
                    </select>
                    <div className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none text-gold">
                        <Calendar size={14} />
                    </div>
                </div>
            </header>

            <main className="p-6 flex flex-col gap-10">
                {/* Monthly Chart Card */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black uppercase tracking-[0.2em] text-gold italic">Evolución Mensual {selectedYear}</h3>
                    </div>
                    
                    <div className="glass-light p-6 rounded-[40px] border border-white/20 shadow-2xl relative overflow-hidden">
                        <div className="absolute top-0 left-0 w-full h-full bg-gradient-to-tr from-gold/5 via-transparent to-blue-500/5 pointer-events-none"></div>
                        
                        <div className="flex items-end justify-between h-56 gap-2 relative z-10 pt-8">
                            {monthlyData.map((m: any, i: number) => (
                                <div key={i} className="flex-1 flex flex-col items-center gap-2 h-full justify-end group relative">
                                    {/* Tooltip on Hover */}
                                    <div className="absolute -top-6 left-1/2 -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity bg-black/80 backdrop-blur-md px-2 py-1 rounded-lg border border-white/10 z-20 pointer-events-none whitespace-nowrap">
                                        <p className="text-[7px] font-black text-cyan-400">In: {formatCurrency(m.income)}</p>
                                        <p className="text-[7px] font-black text-rose-400">Out: {formatCurrency(m.expense)}</p>
                                    </div>

                                    <div className="flex gap-1 items-end h-[80%] w-full justify-center">
                                        {/* Income Bar */}
                                        <framerMotion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(m.income / maxAmount) * 100}%` }}
                                            transition={{ type: 'spring', damping: 15, delay: i * 0.05 }}
                                            className="w-1 sm:w-1.5 bg-gradient-to-t from-cyan-600 to-cyan-300 rounded-full shadow-[0_0_10px_rgba(6,182,212,0.3)]"
                                        />
                                        {/* Expense Bar */}
                                        <framerMotion.div
                                            initial={{ height: 0 }}
                                            animate={{ height: `${(m.expense / maxAmount) * 100}%` }}
                                            transition={{ type: 'spring', damping: 15, delay: i * 0.05 + 0.1 }}
                                            className="w-1 sm:w-1.5 bg-gradient-to-t from-rose-600 to-rose-300 rounded-full shadow-[0_0_10px_rgba(225,29,72,0.3)]"
                                        />
                                    </div>
                                    <span className="text-[7px] font-black text-white/40 group-hover:text-gold transition-colors">{monthNames[i]}</span>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-center gap-6 pt-4 border-t border-white/5">
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-cyan-500 shadow-[0_0_8px_rgba(6,182,212,0.8)]"></div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/80">Ingresos</span>
                                </div>
                            </div>
                            <div className="flex flex-col items-center gap-1">
                                <div className="flex items-center gap-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-rose-500 shadow-[0_0_8px_rgba(225,29,72,0.8)]"></div>
                                    <span className="text-[8px] font-black uppercase tracking-widest text-white/80">Gastos</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Today Summary Cards */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="bg-gradient-to-br from-gold via-[#e5c158] to-gold-muted p-8 rounded-[40px] relative overflow-hidden group border border-white/20 shadow-[0_20px_50px_rgba(212,175,55,0.2)]">
                        <div className="absolute -top-10 -right-10 p-20 opacity-10 group-hover:scale-125 transition-transform duration-700">
                            <DollarSign size={140} className="text-black" />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.3em] text-black/80 mb-2 drop-shadow-sm">Neto Operativo Hoy</p>
                        <h2 className="text-5xl font-black tracking-tighter text-black italic drop-shadow-md">
                            {formatCurrency(data.today.net)}
                        </h2>
                        <div className="mt-6 flex gap-4">
                            <div className="flex items-center gap-2 bg-black/10 backdrop-blur-sm px-4 py-2 rounded-2xl text-[11px] font-black text-black">
                                <ArrowUpRight size={14} className="text-blue-900" />
                                {formatCurrency(data.today.income)}
                            </div>
                            <div className="flex items-center gap-2 bg-black/10 backdrop-blur-sm px-4 py-2 rounded-2xl text-[11px] font-black text-black">
                                <ArrowDownRight size={14} className="text-red-900" />
                                {formatCurrency(data.today.expense)}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Balances Section */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic">Disponibilidad de Fondos</h3>
                        <div className="p-2 glass-light rounded-xl text-gold">
                            <Search size={14} />
                        </div>
                    </div>

                    <div className="flex overflow-x-auto gap-4 pb-4 scrollbar-none snap-x">
                        {/* 1. Caja Principal */}
                        {data.cajas.filter((c: any) => c.nombre.toLowerCase().includes('principal')).map((c: any) => (
                            <div key={c.id} className="min-w-[220px] snap-center glass-light p-6 rounded-[35px] border border-white/20 shadow-xl flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-gold/20 flex items-center justify-center text-gold">
                                        <Wallet size={16} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-white">Caja Principal</span>
                                </div>
                                <p className="text-2xl font-black tracking-tight italic text-gold">
                                    {formatCurrency(c.saldo_actual)}
                                </p>
                            </div>
                        ))}

                        {/* 2. Papelería */}
                        {data.cajas.filter((c: any) => c.nombre.toLowerCase().includes('papeleria')).map((c: any) => (
                            <div key={c.id} className="min-w-[220px] snap-center glass-light p-6 rounded-[35px] border border-white/20 shadow-xl flex flex-col gap-4">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                                        <TrendingUp size={16} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-white">Papelería</span>
                                </div>
                                <p className="text-2xl font-black tracking-tight italic text-cyan-400">
                                    {formatCurrency(c.saldo_actual)}
                                </p>
                            </div>
                        ))}

                        {/* 3. Other Cajas */}
                        {data.cajas.filter((c: any) => !c.nombre.toLowerCase().includes('principal') && !c.nombre.toLowerCase().includes('papeleria')).map((c: any) => (
                            <div key={c.id} className="min-w-[220px] snap-center glass-light p-6 rounded-[35px] border border-white/20 shadow-xl flex flex-col gap-4 opacity-80 hover:opacity-100 transition-opacity">
                                <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-xl bg-white/10 flex items-center justify-center text-gray-300">
                                        <Wallet size={16} />
                                    </div>
                                    <span className="text-[10px] font-black uppercase tracking-wider text-white">{c.nombre}</span>
                                </div>
                                <p className="text-2xl font-black tracking-tight italic text-white/90">
                                    {formatCurrency(c.saldo_actual)}
                                </p>
                            </div>
                        ))}

                        {/* 4. Banks */}
                        {data.accounts.map((a: any) => (
                            <div key={a.id} className="min-w-[280px] snap-center glass-light p-6 rounded-[35px] border border-blue-500/40 shadow-blue-500/10 shadow-xl flex flex-col gap-4 group hover:scale-[1.02] transition-transform">
                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-3">
                                        <div className="w-8 h-8 rounded-xl bg-blue-500/20 flex items-center justify-center text-blue-400">
                                            <CreditCard size={16} />
                                        </div>
                                        <div className="flex flex-col">
                                            <span className="text-[10px] font-black uppercase tracking-wider text-blue-100">{a.banco_nombre}</span>
                                            <span className="text-[7px] text-blue-400/60 font-black uppercase tracking-tighter">{a.nombre_oficial_cuenta || 'Cuenta Bancaria'}</span>
                                        </div>
                                    </div>
                                    <span className="text-[8px] bg-blue-500/10 text-blue-300 font-black px-2 py-0.5 rounded-lg border border-blue-500/20">{a.moneda || 'DOP'}</span>
                                </div>
                                <div className="py-1">
                                    <p className="text-2xl font-black tracking-tight italic text-white drop-shadow-lg">
                                        {formatCurrency(a.saldo_actual || 0)}
                                    </p>
                                    <div className="flex items-center gap-2 mt-1">
                                        <span className="text-[9px] text-blue-400 font-black uppercase tracking-tighter">{a.tipo_cuenta || 'Ahorros'}</span>
                                        <span className="w-1 h-1 rounded-full bg-blue-500/30"></span>
                                        <span className="text-[9px] text-blue-500/80 font-mono font-black tracking-widest">{a.numero_cuenta}</span>
                                    </div>
                                </div>
                                <div className="flex justify-between items-center border-t border-white/10 pt-3">
                                    <span className="text-[7px] text-gray-500 font-black uppercase italic">ID: {a.id.slice(0, 8)}</span>
                                    <div className="w-6 h-6 rounded-lg bg-blue-500/10 flex items-center justify-center text-blue-500/40 opacity-0 group-hover:opacity-100 transition-opacity">
                                        <ChevronRight size={12} />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recent Movements */}
                <section className="flex flex-col gap-6">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-[10px] font-black uppercase tracking-widest text-gray-300 italic">Cronología de Actividad</h3>
                        <div className="text-[8px] text-gold font-black uppercase tracking-[0.2em] cursor-pointer hover:bg-gold/10 px-3 py-1 rounded-full border border-gold/20 transition-all">Reporte Completo</div>
                    </div>

                    <div className="flex flex-col gap-4">
                        {data.recent.length === 0 ? (
                            <div className="glass-light p-16 rounded-[40px] border border-dashed border-white/20 flex flex-col items-center justify-center opacity-40">
                                <Calendar size={40} className="mb-4 text-gray-600" />
                                <p className="text-[10px] font-black uppercase tracking-[0.3em]">Sin actividad registrada</p>
                            </div>
                        ) : (
                            data.recent.map((m: any, idx: number) => (
                                <framerMotion.div
                                    key={m.id}
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: idx * 0.05 }}
                                    whileTap={{ scale: 0.98 }}
                                    className="glass-light p-5 rounded-[30px] border border-white/10 flex items-center justify-between group hover:border-white/30 transition-all active:bg-white/5"
                                >
                                    <div className="flex items-center gap-5">
                                        <div className={`w-12 h-12 rounded-2xl flex items-center justify-center shadow-lg transition-transform group-hover:scale-110 ${
                                            m.tipo === 'ingreso' 
                                            ? 'bg-cyan-500/20 text-cyan-400 shadow-cyan-500/10' 
                                            : 'bg-rose-500/20 text-rose-400 shadow-rose-500/10'
                                        }`}>
                                            {m.tipo === 'ingreso' ? <ArrowUpRight size={20} /> : <ArrowDownRight size={20} />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black tracking-tight text-white mb-1 uppercase group-hover:text-gold transition-colors">{m.categoria_nombre || 'Operación General'}</p>
                                            <p className="text-[8px] text-white/40 font-black uppercase tracking-[0.2em]">{new Date(m.fecha).toLocaleDateString('es-DO', { day: '2-digit', month: 'long', year: 'numeric' })}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-base font-black italic tracking-tighter ${m.tipo === 'ingreso' ? 'text-cyan-400' : 'text-rose-400'}`}>
                                            {m.tipo === 'ingreso' ? '+' : '-'} RD$ {parseFloat(m.monto).toLocaleString()}
                                        </p>
                                        <div className="flex items-center justify-end gap-1 mt-1">
                                            <span className="text-[9px] text-white/30 font-black uppercase tracking-tighter truncate max-w-[100px] group-hover:text-white/60">{m.descripcion || '--'}</span>
                                        </div>
                                    </div>
                                </framerMotion.div>
                            ))
                        )}
                    </div>
                </section>
            </main>
        </div>
    );
}
