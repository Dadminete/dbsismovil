'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { motion } from 'framer-motion';
import { Search, UserCircle, ChevronRight, AlertTriangle, ChevronLeft } from 'lucide-react';
import { getImageUrl } from '@/lib/imageHelper';

type ClientStatusFilter = 'todos' | 'pagado' | 'pendiente';

export default function ClientsPage() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const [clients, setClients] = useState<any[]>([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [imageErrors, setImageErrors] = useState<Record<string, boolean>>({});
    const [statusFilter, setStatusFilter] = useState<ClientStatusFilter>('todos');

    const changeStatusFilter = (nextFilter: ClientStatusFilter) => {
        const params = new URLSearchParams(searchParams.toString());

        if (nextFilter === 'todos') {
            params.delete('estado');
        } else {
            params.set('estado', nextFilter);
        }

        const query = params.toString();
        router.push(query ? `/clients?${query}` : '/clients');
    };

    useEffect(() => {
        const estadoParam = searchParams.get('estado')?.toLowerCase();

        if (estadoParam === 'pagado') {
            setStatusFilter('pagado');
            return;
        }

        if (estadoParam === 'pendiente') {
            setStatusFilter('pendiente');
            return;
        }

        setStatusFilter('todos');
    }, [searchParams]);

    useEffect(() => {
        async function fetchClients() {
            try {
                const estadoParam = statusFilter !== 'todos' ? `?estado=${statusFilter}` : '';
                const res = await fetch(`/api/clients${estadoParam}`);
                const data = await res.json();
                if (res.ok && Array.isArray(data)) {
                    setClients(data);
                } else {
                    console.error('Invalid response from API:', data);
                    setClients([]);
                }
            } catch (error) {
                console.error('Error fetching clients:', error);
                setClients([]);
            } finally {
                setLoading(false);
            }
        }
        fetchClients();
    }, [statusFilter]);

    const filteredClients = clients.filter((c: any) => {
        const matchesSearch =
            `${c.nombre} ${c.apellidos}`.toLowerCase().includes(search.toLowerCase()) ||
            c.codigo_cliente?.toLowerCase().includes(search.toLowerCase());

        if (!matchesSearch) return false;

        return true;
    });

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
                <div className="glass p-1 rounded-2xl grid grid-cols-3 gap-1 w-full">
                    <button
                        onClick={() => changeStatusFilter('todos')}
                        className={`text-[10px] py-2 rounded-xl uppercase tracking-widest font-black transition-all ${statusFilter === 'todos' ? 'bg-gold text-black' : 'text-gray-400'}`}
                    >
                        Todos
                    </button>
                    <button
                        onClick={() => changeStatusFilter('pagado')}
                        className={`text-[10px] py-2 rounded-xl uppercase tracking-widest font-black transition-all ${statusFilter === 'pagado' ? 'bg-emerald-400 text-black' : 'text-gray-400'}`}
                    >
                        Pagados
                    </button>
                    <button
                        onClick={() => changeStatusFilter('pendiente')}
                        className={`text-[10px] py-2 rounded-xl uppercase tracking-widest font-black transition-all ${statusFilter === 'pendiente' ? 'bg-red-400 text-black' : 'text-gray-400'}`}
                    >
                        Pendientes
                    </button>
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
                                    <div className="w-12 h-12 rounded-2xl bg-gold/10 border border-gold/20 flex items-center justify-center text-gold font-black italic shadow-lg overflow-hidden">
                                        {client.foto_url && !imageErrors[client.id] ? (
                                            <img
                                                src={getImageUrl(client.foto_url)}
                                                alt={`${client.nombre} ${client.apellidos || ''}`.trim()}
                                                className="w-full h-full object-cover"
                                                onError={() =>
                                                    setImageErrors((prev) => ({
                                                        ...prev,
                                                        [client.id]: true,
                                                    }))
                                                }
                                            />
                                        ) : (
                                            <>{client.nombre[0]}{client.apellidos?.[0] || ''}</>
                                        )}
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
