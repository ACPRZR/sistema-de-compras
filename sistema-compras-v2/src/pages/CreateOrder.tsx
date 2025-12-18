import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { Plus, Trash2, Save, Loader2, UploadCloud, FileText, X } from 'lucide-react';
import { supabase } from '../services/supabase';
import { Input } from '../components/UI/Input';
import { Select } from '../components/UI/Select';
import { Textarea } from '../components/UI/Textarea';
import { type PurchaseOrderForm, type OrderItem } from '../types/orders';

import { useQuery } from '@tanstack/react-query';

export default function CreateOrder() {
    const [searchParams] = useSearchParams();
    const orderType = searchParams.get('type') === 'service' ? 'service' : 'purchase';

    const { register, handleSubmit } = useForm<PurchaseOrderForm>();
    const [items, setItems] = useState<OrderItem[]>([]);
    const [files, setFiles] = useState<File[]>([]);
    const [loading, setLoading] = useState(false);

    // New Item State
    const [newItemDescription, setNewItemDescription] = useState('');
    const [newItemQuantity, setNewItemQuantity] = useState(1);
    const [newItemUnitMeasure, setNewItemUnitMeasure] = useState('UND');
    const [newItemUnitPrice, setNewItemUnitPrice] = useState(0);

    const navigate = useNavigate();

    // Fetch Suppliers
    const { data: suppliersList } = useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => {
            const { data } = await supabase.from('suppliers').select('id, name').order('name');
            return data || [];
        }
    });

    // Fetch Units
    const { data: unitsList } = useQuery({
        queryKey: ['units'],
        queryFn: async () => {
            const { data } = await supabase.from('units_of_measure').select('code, name').eq('is_active', true).order('name');
            return data || [];
        }
    });

    const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        if (e.target.files) {
            setFiles(prev => [...prev, ...Array.from(e.target.files!)]);
        }
    };

    const removeFile = (index: number) => {
        setFiles(prev => prev.filter((_, i) => i !== index));
    };


    const onSubmit = async (data: PurchaseOrderForm) => {
        if (items.length === 0) {
            alert('Debe agregar al menos un item a la orden.');
            return;
        }

        try {
            setLoading(true);

            // 1. Create Order via RPC
            // 1. Create Order (Direct Insert to bypass outdated RPC)
            const { data: orderData, error: orderError } = await supabase
                .from('orders')
                .insert({
                    user_id: (await supabase.auth.getUser()).data.user?.id,
                    department: data.department, // Keep for legacy or enum mapping
                    department_enum: data.department, // New Enum Field
                    status: 'created',
                    total_amount: calculateTotal(),
                    // New BI Fields
                    required_date: data.required_date,
                    purchase_type: data.purchase_type,
                    payment_condition: data.payment_conditions,
                    delivery_location_id: data.delivery_location_id,
                    whatsapp_token: crypto.randomUUID(), // Generate token for approval flow
                    project_details: data.project_details,
                    priority: data.priority,

                    // Auto-generate order number (simple random for now, trigger handles real one usually)
                    order_number: `OC-${new Date().getFullYear()}-${Math.floor(Math.random() * 10000)}`,
                    supplier_id: data.supplier_id || null
                })
                .select()
                .single();

            if (orderError) throw orderError;
            const orderId = orderData.id;

            // 2. Insert Items
            const itemsData = items.map(item => ({
                order_id: orderId,
                description: item.description,
                quantity: item.quantity,
                unit_price: item.unit_price,
                unit_measure: item.unit_measure,
                // product_id: item.product_id // If we had product selection
            }));

            const { error: itemsError } = await supabase
                .from('order_items')
                .insert(itemsData);

            if (itemsError) throw itemsError;



            // 2. Upload Files if any
            if (files.length > 0) {
                for (const file of files) {
                    const fileExt = file.name.split('.').pop();
                    const fileName = `${orderId}/${crypto.randomUUID()}.${fileExt}`;

                    // Upload to Storage
                    const { error: uploadError } = await supabase.storage
                        .from('quotes')
                        .upload(fileName, file);

                    if (uploadError) {
                        console.error('Error uploading file:', uploadError);
                        continue;
                    }

                    // Get Public URL
                    const { data: { publicUrl } } = supabase.storage
                        .from('quotes')
                        .getPublicUrl(fileName);

                    // Link to Order
                    await supabase.from('order_attachments').insert({
                        order_id: orderId,
                        file_name: file.name,
                        file_url: publicUrl,
                        file_type: file.type
                    });
                }
            }

            alert('Orden creada exitosamente');
            navigate('/');
        } catch (error: any) {
            console.error(error);
            alert('Error al crear la orden: ' + (error.message || JSON.stringify(error)));
        } finally {
            setLoading(false);
        }
    };

    const addItem = () => {
        if (!newItemDescription) {
            alert('Ingrese una descripción');
            return;
        }

        setItems([...items, {
            id: crypto.randomUUID(),
            description: newItemDescription,
            quantity: newItemQuantity,
            unit_price: newItemUnitPrice,
            unit_measure: newItemUnitMeasure,
            subtotal: newItemQuantity * newItemUnitPrice
        }]);

        // Reset
        setNewItemDescription('');
        setNewItemQuantity(1);
        setNewItemUnitPrice(0);
    };

    const removeItem = (index: number) => {
        const newItems = [...items];
        newItems.splice(index, 1);
        setItems(newItems);
    };

    const updateItem = (index: number, field: keyof OrderItem, value: any) => {
        const newItems = [...items];
        const item = { ...newItems[index], [field]: value };

        // Auto-calculate subtotal
        if (field === 'quantity' || field === 'unit_price') {
            const qty = field === 'quantity' ? parseFloat(value) : item.quantity;
            const price = field === 'unit_price' ? parseFloat(value) : item.unit_price;
            item.subtotal = qty * price;
        }

        newItems[index] = item;
        setItems(newItems);
    };

    const calculateTotal = () => items.reduce((acc, item) => acc + item.subtotal, 0);

    return (
        <div className="max-w-5xl mx-auto">
            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Nueva Orden de Compra</h1>
                    <p className="text-slate-500 mt-1">Complete los detalles para iniciar una solicitud.</p>
                </div>
                <button
                    onClick={handleSubmit(onSubmit)}
                    disabled={loading}
                    className="bg-sky-500 hover:bg-sky-600 disabled:opacity-50 disabled:cursor-not-allowed text-white px-6 py-2.5 rounded-lg shadow-lg shadow-sky-500/20 font-medium flex items-center transition-all"
                >
                    {loading ? <Loader2 className="w-5 h-5 mr-2 animate-spin" /> : <Save className="w-5 h-5 mr-2" />}
                    {loading ? 'Guardando...' : 'Guardar Orden'}
                </button>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
                {/* Formulario Principal */}
                <div className="lg:col-span-2 space-y-6">

                    {/* Sección 1: Datos Generales */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Información General</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Select
                                label="Unidad de Negocio"
                                {...register('department', { required: 'Requerido' })}
                                options={[
                                    { value: 'LOGISTICA', label: 'Logística' },
                                    { value: 'MANTENIMIENTO', label: 'Mantenimiento' },
                                    { value: 'CONTABILIDAD', label: 'Contabilidad' },
                                    { value: 'OFICINA_NACIONAL', label: 'Oficina Nacional' },
                                    { value: 'COMUNICACIONES_SISTEMAS', label: 'Comunicaciones y Sistemas' }
                                ]}
                            />
                            <Select
                                label="Prioridad"
                                {...register('priority')}
                                options={[
                                    { value: 'normal', label: 'Normal' },
                                    { value: 'urgent', label: 'Urgente' }
                                ]}
                            />
                        </div>
                        <div className="mt-4">
                            <Textarea
                                label="Detalle del Proyecto / Uso"
                                {...register('project_details')}
                                placeholder="Describa brevemente para qué se usará..."
                            />
                        </div>
                    </div>

                    {/* Sección 1.1: Datos BI (Nuevos) */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Clasificación y Logística</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <Input
                                label="Fecha Requerida"
                                type="date"
                                {...register('required_date', { required: 'Requerido' })}
                            />
                            <Select
                                label="Tipo de Compra"
                                {...register('purchase_type', { required: 'Requerido' })}
                                options={[
                                    { value: 'OPEX', label: 'OPEX (Operativo)' },
                                    { value: 'CAPEX', label: 'CAPEX (Inversión)' },
                                    { value: 'REPOSICION', label: 'Reposición' },
                                    { value: 'URGENCIA', label: 'Urgencia' }
                                ]}
                            />

                        </div>
                    </div>

                    {/* Sección 2: Proveedor */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Proveedor</h2>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                            <div className="space-y-1">
                                <label className="block text-sm font-medium text-slate-700">Seleccionar Proveedor</label>
                                <select
                                    {...register('supplier_id')}
                                    className="w-full rounded-lg border-slate-200 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm"
                                >
                                    <option value="">Sin Proveedor</option>
                                    {suppliersList?.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>

                            <Select
                                label="Condición de Pago"
                                {...register('payment_conditions')}
                                options={[
                                    { value: '30_DIAS', label: '30 Días' },
                                    { value: '60_DIAS', label: '60 Días' },
                                    { value: 'CONTADO', label: 'Contado' }
                                ]}
                            />
                        </div>
                    </div>

                    {/* Sección 3: Items */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 className="text-lg font-semibold text-slate-800">
                                {orderType === 'service' ? 'Conceptos del Servicio' : 'Items de Compra'}
                            </h2>
                        </div>

                        {/* Add Item Form */}
                        <div className="grid grid-cols-12 gap-3 mb-4 items-end bg-slate-50 p-4 rounded-lg">
                            <div className="col-span-5">
                                <Input
                                    id="newItemDesc"
                                    label="Descripción"
                                    placeholder={orderType === 'service' ? "Ej. Mantenimiento de A/C" : "Ej. Laptop HP"}
                                    value={newItemDescription}
                                    onChange={(e) => setNewItemDescription(e.target.value)}
                                />
                            </div>
                            <div className="col-span-2">
                                <Input
                                    id="newItemQty"
                                    label="Cant."
                                    type="number"
                                    placeholder="1"
                                    value={newItemQuantity}
                                    onChange={(e) => setNewItemQuantity(parseFloat(e.target.value))}
                                />
                            </div>
                            <div className="col-span-2">
                                <label className="block text-sm font-medium text-slate-700 mb-1">Unidad</label>
                                <select
                                    value={newItemUnitMeasure}
                                    onChange={(e) => setNewItemUnitMeasure(e.target.value)}
                                    className="w-full rounded-lg border-slate-200 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm h-[42px]"
                                >
                                    {unitsList?.map((u: any) => (
                                        <option key={u.code} value={u.code}>{u.code} - {u.name}</option>
                                    ))}
                                    {!unitsList?.length && <option value="UND">UND</option>}
                                </select>
                            </div>
                            <div className="col-span-2">
                                <Input
                                    id="newItemPrice"
                                    label="Precio Unit."
                                    type="number"
                                    placeholder="0.00"
                                    value={newItemUnitPrice}
                                    onChange={(e) => setNewItemUnitPrice(parseFloat(e.target.value))}
                                />
                            </div>
                            <div className="col-span-1">
                                <button
                                    type="button"
                                    onClick={addItem}
                                    className="w-full h-[42px] bg-sky-500 hover:bg-sky-600 text-white rounded-lg flex items-center justify-center shadow-md transition-all"
                                >
                                    <Plus className="w-5 h-5" />
                                </button>
                            </div>
                        </div>

                        {/* List Items */}
                        <div className="space-y-2">
                            {items.map(item => (
                                <div key={item.id} className="grid grid-cols-12 gap-4 items-center p-3 hover:bg-slate-50 rounded-lg border border-transparent hover:border-slate-100 transition-all">
                                    <div className="col-span-5 font-medium text-slate-700">{item.description}</div>
                                    <div className="col-span-2 text-center text-slate-600">{item.quantity} {item.unit_measure}</div>
                                    <div className="col-span-2 text-right text-slate-600">S/ {item.unit_price.toFixed(2)}</div>
                                    <div className="col-span-2 text-right font-bold text-slate-800">S/ {item.subtotal.toFixed(2)}</div>
                                    <div className="col-span-1 text-center">
                                        <button type="button" onClick={() => removeItem(items.indexOf(item))} className="text-red-400 hover:text-red-600">
                                            <Trash2 className="w-4 h-4" />
                                        </button>
                                    </div>
                                </div>
                            ))}
                            {items.length === 0 && (
                                <div className="text-center py-8 text-slate-400 italic">
                                    No hay items agregados
                                </div>
                            )}
                        </div>

                        {/* Total */}
                        <div className="mt-6 flex justify-end">
                            <div className="text-right">
                                <span className="text-slate-500 mr-4">Total Estimado:</span>
                                <span className="text-2xl font-bold text-slate-900">
                                    S/ {items.reduce((acc, item) => acc + item.subtotal, 0).toFixed(2)}
                                </span>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Right Column - Attachments & Actions */}
                <div className="space-y-8">
                    {/* Attachments Section */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <h2 className="text-lg font-semibold text-slate-800 mb-4 border-b pb-2">Cotizaciones / Adjuntos</h2>

                        <div className="border-2 border-dashed border-slate-200 rounded-xl p-6 text-center hover:bg-slate-50 transition-colors cursor-pointer relative">
                            <input
                                type="file"
                                multiple
                                onChange={handleFileChange}
                                className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                            />
                            <div className="flex flex-col items-center">
                                <UploadCloud className="w-8 h-8 text-sky-500 mb-2" />
                                <p className="text-sm font-medium text-slate-700">Click para subir archivos</p>
                                <p className="text-xs text-slate-400 mt-1">PDF, PNG, JPG (Max 5MB)</p>
                            </div>
                        </div>

                        {/* File List */}
                        <div className="mt-4 space-y-2">
                            {files.map((file, idx) => (
                                <div key={idx} className="flex items-center justify-between p-2 bg-slate-50 rounded-lg text-sm">
                                    <div className="flex items-center truncate">
                                        <FileText className="w-4 h-4 text-slate-400 mr-2 flex-shrink-0" />
                                        <span className="truncate max-w-[150px]">{file.name}</span>
                                    </div>
                                    <button
                                        type="button"
                                        onClick={() => removeFile(idx)}
                                        className="text-slate-400 hover:text-red-500"
                                    >
                                        <X className="w-4 h-4" />
                                    </button>
                                </div>
                            ))}
                        </div>
                        <div className="space-y-6">
                            <div className="bg-sky-50 border border-sky-100 p-6 rounded-xl">
                                <h3 className="font-semibold text-sky-800 mb-2">Flujo de Aprobación</h3>
                                <ul className="space-y-3">
                                    <li className="flex items-center text-sm text-sky-700">
                                        <div className="w-6 h-6 rounded-full bg-sky-200 flex items-center justify-center text-xs font-bold mr-3">1</div>
                                        Solicitud Creada
                                    </li>
                                    <li className="flex items-center text-sm text-sky-700 opacity-50">
                                        <div className="w-6 h-6 rounded-full bg-sky-200 flex items-center justify-center text-xs font-bold mr-3">2</div>
                                        Revisión (WhatsApp)
                                    </li>
                                    <li className="flex items-center text-sm text-sky-700 opacity-50">
                                        <div className="w-6 h-6 rounded-full bg-sky-200 flex items-center justify-center text-xs font-bold mr-3">3</div>
                                        Aprobada
                                    </li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}
