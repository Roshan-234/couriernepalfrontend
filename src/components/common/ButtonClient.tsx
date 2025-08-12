'use client';

import { forwardRef } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface ButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  href?: string;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg';
  fullWidth?: boolean;
  loading?: boolean;
  children: React.ReactNode;
  external?: boolean;
}

const ButtonClient = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ 
    className, 
    href, 
    variant = 'primary', 
    size = 'md', 
    fullWidth = false,
    loading = false,
    external = false,
    children,
    ...props 
  }, ref) => {
    const baseStyles = cn(
      'inline-flex items-center justify-center rounded-md font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-primary-600 focus:ring-offset-2 disabled:opacity-50 disabled:pointer-events-none',
      {
        'bg-primary-600 text-white hover:bg-primary-700': variant === 'primary',
        'bg-secondary-600 text-white hover:bg-secondary-700': variant === 'secondary',
        'border border-primary-600 text-primary-600 hover:bg-primary-50': variant === 'outline',
        'text-primary-600 hover:bg-primary-50': variant === 'ghost',
        'h-9 px-4 text-sm': size === 'sm',
        'h-10 px-6 text-base': size === 'md',
        'h-12 px-8 text-lg': size === 'lg',
        'w-full': fullWidth,
      },
      className
    );

    if (href) {
      const linkProps = external ? { target: '_blank', rel: 'noopener noreferrer' } : {};
      return (
        <Link href={href} className={baseStyles} {...linkProps}>
          {loading ? (
            <motion.div
              animate={{ rotate: 360 }}
              transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
              className="h-5 w-5 border-2 border-current border-t-transparent rounded-full"
            />
          ) : (
            children
          )}
        </Link>
      );
    }

    return (
      <button ref={ref} className={baseStyles} {...props}>
        {loading ? (
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: 'linear' }}
            className="h-5 w-5 border-2 border-current border-t-transparent rounded-full"
          />
        ) : (
          children
        )}
      </button>
    );
  }
);

ButtonClient.displayName = 'ButtonClient';

export { ButtonClient };
