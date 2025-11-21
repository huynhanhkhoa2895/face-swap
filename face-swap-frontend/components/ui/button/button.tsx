import { ButtonHTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import './button.style.scss';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'outline';
  size?: 'sm' | 'md' | 'lg';
}

const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant = 'primary', size = 'md', children, ...props }, ref) => {
    return (
      <button
        ref={ref}
        className={clsx('button', `button--${variant}`, `button--${size}`, className)}
        {...props}
      >
        {children}
      </button>
    );
  },
);

Button.displayName = 'Button';

export default Button;

