'use client';

import { useEffect, useState } from 'react';

export interface UserSession {
    id: string;
    nombre: string;
    email: string;
    rol: string | null;
    isTecnico: boolean;
}

export function useSessionUser() {
    const [user, setUser] = useState<UserSession | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        async function fetchUser() {
            try {
                const res = await fetch('/api/auth/me');
                if (res.ok) {
                    const data = await res.json();
                    setUser(data);
                } else {
                    setUser(null);
                }
            } catch (error) {
                console.error('Error fetching user session:', error);
                setUser(null);
            } finally {
                setLoading(false);
            }
        }

        fetchUser();
    }, []);

    return { user, loading };
}
