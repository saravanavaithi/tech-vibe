import React from 'react';

interface ProgressBarProps {
  progress: number;
  className?: string;
}

const ProgressBar: React.FC<ProgressBarProps> = ({ progress, className = '' }) => {
  const clampedProgress = Math.max(0, Math.min(100, progress));

  return (
    <div className={`w-full bg-black/30 rounded-full h-2.5 ${className}`}>
      <div
        className="bg-[rgb(var(--color-accent-purple))] h-2.5 rounded-full transition-all duration-500 ease-in-out shadow-[0_0_8px_rgba(var(--color-accent-purple),0.7)]"
        style={{ width: `${clampedProgress}%` }}
        aria-valuenow={clampedProgress}
        aria-valuemin={0}
        aria-valuemax={100}
        role="progressbar"
      ></div>
    </div>
  );
};

export default ProgressBar;