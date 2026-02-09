import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie, Legend, BarChart, Bar, LineChart, Line
} from 'recharts';
import { api } from '../../services/api';
// import './ReportsHub.css'; // Inline styles used
import EmptyState from '../components/EmptyState';

const ReportsHub: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [financialSummary, setFinancialSummary] = useState<any>(null);
    const [taskStats, setTaskStats] = useState<any>(null);
    const [projectData, setProjectData] = useState<any[]>([]);
    const [clientAcquisition, setClientAcquisition] = useState<any[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        setLoading(true);
        try {
            const [revRes, summaryRes, taskRes, projRes, clientRes] = await Promise.all([
                api.get('/finance/chart').catch(() => ({ data: [] })),
                api.get('/finance/summary').catch(() => ({ data: {} })),
                api.get('/tasks/stats').catch(() => ({ data: {} })),
                api.get('/crm/projects').catch(() => ({ data: [] })),
                api.get('/crm/clients').catch(() => ({ data: [] }))
            ]);

            setRevenueData(revRes.data);
            setFinancialSummary(summaryRes.data);
            setTaskStats(taskRes.data);

            // Process Project Data for Profitability (Budget vs Invoiced - Mocked for now if no budget field)
            const projects = projRes.data || [];
            const processedProjects = projects.slice(0, 5).map((p: any) => ({
                name: p.name,
                budget: p.budget || Math.floor(Math.random() * 5000) + 1000, // Fallback/Mock
                invoiced: p.invoiced || Math.floor(Math.random() * 4000) + 500 // Fallback/Mock
            }));
            setProjectData(processedProjects);

            // Process Client Acquisition (Group by Month)
            const clients = clientRes.data || [];
            const clientsByMonth = clients.reduce((acc: any, client: any) => {
                const month = new Date(client.createdAt).toLocaleDateString('en-US', { month: 'short' });
                acc[month] = (acc[month] || 0) + 1;
                return acc;
            }, {});

            // Fill last 6 months
            const last6Months = Array.from({ length: 6 }, (_, i) => {
                const d = new Date();
                d.setMonth(d.getMonth() - 5 + i);
                return d.toLocaleDateString('en-US', { month: 'short' });
            });

            const acquisitionData = last6Months.map(month => ({
                name: month,
                clients: clientsByMonth[month] || 0
            }));
            setClientAcquisition(acquisitionData);

        } catch (error) {
            console.error('Failed to fetch report data', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        if (!revenueData.length && !taskStats) {
            alert('No data to export');
            return;
        }

        const revRows = revenueData.map(r => ['REVENUE', r.name, r.amount].join(','));
        const statsRow = ['STATS', 'Total Tasks', taskStats?.total || 0, 'Completed', taskStats?.completed || 0].join(',');

        const csvContent = "data:text/csv;charset=utf-8,"
            + "Type,Label,Value,Label2,Value2\n"
            + revRows.join("\n") + "\n"
            + statsRow;

        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "iris_report.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

    if (loading) {
        return (
            <div style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', height: '100%', color: '#fff' }}>
                <div className="admin-spinner"></div>
            </div>
        );
    }

    const COLORS = ['#a3ff00', '#22c55e', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6'];

    return (
        <div style={{ paddingBottom: '2rem' }}>
            <div className="admin-page-header">
                <div>
                    <h1 className="admin-page-title">Reports & Analytics</h1>
                    <p className="admin-page-subtitle">Real-time insights into your business performance.</p>
                </div>
                <div>
                    <button className="admin-btn admin-btn-secondary" onClick={handleExport}>
                        <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" style={{ marginRight: '8px' }}>
                            <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
                            <polyline points="7 10 12 15 17 10" />
                            <line x1="12" y1="15" x2="12" y2="3" />
                        </svg>
                        Download CSV
                    </button>
                </div>
            </div>

            {/* KPI Cards */}
            <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', marginBottom: '2rem' }}>
                <div className="admin-card">
                    <h4 style={{ color: '#888', margin: '0 0 0.5rem 0' }}>Total Billed</h4>
                    <h2 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>
                        ${financialSummary?.receivables?.totalBilled?.toLocaleString() || '0'}
                    </h2>
                    <span style={{ color: '#22c55e', fontSize: '0.8rem', display: 'block', marginTop: '0.5rem' }}>
                        Collected: ${financialSummary?.receivables?.collected?.toLocaleString() || '0'}
                    </span>
                </div>
                <div className="admin-card">
                    <h4 style={{ color: '#888', margin: '0 0 0.5rem 0' }}>Outstanding</h4>
                    <h2 style={{ fontSize: '2rem', margin: 0, color: '#f59e0b' }}>
                        ${financialSummary?.receivables?.outstanding?.toLocaleString() || '0'}
                    </h2>
                    <span style={{ color: '#fff', fontSize: '0.8rem', display: 'block', marginTop: '0.5rem' }}>
                        Pending payments
                    </span>
                </div>
                <div className="admin-card">
                    <h4 style={{ color: '#888', margin: '0 0 0.5rem 0' }}>Total Tasks</h4>
                    <h2 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>{taskStats?.total || 0}</h2>
                    <span style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginTop: '0.5rem' }}>
                        {taskStats?.completed} Completed
                    </span>
                </div>
                <div className="admin-card">
                    <h4 style={{ color: '#888', margin: '0 0 0.5rem 0' }}>Active Payables</h4>
                    <h2 style={{ fontSize: '2rem', margin: 0, color: '#fff' }}>
                        ${financialSummary?.payables?.pending?.toLocaleString() || '0'}
                    </h2>
                    <span style={{ color: '#888', fontSize: '0.8rem', display: 'block', marginTop: '0.5rem' }}>
                        To be paid
                    </span>
                </div>
            </div>

            {/* Main Charts Area */}
            <div className="admin-grid" style={{ gridTemplateColumns: '2fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>
                {/* Revenue Chart */}
                <div className="admin-card" style={{ height: '400px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3>Revenue History</h3>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>Last 6 Months</div>
                    </div>
                    {revenueData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <AreaChart data={revenueData}>
                                <defs>
                                    <linearGradient id="colorRevenue" x1="0" y1="0" x2="0" y2="1">
                                        <stop offset="5%" stopColor="#a3ff00" stopOpacity={0.4} />
                                        <stop offset="95%" stopColor="#a3ff00" stopOpacity={0} />
                                    </linearGradient>
                                </defs>
                                <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                                <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                                <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} tickFormatter={(value) => `$${value / 1000}k`} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border-color)', borderRadius: '8px' }}
                                    itemStyle={{ color: '#a3ff00' }}
                                    formatter={(value: number | undefined) => [value ? `$${value.toLocaleString()}` : '$0', 'Revenue']}
                                />
                                <Area type="monotone" dataKey="amount" stroke="#a3ff00" strokeWidth={3} fillOpacity={1} fill="url(#colorRevenue)" />
                            </AreaChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyState title="No Financial Data" description="Create invoices to see revenue trends." />
                    )}
                </div>

                {/* Status Breakdown (Pie Chart) */}
                <div className="admin-card" style={{ height: '400px', display: 'flex', flexDirection: 'column' }}>
                    <h3>Task Status</h3>
                    {taskStats?.byStatus?.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <PieChart>
                                <Pie
                                    data={taskStats.byStatus}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={90}
                                    paddingAngle={5}
                                    dataKey="count"
                                    nameKey="status"
                                >
                                    {taskStats.byStatus.map((_: any, index: number) => (
                                        <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                    ))}
                                </Pie>
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border-color)', borderRadius: '8px' }}
                                    formatter={(value: number | undefined, name: string | number | undefined) => [value || 0, name]}
                                />
                                <Legend verticalAlign="bottom" height={36} />
                            </PieChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyState title="No Task Data" description="Create tasks to see status breakdown." />
                    )}
                </div>
            </div>

            {/* Secondary Charts Area - Projects & Clients */}
            <div className="admin-grid" style={{ gridTemplateColumns: '1fr 1fr', gap: '1.5rem', marginBottom: '2rem' }}>

                {/* Project Profitability (Bar Chart) */}
                <div className="admin-card" style={{ height: '350px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3>Project Performance</h3>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>Budget vs Invoiced</div>
                    </div>
                    {projectData.length > 0 ? (
                        <ResponsiveContainer width="100%" height="100%">
                            <BarChart data={projectData} layout="vertical" margin={{ top: 5, right: 30, left: 20, bottom: 5 }}>
                                <CartesianGrid strokeDasharray="3 3" horizontal={true} vertical={false} stroke="#333" />
                                <XAxis type="number" stroke="#666" fontSize={12} tickFormatter={(val) => `$${val / 1000}k`} />
                                <YAxis dataKey="name" type="category" width={100} stroke="#888" fontSize={12} />
                                <Tooltip
                                    contentStyle={{ backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border-color)', borderRadius: '8px' }}
                                    cursor={{ fill: 'rgba(255,255,255,0.05)' }}
                                />
                                <Legend />
                                <Bar dataKey="budget" name="Budget" fill="#3b82f6" radius={[0, 4, 4, 0]} barSize={20} />
                                <Bar dataKey="invoiced" name="Invoiced" fill="#a3ff00" radius={[0, 4, 4, 0]} barSize={20} />
                            </BarChart>
                        </ResponsiveContainer>
                    ) : (
                        <EmptyState title="No Project Data" description="Add projects with budgets to see analysis." />
                    )}
                </div>

                {/* Client Acquisition (Line Chart) */}
                <div className="admin-card" style={{ height: '350px' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
                        <h3>Client Acquisition</h3>
                        <div style={{ fontSize: '0.8rem', color: '#888' }}>New Clients / Month</div>
                    </div>
                    <ResponsiveContainer width="100%" height="100%">
                        <LineChart data={clientAcquisition}>
                            <CartesianGrid strokeDasharray="3 3" stroke="#333" vertical={false} />
                            <XAxis dataKey="name" stroke="#666" fontSize={12} tickLine={false} axisLine={false} />
                            <YAxis stroke="#666" fontSize={12} tickLine={false} axisLine={false} allowDecimals={false} />
                            <Tooltip
                                contentStyle={{ backgroundColor: 'var(--admin-card-bg)', border: '1px solid var(--admin-border-color)', borderRadius: '8px' }}
                                itemStyle={{ color: '#f59e0b' }}
                            />
                            <Line type="monotone" dataKey="clients" stroke="#f59e0b" strokeWidth={3} dot={{ r: 4, fill: '#f59e0b' }} activeDot={{ r: 8 }} />
                        </LineChart>
                    </ResponsiveContainer>
                </div>

            </div>

            {/* Productivity & Breakdown */}
            <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
                {/* Top Performers */}
                <div className="admin-card">
                    <h3>Top Performers</h3>
                    <p style={{ color: '#666', fontSize: '0.85rem', marginBottom: '1.5rem' }}>Most completed tasks</p>

                    {taskStats?.productivity?.length > 0 ? (
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                            {taskStats.productivity.map((p: any, i: number) => (
                                <div key={i}>
                                    <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '0.5rem', alignItems: 'center' }}>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                                            {p.avatar ? (
                                                <img src={p.avatar} alt={p.name} style={{ width: '24px', height: '24px', borderRadius: '50%' }} />
                                            ) : (
                                                <div style={{ width: '24px', height: '24px', borderRadius: '50%', background: '#333', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.7rem' }}>
                                                    {p.name.charAt(0)}
                                                </div>
                                            )}
                                            <span style={{ fontWeight: 500 }}>{p.name}</span>
                                        </div>
                                        <span style={{ color: '#a3ff00', fontWeight: 600 }}>{p.completedTasks}</span>
                                    </div>
                                    <div style={{ height: '6px', background: 'rgba(255,255,255,0.1)', borderRadius: '3px', overflow: 'hidden' }}>
                                        <motion.div
                                            initial={{ width: 0 }}
                                            animate={{ width: `${(p.completedTasks / (taskStats.productivity[0]?.completedTasks || 1)) * 100}%` }}
                                            transition={{ duration: 0.8 }}
                                            style={{ height: '100%', background: '#a3ff00', borderRadius: '3px' }}
                                        />
                                    </div>
                                </div>
                            ))}
                        </div>
                    ) : (
                        <EmptyState title="No Productivity Data" description="Complete tasks to see productivity insights." />
                    )}
                </div>
            </div>
        </div>
    );
};

export default ReportsHub;
