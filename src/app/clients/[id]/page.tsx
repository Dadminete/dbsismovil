'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, Save, CreditCard, Calendar, FileText, CheckCircle2, Clock, Edit3, Trash2, DollarSign, Camera } from 'lucide-react';
import PaymentModal from '@/app/components/PaymentModal';

export default function ClientDetailsPage() {
    const { id } = useParams();
    const router = useRouter();
    const [client, setClient] = useState<any>(null);
    const [invoices, setInvoices] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [editing, setEditing] = useState(false);
    const [imgError, setImgError] = useState(false);
    const [formData, setFormData] = useState({
        nombre: '',
        apellidos: '',
        telefono: '',
        email: '',
        direccion: '',
        fecha_suscripcion: '',
        sexo: '',
        estado: '',
        foto_url: ''
    });

    // Payment Modal State
    const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
    const [selectedInvoice, setSelectedInvoice] = useState<any>(null);

    const fetchData = async () => {
        try {
            const clientRes = await fetch(`/api/clients/${id}`);
            const clientData = await clientRes.json();
            setClient(clientData);
            setImgError(false); // Reset on fetch
            setFormData({
                nombre: clientData.nombre,
                apellidos: clientData.apellidos || '',
                telefono: clientData.telefono || '',
                email: clientData.email || '',
                direccion: clientData.direccion || '',
                fecha_suscripcion: clientData.fecha_suscripcion ? new Date(clientData.fecha_suscripcion).toISOString().split('T')[0] : '',
                sexo: clientData.sexo || '',
                estado: clientData.estado || 'activo',
                foto_url: clientData.foto_url || ''
            });

            const invoicesRes = await fetch(`/api/clients/${id}/invoices`);
            const invoicesData = await invoicesRes.json();
            setInvoices(invoicesData);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const [mounted, setMounted] = useState(false);

    useEffect(() => {
        setMounted(true);
        fetchData();
    }, [id]);

    const handleUpdateClient = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const res = await fetch(`/api/clients/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                const updated = await res.json();
                setClient(updated);
                setEditing(false);
                setImgError(false);
            }
        } catch (error) {
            console.error('Error updating client:', error);
        }
    };

    const handlePhotoUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (file) {
            const reader = new FileReader();
            reader.onloadend = () => {
                const img = new Image();
                img.onload = () => {
                    const canvas = document.createElement('canvas');
                    const MAX_WIDTH = 800;
                    const MAX_HEIGHT = 800;
                    let width = img.width;
                    let height = img.height;

                    if (width > height) {
                        if (width > MAX_WIDTH) {
                            height *= MAX_WIDTH / width;
                            width = MAX_WIDTH;
                        }
                    } else {
                        if (height > MAX_HEIGHT) {
                            width *= MAX_HEIGHT / height;
                            height = MAX_HEIGHT;
                        }
                    }

                    canvas.width = width;
                    canvas.height = height;
                    const ctx = canvas.getContext('2d');
                    ctx?.drawImage(img, 0, 0, width, height);
                    const dataUrl = canvas.toDataURL('image/jpeg', 0.7);
                    setFormData({ ...formData, foto_url: dataUrl });
                    setImgError(false);
                };
                img.src = reader.result as string;
            };
            reader.readAsDataURL(file);
        }
    };

    const openPaymentModal = (invoice: any) => {
        setSelectedInvoice(invoice);
        setIsPaymentModalOpen(true);
    };

    if (loading) return (
        <div className="flex justify-center py-20">
            <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-gold"></div>
        </div>
    );

    return (
        <div className="flex flex-col gap-6 pb-20">
            <header className="flex items-center justify-between px-1">
                <button onClick={() => router.back()} className="glass p-2 rounded-2xl text-gold active:scale-95 transition-all">
                    <ChevronLeft size={20} />
                </button>
                <h1 className="text-xl font-black italic gold-text-gradient uppercase tracking-tight">Detalles</h1>
                <button
                    onClick={() => setEditing(!editing)}
                    className={`glass p-2 rounded-2xl transition-all active:scale-95 ${editing ? 'text-red-400' : 'text-gold'}`}
                >
                    {editing ? <Trash2 size={20} /> : <Edit3 size={20} />}
                </button>
            </header>

            <section className="glass rounded-[40px] p-8 flex flex-col items-center gap-6 relative overflow-hidden">
                <div className="absolute top-0 right-0 w-32 h-32 bg-gold/5 blur-3xl rounded-full"></div>

                <div className="relative group">
                    <div className="w-28 h-28 rounded-[35px] bg-gold/10 border-2 border-gold/20 flex items-center justify-center text-4xl text-gold font-black italic shadow-2xl relative overflow-hidden">
                        {(formData.foto_url || client.foto_url) && !imgError ? (
                            <img
                                src={formData.foto_url || client.foto_url}
                                alt="Profile"
                                className="w-full h-full object-cover"
                                onError={() => setImgError(true)}
                            />
                        ) : (
                            <>{client.nombre[0]}{client.apellidos?.[0] || ''}</>
                        )}
                        <div className={`absolute -bottom-1 -right-1 w-6 h-6 border-2 border-background rounded-full ${(formData.estado || client.estado)?.toLowerCase().includes('activo') ? 'bg-green-500' : 'bg-red-500'
                            }`}></div>
                    </div>

                    {editing && (
                        <label className="absolute inset-0 flex items-center justify-center bg-black/50 rounded-[35px] cursor-pointer opacity-0 group-hover:opacity-100 transition-opacity">
                            <Camera size={24} className="text-white" />
                            <input type="file" accept="image/*" capture="environment" className="hidden" onChange={handlePhotoUpload} />
                        </label>
                    )}
                </div>

                {!editing ? (
                    <div className="text-center w-full">
                        <h2 className="text-2xl font-black uppercase tracking-tighter">
                            {client.nombre} {client.apellidos}
                        </h2>
                        <div className="flex flex-wrap justify-center gap-2 mt-2">
                            <span className="text-[10px] bg-white/5 border border-white/10 p-1 px-3 rounded-full text-gray-400 font-bold uppercase tracking-widest">{client.codigo_cliente}</span>
                            <span className={`text-[10px] border p-1 px-3 rounded-full font-black uppercase tracking-widest ${client.estado?.toLowerCase().includes('activo') ? 'bg-green-500/10 border-green-500/20 text-green-400' : 'bg-red-500/10 border-red-500/20 text-red-400'
                                }`}>{client.estado}</span>
                        </div>

                        <div className="grid grid-cols-2 gap-4 mt-8 text-left border-t border-white/5 pt-6">
                            <div className="flex flex-col gap-1">
                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Teléfono</p>
                                <p className="text-xs font-bold text-white tracking-widest">{client.telefono || 'N/A'}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Email</p>
                                <p className="text-xs font-bold text-white tracking-tight break-all">{client.email || 'N/A'}</p>
                            </div>
                            <div className="flex flex-col gap-1 col-span-2">
                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Dirección</p>
                                <p className="text-xs font-bold text-white tracking-tight">{client.direccion || 'No especificada'}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Sexo</p>
                                <p className="text-xs font-bold text-white uppercase">{client.sexo || 'N/A'}</p>
                            </div>
                            <div className="flex flex-col gap-1">
                                <p className="text-[9px] text-gray-500 font-black uppercase tracking-widest">Suscripción</p>
                                <p className="text-xs font-bold text-white">
                                    {mounted && client.fecha_suscripcion ? new Date(client.fecha_suscripcion).toLocaleDateString() : '...'}
                                </p>
                            </div>
                        </div>
                    </div>
                ) : (
                    <form onSubmit={handleUpdateClient} className="w-full flex flex-col gap-4">
                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Nombre</label>
                                <input
                                    className="glass p-3 rounded-2xl text-[11px] font-bold outline-none focus:border-gold transition-all"
                                    value={formData.nombre}
                                    onChange={e => setFormData({ ...formData, nombre: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Apellidos</label>
                                <input
                                    className="glass p-3 rounded-2xl text-[11px] font-bold outline-none focus:border-gold transition-all"
                                    value={formData.apellidos}
                                    onChange={e => setFormData({ ...formData, apellidos: e.target.value })}
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Teléfono</label>
                                <input
                                    className="glass p-3 rounded-2xl text-[11px] font-bold outline-none focus:border-gold transition-all"
                                    value={formData.telefono}
                                    onChange={e => setFormData({ ...formData, telefono: e.target.value })}
                                />
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Estado</label>
                                <select
                                    className="glass p-3 rounded-2xl text-[11px] font-bold outline-none border border-transparent focus:border-gold transition-all bg-black text-white"
                                    value={formData.estado}
                                    onChange={e => setFormData({ ...formData, estado: e.target.value })}
                                >
                                    <option value="activo" className="bg-black text-white">Activo</option>
                                    <option value="Suspendido" className="bg-black text-white">Suspendido</option>
                                    <option value="Cancelar" className="bg-black text-white">Cancelado</option>
                                    <option value="Inactivo" className="bg-black text-white">Inactivo</option>
                                </select>
                            </div>
                        </div>

                        <div className="flex flex-col gap-1">
                            <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Dirección</label>
                            <textarea
                                className="glass p-3 rounded-2xl text-[11px] font-bold outline-none focus:border-gold transition-all min-h-[60px]"
                                value={formData.direccion}
                                onChange={e => setFormData({ ...formData, direccion: e.target.value })}
                            />
                        </div>

                        <div className="grid grid-cols-2 gap-3">
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">Sexo</label>
                                <select
                                    className="glass p-3 rounded-2xl text-[11px] font-bold outline-none border border-transparent focus:border-gold transition-all bg-black text-white"
                                    value={formData.sexo}
                                    onChange={e => setFormData({ ...formData, sexo: e.target.value })}
                                >
                                    <option value="" className="bg-black text-white">Elegir...</option>
                                    <option value="MASCULINO" className="bg-black text-white">Masculino</option>
                                    <option value="FEMENINO" className="bg-black text-white">Femenino</option>
                                    <option value="OTRO" className="bg-black text-white">Otro</option>
                                </select>
                            </div>
                            <div className="flex flex-col gap-1">
                                <label className="text-[9px] text-gray-500 font-black uppercase tracking-widest ml-1">F. Suscripción</label>
                                <input
                                    type="date"
                                    className="glass p-3 rounded-2xl text-[11px] font-bold outline-none focus:border-gold transition-all bg-black text-white w-full"
                                    value={formData.fecha_suscripcion}
                                    onChange={e => setFormData({ ...formData, fecha_suscripcion: e.target.value })}
                                />
                            </div>
                        </div>

                        <button type="submit" className="gold-gradient p-4 rounded-[25px] text-black font-black uppercase text-[10px] tracking-widest mt-2 active:scale-95 transition-all flex items-center justify-center gap-2 shadow-[0_10px_30px_rgba(212,175,55,0.2)]">
                            <Save size={16} /> Guardar Perfil
                        </button>
                    </form>
                )}
            </section>

            <section className="flex flex-col gap-4">
                <div className="flex justify-between items-center px-1">
                    <h2 className="text-sm font-bold text-gray-400 uppercase tracking-widest">Facturas del Cliente</h2>
                </div>

                <div className="flex flex-col gap-3">
                    {invoices.length === 0 ? (
                        <div className="glass p-10 rounded-3xl text-center flex flex-col items-center gap-2 opacity-50">
                            <FileText size={32} className="text-gray-600" />
                            <p className="text-xs font-bold uppercase tracking-widest">No hay facturas</p>
                        </div>
                    ) : (
                        invoices.map((invoice, index) => (
                            <motion.div
                                key={invoice.id}
                                initial={{ opacity: 0, y: 10 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ delay: index * 0.1 }}
                                className="glass rounded-3xl p-5 flex flex-col gap-4 relative overflow-hidden"
                            >
                                <div className="flex justify-between items-start">
                                    <div>
                                        <p className="text-[10px] text-gray-500 font-black uppercase tracking-tighter">#{invoice.numero_factura}</p>
                                        <h4 className="text-lg font-black italic gold-text-gradient">
                                            {mounted ? `$${parseFloat(invoice.total).toLocaleString()}` : '---'}
                                        </h4>
                                    </div>
                                    <div className={`px-3 py-1 rounded-full text-[8px] font-black uppercase italic border ${invoice.estado === 'pagada'
                                        ? 'bg-green-500/10 text-green-400 border-green-500/20'
                                        : invoice.estado === 'parcial'
                                            ? 'bg-gold/10 text-gold border-gold/20'
                                            : 'bg-red-500/10 text-red-400 border-red-500/20 animate-pulse'
                                        }`}>
                                        {invoice.estado}
                                    </div>
                                </div>

                                <div className="flex items-center justify-between">
                                    <div className="flex items-center gap-4 text-[10px] text-gray-500 font-bold uppercase italic">
                                        <span className="flex items-center gap-1">
                                            <Calendar size={10} />
                                            {mounted ? new Date(invoice.fecha_factura).toLocaleDateString() : '...'}
                                        </span>
                                    </div>

                                    {invoice.estado !== 'pagada' && (
                                        <button
                                            onClick={() => openPaymentModal(invoice)}
                                            className="bg-gold/10 hover:bg-gold text-gold hover:text-black border border-gold/30 p-2 px-4 rounded-xl text-[10px] font-black uppercase transition-all duration-300 flex items-center gap-2"
                                        >
                                            <DollarSign size={12} /> Pagar
                                        </button>
                                    )}
                                </div>
                            </motion.div>
                        ))
                    )}
                </div>
            </section>

            <AnimatePresence>
                {isPaymentModalOpen && selectedInvoice && (
                    <PaymentModal
                        invoice={selectedInvoice}
                        onClose={() => setIsPaymentModalOpen(false)}
                        onSuccess={() => fetchData()}
                    />
                )}
            </AnimatePresence>
        </div>
    );
}
