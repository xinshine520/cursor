import { useState, useRef, useEffect, ReactNode, useId, useCallback } from 'react';
import './Select.less';

interface SelectOption {
  value: string;
  label: ReactNode;
  disabled?: boolean;
}

interface SelectProps {
  value?: string;
  defaultValue?: string;
  placeholder?: string;
  options: SelectOption[];
  onChange?: (value: string) => void;
  size?: 'small' | 'medium' | 'large';
  allowClear?: boolean;
  className?: string;
  disabled?: boolean;
  'aria-label'?: string;
}

export function Select({
  value,
  defaultValue,
  placeholder,
  options,
  onChange,
  size = 'medium',
  allowClear,
  className = '',
  disabled,
  'aria-label': ariaLabel,
}: SelectProps) {
  const [isOpen, setIsOpen] = useState(false);
  const [selectedValue, setSelectedValue] = useState(value || defaultValue || '');
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const selectRef = useRef<HTMLDivElement>(null);
  const listboxRef = useRef<HTMLDivElement>(null);
  const optionRefs = useRef<(HTMLDivElement | null)[]>([]);
  const selectId = useId();
  const listboxId = useId();

  const validOptions = options.filter(opt => !opt.disabled);

  useEffect(() => {
    if (value !== undefined) {
      setSelectedValue(value);
    }
  }, [value]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (selectRef.current && !selectRef.current.contains(event.target as Node)) {
        setIsOpen(false);
        setFocusedIndex(-1);
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen]);

  useEffect(() => {
    if (isOpen && listboxRef.current) {
      listboxRef.current.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    if (focusedIndex >= 0 && optionRefs.current[focusedIndex]) {
      optionRefs.current[focusedIndex]?.scrollIntoView({ block: 'nearest' });
    }
  }, [focusedIndex]);

  const selectedOption = options.find(opt => opt.value === selectedValue);
  const displayText = selectedValue && selectedOption ? selectedOption.label : placeholder || '请选择';

  const handleKeyDown = useCallback((e: React.KeyboardEvent) => {
    if (disabled) return;

    if (!isOpen) {
      if (e.key === 'Enter' || e.key === ' ' || e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        e.preventDefault();
        setIsOpen(true);
        if (e.key === 'ArrowUp') {
          setFocusedIndex(validOptions.length - 1);
        } else {
          setFocusedIndex(0);
        }
      }
      return;
    }

    switch (e.key) {
      case 'Escape':
        e.preventDefault();
        setIsOpen(false);
        setFocusedIndex(-1);
        selectRef.current?.focus();
        break;
      case 'ArrowDown':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev < validOptions.length - 1 ? prev + 1 : 0
        );
        break;
      case 'ArrowUp':
        e.preventDefault();
        setFocusedIndex(prev => 
          prev > 0 ? prev - 1 : validOptions.length - 1
        );
        break;
      case 'Enter':
      case ' ':
        e.preventDefault();
        if (focusedIndex >= 0 && validOptions[focusedIndex]) {
          handleSelect(validOptions[focusedIndex].value);
        }
        break;
      case 'Home':
        e.preventDefault();
        setFocusedIndex(0);
        break;
      case 'End':
        e.preventDefault();
        setFocusedIndex(validOptions.length - 1);
        break;
    }
  }, [isOpen, focusedIndex, validOptions, disabled]);

  const handleSelect = useCallback((optionValue: string) => {
    if (options.find(opt => opt.value === optionValue)?.disabled) return;
    
    setSelectedValue(optionValue);
    onChange?.(optionValue);
    setIsOpen(false);
    setFocusedIndex(-1);
  }, [onChange, options]);

  const handleClear = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedValue('');
    onChange?.('');
    setIsOpen(false);
  }, [onChange]);

  const handleToggle = useCallback(() => {
    if (!disabled) {
      setIsOpen(!isOpen);
      setFocusedIndex(-1);
    }
  }, [disabled, isOpen]);

  // Handle empty value for allowClear
  useEffect(() => {
    if (value === '' || value === undefined) {
      setSelectedValue('');
    }
  }, [value]);

  return (
    <div
      ref={selectRef}
      className={`apple-select apple-select-${size} ${isOpen ? 'apple-select-open' : ''} ${disabled ? 'apple-select-disabled' : ''} ${className}`}
      role="combobox"
      aria-expanded={isOpen}
      aria-haspopup="listbox"
      aria-controls={listboxId}
      aria-label={ariaLabel}
      tabIndex={disabled ? -1 : 0}
      onKeyDown={handleKeyDown}
    >
      <div 
        className="apple-select-selector"
        onClick={handleToggle}
        aria-label={ariaLabel || placeholder}
      >
        <span className={`apple-select-selection-item ${!selectedValue ? 'apple-select-placeholder' : ''}`}>
          {displayText}
        </span>
        <span className="apple-select-arrow" aria-hidden="true">
          {allowClear && selectedValue ? (
            <span 
              className="apple-select-clear" 
              onClick={handleClear}
              role="button"
              aria-label="清除选择"
              tabIndex={-1}
            >
              ×
            </span>
          ) : (
            <svg 
              width="12" 
              height="12" 
              viewBox="0 0 12 12" 
              fill="none"
              aria-hidden="true"
            >
              <path d="M2 4L6 8L10 4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"/>
            </svg>
          )}
        </span>
      </div>
      {isOpen && (
        <div 
          ref={listboxRef}
          id={listboxId}
          className="apple-select-dropdown"
          role="listbox"
          aria-label={ariaLabel || placeholder}
          tabIndex={-1}
        >
          {options.map((option, index) => {
            const optionIndex = validOptions.findIndex(opt => opt.value === option.value);
            return (
              <div
                key={option.value}
                ref={el => optionRefs.current[optionIndex] = el}
                className={`apple-select-option ${selectedValue === option.value ? 'apple-select-option-selected' : ''} ${option.disabled ? 'apple-select-option-disabled' : ''} ${focusedIndex === optionIndex ? 'apple-select-option-focused' : ''}`}
                role="option"
                aria-selected={selectedValue === option.value}
                aria-disabled={option.disabled}
                tabIndex={focusedIndex === optionIndex ? 0 : -1}
                onClick={() => !option.disabled && handleSelect(option.value)}
                onMouseEnter={() => !option.disabled && setFocusedIndex(optionIndex)}
              >
                {option.label}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

