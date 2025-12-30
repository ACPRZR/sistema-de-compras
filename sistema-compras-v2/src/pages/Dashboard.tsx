import { useEffect, useState } from 'react';
import { Plus, ShoppingCart, Wrench, FileText, CheckCircle2, Clock, MessageCircle, Copy } from 'lucide-react';
import { supabase } from '../services/supabase';

import { Link } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import Toast, { type ToastType } from '../components/UI/Toast';

const getStatusBadge = (status: string) => {
    switch (status) {
        case 'created': return <span className="px-2 py-1 bg-blue-100 text-blue-700 rounded-full text-xs font-semibold">Creada</span>;
        case 'pending_approval': return <span className="px-2 py-1 bg-yellow-100 text-yellow-700 rounded-full text-xs font-semibold">En Revisión</span>;
        case 'approved': return <span className="px-2 py-1 bg-green-100 text-green-700 rounded-full text-xs font-semibold">Aprobada</span>;
        case 'rejected': return <span className="px-2 py-1 bg-red-100 text-red-700 rounded-full text-xs font-semibold">Rechazada</span>;
        default: return <span className="px-2 py-1 bg-gray-100 text-gray-600 rounded-full text-xs font-semibold">{status}</span>;
    }
};

const getTypeIcon = (type: string) => {
    return type === 'service'
        ? <Wrench className="w-4 h-4 text-indigo-600" />
        : <ShoppingCart className="w-4 h-4 text-sky-600" />;
};

