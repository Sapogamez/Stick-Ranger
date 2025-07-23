import React from 'react';

interface SliderProps {
  value: number;
  onChange: (value: number) => void;
  min: number;
  max: number;
  step?: number;
}

const Slider: React.FC<SliderProps> = ({ value, onChange, min, max, step = 1 }) => {
  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    onChange(Number(event.target.value));
  };

  return (
    <input
      type="range"
      value={value}
      onChange={handleChange}
      min={min}
      max={max}
      step={step}
      className="slider"
      title={`Slider from ${min} to ${max}`}
    />
  );
};

export default Slider;
