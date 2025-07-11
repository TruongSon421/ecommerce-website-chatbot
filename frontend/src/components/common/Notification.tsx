import React, { useState, createContext, useContext, ReactNode } from 'react';
import { Snackbar, Alert } from '@mui/material';

interface NotificationProps {
  open: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ open, message, severity, onClose }) => {
  return (
    <Snackbar 
      open={open} 
      autoHideDuration={6000} 
      onClose={onClose}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
    >
      <Alert onClose={onClose} severity={severity} sx={{ width: '100%' }}>
        {message}
      </Alert>
    </Snackbar>
  );
};

// Context để quản lý notification
interface NotificationContextType {
  showNotification: (message: string, severity: 'error' | 'warning' | 'info' | 'success') => void;
}

const NotificationContext = createContext<NotificationContextType | undefined>(undefined);

// Hook để sử dụng notification
export const useNotification = () => {
  const context = useContext(NotificationContext);
  if (!context) {
    throw new Error('useNotification must be used within NotificationProvider');
  }
  return context;
};

// Provider component
export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' as 'error' | 'warning' | 'info' | 'success',
  });

  const showNotification = (message: string, severity: 'error' | 'warning' | 'info' | 'success') => {
    setNotification({
      open: true,
      message,
      severity,
    });
  };

  const handleClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <NotificationContext.Provider value={{ showNotification }}>
      {children}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleClose}
      />
    </NotificationContext.Provider>
  );
};

// Export function for backward compatibility (nếu muốn giữ cách cũ)
let globalShowNotification: ((message: string, severity: 'error' | 'warning' | 'info' | 'success') => void) | null = null;

export const showNotification = (message: string, severity: 'error' | 'warning' | 'info' | 'success') => {
  if (globalShowNotification) {
    globalShowNotification(message, severity);
  } else {
    console.warn('Notification provider not initialized. Make sure to wrap your app with NotificationProvider.');
  }
};

// Component để khởi tạo global function
export const NotificationProviderWithGlobal: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [notification, setNotification] = useState({
    open: false,
    message: '',
    severity: 'info' as 'error' | 'warning' | 'info' | 'success',
  });

  // Khởi tạo global function
  React.useEffect(() => {
    globalShowNotification = (message: string, severity: 'error' | 'warning' | 'info' | 'success') => {
      setNotification({
        open: true,
        message,
        severity,
      });
    };

    return () => {
      globalShowNotification = null;
    };
  }, []);

  const handleClose = () => {
    setNotification(prev => ({ ...prev, open: false }));
  };

  return (
    <NotificationContext.Provider value={{ 
      showNotification: (message: string, severity: 'error' | 'warning' | 'info' | 'success') => {
        setNotification({ open: true, message, severity });
      }
    }}>
      {children}
      <Notification
        open={notification.open}
        message={notification.message}
        severity={notification.severity}
        onClose={handleClose}
      />
    </NotificationContext.Provider>
  );
};

export default Notification;