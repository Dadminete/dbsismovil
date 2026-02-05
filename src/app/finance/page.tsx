'use client';

import { useState, useEffect } from 'react';
import { motion } from 'react-query'; // Error: should be framer-motion
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

export default function FinancePage() {
    const [data, setData] = useState<any>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const res = await fetch('/api/finance/daily-summary');
            const json = await res.json();
            setData(json);
        } catch (error) {
            console.error('Error fetching summary:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) return (
        <div className="min-h-screen bg-[#0A0A0A] flex items-center justify-center">
            <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-gold"></div>
        </div>
    );

    return (
        <div className="min-h-screen bg-[#0A0A0A] text-white pb-32">
            {/* Header */}
            <header className="p-6 pt-12 flex items-center justify-between sticky top-0 bg-[#0A0A0A]/80 backdrop-blur-md z-40 border-b border-white/5">
                <div className="flex items-center gap-4">
                    <Link href="/" className="p-2 glass rounded-full text-gray-400">
                        <ArrowLeft size={20} />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-black uppercase tracking-tighter italic gold-text-gradient">Finanzas</h1>
                        <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest">Resumen del día</p>
                    </div>
                </div>
            </header>

            <main className="p-6 flex flex-col gap-8">
                {/* Today Summary Cards */}
                <div className="grid grid-cols-1 gap-4">
                    <div className="glass-gold p-6 rounded-[35px] relative overflow-hidden group">
                        <div className="absolute top-0 right-0 p-8 opacity-10 group-hover:scale-110 transition-transform">
                            <TrendingUp size={80} />
                        </div>
                        <p className="text-[10px] font-black uppercase tracking-[0.2em] text-black/60 mb-1">Balance Neto Hoy</p>
                        <h2 className="text-4xl font-black tracking-tighter text-black italic">
                            RD$ {parseFloat(data.today.net).toLocaleString()}
                        </h2>
                        <div className="mt-4 flex gap-4">
                            <div className="flex items-center gap-1.5 bg-white/20 px-3 py-1 rounded-full text-[10px] font-black text-black/80">
                                <ArrowUpRight size={12} />
                                +{parseFloat(data.today.income).toLocaleString()}
                            </div>
                            <div className="flex items-center gap-1.5 bg-black/10 px-3 py-1 rounded-full text-[10px] font-black text-black/60">
                                <ArrowDownRight size={12} />
                                -{parseFloat(data.today.expense).toLocaleString()}
                            </div>
                        </div>
                    </div>
                </div>

                {/* Balances Section */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 italic">Saldos Disponibles</h3>
                    </div>

                    <div className="flex overflow-x-auto gap-4 pb-2 scrollbar-none">
                        {data.cajas.map((c: any) => (
                            <div key={c.id} className="min-w-[200px] glass p-5 rounded-3xl border border-white/5 flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-gold">
                                    <Wallet size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-wider">{c.nombre}</span>
                                </div>
                                <p className="text-lg font-black tracking-tight italic">
                                    RD$ {parseFloat(c.saldo_actual).toLocaleString()}
                                </p>
                            </div>
                        ))}
                        {data.accounts.map((a: any) => (
                            <div key={a.id} className="min-w-[200px] glass p-5 rounded-3xl border border-white/5 flex flex-col gap-3">
                                <div className="flex items-center gap-2 text-blue-400">
                                    <CreditCard size={16} />
                                    <span className="text-[10px] font-black uppercase tracking-wider">{a.banco_nombre}</span>
                                </div>
                                <p className="text-lg font-black tracking-tight italic">
                                    {a.numero_cuenta}
                                </p>
                                <span className="text-[9px] text-gray-500 font-bold uppercase truncate">{a.nombre_oficial_cuenta}</span>
                            </div>
                        ))}
                    </div>
                </section>

                {/* Recent Movements */}
                <section className="flex flex-col gap-4">
                    <div className="flex items-center justify-between px-2">
                        <h3 className="text-xs font-black uppercase tracking-widest text-gray-400 italic">Movimientos Recientes</h3>
                        <div className="text-[9px] text-gold font-black uppercase tracking-widest cursor-pointer hover:underline">Ver Todo</div>
                    </div>

                    <div className="flex flex-col gap-3">
                        {data.recent.length === 0 ? (
                            <div className="glass p-12 rounded-[30px] border border-dashed border-white/10 flex flex-col items-center justify-center opacity-50">
                                <Calendar size={32} className="mb-4 text-gray-600" />
                                <p className="text-[10px] font-black uppercase tracking-widest">Sin movimientos recientes</p>
                            </div>
                        ) : (
                            data.recent.map((m: any) => (
                                <framerMotion.div
                                    key={m.id}
                                    whileTap={{ scale: 0.98 }}
                                    className="glass p-4 rounded-3xl border border-white/5 flex items-center justify-between group"
                                >
                                    <div className="flex items-center gap-4">
                                        <div className={`p-3 rounded-2xl ${m.tipo === 'ingreso' ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                                            {m.tipo === 'ingreso' ? <ArrowUpRight size={18} /> : <ArrowDownRight size={18} />}
                                        </div>
                                        <div>
                                            <p className="text-xs font-black tracking-tight text-white mb-0.5">{m.categoria_nombre || 'Sin categoría'}</p>
                                            <p className="text-[9px] text-gray-500 font-bold uppercase tracking-widest">{new Date(m.fecha).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className={`text-sm font-black italic tracking-tighter ${m.tipo === 'ingreso' ? 'text-green-400' : 'text-red-400'}`}>
                                            {m.tipo === 'ingreso' ? '+' : '-'} RD$ {parseFloat(m.monto).toLocaleString()}
                                        </p>
                                        <p className="text-[8px] text-gray-600 font-bold uppercase tracking-tighter truncate max-w-[80px]">{m.descripcion || '--'}</p>
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
