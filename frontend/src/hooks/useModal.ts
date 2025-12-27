import { useState, useCallback, useRef } from 'react';

/**
 * Basic modal hook for simple open/close state
 */
export function useModal() {
    const [isOpen, setIsOpen] = useState(false);

    const open = useCallback(() => setIsOpen(true), []);
    const close = useCallback(() => setIsOpen(false), []);
    const toggle = useCallback(() => setIsOpen((prev) => !prev), []);

    return { isOpen, open, close, toggle };
}

/**
 * Enhanced modal hook that manages both modal state and content
 * Prevents state desync issues by automatically clearing content on close
 */
export function useModalWithContent<T>() {
    const [isOpen, setIsOpen] = useState(false);
    const [content, setContent] = useState<T | null>(null);
    const previousActiveElement = useRef<HTMLElement | null>(null);

    const open = useCallback((newContent: T) => {
        // Store the currently focused element before opening
        previousActiveElement.current = document.activeElement as HTMLElement;
        setContent(newContent);
        setIsOpen(true);
    }, []);

    const close = useCallback(() => {
        setIsOpen(false);
        // Clear content after a brief delay to allow exit animation
        setTimeout(() => {
            setContent(null);
        }, 200);
        // Restore focus to the element that opened the modal
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

