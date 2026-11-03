'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { FaSearch, FaTimes } from 'react-icons/fa';
import { cn } from '@/lib/utils';
import { Spinner } from './Spinner';

export interface SearchInputProps
  extends Omit<
    React.InputHTMLAttributes<HTMLInputElement>,
    'onChange' | 'value' | 'defaultValue' | 'type'
  > {
  /** Fired after the debounce, and immediately on Enter or clear. */
  onSearch: (value: string) => void;
  /** Fires on every keystroke, before the debounce. */
  onValueChange?: (value: string) => void;
  /** Controlled text. Omit to let the input hold its own. */
  value?: string;
  defaultValue?: string;
  /** Debounce in milliseconds. */
  delay?: number;
  /** Accessible name. Hidden visually unless `showLabel` is set. */
  label?: string;
  showLabel?: boolean;
  /** Shows a spinner in place of the clear button while a query is running. */
  loading?: boolean;
  wrapperClassName?: string;
}

/**
 * Debounced search box. Enter searches at once, Escape clears, and the clear
 * button resets and fires an empty search so the list comes back.
 */
export function SearchInput({
  onSearch,
  onValueChange,
  value,
  defaultValue = '',
  delay = 300,
  label = 'Search',
  showLabel = false,
  loading = false,
  placeholder = 'Search',
  wrapperClassName,
  className,
  id,
  disabled,
  ...rest
}: SearchInputProps) {
  const reactId = useId();
  const inputId = id ?? `${reactId}-search`;

  const [text, setText] = useState(value ?? defaultValue);
  const lastEmitted = useRef(text);
  const previousValue = useRef(value);
  const onSearchRef = useRef(onSearch);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Keep the latest callback without restarting the debounce timer.
  useEffect(() => {
    onSearchRef.current = onSearch;
  });

  // Accept changes pushed in from a controlled parent.
  useEffect(() => {
    if (value !== undefined && value !== previousValue.current) {
      previousValue.current = value;
      lastEmitted.current = value;
      setText(value);
    }
  }, [value]);

  useEffect(() => {
    if (text === lastEmitted.current) return;
    const timer = setTimeout(() => {
      lastEmitted.current = text;
      onSearchRef.current(text);
    }, delay);
    return () => clearTimeout(timer);
  }, [text, delay]);

  const emitNow = (next: string) => {
    lastEmitted.current = next;
    onSearchRef.current(next);
  };

  const handleChange = (event: React.ChangeEvent<HTMLInputElement>) => {
    setText(event.target.value);
    onValueChange?.(event.target.value);
  };

  const handleKeyDown = (event: React.KeyboardEvent<HTMLInputElement>) => {
    if (event.key === 'Enter') {
      event.preventDefault();
      emitNow(text);
    } else if (event.key === 'Escape' && text) {
      event.preventDefault();
      setText('');
      onValueChange?.('');
      emitNow('');
    }
  };

  const handleClear = () => {
    setText('');
    onValueChange?.('');
    emitNow('');
    inputRef.current?.focus();
  };

  return (
    <div role="search" className={cn('w-full', wrapperClassName)}>
      <label htmlFor={inputId} className={showLabel ? 'mb-1.5 block text-sm font-semibold text-[color:var(--brand-navy)]' : 'sr-only'}>
        {label}
      </label>
      <div className="relative">
        <FaSearch
          aria-hidden="true"
          className="pointer-events-none absolute left-4 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-slate-500"
        />
        <input
          ref={inputRef}
          id={inputId}
          type="search"
          value={text}
          disabled={disabled}
          placeholder={placeholder}
          onChange={handleChange}
          onKeyDown={handleKeyDown}
          className={cn(
            'field pl-11! pr-12! text-sm placeholder:text-slate-500',
            'disabled:bg-slate-100! disabled:text-slate-600!',
            '[&::-webkit-search-cancel-button]:appearance-none',
            className,
          )}
          {...rest}
        />
        {loading ? (
          <span className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2">
            <Spinner size="sm" label="Searching" />
          </span>
        ) : (
          text && (
            <button
              type="button"
              onClick={handleClear}
              aria-label="Clear search"
              className="absolute right-1 top-1/2 flex h-11 w-11 -translate-y-1/2 items-center justify-center rounded-lg text-slate-600 hover:bg-slate-100 hover:text-[color:var(--brand-navy)]"
            >
              <FaTimes aria-hidden="true" className="h-3.5 w-3.5" />
            </button>
          )
        )}
      </div>
    </div>
  );
}

export default SearchInput;
