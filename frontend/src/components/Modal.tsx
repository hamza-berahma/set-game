import { useEffect, useRef, useState } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    type?: 'success' | 'error' | 'info' | 'warning' | 'white';
    closeOnBackdrop?: boolean;
    closeOnEscape?: boolean;
}

export default function Modal({ 
    isOpen, 
    onClose, 
    title, 
    children, 
    type = 'info',
    closeOnBackdrop = true,
    closeOnEscape = true,
}: ModalProps) {
    const [isAnimating, setIsAnimating] = useState(false);
    const modalRef = useRef<HTMLDivElement>(null);
    const contentRef = useRef<HTMLDivElement>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);
    const firstFocusableRef = useRef<HTMLElement | null>(null);
    const lastFocusableRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (isOpen) {
            const scrollY = window.scrollY;
            document.body.style.position = 'fixed';
            document.body.style.top = `-${scrollY}px`;
            document.body.style.width = '100%';
            
            return () => {
                document.body.style.position = '';
                document.body.style.top = '';
                document.body.style.width = '';
                window.scrollTo(0, scrollY);
            };
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen || !closeOnEscape) return;

        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape') {
                onClose();
            }
        };

        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, closeOnEscape, onClose]);

    useEffect(() => {
        if (isOpen) {
            previousActiveElement.current = document.activeElement as HTMLElement;
            
            const modal = modalRef.current;
            if (modal) {
                const focusableElements = modal.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                );
                
                if (focusableElements.length > 0) {
                    firstFocusableRef.current = focusableElements[0];
                    lastFocusableRef.current = focusableElements[focusableElements.length - 1];
                    
                    setTimeout(() => {
                        firstFocusableRef.current?.focus();
                    }, 100);
                }
            }
        } else {
            if (previousActiveElement.current) {
                previousActiveElement.current.focus();
                previousActiveElement.current = null;
            }
        }
    }, [isOpen]);

    useEffect(() => {
        if (!isOpen) return;

        const handleTabKey = (e: KeyboardEvent) => {
            if (e.key !== 'Tab') return;

            const modal = modalRef.current;
            if (!modal) return;

            const focusableElements = Array.from(
                modal.querySelectorAll<HTMLElement>(
                    'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
                )
            );

            if (focusableElements.length === 0) return;

            const firstElement = focusableElements[0];
            const lastElement = focusableElements[focusableElements.length - 1];

            if (e.shiftKey) {
                if (document.activeElement === firstElement) {
                    e.preventDefault();
                    lastElement.focus();
                }
            } else {
                if (document.activeElement === lastElement) {
                    e.preventDefault();
                    firstElement.focus();
                }
            }
        };

        window.addEventListener('keydown', handleTabKey);
        return () => window.removeEventListener('keydown', handleTabKey);
    }, [isOpen]);

    useEffect(() => {
        if (isOpen) {
            setTimeout(() => setIsAnimating(true), 0);
        } else {
            const timer = setTimeout(() => setIsAnimating(false), 200);
            return () => clearTimeout(timer);
        }
    }, [isOpen]);

    const [titleId] = useState<string | undefined>(() => title ? `modal-title-${Math.random().toString(36).substring(7)}` : undefined);
    const [contentId] = useState<string>(() => `modal-content-${Math.random().toString(36).substring(7)}`);

    if (!isOpen && !isAnimating) return null;

    const bgColor = {
        success: 'bg-set-green',
        error: 'bg-set-red',
        info: 'bg-set-purple',
        warning: 'bg-gold',
        white: 'bg-white',
    }[type];

    return (
        <div
            ref={modalRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={titleId}
            aria-describedby={contentId}
            data-state={isOpen ? 'open' : 'closing'}
            className="fixed inset-0 z-50 flex items-center justify-center p-4"
        >
            <div
                className={`absolute inset-0 bg-black transition-opacity duration-200 ${
                    isOpen ? 'opacity-50' : 'opacity-0'
                }`}
                onClick={closeOnBackdrop ? onClose : undefined}
            />

            <div
                ref={contentRef}
                className={`${bgColor} border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md w-full relative transition-all duration-200 ${
                    isOpen 
                        ? 'opacity-100 scale-100' 
                        : 'opacity-0 scale-95'
                }`}
                onClick={(e) => e.stopPropagation()}
            >
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white border-4 border-black hover:bg-gold transition-all hover:scale-110 focus:outline-none focus:ring-4 focus:ring-gold z-10"
                    aria-label="Close modal"
                    type="button"
                >
                    <X className="w-5 h-5 text-black" />
                </button>

                <div className="bg-white p-6">
                    {title && (
                        <h2 
                            id={titleId}
                            className="text-2xl font-bold uppercase tracking-wider mb-4 text-black pr-10"
                        >
                            {title}
                        </h2>
                    )}

                    <div id={contentId} className="text-black">
                        {children}
                    </div>
                </div>
            </div>
        </div>
    );
}

