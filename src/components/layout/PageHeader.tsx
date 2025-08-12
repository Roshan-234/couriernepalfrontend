'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface PageHeaderProps {
  title: string;
  description?: string;
  className?: string;
  gradient?: boolean;
  children?: React.ReactNode;
}

export function PageHeader({ 
  title, 
  description, 
  className, 
  gradient = true,
  children 
}: PageHeaderProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'relative py-16 sm:py-20',
        gradient && 'bg-gradient-to-r from-primary-600 to-primary-700',
        className
      )}
    >
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-grid-white/[0.05] bg-[size:16px]" />
      
      {/* Content */}
      <div className="relative">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center">
            <h1 className={cn(
              "text-3xl font-bold tracking-tight sm:text-4xl md:text-5xl",
              gradient ? "text-white" : "text-gray-900"
            )}>
              {title}
            </h1>
            {description && (
              <p className={cn(
                "mt-4 max-w-2xl mx-auto text-base sm:text-lg md:text-xl",
                gradient ? "text-primary-100" : "text-gray-600"
              )}>
                {description}
              </p>
            )}
            {children && (
              <div className="mt-8">
                {children}
              </div>
            )}
          </div>
        </div>
      </div>
    </motion.div>
  );
}
