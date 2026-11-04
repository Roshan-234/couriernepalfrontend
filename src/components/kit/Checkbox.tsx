'use client';

import { forwardRef, useEffect, useImperativeHandle, useRef } from 'react';
import { cn } from '@/lib/utils';
import { useFieldControl } from './Field';

export interface CheckboxProps
  extends Omit<React.InputHTMLAttributes<HTMLInputElement>, 'type' | 'size'> {
  label: React.ReactNode;
  /** Supporting text below the label. */
  hint?: React.ReactNode;
  /** Error text below the label; also switches the box to the invalid style. */
  error?: React.ReactNode;
  /** Mixed state, for "select all" boxes over a partial selection. */
  indeterminate?: boolean;
  /** Classes for the row wrapper rather than the input itself. */
  wrapperClassName?: string;
}

/**
 * Checkbox with its label as the click target, so the row clears the 44px
 * minimum even though the box itself is 20px.
 */
export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(function Checkbox(
  {
    label,
    hint,
    error,
    indeterminate = false,
    wrapperClassName,
    className,
    id,
    required,
    disabled,
    'aria-describedby': describedBy,
    ...rest
  },
  ref,
) {
  const innerRef = useRef<HTMLInputElement | null>(null);
  useImperativeHandle(ref, () => innerRef.current as HTMLInputElement, []);

  useEffect(() => {
    if (innerRef.current) innerRef.current.indeterminate = indeterminate;
  }, [indeterminate]);

  const aria = useFieldControl({ id, describedBy, invalid: Boolean(error), required });
  const hintId = hint ? `${aria.id}-hint` : undefined;
  const errorId = error ? `${aria.id}-error` : undefined;
  const allDescribedBy =
    [aria['aria-describedby'], hintId, errorId].filter(Boolean).join(' ') || undefined;

  return (
    <div className={cn('space-y-1', wrapperClassName)}>
      <div className="flex items-start gap-3">
        <input
          ref={innerRef}
          type="checkbox"
          disabled={disabled}
          {...aria}
          aria-describedby={allDescribedBy}
          className={cn(
            // The checked and indeterminate colours are set explicitly.
            // The forms plugin paints a white tick on `currentColor`, but
            // `bg-white` sits in the utilities layer and the plugin's
            // `:checked` rule sits in base — layers beat specificity, so
            // the box stayed white and the white tick was invisible. The
            // state was correct in the DOM and unreadable on screen, which
            // is the worst way for a checkbox to be wrong.
            'mt-3 h-5 w-5 shrink-0 cursor-pointer rounded border-slate-400 bg-white text-teal-700 accent-[color:var(--brand-teal)]',
            'checked:border-[color:var(--brand-teal)] checked:bg-[color:var(--brand-teal)]',
            'indeterminate:border-[color:var(--brand-teal)] indeterminate:bg-[color:var(--brand-teal)]',
            error && 'border-red-600',
            disabled && 'cursor-not-allowed opacity-60',
            className,
          )}
          {...rest}
        />
        <label
          htmlFor={aria.id}
          className={cn(
            'flex min-h-11 cursor-pointer items-center py-2.5 text-sm text-slate-800',
            disabled && 'cursor-not-allowed text-slate-600',
          )}
        >
          {label}
          {aria.required && (
            <span className="ml-1 text-red-700">
              <span aria-hidden="true">*</span>
              <span className="sr-only">(required)</span>
            </span>
          )}
        </label>
      </div>
      {hint && (
        <p id={hintId} className="pl-8 text-xs text-slate-600">
          {hint}
        </p>
      )}
      {error && (
        <p id={errorId} className="pl-8 text-xs font-semibold text-red-700">
          {error}
        </p>
      )}
    </div>
  );
});

export default Checkbox;
