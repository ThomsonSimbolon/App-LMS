import React from 'react';
import { cn } from '@/lib/utils';

interface SkeletonProps extends React.HTMLAttributes<HTMLDivElement> {
  variant?: 'text' | 'circular' | 'rectangular';
  width?: string | number;
  height?: string | number;
}

const Skeleton: React.FC<SkeletonProps> = ({
  className,
  variant = 'rectangular',
  width,
  height,
  ...props
}) => {
  const styles = {
    text: "h-4 w-full rounded",
    circular: "rounded-full",
    rectangular: "rounded",
  };

  return (
    <div
      className={cn("skeleton", styles[variant], className)}
      style={{ width, height }}
      {...props}
    />
  );
};

export default Skeleton;
