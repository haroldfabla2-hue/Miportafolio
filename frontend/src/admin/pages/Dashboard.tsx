import React, { useEffect, useState } from 'react';
import { api } from '../../services/api';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';
import DashboardTour from '../components/DashboardTour';
import { useNavigate } from 'react-router-dom';

// Types
interface DashboardStats {
    revenue: number;
    projects: number;
    clients: number;
    tasks: number;
}

interface ChartData {
    name: string;
    amount: number;
}

interface Activity {
    id: string;
    type: 'project' | 'client' | 'task' | 'invoice';
    title: string;
    description: string;
    timestamp: string;
}

interface ProjectProgress {
    id: string;
    name: string;
    client: string;
    progress: number;
    status: string;
}

interface Task {
    id: string;
    title: string;
    status: string;
    dueDate?: string;
    project?: { name: string };
}

// Stat Card Component with Gradient
interface StatCardProps {
    title: string;
    value: string | number;
    change?: { value: number; label: string };
    icon: React.ReactNode;
    loading?: boolean;
    gradient?: string;
}

const StatCard: React.FC<StatCardProps> = ({ title, value, change, icon, loading, gradient }) => (
    <div className="admin-card" style={{
        position: 'relative',
        overflow: 'hidden',
        background: gradient ? `linear-gradient(135deg, ${gradient} 0%, var(--admin-card-bg) 100%)` : 'var(--admin-card-bg)'
    }}>
        <div className="admin-card-header" style={{ position: 'relative', zIndex: 1 }}>
            <span className="admin-card-title">{title}</span>
            <div style={{
                color: gradient ? '#fff' : 'var(--color-accent)',
                opacity: gradient ? 0.9 : 0.7,
                background: gradient ? 'rgba(255,255,255,0.2)' : 'transparent',
                borderRadius: '8px',
                padding: '6px'
            }}>{icon}</div>
        </div>
        <div className="admin-stat-value" style={{ position: 'relative', zIndex: 1, color: gradient ? '#fff' : undefined }}>
            {loading ? <span style={{ opacity: 0.5 }}>...</span> : value}
        </div>
        {change && (
            <div className={`admin-stat-change ${change.value >= 0 ? 'positive' : 'negative'}`} style={{ position: 'relative', zIndex: 1 }}>
                <span style={{ color: gradient ? '#fff' : undefined }}>{change.value >= 0 ? '↑' : '↓'}</span>
                <span style={{ color: gradient ? 'rgba(255,255,255,0.8)' : undefined }}>{Math.abs(change.value)}% {change.label}</span>
            </div>
        )}
    </div>
);

const ActivityItem: React.FC<{ activity: Activity }> = ({ activity }) => {
    const typeColors = {
        project: 'var(--status-info)',
        client: 'var(--status-success)',
        task: 'var(--status-warning)',
        invoice: 'var(--color-accent)'
    };

    return (
        <div style={{ display: 'flex', gap: '1rem', padding: '1rem 0', borderBottom: '1px solid var(--admin-border-color)' }}>
            <div style={{ width: '8px', height: '8px', borderRadius: '50%', backgroundColor: typeColors[activity.type], marginTop: '6px', flexShrink: 0 }} />
            <div style={{ flex: 1 }}>
                <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{activity.title}</div>
                <div style={{ color: '#666', fontSize: '0.8rem', marginTop: '4px' }}>{activity.description}</div>
            </div>
            <div style={{ color: '#555', fontSize: '0.75rem', whiteSpace: 'nowrap' }}>{activity.timestamp}</div>
        </div>
    );
};

const ProjectProgressCard: React.FC<{ project: ProjectProgress }> = ({ project }) => {
    const statusColors: Record<string, string> = {
        'ACTIVE': 'var(--status-success)',
        'PLANNING': 'var(--status-info)',
        'REVIEW': 'var(--status-warning)',
        'ON_HOLD': 'var(--status-error)',
        'COMPLETED': 'var(--color-accent)'
    };

    return (
        <div style={{ padding: '1rem', background: 'var(--admin-hover-bg)', borderRadius: '12px', marginBottom: '0.75rem', border: '1px solid var(--admin-border-color)' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.75rem' }}>
                <div>
                    <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{project.name}</div>
                    <div style={{ color: '#666', fontSize: '0.8rem' }}>{project.client}</div>
                </div>
                <span className="admin-badge" style={{ backgroundColor: `${statusColors[project.status] || '#888'}20`, color: statusColors[project.status] || '#888' }}>
                    {project.status}
                </span>
            </div>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ flex: 1, height: '6px', backgroundColor: 'var(--admin-border-color)', borderRadius: '3px', overflow: 'hidden' }}>
                    <div style={{ width: `${project.progress}%`, height: '100%', backgroundColor: statusColors[project.status] || 'var(--color-accent)', borderRadius: '3px', transition: 'width 0.3s ease' }} />
                </div>
                <span style={{ color: '#888', fontSize: '0.8rem', fontWeight: 600 }}>{project.progress}%</span>
            </div>
        </div>
    );
};

