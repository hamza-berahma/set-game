import { useEffect, useState } from 'react';
import { X } from 'lucide-react';

export type ToastType = 'error' | 'info' | 'warning' | 'success';

interface ToastProps {
    message: string;
    type: ToastType;
    onClose: () => void;
    duration?: number;
}

export default function Toast({ message, type, onClose, duration = 3000 }: ToastProps) {
    const [isVisible, setIsVisible] = useState(false);

    useEffect(() => {
        setIsVisible(true);
        const timer = setTimeout(() => {
            setIsVisible(false);
            setTimeout(onClose, 300);
        }, duration);

        return () => clearTimeout(timer);
    }, [duration, onClose]);

    const bgColor = {
        error: 'bg-set-red',
        info: 'bg-set-purple',
        warning: 'bg-gold',
        success: 'bg-set-green',
    }[type];

    const textColor = type === 'error' || type === 'success' ? 'text-white' : 'text-black';

    return (
        <div
            className={`max-w-sm w-full transition-all duration-300 ${
                isVisible ? 'translate-x-0 opacity-100' : 'translate-x-full opacity-0'
            }`}
        >
            <div
                className={`${bgColor} border-4 border-black shadow-[4px_4px_0px_0px_rgba(0,0,0,1)] p-4 flex items-start justify-between gap-3`}
            >
                <p className={`flex-1 uppercase tracking-wider font-semibold ${textColor}`}>
                    {message}
                </p>
                <button
                    onClick={() => {
                        setIsVisible(false);
                        setTimeout(onClose, 300);
                    }}
                    className={`flex-shrink-0 p-1 hover:bg-black/20 transition-colors rounded ${textColor}`}
                    aria-label="Close notification"
                >
                    <X className="w-4 h-4" />
                </button>
            </div>
        </div>
    );
}

interface ToastContainerProps {
    toasts: Array<{ id: string; message: string; type: ToastType }>;
    onRemove: (id: string) => void;
}

export function ToastContainer({ toasts, onRemove }: ToastContainerProps) {
    return (
        <div className="fixed top-4 right-4 z-40 space-y-2 max-w-sm w-full">
            {toasts.map((toast, index) => (
                <div
                    key={toast.id}
                    className="transition-all duration-300"
                    style={{
                        transform: `translateY(${index * 8}px)`,
                    }}
                >
                    <Toast
                        message={toast.message}
                        type={toast.type}
                        onClose={() => onRemove(toast.id)}
                        duration={toast.type === 'error' ? 4000 : 3000}
                    />
                </div>
            ))}
        </div>
    );
}

