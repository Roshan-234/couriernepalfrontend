'use client';

import { forwardRef } from 'react';
import { FaChevronDown } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { useFieldControl } from './Field';

export interface SelectOption {
  value: string | number;
  label: string;
  disabled?: boolean;
}

export interface SelectProps extends React.SelectHTMLAttributes<HTMLSelectElement> {
  /** Convenience list. Ignored when `children` are provided. */
  options?: SelectOption[];
  /** Rendered as a disabled first option, for "choose one" selects. */
  placeholder?: string;
  /** Forces the invalid style. A surrounding `Field` with an error sets it. */
  invalid?: boolean;
  wrapperClassName?: string;
}

/**
 * Native `<select>` on the global `.field` base, with the browser chrome
 * replaced by a single chevron. Native keeps the mobile picker and the
 * built-in keyboard behaviour.
 */
export const Select = forwardRef<HTMLSelectElement, SelectProps>(function Select(
  {
    options,
    placeholder,
    invalid,
    wrapperClassName,
    className,
    id,
    required,
    children,
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
    <div className={cn('relative', wrapperClassName)}>
      <select
        ref={ref}
        className={cn(
          // `bg-none!` drops the arrow @tailwindcss/forms paints on selects,
          // so only the chevron below is shown.
          'field appearance-none bg-none! pr-11! text-sm',
          aria['aria-invalid'] && 'border-red-600!',
          'disabled:bg-slate-100! disabled:text-slate-600!',
          className,
        )}
        {...aria}
        {...rest}
      >
        {placeholder && (
          <option value="" disabled>
            {placeholder}
          </option>
        )}
        {children ??
          options?.map((option) => (
            <option key={option.value} value={option.value} disabled={option.disabled}>
              {option.label}
            </option>
          ))}
      </select>
      <FaChevronDown
        aria-hidden="true"
        className="pointer-events-none absolute right-4 top-1/2 h-3 w-3 -translate-y-1/2 text-slate-600"
      />
    </div>
  );
});

export default Select;
