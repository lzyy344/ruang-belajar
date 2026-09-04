'use client';

import { cn } from '@ruang-belajar/shared';

interface BadgeProps extends React.HTMLAttributes<HTMLSpanElement> {
  variant?: 'default' | 'secondary' | 'destructive' | 'outline' | 'success' | 'warning' | 'info';
}

const badgeVariants = {
  default: 'bg-primary/10 text-primary border-primary/20',
  secondary: 'bg-secondary/10 text-secondary border-secondary/20',
  destructive: 'bg-destructive/10 text-destructive border-destructive/20',
  outline: 'border border-input bg-transparent',
  success: 'bg-green-100 text-green-800 border-green-200 dark:bg-green-900/30 dark:text-green-400 dark:border-green-800',
  warning: 'bg-yellow-100 text-yellow-800 border-yellow-200 dark:bg-yellow-900/30 dark:text-yellow-400 dark:border-yellow-800',
  info: 'bg-blue-100 text-blue-800 border-blue-200 dark:bg-blue-900/30 dark:text-blue-400 dark:border-blue-800',
};

export function Badge({ className, variant = 'default', ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-medium border',
        badgeVariants[variant],
        className
      )}
      {...props}
    />
  );
}