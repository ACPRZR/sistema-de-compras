
import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { Plus, Trash2, Search, Building2 } from 'lucide-react';
import { Input } from '../components/UI/Input';

interface Supplier {
    id: number;
    name: string;
    ruc: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    contact_name: string;
    contact_email: string;
    contact_phone: string;
    category_id?: number;
    categories?: { name: string }; // Join
}

export default function Suppliers() {
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [searchTerm, setSearchTerm] = useState('');
    const queryClient = useQueryClient();

    // Fetch Suppliers
    const { data: suppliers, isLoading } = useQuery({
        queryKey: ['suppliers'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('suppliers')
                .select('*, categories(name)') // Join to display name
                .order('name');

            if (error) throw error;
            return data as Supplier[];
        },
    });

    // Fetch Categories
    const { data: categoriesList } = useQuery({
        queryKey: ['categories'],
        queryFn: async () => {
            const { data } = await supabase.from('categories').select('id, name').eq('is_active', true).order('name');
            return data || [];
        }
    });

    // Create Supplier Mutation
    const createMutation = useMutation({
        mutationFn: async (newSupplier: Omit<Supplier, 'id'>) => {
            const { error } = await supabase.from('suppliers').insert(newSupplier);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
            setIsModalOpen(false);
        },
        onError: (err: any) => {
            alert('Error al crear proveedor: ' + err.message);
        }
    });

    // Delete Supplier Mutation
    const deleteMutation = useMutation({
        mutationFn: async (id: number) => {
            const { error } = await supabase.from('suppliers').delete().eq('id', id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['suppliers'] });
        },
    });

    const handleSubmit = (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();
        const formData = new FormData(e.currentTarget);
        createMutation.mutate({
            name: formData.get('name') as string,
            ruc: formData.get('ruc') as string,
            contact_name: formData.get('contact_name') as string,
            contact_email: formData.get('contact_email') as string,
            contact_phone: formData.get('contact_phone') as string,
            contact_email: formData.get('contact_email') as string,
            contact_phone: formData.get('contact_phone') as string,
            category_id: formData.get('category_id') ? Number(formData.get('category_id')) : undefined,
        });
    };

    const filteredSuppliers = suppliers?.filter(s =>
        s.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.ruc.includes(searchTerm)
    );

    return (
        <div className="space-y-6">
            <header className="flex justify-between items-center">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Proveedores</h1>
                    <p className="text-slate-500 mt-1">Gestión de proveedores y contactos.</p>
                </div>
                <button
                    onClick={() => setIsModalOpen(true)}
                    className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium flex items-center shadow-lg shadow-sky-500/20 transition-all"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Nuevo Proveedor
                </button>
            </header>

            {/* Search Bar */}
            <div className="bg-white p-4 rounded-xl shadow-sm border border-slate-100 flex items-center gap-2">
                <Search className="w-5 h-5 text-slate-400" />
                <input
                    type="text"
                    placeholder="Buscar por nombre o RUC..."
                    className="flex-1 outline-none text-slate-700 placeholder:text-slate-400"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                />
            </div>

            {/* Suppliers Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                {isLoading ? (
                    <div className="col-span-3 text-center py-10 text-slate-400">Cargando...</div>
                ) : filteredSuppliers?.length === 0 ? (
                    <div className="col-span-3 text-center py-10 text-slate-400">No se encontraron proveedores.</div>
                ) : (
                    filteredSuppliers?.map((supplier) => (
                        <div key={supplier.id} className="bg-white p-6 rounded-xl shadow-sm border border-slate-100 hover:shadow-md transition-shadow group relative">
                            <button
                                onClick={() => {
                                    if (confirm('¿Seguro que desea eliminar este proveedor?')) deleteMutation.mutate(supplier.id);
                                }}
                                className="absolute top-4 right-4 text-slate-300 hover:text-red-500 transition-colors opacity-0 group-hover:opacity-100"
                            >
                                <Trash2 className="w-5 h-5" />
                            </button>

                            <div className="flex items-center mb-4">
                                <div className="w-10 h-10 bg-indigo-50 text-indigo-600 rounded-lg flex items-center justify-center mr-3">
                                    <Building2 className="w-6 h-6" />
                                </div>
                                <div>
                                    <h3 className="font-bold text-slate-900 line-clamp-1">{supplier.name}</h3>
                                    <div className="flex gap-1 mt-1">
                                        <div className="text-xs text-slate-500 font-mono bg-slate-100 inline-block px-1.5 py-0.5 rounded">
                                            {supplier.ruc || 'S/N'}
                                        </div>
                                        {supplier.categories?.name && (
                                            <div className="text-xs bg-sky-100 text-sky-700 px-2 py-0.5 rounded-full inline-block">
                                                {supplier.categories.name}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            </div>

                            <div className="space-y-2 text-sm text-slate-600">
                                <div className="flex items-center">
                                    <span className="w-20 text-slate-400">Contacto:</span>
                                    <span className="font-medium">{supplier.contact_name || '-'}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-20 text-slate-400">Email:</span>
                                    <span className="truncate">{supplier.contact_email || '-'}</span>
                                </div>
                                <div className="flex items-center">
                                    <span className="w-20 text-slate-400">Teléfono:</span>
                                    <span>{supplier.contact_phone || '-'}</span>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Create Modal */}
            {
                isModalOpen && (
                    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 backdrop-blur-sm">
                        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-6 m-4">
                            <h2 className="text-xl font-bold text-slate-900 mb-4">Registrar Proveedor</h2>
                            <form onSubmit={handleSubmit} className="space-y-4">
                                <Input name="name" label="Razón Social" required placeholder="Ej: Importaciones SAC" />
                                <Input name="ruc" label="RUC" placeholder="20..." />
                                <Input name="contact_name" label="Nombre de Contacto" placeholder="Juan Perez" />
                                <div className="grid grid-cols-2 gap-4">
                                    <Input name="contact_email" label="Email" type="email" placeholder="contacto@empresa.com" />
                                    <Input name="contact_phone" label="Teléfono" placeholder="999..." />
                                </div>

                                <div className="space-y-1">
                                    <label className="block text-sm font-medium text-slate-700">Categoría Principal</label>
                                    <select
                                        name="category_id"
                                        className="w-full rounded-lg border-slate-200 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm h-[40px]"
                                    >
                                        <option value="">-- Sin Categoría --</option>
                                        {categoriesList?.map((cat: any) => (
                                            <option key={cat.id} value={cat.id}>{cat.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="flex justify-end gap-3 mt-6 pt-4 border-t">
                                    <button
                                        type="button"
                                        onClick={() => setIsModalOpen(false)}
                                        className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg font-medium"
                                    >
                                        Cancelar
                                    </button>
                                    <button
                                        type="submit"
                                        disabled={createMutation.isPending}
                                        className="bg-sky-500 hover:bg-sky-600 text-white px-4 py-2 rounded-lg font-medium shadow-lg shadow-sky-500/20"
                                    >
                                        {createMutation.isPending ? 'Guardando...' : 'Guardar Proveedor'}
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                )
            }
        </div >
    );
}
