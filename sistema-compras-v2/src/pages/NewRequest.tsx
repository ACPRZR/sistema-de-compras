
import { Link } from 'react-router-dom';
import { ShoppingCart, Wrench } from 'lucide-react';

export default function NewRequest() {
    return (
        <div className="max-w-4xl mx-auto h-[80vh] flex flex-col justify-center">
            <div className="text-center mb-10">
                <h1 className="text-4xl font-bold text-slate-900 mb-4">¿Qué deseas solicitar hoy?</h1>
                <p className="text-slate-500 text-lg">Selecciona el tipo de requerimiento para iniciar el proceso.</p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Purchase Option */}
                <Link
                    to="/ordenes/crear?type=purchase"
                    className="group relative bg-white p-10 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-sky-200 transition-all duration-300 text-center"
                >
                    <div className="w-20 h-20 bg-sky-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-sky-500 transition-colors duration-300">
                        <ShoppingCart className="w-10 h-10 text-sky-600 group-hover:text-white transition-colors" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Orden de Compra</h2>
                    <p className="text-slate-500">
                        Adquisición de bienes, materiales, suministros o activos fijos.
                    </p>
                </Link>

                {/* Service Option */}
                <Link
                    to="/ordenes/crear?type=service"
                    className="group relative bg-white p-10 rounded-2xl shadow-sm border border-slate-100 hover:shadow-xl hover:border-indigo-200 transition-all duration-300 text-center"
                >
                    <div className="w-20 h-20 bg-indigo-50 rounded-full flex items-center justify-center mx-auto mb-6 group-hover:bg-indigo-500 transition-colors duration-300">
                        <Wrench className="w-10 h-10 text-indigo-600 group-hover:text-white transition-colors" />
                    </div>
                    <h2 className="text-2xl font-bold text-slate-900 mb-2">Orden de Servicio</h2>
                    <p className="text-slate-500">
                        Contratación de mantenimientos, reparaciones, consultorías o trabajos externos.
                    </p>
                </Link>
            </div>
        </div>
    );
}
