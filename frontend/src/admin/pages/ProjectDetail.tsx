import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import ProjectTeam from '../components/ProjectTeam';
import ProjectFinance from '../components/ProjectFinance';

// Placeholder components for tabs (will be fleshed out later or imported)
const ProjectOverview = ({ project }: { project: any }) => (
    <div className="admin-grid" style={{ gridTemplateColumns: '2fr 1fr' }}>
        <div className="admin-card">
            <h3>Description</h3>
            <p style={{ color: '#aaa', lineHeight: 1.6 }}>{project.description || 'No description provided.'}</p>
        </div>
        <div className="admin-card">
            <h3>Stats</h3>
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Status</span>
                    <span style={{ color: '#fff', fontWeight: 600 }}>{project.status}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Created</span>
                    <span style={{ color: '#fff' }}>{new Date(project.createdAt).toLocaleDateString()}</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between' }}>
                    <span style={{ color: '#888' }}>Client</span>
                    <span style={{ color: '#fff' }}>{project.client?.company}</span>
                </div>
            </div>
        </div>
    </div>
);

const ProjectTasks = ({ tasks }: { tasks: any[] }) => (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3>Tasks</h3>
            <button className="admin-btn admin-btn-secondary">+ Add Task</button>
        </div>
        {tasks.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No tasks found for this project.</p>
        ) : (
            <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(300px, 1fr))' }}>
                {tasks.map(task => (
                    <div key={task.id} className="admin-card">
                        <h4>{task.title}</h4>
                        <p style={{ fontSize: '0.8rem', color: '#888' }}>{task.status}</p>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const ProjectAssets = ({ assets }: { assets: any[] }) => (
    <div>
        <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem' }}>
            <h3>Assets</h3>
            <button className="admin-btn admin-btn-secondary">+ Upload Asset</button>
        </div>
        {assets.length === 0 ? (
            <p style={{ color: '#666', fontStyle: 'italic' }}>No assets found for this project.</p>
        ) : (
            <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(200px, 1fr))' }}>
                {assets.map(asset => (
                    <div key={asset.id} className="admin-card" style={{ padding: '0.5rem' }}>
                        <div style={{ height: '120px', background: '#333', borderRadius: '4px', marginBottom: '0.5rem', overflow: 'hidden' }}>
                            {asset.thumbnailUrl ? (
                                <img src={asset.thumbnailUrl} alt={asset.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                            ) : (
                                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%', color: '#666' }}>
                                    {asset.type === 'image' ? '📷' : '📄'}
                                </div>
                            )}
                        </div>
                        <p style={{ margin: 0, fontSize: '0.85rem', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>{asset.name}</p>
                        <span style={{ fontSize: '0.7rem', color: '#666' }}>{asset.status}</span>
                    </div>
                ))}
            </div>
        )}
    </div>
);

const ProjectDetail: React.FC = () => {
    const { id } = useParams<{ id: string }>();
    const navigate = useNavigate();
    const [project, setProject] = useState<any>(null);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState('overview');

    useEffect(() => {
        const fetchProject = async () => {
            try {
                // In a real scenario, this endpoint would return project details + relations
                // For now we might need to fetch separate endpoints or update backend to support deep include
                const res = await fetch(`/api/crm/projects/${id}`);
                const data = await res.json();

                // Mocking related data if backend doesn't return it yet
                if (!data.tasks) data.tasks = [];
                if (!data.assets) data.assets = [];

                setProject(data);

                // Try to fetch real assets for this project if possible
                try {
                    const assetsRes = await fetch(`/api/assets?projectId=${id}`);
                    if (assetsRes.ok) {
                        data.assets = await assetsRes.json();
                        setProject({ ...data }); // update state
                    }
                } catch (e) { console.warn('Could not fetch project assets', e); }

            } catch (error) {
                console.error('Failed to fetch project details', error);
            } finally {
                setLoading(false);
            }
        };

        if (id) fetchProject();
    }, [id]);

    if (loading) return <div style={{ padding: '2rem' }}>Loading project...</div>;
    if (!project) return <div style={{ padding: '2rem' }}>Project not found</div>;

    const tabs = [
        { id: 'overview', label: 'Overview' },
        { id: 'tasks', label: 'Tasks' },
        { id: 'assets', label: 'Assets' },
        { id: 'finance', label: 'Finance' },
        { id: 'team', label: 'Team' },
    ];

    return (
        <div>
            {/* Header */}
            <div className="admin-page-header" style={{ marginBottom: '0' }}>
                <button onClick={() => navigate('/admin/projects')} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', marginBottom: '0.5rem', display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    ← Back to Projects
                </button>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                    <div>
                        <h1 className="admin-page-title">{project.name}</h1>
                        <p className="admin-page-subtitle">{project.client?.company} • {project.client?.name}</p>
                    </div>
                    <div>
                        <span style={{
                            padding: '0.5rem 1rem',
                            background: 'rgba(163, 255, 0, 0.1)',
                            color: '#a3ff00',
                            borderRadius: '20px',
                            fontWeight: 600,
                            border: '1px solid rgba(163, 255, 0, 0.2)'
                        }}>
                            {project.status}
                        </span>
                    </div>
                </div>
            </div>

            {/* Tabs */}
            <div style={{ display: 'flex', gap: '2rem', borderBottom: '1px solid var(--admin-border-color)', marginBottom: '2rem' }}>
                {tabs.map(tab => (
                    <button
                        key={tab.id}
                        onClick={() => setActiveTab(tab.id)}
                        style={{
                            background: 'none',
                            border: 'none',
                            padding: '1rem 0',
                            color: activeTab === tab.id ? '#a3ff00' : '#888',
                            borderBottom: activeTab === tab.id ? '2px solid #a3ff00' : '2px solid transparent',
                            cursor: 'pointer',
                            transition: 'all 0.2s',
                            fontWeight: activeTab === tab.id ? 600 : 400
                        }}
                    >
                        {tab.label}
                    </button>
                ))}
            </div>

            {/* Content */}
            <div className="project-content">
                {activeTab === 'overview' && <ProjectOverview project={project} />}
                {activeTab === 'tasks' && <ProjectTasks tasks={project.tasks} />}
                {activeTab === 'assets' && <ProjectAssets assets={project.assets} />}
                {activeTab === 'finance' && <ProjectFinance budget={project.budget || 25000} spent={project.spent || 8500} invoices={[]} />}
                {activeTab === 'team' && <ProjectTeam members={project.team || []} />}
            </div>
        </div>
    );
};

export default ProjectDetail;
