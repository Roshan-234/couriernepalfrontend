/**
 * Shared UI kit for the courier console.
 *
 * Every primitive here is self-contained and leans on the brand tokens and
 * global classes declared in `src/app/globals.css` (`.action`, `.field`,
 * `.panel`, `.eyebrow`) rather than a parallel palette.
 */

// Actions
export { Button, buttonClassNames } from './Button';
export type { ButtonProps, ButtonSize, ButtonVariant, ButtonClassOptions } from './Button';

// Form controls
export { Field, useFieldControl } from './Field';
export type { FieldProps, FieldControlAria, UseFieldControlArgs } from './Field';
export { Input } from './Input';
export type { InputProps } from './Input';
export { Select } from './Select';
export type { SelectProps, SelectOption } from './Select';
export { Textarea } from './Textarea';
export type { TextareaProps } from './Textarea';
export { Checkbox } from './Checkbox';
export type { CheckboxProps } from './Checkbox';
export { SearchInput } from './SearchInput';
export type { SearchInputProps } from './SearchInput';

// Tables
export { Table, THead, TBody, TR, TH, TD } from './Table';
export type {
  TableProps,
  THeadProps,
  TRProps,
  THProps,
  TDProps,
  CellAlign,
  SortDirection,
} from './Table';
export { DataTable } from './DataTable';
export type {
  DataTableProps,
  DataTableColumn,
  DataTableSort,
  SortableValue,
} from './DataTable';

// Status
export { Badge } from './Badge';
export type { BadgeProps, BadgeTone, BadgeVariant, BadgeSize } from './Badge';
export {
  StatusBadge,
  statusGroup,
  statusLabel,
  statusTone,
  STATUS_GROUPS,
  STATUS_LABELS,
} from './StatusBadge';
export type { StatusBadgeProps } from './StatusBadge';

// Overlays
export { Modal, useDialogA11y } from './Modal';
export type { ModalProps, ModalSize, DialogA11yOptions, DialogA11yResult } from './Modal';
export { ConfirmDialog } from './ConfirmDialog';
export type { ConfirmDialogProps, ConfirmTone } from './ConfirmDialog';
export { Drawer } from './Drawer';
export type { DrawerProps, DrawerSide, DrawerSize } from './Drawer';

// Notifications
export { Toast } from './Toast';
export type { ToastProps, ToastVariant } from './Toast';
export { ToastProvider, useToast } from './ToastProvider';
export type { ToastProviderProps, ToastApi, ToastOptions, ToastRecord } from './ToastProvider';

// Layout and feedback
export { Card, CardHeader, CardTitle, CardDescription, CardBody, CardFooter } from './Card';
export type { CardProps, CardHeaderProps, CardTitleProps, CardPadding } from './Card';
export { StatCard } from './StatCard';
export type { StatCardProps, StatCardTrend, TrendDirection } from './StatCard';
export { EmptyState } from './EmptyState';
export type { EmptyStateProps, EmptyStateSize } from './EmptyState';
export { Skeleton } from './Skeleton';
export type { SkeletonProps, SkeletonVariant } from './Skeleton';
export { Spinner } from './Spinner';
export type { SpinnerProps, SpinnerSize } from './Spinner';

// Navigation
export { Pagination } from './Pagination';
export type { PaginationProps } from './Pagination';
export { Tabs } from './Tabs';
export type { TabsProps, TabItem, TabsVariant } from './Tabs';
export { Breadcrumbs } from './Breadcrumbs';
export type { BreadcrumbsProps, BreadcrumbItem } from './Breadcrumbs';
