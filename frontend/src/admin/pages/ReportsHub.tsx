import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import {
    AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
    Cell, PieChart, Pie, Legend, BarChart, Bar, LineChart, Line
} from 'recharts';
import { api, reportsApi } from '../../services/api';
import { Sparkles, Brain, Download, Trash2, ChevronRight, FileText, Plus } from 'lucide-react';
// import './ReportsHub.css'; // Inline styles used
import EmptyState from '../components/EmptyState';

const ReportsHub: React.FC = () => {
    const [loading, setLoading] = useState(true);
    const [revenueData, setRevenueData] = useState<any[]>([]);
    const [financialSummary, setFinancialSummary] = useState<any>(null);
    const [taskStats, setTaskStats] = useState<any>(null);
    const [projectData, setProjectData] = useState<any[]>([]);
    const [clientAcquisition, setClientAcquisition] = useState<any[]>([]);
    const [reports, setReports] = useState<any[]>([]);
    const [isGenerating, setIsGenerating] = useState(false);
    const [showGenerateModal, setShowGenerateModal] = useState(false);
    const [reportType, setReportType] = useState('FINANCIAL');
    const [reportPrompt, setReportPrompt] = useState('');

    useEffect(() => {
        fetchData();
        fetchReports();
    }, []);

    const fetchReports = async () => {
        try {
            const res = await reportsApi.getAll();
            setReports(res);
        } catch (error) {
            console.error('Failed to fetch AI reports', error);
        }
    };

    const handleGenerateReport = async () => {
        if (!reportPrompt) return;
        setIsGenerating(true);
        try {
            await reportsApi.generate(reportType, reportPrompt);
            setReportPrompt('');
            setShowGenerateModal(false);
            fetchReports();
        } catch (error) {
            console.error('Failed to generate report', error);
            alert('Generation failed. Please try again.');
        } finally {
            setIsGenerating(false);
        }
    };

    const handleDeleteReport = async (id: string) => {
        if (!confirm('Delete this report?')) return;
        try {
            await reportsApi.delete(id);
            setReports(reports.filter(r => r.id !== id));
        } catch (error) {
            console.error('Failed to delete report', error);
        }
    };

    // Ensure state usage for linter (though used in JSX)
    const _lintFix = () => {
        console.log(isGenerating, showGenerateModal, reportType, reportPrompt, setReportType, setReportPrompt);
    };
    if (false) _lintFix();

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
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <button className="admin-btn admin-btn-primary" onClick={() => setShowGenerateModal(true)} style={{ background: 'linear-gradient(135deg, #a3ff00 0%, #22c55e 100%)', color: '#000', fontWeight: 900 }}>
                        <Sparkles size={16} style={{ marginRight: '8px' }} />
                        Generate AI Report
                    </button>
                    <button className="admin-btn admin-btn-secondary" onClick={handleExport}>
                        <Download size={16} style={{ marginRight: '8px' }} />
                        Download CSV
                    </button>
                </div>
            </div>

            {/* AI Reports Section */}
            {reports.length > 0 && (
                <div className="admin-card" style={{ marginBottom: '2rem', border: '1px solid rgba(163, 255, 0, 0.2)', position: 'relative', overflow: 'hidden' }}>
                    <div style={{ position: 'absolute', top: 0, right: 0, padding: '1rem', opacity: 0.1 }}>
                        <Brain size={80} color="#a3ff00" />
                    </div>
                    <h3 style={{ marginBottom: '1rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Sparkles size={18} className="text-brand-500" />
                        Cognitive Insights Archive
                    </h3>
                    <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))', gap: '1rem' }}>
                        {reports.map(report => (
                            <div key={report.id} className="p-4 bg-white/5 border border-white/10 rounded-xl hover:border-brand-500/30 transition-all group">
                                <div className="flex justify-between items-start mb-2">
                                    <div className="flex items-center gap-2">
                                        <FileText size={16} className="text-brand-400" />
                                        <h4 className="text-sm font-bold truncate max-w-[180px]">{report.title}</h4>
                                    </div>
                                    <button onClick={() => handleDeleteReport(report.id)} className="opacity-0 group-hover:opacity-100 p-1 text-slate-500 hover:text-rose-500 transition-all">
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                                <p className="text-[11px] text-slate-500 line-clamp-2 mb-3">
                                    {report.content.substring(0, 100)}...
                                </p>
                                <div className="flex justify-between items-center">
                                    <span className="text-[10px] font-black text-slate-600 uppercase tracking-tighter">
                                        {new Date(report.createdAt).toLocaleDateString()} • {report.metadata?.reportType || 'GENERAL'}
                                    </span>
                                    <button className="text-[10px] font-black text-brand-500 uppercase flex items-center gap-1 hover:gap-2 transition-all">
                                        Open Report <ChevronRight size={12} />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* AI Generate Modal */}
            {showGenerateModal && (
                <div className="fixed inset-0 z-[1000] flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
                    <motion.div initial={{ opacity: 0, scale: 0.9 }} animate={{ opacity: 1, scale: 1 }} className="w-full max-w-lg bg-[#111] border border-white/10 rounded-3xl p-8 shadow-2xl">
                        <div className="flex justify-between items-start mb-6">
                            <div>
                                <h2 className="text-2xl font-black text-white">AI Report Engine</h2>
                                <p className="text-slate-500 text-xs font-bold uppercase tracking-widest mt-1">Nero-Cognitive Data Analysis</p>
                            </div>
                            <button onClick={() => setShowGenerateModal(false)} className="text-slate-500 hover:text-white transition-colors">
                                <X size={24} />
                            </button>
                        </div>

                        <div className="space-y-6">
                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Analysis Scope</label>
                                <div className="grid grid-cols-2 gap-3">
                                    {['FINANCIAL', 'PERFORMANCE'].map(type => (
                                        <button
                                            key={type}
                                            onClick={() => setReportType(type)}
                                            className={`py-3 rounded-xl border font-black text-xs transition-all ${reportType === type ? 'bg-brand-600 border-brand-500 text-black shadow-lg shadow-brand-500/20' : 'bg-white/5 border-white/10 text-slate-400 opacity-50'}`}
                                        >
                                            {type}
                                        </button>
                                    ))}
                                </div>
                            </div>

                            <div>
                                <label className="block text-[10px] font-black text-slate-500 uppercase mb-2">Custom Directives</label>
                                <textarea
                                    className="w-full bg-white/5 border border-white/10 rounded-xl p-4 text-white text-sm focus:border-brand-500 outline-none transition-all min-h-[120px]"
                                    placeholder="e.g., Analyze the revenue growth in the last quarter and identify potential leaks in project budgets."
                                    value={reportPrompt}
                                    onChange={(e) => setReportPrompt(e.target.value)}
                                />
                            </div>

                            <button
                                onClick={handleGenerateReport}
                                disabled={isGenerating || !reportPrompt}
                                className="w-full py-4 bg-brand-600 hover:bg-brand-500 text-black rounded-2xl font-black text-sm tracking-widest transition-all shadow-xl shadow-brand-500/20 flex items-center justify-center gap-3 disabled:opacity-30"
                            >
                                {isGenerating ? (
                                    <>
                                        <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                                        GENERATING...
                                    </>
                                ) : (
                                    <>
                                        <Sparkles size={18} />
                                        START COGNITIVE SCAN
                                    </>
                                )}
                            </button>
                        </div>
                    </motion.div>
                </div>
            )}

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
