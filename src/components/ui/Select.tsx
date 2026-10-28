import React from 'react';

export interface SelectOption {
  value: string;
  label: string;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  label?: string;
  error?: string;
  helperText?: string;
  options: SelectOption[];
  required?: boolean;
}

export const Select: React.FC<SelectProps> = ({
  label,
  error,
  helperText,
  options,
  required,
  className = '',
  id,
  ...props
}) => {
  const selectId = id || (label ? label.toLowerCase().replace(/\s+/g, '-') : undefined);

  return (
    <div className="w-full">
      {label && (
        <label htmlFor={selectId} className="block text-xs font-semibold text-[#182230] mb-1.5">
          {label}
          {required && <span className="text-[#DC2626] ml-1">*</span>}
        </label>
      )}
      <select
        id={selectId}
        className={`w-full px-3 py-2 text-sm bg-white text-[#182230] border rounded transition-colors focus:outline-none focus:ring-2 focus:ring-offset-1 ${
          error
            ? 'border-[#FDA29B] focus:border-[#F04438] focus:ring-[#FDA29B]'
            : 'border-[#CBD5E1] hover:border-[#94A3B8] focus:border-[#1446A0] focus:ring-[#B2DDFF]'
        } ${className}`}
        {...props}
      >
        {options.map((option) => (
          <option key={option.value} value={option.value}>
            {option.label}
          </option>
        ))}
      </select>
      {error && <p className="mt-1 text-xs text-[#DC2626] font-medium">{error}</p>}
      {!error && helperText && <p className="mt-1 text-xs text-[#667085]">{helperText}</p>}
    </div>
  );
};
