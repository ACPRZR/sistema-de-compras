import { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { supabase } from '../services/supabase';
import { useAuth } from '../hooks/useAuth';
import { Loader2, Plus, Edit2, Shield, User as UserIcon, CheckCircle2, XCircle } from 'lucide-react';
import { Input } from '../components/UI/Input';
import { Select } from '../components/UI/Select';
import Toast, { type ToastType } from '../components/UI/Toast';

export default function Users() {
    const { user } = useAuth();
    const queryClient = useQueryClient();
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedUser, setSelectedUser] = useState<any>(null);
    const [toast, setToast] = useState<{ message: string; type: ToastType } | null>(null);

    // Form State
    const [formData, setFormData] = useState({
        full_name: '',
        department: '',
        email: '', // Read only usually, as it's auth linked
    });

    // 1. Fetch Users (Profiles)
    const { data: users = [], isLoading } = useQuery({
        queryKey: ['profiles'],
        queryFn: async () => {
            const { data, error } = await supabase
                .from('profiles')
                .select('*')
                .order('full_name');

            if (error) throw error;
            return data;
        }
    });

    // 2. Fetch User's Own Profile to confirm Admin Access
    const { data: currentUserProfile } = useQuery({
        queryKey: ['my_profile'],
        queryFn: async () => {
            const { data } = await supabase.from('profiles').select('department').eq('id', user?.id).single();
            return data;
        },
        enabled: !!user?.id
    });

    // Access Control
    const isAdmin = currentUserProfile?.department === 'LOGISTICA' || user?.email === 'alvaro-cpr@outlook.com';

    // State for Create vs Edit
    const [modalMode, setModalMode] = useState<'create' | 'edit'>('edit');
    const [createFormData, setCreateFormData] = useState({
        email: '',
        password: '',
        full_name: '',
        department: '',
        role: 'buyer'
    });

    // Mutation: Create User (Edge Function)
    const createUserMutation = useMutation({
        mutationFn: async (data: typeof createFormData) => {
            const { data: responseData, error } = await supabase.functions.invoke('create-user', {
                body: {
                    email: data.email,
                    password: data.password,
                    fullName: data.full_name,
                    department: data.department,
                    role: data.role
                }
            });

            if (error) throw error;
            // Checks for application-level error returned in JSON
            if (responseData?.error) throw new Error(responseData.error);

            return responseData;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profiles'] });
            setToast({ message: 'Usuario creado correctamente', type: 'success' });
            setIsModalOpen(false);
            setCreateFormData({ email: '', password: '', full_name: '', department: '', role: 'buyer' });
        },
        onError: (err: any) => {
            setToast({ message: 'Error al crear usuario: ' + err.message, type: 'error' });
        }
    });

    // Mutation: Update User
    const updateMutation = useMutation({
        mutationFn: async (vars: { id: string, full_name: string, department: string }) => {
            const { error } = await supabase
                .from('profiles')
                .update({
                    full_name: vars.full_name,
                    department: vars.department
                })
                .eq('id', vars.id);
            if (error) throw error;
        },
        onSuccess: () => {
            queryClient.invalidateQueries({ queryKey: ['profiles'] });
            setToast({ message: 'Usuario actualizado correctamente', type: 'success' });
            setIsModalOpen(false);
        },
        onError: (err: any) => {
            setToast({ message: 'Error al actualizar: ' + err.message, type: 'error' });
        }
    });

    const handleCreate = () => {
        setModalMode('create');
        setCreateFormData({ email: '', password: '', full_name: '', department: '', role: 'buyer' });
        setIsModalOpen(true);
    };

    const handleEdit = (user: any) => {
        setModalMode('edit');
        setSelectedUser(user);
        setFormData({
            full_name: user.full_name || '',
            department: user.department || '',
            email: user.email || ''
        });
        setIsModalOpen(true);
    };

    const handleSave = () => {
        if (modalMode === 'edit') {
            if (!selectedUser) return;
            updateMutation.mutate({
                id: selectedUser.id,
                full_name: formData.full_name,
                department: formData.department
            });
        } else {
            // Validate Create Form
            if (!createFormData.email || !createFormData.password || !createFormData.full_name) {
                setToast({ message: 'Complete todos los campos requeridos', type: 'error' });
                return;
            }
            createUserMutation.mutate(createFormData);
        }
    };

    if (isLoading) return <div className="p-8 text-center text-slate-500">Cargando usuarios...</div>;

    // Security Gate
    if (!isAdmin) {
        return (
            <div className="flex flex-col items-center justify-center p-12 text-center text-slate-500 h-[60vh]">
                <Shield className="w-16 h-16 text-slate-300 mb-4" />
                <h2 className="text-xl font-semibold text-slate-700">Acceso Restringido</h2>
                <p>Solo el departamento de Logística puede administrar usuarios.</p>
            </div>
        );
    }

    return (
        <div className="max-w-6xl mx-auto">
            {toast && (
                <Toast
                    message={toast.message}
                    type={toast.type}
                    onClose={() => setToast(null)}
                />
            )}

            <div className="flex justify-between items-center mb-8">
                <div>
                    <h1 className="text-3xl font-bold text-slate-900">Gestión de Usuarios</h1>
                    <p className="text-slate-500 mt-1">Administración de perfiles y accesos del sistema.</p>
                </div>
                <button
                    onClick={handleCreate}
                    className="bg-sky-600 hover:bg-sky-700 text-white px-4 py-2 rounded-lg flex items-center shadow-lg shadow-sky-600/20 font-medium transition-all"
                >
                    <Plus className="w-5 h-5 mr-2" />
                    Crear Usuario
                </button>
            </div>

            <div className="bg-white rounded-xl shadow-sm border border-slate-100 overflow-hidden">
                <table className="w-full text-left">
                    <thead className="bg-slate-50 border-b border-slate-100 text-xs uppercase text-slate-500 font-semibold tracking-wider">
                        <tr>
                            <th className="px-6 py-4">Usuario</th>
                            <th className="px-6 py-4">Departamento</th>
                            <th className="px-6 py-4">Rol / Estado</th>
                            <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-100">
                        {users.map((profile: any) => (
                            <tr key={profile.id} className="hover:bg-slate-50 transition-colors group">
                                <td className="px-6 py-4">
                                    <div className="flex items-center gap-3">
                                        <div className="w-10 h-10 rounded-full bg-slate-100 flex items-center justify-center text-slate-500">
                                            <UserIcon className="w-5 h-5" />
                                        </div>
                                        <div>
                                            <div className="font-medium text-slate-900">{profile.full_name || 'Sin Nombre'}</div>
                                            <div className="text-sm text-slate-500">{profile.email}</div>
                                        </div>
                                    </div>
                                </td>
                                <td className="px-6 py-4">
                                    {profile.department ? (
                                        <span className={`px-2 py-1 rounded-full text-xs font-semibold ${profile.department === 'LOGISTICA'
                                            ? 'bg-purple-100 text-purple-700'
                                            : 'bg-slate-100 text-slate-600'
                                            }`}>
                                            {profile.department}
                                        </span>
                                    ) : (
                                        <span className="text-slate-400 text-sm italic">Sin asignar</span>
                                    )}
                                </td>
                                <td className="px-6 py-4">
                                    <span className="inline-flex items-center gap-1.5 px-2 py-1 rounded-full bg-emerald-50 text-emerald-700 text-xs font-medium border border-emerald-100">
                                        <CheckCircle2 className="w-3 h-3" />
                                        Activo
                                    </span>
                                </td>
                                <td className="px-6 py-4 text-right">
                                    <button
                                        onClick={() => handleEdit(profile)}
                                        className="p-2 text-slate-400 hover:text-sky-600 hover:bg-sky-50 rounded-lg transition-colors"
                                        title="Editar Usuario"
                                    >
                                        <Edit2 className="w-4 h-4" />
                                    </button>
                                </td>
                            </tr>
                        ))}
                    </tbody>
                </table>
            </div>

            {/* Modal */}
            {isModalOpen && (
                <div className="fixed inset-0 bg-slate-900/50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-xl shadow-xl w-full max-w-md p-6 animate-in fade-in zoom-in duration-200">
                        <h2 className="text-xl font-bold text-slate-900 mb-6">
                            {modalMode === 'create' ? 'Crear Nuevo Usuario' : 'Editar Usuario'}
                        </h2>

                        <div className="space-y-4">
                            {/* Create Fields */}
                            {modalMode === 'create' && (
                                <>
                                    <Input
                                        label="Email"
                                        type="email"
                                        value={createFormData.email}
                                        onChange={(e) => setCreateFormData(prev => ({ ...prev, email: e.target.value }))}
                                        placeholder="usuario@ejemplo.com"
                                    />
                                    <Input
                                        label="Contraseña Temporal"
                                        type="password"
                                        value={createFormData.password}
                                        onChange={(e) => setCreateFormData(prev => ({ ...prev, password: e.target.value }))}
                                        placeholder="Mínimo 6 caracteres"
                                    />
                                </>
                            )}

                            {/* Edit Read-Only Field */}
                            {modalMode === 'edit' && (
                                <div>
                                    <label className="block text-sm font-medium text-slate-700 mb-1">Email</label>
                                    <input
                                        type="text"
                                        value={formData.email}
                                        disabled
                                        className="w-full bg-slate-50 border border-slate-200 rounded-lg px-3 py-2 text-slate-500 text-sm cursor-not-allowed"
                                    />
                                </div>
                            )}

                            <Input
                                label="Nombre Completo"
                                value={modalMode === 'create' ? createFormData.full_name : formData.full_name}
                                onChange={(e) => modalMode === 'create'
                                    ? setCreateFormData(prev => ({ ...prev, full_name: e.target.value }))
                                    : setFormData(prev => ({ ...prev, full_name: e.target.value }))
                                }
                                placeholder="Ej. Juan Perez"
                            />

                            <div>
                                <label className="block text-sm font-medium text-slate-700 mb-1">Departamento</label>
                                <select
                                    value={modalMode === 'create' ? createFormData.department : formData.department}
                                    onChange={(e) => modalMode === 'create'
                                        ? setCreateFormData(prev => ({ ...prev, department: e.target.value }))
                                        : setFormData(prev => ({ ...prev, department: e.target.value }))
                                    }
                                    className="w-full rounded-lg border-slate-200 shadow-sm focus:border-sky-500 focus:ring-sky-500 text-sm h-[42px]"
                                >
                                    <option value="">-- Seleccionar --</option>
                                    <option value="LOGISTICA">Logística (Admin)</option>
                                    <option value="MANTENIMIENTO">Mantenimiento</option>
                                    <option value="CONTABILIDAD">Contabilidad</option>
                                    <option value="OFICINA_NACIONAL">Oficina Nacional</option>
                                    <option value="COMUNICACIONES_SISTEMAS">Comunicaciones y Sistemas</option>
                                </select>
                                <p className="text-xs text-slate-500 mt-1">
                                    Nota: Asignar "LOGISTICA" otorga permisos de administrador.
                                </p>
                            </div>
                        </div>

                        <div className="flex justify-end gap-3 mt-8">
                            <button
                                onClick={() => setIsModalOpen(false)}
                                className="px-4 py-2 text-slate-600 hover:bg-slate-50 rounded-lg text-sm font-medium"
                            >
                                Cancelar
                            </button>
                            <button
                                onClick={handleSave}
                                disabled={updateMutation.isPending || createUserMutation.isPending}
                                className="px-4 py-2 bg-sky-600 hover:bg-sky-700 text-white rounded-lg text-sm font-medium flex items-center disabled:opacity-50"
                            >
                                {(updateMutation.isPending || createUserMutation.isPending) && <Loader2 className="w-4 h-4 mr-2 animate-spin" />}
                                {modalMode === 'create' ? 'Crear Usuario' : 'Guardar Cambios'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
