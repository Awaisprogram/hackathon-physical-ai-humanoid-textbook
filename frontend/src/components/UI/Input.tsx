import React, { useState, useRef, useEffect } from 'react';
import './Input.css';

interface InputProps extends React.InputHTMLAttributes<HTMLInputElement> {
  label?: string;
  error?: string;
  success?: boolean;
  helperText?: string;
  floatingLabel?: boolean;
  validateOnBlur?: boolean;
  validationFn?: (value: string) => boolean | string;
  onValidationChange?: (isValid: boolean, message?: string) => void;
}

const Input: React.FC<InputProps> = ({
  label,
  error,
  success,
  helperText,
  floatingLabel = true,
  validateOnBlur = true,
  validationFn,
  onValidationChange,
  className,
  onFocus,
  onBlur,
  ...props
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [isValid, setIsValid] = useState<boolean | null>(null);
  const [validationMessage, setValidationMessage] = useState<string>('');
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>) => {
    setIsFocused(false);

    if (validateOnBlur && validationFn) {
      const result = validationFn(e.target.value);
      const isValidResult = typeof result === 'boolean' ? result : !!result;
      const message = typeof result === 'string' ? result : '';

      setIsValid(isValidResult);
      setValidationMessage(message);

      if (onValidationChange) {
        onValidationChange(isValidResult, message);
      }
    }

    onBlur?.(e);
  };

  // Determine if the label should float (when focused, has value, or has an error)
  const shouldFloatLabel = isFocused || !!props.value || !!props.defaultValue || !!error;

  // Determine the validation state
  const hasError = !!error || (isValid === false);
  const isSuccess = success || (isValid === true && !hasError);

  const classes = [
    'auth-input-container',
    className,
    hasError ? 'auth-input-error' : '',
    isSuccess ? 'auth-input-success' : '',
    isFocused ? 'auth-input-focused' : ''
  ].filter(Boolean).join(' ');

  return (
    <div className={classes}>
      <div className="auth-input-wrapper">
        {floatingLabel && label && (
          <label
            htmlFor={props.id}
            className={`auth-input-label ${shouldFloatLabel ? 'auth-input-label-float' : ''}`}
          >
            {label}
          </label>
        )}

        {!floatingLabel && label && (
          <label htmlFor={props.id} className="auth-input-label-static">
            {label}
          </label>
        )}

        <input
          {...props}
          ref={inputRef}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={`auth-input ${props.className || ''}`}
        />

        {/* Error/Success indicator */}
        <div className="auth-input-indicators">
          {hasError && <span className="auth-input-error-icon">✗</span>}
          {isSuccess && <span className="auth-input-success-icon">✓</span>}
        </div>
      </div>

      {(helperText || error || validationMessage) && (
        <div className={`auth-input-helper ${hasError ? 'auth-input-helper-error' : ''}`}>
          {error || validationMessage || helperText}
        </div>
      )}
    </div>
  );
};

export default Input;