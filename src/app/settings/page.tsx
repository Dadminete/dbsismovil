'use client';

import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, Shield, Bell, Moon, Smartphone, ChevronLeft } from 'lucide-react';

export default function SettingsPage() {
    const router = useRouter();
    const options = [
        { icon: Bell, label: 'Notificaciones', color: 'text-blue-400' },
        { icon: Moon, label: 'Tema Oscuro', color: 'text-purple-400', value: 'Activado' },
        { icon: Shield, label: 'Seguridad', color: 'text-green-400' },
        { icon: Smartphone, label: 'App PWA', color: 'text-gold' },
    ];

    return (
        <div className="flex flex-col gap-8 pb-20">
            <header className="flex items-center justify-between px-1">
                <button onClick={() => router.back()} className="glass p-2 rounded-2xl text-gold active:scale-95 transition-all">
                    <ChevronLeft size={20} />
                </button>
                <div className="text-right">
                    <h1 className="text-3xl font-black gold-text-gradient">Ajustes</h1>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Configuración de la aplicación</p>
                </div>
            </header>

            <section className="glass rounded-[40px] p-6 flex items-center gap-4">
                <div className="w-16 h-16 rounded-3xl overflow-hidden border border-gold/20 shadow-lg relative">
                    <Image src="/logo.jpg" alt="Logo" fill className="object-cover" />
                </div>
                <div>
                    <h2 className="font-black italic text-lg gold-text-gradient">Admin User</h2>
                    <p className="text-[10px] text-gray-500 font-bold uppercase italic">Empresa Tecnológica del Este</p>
                </div>
            </section>

            <div className="flex flex-col gap-3">
                {options.map((opt, index) => (
                    <motion.div
                        key={opt.label}
                        initial={{ opacity: 0, y: 10 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: index * 0.1 }}
                        className="glass rounded-3xl p-5 flex items-center justify-between group active:scale-95 transition-all"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl bg-white/5 ${opt.color}`}>
                                <opt.icon size={20} />
                            </div>
                            <span className="font-bold text-sm tracking-tight">{opt.label}</span>
                        </div>
                        {opt.value ? (
                            <span className="text-[10px] font-black uppercase text-gold italic">{opt.value}</span>
                        ) : (
                            <div className="w-6 h-6 rounded-full border border-white/10" />
                        )}
                    </motion.div>
                ))}

                <button className="mt-4 glass border-red-500/20 rounded-3xl p-5 flex items-center justify-center gap-2 text-red-500 font-black uppercase text-xs tracking-widest active:scale-95 transition-all">
                    <LogOut size={16} /> Cerrar Sesión
                </button>
            </div>

            <p className="text-center text-[8px] text-gray-600 font-bold uppercase tracking-[0.2em]">DBSISMOVIL v1.0.0 • BY Empresa Tecnológica del Este</p>
        </div>
    );
}
