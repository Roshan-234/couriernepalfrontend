'use client';

import { motion } from 'framer-motion';
import { cn } from '@/lib/utils';

interface SectionProps {
  children: React.ReactNode;
  className?: string;
  title?: string;
  description?: string;
  centered?: boolean;
  lightBackground?: boolean;
}

export function Section({ 
  children, 
  className,
  title,
  description,
  centered = false,
  lightBackground = false,
}: SectionProps) {
  return (
    <motion.section
      initial={{ opacity: 0, y: 20 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      transition={{ duration: 0.5 }}
      className={cn(
        'py-12 sm:py-16 lg:py-20',
        lightBackground && 'bg-gray-50',
        className
      )}
    >
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        {(title || description) && (
          <div className={cn(
            'max-w-3xl mb-12',
            centered && 'mx-auto text-center'
          )}>
            {title && (
              <h2 className="text-2xl font-bold tracking-tight text-gray-900 sm:text-3xl">
                {title}
              </h2>
            )}
            {description && (
              <p className="mt-4 text-lg text-gray-600">
                {description}
              </p>
            )}
          </div>
        )}
        {children}
      </div>
    </motion.section>
  );
}
