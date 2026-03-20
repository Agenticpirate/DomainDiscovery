import React from 'react';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'tertiary' | 'success' | 'error' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  fullWidth?: boolean;
}

export const Button: React.FC<ButtonProps> = ({ 
  children, 
  variant = 'primary', 
  size = 'md', 
  isLoading, 
  fullWidth,
  className, 
  disabled,
  ...props 
}) => {
  const baseStyles = "inline-flex items-center justify-center font-semibold rounded-lg transition-all duration-150 active:scale-[0.98] disabled:opacity-50 disabled:cursor-not-allowed focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2";
  
  const variants = {
    primary: "bg-[var(--btn-primary-bg)] text-[var(--btn-primary-text)] hover:opacity-90 active:opacity-80 shadow-sm focus-visible:ring-[var(--input-ring)] focus-visible:ring-offset-[var(--bg-main)]",
    secondary: "bg-[var(--btn-secondary-bg)] text-[var(--btn-secondary-text)] border border-[var(--btn-secondary-border)] hover:bg-[var(--btn-secondary-hover-bg)] focus-visible:ring-[var(--input-ring)] focus-visible:ring-offset-[var(--bg-main)]",
    tertiary: "bg-transparent hover:bg-[var(--card-bg-hover)] focus-visible:ring-[var(--input-ring)] focus-visible:ring-offset-[var(--bg-main)]",
    success: "bg-emerald-500 text-white hover:bg-emerald-600 active:bg-emerald-700 shadow-sm focus-visible:ring-emerald-500/30 focus-visible:ring-offset-[var(--bg-main)]",
    error: "bg-red-500 text-white hover:bg-red-600 active:bg-red-700 shadow-sm focus-visible:ring-red-500/30 focus-visible:ring-offset-[var(--bg-main)]",
    outline: "border border-[var(--card-border)] hover:bg-[var(--card-bg)] hover:border-[var(--card-border-hover)] focus-visible:ring-[var(--input-ring)] focus-visible:ring-offset-[var(--bg-main)]",
    ghost: "hover:bg-[var(--card-bg-hover)] focus-visible:ring-[var(--input-ring)] focus-visible:ring-offset-[var(--bg-main)]",
  };
  
  const sizes = {
    sm: "px-3 py-1.5 text-xs",
    md: "px-6 py-2 text-sm",
    lg: "px-8 py-2.5 text-base",
  };

  return (
    <button 
      type="button"
      className={cn(
        baseStyles, 
        variants[variant], 
        sizes[size], 
        fullWidth && "w-full",
        className
      )}
      disabled={isLoading || disabled}
      {...props}
    >
      {isLoading && (
        <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-current" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
        </svg>
      )}
      {children}
    </button>
  );
};
