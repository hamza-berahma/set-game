import { useEffect, useRef, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "../stores/authStore";

const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:5000";

export function useSocket() {
    const { token } = useAuthStore();
    const socketRef = useRef<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const wasConnectedRef = useRef(false);

    useEffect(() => {
        if (!token) {
            return;
        }

        const socket = io(SOCKET_URL, {
            auth: { token },
            transports: ["websocket", "polling"],
            reconnection: true,
            reconnectionAttempts: 5,
            reconnectionDelay: 1000,
        });

        socketRef.current = socket;

        socket.on("connect", () => {
            console.log("Socket is connected", socket.id);
            setIsConnected(true);
            setError(null);
            
            if (wasConnectedRef.current) {
                const lastRoomId = sessionStorage.getItem('lastRoomId');
                if (lastRoomId) {
                    setTimeout(() => {
                        socket.emit('reconnect', { roomId: lastRoomId });
                    }, 100);
                }
            }
            wasConnectedRef.current = true;
        });

        socket.on("disconnect", (reason) => {
            console.log("Socket is disconnected", reason);
            setIsConnected(false);
        });

        socket.on("connect_error", (err) => {
            console.error("Socket connection error:", err);
            setError(err.message);
        });

        socket.on("error", (err: { message: string; code?: string }) => {
            console.error("Socket error:", err);
            setError(err.message);
        });

        return () => {
            socket.disconnect();
            socketRef.current = null;
        };
    }, [token]);

    return {
        socket: socketRef.current,
        isConnected,
        error,
    };
}
