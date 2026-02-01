import { useState, useRef, useEffect } from 'react';
import './ColorPicker.less';

interface ColorPickerProps {
  value?: string;
  onChange?: (color: string) => void;
  className?: string;
}

export function ColorPicker({ value = '#6366f1', onChange, className = '' }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [color, setColor] = useState(value);
  const pickerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setColor(value);
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (pickerRef.current && !pickerRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  const handleColorChange = (newColor: string) => {
    setColor(newColor);
    onChange?.(newColor);
    setIsOpen(false);
  };

  return (
    <div ref={pickerRef} className={`apple-color-picker-wrapper ${className}`}>
      <button
        type="button"
        className="apple-color-picker-trigger"
        onClick={() => setIsOpen(!isOpen)}
        style={{ backgroundColor: color }}
      />
      {isOpen && (
        <div className="apple-color-picker-dropdown">
          <input
            type="color"
            value={color}
            onChange={(e) => handleColorChange(e.target.value)}
            className="apple-color-picker-input"
          />
        </div>
      )}
    </div>
  );
}

