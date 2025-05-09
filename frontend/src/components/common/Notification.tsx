import React, { useState } from 'react';
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

// Global notification state and function
interface NotificationState {
  open: boolean;
  message: string;
  severity: 'error' | 'warning' | 'info' | 'success';
}

const notificationState: NotificationState = {
  open: false,
  message: '',
  severity: 'info',
};

let setNotification: React.Dispatch<React.SetStateAction<NotificationState>> | null = null;

export const showNotification = (message: string, severity: 'error' | 'warning' | 'info' | 'success') => {
  if (setNotification) {
    setNotification({ open: true, message, severity });
  }
};

export const NotificationProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [state, setState] = useState<NotificationState>(notificationState);
  setNotification = setState;

  const handleClose = () => {
    setState((prev) => ({ ...prev, open: false }));
  };

  return (
    <>
      <Notification
        open={state.open}
        message={state.message}
        severity={state.severity}
        onClose={handleClose}
      />
      {children}
    </>
  );
};

export default Notification;