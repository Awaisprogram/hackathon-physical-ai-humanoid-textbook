import React, { useState, useRef, useEffect } from 'react';
import './Dropdown.css';

interface Option {
  value: string;
  label: string;
}

interface DropdownProps {
  options: Option[];
  value?: string;
  onChange: (value: string) => void;
  placeholder?: string;
  label?: string;
  error?: string;
  searchable?: boolean;
  disabled?: boolean;
  className?: string;
}

const Dropdown: React.FC<DropdownProps> = ({
  options,
  value,
  onChange,
  placeholder = 'Select an option',
  label,
  error,
  searchable = false,
  disabled = false,
  className
}) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  // Filter options if searchable
  const filteredOptions = searchable
    ? options.filter(option =>
        option.label.toLowerCase().includes(searchTerm.toLowerCase()) ||
        option.value.toLowerCase().includes(searchTerm.toLowerCase())
      )
    : options;

  // Get display label for selected value
  const selectedOption = options.find(option => option.value === value);
  const displayValue = selectedOption ? selectedOption.label : placeholder;

  const handleOptionClick = (optionValue: string) => {
    onChange(optionValue);
    setIsOpen(false);
    setSearchTerm('');
  };

  const toggleDropdown = () => {
    if (!disabled) {
      setIsOpen(!isOpen);
    }
  };

  const classes = [
    'auth-dropdown',
    className,
    isOpen ? 'auth-dropdown-open' : '',
    disabled ? 'auth-dropdown-disabled' : '',
    error ? 'auth-dropdown-error' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={classes} ref={dropdownRef}>
      {label && (
        <label className="auth-dropdown-label">
          {label}
        </label>
      )}

      <div className="auth-dropdown-control" onClick={toggleDropdown}>
        <span className="auth-dropdown-value">{displayValue}</span>
        <span className={`auth-dropdown-arrow ${isOpen ? 'auth-dropdown-arrow-up' : ''}`}>▼</span>
      </div>

      {isOpen && (
        <div className="auth-dropdown-menu">
          {searchable && (
            <div className="auth-dropdown-search">
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search..."
                className="auth-dropdown-search-input"
                autoFocus
              />
            </div>
          )}

          <div className="auth-dropdown-options">
            {filteredOptions.length > 0 ? (
              filteredOptions.map((option) => (
                <div
                  key={option.value}
                  className={`auth-dropdown-option ${value === option.value ? 'auth-dropdown-option-selected' : ''}`}
                  onClick={() => handleOptionClick(option.value)}
                >
                  {option.label}
                </div>
              ))
            ) : (
              <div className="auth-dropdown-no-results">
                No results found
              </div>
            )}
          </div>
        </div>
      )}

      {error && (
        <div className="auth-dropdown-error-message">
          {error}
        </div>
      )}
    </div>
  );
};

export default Dropdown;