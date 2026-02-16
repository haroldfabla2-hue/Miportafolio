import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { AdminDashboard } from '../components/dashboard/AdminDashboard';
import { WorkerDashboard } from '../components/dashboard/WorkerDashboard';
import { ClientDashboard } from '../components/dashboard/ClientDashboard';
import type { Project, Task, Asset, User, Client } from '../../types/models';
import { UserRole } from '../../types/models';
import { Loader2 } from 'lucide-react';

const Dashboard: React.FC = () => {
    const { user } = useAuth();
    const [loading, setLoading] = useState(true);

    // Data State
    const [projects, setProjects] = useState<Project[]>([]);
    const [tasks, setTasks] = useState<Task[]>([]);
    const [assets, setAssets] = useState<Asset[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [clients, setClients] = useState<Client[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, [user]);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            // In a real app, we might want to optimize this with a single 'dashboard-data' endpoint 
            // that returns all needed data, OR use parallel requests.
            // For now, we'll try to fetch what we can.

            // We use Promise.allSettled to ensure that even if one endpoint fails, the dashboard loads partial data
            const results = await Promise.allSettled([
                api.get('/projects'),
                api.get('/tasks'),
                api.get('/assets'),
                api.get('/users'),
                api.get('/clients')
            ]);

            // Helper to get data or empty array
            const getData = (index: number) =>
                results[index].status === 'fulfilled' ? (results[index] as PromiseFulfilledResult<any>).value.data : [];

            setProjects(getData(0));
            setTasks(getData(1));
            setAssets(getData(2));
            setUsers(getData(3));
            setClients(getData(4));

        } catch (error) {
            console.error('Dashboard data fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center h-[calc(100vh-100px)]">
                <Loader2 className="animate-spin text-brand-600" size={48} />
            </div>
        );
    }

    if (!user) return null;

    // Use type assertions or helper to match the role string to UserRole enum if needed
    // Assuming AuthContext role string matches UserRole enum keys compatible strings
    const role = user.role as string;

    // Render based on Role
    if (role === UserRole.SUPER_ADMIN || role === UserRole.ADMIN) {
        return (
            <AdminDashboard
                user={user as User}
                projects={projects}
                tasks={tasks}
                assets={assets}
                users={users}
                clients={clients}
            />
        );
    }

    if (role === UserRole.WORKER) {
        return (
            <WorkerDashboard
                user={user as User}
                projects={projects}
                tasks={tasks}
            />
        );
    }

    if (role === UserRole.CLIENT) {
        return (
            <ClientDashboard
                user={user as User}
                projects={projects}
                assets={assets}
            />
        );
    }

    // Default fallback (e.g., for unknown roles)
    return (
        <div className="p-8 text-center text-slate-500">
            <h2 className="text-xl font-bold mb-2">Welcome, {user.name}</h2>
            <p>Your role ({user.role}) does not have a specific dashboard view yet.</p>
        </div>
    );
};

export default Dashboard;

