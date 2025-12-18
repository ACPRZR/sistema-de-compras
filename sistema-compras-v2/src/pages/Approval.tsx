import { useEffect, useState } from 'react';
import { useSearchParams } from 'react-router-dom';
import { supabase } from '../services/supabase';
import { CheckCircle2, XCircle, Loader2, FileText, Lock } from 'lucide-react';
import { format } from 'date-fns';
import { es } from 'date-fns/locale';

interface OrderDetail {
    id: number;
    order_number: string;
    created_at: string;
    total_amount: number;
    supplier: { name: string } | null;
    items: {
        quantity: number;
        unit_price: number;
        total_price: number;
        product: { name: string; sku: string };
    }[];
}

export default function Approval() {
    const [searchParams] = useSearchParams();
    const token = searchParams.get('token');
    // We don't rely on 'action' param for the flow anymore, as the initial load is always 'get-details'
    // and the button click determines 'approve' or 'reject'.

    const [status, setStatus] = useState<'loading' | 'input' | 'processing' | 'success' | 'error'>('loading');
    const [order, setOrder] = useState<OrderDetail | null>(null);
    const [title, setTitle] = useState('');
    const [message, setMessage] = useState('');
    const [pin, setPin] = useState('');

    useEffect(() => {
        const fetchDetails = async () => {
            if (!token) {
                setStatus('error');
                setMessage('Enlace inválido. Falta el token.');
                return;
            }

            try {
                // Fetch Order Details
                const { data, error } = await supabase.functions.invoke('process-approval', {
                    body: { token, action: 'get-details' }
                });

                if (error) throw error;
                if (data.error) throw new Error(data.error);

                setOrder(data.order);
                setStatus('input'); // Ready for input
            } catch (err: any) {
                console.error('Fetch Error:', err);
                setStatus('error');
                setMessage(err.message || 'No se pudo cargar la información de la orden.');
            }
        };

        fetchDetails();
    }, [token]);

    const handleProcess = async (decision: 'approve' | 'reject') => {
        if (!pin || pin.length !== 4) {
            alert('Por favor ingrese un código de 4 dígitos válido.');
            return;
        }

        setStatus('processing');
        try {
            const { data, error } = await supabase.functions.invoke('process-approval', {
                body: {
                    token,
                    action: decision,
                    approval_code: pin
                }
            });

            if (error) throw error;
            if (data.error) throw new Error(data.error);

            setStatus('success');
            setTitle(decision === 'approve' ? '¡Orden Aprobada!' : 'Orden Rechazada');
            setMessage(data.message || 'La operación se completó exitosamente.');
        } catch (err: any) {
            console.error('Process Error:', err);
            setStatus('input'); // Go back to input on error to retry
            alert('Error: ' + (err.message || 'Falló el proceso. Revise el código.'));
        }
    };

    if (status === 'loading') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="text-center">
                    <Loader2 className="w-10 h-10 text-sky-600 animate-spin mx-auto mb-4" />
                    <p className="text-slate-500">Cargando información de la orden...</p>
                </div>
            </div>
        );
    }

    if (status === 'error') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center space-y-4">
                    <div className="bg-red-100 p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center">
                        <XCircle className="w-10 h-10 text-red-600" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">Error</h2>
                    <p className="text-slate-600">{message}</p>
                </div>
            </div>
        );
    }

    if (status === 'success') {
        return (
            <div className="min-h-screen bg-slate-50 flex items-center justify-center p-4">
                <div className="bg-white max-w-md w-full rounded-2xl shadow-xl p-8 text-center space-y-4">
                    <div className={`p-4 rounded-full w-20 h-20 mx-auto flex items-center justify-center ${title.includes('Rechazada') ? 'bg-orange-100' : 'bg-green-100'}`}>
                        {title.includes('Rechazada') ? <XCircle className="w-10 h-10 text-orange-600" /> : <CheckCircle2 className="w-10 h-10 text-green-600" />}
                    </div>
                    <h2 className="text-2xl font-bold text-slate-800">{title}</h2>
                    <p className="text-slate-600">{message}</p>
                    <p className="text-sm text-slate-400 mt-4">Ya puede cerrar esta ventana.</p>
                </div>
            </div>
        );
    }

    // Input State (Summary + Pin)
    return (
        <div className="min-h-screen bg-slate-50 py-12 px-4 sm:px-6 lg:px-8 flex justify-center">
            <div className="max-w-3xl w-full space-y-8">

                {/* Header */}
                <div className="bg-white rounded-2xl shadow-sm p-6 sm:p-8">
                    <div className="flex items-center justify-between mb-6">
                        <div className="flex items-center gap-3">
                            <div className="bg-sky-100 p-3 rounded-lg">
                                <FileText className="w-6 h-6 text-sky-600" />
                            </div>
                            <div>
                                <h1 className="text-2xl font-bold text-slate-900">Solicitud de Aprobación</h1>
                                <p className="text-slate-500">Orden #{order?.order_number}</p>
                            </div>
                        </div>
                        <div className="text-right">
                            <p className="text-sm text-slate-500">Fecha</p>
                            <p className="font-medium">{order?.created_at && format(new Date(order.created_at), 'dd/MM/yyyy', { locale: es })}</p>
                        </div>
                    </div>

                    {/* Summary List */}
                    <div className="border rounded-xl overflow-hidden mb-6">
                        <table className="min-w-full divide-y divide-slate-200">
                            <thead className="bg-slate-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-slate-500 uppercase tracking-wider">Producto</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Cant.</th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-slate-500 uppercase tracking-wider">Total</th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-slate-200">
                                {order?.items.map((item, idx) => (
                                    <tr key={idx}>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900">
                                            {item.product?.name || 'Producto no encontrado'}
                                            <span className="block text-xs text-slate-400">{item.product?.sku || '-'}</span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-500 text-right">{item.quantity}</td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-slate-900 text-right font-medium">
                                            S/ {(Number(item.total_price) || 0).toFixed(2)}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                            <tfoot className="bg-slate-50">
                                <tr>
                                    <td colSpan={2} className="px-6 py-4 text-right font-bold text-slate-900">Total General</td>
                                    <td className="px-6 py-4 text-right font-bold text-sky-600 text-lg">
                                        S/ {(Number(order?.total_amount) || 0).toFixed(2)}
                                    </td>
                                </tr>
                            </tfoot>
                        </table>
                    </div>

                    {/* Supplier Info */}
                    <div className="bg-slate-50 rounded-lg p-4 mb-8 text-sm text-slate-600 flex justify-between items-center">
                        <span className="font-medium">Proveedor:</span>
                        <span>{order?.supplier?.name || 'Sin Proveedor Asignado'}</span>
                    </div>

                    {/* Action Section */}
                    <div className="border-t pt-8">
                        <h3 className="text-lg font-medium text-slate-900 mb-4 flex items-center gap-2">
                            <Lock className="w-5 h-5 text-slate-400" />
                            Validación de Seguridad
                        </h3>

                        <div className="max-w-xs mx-auto space-y-4">
                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">
                                    Código de Aprobación (PIN)
                                </label>
                                <input
                                    type="password"
                                    maxLength={4}
                                    className="block w-full text-center text-2xl tracking-widest rounded-lg border-slate-300 shadow-sm focus:border-sky-500 focus:ring-sky-500 py-3"
                                    placeholder="0000"
                                    value={pin}
                                    onChange={(e) => setPin(e.target.value.replace(/[^0-9]/g, ''))}
                                />
                                <p className="text-xs text-center text-slate-400 mt-2">
                                    Ingrese su código único de 4 dígitos (Presidente o Tesorera)
                                </p>
                            </div>

                            <div className="grid grid-cols-2 gap-4 pt-4">
                                <button
                                    onClick={() => handleProcess('reject')}
                                    disabled={status === 'processing' || pin.length !== 4}
                                    className="w-full py-3 px-4 border border-red-300 rounded-lg shadow-sm text-sm font-medium text-red-700 bg-white hover:bg-red-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    Rechazar
                                </button>
                                <button
                                    onClick={() => handleProcess('approve')}
                                    disabled={status === 'processing' || pin.length !== 4}
                                    className="w-full py-3 px-4 border border-transparent rounded-lg shadow-sm text-sm font-medium text-white bg-sky-600 hover:bg-sky-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sky-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {status === 'processing' ? 'Procesando...' : 'Aprobar Orden'}
                                </button>
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
