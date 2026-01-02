import { useEffect, useRef } from 'react';
import type { ReactNode } from 'react';

interface BaseDialogProps {
    open: boolean;
    title?: ReactNode;
    children?: ReactNode;
    footer?: ReactNode;
    onClose?: () => void;
}

export function BaseDialog({ open, title, children, footer, onClose }: BaseDialogProps) {
    const modalRef = useRef<HTMLDivElement>(null);
    const mouseDownOutside = useRef(false);

    // Prevent body scroll while open
    useEffect(() => {
        if (open) {
            document.body.style.overflow = 'hidden';
        } else {
            document.body.style.overflow = '';
        }
        return () => {
            document.body.style.overflow = '';
        };
    }, [open]);

    // Handle Escape key to close modal
    useEffect(() => {
        if (!open) return;

        function handleKeyDown(event: KeyboardEvent) {
            if (event.key === 'Escape') {
                onClose?.();
            }
        }

        window.addEventListener('keydown', handleKeyDown);
        return () => window.removeEventListener('keydown', handleKeyDown);
    }, [open, onClose]);

    // Handle outside click only if both down & up are outside
    useEffect(() => {
        if (!open) return;

        function handleMouseDown(event: MouseEvent) {
            mouseDownOutside.current = modalRef.current
                ? !modalRef.current.contains(event.target as Node)
                : false;
        }

        function handleMouseUp(event: MouseEvent) {
            const mouseUpOutside = modalRef.current
                ? !modalRef.current.contains(event.target as Node)
                : false;

            if (mouseDownOutside.current && mouseUpOutside) {
                onClose?.();
            }
        }

        document.addEventListener('mousedown', handleMouseDown);
        document.addEventListener('mouseup', handleMouseUp);

        return () => {
            document.removeEventListener('mousedown', handleMouseDown);
            document.removeEventListener('mouseup', handleMouseUp);
        };
    }, [open, onClose]);

    if (!open) return null;

    return (
        <div
            role="dialog"
            aria-modal="true"
            aria-labelledby="modal-title"
            className="fixed inset-0 z-[9999] flex items-center justify-center"
        >
            {/* Backdrop */}
            <div className="fixed inset-0 bg-gray-100/60 " />

            {/* Modal content */}
            <div
                ref={modalRef}
                className="relative md:max-w-md max-w-[90vw] rounded-lg bg-white p-6 text-left shadow-lg outline outline-1 outline-gray-300 "
                style={{ zIndex: 10000 }}
            >
                {title && (
                    <h3 id="modal-title" className="text-lg font-semibold text-gray-900 ">
                        {title}
                    </h3>
                )}
                {children && <div className={title ? 'mt-2' : ''}>{children}</div>}
                {footer && <div className="mt-6 flex justify-center">{footer}</div>}
            </div>
        </div>
    );
}