// Helper function
const formatCurrency = (amount: number) => `$${amount.toLocaleString()}`;
const timeAgo = (date: Date) => {
    const seconds = Math.floor((Date.now() - date.getTime()) / 1000);
    if (seconds < 60) return 'Just now';
    if (seconds < 3600) return `${Math.floor(seconds / 60)} min ago`;
    if (seconds < 86400) return `${Math.floor(seconds / 3600)} hours ago`;
    return `${Math.floor(seconds / 86400)} days ago`;
};

const Dashboard: React.FC = () => {
    const navigate = useNavigate();
    const [loading, setLoading] = useState(true);
    const [stats, setStats] = useState<DashboardStats>({ revenue: 0, projects: 0, clients: 0, tasks: 0 });
    const [activities, setActivities] = useState<Activity[]>([]);
    const [projects, setProjects] = useState<ProjectProgress[]>([]);
    const [upcomingDeadlines, setUpcomingDeadlines] = useState<Task[]>([]);
    const [chartData, setChartData] = useState<ChartData[]>([]);
    const [taskDistribution, setTaskDistribution] = useState<{ name: string; value: number; color: string }[]>([]);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        setLoading(true);
        try {
            const [usersRes, projectsRes, tasksRes, clientsRes, financeRes, chartRes] = await Promise.all([
                api.get('/users').catch(() => ({ data: [] })),
                api.get('/crm/projects').catch(() => ({ data: [] })),
                api.get('/tasks').catch(() => ({ data: [] })),
                api.get('/crm/clients').catch(() => ({ data: [] })),
                api.get('/finance').catch(() => ({ data: { totalRevenue: 0 } })),
                api.get('/finance/chart').catch(() => ({ data: [] })),
            ]);
            void usersRes;

            const projectsData = projectsRes.data || [];
            const tasks = tasksRes.data || [];
            const clientsData = clientsRes.data || [];
            const financeStats = financeRes.data || { totalRevenue: 0 };

            setChartData(chartRes.data || []);

            const activeProjects = projectsData.filter((p: any) => p.status === 'ACTIVE').length;
            const openTasks = tasks.filter((t: any) => t.status !== 'DONE').length;

            setStats({
                revenue: financeStats.totalRevenue,
                projects: activeProjects || projectsData.length,
                clients: clientsData.length,
                tasks: openTasks || tasks.length
            });

            // Task Distribution
            const taskStats = tasks.reduce((acc: any, t: any) => {
                acc[t.status] = (acc[t.status] || 0) + 1;
                return acc;
            }, {});

            setTaskDistribution([
                { name: 'To Do', value: taskStats['TODO'] || 0, color: '#f59e0b' },
                { name: 'In Progress', value: taskStats['IN_PROGRESS'] || 0, color: '#3b82f6' },
                { name: 'Review', value: taskStats['REVIEW'] || 0, color: '#8b5cf6' },
                { name: 'Done', value: taskStats['DONE'] || 0, color: '#22c55e' }
            ].filter(d => d.value > 0));

            // Upcoming Deadlines logic
            const today = new Date();
            today.setHours(0, 0, 0, 0);
            const deadlines = tasks
                .filter((t: any) => t.dueDate && t.status !== 'DONE')
                .filter((t: any) => new Date(t.dueDate) >= today)
                .sort((a: any, b: any) => new Date(a.dueDate).getTime() - new Date(b.dueDate).getTime())
                .slice(0, 5);
            setUpcomingDeadlines(deadlines);

            // Recent Activity Logic
            const recentActivities: Activity[] = [];

            // Projects
            projectsData.slice(0, 3).forEach((p: any, i: number) => {
                recentActivities.push({
                    id: `proj-${i}`,
                    type: 'project',
                    title: p.status === 'ACTIVE' ? 'Project active' : 'Project created',
                    description: p.name,
                    timestamp: p.createdAt ? timeAgo(new Date(p.createdAt)) : 'Recently'
                });
            });

            // Tasks
            tasks.slice(0, 2).forEach((t: any, i: number) => {
                recentActivities.push({
                    id: `task-${i}`,
                    type: 'task',
                    title: t.status === 'DONE' ? 'Task completed' : 'Task in progress',
                    description: t.title,
                    timestamp: t.updatedAt ? timeAgo(new Date(t.updatedAt)) : 'Recently'
                });
            });

            // Clients
            clientsData.slice(0, 1).forEach((c: any, i: number) => {
                recentActivities.push({
                    id: `client-${i}`,
                    type: 'client',
                    title: 'New Client',
                    description: c.company || c.name,
                    timestamp: c.createdAt ? timeAgo(new Date(c.createdAt)) : 'Recently'
                });
            });

            setActivities(recentActivities.length > 0 ? recentActivities : [{ id: '1', type: 'project', title: 'System ready', description: 'Dashboard initialized', timestamp: 'Just now' }]);

            // Project Progress logic
            const projectProgress: ProjectProgress[] = projectsData.slice(0, 4).map((p: any) => {
                const projectTasks = tasks.filter((t: any) => t.projectId === p.id);
                const doneTasks = projectTasks.filter((t: any) => t.status === 'DONE').length;
                const progress = projectTasks.length > 0 ? Math.round((doneTasks / projectTasks.length) * 100) : 0;
                return { id: p.id, name: p.name, client: p.client?.company || p.client?.name || 'No client', progress, status: p.status };
            });
            setProjects(projectProgress);

        } catch (error) {
            console.error('Dashboard fetch error:', error);
        } finally {
            setLoading(false);
        }
    };

    const getGreeting = () => {
        const hour = new Date().getHours();
        if (hour < 12) return 'Good morning';
        if (hour < 18) return 'Good afternoon';
        return 'Good evening';
    };

    return (
        <div>
            <DashboardTour />
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'end' }}>
                <div>
                    <h1 className="admin-page-title">{getGreeting()}, Boss! 👋</h1>
                    <p className="admin-page-subtitle">Here's what's happening with your business today.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => navigate('/admin/tasks')} className="admin-btn admin-btn-secondary">New Task</button>
                    <button onClick={() => navigate('/admin/crm/projects')} className="admin-btn admin-btn-primary">New Project</button>
                </div>
            </div>

            {/* Quick Actions Widget */}
            <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))', marginBottom: '2rem', gap: '1rem' }}>
                {[
                    { label: 'Create Invoice', icon: '📄', path: '/admin/finance/invoices/new', color: 'rgba(59, 130, 246)' },
                    { label: 'Add Client', icon: '👥', path: '/admin/crm/clients', color: 'rgba(16, 185, 129)' },
                    { label: 'Ask Iris', icon: '✨', path: '/admin/iris', color: 'rgba(139, 92, 246)' },
                    { label: 'View Reports', icon: '📊', path: '/admin/reports', color: 'rgba(245, 158, 11)' },
                ].map((action, i) => (
                    <button key={i} onClick={() => navigate(action.path)} className="admin-card" style={{
                        padding: '1rem', display: 'flex', alignItems: 'center', gap: '0.75rem',
                        cursor: 'pointer', border: '1px solid transparent', transition: 'all 0.2s',
                        background: `linear-gradient(to right, ${action.color}15, var(--admin-card-bg))`
                    }}>
                        <span style={{ fontSize: '1.25rem' }}>{action.icon}</span>
                        <span style={{ fontWeight: 600, fontSize: '0.9rem', color: '#fff' }}>{action.label}</span>
                    </button>
                ))}
            </div>

            {/* Stats Grid */}
            <div className="admin-grid admin-grid-4" style={{ marginBottom: '2rem' }}>
                <StatCard title="Revenue (Total)" value={formatCurrency(stats.revenue)} change={{ value: 12.5, label: 'vs last month' }} loading={loading}
                    icon={<span>$</span>} gradient="rgba(16, 185, 129, 0.2)" />
                <StatCard title="Active Projects" value={stats.projects} change={{ value: 8.3, label: 'vs last month' }} loading={loading}
                    icon={<span>📁</span>} />
                <StatCard title="Total Clients" value={stats.clients} change={{ value: 4.2, label: 'vs last month' }} loading={loading}
                    icon={<span>👥</span>} />
                <StatCard title="Open Tasks" value={stats.tasks} change={{ value: -5.1, label: 'vs last week' }} loading={loading}
                    icon={<span>✅</span>} gradient="rgba(245, 158, 11, 0.2)" />
            </div>

            {/* Charts Section */}
            <div className="admin-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Revenue Chart */}
                <div className="admin-card" style={{ height: '400px' }}>
                    <div className="admin-card-header">
                        <span className="admin-card-title">Revenue Overview</span>
                    </div>
                    <div style={{ width: '100%', height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={chartData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="var(--color-accent)" stopOpacity={0.3} />
                                        <stop offset="95%" stopColor="var(--color-accent)" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="var(--admin-border-color)" vertical={false} />
                                <XAxis dataKey="name" stroke="#888" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#888" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value}`} />
                                <Tooltip contentStyle={{ backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border-color)', borderRadius: '8px' }} itemStyle={{ color: '#fff' }} />
                                <Area type="monotone" dataKey="amount" stroke="var(--color-accent)" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Task Distribution */}
                <div className="admin-card" style={{ height: '400px' }}>
                    <div className="admin-card-header">
                        <span className="admin-card-title">Task Distribution</span>
                    </div>
                    <div style={{ width: '100%', height: '320px' }}>
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie data={taskDistribution} cx="50%" cy="50%" innerRadius={60} outerRadius={80} paddingAngle={5} dataKey="value">
                                    {taskDistribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <Tooltip contentStyle={{ backgroundColor: 'var(--admin-card-bg)', borderRadius: '8px', border: 'none' }} />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>
            </div>

            {/* Two Column Layout: Activity & Deadlines */}
            <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(350px, 1fr))', gap: '1.5rem' }}>
                {/* Recent Activity */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <span className="admin-card-title">Recent Activity</span>
                        <button className="admin-btn admin-btn-ghost" style={{ fontSize: '0.8rem' }}>View All</button>
                    </div>
                    <div>
                        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading...</div> :
                            activities.length > 0 ? activities.map(activity => <ActivityItem key={activity.id} activity={activity} />) :
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No recent activity</div>}
                    </div>
                </div>

                {/* Project Progress */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <span className="admin-card-title">Project Progress</span>
                        <button className="admin-btn admin-btn-ghost" style={{ fontSize: '0.8rem' }}>View All</button>
                    </div>
                    <div>
                        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading...</div> :
                            projects.length > 0 ? projects.map(project => <ProjectProgressCard key={project.id} project={project} />) :
                                <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No projects yet</div>}
                    </div>
                </div>

                {/* Upcoming Deadlines */}
                <div className="admin-card">
                    <div className="admin-card-header">
                        <span className="admin-card-title">Upcoming Deadlines</span>
                        <button className="admin-btn admin-btn-ghost" style={{ fontSize: '0.8rem' }}>View All</button>
                    </div>
                    <div>
                        {loading ? <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>Loading...</div> :
                            upcomingDeadlines.length > 0 ? upcomingDeadlines.map(task => (
                                <div key={task.id} style={{ display: 'flex', alignItems: 'center', gap: '1rem', padding: '0.5rem 0', borderBottom: '1px solid var(--admin-border-color)' }}>
                                    <div style={{ width: '36px', height: '36px', borderRadius: '8px', backgroundColor: 'rgba(245, 158, 11, 0.15)', color: '#f59e0b', display: 'flex', alignItems: 'center', justifyContent: 'center', fontWeight: 700, fontSize: '0.8rem', flexShrink: 0 }}>
                                        {task.dueDate ? new Date(task.dueDate).getDate() : '?'}
                                    </div>
                                    <div style={{ flex: 1 }}>
                                        <div style={{ fontWeight: 600, color: '#fff', fontSize: '0.9rem' }}>{task.title}</div>
                                        <div style={{ color: '#666', fontSize: '0.8rem' }}>{task.project?.name || 'No Project'}</div>
                                    </div>
                                    <div style={{ fontSize: '0.8rem', color: '#f59e0b', fontWeight: 600 }}>
                                        {task.dueDate ? new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' }) : ''}
                                    </div>
                                </div>
                            )) : <div style={{ padding: '2rem', textAlign: 'center', color: '#666' }}>No upcoming deadlines</div>}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Dashboard;
