import React, { useEffect, useState } from 'react';
import styles from './NotificationOverlay.module.css';

export type NotificationType = 'info' | 'success' | 'danger' | 'warning';

export interface NotificationProps {
    message: string;
    type: NotificationType;
    isVisible: boolean;
    duration?: number;
    onAnimationEnd?: () => void;
}

export const NotificationOverlay: React.FC<NotificationProps> = ({
    message,
    type,
    isVisible,
    duration = 2000,
    onAnimationEnd,
}) => {
    const [show, setShow] = useState(isVisible);

    useEffect(() => {
        if (isVisible) {
            setShow(true);
            const timer = setTimeout(() => {
                setShow(false);
                if (onAnimationEnd) {
                    onAnimationEnd();
                }
            }, duration);
            return () => clearTimeout(timer);
        } else {
            setShow(false);
        }
    }, [isVisible, duration, onAnimationEnd]);

    if (!show) return null;

    return (
        <div className={`${styles.overlay} ${styles[type]}`}>
            <div className={styles.content}>
                <h2 className={styles.message}>{message}</h2>
            </div>
        </div>
    );
};
