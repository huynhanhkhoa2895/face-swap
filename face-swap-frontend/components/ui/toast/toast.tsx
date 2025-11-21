import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import './toast.style.scss';

interface ToastProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'success' | 'error' | 'info';
  message: string;
  onClose?: () => void;
}

export default function Toast({
  className,
  variant = 'info',
  message,
  onClose,
  ...props
}: ToastProps) {
  return (
    <div className={clsx('toast', `toast--${variant}`, className)} {...props}>
      <span className="toast__message">{message}</span>
      {onClose && (
        <button className="toast__close" onClick={onClose} aria-label="Close">
          ×
        </button>
      )}
    </div>
  );
}

