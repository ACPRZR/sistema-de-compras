import React, { forwardRef } from 'react';
import { clsx } from 'clsx';
import { ChevronDownIcon } from '@heroicons/react/24/outline';

const Select = forwardRef(({ 
  label, 
  error, 
  helperText, 
  options = [],
  placeholder = 'Seleccione una opción',
  className = '',
  onChange,
  ...props 
}, ref) => {
  return (
    <div className="space-y-1">
      {label && (
        <label className="block text-sm font-medium text-gray-700">
          {label}
          {props.required && <span className="text-danger-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        <select
          ref={ref}
          className={clsx(
            'block w-full px-3 py-2 pr-10 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0 appearance-none bg-white',
            error 
              ? 'border-danger-300 text-danger-900 focus:ring-danger-500 focus:border-danger-500' 
              : 'border-secondary-300 text-gray-900 focus:ring-primary-500 focus:border-primary-500',
            className
          )}
          onChange={(e) => {
            console.log('Select onChange event:', e);
            if (onChange) {
              if (e && e.target && e.target.value !== undefined) {
                onChange(e.target.value);
              } else if (typeof e === 'string') {
                // Si el evento es directamente un string (valor)
                onChange(e);
              } else {
                console.warn('Select onChange: Invalid event structure', e);
              }
            }
          }}
          {...props}
        >
          {placeholder && (
            <option value="" disabled>
              {placeholder}
            </option>
          )}
          {options.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
        
        <div className="absolute inset-y-0 right-0 pr-3 flex items-center pointer-events-none">
          <ChevronDownIcon className="h-4 w-4 text-secondary-400" />
        </div>
      </div>
      
      {error && (
        <p className="text-sm text-danger-600">{error}</p>
      )}
      
      {helperText && !error && (
        <p className="text-sm text-secondary-500">{helperText}</p>
      )}
    </div>
  );
});

Select.displayName = 'Select';

export default Select;
