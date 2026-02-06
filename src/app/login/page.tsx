'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { motion } from 'framer-motion';
import { User, Lock, Fingerprint, Eye, EyeOff, Loader2 } from 'lucide-react';

export default function LoginPage() {
    const router = useRouter();
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [showPassword, setShowPassword] = useState(false);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [biometricEnabled] = useState(() => {
        if (typeof window !== 'undefined') {
            return localStorage.getItem('biometricEnabled') === 'true';
        }
        return false;
    });

    const handleLogin = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();

            if (!res.ok) {
                setError(data.error || 'Error al iniciar sesión');
                return;
            }

            router.push('/');
        } catch {
            setError('Error de conexión');
        } finally {
            setLoading(false);
        }
    };

    const handleBiometricLogin = async () => {
        if (!window.PublicKeyCredential) {
            setError('Tu navegador no soporta autenticación biométrica');
            return;
        }

        setLoading(true);
        setError('');

        try {
            // Check if biometric is available
            const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
            if (!available) {
                setError('Autenticación biométrica no disponible en este dispositivo');
                setLoading(false);
                return;
            }

            // Request biometric authentication
            const credential = await navigator.credentials.get({
                publicKey: {
                    challenge: new Uint8Array(32),
                    timeout: 60000,
                    userVerification: 'required',
                    rpId: window.location.hostname,
                },
            });

            if (credential) {
                // For demo purposes, auto-login the first user
                const res = await fetch('/api/auth/biometric', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                });

                if (res.ok) {
                    router.push('/');
                } else {
                    setError('Error en autenticación biométrica');
                }
            }
        } catch (err: any) {
            if (err.name === 'NotAllowedError') {
                setError('Autenticación cancelada');
            } else {
                setError('Error en autenticación biométrica');
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center gap-8 px-4 -mt-8">
            <motion.div
                initial={{ opacity: 0, y: -20 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex flex-col items-center gap-4"
            >
                <div className="relative w-24 h-24 rounded-full overflow-hidden border-2 border-gold shadow-[0_0_30px_rgba(212,175,55,0.4)]">
                    <Image src="/logo.jpg" alt="Logo" fill priority sizes="96px" className="object-cover" />
                </div>
                <div className="text-center">
                    <h1 className="text-3xl font-black gold-text-gradient uppercase tracking-tighter">ETE Movil</h1>
                    <p className="text-gray-500 text-[10px] uppercase tracking-widest font-bold">Empresa Tecnológica del Este</p>
                </div>
            </motion.div>

            <motion.form
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                onSubmit={handleLogin}
                className="w-full max-w-sm flex flex-col gap-4"
            >
                <div className="glass rounded-3xl p-1">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <User size={18} className="text-gold" />
                        <input
                            type="text"
                            placeholder="Usuario"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="bg-transparent w-full outline-none text-sm font-medium placeholder:text-gray-500"
                        />
                    </div>
                </div>

                <div className="glass rounded-3xl p-1">
                    <div className="flex items-center gap-3 px-4 py-3">
                        <Lock size={18} className="text-gold" />
                        <input
                            type={showPassword ? 'text' : 'password'}
                            placeholder="Contraseña"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="bg-transparent w-full outline-none text-sm font-medium placeholder:text-gray-500"
                        />
                        <button type="button" onClick={() => setShowPassword(!showPassword)} className="text-gray-500">
                            {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                        </button>
                    </div>
                </div>

                {error && (
                    <motion.p
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        className="text-red-500 text-xs font-bold text-center"
                    >
                        {error}
                    </motion.p>
                )}

                <button
                    type="submit"
                    disabled={loading}
                    className="w-full py-4 rounded-3xl bg-gradient-to-r from-gold to-amber-500 text-black font-black uppercase text-sm tracking-widest shadow-[0_0_20px_rgba(212,175,55,0.4)] active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
                >
                    {loading ? <Loader2 size={18} className="animate-spin" /> : 'Iniciar Sesión'}
                </button>

                {biometricEnabled && (
                    <button
                        type="button"
                        onClick={handleBiometricLogin}
                        disabled={loading}
                        className="w-full py-4 rounded-3xl glass border border-gold/20 text-gold font-black uppercase text-xs tracking-widest active:scale-95 transition-all disabled:opacity-50 flex items-center justify-center gap-3"
                    >
                        <Fingerprint size={20} />
                        Acceder con Huella
                    </button>
                )}
            </motion.form>

            <p className="text-[8px] text-gray-600 font-bold uppercase tracking-[0.2em] text-center">
                ETE Movil v1.0.0 • BY Empresa Tecnológica del Este
            </p>
        </div>
    );
}
