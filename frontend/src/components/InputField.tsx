import React from 'react';

interface InputFieldProps {
  label: string;
  name: string;
  type: string;
  value: string;
  onChange: (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => void;
  required?: boolean;
  options?: string[]; // for select dropdowns like role
}

const InputField: React.FC<InputFieldProps> = ({ label, name, type, value, onChange, required = false, options }) => {
  return (
    <div className="form-group">
      <label htmlFor={name}>{label}:</label>
      {type === 'select' && options ? (
        <select name={name} id={name} value={value} onChange={onChange} required={required}>
          {options.map(option => (
            <option key={option} value={option}>{option}</option>
          ))}
        </select>
      ) : (
        <input
          type={type}
          name={name}
          id={name}
          value={value}
          onChange={onChange}
          required={required}
        />
      )}
    </div>
  );
};

export default InputField;
