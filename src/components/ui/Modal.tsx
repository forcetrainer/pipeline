import { type ReactNode, useEffect, useRef } from 'react';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

const sizeClasses = {
  sm: 'max-w-md',
  md: 'max-w-lg',
  lg: 'max-w-2xl',
};

function Modal({ isOpen, onClose, title, children, size = 'md' }: ModalProps) {
  const dialogRef = useRef<HTMLDialogElement>(null);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen) {
      dialog.showModal();
    } else {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    const handleClose = () => onClose();
    dialog.addEventListener('close', handleClose);
    return () => dialog.removeEventListener('close', handleClose);
  }, [onClose]);

  if (!isOpen) return null;

  return (
    <dialog
      ref={dialogRef}
      className={`
        w-full ${sizeClasses[size]}
        p-0 rounded-lg overflow-hidden
        backdrop:bg-black/70 backdrop:backdrop-blur-sm
        open:animate-in open:fade-in open:zoom-in-95
      `}
      style={{
        backgroundColor: 'var(--nx-void-panel)',
        border: '1px solid rgba(0, 212, 255, 0.2)',
        boxShadow: '0 0 30px rgba(0, 212, 255, 0.1), 0 8px 32px rgba(0, 0, 0, 0.6)',
        margin: 'auto',
        position: 'fixed',
        inset: 0,
      }}
      onClick={(e) => {
        if (e.target === dialogRef.current) onClose();
      }}
    >
      {/* Top accent gradient line */}
      <div
        className="h-[2px] w-full"
        style={{
          background: 'linear-gradient(90deg, var(--nx-cyan-base) 0%, transparent 70%)',
        }}
      />
      <div className="p-6">
        {title && (
          <div className="flex items-center justify-between pb-4">
            <h2 className="text-xl font-semibold text-neutral-50">{title}</h2>
            <button
              onClick={onClose}
              className="p-1 text-neutral-300 hover:text-primary-400 rounded-md transition-colors"
              aria-label="Close dialog"
            >
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                <path d="M18 6L6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        )}
        {children}
      </div>
    </dialog>
  );
}

export { Modal, type ModalProps };
