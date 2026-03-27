'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, Users, Settings, DollarSign, PieChart, BadgeCheck } from 'lucide-react';
import { motion } from 'framer-motion';
import { useRouter } from 'next/navigation';
import TransactionModal from './TransactionModal';

interface NavbarProps {
    isTecnico?: boolean;
}

export default function Navbar({ isTecnico = false }: NavbarProps) {
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const router = useRouter();
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    if (pathname === '/login') return null;

    if (isTecnico) {
        const estado = searchParams.get('estado')?.toLowerCase();
        const isClientesActive = pathname === '/clients' && estado !== 'pagado';
        const isPagadosActive = pathname === '/clients' && estado === 'pagado';

        const isSettingsActive = pathname === '/settings';

        return (
            <nav className="fixed bottom-0 left-0 right-0 h-20 glass border-t border-border-glass z-50 px-6 pb-4 pt-2">
                <div className="flex justify-around items-center h-full max-w-lg mx-auto">
                    <Link href="/clients" className="relative flex flex-col items-center gap-1 group">
                        <div className={`p-2 rounded-xl transition-all duration-300 ${isClientesActive ? 'text-gold' : 'text-gray-400'}`}>
                            <Users size={24} />
                            {isClientesActive && (
                                <motion.div layoutId="nav-glow" className="absolute inset-0 bg-gold/10 blur-xl rounded-full -z-10" />
                            )}
                        </div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold ${isClientesActive ? 'text-gold' : 'text-gray-500'}`}>Clientes</span>
                    </Link>

                    <Link href="/clients?estado=pagado" className="relative flex flex-col items-center gap-1 group">
                        <div className={`p-2 rounded-xl transition-all duration-300 ${isPagadosActive ? 'text-gold' : 'text-gray-400'}`}>
                            <BadgeCheck size={24} />
                            {isPagadosActive && (
                                <motion.div layoutId="nav-glow" className="absolute inset-0 bg-gold/10 blur-xl rounded-full -z-10" />
                            )}
                        </div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold ${isPagadosActive ? 'text-gold' : 'text-gray-500'}`}>Pagados</span>
                    </Link>

                    <Link href="/settings" className="relative flex flex-col items-center gap-1 group">
                        <div className={`p-2 rounded-xl transition-all duration-300 ${isSettingsActive ? 'text-gold' : 'text-gray-400'}`}>
                            <Settings size={24} />
                            {isSettingsActive && (
                                <motion.div layoutId="nav-glow" className="absolute inset-0 bg-gold/10 blur-xl rounded-full -z-10" />
                            )}
                        </div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold ${isSettingsActive ? 'text-gold' : 'text-gray-500'}`}>Ajustes</span>
                    </Link>
                </div>
            </nav>
        );
    }

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 h-20 glass border-t border-border-glass z-50 px-6 pb-4 pt-2">
                <div className="flex justify-around items-center h-full max-w-lg mx-auto">
                    {/* Dashboard */}
                    <Link href="/" className="relative flex flex-col items-center gap-1 group">
                        <div className={`p-2 rounded-xl transition-all duration-300 ${pathname === '/' ? 'text-gold' : 'text-gray-400'}`}>
                            <Home size={24} />
                            {pathname === '/' && (
                                <motion.div layoutId="nav-glow" className="absolute inset-0 bg-gold/10 blur-xl rounded-full -z-10" />
                            )}
                        </div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold ${pathname === '/' ? 'text-gold' : 'text-gray-500'}`}>Dashboard</span>
                    </Link>

                    {/* Dollar Button (Quick Action) */}
                    <button
                        onClick={() => {
                            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
                            setIsTransactionModalOpen(true);
                        }}
                        className="relative flex flex-col items-center gap-1 group active:scale-95 transition-all"
                    >
                        <div className={`p-2 rounded-xl transition-all duration-300 ${isTransactionModalOpen ? 'text-gold' : 'text-gray-400'}`}>
                            <DollarSign size={24} />
                        </div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold ${isTransactionModalOpen ? 'text-gold' : 'text-gray-500'}`}>
                            Operar
                        </span>
                    </button>

                    {/* Finanzas */}
                    <Link href="/finance" className="relative flex flex-col items-center gap-1 group">
                        <div className={`p-2 rounded-xl transition-all duration-300 ${pathname === '/finance' ? 'text-gold' : 'text-gray-400'}`}>
                            <PieChart size={24} />
                            {pathname === '/finance' && (
                                <motion.div layoutId="nav-glow" className="absolute inset-0 bg-gold/10 blur-xl rounded-full -z-10" />
                            )}
                        </div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold ${pathname === '/finance' ? 'text-gold' : 'text-gray-500'}`}>Finanzas</span>
                    </Link>

                    {/* Clientes */}
                    <Link href="/clients" className="relative flex flex-col items-center gap-1 group">
                        <div className={`p-2 rounded-xl transition-all duration-300 ${pathname === '/clients' ? 'text-gold' : 'text-gray-400'}`}>
                            <Users size={24} />
                            {pathname === '/clients' && (
                                <motion.div layoutId="nav-glow" className="absolute inset-0 bg-gold/10 blur-xl rounded-full -z-10" />
                            )}
                        </div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold ${pathname === '/clients' ? 'text-gold' : 'text-gray-500'}`}>Clientes</span>
                    </Link>

                    {/* Ajustes */}
                    <Link href="/settings" className="relative flex flex-col items-center gap-1 group">
                        <div className={`p-2 rounded-xl transition-all duration-300 ${pathname === '/settings' ? 'text-gold' : 'text-gray-400'}`}>
                            <Settings size={24} />
                            {pathname === '/settings' && (
                                <motion.div layoutId="nav-glow" className="absolute inset-0 bg-gold/10 blur-xl rounded-full -z-10" />
                            )}
                        </div>
                        <span className={`text-[10px] uppercase tracking-widest font-bold ${pathname === '/settings' ? 'text-gold' : 'text-gray-500'}`}>Ajustes</span>
                    </Link>
                </div>
            </nav>

            <TransactionModal
                isOpen={isTransactionModalOpen}
                onClose={() => setIsTransactionModalOpen(false)}
                onSuccess={() => router.refresh()}
            />
        </>
    );
}
