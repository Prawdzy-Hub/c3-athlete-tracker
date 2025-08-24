'use client'
import React, { forwardRef } from 'react';
import { Eye, EyeOff, AlertCircle } from 'lucide-react';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  showPasswordToggle?: boolean;
  fullWidth?: boolean;
}

const Input = forwardRef<HTMLInputElement, InputProps>(({
  label,
  error,
  helperText,
  leftIcon,
  rightIcon,
  showPasswordToggle = false,
  fullWidth = true,
  className = '',
  type = 'text',
  id,
  ...props
}, ref) => {
  const [showPassword, setShowPassword] = React.useState(false);
  const [inputType, setInputType] = React.useState(type);

  React.useEffect(() => {
    if (showPasswordToggle && type === 'password') {
      setInputType(showPassword ? 'text' : 'password');
    }
  }, [showPassword, showPasswordToggle, type]);

  const baseClasses = 'px-3 py-2 border rounded-lg focus:outline-none focus:ring-2 transition-colors';
  const fullWidthClass = fullWidth ? 'w-full' : '';
  
  const stateClasses = error
    ? 'border-red-300 focus:border-red-500 focus:ring-red-500/20'
    : 'border-gray-300 focus:border-blue-500 focus:ring-blue-500/20';

  const inputClasses = `
    ${baseClasses}
    ${stateClasses}
    ${fullWidthClass}
    ${leftIcon ? 'pl-10' : ''}
    ${rightIcon || showPasswordToggle ? 'pr-10' : ''}
    ${props.disabled ? 'bg-gray-50 text-gray-500 cursor-not-allowed' : 'bg-white'}
    ${className}
  `.trim().replace(/\s+/g, ' ');

  const inputId = id || `input-${Math.random().toString(36).substr(2, 9)}`;

  return (
    <div className={fullWidth ? 'w-full' : ''}>
      {label && (
        <label 
          htmlFor={inputId}
          className="block text-sm font-medium text-gray-700 mb-2"
        >
          {label}
          {props.required && <span className="text-red-500 ml-1">*</span>}
        </label>
      )}
      
      <div className="relative">
        {leftIcon && (
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
            <span className="text-gray-400 w-4 h-4">{leftIcon}</span>
          </div>
        )}
        
        <input
          ref={ref}
          id={inputId}
          type={inputType}
          className={inputClasses}
          {...props}
        />
        
        {(rightIcon || showPasswordToggle) && (
          <div className="absolute inset-y-0 right-0 pr-3 flex items-center">
            {showPasswordToggle && type === 'password' ? (
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="text-gray-400 hover:text-gray-600 focus:outline-none"
              >
                {showPassword ? (
                  <EyeOff className="w-4 h-4" />
                ) : (
                  <Eye className="w-4 h-4" />
                )}
              </button>
            ) : (
              rightIcon && <span className="text-gray-400 w-4 h-4">{rightIcon}</span>
            )}
          </div>
        )}
      </div>
      
      {error && (
        <div className="mt-1 flex items-center space-x-1">
          <AlertCircle className="w-4 h-4 text-red-500" />
          <p className="text-red-600 text-sm">{error}</p>
        </div>
      )}
      
      {helperText && !error && (
        <p className="mt-1 text-gray-500 text-sm">{helperText}</p>
      )}
    </div>
  );
});

Input.displayName = 'Input';

export default Input;