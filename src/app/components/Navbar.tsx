'use client';

import { useState } from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Users, Settings, DollarSign, PieChart } from 'lucide-react';
import { motion } from 'framer-motion';
import TransactionModal from './TransactionModal';

export default function Navbar() {
    const pathname = usePathname();
    const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);

    if (pathname === '/login') return null;

    const links = [
        { href: '/', icon: Home, label: 'Dashboard' },
        { href: '/clients', icon: Users, label: 'Clientes' },
        { href: '/settings', icon: Settings, label: 'Ajustes' },
    ];

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
                        onClick={() => setIsTransactionModalOpen(true)}
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
            />
        </>
    );
}
