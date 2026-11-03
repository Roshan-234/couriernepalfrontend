'use client';

import { useRef, useState } from 'react';
import { Button } from './Button';
import { Modal, type ModalSize } from './Modal';

export type ConfirmTone = 'default' | 'danger';

export interface ConfirmDialogProps {
  open: boolean;
  /** Called on cancel, Escape, the close button and the overlay. */
  onClose: () => void;
  /** May return a promise; the confirm button stays busy until it settles. */
  onConfirm: () => void | Promise<void>;
  title: React.ReactNode;
  /** The consequence, in plain words. Wired up as `aria-describedby`. */
  description?: React.ReactNode;
  children?: React.ReactNode;
  confirmLabel?: string;
  cancelLabel?: string;
  /** `danger` paints the confirm button red, for destructive actions. */
  tone?: ConfirmTone;
  /** Keeps the dialog open after a successful confirm. */
  keepOpenOnConfirm?: boolean;
  size?: ModalSize;
}

/**
 * Yes/no dialog for an action worth stopping over. Focus lands on Cancel, so
 * Enter straight after opening never confirms a destructive action.
 */
export function ConfirmDialog({
  open,
  onClose,
  onConfirm,
  title,
  description,
  children,
  confirmLabel = 'Confirm',
  cancelLabel = 'Cancel',
  tone = 'default',
  keepOpenOnConfirm = false,
  size = 'sm',
}: ConfirmDialogProps) {
  const cancelRef = useRef<HTMLButtonElement | null>(null);
  const [busy, setBusy] = useState(false);

  const handleConfirm = async () => {
    try {
      setBusy(true);
      await onConfirm();
      if (!keepOpenOnConfirm) onClose();
    } finally {
      setBusy(false);
    }
  };

  return (
    <Modal
      open={open}
      onClose={busy ? () => undefined : onClose}
      title={title}
      description={description}
      size={size}
      initialFocusRef={cancelRef}
      closeOnOverlayClick={!busy}
      closeOnEscape={!busy}
      showCloseButton={!busy}
      footer={
        <>
          <Button ref={cancelRef} variant="outline" onClick={onClose} disabled={busy}>
            {cancelLabel}
          </Button>
          <Button
            variant={tone === 'danger' ? 'danger' : 'primary'}
            onClick={handleConfirm}
            loading={busy}
            loadingLabel={`${confirmLabel} in progress`}
          >
            {confirmLabel}
          </Button>
        </>
      }
    >
      {children}
    </Modal>
  );
}

export default ConfirmDialog;
