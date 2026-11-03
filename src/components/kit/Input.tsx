'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useFieldControl } from './Field';

export interface InputProps extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'size'> {
  /** Forces the invalid style. A surrounding `Field` with an error sets it. */
  invalid?: boolean;
  /** Decorative glyph rendered inside the left edge. */
  leftIcon?: React.ReactNode;
  /** Decorative glyph rendered inside the right edge. */
  rightIcon?: React.ReactNode;
  /** Classes for the wrapper rendered when an icon is present. */
  wrapperClassName?: string;
}

/**
 * Text input built on the global `.field` class. Those rules are unlayered,
 * so state overrides below are marked important to win the cascade.
 */
export const Input = forwardRef<HTMLInputElement, InputProps>(function Input(
  {
    invalid,
    leftIcon,
    rightIcon,
    wrapperClassName,
    className,
    id,
    required,
    disabled,
    type = 'text',
    'aria-describedby': describedBy,
    'aria-invalid': ariaInvalid,
    ...rest
  },
  ref,
) {
  const aria = useFieldControl({
    id,
    describedBy,
    invalid: invalid ?? (ariaInvalid === true || ariaInvalid === 'true'),
    required,
  });

  const input = (
    <input
      ref={ref}
      type={type}
      disabled={disabled}
      className={cn(
        'field text-sm placeholder:text-slate-500',
        leftIcon && 'pl-11!',
        rightIcon && 'pr-11!',
        aria['aria-invalid'] && 'border-red-600!',
        'disabled:bg-slate-100! disabled:text-slate-600!',
        className,
      )}
      {...aria}
      {...rest}
    />
  );

  if (!leftIcon && !rightIcon) return input;

  return (
    <div className={cn('relative', wrapperClassName)}>
      {leftIcon && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-3.5 flex items-center text-slate-500"
        >
          {leftIcon}
        </span>
      )}
      {input}
      {rightIcon && (
        <span
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-3.5 flex items-center text-slate-500"
        >
          {rightIcon}
        </span>
      )}
    </div>
  );
});

export default Input;
