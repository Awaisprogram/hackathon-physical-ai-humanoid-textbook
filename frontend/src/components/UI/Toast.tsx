import React from 'react';
import { Toaster, toast as hotToast, ToastOptions } from 'react-hot-toast';
import './Toast.css';

// Define toast types
type ToastType = 'success' | 'error' | 'info' | 'warning';

interface ToastProps {
  message: string;
  type?: ToastType;
  duration?: number;
}

// Custom toast component
const CustomToast: React.FC<ToastProps> = ({ message, type = 'info', duration = 4000 }) => {
  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return {
          background: '#10b981', // green-500
          borderLeft: '4px solid #059669' // green-600
        };
      case 'error':
        return {
          background: '#ef4444', // red-500
          borderLeft: '4px solid #dc2626' // red-600
        };
      case 'warning':
        return {
          background: '#f59e0b', // amber-500
          borderLeft: '4px solid #d97706' // amber-600
        };
      case 'info':
      default:
        return {
          background: '#3b82f6', // blue-500
          borderLeft: '4px solid #2563eb' // blue-600
        };
    }
  };

  const showToast = () => {
    switch (type) {
      case 'success':
        hotToast.success(message, { duration });
        break;
      case 'error':
        hotToast.error(message, { duration });
        break;
      case 'warning':
        hotToast(message, { duration, icon: '⚠️' });
        break;
      case 'info':
      default:
        hotToast(message, { duration, icon: 'ℹ️' });
        break;
    }
  };

  return (
    <div className="auth-toast" style={getToastStyle()}>
      <div className="auth-toast-content">
        <span className="auth-toast-message">{message}</span>
      </div>
    </div>
  );
};

// Toast utility functions
const toast = {
  success: (message: string, options?: ToastOptions) => hotToast.success(message, options),
  error: (message: string, options?: ToastOptions) => hotToast.error(message, options),
  info: (message: string, options?: ToastOptions) => hotToast(message, options),
  warning: (message: string, options?: ToastOptions) => hotToast(message, { ...options, icon: '⚠️' }),
  promise: <T>(
    promise: Promise<T>,
    messages: {
      loading: string;
      success: string | ((result: T) => string);
      error: string | ((error: any) => string);
    },
    options?: ToastOptions
  ) => hotToast.promise(promise, messages, options)
};

export { toast, CustomToast as Toast };
export default CustomToast;