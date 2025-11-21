import { HTMLAttributes } from 'react';
import { clsx } from 'clsx';
import './progress.style.scss';

interface ProgressProps extends HTMLAttributes<HTMLDivElement> {
  value: number;
  max?: number;
  showLabel?: boolean;
}

export default function Progress({
  className,
  value,
  max = 100,
  showLabel = false,
  ...props
}: ProgressProps) {
  const percentage = Math.min(Math.max((value / max) * 100, 0), 100);

  return (
    <div className={clsx('progress', className)} {...props}>
      <div
        className="progress__bar"
        style={{ width: `${percentage}%` }}
        role="progressbar"
        aria-valuenow={value}
        aria-valuemin={0}
        aria-valuemax={max}
      >
        {showLabel && <span className="progress__label">{Math.round(percentage)}%</span>}
      </div>
    </div>
  );
}

