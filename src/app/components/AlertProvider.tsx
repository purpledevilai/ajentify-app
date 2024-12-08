import React, { createContext, useContext, useState, ReactNode } from 'react';
import Alert, { AlertAction } from './Alert';

interface AlertContextType {
    showAlert: (
        title: string,
        message: string,
        actions?: AlertAction[],
        onClose?: () => void
    ) => void;
}

const AlertContext = createContext<AlertContextType | undefined>(undefined);

export const AlertProvider = ({ children }: { children: ReactNode }) => {
    const [alert, setAlert] = useState<{
        title: string;
        message: string;
        actions?: AlertAction[];
        onClose?: () => void;
    } | null>(null);

    const showAlert = (
        title: string,
        message: string,
        actions: AlertAction[] = [{ label: 'Ok', handler: undefined }],
        onClose?: () => void
    ) => {
        setAlert({ title, message, actions, onClose });
    };

    const handleClose = () => {
        if (alert?.onClose) {
            alert.onClose();
        }
        setAlert(null);
    };

    return (
        <AlertContext.Provider value={{ showAlert }}>
            {children}
            {alert && (
                <Alert
                    title={alert.title}
                    message={alert.message}
                    actions={alert.actions}
                    onClose={handleClose}
                />
            )}
        </AlertContext.Provider>
    );
};

export const useAlert = (): AlertContextType => {
    const context = useContext(AlertContext);
    if (!context) {
        throw new Error('useAlert must be used within an AlertProvider');
    }
    return context;
};
