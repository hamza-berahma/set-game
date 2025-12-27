import axios from 'axios';

export function getErrorMessage(error: unknown): string {
    if (axios.isAxiosError(error)) {
        return error.response?.data?.message || error.message || 'An unexpected network error occurred.';
    }
    if (error instanceof Error) {
        return error.message;
    }
    return 'An unknown error occurred.';
}

