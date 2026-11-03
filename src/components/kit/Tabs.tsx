'use client';

import { useCallback, useId, useRef, useState } from 'react';
import { cn } from '@/lib/utils';

export interface TabItem {
  id: string;
  label: React.ReactNode;
  /** Panel body. Omit when the page renders the content itself. */
  content?: React.ReactNode;
  icon?: React.ReactNode;
  /** Trailing count or badge. */
  badge?: React.ReactNode;
  disabled?: boolean;
}

export type TabsVariant = 'underline' | 'pill';

export interface TabsProps {
  items: TabItem[];
  /** Controlled selection. Omit to let the component hold it. */
  value?: string;
  defaultValue?: string;
  onValueChange?: (id: string) => void;
  variant?: TabsVariant;
  /** Names the tab list for screen readers. */
  label: string;
  className?: string;
  listClassName?: string;
  panelClassName?: string;
}

/**
 * ARIA tabs with roving focus: arrows move between tabs, Home/End jump to the
 * ends, and only the selected tab is in the tab order.
 */
export function Tabs({
  items,
  value,
  defaultValue,
  onValueChange,
  variant = 'underline',
  label,
  className,
  listClassName,
  panelClassName,
}: TabsProps) {
  const reactId = useId();
  const firstEnabled = items.find((item) => !item.disabled)?.id ?? items[0]?.id;
  const [internalValue, setInternalValue] = useState(defaultValue ?? firstEnabled);
  const activeId = value ?? internalValue;
  const tabRefs = useRef(new Map<string, HTMLButtonElement>());

  const select = useCallback(
    (id: string) => {
      if (value === undefined) setInternalValue(id);
      onValueChange?.(id);
    },
    [onValueChange, value],
  );

  const moveFocus = useCallback(
    (fromIndex: number, step: number) => {
      const count = items.length;
      for (let offset = 1; offset <= count; offset += 1) {
        const index = (fromIndex + step * offset + count * count) % count;
        const candidate = items[index];
        if (candidate && !candidate.disabled) {
          select(candidate.id);
          tabRefs.current.get(candidate.id)?.focus();
          return;
        }
      }
    },
    [items, select],
  );

  const handleKeyDown = (event: React.KeyboardEvent<HTMLButtonElement>, index: number) => {
    switch (event.key) {
      case 'ArrowRight':
      case 'ArrowDown':
        event.preventDefault();
        moveFocus(index, 1);
        break;
      case 'ArrowLeft':
      case 'ArrowUp':
        event.preventDefault();
        moveFocus(index, -1);
        break;
      case 'Home':
        event.preventDefault();
        moveFocus(-1, 1);
        break;
      case 'End':
        event.preventDefault();
        moveFocus(items.length, -1);
        break;
      default:
        break;
    }
  };

  const activeItem = items.find((item) => item.id === activeId);

  return (
    <div className={className}>
      <div
        role="tablist"
        aria-label={label}
        className={cn(
          'flex flex-wrap items-center',
          variant === 'underline' ? 'gap-1 border-b border-slate-200' : 'gap-1.5',
          listClassName,
        )}
      >
        {items.map((item, index) => {
          const selected = item.id === activeId;
          return (
            <button
              key={item.id}
              ref={(node) => {
                if (node) tabRefs.current.set(item.id, node);
                else tabRefs.current.delete(item.id);
              }}
              type="button"
              role="tab"
              id={`${reactId}-tab-${item.id}`}
              aria-selected={selected}
              aria-controls={item.content ? `${reactId}-panel-${item.id}` : undefined}
              tabIndex={selected ? 0 : -1}
              disabled={item.disabled}
              onClick={() => select(item.id)}
              onKeyDown={(event) => handleKeyDown(event, index)}
              className={cn(
                'inline-flex min-h-11 items-center gap-2 px-4 text-sm font-semibold',
                item.disabled && 'cursor-not-allowed text-slate-400',
                variant === 'underline' &&
                  cn(
                    '-mb-px border-b-2 pb-2 pt-2',
                    selected
                      ? 'border-[color:var(--brand-teal)] text-[color:var(--brand-navy)]'
                      : 'border-transparent text-slate-600 hover:border-slate-300 hover:text-[color:var(--brand-navy)]',
                  ),
                variant === 'pill' &&
                  cn(
                    'rounded-full',
                    selected
                      ? 'bg-[color:var(--brand-navy)] text-white'
                      : 'bg-slate-100 text-slate-700 hover:bg-slate-200',
                  ),
              )}
            >
              {item.icon && (
                <span aria-hidden="true" className="shrink-0">
                  {item.icon}
                </span>
              )}
              {item.label}
              {item.badge !== undefined && (
                <span
                  className={cn(
                    'rounded-full px-1.5 py-0.5 text-xs font-bold tabular-nums',
                    selected && variant === 'pill'
                      ? 'bg-white/20 text-white'
                      : 'bg-slate-200 text-slate-700',
                  )}
                >
                  {item.badge}
                </span>
              )}
            </button>
          );
        })}
      </div>

      {activeItem?.content && (
        <div
          role="tabpanel"
          id={`${reactId}-panel-${activeItem.id}`}
          aria-labelledby={`${reactId}-tab-${activeItem.id}`}
          tabIndex={0}
          className={cn('pt-4', panelClassName)}
        >
          {activeItem.content}
        </div>
      )}
    </div>
  );
}

export default Tabs;
