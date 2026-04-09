import { useState, useEffect } from 'react';

interface CajaSessionResult {
    isOpen: boolean;
    error: string;
}

export function useCajaSession(cajaId: string | null, enabled: boolean = true): CajaSessionResult {
    const [isOpen, setIsOpen] = useState(true);
    const [error, setError] = useState('');

    useEffect(() => {
        if (!enabled || !cajaId) {
            setIsOpen(true);
            setError('');
            return;
        }

        async function checkSession() {
            try {
                const res = await fetch(`/api/cajas/sesiones?cajaId=${cajaId}`);
                const data = await res.json();
                setIsOpen(data.isOpen);
                if (!data.isOpen) {
                    setError('La caja seleccionada está cerrada. Abra la caja antes de recibir pagos.');
                } else {
                    setError('');
                }
            } catch (err) {
                console.error('Error checking caja session:', err);
                setError('Error al verificar sesión de caja');
            }
        }

        checkSession();
    }, [cajaId, enabled]);

    return { isOpen, error };
}
