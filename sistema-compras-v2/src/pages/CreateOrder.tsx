import { useState } from 'react';
import { useForm } from 'react-hook-form';
import { useNavigate } from 'react-router-dom';
import { Plus, Trash2, Save, Loader2 } from 'lucide-react';
import { supabase } from '../services/supabase';
import { Input } from '../components/UI/Input';
import { Select } from '../components/UI/Select';
import { Textarea } from '../components/UI/Textarea';
import { type PurchaseOrderForm, type OrderItem } from '../types/orders';

import { useQuery } from '@tanstack/react-query';

export default function CreateOrder() {
    const { register, handleSubmit } = useForm<PurchaseOrderForm>();
    const [items, setItems] = useState<OrderItem[]>([]);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    // Fetch Suppliers
    const { data: suppliersList } = useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => {
            const { data } = await supabase.from('suppliers').select('id, name').order('name');
            return data || [];
        }
    });

    const onSubmit = async (data: PurchaseOrderForm) => {
        if (items.length === 0) {
            alert('Debe agregar al menos un item a la orden.');
            return;
        }

        setLoading(true);
        try {
            const { data: result, error } = await supabase.rpc('create_complete_order', {
                p_order_data: {
                    ...data,
                    supplier_id: Number(data.supplier_id) // Ensure number
                },
                p_items_data: items
            });

            if (error) throw error;
            if (result && !result.success) throw new Error(result.error);

            console.log('Order created:', result);
            alert(`¡Orden ${result.order_number} creada exitosamente!`);
            navigate('/');
        } catch (err: any) {
            console.error('Error creating order:', err);
            alert(`Error al crear la orden: ${err.message}`);
        } finally {
            setLoading(false);
        }
    };

    const addItem = () => {
        setItems([...items, {
            description: '',
            quantity: 1,
            unit_price: 0,
            unit_measure: 'und',
            subtotal: 0
        }]);
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
                                {...register('department')}
                                options={[
                                    { value: 'logistica', label: 'Logística' },
                                    { value: 'administracion', label: 'Administración' },
                                    { value: 'misiones', label: 'Misiones' }
                                ]}
                            />
                            <Select
                                label="Unidad que Autoriza"
                                {...register('authorizer_unit')}
                                options={[
                                    { value: 'presidencia', label: 'Presidencia' },
                                    { value: 'tesoreria', label: 'Tesorería' }
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
                            <Input
                                label="Lugar de Entrega"
                                placeholder="Ej: Sede Central"
                                {...register('delivery_location')}
                            />
                        </div>
                        <div className="mt-4">
                            <Textarea
                                label="Detalles del Proyecto / Uso"
                                placeholder="Describa brevemente para qué se utilizarán estos materiales..."
                                {...register('project_details')}
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
                                    {...register('supplier_id', { required: 'Este campo es requerido' })}
                                    className="w-full rounded-lg border-slate-200 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm"
                                >
                                    <option value="">-- Seleccione --</option>
                                    {suppliersList?.map((s: any) => (
                                        <option key={s.id} value={s.id}>{s.name}</option>
                                    ))}
                                </select>
                            </div>
                            <Select
                                label="Condición de Pago"
                                {...register('payment_conditions')}
                                options={[
                                    { value: 'contado', label: 'Contado / Efectivo' },
                                    { value: 'credito_15', label: 'Crédito 15 días' },
                                    { value: 'transferencia', label: 'Transferencia Bancaria' }
                                ]}
                            />
                        </div>
                    </div>

                    {/* Sección 3: Items */}
                    <div className="bg-white p-6 rounded-xl shadow-sm border border-slate-100">
                        <div className="flex justify-between items-center mb-4 border-b pb-2">
                            <h2 className="text-lg font-semibold text-slate-800">Items de la Orden</h2>
                            <button
                                type="button"
                                onClick={addItem}
                                className="text-sm text-sky-600 hover:text-sky-700 font-medium flex items-center"
                            >
                                <Plus className="w-4 h-4 mr-1" />
                                Agregar Item
                            </button>
                        </div>

                        <div className="space-y-4">
                            {items.length === 0 && (
                                <div className="text-center py-8 text-slate-400 border-2 border-dashed border-slate-200 rounded-lg">
                                    No hay items agregados. Haga clic en "Agregar Item".
                                </div>
                            )}

                            {items.map((item, index) => (
                                <div key={index} className="flex gap-4 items-start bg-slate-50 p-4 rounded-lg border border-slate-200">
                                    <div className="flex-1 space-y-3">
                                        <Input
                                            label="Descripción"
                                            value={item.description}
                                            onChange={(e) => updateItem(index, 'description', e.target.value)}
                                            placeholder="Nombre del producto..."
                                        />
                                        <div className="grid grid-cols-4 gap-3">
                                            <Input
                                                label="Cant."
                                                type="number"
                                                value={item.quantity}
                                                onChange={(e) => updateItem(index, 'quantity', e.target.value)}
                                            />
                                            <Input
                                                label="Unidad"
                                                value={item.unit_measure}
                                                onChange={(e) => updateItem(index, 'unit_measure', e.target.value)}
                                            />
                                            <Input
                                                label="Precio Unit."
                                                type="number"
                                                value={item.unit_price}
                                                onChange={(e) => updateItem(index, 'unit_price', e.target.value)}
                                            />
                                            <div className="pt-7 text-right font-semibold text-slate-700">
                                                S/ {item.subtotal.toFixed(2)}
                                            </div>
                                        </div>
                                    </div>
                                    <button
                                        onClick={() => removeItem(index)}
                                        className="mt-8 text-slate-400 hover:text-red-500 transition-colors"
                                    >
                                        <Trash2 className="w-5 h-5" />
                                    </button>
                                </div>
                            ))}
                        </div>

                        <div className="mt-6 flex justify-end items-center border-t pt-4">
                            <span className="text-lg text-slate-600 mr-4">Total Estimado:</span>
                            <span className="text-2xl font-bold text-slate-900">S/ {calculateTotal().toFixed(2)}</span>
                        </div>
                    </div>

                </div>

                {/* Sidebar Informativo */}
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
    );
}
