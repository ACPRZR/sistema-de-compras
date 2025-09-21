import React, { forwardRef } from 'react';
import { clsx } from 'clsx';

const Input = forwardRef(({ 
  label, 
  error, 
  helperText, 
  leftIcon: LeftIcon, 
  rightIcon: RightIcon,
  className = '',
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
        {LeftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <LeftIcon className="h-4 w-4 text-secondary-400" />
          </div>
        )}
        
        <input
          ref={ref}
          className={clsx(
            'block w-full px-3 py-2 text-sm border rounded-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-0',
            LeftIcon ? 'pl-10' : '',
            RightIcon ? 'pr-10' : '',
            error 
              ? 'border-danger-300 text-danger-900 placeholder-danger-300 focus:ring-danger-500 focus:border-danger-500' 
              : 'border-secondary-300 text-gray-900 placeholder-secondary-400 focus:ring-primary-500 focus:border-primary-500',
            className
          )}
          {...props}
        />
        
        {RightIcon && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            <RightIcon className="h-4 w-4 text-secondary-400" />
          </div>
        )}
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

Input.displayName = 'Input';

export default Input;
