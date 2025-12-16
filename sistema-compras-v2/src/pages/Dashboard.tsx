
import React, { useEffect, useState } from 'react';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { Plus, FileText, CheckCircle2, Clock, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Dashboard() {
    const queryClient = useQueryClient();

    // Fetch Orders
    const { data: orders, isLoading, error } = useQuery({
        queryKey: ['orders'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('orders')
                .select(`
          *,
          profiles:user_id (full_name, email)
        `)
                .order('created_at', { ascending: false });

            if (error) throw error;
            return data;
        },
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
                    queryClient.invalidateQueries({ queryKey: ['orders'] });
                }
            )
            .subscribe();

        return () => {
            supabase.removeChannel(channel);
        };
    }, [queryClient]);

    const exportToCSV = () => {
        if (!orders || orders.length === 0) return;

        const headers = ['Order Number', 'Date', 'Status', 'Total', 'Department', 'Requester'];
        const csvContent = [
            headers.join(','),
            ...orders.map(o => [
                o.order_number,
                new Date(o.created_at).toLocaleDateString(),
                o.status,
                o.total_amount,
                o.department,
                o.profiles?.full_name || o.profiles?.email
            ].join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const link = document.createElement('a');
        link.href = URL.createObjectURL(blob);
        link.download = `orders_export_${new Date().toISOString().split('T')[0]}.csv`;
        link.click();
    };

    if (isLoading) return <div className="p-8 text-center">Cargando dashboard...</div>;
    if (error) return <div className="p-8 text-red-500">Error cargando datos: {error.message}</div>;

    return (
        <div className="space-y-6">
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
                            {orders?.filter(o => o.status === 'created' || o.status === 'review').length || 0}
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
                            {orders?.filter(o => o.status === 'approved').length || 0}
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
                                <th className="px-6 py-4 font-medium">N° Orden</th>
                                <th className="px-6 py-4 font-medium">Solicitante</th>
                                <th className="px-6 py-4 font-medium">Unidad</th>
                                <th className="px-6 py-4 font-medium">Estado</th>
                                <th className="px-6 py-4 font-medium">Monto</th>
                                <th className="px-6 py-4 font-medium">Fecha</th>
                                <th className="px-6 py-4 font-medium text-right">Acciones</th>
                            </tr>
                        </thead>
                        <tbody className="divide-y divide-slate-100">
                            {orders?.map((order) => (
                                <tr key={order.id} className="hover:bg-slate-50 transition-colors">
                                    <td className="px-6 py-4 font-medium text-slate-900">
                                        <Link to={`/ordenes/${order.id}`} className="hover:text-sky-600 hover:underline">
                                            {order.order_number || `ID-${order.id}`}
                                        </Link>
                                    </td>
                                    <td className="px-6 py-4 text-slate-600">
                                        {order.profiles?.full_name || order.profiles?.email || 'N/A'}
                                    </td>
                                    <td className="px-6 py-4 text-slate-600 capitalize">
                                        {order.department || '-'}
                                    </td>
                                    <td className="px-6 py-4">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium capitalize
                      ${order.status === 'approved' ? 'bg-emerald-100 text-emerald-800' :
                                                order.status === 'rejected' ? 'bg-red-100 text-red-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }
                    `}>
                                            {order.status}
                                        </span>
                                    </td>
                                    <td className="px-6 py-4 font-medium text-slate-700">
                                        S/ {order.total_amount}
                                    </td>
                                    <td className="px-6 py-4 text-slate-500">
                                        {new Date(order.created_at).toLocaleDateString()}
                                    </td>
                                    <td className="px-6 py-4 text-right">
                                        {order.whatsapp_token && order.status === 'created' && (
                                            <a
                                                href={`https://yzhhmixqfkwrhiaortib.supabase.co/functions/v1/process-approval?token=${order.whatsapp_token}&action=approve`}
                                                target="_blank"
                                                rel="noopener noreferrer"
                                                className="text-xs bg-green-100 text-green-600 px-3 py-1 rounded-full hover:bg-green-200 transition-colors font-medium"
                                                title="Simular Clic del Presidente"
                                            >
                                                Simular Aprobación
                                            </a>
                                        )}
                                    </td>
                                </tr>
                            ))}
                            {orders?.length === 0 && (
                                <tr>
                                    <td colSpan={7} className="px-6 py-8 text-center text-slate-400">
                                        No hay órdenes registradas aún.
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
