'use client';

import { createContext, useContext, useId } from 'react';
import { cn } from '@/lib/utils';

interface FieldContextValue {
  controlId: string;
  describedBy?: string;
  invalid: boolean;
  required: boolean;
}

const FieldContext = createContext<FieldContextValue | null>(null);

export interface FieldControlAria {
  id: string;
  'aria-describedby': string | undefined;
  'aria-invalid': true | undefined;
  required: boolean | undefined;
}

export interface UseFieldControlArgs {
  id?: string;
  describedBy?: string;
  invalid?: boolean;
  required?: boolean;
}

/**
 * Resolves the id and ARIA wiring for a form control. A control inside a
 * `Field` inherits that field's id, hint and error ids; a standalone control
 * generates its own id so `label htmlFor` always has something to point at.
 */
export function useFieldControl(args: UseFieldControlArgs = {}): FieldControlAria {
  const context = useContext(FieldContext);
  const generatedId = useId();
  const describedBy = [args.describedBy, context?.describedBy].filter(Boolean).join(' ');
  const invalid = args.invalid ?? context?.invalid ?? false;
  const required = args.required ?? context?.required;

  return {
    id: args.id ?? context?.controlId ?? generatedId,
    'aria-describedby': describedBy || undefined,
    'aria-invalid': invalid || undefined,
    required: required || undefined,
  };
}

export interface FieldProps {
  label: React.ReactNode;
  /** Explicit id for the control. One is generated when omitted. */
  htmlFor?: string;
  hint?: React.ReactNode;
  /** Non-empty error text switches the field into its invalid state. */
  error?: React.ReactNode;
  required?: boolean;
  /** Shows a muted "Optional" marker when the field is not required. */
  showOptional?: boolean;
  className?: string;
  labelClassName?: string;
  /**
   * Either a control (it picks the ids up from context) or a render function
   * receiving the resolved ARIA props, for controls outside this kit.
   */
  children: React.ReactNode | ((aria: FieldControlAria) => React.ReactNode);
}

/**
 * Label + hint + error wrapper. Generates a stable id, points the `<label>`
 * at the control, and joins hint and error ids into `aria-describedby`.
 */
export function Field({
  label,
  htmlFor,
  hint,
  error,
  required = false,
  showOptional = false,
  className,
  labelClassName,
  children,
}: FieldProps) {
  const reactId = useId();
  const controlId = htmlFor ?? `${reactId}-control`;
  const hintId = hint ? `${reactId}-hint` : undefined;
  const hasError = Boolean(error);
  const errorId = hasError ? `${reactId}-error` : undefined;
  const describedBy = [hintId, errorId].filter(Boolean).join(' ') || undefined;

  const aria: FieldControlAria = {
    id: controlId,
    'aria-describedby': describedBy,
    'aria-invalid': hasError || undefined,
    required: required || undefined,
  };

  const context: FieldContextValue = {
    controlId,
    describedBy,
    invalid: hasError,
    required,
  };

  return (
    <div className={cn('space-y-1.5', className)}>
      <label
        htmlFor={controlId}
        className={cn(
          'flex flex-wrap items-center gap-1.5 text-sm font-semibold text-[color:var(--brand-navy)]',
          labelClassName,
        )}
      >
        {label}
        {required && (
          <span className="text-red-700">
            <span aria-hidden="true">*</span>
            <span className="sr-only">(required)</span>
          </span>
        )}
        {!required && showOptional && (
          <span className="text-xs font-normal text-slate-600">Optional</span>
        )}
      </label>

      {hint && (
        <p id={hintId} className="text-xs text-slate-600">
          {hint}
        </p>
      )}

      <FieldContext.Provider value={context}>
        {typeof children === 'function' ? children(aria) : children}
      </FieldContext.Provider>

      <div aria-live="polite">
        {hasError && (
          <p id={errorId} className="text-xs font-semibold text-red-700">
            {error}
          </p>
        )}
      </div>
    </div>
  );
}

export default Field;
