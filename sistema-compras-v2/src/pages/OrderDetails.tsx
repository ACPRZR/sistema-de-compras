
import { useParams, Link } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { ArrowLeft, Printer, CheckCircle2, XCircle, Clock } from 'lucide-react';

export default function OrderDetails() {
    const { id } = useParams<{ id: string }>();

    const { data: order, isLoading, error } = useQuery({
        queryKey: ['order', id],
        queryFn: async () => {
            // Fetch Order + Items + Profile + Supplier
            const { data, error } = await supabase
                .from('orders')
                .select(`
          *,
          items:order_items(*),
          profile:user_id(full_name, email),
          supplier:supplier_id(name, ruc)
        `)
                .eq('id', id)
                .single();

            if (error) throw error;
            return data;
        },
    });

    if (isLoading) return <div className="p-8 text-center">Cargando detalles...</div>;
    if (error || !order) return <div className="p-8 text-red-500">Orden no encontrada.</div>;

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'approved': return 'bg-emerald-100 text-emerald-700 border-emerald-200';
            case 'rejected': return 'bg-red-100 text-red-700 border-red-200';
            default: return 'bg-amber-100 text-amber-700 border-amber-200';
        }
    };

    return (
        <div className="max-w-4xl mx-auto space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between print:hidden">
                <div className="flex items-center gap-4">
                    <Link to="/" className="p-2 hover:bg-slate-100 rounded-full transition-colors">
                        <ArrowLeft className="w-6 h-6 text-slate-500" />
                    </Link>
                    <div>
                        <h1 className="text-2xl font-bold text-slate-900">
                            Orden {order.order_number}
                        </h1>
                        <p className="text-slate-500 text-sm">
                            Creada el {new Date(order.created_at).toLocaleDateString()} por {order.profile?.full_name}
                        </p>
                    </div>
                </div>
                <div className="flex gap-3">
                    <button
                        onClick={() => window.print()}
                        className="flex items-center gap-2 px-4 py-2 bg-slate-800 text-white rounded-lg hover:bg-slate-700 transition-colors shadow-lg shadow-slate-900/10"
                    >
                        <Printer className="w-4 h-4" />
                        Imprimir / PDF
                    </button>
                    <div className={`px-4 py-1.5 rounded-full border text-sm font-semibold flex items-center capitalize ${getStatusColor(order.status)}`}>
                        {order.status === 'approved' && <CheckCircle2 className="w-4 h-4 mr-2" />}
                        {order.status === 'rejected' && <XCircle className="w-4 h-4 mr-2" />}
                        {order.status === 'review' && <Clock className="w-4 h-4 mr-2" />}
                        {order.status}
                    </div>
                </div>
            </div>

            {/* Print Only Header */}
            <div className="hidden print:block mb-8 border-b pb-6">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-3xl font-bold text-slate-900">ORDEN DE COMPRA</h1>
                        <p className="text-slate-500 text-lg mt-1">{order.order_number}</p>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-slate-900 text-xl">Mi Empresa S.A.C.</div>
                        <div className="text-slate-500 text-sm">RUC: 20123456789</div>
                        <div className="text-slate-500 text-sm">Av. Principal 123, Lima</div>
                        <div className="text-slate-500 text-sm mt-2">Fecha: {new Date(order.created_at).toLocaleDateString()}</div>
                    </div>
                </div>
            </div>

            {/* Main Info Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-8">
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Información del Proveedor</h2>
                    <div className="space-y-3">
                        <div>
                            <span className="text-slate-400 text-sm block">Razón Social</span>
                            <span className="font-medium text-slate-900">{order.supplier?.name || 'Proveedor Manual'}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm block">RUC</span>
                            <span className="font-medium text-slate-900">{order.supplier?.ruc || '-'}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm block">Condición de Pago</span>
                            <span className="font-medium text-slate-900 capitalize">{order.payment_conditions?.replace('_', ' ')}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Datos de Logística</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div>
                            <span className="text-slate-400 text-sm block">Unidad Solicitante</span>
                            <span className="font-medium text-slate-900 capitalize">{order.department}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm block">Autoriza</span>
                            <span className="font-medium text-slate-900 capitalize">{order.authorizer_unit}</span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-slate-400 text-sm block">Lugar de Entrega</span>
                            <span className="font-medium text-slate-900">{order.delivery_location}</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h2 className="font-semibold text-slate-800">Detalle de Items</h2>
                </div>
                <table className="w-full text-left text-sm">
                    <thead className="bg-slate-50 text-slate-500">
                        <tr>
                            <th className="px-6 py-3 font-medium">Descripción</th>
                            <th className="px-6 py-3 font-medium text-center">Unidad</th>
                            <th className="px-6 py-3 font-medium text-right">Cant.</th>
                            <th className="px-6 py-3 font-medium text-right">Precio Unit.</th>
                            <th className="px-6 py-3 font-medium text-right">Subtotal</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {order.items?.map((item: any) => (
                            <tr key={item.id}>
                                <td className="px-6 py-4 text-slate-900">{item.description}</td>
                                <td className="px-6 py-4 text-center text-slate-500">{item.unit_measure}</td>
                                <td className="px-6 py-4 text-right text-slate-700">{item.quantity}</td>
                                <td className="px-6 py-4 text-right text-slate-700">S/ {item.unit_price}</td>
                                <td className="px-6 py-4 text-right font-medium text-slate-900">S/ {item.subtotal}</td>
                            </tr>
                        ))}
                    </tbody>
                    <tfoot className="bg-slate-50 border-t border-slate-200">
                        <tr>
                            <td colSpan={4} className="px-6 py-4 text-right font-bold text-slate-600">TOTAL GENERAL</td>
                            <td className="px-6 py-4 text-right font-bold text-slate-900 text-lg">S/ {order.total_amount}</td>
                        </tr>
                    </tfoot>
                </table>
            </div>

            {/* Project Details */}
            <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:shadow-none print:border print:border-slate-200">
                <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-2">Detalles del Proyecto / Uso</h2>
                <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 print:bg-white print:border-none print:p-0">
                    {order.project_details || 'Sin detalles adicionales.'}
                </p>
            </div>

            {/* Signatures Area (Print Only) */}
            <div className="hidden print:grid grid-cols-3 gap-8 mt-20 pt-10 border-t border-slate-200">
                <div className="text-center">
                    <div className="border-t border-slate-800 w-3/4 mx-auto pt-2">
                        <p className="font-medium text-slate-900">Solicitante</p>
                        <p className="text-xs text-slate-500">{order.profile?.full_name}</p>
                    </div>
                </div>
                <div className="text-center">
                    <div className="border-t border-slate-800 w-3/4 mx-auto pt-2">
                        <p className="font-medium text-slate-900">Jefe Inmediato</p>
                        <p className="text-xs text-slate-500">Autorizado</p>
                    </div>
                </div>
                <div className="text-center">
                    <div className="border-t border-slate-800 w-3/4 mx-auto pt-2">
                        <p className="font-medium text-slate-900">Gerencia / Logística</p>
                        <p className="text-xs text-slate-500">V° B°</p>
                    </div>
                </div>
            </div>
        </div>
    );
}

