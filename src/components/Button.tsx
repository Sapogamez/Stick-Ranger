import React from 'react';

interface ButtonProps {
  onClick: () => void;
  disabled?: boolean;
  loading?: boolean;
  children: React.ReactNode;
}

const Button: React.FC<ButtonProps> = ({ onClick, disabled, loading, children }) => {
  return (
    <button onClick={onClick} disabled={disabled || loading} className="button">
      {loading ? 'Loading...' : children}
    </button>
  );
};

export default Button;
