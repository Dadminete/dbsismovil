'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ReactNode } from 'react';

interface NavItemProps {
    href?: string;
    isActive: boolean;
    label: string;
    icon: ReactNode;
    onClick?: () => void;
    isButton?: boolean;
}

export default function NavItem({ href = '#', isActive, label, icon, onClick, isButton = false }: NavItemProps) {
    const content = (
        <div className="relative flex flex-col items-center gap-1 group">
            <div className={`p-2 rounded-xl transition-all duration-300 ${isActive ? 'text-gold' : 'text-gray-400'}`}>
                {icon}
                {isActive && (
                    <motion.div layoutId="nav-glow" className="absolute inset-0 bg-gold/10 blur-xl rounded-full -z-10" />
                )}
            </div>
            <span className={`text-[10px] uppercase tracking-widest font-bold ${isActive ? 'text-gold' : 'text-gray-500'}`}>
                {label}
            </span>
        </div>
    );

    if (isButton) {
        return (
            <button
                onClick={onClick}
                className="relative flex flex-col items-center gap-1 group active:scale-95 transition-all"
            >
                {content}
            </button>
        );
    }

    return <Link href={href}>{content}</Link>;
}
