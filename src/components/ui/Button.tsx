import React from 'react';

export interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  icon?: React.ReactNode;
}

export const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  icon,
  className = '',
  disabled,
  ...props
}) => {
  const baseStyles =
    'inline-flex items-center justify-center font-medium transition-colors duration-150 focus:outline-none focus:ring-2 focus:ring-offset-1 disabled:opacity-50 disabled:cursor-not-allowed select-none rounded';

  const sizeStyles = {
    sm: 'text-xs px-2.5 py-1.5 gap-1.5',
    md: 'text-sm px-4 py-2 gap-2',
    lg: 'text-base px-5 py-2.5 gap-2.5',
  };

  // Palette:
  // Bleu nuit : #0A1D3D | Bleu principal : #1446A0 | Bleu secondaire : #1E88E5 | Fond : #F5F7FB
  const variantStyles = {
    primary:
      'bg-[#1446A0] text-white hover:bg-[#0A1D3D] focus:ring-[#1E88E5] border border-transparent shadow-xs',
    secondary:
      'bg-[#1E88E5] text-white hover:bg-[#1446A0] focus:ring-[#00C2FF] border border-transparent',
    outline:
      'bg-white text-[#182230] hover:bg-[#F5F7FB] border border-[#CBD5E1] focus:ring-[#1446A0]',
    ghost:
      'bg-transparent text-[#182230] hover:bg-[#F5F7FB] hover:text-[#1446A0] border border-transparent',
    danger:
      'bg-[#DC2626] text-white hover:bg-[#B91C1C] focus:ring-[#EF4444] border border-transparent',
  };

  return (
    <button
      className={`${baseStyles} ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
      disabled={disabled}
      {...props}
    >
      {icon && <span className="shrink-0">{icon}</span>}
      {children}
    </button>
  );
};
