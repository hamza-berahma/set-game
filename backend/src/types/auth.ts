export interface RegisterRequest {
    username: string;
    email: string;
    password: string;
}

export interface LoginRequest {
    username: string;
    password: string;
}

export interface AuthResponse {
    token: string;
    user: {
        user_id: string;
        username: string;
        email: string;
    };
}


export interface JwtPayload {
    user_id: string;
    username: string;
}
4