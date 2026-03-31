'use client';

import { useEffect, useRef, useCallback } from 'react';
import { useRouter, usePathname } from 'next/navigation';

export default function SessionTimeout() {
    const router = useRouter();
    const pathname = usePathname();
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    
    // Timeout in milliseconds (55 seconds = 55,000ms)
    const TIMEOUT = 55000; 

    const handleLogout = useCallback(async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
            router.refresh();
        } catch (error) {
            console.error('Auto-logout error:', error);
        }
    }, [router]);

    const resetTimer = useCallback(() => {
        if (timerRef.current) {
            clearTimeout(timerRef.current);
        }
        timerRef.current = setTimeout(handleLogout, TIMEOUT);
    }, [handleLogout]);

    useEffect(() => {
        // Don't run on login page
        if (pathname === '/login') {
            if (timerRef.current) clearTimeout(timerRef.current);
            return;
        }

        // List of events to listen for
        const events = [
            'mousedown',
            'mousemove',
            'keypress',
            'scroll',
            'touchstart',
            'click'
        ];

        // Initialize timer
        resetTimer();

        // Add event listeners
        events.forEach(event => {
            window.addEventListener(event, resetTimer);
        });

        // Cleanup
        return () => {
            if (timerRef.current) clearTimeout(timerRef.current);
            events.forEach(event => {
                window.removeEventListener(event, resetTimer);
            });
        };
    }, [pathname, resetTimer]);

    return null; // This component doesn't render anything
}
