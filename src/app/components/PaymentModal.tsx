'use client';

import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, DollarSign, CreditCard, Landmark, CheckCircle2, AlertCircle, ChevronDown } from 'lucide-react';

interface PaymentModalProps {
    invoice: any;
    onClose: () => void;
    onSuccess: (newStatus: string) => void;
}

export default function PaymentModal({ invoice, onClose, onSuccess }: PaymentModalProps) {
    const [amount, setAmount] = useState(invoice.total);
    const [method, setMethod] = useState<'efectivo' | 'transferencia'>('efectivo');
    const [banks, setBanks] = useState<any[]>([]);
    const [cajas, setCajas] = useState<any[]>([]);
    const [selectedBank, setSelectedBank] = useState<string>('');
    const [selectedAccount, setSelectedAccount] = useState<string>('');
    const [selectedCaja, setSelectedCaja] = useState<string>('');
    const [reference, setReference] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        async function fetchData() {
            try {
                const [banksRes, cajasRes] = await Promise.all([
                    fetch('/api/banks'),
                    fetch('/api/cajas')
                ]);
                const banksData = await banksRes.json();
                const cajasData = await cajasRes.json();
                setBanks(banksData);
                setCajas(cajasData);
                if (cajasData.length > 0) setSelectedCaja(cajasData[0].id);
            } catch (err) {
                console.error('Error fetching data:', err);
            }
        }
        fetchData();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/payments', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    factura_id: invoice.id,
                    cliente_id: invoice.cliente_id,
                    monto: amount,
                    metodo_pago: method,
                    caja_id: method === 'efectivo' ? selectedCaja : null,
                    cuenta_bancaria_id: method === 'transferencia' ? selectedAccount : null,
                    numero_referencia: reference,
                    observaciones: `Pago via app movil - ${method}`
                }),
            });

            const data = await res.json();
            if (res.ok) {
                onSuccess(data.nuovo_estado);
                onClose();
            } else {
                setError(data.error || 'Error al procesar el pago');
            }
        } catch (err) {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const selectedBankAccounts = banks.find(b => b.id === selectedBank)?.accounts || [];

    return (
        <div className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center bg-black/80 backdrop-blur-md p-4">
            <motion.div
                initial={{ y: "100%" }}
                animate={{ y: 0 }}
                exit={{ y: "100%" }}
                className="w-full max-w-md glass rounded-[40px] p-8 flex flex-col gap-6 relative shadow-[0_-20px_40px_rgba(0,0,0,0.5)] border-t border-white/10"
            >
                <button onClick={onClose} className="absolute top-6 right-6 p-2 rounded-full bg-white/5 text-gray-400 hover:text-white transition-colors">
                    <X size={20} />
                </button>

                <header>
                    <p className="text-[10px] text-gold font-black uppercase tracking-widest italic">Procesar Pago</p>
                    <h2 className="text-2xl font-black gold-text-gradient uppercase tracking-tighter mt-1">
                        Factura #{invoice.numero_factura}
                    </h2>
                    <p className="text-xs text-gray-500 font-bold uppercase tracking-tight mt-1">
                        Total Original: <span className="text-white">${parseFloat(invoice.total).toLocaleString()}</span>
                    </p>
                </header>

                {error && (
                    <div className="p-4 rounded-2xl bg-red-500/10 border border-red-500/20 text-red-500 text-xs font-bold flex items-center gap-2">
                        <AlertCircle size={14} /> {error}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="flex flex-col gap-5">
                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Monto a Pagar</label>
                        <div className="relative">
                            <span className="absolute left-4 top-1/2 -translate-y-1/2 text-gold font-black">$</span>
                            <input
                                type="number"
                                step="0.01"
                                className="w-full glass p-4 pl-10 rounded-2xl text-xl font-black outline-none focus:border-gold transition-all"
                                value={amount}
                                onChange={(e) => setAmount(e.target.value)}
                                required
                            />
                        </div>
                    </div>

                    <div className="flex flex-col gap-2">
                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Método de Pago</label>
                        <div className="grid grid-cols-2 gap-3">
                            <button
                                type="button"
                                onClick={() => setMethod('efectivo')}
                                className={`p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all ${method === 'efectivo' ? 'bg-gold/10 border-gold text-gold' : 'glass border-white/5 text-gray-500'}`}
                            >
                                <DollarSign size={20} />
                                <span className="text-[10px] font-black uppercase italic">Efectivo / Caja</span>
                            </button>
                            <button
                                type="button"
                                onClick={() => setMethod('transferencia')}
                                className={`p-4 rounded-2xl flex flex-col items-center gap-2 border transition-all ${method === 'transferencia' ? 'bg-gold/10 border-gold text-gold' : 'glass border-white/5 text-gray-500'}`}
                            >
                                <Landmark size={20} />
                                <span className="text-[10px] font-black uppercase italic">Banco / Transf.</span>
                            </button>
                        </div>
                    </div>

                    <AnimatePresence mode="wait">
                        {method === 'efectivo' ? (
                            <motion.div
                                key="caja-select"
                                initial={{ opacity: 0, x: -10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: 10 }}
                                className="flex flex-col gap-2"
                            >
                                <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Seleccionar Caja</label>
                                <select
                                    className="w-full glass p-4 rounded-2xl text-xs font-bold outline-none appearance-none bg-black text-white"
                                    value={selectedCaja}
                                    onChange={(e) => setSelectedCaja(e.target.value)}
                                    required
                                >
                                    {cajas.map(c => (
                                        <option key={c.id} value={c.id} className="bg-black text-white">{c.nombre} (Bal: ${parseFloat(c.saldo_actual).toLocaleString()})</option>
                                    ))}
                                </select>
                            </motion.div>
                        ) : (
                            <motion.div
                                key="bank-select"
                                initial={{ opacity: 0, x: 10 }}
                                animate={{ opacity: 1, x: 0 }}
                                exit={{ opacity: 0, x: -10 }}
                                className="flex flex-col gap-4"
                            >
                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Banco</label>
                                    <select
                                        className="w-full glass p-4 rounded-2xl text-xs font-bold outline-none appearance-none bg-black text-white"
                                        value={selectedBank}
                                        onChange={(e) => {
                                            setSelectedBank(e.target.value);
                                            setSelectedAccount('');
                                        }}
                                        required
                                    >
                                        <option value="" className="bg-black text-white">Seleccionar Banco</option>
                                        {banks.map(b => (
                                            <option key={b.id} value={b.id} className="bg-black text-white">{b.nombre}</option>
                                        ))}
                                    </select>
                                </div>

                                {selectedBank && (
                                    <div className="flex flex-col gap-2">
                                        <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Cuenta</label>
                                        <select
                                            className="w-full glass p-4 rounded-2xl text-xs font-bold outline-none appearance-none bg-black text-white"
                                            value={selectedAccount}
                                            onChange={(e) => setSelectedAccount(e.target.value)}
                                            required
                                        >
                                            <option value="" className="bg-black text-white">Seleccionar Cuenta</option>
                                            {selectedBankAccounts.map((acc: any) => (
                                                <option key={acc.id} value={acc.id} className="bg-black text-white">{acc.nombre_oficial_cuenta} - {acc.numero_cuenta} ({acc.moneda})</option>
                                            ))}
                                        </select>
                                    </div>
                                )}

                                <div className="flex flex-col gap-2">
                                    <label className="text-[10px] text-gray-500 font-black uppercase tracking-widest ml-1">Nº Referencia</label>
                                    <input
                                        className="w-full glass p-4 rounded-2xl text-xs font-bold outline-none border border-transparent focus:border-gold transition-all"
                                        placeholder="Escriba el número de referencia"
                                        value={reference}
                                        onChange={(e) => setReference(e.target.value)}
                                        required
                                    />
                                </div>
                            </motion.div>
                        )}
                    </AnimatePresence>

                    <button
                        type="submit"
                        disabled={loading}
                        className="mt-4 gold-gradient p-5 rounded-3xl text-black font-black uppercase text-sm tracking-widest active:scale-95 transition-all flex items-center justify-center gap-3 shadow-[0_10px_30px_rgba(212,175,55,0.3)] disabled:opacity-50"
                    >
                        {loading ? (
                            <div className="animate-spin rounded-full h-5 w-5 border-t-2 border-black"></div>
                        ) : (
                            <>
                                <CheckCircle2 size={20} /> Completar Pago
                            </>
                        )}
                    </button>
                </form>
            </motion.div>
        </div>
    );
}
