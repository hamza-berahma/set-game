import { useState, useCallback, useRef } from 'react';

export function useModal() {
    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    return { isOpen, open, close, toggle };
}

export function useModalWithContent<T>() {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<T | null>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    const open = useCallback((newContent: T) => {
        previousActiveElement.current = document.activeElement as HTMLElement;
        setContent(newContent);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        setTimeout(() => {
            setContent(null);
        }, 200);
        if (previousActiveElement.current) {
            previousActiveElement.current.focus();
            previousActiveElement.current = null;
        }
    }, []);

    const toggle = useCallback((newContent?: T) => {
        if (isOpen) {
            close();
        } else if (newContent !== undefined) {
            open(newContent);
        }
    }, [isOpen, open, close]);

    return { 
        isOpen, 
        content, 
        open, 
        close, 
        toggle 
    };
}

