import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";

interface SocketContextType {
    socket: Socket | null;
    isConnected: boolean;
    connect: () => void;
    disconnect: () => void;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    isConnected: false,
    connect: () => { },
    disconnect: () => { },
});

export const useSocket = () => useContext(SocketContext);

export function SocketProvider({ children }: { children: React.ReactNode }) {
    const [socket, setSocket] = useState<Socket | null>(null);
    const [isConnected, setIsConnected] = useState(false);

    // Initialize socket on mount (but don't connect automatically until auth?)
    // Actually, we can auto-connect if we have a token.

    const connect = () => {
        if (socket?.connected) return;

        const token = localStorage.getItem("token");
        if (!token) return;

        const newSocket = io(import.meta.env.VITE_BACKEND_URL || "http://localhost:8000", {
            auth: { token },
            transports: ["websocket"],
            autoConnect: true,
        });

        newSocket.on("connect", () => {
            console.log("Socket Connected:", newSocket.id);
            setIsConnected(true);
        });

        newSocket.on("disconnect", () => {
            console.log("Socket Disconnected");
            setIsConnected(false);
        });

        newSocket.on("connect_error", (err) => {
            console.error("Socket Connection Error:", err);
        });

        setSocket(newSocket);
    };

    const disconnect = () => {
        if (socket) {
            socket.disconnect();
            setSocket(null);
            setIsConnected(false);
        }
    };

    useEffect(() => {
        // Auto connect if logged in?
        const token = localStorage.getItem("token");
        if (token) {
            connect();
        }

        return () => {
            if (socket) socket.disconnect();
        };
    }, []);

    return (
        <SocketContext.Provider value={{ socket, isConnected, connect, disconnect }}>
            {children}
        </SocketContext.Provider>
    );
}
