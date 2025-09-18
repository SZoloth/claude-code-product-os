import React from 'react';
import { createPortal } from 'react-dom';
import { cn } from '@/lib/utils';

export interface ModalProps extends React.HTMLAttributes<HTMLDivElement> {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  footer?: React.ReactNode;
}

export const Modal = ({ open, onOpenChange, title, footer, children, className, ...props }: ModalProps) => {
  const [mounted, setMounted] = React.useState(false);
  React.useEffect(() => setMounted(true), []);
  if (!mounted) return null;
  if (!open) return null;

  const content = (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="absolute inset-0 bg-black/50" onClick={() => onOpenChange(false)} aria-hidden="true" />
      <div
        role="dialog"
        aria-modal="true"
        className={cn('relative z-10 w-full max-w-2xl rounded-md border bg-background text-foreground shadow-lg', className)}
        {...props}
      >
        {(title || footer) ? (
          <div className="flex flex-col max-h-[80vh]">
            {title && (
              <div className="px-4 py-3 border-b text-sm font-medium">{title}</div>
            )}
            <div className="p-4 overflow-auto">{children}</div>
            {footer && (
              <div className="px-4 py-3 border-t bg-secondary/40">{footer}</div>
            )}
          </div>
        ) : (
          <div className="p-4">{children}</div>
        )}
      </div>
    </div>
  );

  return createPortal(content, document.body);
};

export default Modal;

