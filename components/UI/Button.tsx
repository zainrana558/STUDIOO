"use client";

import { Theme } from '../../lib/themes';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  theme: Theme;
  size?: 'sm' | 'md' | 'lg';
}

/**
 * A simple theme-aware button component.
 */
export const Button = ({ theme, size = 'md', className = '', children, ...props }: ButtonProps) => {
  const sizeClasses = {
    sm: 'px-3 py-1.5 text-sm',
    md: 'px-5 py-2.5 text-base',
    lg: 'px-7 py-3.5 text-lg',
  };

  return (
    <button
      className={`
        ${sizeClasses[size]}
        font-bold rounded-lg transition-all duration-300
        hover:scale-105 active:scale-95
        ${className}
      `}
      style={{
        backgroundColor: theme.colors.primary,
        color: theme.colors.secondary,
      }}
      {...props}
    >
      {children}
    </button>
  );
};