'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, Wallet, CreditCard, Book, Calendar, FileText, CheckCircle2, ChevronRight } from 'lucide-react';

interface TransactionModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess?: () => void;
}

export default function TransactionModal({ isOpen, onClose, onSuccess }: TransactionModalProps) {
    const [loading, setLoading] = useState(false);
    const [formData, setFormData] = useState({
        tipo: 'ingreso',
        metodo: 'efectivo',
        monto: '',
        categoria_id: '',
        caja_id: '',
        bank_id: '',
        cuenta_bancaria_id: '',
        descripcion: '',
        fecha: new Date().toISOString().split('T')[0]
    });

    const [formOptions, setFormOptions] = useState<any>({
        cajas: [],
        banks: [],
        accounts: [],
        categories: [],
        papeleriaCategories: []
    });

    useEffect(() => {
        if (isOpen) {
            fetchOptions();
        }
    }, [isOpen]);

    const fetchOptions = async () => {
        try {
            const res = await fetch('/api/finance/form-data');
            const data = await res.json();
            setFormOptions(data);
        } catch (error) {
            console.error('Error fetching form data:', error);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        try {
            const res = await fetch('/api/finance/transactions', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                onSuccess?.();
                onClose();
            }
        } catch (error) {
            console.error('Error saving transaction:', error);
        } finally {
            setLoading(false);
        }
    };

    if (!isOpen) return null;

    const filteredCategories = formData.metodo === 'papeleria'
        ? formOptions.papeleriaCategories
        : formOptions.categories.filter((c: any) =>
            formData.tipo === 'ingreso' ? (c.tipo === 'Ingreso' || c.tipo === 'Activo') : (c.tipo === 'Gasto' || c.tipo === 'Pasivo')
        );

    const accountsForSelectedBank = formOptions.accounts.filter((a: any) => a.bank_id === formData.bank_id);
    const isExpense = formData.tipo === 'gasto';

    return (
        <AnimatePresence>
            <div className="fixed inset-0 z-[60] flex items-end justify-center sm:items-center p-4">
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    onClick={onClose}
                    className="absolute inset-0 bg-black/60 backdrop-blur-sm"
                />

                <motion.div
                    initial={{ y: "100%" }}
                    animate={{ y: 0 }}
                    exit={{ y: "100%" }}
                    transition={{ type: 'spring', damping: 25, stiffness: 300 }}
                    className={`relative w-full max-w-lg bg-[#0F0F0F] rounded-t-[40px] sm:rounded-[40px] border transition-all duration-500 overflow-hidden shadow-2xl ${isExpense ? 'border-red-500/30' : 'border-white/10'
                        }`}
                >
                    <div className={`absolute top-0 inset-x-0 h-1 bg-gradient-to-r from-transparent via-${isExpense ? 'red-500' : 'gold'}/50 to-transparent transition-colors duration-500`}></div>

                    <div className="p-8 pb-10">
                        <header className="flex justify-between items-center mb-8">
                            <h2 className={`text-2xl font-bold tracking-tighter uppercase italic transition-colors duration-500 ${isExpense ? 'text-red-500' : 'gold-text-gradient'}`}>
                                Nueva Operación
                            </h2>
                            <button onClick={onClose} className="p-2 glass rounded-full text-gray-400 hover:text-white transition-colors">
                                <X size={20} />
                            </button>
                        </header>

                        <form onSubmit={handleSubmit} className="flex flex-col gap-6">
                            {/* Tipo Toggle */}
                            <div className="flex p-1.5 glass rounded-2xl">
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, tipo: 'ingreso' })}
                                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.tipo === 'ingreso' ? 'bg-gold text-black italic shadow-lg shadow-gold/20' : 'text-gray-500 hover:text-white'
                                        }`}
                                >
                                    Ingresos
                                </button>
                                <button
                                    type="button"
                                    onClick={() => setFormData({ ...formData, tipo: 'gasto' })}
                                    className={`flex-1 py-3 rounded-xl text-xs font-black uppercase tracking-widest transition-all ${formData.tipo === 'gasto' ? 'bg-red-500 text-white italic shadow-lg shadow-red-500/20' : 'text-gray-500 hover:text-white'
                                        }`}
                                >
                                    Gastos
                                </button>
                            </div>

                            {/* Metodo Grid */}
                            <div className="grid grid-cols-3 gap-3">
                                {[
                                    { id: 'efectivo', icon: Wallet, label: 'Caja' },
                                    { id: 'transferencia', icon: CreditCard, label: 'Banco' },
                                    { id: 'papeleria', icon: Book, label: 'Papelería' }
                                ].map(m => (
                                    <button
                                        key={m.id}
                                        type="button"
                                        onClick={() => setFormData({ ...formData, metodo: m.id })}
                                        className={`flex flex-col items-center gap-2 p-4 rounded-3xl border transition-all ${formData.metodo === m.id
                                            ? (isExpense ? 'bg-red-500/10 border-red-500/40 text-red-500' : 'bg-gold/10 border-gold/40 text-gold')
                                            : 'glass border-white/5 text-gray-500 opacity-60'
                                            }`}
                                    >
                                        <m.icon size={20} />
                                        <span className="text-[10px] font-black uppercase tracking-tighter italic">{m.label}</span>
                                    </button>
                                ))}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="flex flex-col gap-2">
                                    <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest ml-1">Monto RD$</label>
                                    <div className="relative">
                                        <DollarSign className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isExpense ? 'text-red-500' : 'text-gold'} opacity-50`} size={16} />
                                        <input
                                            type="number"
                                            required
                                            value={formData.monto}
                                            onChange={e => setFormData({ ...formData, monto: e.target.value })}
                                            className={`w-full glass p-4 pl-10 rounded-2xl text-lg font-black tracking-tight outline-none transition-all ${isExpense ? 'focus:border-red-500/50' : 'focus:border-gold/50'
                                                }`}
                                            placeholder="0.00"
                                        />
                                    </div>
                                </div>

                                <div className="flex flex-col gap-2">
                                    <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest ml-1">Fecha</label>
                                    <div className="relative">
                                        <Calendar className={`absolute left-3 top-1/2 -translate-y-1/2 transition-colors ${isExpense ? 'text-red-500' : 'text-gold'} opacity-50`} size={16} />
                                        <input
                                            type="date"
                                            required
                                            value={formData.fecha}
                                            onChange={e => setFormData({ ...formData, fecha: e.target.value })}
                                            className={`w-full glass p-4 pl-10 rounded-2xl text-[11px] font-bold outline-none transition-all ${isExpense ? 'focus:border-red-500/50' : 'focus:border-gold/50'
                                                }`}
                                        />
                                    </div>
                                </div>
                            </div>

                            {/* Dynamic Source Selectors */}
                            {formData.metodo === 'efectivo' && (
                                <div className="flex flex-col gap-2">
                                    <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest ml-1">Seleccionar Caja</label>
                                    <select
                                        required
                                        value={formData.caja_id}
                                        onChange={e => setFormData({ ...formData, caja_id: e.target.value })}
                                        className={`w-full glass p-4 rounded-2xl text-xs font-bold outline-none border border-white/5 appearance-none bg-transparent ${isExpense ? 'focus:border-red-500/50' : 'focus:border-gold/50'
                                            }`}
                                    >
                                        <option value="" className="bg-[#0f0f0f]">Seleccionar caja...</option>
                                        {formOptions.cajas.map((c: any) => (
                                            <option key={c.id} value={c.id} className="bg-[#0f0f0f]">{c.nombre} (RD$ {parseFloat(c.saldo_actual).toLocaleString()})</option>
                                        ))}
                                    </select>
                                </div>
                            )}

                            {formData.metodo === 'transferencia' && (
                                <div className="grid grid-cols-2 gap-4">
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest ml-1">Banco</label>
                                        <select
                                            required
                                            value={formData.bank_id}
                                            onChange={e => setFormData({ ...formData, bank_id: e.target.value, cuenta_bancaria_id: '' })}
                                            className="w-full glass p-4 rounded-2xl text-xs font-bold outline-none border border-white/5 focus:border-gold/50 appearance-none bg-transparent"
                                        >
                                            <option value="" className="bg-[#0f0f0f]">Seleccionar...</option>
                                            {formOptions.banks.map((b: any) => (
                                                <option key={b.id} value={b.id} className="bg-[#0f0f0f]">{b.nombre}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest ml-1">Cuenta</label>
                                        <select
                                            required
                                            disabled={!formData.bank_id}
                                            value={formData.cuenta_bancaria_id}
                                            onChange={e => setFormData({ ...formData, cuenta_bancaria_id: e.target.value })}
                                            className="w-full glass p-4 rounded-2xl text-xs font-bold outline-none border border-white/5 focus:border-gold/50 appearance-none bg-transparent disabled:opacity-30"
                                        >
                                            <option value="" className="bg-[#0f0f0f]">Cuenta...</option>
                                            {accountsForSelectedBank.map((a: any) => (
                                                <option key={a.id} value={a.id} className="bg-[#0f0f0f]">{a.nombre_oficial_cuenta} ({a.numero_cuenta})</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>
                            )}

                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest ml-1">Categoría</label>
                                <select
                                    required
                                    value={formData.categoria_id}
                                    onChange={e => setFormData({ ...formData, categoria_id: e.target.value })}
                                    className="w-full glass p-4 rounded-2xl text-xs font-bold outline-none border border-white/5 focus:border-gold/50 appearance-none bg-transparent"
                                >
                                    <option value="" className="bg-[#0f0f0f]">Seleccionar categoría...</option>
                                    {filteredCategories.map((c: any) => (
                                        <option key={c.id} value={c.id} className="bg-[#0f0f0f]">{c.nombre}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="flex flex-col gap-2">
                                <label className="text-[9px] text-gray-400 font-black uppercase tracking-widest ml-1">Descripción / Concepto</label>
                                <textarea
                                    value={formData.descripcion}
                                    onChange={e => setFormData({ ...formData, descripcion: e.target.value })}
                                    className="w-full glass p-4 rounded-2xl text-xs font-bold outline-none border border-white/5 focus:border-gold/50 min-h-[80px]"
                                    placeholder="Escribe el concepto..."
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={loading}
                                className={`mt-4 py-5 rounded-[25px] flex items-center justify-center gap-3 active:scale-95 transition-all text-sm font-black uppercase tracking-widest italic disabled:opacity-50 ${isExpense ? 'bg-red-500 hover:bg-red-600 text-white shadow-lg shadow-red-500/20' : 'glass-gold'
                                    }`}
                            >
                                {loading ? (
                                    <div className={`animate-spin rounded-full h-5 w-5 border-t-2 ${isExpense ? 'border-white' : 'border-black'}`}></div>
                                ) : (
                                    <>
                                        <CheckCircle2 size={18} />
                                        Registrar Operación
                                    </>
                                )}
                            </button>
                        </form>
                    </div>
                </motion.div>
            </div>
        </AnimatePresence>
    );
}
