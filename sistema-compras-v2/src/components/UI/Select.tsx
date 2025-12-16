
import React from 'react';

interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
    label: string;
    options: { value: string | number; label: string }[];
    error?: string;
}

export const Select = React.forwardRef<HTMLSelectElement, SelectProps>(
    ({ label, options, error, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    {label}
                </label>
                <select
                    ref={ref}
                    className={`
            w-full px-4 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all appearance-none
            ${error ? 'border-red-300 focus:ring-red-200' : 'border-slate-300'}
            ${className}
          `}
                    {...props}
                >
                    <option value="">Seleccione una opción</option>
                    {options.map((opt) => (
                        <option key={opt.value} value={opt.value}>
                            {opt.label}
                        </option>
                    ))}
                </select>
                {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
            </div>
        );
    }
);
