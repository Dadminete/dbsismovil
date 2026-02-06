'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { LogOut, Shield, Bell, Moon, Sun, Smartphone, ChevronLeft, Fingerprint, Check, Download } from 'lucide-react';

export default function SettingsPage() {
    const router = useRouter();
    const [darkMode, setDarkMode] = useState(true);
    const [notifications, setNotifications] = useState(true);
    const [biometricEnabled, setBiometricEnabled] = useState(false);
    const [showToast, setShowToast] = useState('');
    const [deferredPrompt, setDeferredPrompt] = useState<any>(null);
    const [isAppInstalled, setIsAppInstalled] = useState(false);
    const [showPWAModal, setShowPWAModal] = useState(false);
    const [pwaInstructions, setPwaInstructions] = useState({ title: '', steps: [''] });

    useEffect(() => {
        // Load saved preferences
        const savedDarkMode = localStorage.getItem('darkMode');
        const savedNotifications = localStorage.getItem('notifications');
        const savedBiometric = localStorage.getItem('biometricEnabled');

        if (savedDarkMode !== null) setDarkMode(savedDarkMode === 'true');
        if (savedNotifications !== null) setNotifications(savedNotifications === 'true');
        if (savedBiometric !== null) setBiometricEnabled(savedBiometric === 'true');

        // Listen for PWA install prompt
        const handleBeforeInstallPrompt = (e: any) => {
            e.preventDefault();
            setDeferredPrompt(e);
        };
        window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);

        // Check if app is installed
        if (window.matchMedia('(display-mode: standalone)').matches) {
            setIsAppInstalled(true);
        }

        return () => window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    }, []);

    const toast = (message: string) => {
        setShowToast(message);
        setTimeout(() => setShowToast(''), 2000);
    };

    const toggleDarkMode = () => {
        const newValue = !darkMode;
        setDarkMode(newValue);
        localStorage.setItem('darkMode', String(newValue));
        document.documentElement.classList.toggle('light', !newValue);
        toast(newValue ? 'Tema oscuro activado' : 'Tema claro activado');
    };

    const toggleNotifications = async () => {
        if (!notifications) {
            // Request notification permission
            if ('Notification' in window) {
                const permission = await Notification.requestPermission();
                if (permission === 'granted') {
                    setNotifications(true);
                    localStorage.setItem('notifications', 'true');
                    toast('Notificaciones activadas');
                } else {
                    toast('Permiso de notificaciones denegado');
                }
            }
        } else {
            setNotifications(false);
            localStorage.setItem('notifications', 'false');
            toast('Notificaciones desactivadas');
        }
    };

    const toggleBiometric = async () => {
        if (!biometricEnabled) {
            // Check if biometric is available
            if (window.PublicKeyCredential) {
                try {
                    const available = await PublicKeyCredential.isUserVerifyingPlatformAuthenticatorAvailable();
                    if (!available) {
                        toast('Biométrico no disponible en este dispositivo');
                        return;
                    }

                    // Create challenge (in production this should come from server)
                    const challenge = new Uint8Array(32);
                    window.crypto.getRandomValues(challenge);

                    // Create credentials
                    const credential = await navigator.credentials.create({
                        publicKey: {
                            challenge,
                            rp: {
                                name: 'ETE Movil',
                                id: window.location.hostname,
                            },
                            user: {
                                id: new Uint8Array(16), // User ID should be unique/persistent
                                name: 'admin', // Should be current user's username
                                displayName: 'Usuario Admin',
                            },
                            pubKeyCredParams: [{ alg: -7, type: 'public-key' }],
                            authenticatorSelection: {
                                authenticatorAttachment: 'platform',
                                userVerification: 'required',
                            },
                            timeout: 60000,
                            attestation: 'none',
                        }
                    });

                    if (credential) {
                        setBiometricEnabled(true);
                        localStorage.setItem('biometricEnabled', 'true');
                        toast('Acceso biométrico activado y registrado');
                    }
                } catch (err) {
                    console.error(err);
                    toast('Error al registrar huella');
                }
            } else {
                toast('Tu navegador no soporta biométrico');
            }
        } else {
            setBiometricEnabled(false);
            localStorage.setItem('biometricEnabled', 'false');
            toast('Acceso biométrico desactivado');
        }
    };

    const handleSecurity = () => {
        toast('Configuración de seguridad próximamente');
    };

    const handlePWAInstall = async () => {
        if (deferredPrompt) {
            deferredPrompt.prompt();
            const { outcome } = await deferredPrompt.userChoice;
            if (outcome === 'accepted') {
                toast('App instalada correctamente');
                setIsAppInstalled(true);
            }
            setDeferredPrompt(null);
        } else {
            // Check if already installed
            if (window.matchMedia('(display-mode: standalone)').matches) {
                toast('La app ya está instalada');
                return;
            }

            // Detect device and browser for specific instructions
            const ua = navigator.userAgent.toLowerCase();
            const isIOS = /iphone|ipad|ipod/.test(ua);
            const isAndroid = /android/.test(ua);
            const isSafari = /safari/.test(ua) && !/chrome/.test(ua);
            const isChrome = /chrome/.test(ua) && !/edge/.test(ua);
            const isSamsung = /samsungbrowser/.test(ua);

            let instructions = { title: '', steps: [''] };

            if (isIOS) {
                instructions = {
                    title: 'Instalar en iPhone/iPad',
                    steps: isSafari ? [
                        '1. Toca el ícono de compartir ↑ en la barra inferior',
                        '2. Desplázate y toca "Añadir a pantalla de inicio"',
                        '3. Toca "Añadir" para confirmar'
                    ] : [
                        '1. Abre esta página en Safari',
                        '2. Toca el ícono de compartir ↑',
                        '3. Selecciona "Añadir a pantalla de inicio"'
                    ]
                };
            } else if (isAndroid) {
                instructions = {
                    title: 'Instalar en Android',
                    steps: (isChrome || isSamsung) ? [
                        '1. Toca el menú ⋮ (tres puntos) arriba a la derecha',
                        '2. Selecciona "Instalar aplicación" o "Añadir a pantalla de inicio"',
                        '3. Confirma la instalación'
                    ] : [
                        '1. Abre esta página en Chrome',
                        '2. Toca el menú ⋮ (tres puntos)',
                        '3. Selecciona "Instalar aplicación"'
                    ]
                };
            } else {
                instructions = {
                    title: 'Instalar en Desktop',
                    steps: isChrome ? [
                        '1. Busca el ícono de instalación en la barra de direcciones',
                        '2. Haz clic y selecciona "Instalar"'
                    ] : [
                        '1. Usa Google Chrome para instalar',
                        '2. Busca el ícono de instalación en la barra de direcciones'
                    ]
                };
            }

            setPwaInstructions(instructions);
            setShowPWAModal(true);
        }
    };

    const handleLogout = async () => {
        try {
            await fetch('/api/auth/logout', { method: 'POST' });
            router.push('/login');
        } catch {
            toast('Error al cerrar sesión');
        }
    };

    const options = [
        {
            icon: Bell,
            label: 'Notificaciones',
            color: 'text-blue-400',
            active: notifications,
            onClick: toggleNotifications
        },
        {
            icon: darkMode ? Moon : Sun,
            label: 'Tema Oscuro',
            color: 'text-purple-400',
            value: darkMode ? 'Activado' : 'Desactivado',
            active: darkMode,
            onClick: toggleDarkMode
        },
        {
            icon: Fingerprint,
            label: 'Acceso Biométrico',
            color: 'text-emerald-400',
            active: biometricEnabled,
            onClick: toggleBiometric
        },
        {
            icon: Shield,
            label: 'Seguridad',
            color: 'text-green-400',
            onClick: handleSecurity
        },
        {
            icon: deferredPrompt ? Download : Smartphone,
            label: 'App PWA',
            color: 'text-gold',
            value: isAppInstalled ? 'Instalada' : (deferredPrompt ? 'Disponible' : ''),
            onClick: handlePWAInstall
        },
    ];

    return (
        <div className="flex flex-col gap-8 pb-20">
            {/* Toast */}
            {showToast && (
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0 }}
                    className="fixed top-4 left-1/2 -translate-x-1/2 z-50 glass px-6 py-3 rounded-2xl text-sm font-bold text-gold"
                >
                    {showToast}
                </motion.div>
            )}

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
                    <Image src="/logo.jpg" alt="Logo" fill sizes="64px" className="object-cover" />
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
                        onClick={opt.onClick}
                        className="glass rounded-3xl p-5 flex items-center justify-between group active:scale-95 transition-all cursor-pointer"
                    >
                        <div className="flex items-center gap-4">
                            <div className={`p-2 rounded-xl bg-white/5 ${opt.color}`}>
                                <opt.icon size={20} />
                            </div>
                            <span className="font-bold text-sm tracking-tight">{opt.label}</span>
                        </div>
                        {opt.value ? (
                            <span className="text-[10px] font-black uppercase text-gold italic">{opt.value}</span>
                        ) : opt.active !== undefined ? (
                            <div className={`w-6 h-6 rounded-full border flex items-center justify-center transition-all ${opt.active ? 'bg-gold border-gold text-black' : 'border-white/10'}`}>
                                {opt.active && <Check size={14} strokeWidth={3} />}
                            </div>
                        ) : (
                            <div className="w-6 h-6 rounded-full border border-white/10" />
                        )}
                    </motion.div>
                ))}

                <button
                    onClick={handleLogout}
                    className="mt-4 glass border-red-500/20 rounded-3xl p-5 flex items-center justify-center gap-2 text-red-500 font-black uppercase text-xs tracking-widest active:scale-95 transition-all"
                >
                    <LogOut size={16} /> Cerrar Sesión
                </button>
            </div>

            <p className="text-center text-[8px] text-gray-600 font-bold uppercase tracking-[0.2em]">ETE Movil v1.0.0 • BY Empresa Tecnológica del Este</p>

            {/* PWA Instructions Modal */}
            {showPWAModal && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="fixed inset-0 bg-black/80 z-50 flex items-center justify-center p-6"
                    onClick={() => setShowPWAModal(false)}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0 }}
                        animate={{ scale: 1, opacity: 1 }}
                        className="glass rounded-[30px] p-6 max-w-sm w-full"
                        onClick={(e) => e.stopPropagation()}
                    >
                        <div className="flex items-center gap-3 mb-4">
                            <div className="p-3 rounded-2xl bg-gold/10 text-gold">
                                <Smartphone size={24} />
                            </div>
                            <h3 className="font-black text-lg">{pwaInstructions.title}</h3>
                        </div>

                        <div className="flex flex-col gap-3 mb-6">
                            {pwaInstructions.steps.map((step, idx) => (
                                <p key={idx} className="text-sm text-gray-300 font-medium pl-2 border-l-2 border-gold/30">
                                    {step}
                                </p>
                            ))}
                        </div>

                        <p className="text-[10px] text-gray-500 text-center mb-4">
                            La instalación se realiza desde el navegador, no desde este botón.
                        </p>

                        <button
                            onClick={() => setShowPWAModal(false)}
                            className="w-full py-3 rounded-2xl bg-gold/10 text-gold font-bold uppercase text-xs tracking-widest active:scale-95 transition-all"
                        >
                            Entendido
                        </button>
                    </motion.div>
                </motion.div>
            )}
        </div>
    );
}
