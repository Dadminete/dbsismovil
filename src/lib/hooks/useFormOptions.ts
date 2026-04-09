import { useState, useEffect } from 'react';

export interface FormOptions {
    cajas: any[];
    banks: any[];
    accounts: any[];
    categories: any[];
    papeleriaCategories: any[];
}

const initialOptions: FormOptions = {
    cajas: [],
    banks: [],
    accounts: [],
    categories: [],
    papeleriaCategories: []
};

export function useFormOptions() {
    const [options, setOptions] = useState<FormOptions>(initialOptions);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');

    const fetchOptions = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/finance/form-data');
            if (!res.ok) throw new Error('Failed to fetch form options');
            const data: FormOptions = await res.json();
            setOptions(data);
            setError('');
        } catch (err) {
            console.error('Error fetching form options:', err);
            setError('Error al cargar opciones del formulario');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOptions();
    }, []);

    return { options, loading, error, refetch: fetchOptions };
}
