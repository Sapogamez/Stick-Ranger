import React from 'react';

interface ToggleProps {
  checked: boolean;
  onChange: (checked: boolean) => void;
  label?: string;
}

const Toggle: React.FC<ToggleProps> = ({ checked, onChange, label }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(event.target.checked);
  };

  return (
    <label className="toggle">
      {label && <span>{label}</span>}
      <input type="checkbox" checked={checked} onChange={handleChange} />
    </label>
  );
};

export default Toggle;
