import React, { ButtonHTMLAttributes } from 'react';
import './Button.css';

type ButtonVariant = 'primary' | 'secondary' | 'ghost' | 'outline';
type ButtonSize = 'sm' | 'md' | 'lg';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: ButtonVariant;
  size?: ButtonSize;
  loading?: boolean;
  fullWidth?: boolean;
  icon?: React.ReactNode;
  iconPosition?: 'left' | 'right';
}

const Button: React.FC<ButtonProps> = ({
  children,
  variant = 'primary',
  size = 'md',
  loading = false,
  fullWidth = false,
  icon,
  iconPosition = 'left',
  className,
  disabled,
  ...props
}) => {
  const classes = [
    'auth-button',
    `auth-button--${variant}`,
    `auth-button--${size}`,
    fullWidth ? 'auth-button--full-width' : '',
    loading ? 'auth-button--loading' : '',
    disabled || loading ? 'auth-button--disabled' : '',
    className
  ].filter(Boolean).join(' ');

  const handleClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    if (loading || disabled) {
      e.preventDefault();
      return;
    }
    props.onClick?.(e);
  };

  return (
    <button
      {...props}
      className={classes}
      onClick={handleClick}
      disabled={disabled || loading}
    >
      <span className="auth-button__content">
        {icon && iconPosition === 'left' && (
          <span className="auth-button__icon auth-button__icon--left">
            {loading ? <span className="auth-button__spinner"></span> : icon}
          </span>
        )}

        {loading ? (
          <>
            <span className="auth-button__spinner"></span>
            <span>Loading...</span>
          </>
        ) : (
          <>
            {icon && iconPosition === 'left' && !loading && (
              <span className="auth-button__icon auth-button__icon--left">{icon}</span>
            )}
            <span className="auth-button__text">{children}</span>
            {icon && iconPosition === 'right' && (
              <span className="auth-button__icon auth-button__icon--right">{icon}</span>
            )}
          </>
        )}
      </span>
    </button>
  );
};

export default Button;