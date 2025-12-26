import { useEffect } from 'react';
import { X } from 'lucide-react';

interface ModalProps {
    isOpen: boolean;
    onClose: () => void;
    title?: string;
    children: React.ReactNode;
    type?: 'success' | 'error' | 'info' | 'warning';
}

export default function Modal({ isOpen, onClose, title, children, type = 'info' }: ModalProps) {
    // Close on Escape key
    useEffect(() => {
        const handleEscape = (e: KeyboardEvent) => {
            if (e.key === 'Escape' && isOpen) {
                onClose();
            }
        };
        window.addEventListener('keydown', handleEscape);
        return () => window.removeEventListener('keydown', handleEscape);
    }, [isOpen, onClose]);

    if (!isOpen) return null;

    const bgColor = {
        success: 'bg-set-green',
        error: 'bg-set-red',
        info: 'bg-set-purple',
        warning: 'bg-gold',
    }[type];

    return (
        <div
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50"
            onClick={onClose}
        >
            <div
                className={`${bgColor} border-8 border-black shadow-[12px_12px_0px_0px_rgba(0,0,0,1)] max-w-md w-full p-6 relative`}
                onClick={(e) => e.stopPropagation()}
            >
                {/* Close button */}
                <button
                    onClick={onClose}
                    className="absolute top-4 right-4 p-2 bg-white border-4 border-black hover:bg-gold transition-all hover:scale-110"
                    aria-label="Close"
                >
                    <X className="w-5 h-5 text-black" />
                </button>

                {/* Title */}
                {title && (
                    <h2 className="text-2xl font-bold uppercase tracking-wider mb-4 text-black pr-10">
                        {title}
                    </h2>
                )}

                {/* Content */}
                <div className="text-black">{children}</div>
            </div>
        </div>
    );
}

