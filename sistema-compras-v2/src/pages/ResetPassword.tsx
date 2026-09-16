import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function ResetPassword() {
    const navigate = useNavigate();
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [ready, setReady] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'No se pudo actualizar la contraseña.';

    useEffect(() => {
        const verifySession = async () => {
            const { data } = await supabase.auth.getSession();
            setReady(!!data.session);
        };

        verifySession();
    }, []);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setMessage(null);

        if (password.length < 8) {
            setMessage({ type: 'error', text: 'La contraseña debe tener al menos 8 caracteres.' });
            return;
        }

        if (password !== confirmPassword) {
            setMessage({ type: 'error', text: 'Las contraseñas no coinciden.' });
            return;
        }

        setLoading(true);

        try {
            const { error } = await supabase.auth.updateUser({ password });
            if (error) throw error;

            setMessage({ type: 'success', text: 'Contraseña actualizada. Redirigiendo al login...' });
            setTimeout(() => navigate('/login'), 1500);
        } catch (error: unknown) {
            setMessage({
                type: 'error',
                text: getErrorMessage(error)
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-slate-900 to-slate-800 p-4">
            <div className="w-full max-w-md bg-white/10 backdrop-blur-lg rounded-2xl p-8 shadow-2xl border border-white/20">
                <h1 className="text-2xl font-bold text-white mb-2 text-center">Nueva contraseña</h1>
                <p className="text-slate-300 text-sm text-center mb-6">
                    Define una nueva contraseña para tu cuenta.
                </p>

                {message && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success'
                        ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                        : 'bg-red-500/20 text-red-200 border border-red-500/30'
                        }`}>
                        {message.text}
                    </div>
                )}

                {!ready ? (
                    <div className="text-sm text-amber-200 bg-amber-500/20 border border-amber-500/30 rounded-lg p-3">
                        Enlace inválido o expirado. Solicita un nuevo enlace de recuperación.
                    </div>
                ) : (
                    <form onSubmit={handleSubmit} className="space-y-4">
                        <div>
                            <label htmlFor="password" className="block text-sm font-medium text-slate-300 mb-2">
                                Nueva contraseña
                            </label>
                            <input
                                id="password"
                                type="password"
                                required
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                placeholder="Mínimo 8 caracteres"
                            />
                        </div>

                        <div>
                            <label htmlFor="confirmPassword" className="block text-sm font-medium text-slate-300 mb-2">
                                Confirmar contraseña
                            </label>
                            <input
                                id="confirmPassword"
                                type="password"
                                required
                                value={confirmPassword}
                                onChange={(e) => setConfirmPassword(e.target.value)}
                                className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                                placeholder="Repite la contraseña"
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold rounded-lg shadow-lg shadow-sky-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {loading ? 'Actualizando...' : 'Actualizar contraseña'}
                        </button>
                    </form>
                )}

                <div className="mt-6 text-center">
                    <Link to="/forgot-password" className="text-sm text-sky-300 hover:text-sky-200">
                        Solicitar nuevo enlace
                    </Link>
                </div>
            </div>
        </div>
    );
}
