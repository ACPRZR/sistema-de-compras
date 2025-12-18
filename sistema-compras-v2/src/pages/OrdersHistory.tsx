
import React, { useEffect, useState } from 'react';
import { supabase } from '../services/supabase';
import { Link } from 'react-router-dom';
import { ShoppingCart, Wrench, MessageCircle, Copy } from 'lucide-react';
import { format } from 'date-fns';

const getTypeIcon = (type: string) => {
    return type === 'service'
        ? <Wrench className="w-4 h-4 text-indigo-600" />
        : <ShoppingCart className="w-4 h-4 text-sky-600" />;
};

export default function OrdersHistory() {
    const [orders, setOrders] = useState<any[]>([]);
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchOrders = async () => {
            setIsLoading(true);
            try {
                // Fetch orders
                const { data: ordersData, error: ordersError } = await supabase
                    .from('orders')
                    .select('*')
                    .order('created_at', { ascending: false });

                if (ordersError) throw ordersError;

                // Manual join for profiles
                const userIds = Array.from(new Set(ordersData?.map(o => o.user_id).filter(Boolean)));
                let profilesMap: Record<string, any> = {};

                if (userIds.length > 0) {
                    const { data: profilesData } = await supabase
                        .from('profiles')
                        .select('id, full_name, email')
                        .in('id', userIds);

                    if (profilesData) {
                        profilesMap = profilesData.reduce((acc, profile) => {
                            acc[profile.id] = profile;
                            return acc;
                        }, {} as Record<string, any>);
                    }
                }

                const enrichedOrders = ordersData?.map(order => ({
                    ...order,
                    profiles: profilesMap[order.user_id] || null
                })) || [];

                setOrders(enrichedOrders);
            } catch (err) {
                console.error('Error loading history:', err);
            } finally {
                setIsLoading(false);
            }
        };

        fetchOrders();
    }, []);

    if (isLoading) return <div className="p-8 text-center text-slate-500">Cargando historial...</div>;

    return (
        <div className="space-y-6">
            <h1 className="text-2xl font-bold text-slate-800">Historial de Órdenes</h1>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead className="bg-slate-50 border-b border-slate-100">
                            <tr>
                                <th className="px-6 py-4 font-medium text-slate-500">N° Orden</th>
                                <th className="px-6 py-4 font-medium text-slate-500">Tipo</th>
                                <th className="px-6 py-4 font-medium text-slate-500">Solicitante</th>
                                <th className="px-6 py-4 font-medium text-slate-500">Estado</th>
                                <th className="px-6 py-4 font-medium text-slate-500">Fecha</th>
                                <th className="px-6 py-4 font-medium text-slate-500">Total</th>
                                <th className="px-6 py-4 font-medium text-slate-500 text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50">
                                    <td className="px-6 py-4 font-medium text-sky-600">
                                        <Link to={`/ordenes/${order.id}`}>{order.order_number}</Link>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {getTypeIcon(order.order_type)}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {order.profiles?.full_name || order.profiles?.email || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold
                                            ${order.status === 'approved' ? 'bg-green-100 text-green-700' :
                                                order.status === 'rejected' ? 'bg-red-100 text-red-700' : 'bg-yellow-100 text-yellow-700'}`}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700">
                                        S/ {order.total_amount}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {order.whatsapp_token && (order.status === 'created' || order.status === 'pending_approval') && (
                                            <div className="flex items-center gap-2 justify-end">
                                                <button
                                                    onClick={() => {
                                                        const link = `${window.location.origin}/approval?token=${order.whatsapp_token}&action=approve`;
                                                        const message = `Hola, solicito aprobación para la Orden *${order.order_number}* de valor *S/ ${order.total_amount}*. \n\nLink de aprobación: ${link}`;
                                                        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
                                                    }}
                                                    className="p-2 bg-green-50 text-green-600 rounded-full hover:bg-green-100 transition-colors"
                                                    title="Enviar por WhatsApp"
                                                >
                                                    <MessageCircle className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const link = `${window.location.origin}/approval?token=${order.whatsapp_token}&action=approve`;
                                                        navigator.clipboard.writeText(link);
                                                        alert('Link copiado al portapapeles');
                                                    }}
                                                    className="p-2 bg-slate-50 text-slate-600 rounded-full hover:bg-slate-100 transition-colors"
                                                    title="Copiar Link"
                                                >
                                                    <Copy className="w-4 h-4" />
                                                </button>
                                            </div>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {orders.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                                        No hay órdenes en el historial.
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>
            </div>
        </div>
    );
}
