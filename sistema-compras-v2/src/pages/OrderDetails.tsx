import { useParams, Link } from 'react-router-dom';
import { ArrowLeft, Printer, Paperclip, Download, CheckCircle2, XCircle, Clock } from 'lucide-react';
import { supabase } from '../services/supabase';
import { useQuery } from '@tanstack/react-query';
import { format } from 'date-fns';



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
                    items: order_items(*),
                    supplier: suppliers(*),
                    requestor: profiles!orders_user_id_fkey(*),
                    approver: profiles!orders_approver_id_fkey(*),
                    attachments: order_attachments(*),
                    cost_centers (code, name),
                    categories (name)
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
        <div className="max-w-4xl mx-auto space-y-6 print:space-y-4 print:text-xs print:pb-40 font-sans">
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
                            Creada el {new Date(order.created_at).toLocaleDateString()} por {order.requestor?.full_name || order.requestor?.email}
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
                        {order.status === 'review' ? 'En Revisión' : order.status === 'approved' ? 'Aprobada' : 'Rechazada'}
                    </div>
                </div>
            </div>

            {/* Print Only Header */}
            <div className="hidden print:block mb-4 border-b pb-4">
                <div className="flex justify-between items-start">
                    <div>
                        <h1 className="text-xl font-bold text-slate-900 uppercase tracking-tight">Orden de Compra</h1>
                        <p className="text-slate-700 font-bold text-sm mt-1">{order.order_number}</p>
                        <p className="text-slate-500 text-xs mt-0.5">Fecha: {new Date(order.created_at).toLocaleDateString()}</p>
                    </div>
                    <div className="text-right">
                        <div className="font-bold text-slate-900 text-sm">Las Asambleas de Dios del Perú</div>
                        <div className="text-slate-500 text-xs">RUC: 20144538570</div>
                        <div className="text-slate-500 text-xs">Av. Colombia 325 - Pueblo Libre</div>
                    </div>
                </div>
            </div>

            {/* Main Info Cards */}
            {/* Main Info Cards - Restructured */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-8">
                {/* 1. Destination Info (Was Supplier) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Información de Destino</h2>
                    <div className="space-y-3">
                        <div>
                            <span className="text-slate-400 text-sm block">Unidad de Negocio (Solicita)</span>
                            <span className="font-medium text-slate-900 capitalize">{order.department?.toLowerCase() || 'No especificado'}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm block">Centro de Costos (Destino)</span>
                            <div className="font-medium text-slate-900 flex items-center gap-2">
                                <span className="font-mono bg-slate-100 px-1.5 rounded text-xs text-slate-600">{order.cost_centers?.code}</span>
                                <span className="capitalize">{order.cost_centers?.name?.toLowerCase() || 'No asignado'}</span>
                            </div>
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm block">Clasificación del Gasto</span>
                            <span className="font-medium text-blue-600 bg-blue-50 px-2 py-0.5 rounded inline-block text-sm capitalize">
                                {order.categories?.name?.toLowerCase() || 'General'}
                            </span>
                        </div>
                    </div>
                </div>

                {/* 2. Logistics Data (Modified) */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Datos de Logística</h2>
                    <div className="grid grid-cols-2 gap-4">
                        <div className="col-span-2">
                            <span className="text-slate-400 text-sm block">Tipo de Compra</span>
                            <span className="font-medium text-slate-900 capitalize block mb-3">
                                {order.purchase_type === 'service' ? 'Servicios' : 'Bienes / Productos'}
                            </span>
                        </div>
                        <div className="col-span-2">
                            <span className="text-slate-400 text-sm block">Fecha Requerida</span>
                            <span className="font-medium text-slate-900 block">
                                {order.required_date ? new Date(order.required_date).toLocaleDateString() : 'No especificada'}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* 3. Supplier & Project Details (Side by Side) */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 print:gap-8">
                {/* Supplier */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Proveedor</h2>
                    <div className="space-y-3">
                        <div>
                            <span className="text-slate-400 text-sm block">Razón Social</span>
                            <span className="font-medium text-slate-900">{order.supplier?.name || 'Proveedor Manual'}</span>
                        </div>
                        <div>
                            <span className="text-slate-400 text-sm block">RUC/ID</span>
                            <span className="font-medium text-slate-900">{order.supplier?.ruc || '-'}</span>
                        </div>
                    </div>
                </div>

                {/* Project Details */}
                <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 print:shadow-none print:border print:border-slate-200 flex flex-col">
                    <h2 className="text-sm font-semibold text-slate-500 uppercase tracking-wider mb-4">Detalles del Proyecto / Uso</h2>
                    <div className="flex-1">
                        <p className="text-slate-700 leading-relaxed bg-slate-50 p-4 rounded-lg border border-slate-100 print:bg-white print:border-none print:p-0 min-h-[80px] break-words whitespace-pre-wrap">
                            {order.project_details || 'Sin detalles adicionales.'}
                        </p>
                    </div>
                </div>
            </div>

            {/* Items Table */}
            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <div className="px-6 py-4 border-b border-slate-100 bg-slate-50/50 flex justify-between items-center">
                    <h2 className="font-semibold text-slate-800">Detalle de Items</h2>
                </div>
                <table className="w-full text-left text-sm print:text-xs">
                    <thead className="bg-slate-50 text-slate-500 print:table-header-group">
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
                            <tr key={item.id} className="break-inside-avoid">
                                <td className="px-6 py-4 text-slate-900">{item.description}</td>
                                <td className="px-6 py-4 text-center text-slate-500">{item.unit_measure}</td>
                                <td className="px-6 py-4 text-right text-slate-700">{item.quantity}</td>
                                <td className="px-6 py-4 text-right text-slate-700">S/ {item.unit_price}</td>
                                <td className="px-6 py-4 text-right font-medium text-slate-900">
                                    S/ {(item.quantity * item.unit_price).toFixed(2)}
                                </td>
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



            {/* Attachments Section */}
            {order.attachments && order.attachments.length > 0 && (
                <div className="bg-white rounded-xl shadow-sm border border-slate-100 p-8 print:hidden">
                    <h2 className="text-xl font-bold text-slate-800 mb-4 flex items-center">
                        <Paperclip className="w-5 h-5 mr-2 text-slate-500" />
                        Archivos Adjuntos (Cotizaciones)
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {order.attachments.map((file: any) => (
                            <button
                                key={file.id}
                                onClick={async () => {
                                    try {
                                        let urlToOpen = file.file_url;
                                        // If we have a path (private bucket), generate signed URL
                                        if (file.file_path) {
                                            const { data, error } = await supabase.storage
                                                .from('quotes')
                                                .createSignedUrl(file.file_path, 3600); // 1 hour token
                                            if (error) throw error;
                                            urlToOpen = data.signedUrl;
                                        }
                                        window.open(urlToOpen, '_blank');
                                    } catch (err) {
                                        console.error('Error opening file:', err);
                                        alert('No se pudo abrir el archivo. Verifique permisos.');
                                    }
                                }}
                                className="flex items-center p-4 bg-slate-50 border border-slate-200 rounded-lg hover:shadow-md transition-all group w-full text-left"
                            >
                                <div className="flex-1 truncate mr-2">
                                    <p className="text-sm font-medium text-slate-900 truncate">{file.file_name}</p>
                                    <p className="text-xs text-slate-500">{format(new Date(file.created_at), 'dd/MM/yyyy HH:mm')}</p>
                                </div>
                                <Download className="w-5 h-5 text-slate-400 group-hover:text-blue-600" />
                            </button>
                        ))}
                    </div>
                </div>
            )}

            {/* Footer / Signatures Area - Fixed at bottom for Print */}
            <div className="mt-12 break-inside-avoid print:fixed print:bottom-0 print:left-0 print:w-full print:px-8 print:bg-white print:z-50 print:pb-4">
                <div className="flex justify-between items-end gap-8">
                    {/* LEFT: Creator Audit Badge (Always visible) */}
                    <div>
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 w-64 hidden print:block print:bg-transparent print:border-slate-300">
                            <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-2">Creado Por</span>
                            <div className="flex items-center gap-3">
                                <div className="bg-slate-200 p-1.5 rounded-md print:hidden">
                                    <div className="w-8 h-8 flex items-center justify-center bg-slate-800 text-white rounded text-sm font-bold">
                                        {order.requestor?.full_name?.charAt(0) || 'U'}
                                    </div>
                                </div>
                                <div>
                                    <span className="font-bold text-slate-900 block text-sm capitalize">{order.requestor?.full_name?.toLowerCase() || 'Usuario'}</span>
                                    <span className="font-mono text-[10px] text-slate-500 block">ID: {order.user_id}</span>
                                </div>
                                <CheckCircle2 className="w-5 h-5 text-emerald-500 ml-auto" />
                            </div>
                            <div className="mt-2 text-[9px] text-slate-400 border-t border-slate-100 pt-1">
                                Generado el {new Date().toLocaleDateString()}
                            </div>
                        </div>
                    </div>

                    {/* RIGHT: Approver Signature (Only if Approved) */}
                    {/* RIGHT: Approver Audit Badge (Only if Approved) */}
                    {order.status === 'approved' && (
                        <div className="bg-slate-50 border border-slate-200 rounded-lg p-4 w-72 flex items-center justify-between print:bg-transparent print:border-slate-300">
                            <div>
                                <span className="text-slate-400 text-[10px] uppercase tracking-wider block mb-2">Aprobado Por</span>
                                <div className="flex items-center gap-3">
                                    {/* Logo Placeholder - Asking user for path */}
                                    <div className="w-10 h-10 bg-white rounded-full border border-slate-200 flex items-center justify-center p-1 overflow-hidden">
                                        <img src="/logo-adp.png" alt="Logo" className="w-full h-full object-contain" />
                                    </div>

                                    <div>
                                        <span className="font-bold text-slate-900 block text-sm capitalize">{order.approver?.full_name?.toLowerCase() || 'Nombre Aprobador'}</span>
                                        <span className="text-[10px] text-slate-600 block capitalize">{order.approver?.job_title?.toLowerCase() || 'Cargo'}</span>
                                        <span className="font-mono text-[9px] text-slate-400 block">DNI: {order.approver?.dni || '--------'}</span>
                                    </div>
                                </div>
                                <div className="mt-2 text-[9px] text-emerald-600 font-medium border-t border-emerald-100 pt-1 flex items-center gap-1">
                                    <CheckCircle2 className="w-3 h-3" />
                                    <span>Firmado Digitalmente el {new Date(order.approved_at || Date.now()).toLocaleDateString()}</span>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
}

