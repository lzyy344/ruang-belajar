'use client';

import * as React from 'react';
import { cn } from '@ruang-belajar/shared';

interface AvatarProps extends React.HTMLAttributes<HTMLDivElement> {
  fallback?: React.ReactNode;
  fallbackDelay?: number;
}

const Avatar = React.forwardRef<HTMLDivElement, AvatarProps>(
  ({ className, fallback, fallbackDelay = 100, children, ...props }, ref) => {
    const [showFallback, setShowFallback] = React.useState(false);
    const [imgError, setImgError] = React.useState(false);

    React.useEffect(() => {
      if (fallback) {
        const timer = setTimeout(() => setShowFallback(true), fallbackDelay);
        return () => clearTimeout(timer);
      }
    }, [fallback, fallbackDelay]);

    return (
      <div
        ref={ref}
        className={cn(
          'relative flex h-10 w-10 shrink-0 overflow-hidden rounded-full',
          className
        )}
        {...props}
      >
        {children && !imgError ? (
          <img
            src={React.isValidElement(children) ? (children as React.ReactElement).props.src : ''}
            alt=""
            className="aspect-square h-full w-full object-cover"
            onError={() => setImgError(true)}
          />
        ) : null}
        {(showFallback || imgError || !children) && fallback ? (
          <div className="flex h-full w-full items-center justify-center rounded-full bg-primary/10 text-primary font-medium">
            {fallback}
          </div>
        ) : null}
      </div>
    );
  }
);
Avatar.displayName = 'Avatar';

export { Avatar };