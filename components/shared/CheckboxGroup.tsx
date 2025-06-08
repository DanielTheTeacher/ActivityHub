
import React from 'react';

interface CheckboxGroupProps {
  label: string;
  name: string;
  options: string[];
  selectedOptions: string[];
  onChange: (selected: string[]) => void;
}

const CheckboxGroup: React.FC<CheckboxGroupProps> = ({
  label,
  name,
  options,
  selectedOptions,
  onChange,
}) => {
  const handleCheckboxChange = (option: string) => {
    const newSelectedOptions = selectedOptions.includes(option)
      ? selectedOptions.filter(item => item !== option)
      : [...selectedOptions, option];
    onChange(newSelectedOptions);
  };

  if (!options || options.length === 0) { 
    return null;
  }

  return (
    <div>
      <label className="block text-sm font-medium text-brandTextSecondary mb-2">{label}</label>
      <div className="space-y-1 max-h-48 overflow-y-auto pr-2 scrollbar-thin scrollbar-thumb-brandPrimary-400 scrollbar-track-brandNeutral-100">
        {options.map(option => (
          <label key={option} className="flex items-center space-x-2 text-sm text-brandTextPrimary hover:bg-brandPrimary-50 p-1 rounded transition-colors duration-150">
            <input
              type="checkbox"
              name={name}
              value={option}
              checked={selectedOptions.includes(option)}
              onChange={() => handleCheckboxChange(option)}
              className="rounded border-brandNeutral-300 text-brandPrimary-600 bg-brandNeutral-50 shadow-sm focus:border-brandPrimary-500 focus:ring focus:ring-brandPrimary-500 focus:ring-opacity-50"
            />
            <span>{option}</span>
          </label>
        ))}
      </div>
    </div>
  );
};

export default CheckboxGroup;