import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '../services/supabase';

export default function ForgotPassword() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null);
    const getErrorMessage = (error: unknown) => error instanceof Error ? error.message : 'No se pudo enviar el enlace de recuperación.';

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setMessage(null);

        try {
            const redirectTo = `${window.location.origin}/reset-password`;
            const { error } = await supabase.auth.resetPasswordForEmail(email, { redirectTo });
            if (error) throw error;

            setMessage({
                type: 'success',
                text: 'Te enviamos un enlace para restablecer tu contraseña.'
            });
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
                <h1 className="text-2xl font-bold text-white mb-2 text-center">Recuperar contraseña</h1>
                <p className="text-slate-300 text-sm text-center mb-6">
                    Ingresa tu correo y te enviaremos un enlace seguro.
                </p>

                {message && (
                    <div className={`mb-4 p-3 rounded-lg text-sm ${message.type === 'success'
                        ? 'bg-green-500/20 text-green-200 border border-green-500/30'
                        : 'bg-red-500/20 text-red-200 border border-red-500/30'
                        }`}>
                        {message.text}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                        <label htmlFor="email" className="block text-sm font-medium text-slate-300 mb-2">
                            Correo Electrónico
                        </label>
                        <input
                            id="email"
                            type="email"
                            required
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            className="w-full px-4 py-3 bg-slate-800/50 border border-slate-600 rounded-lg text-white placeholder-slate-400 focus:outline-none focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all"
                            placeholder="nombre@ladp.org.pe"
                        />
                    </div>

                    <button
                        type="submit"
                        disabled={loading}
                        className="w-full py-3 px-4 bg-sky-500 hover:bg-sky-600 active:bg-sky-700 text-white font-semibold rounded-lg shadow-lg shadow-sky-500/30 transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                        {loading ? 'Enviando...' : 'Enviar enlace'}
                    </button>
                </form>

                <div className="mt-6 text-center">
                    <Link to="/login" className="text-sm text-sky-300 hover:text-sky-200">
                        Volver al login
                    </Link>
                </div>
            </div>
        </div>
    );
}
