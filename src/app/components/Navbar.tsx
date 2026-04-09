'use client';

import { useState } from 'react';
import { usePathname, useSearchParams } from 'next/navigation';
import { Home, Users, Settings, DollarSign, PieChart, BadgeCheck } from 'lucide-react';
import { useRouter } from 'next/navigation';
import NavItem from './NavItem';
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

    const estado = searchParams.get('estado')?.toLowerCase();
    const isClientesActive = pathname === '/clients' && estado !== 'pagado';
    const isPagadosActive = pathname === '/clients' && estado === 'pagado';
    const isSettingsActive = pathname === '/settings';

    if (isTecnico) {
        return (
            <nav className="fixed bottom-0 left-0 right-0 h-20 glass border-t border-border-glass z-50 px-6 pb-4 pt-2">
                <div className="flex justify-around items-center h-full max-w-lg mx-auto">
                    <NavItem
                        href="/clients"
                        isActive={isClientesActive}
                        label="Clientes"
                        icon={<Users size={24} />}
                    />
                    <NavItem
                        href="/clients?estado=pagado"
                        isActive={isPagadosActive}
                        label="Pagados"
                        icon={<BadgeCheck size={24} />}
                    />
                    <NavItem
                        href="/settings"
                        isActive={isSettingsActive}
                        label="Ajustes"
                        icon={<Settings size={24} />}
                    />
                </div>
            </nav>
        );
    }

    return (
        <>
            <nav className="fixed bottom-0 left-0 right-0 h-20 glass border-t border-border-glass z-50 px-6 pb-4 pt-2">
                <div className="flex justify-around items-center h-full max-w-lg mx-auto">
                    <NavItem
                        href="/"
                        isActive={pathname === '/'}
                        label="Dashboard"
                        icon={<Home size={24} />}
                    />

                    <NavItem
                        isActive={isTransactionModalOpen}
                        label="Operar"
                        icon={<DollarSign size={24} />}
                        isButton={true}
                        onClick={() => {
                            if (typeof navigator !== 'undefined' && navigator.vibrate) navigator.vibrate(20);
                            setIsTransactionModalOpen(true);
                        }}
                    />

                    <NavItem
                        href="/finance"
                        isActive={pathname === '/finance'}
                        label="Finanzas"
                        icon={<PieChart size={24} />}
                    />

                    <NavItem
                        href="/clients"
                        isActive={pathname === '/clients'}
                        label="Clientes"
                        icon={<Users size={24} />}
                    />

                    <NavItem
                        href="/settings"
                        isActive={pathname === '/settings'}
                        label="Ajustes"
                        icon={<Settings size={24} />}
                    />
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
