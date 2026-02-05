'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, UserCircle, ChevronRight, AlertTriangle, ChevronLeft } from 'lucide-react';

export default function ClientsPage() {
    const router = useRouter();
    const [clients, setClients] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchClients() {
            try {
                const res = await fetch('/api/clients');
                const data = await res.json();
                setClients(data);
            } catch (error) {
                console.error('Error fetching clients:', error);
            } finally {
                setLoading(false);
            }
        }
        fetchClients();
    }, []);

    const filteredClients = clients.filter((c: any) =>
        `${c.nombre} ${c.apellidos}`.toLowerCase().includes(search.toLowerCase()) ||
        c.codigo_cliente?.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className="flex flex-col gap-6 pb-20">
            <header className="flex flex-col gap-4 px-1">
                <div className="flex items-center justify-between w-full">
                    <button onClick={() => router.back()} className="glass p-2 rounded-2xl text-gold active:scale-95 transition-all">
                        <ChevronLeft size={20} />
                    </button>
                    <div className="text-right">
                        <h1 className="text-3xl font-black gold-text-gradient">Clientes</h1>
                        <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Base de datos central</p>
                    </div>
                </div>
                <div className="glass p-2 rounded-2xl flex items-center gap-2 px-4 w-full">
                    <Search size={16} className="text-gold" />
                    <input
                        type="text"
                        placeholder="Buscar clientes por nombre o código..."
                        className="bg-transparent border-none outline-none text-xs w-full placeholder:text-gray-600 py-1"
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
            </header>

            {loading ? (
                <div className="flex justify-center py-20">
                    <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold"></div>
                </div>
            ) : (
                <div className="flex flex-col gap-3">
                    {filteredClients.map((client: any, index: number) => (
                        <motion.div
                            key={client.id}
                            initial={{ opacity: 0, x: -20 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: index * 0.05 }}
                        >
                            <Link
                                href={`/clients/${client.id}`}
                                className="glass rounded-3xl p-4 flex items-center justify-between group active:scale-95 transition-all"
                            >
                                <div className="flex items-center gap-4">
                                    <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-black italic shadow-lg">
                                        {client.nombre[0]}{client.apellidos?.[0] || ''}
                                    </div>
                                    <div>
                                        <h3 className="font-bold text-sm group-hover:text-gold transition-colors">
                                            {client.nombre} {client.apellidos}
                                        </h3>
                                        <div className="flex items-center gap-2">
                                            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-tighter">
                                                {client.codigo_cliente || 'SIN CÓDIGO'}
                                            </p>
                                            {client.has_pending && (
                                                <div className="flex items-center gap-0.5 text-[8px] px-1.5 py-0.5 bg-red-500/10 text-red-400 rounded-full border border-red-500/20 font-black uppercase italic">
                                                    <AlertTriangle size={8} /> Pendiente
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </div>
                                <ChevronRight size={18} className="text-gray-700 group-hover:text-gold transition-colors" />
                            </Link>
                        </motion.div>
                    ))}
                </div>
            )}
        </div>
    );
}
