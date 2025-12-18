
import React from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ProgressBarProps {
  value: number;
  max: number;
  className?: string;
  showLabel?: boolean;
  label?: string;
  colorClass?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max,
  className,
  showLabel = true,
  label,
  colorClass = 'bg-cyanBlue'
}) => {
  const percentage = max > 0 ? Math.min((value / max) * 100, 100) : 0;
  
  return (
    <div className={cn("w-full", className)}>
      {showLabel && (
        <div className="flex justify-between text-xs text-muted-foreground mb-1">
          <span>{label || `${value} de ${max}`}</span>
          <span>{percentage.toFixed(0)}%</span>
        </div>
      )}
      <div className="h-2 bg-muted rounded-full overflow-hidden">
        <motion.div
          className={cn("h-full rounded-full", colorClass)}
          initial={{ width: 0 }}
          animate={{ width: `${percentage}%` }}
          transition={{ duration: 0.5, ease: "easeOut" }}
        />
      </div>
    </div>
  );
};

export default ProgressBar;
