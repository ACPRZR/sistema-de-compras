
import React from 'react';

interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
    label: string;
    error?: string;
}

export const Textarea = React.forwardRef<HTMLTextAreaElement, TextareaProps>(
    ({ label, error, className = '', ...props }, ref) => {
        return (
            <div className="w-full">
                <label className="block text-sm font-medium text-slate-700 mb-1">
                    {label}
                </label>
                <textarea
                    ref={ref}
                    className={`
            w-full px-4 py-2 rounded-lg border bg-white focus:ring-2 focus:ring-sky-500 focus:border-transparent transition-all min-h-[100px]
            ${error ? 'border-red-300 focus:ring-red-200' : 'border-slate-300'}
            ${className}
          `}
                    {...props}
                />
                {error && <span className="text-xs text-red-500 mt-1">{error}</span>}
            </div>
        );
    }
);
