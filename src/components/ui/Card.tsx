import React from 'react';

export interface CardProps extends React.HTMLAttributes<HTMLDivElement> {
  title?: string;
  subtitle?: string;
  action?: React.ReactNode;
}

export const Card: React.FC<CardProps> = ({
  children,
  title,
  subtitle,
  action,
  className = '',
  ...props
}) => {
  return (
    <div
      className={`bg-white border border-[#E2E8F0] shadow-xs rounded-md ${className}`}
      {...props}
    >
      {(title || action) && (
        <div className="px-5 py-4 border-b border-[#E2E8F0] flex items-center justify-between gap-4">
          <div>
            {title && <h3 className="text-base font-semibold text-[#182230]">{title}</h3>}
            {subtitle && <p className="text-xs text-[#667085] mt-0.5">{subtitle}</p>}
          </div>
          {action && <div className="shrink-0">{action}</div>}
        </div>
      )}
      <div className="p-5">{children}</div>
    </div>
  );
};
