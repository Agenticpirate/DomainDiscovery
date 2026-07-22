import React, { forwardRef, useId } from 'react';
import { cn } from '@/lib/utils';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: string;
  helperText?: string;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  fullWidth?: boolean;
}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  (
    {
      label,
      error,
      success,
      helperText,
      leftIcon,
      rightIcon,
      fullWidth,
      className,
      id,
      disabled,
      ...props
    },
    ref
  ) => {
    const generatedId = useId();
    const inputId = id || generatedId;
    const hasError = !!error;
    const hasSuccess = !!success;

    // Smooth border-only focus — avoid transition-all (it flashes ring/shadow)
    const baseStyles =
      'w-full rounded-xl px-3 py-2.5 text-sm sm:px-3.5 sm:py-2.5 border bg-[var(--input-bg)] text-[var(--text-primary)] placeholder:text-[var(--input-placeholder)] outline-none focus:outline-none focus-visible:outline-none ring-0 focus:ring-0 focus-visible:ring-0 shadow-none transition-[border-color,background-color] duration-200 ease-out disabled:opacity-50 disabled:cursor-not-allowed';

    const stateStyles = hasError
      ? 'border-red-500/50 focus:border-red-400/80'
      : hasSuccess
      ? 'border-emerald-500/50 focus:border-emerald-400/80'
      : 'border-[var(--input-border)] focus:border-[var(--input-border-focus)]';

    const paddingStyles = leftIcon
      ? 'pl-10 sm:pl-11'
      : rightIcon
      ? 'pr-9 sm:pr-10'
      : '';

    return (
      <div className={cn('space-y-1.5', fullWidth && 'w-full')}>
        {label && (
          <label
            htmlFor={inputId}
            className="block text-sm font-medium"
            style={{ color: 'var(--text-secondary)' }}
          >
            {label}
          </label>
        )}
        <div className="relative">
          {leftIcon && (
            <div className="absolute left-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              {leftIcon}
            </div>
          )}
          <input
            ref={ref}
            id={inputId}
            className={cn(baseStyles, stateStyles, paddingStyles, className)}
            disabled={disabled}
            aria-invalid={hasError}
            aria-describedby={
              error
                ? `${inputId}-error`
                : success
                ? `${inputId}-success`
                : helperText
                ? `${inputId}-helper`
                : undefined
            }
            {...props}
          />
          {rightIcon && (
            <div className="absolute right-3 top-1/2 -translate-y-1/2" style={{ color: 'var(--text-muted)' }}>
              {rightIcon}
            </div>
          )}
        </div>
        {error && (
          <p
            id={`${inputId}-error`}
            className="text-xs text-red-400"
            role="alert"
          >
            {error}
          </p>
        )}
        {success && !error && (
          <p
            id={`${inputId}-success`}
            className="text-xs text-emerald-400"
          >
            {success}
          </p>
        )}
        {helperText && !error && !success && (
          <p
            id={`${inputId}-helper`}
            className="text-xs"
            style={{ color: 'var(--text-muted)' }}
          >
            {helperText}
          </p>
        )}
      </div>
    );
  }
);

Input.displayName = 'Input';
