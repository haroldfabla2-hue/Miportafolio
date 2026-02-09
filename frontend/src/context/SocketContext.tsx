import React, { createContext, useContext, useEffect, useState } from 'react';
import { io, Socket } from 'socket.io-client';
import { useAuth } from './AuthContext';

interface SocketContextType {
    socket: Socket | null;
    connected: boolean;
    lastMessage: any;
}

const SocketContext = createContext<SocketContextType>({
    socket: null,
    connected: false,
    lastMessage: null,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const { token } = useAuth();
    const [socket, setSocket] = useState<Socket | null>(null);
    const [connected, setConnected] = useState(false);
    const [lastMessage, setLastMessage] = useState<any>(null);

    useEffect(() => {
        if (!token) {
            if (socket) {
                socket.disconnect();
                setSocket(null);
                setConnected(false);
            }
            return;
        }

        // Initialize socket
        const newSocket = io(import.meta.env.VITE_API_URL || 'http://localhost:3001', {
            auth: { token },
            transports: ['websocket'],
            autoConnect: true,
        });

        newSocket.on('connect', () => {
            console.log('Socket Connected:', newSocket.id);
            setConnected(true);
        });

        newSocket.on('disconnect', () => {
            console.log('Socket Disconnected');
            setConnected(false);
        });

        // Global event listener for debugging or toast triggers
        newSocket.onAny((event, ...args) => {
            console.log(`[Socket] ${event}`, args);
            setLastMessage({ event, data: args[0] });
        });

        setSocket(newSocket);

        return () => {
            newSocket.disconnect();
        };
    }, [token]);

    return (
        <SocketContext.Provider value={{ socket, connected, lastMessage }}>
            {children}
        </SocketContext.Provider>
    );
};
