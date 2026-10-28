import React from 'react';

export interface BadgeProps {
  children: React.ReactNode;
  variant?: 'neutral' | 'info' | 'success' | 'warning' | 'danger';
  size?: 'sm' | 'md';
  dot?: boolean;
  className?: string;
}

export const Badge: React.FC<BadgeProps> = ({
  children,
  variant = 'neutral',
  size = 'md',
  dot = false,
  className = '',
}) => {
  const sizeStyles = {
    sm: 'text-[11px] px-2 py-0.5 font-medium',
    md: 'text-xs px-2.5 py-1 font-medium',
  };

  const variantStyles = {
    neutral: 'bg-[#F1F5F9] text-[#475467] border border-[#E2E8F0]',
    info: 'bg-[#EFF8FF] text-[#1446A0] border border-[#B2DDFF]',
    success: 'bg-[#ECFDF3] text-[#027A48] border border-[#A6F4C5]',
    warning: 'bg-[#FFFAEB] text-[#B54708] border border-[#FEDF89]',
    danger: 'bg-[#FEF3F2] text-[#B42318] border border-[#FECDCA]',
  };

  const dotColors = {
    neutral: 'bg-[#98A2B3]',
    info: 'bg-[#1E88E5]',
    success: 'bg-[#12B76A]',
    warning: 'bg-[#F79009]',
    danger: 'bg-[#F04438]',
  };

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded ${sizeStyles[size]} ${variantStyles[variant]} ${className}`}
    >
      {dot && <span className={`w-1.5 h-1.5 rounded-full shrink-0 ${dotColors[variant]}`} />}
      {children}
    </span>
  );
};
