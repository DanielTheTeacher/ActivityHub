
import React from 'react';

interface DropdownProps {
  label: string;
  name: string;
  value: string;
  options: string[];
  onChange: (e: React.ChangeEvent<HTMLSelectElement>) => void;
  disabled?: boolean;
  emptyOptionLabel?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  label,
  name,
  value,
  options,
  onChange,
  disabled = false,
  emptyOptionLabel = "Select an option"
}) => {
  return (
    <div>
      <label htmlFor={name} className="block text-sm font-medium text-brandTextSecondary mb-1">
        {label}
      </label>
      <select
        id={name}
        name={name}
        value={value}
        onChange={onChange}
        disabled={disabled}
        className="w-full p-2 bg-brandNeutral-50 text-brandTextPrimary border border-brandNeutral-300 rounded-md shadow-sm focus:ring-brandPrimary-500 focus:border-brandPrimary-500 disabled:bg-brandNeutral-100 disabled:text-brandNeutral-500 disabled:cursor-not-allowed"
      >
        <option value="" className="text-brandNeutral-400">{emptyOptionLabel}</option>
        {options.map(option => (
          <option key={option} value={option} className="text-brandTextPrimary bg-white">
            {option}
          </option>
        ))}
      </select>
    </div>
  );
};

export default Dropdown;