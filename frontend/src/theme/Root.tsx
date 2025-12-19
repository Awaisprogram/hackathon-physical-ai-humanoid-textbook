import React from 'react';
import { AuthProvider } from '../contexts/AuthContext';
import { Toaster } from 'react-hot-toast';

interface RootProps {
  children: React.ReactNode;
}

const Root: React.FC<RootProps> = ({ children }) => {
  return (
    <AuthProvider>
      {children}
      <Toaster
        position="top-right"
        toastOptions={{
          style: {
            background: '#1f2937', // gray-800
            color: '#ffffff',
            borderRadius: '8px',
            boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)'
          },
          success: {
            style: {
              borderLeft: '4px solid #10b981' // green-500
            }
          },
          error: {
            style: {
              borderLeft: '4px solid #ef4444' // red-500
            }
          }
        }}
      />
    </AuthProvider>
  );
};

export default Root;