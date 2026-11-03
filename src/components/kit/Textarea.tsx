'use client';

import { forwardRef } from 'react';
import { cn } from '@/lib/utils';
import { useFieldControl } from './Field';

export interface TextareaProps extends React.TextareaHTMLAttributes<HTMLTextAreaElement> {
  /** Forces the invalid style. A surrounding `Field` with an error sets it. */
  invalid?: boolean;
}

/** Multi-line text input on the global `.field` base. */
export const Textarea = forwardRef<HTMLTextAreaElement, TextareaProps>(function Textarea(
  {
    invalid,
    className,
    id,
    required,
    rows = 4,
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

  return (
    <textarea
      ref={ref}
      rows={rows}
      className={cn(
        'field min-h-28! resize-y text-sm leading-6 placeholder:text-slate-500',
        aria['aria-invalid'] && 'border-red-600!',
        'disabled:bg-slate-100! disabled:text-slate-600!',
        className,
      )}
      {...aria}
      {...rest}
    />
  );
});

export default Textarea;