export default function Dashboard() {
    const queryClient = useQueryClient();
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    // React Query Fetcher
    const { data: orders = [], isLoading, error } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select(`
                    *,
                    profiles:profiles!orders_user_id_fkey (full_name, email),
                    supplier:suppliers (name, ruc),
                    cost_centers (code, name),
                    categories (name)
                `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data || [];
        }
    });

    // Realtime Subscription
    useEffect(() => {
        const channel = supabase
            .channel('dashboard-orders')
            .on(
                'postgres_changes',
                { event: '*', schema: 'public', table: 'orders' },
                (payload) => {
                    console.log('Realtime update:', payload);

                    // Invalidate to refresh table
                    queryClient.invalidateQueries({ queryKey: ['orders'] });

                    // Notification Logic
                    if (payload.eventType === 'UPDATE') {
                        const newOrder = payload.new as any; // Cast to avoid strict type checks here for brevity

                        if (newOrder.status === 'approved') {
                            setToast({
                                message: `¡La Orden #${newOrder.order_number} ha sido APROBADA!`,
                                type: 'success'
                            });
                        } else if (newOrder.status === 'rejected') {
                            setToast({
                                message: `La Orden #${newOrder.order_number} ha sido RECHAZADA.`,
                                type: 'error'
                            });
                        }
                    } else if (payload.eventType === 'INSERT') {
                        setToast({
                            message: `Nueva Orden #${(payload.new as any).order_number} registrada.`,
                            type: 'info'
                        });
                    }
                }
            )
            .subscribe((status) => {
                console.log('Realtime Subscription Status:', status);
                if (status === 'SUBSCRIBED') {
                    console.log('Listening for updates on orders table...');
                }
            });

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    const exportToCSV = () => {
        if (!orders || orders.length === 0) return;

        const headers = [
            'N° Orden',
            'Fecha Creación',
            'Estado',
            'Moneda',
            'Total',
            'Solicitante',
            'Unidad Negocio (Área)',
            'Centro de Costos (Destino)',
            'Categoría',
            'Tipo Compra',
            'Proveedor',
            'RUC Proveedor',
            'Fecha Aprobación',
            'Detalles Proyecto'
        ];

        const csvContent = [
            headers.join(','),
            ...orders.map((o: any) => [
                o.order_number,
                new Date(o.created_at).toLocaleDateString(),
                o.status,
                'PEN', // Hardcoded currency for now as per system default
                o.total_amount,
                `"${o.profiles?.full_name || o.profiles?.email || ''}"`,
                `"${o.department || ''}"`,
                `"${o.cost_centers?.code || ''} - ${o.cost_centers?.name || ''}"`,
                `"${o.categories?.name || ''}"`,
                o.purchase_type || '',
                `"${o.supplier?.name || ''}"`,
                `"${o.supplier?.ruc || ''}"`,
                o.approved_at ? new Date(o.approved_at).toLocaleDateString() : '',
                `"${(o.project_details || '').replace(/"/g, '""')}"` // Escape quotes in description
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `reporte_compras_ladp_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    if (isLoading) return <div className="p-8 text-center">Cargando dashboard...</div>;
    if (error) return <div className="p-8 text-red-500">Error cargando datos: {(error as Error).message}</div>;

    return (
        <div className="space-y-6 relative">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Dashboard General</h1>
                    <p className="text-slate-500 mt-1">Resumen de operaciones y órdenes recientes.</p>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={exportToCSV}
                        className="bg-white hover:bg-slate-50 text-slate-700 border border-slate-200 px-4 py-2 rounded-lg font-medium flex items-center shadow-sm transition-all"
                    >
                        <FileText className="w-5 h-5 mr-2" />
                        Exportar CSV
                    </button>
                    <Link
                        to="/ordenes/nueva"
                        className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-lg shadow-sky-500/20 transition-all"
                    >
                        <Plus className="w-5 h-5 mr-2" />
                        Nueva Orden
                    </Link>
                </div>
            </header>

            {/* KPI Grid */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
                    <div className="p-3 bg-blue-50 text-blue-600 rounded-lg mr-4">
                        <FileText className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-slate-500 text-sm font-medium mb-1">Total Órdenes</div>
                        <div className="text-3xl font-bold text-slate-900">{orders?.length || 0}</div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
                    <div className="p-3 bg-orange-50 text-orange-500 rounded-lg mr-4">
                        <Clock className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-slate-500 text-sm font-medium mb-1">Pendientes</div>
                        <div className="text-3xl font-bold text-slate-900">
                            {orders?.filter((o: any) => o.status === 'created' || o.status === 'review').length || 0}
                        </div>
                    </div>
                </div>
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 flex items-center">
                    <div className="p-3 bg-emerald-50 text-emerald-600 rounded-lg mr-4">
                        <CheckCircle2 className="w-8 h-8" />
                    </div>
                    <div>
                        <div className="text-slate-500 text-sm font-medium mb-1">Aprobadas</div>
                        <div className="text-3xl font-bold text-slate-900">
                            {orders?.filter((o: any) => o.status === 'approved').length || 0}
                        </div>
                    </div>
                </div>
            </div>

            {/* Recent Orders Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50">
                    <h2 className="font-semibold text-slate-800">Órdenes Recientes</h2>
                </div>
                <div className="overflow-x-auto">
                    <table className="w-full text-left text-sm">
                        <thead>
                            <tr className="border-b border-slate-100 text-slate-500">
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Tipo</th>
                                <th className="px-6 py-4 font-medium">N° Orden</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Fecha</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Solicitante</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Estado</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Total</th>
                                <th className="px-6 py-4 text-left text-xs font-semibold text-slate-500 uppercase tracking-wider">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {isLoading ? (
                                <tr><td colSpan={7} className="text-center py-8">Cargando...</td></tr>
                            ) : orders?.map((order: any) => (
                                <tr key={order.id} className="hover:bg-slate-50 transition-colors cursor-pointer">
                                    <td className="px-6 py-4 whitespace-nowrap">
                                        <div className="flex justify-start">
                                            {getTypeIcon(order.order_type || 'purchase')}
                                        </div>
                                    </td>
                                    <td className="px-6 py-4 whitespace-nowrap font-medium text-sky-600">
                                        <Link to={`/ordenes/${order.id}`}>
                                            {order.order_number}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-slate-500 whitespace-nowrap">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 whitespace-nowrap">
                                        {order.profiles?.full_name || order.profiles?.email || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4">
                                        {getStatusBadge(order.status)}
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700">
                                        S/ {order.total_amount}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {order.whatsapp_token && order.status === 'created' && (
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
                                    </td >
                                </tr >
                            ))}
                            {
                                orders?.length === 0 && (
                                    <tr>
                                        <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                                            No hay órdenes registradas aún.
                                        </td>
                                    </tr>
                                )
                            }
                        </tbody >
                    </table >
                </div >
            </div >
        </div >
    );
}
