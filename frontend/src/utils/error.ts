import axios from 'axios';
import { ZodError } from 'zod';

export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.message || 'An unexpected network error occurred.';
    }
    if (error instanceof ZodError) {
        return error.errors.map(e => e.message).join(', ');
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred.';
}

