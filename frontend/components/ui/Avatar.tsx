import React from 'react';
import { cn } from '@/lib/utils';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  src?: string;
  alt: string;
  size?: 'sm' | 'md' | 'lg' | 'xl';
  fallback?: string;
}

const Avatar: React.FC<AvatarProps> = ({
  className,
  src,
  alt,
  size = 'md',
  fallback,
  ...props
}) => {
  const sizes = {
    sm: 'w-8 h-8 text-xs',
    md: 'w-10 h-10 text-sm',
    lg: 'w-12 h-12 text-base',
    xl: 'w-16 h-16 text-lg',
  };

  const [imgError, setImgError] = React.useState(false);

  // Get initials from alt text
  const initials = alt
    .split(' ')
    .map(word => word[0])
    .join('')
    .substring(0, 2)
    .toUpperCase();

  return (
    <div
      className={cn(
        'relative inline-flex items-center justify-center rounded-full overflow-hidden',
        'bg-gradient-to-br from-primary-400 to-accent-400 text-white font-semibold',
        sizes[size],
        className
      )}
      {...props}
    >
      {src && !imgError ? (
        <img
          src={src}
          alt={alt}
          className="w-full h-full object-cover"
          onError={() => setImgError(true)}
        />
      ) : (
        <span>{fallback || initials}</span>
      )}
    </div>
  );
};

export default Avatar;
