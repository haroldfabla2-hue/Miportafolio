import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api';
import type { Project, User, Client, Task } from '../types/models';

interface StoreState {
    projects: Project[];
    users: User[];
    clients: Client[];
    tasks: Task[];
    loading: boolean;
    refresh: () => Promise<void>;
}

const StoreContext = createContext<StoreState | undefined>(undefined);

export const StoreProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [clients, setClients] = useState<Client[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [loading, setLoading] = useState(false);

    const fetchData = async () => {
        setLoading(true);
        try {
            const results = await Promise.allSettled([
                api.get('/projects'), // Adjust endpoints if needed
                api.get('/users'),
                api.get('/clients'),
                api.get('/tasks')
            ]);

            const getData = (index: number) =>
                results[index].status === 'fulfilled' ? (results[index] as PromiseFulfilledResult<any>).value.data : [];

            setProjects(getData(0));
            setUsers(getData(1));
            setClients(getData(2));
            setTasks(getData(3));
        } catch (error) {
            console.error('Failed to fetch store data:', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        // Initial fetch handled by layouts or pages to avoid double-firing if unnecessary
        // But for global consistency, we can trigger it here if authenticated.
    }, []);

    return (
        <StoreContext.Provider value={{ projects, users, clients, tasks, loading, refresh: fetchData }}>
            {children}
        </StoreContext.Provider>
    );
};

export const useStore = () => {
    const context = useContext(StoreContext);
    if (!context) throw new Error('useStore must be used within a StoreProvider');
    return context;
};
