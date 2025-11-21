import { HTMLAttributes, forwardRef } from 'react';
import { clsx } from 'clsx';
import './card.style.scss';

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: 'default' | 'outlined';
}

const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, variant = 'default', children, ...props }, ref) => {
    return (
      <div
        ref={ref}
        className={clsx('card', `card--${variant}`, className)}
        {...props}
      >
        {children}
      </div>
    );
  },
);

Card.displayName = 'Card';

export default Card;

