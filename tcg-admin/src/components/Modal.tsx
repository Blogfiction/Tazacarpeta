import { useEffect, useCallback, useRef } from 'react';
import { X } from 'lucide-react';
import { useOnClickOutside } from '../hooks/useOnClickOutside';
import { useLockBodyScroll } from '../hooks/useLockBodyScroll';
import { useFocusTrap } from '../hooks/useFocusTrap';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg';
}

export default function Modal({ 
  isOpen, 
  onClose, 
  title, 
  children,
  size = 'md'
}: ModalProps) {
  const modalRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);

  useLockBodyScroll(isOpen);
  useFocusTrap(contentRef, isOpen);
  useOnClickOutside(modalRef, onClose);

  const handleEscape = useCallback((event: KeyboardEvent) => {
    if (event.key === 'Escape') {
      onClose();
    }
  }, [onClose]);

  useEffect(() => {
    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, handleEscape]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-md',
    md: 'max-w-2xl',
    lg: 'max-w-4xl'
  };

  return (
    <>
      {/* Backdrop */}
      <div 
        className="fixed inset-0 bg-black bg-opacity-50 backdrop-blur-sm transition-opacity z-[var(--z-modal-backdrop)]"
        aria-hidden="true"
      />

      {/* Modal Container */}
      <div
        ref={modalRef}
        className="fixed inset-0 overflow-y-auto z-[var(--z-modal)]"
        role="dialog"
        aria-modal="true"
        aria-labelledby="modal-title"
      >
        <div className="flex min-h-full items-center justify-center p-4">
          {/* Modal Content */}
          <div 
            ref={contentRef}
            className={`w-full ${sizeClasses[size]} bg-white retro-container transform transition-all my-8`}
            onClick={e => e.stopPropagation()}
          >
            <div className="modal-header">
              <div className="flex items-center justify-between">
                <h2 
                  id="modal-title"
                  className="font-press-start text-sm text-yellow-200"
                >
                  {title}
                </h2>
                <button
                  onClick={onClose}
                  className="text-gray-300 hover:text-yellow-200 transition-colors p-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-yellow-200"
                  aria-label="Cerrar modal"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>
            </div>
            <div className="modal-body overflow-y-auto max-h-[calc(100vh-12rem)]">
              {children}
            </div>
          </div>
        </div>
      </div>
    </>
  );
}