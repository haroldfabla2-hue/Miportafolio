import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../../services/api';
import EmptyState from '../components/EmptyState';

// Types
interface Project {
    id: string;
    name: string;
    description: string | null;
    status: string;
    client: {
        id: string;
        name: string;
        company: string;
    };
    manager: {
        id: string;
        name: string;
        avatar: string | null;
    } | null;
    _count?: {
        tasks: number;
    };
    createdAt: string;
    updatedAt: string;
}

// Status badge colors
const statusColors: Record<string, { bg: string; text: string }> = {
    'PLANNING': { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' },
    'ACTIVE': { bg: 'rgba(34, 197, 94, 0.15)', text: '#22c55e' },
    'REVIEW': { bg: 'rgba(245, 158, 11, 0.15)', text: '#f59e0b' },
    'COMPLETED': { bg: 'rgba(163, 255, 0, 0.15)', text: '#a3ff00' },
    'ON_HOLD': { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
};

// Project Card Component
const ProjectCard: React.FC<{ project: Project; onClick: (p: Project) => void; onEdit: (e: React.MouseEvent, p: Project) => void }> = ({ project, onClick, onEdit }) => {
    const status = statusColors[project.status] || statusColors['PLANNING'];

    return (
        <div className="admin-card" style={{ cursor: 'pointer', transition: 'transform 0.2s', position: 'relative' }}
            onClick={() => onClick(project)}
            onMouseEnter={(e) => e.currentTarget.style.transform = 'translateY(-4px)'}
            onMouseLeave={(e) => e.currentTarget.style.transform = 'translateY(0)'}
        >
            {/* Edit Button (Absolute) */}
            <button
                onClick={(e) => onEdit(e, project)}
                style={{
                    position: 'absolute',
                    top: '1rem',
                    right: '1rem',
                    opacity: 0.5,
                    background: 'none',
                    border: 'none',
                    color: '#fff',
                    cursor: 'pointer'
                }}
                onMouseEnter={(e) => e.currentTarget.style.opacity = '1'}
                onMouseLeave={(e) => e.currentTarget.style.opacity = '0.5'}
            >
                <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                    <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                </svg>
            </button>

            {/* Header */}
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ paddingRight: '2rem' }}>
                    <h3 style={{ fontSize: '1.1rem', fontWeight: 700, color: '#fff', marginBottom: '0.25rem' }}>
                        {project.name}
                    </h3>
                    <p style={{ fontSize: '0.8rem', color: '#666' }}>
                        {project.client.company}
                    </p>
                </div>
            </div>

            <div style={{ marginBottom: '1rem' }}>
                <span style={{
                    padding: '0.25rem 0.75rem',
                    borderRadius: '20px',
                    fontSize: '0.7rem',
                    fontWeight: 600,
                    textTransform: 'uppercase',
                    backgroundColor: status.bg,
                    color: status.text
                }}>
                    {project.status.replace('_', ' ')}
                </span>
            </div>

            {/* Description */}
            {project.description && (
                <p style={{
                    fontSize: '0.85rem',
                    color: '#888',
                    lineHeight: 1.5,
                    marginBottom: '1rem',
                    display: '-webkit-box',
                    WebkitLineClamp: 2,
                    WebkitBoxOrient: 'vertical',
                    overflow: 'hidden'
                }}>
                    {project.description}
                </p>
            )}

            {/* Footer */}
            <div style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                paddingTop: '1rem',
                borderTop: '1px solid var(--admin-border-color)'
            }}>
                {/* Manager */}
                {project.manager && (
                    <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <img
                            src={project.manager.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${project.manager.name}`}
                            alt={project.manager.name}
                            style={{ width: '24px', height: '24px', borderRadius: '50%' }}
                        />
                        <span style={{ fontSize: '0.75rem', color: '#aaa' }}>{project.manager.name}</span>
                    </div>
                )}
                {/* Tasks Count */}
                {project._count && (
                    <span style={{ fontSize: '0.75rem', color: '#666' }}>
                        {project._count.tasks} tasks
                    </span>
                )}
            </div>
        </div>
    );
};

// Types for Modal
interface ProjectModalProps {
    project: Project | null;
    onClose: () => void;
    onSave: (data: any) => void;
    clients: { id: string; name: string; company: string }[];
}

const ProjectModal: React.FC<ProjectModalProps> = ({ project, onClose, onSave, clients }) => {
    const [formData, setFormData] = useState({
        name: project?.name || '',
        description: project?.description || '',
        status: project?.status || 'PLANNING',
        clientId: project?.client?.id || ''
    });

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        onSave(formData);
    };

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            zIndex: 1000,
            padding: '2rem'
        }}>
            <div style={{
                background: 'var(--admin-card-bg)',
                border: '1px solid var(--admin-border-color)',
                borderRadius: '20px',
                width: '100%',
                maxWidth: '500px',
                padding: '2rem'
            }}>
                <h2 style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff', marginBottom: '1.5rem' }}>
                    {project?.id ? 'Edit Project' : 'New Project'}
                </h2>

                <form onSubmit={handleSubmit}>
                    {/* Name */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>
                            Project Name
                        </label>
                        <input
                            type="text"
                            value={formData.name}
                            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'var(--admin-bg)',
                                border: '1px solid var(--admin-border-color)',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        />
                    </div>

                    {/* Description */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>
                            Description
                        </label>
                        <textarea
                            value={formData.description}
                            onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'var(--admin-bg)',
                                border: '1px solid var(--admin-border-color)',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none',
                                minHeight: '100px',
                                resize: 'vertical'
                            }}
                        />
                    </div>

                    {/* Client */}
                    <div style={{ marginBottom: '1.25rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>
                            Client
                        </label>
                        <select
                            value={formData.clientId}
                            onChange={(e) => setFormData({ ...formData, clientId: e.target.value })}
                            required
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'var(--admin-bg)',
                                border: '1px solid var(--admin-border-color)',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        >
                            <option value="">Select client...</option>
                            {clients.map(client => (
                                <option key={client.id} value={client.id}>
                                    {client.company} - {client.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    {/* Status */}
                    <div style={{ marginBottom: '1.5rem' }}>
                        <label style={{ display: 'block', fontSize: '0.875rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>
                            Status
                        </label>
                        <select
                            value={formData.status}
                            onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                            style={{
                                width: '100%',
                                padding: '0.875rem 1rem',
                                background: 'var(--admin-bg)',
                                border: '1px solid var(--admin-border-color)',
                                borderRadius: '10px',
                                color: '#fff',
                                fontSize: '1rem',
                                outline: 'none'
                            }}
                        >
                            <option value="PLANNING">Planning</option>
                            <option value="ACTIVE">Active</option>
                            <option value="REVIEW">Review</option>
                            <option value="COMPLETED">Completed</option>
                            <option value="ON_HOLD">On Hold</option>
                        </select>
                    </div>

                    {/* Buttons */}
                    <div style={{ display: 'flex', gap: '1rem' }}>
                        <button
                            type="button"
                            onClick={onClose}
                            className="admin-btn admin-btn-secondary"
                            style={{ flex: 1 }}
                        >
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="admin-btn admin-btn-primary"
                            style={{ flex: 1 }}
                        >
                            {project?.id ? 'Save Changes' : 'Create Project'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

// Main Projects Page
const AdminProjectsPage: React.FC = () => {
    const navigate = useNavigate();
    const [projects, setProjects] = useState<Project[]>([]);
    const [clients, setClients] = useState<any[]>([]); // For dropdown
    const [loading, setLoading] = useState(true);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedProject, setSelectedProject] = useState<Project | null>(null);
    const [filter, setFilter] = useState('ALL');

    useEffect(() => {
        fetchProjects();
        fetchClients();
    }, []);

    const fetchProjects = async () => {
        try {
            const res = await api.get('/crm/projects');
            setProjects(res.data);
        } catch (error) {
            console.error('Failed to fetch projects', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchClients = async () => {
        try {
            const res = await api.get('/crm/clients');
            setClients(res.data);
        } catch (error) {
            console.error('Failed to fetch clients', error);
        }
    };

    const handleCreateProject = () => {
        setSelectedProject(null);
        setIsModalOpen(true);
    };

    const handleProjectClick = (project: Project) => {
        navigate(`/admin/projects/${project.id}`);
    };

    const handleEditProject = (e: React.MouseEvent, project: Project) => {
        e.stopPropagation(); // Prevent navigation
        setSelectedProject(project);
        setIsModalOpen(true);
    };

    const handleSaveProject = async (data: any) => {
        try {
            if (selectedProject?.id) {
                await api.put(`/crm/projects/${selectedProject.id}`, data);
            } else {
                await api.post('/crm/projects', data);
            }
            fetchProjects();
            setIsModalOpen(false);
            setSelectedProject(null);
        } catch (error) {
            console.error('Failed to save project:', error);
        }
    };

    // Filter projects
    const filteredProjects = filter === 'ALL'
        ? projects
        : projects.filter(p => p.status === filter);

    return (
        <div>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="admin-page-title">Projects</h1>
                    <p className="admin-page-subtitle">Manage all your projects, track progress, and collaborate.</p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={handleCreateProject}>
                    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                    </svg>
                    New Project
                </button>
            </div>

            {/* Filters */}
            <div style={{ display: 'flex', gap: '0.5rem', marginBottom: '2rem', flexWrap: 'wrap' }}>
                {['ALL', 'PLANNING', 'ACTIVE', 'REVIEW', 'COMPLETED', 'ON_HOLD'].map(status => (
                    <button
                        key={status}
                        onClick={() => setFilter(status)}
                        className={`admin-btn ${filter === status ? 'admin-btn-primary' : 'admin-btn-secondary'}`}
                        style={{ padding: '0.5rem 1rem', fontSize: '0.8rem' }}
                    >
                        {status === 'ALL' ? 'All' : status.replace('_', ' ')}
                    </button>
                ))}
            </div>

            {/* Loading */}
            {loading ? (
                <div className="admin-grid admin-grid-3">
                    {[1, 2, 3, 4, 5, 6].map(i => (
                        <div key={i} className="admin-skeleton" style={{ height: '200px' }} />
                    ))}
                </div>
            ) : filteredProjects.length > 0 ? (
                /* Projects Grid */
                <div className="admin-grid admin-grid-3">
                    {filteredProjects.map(project => (
                        <ProjectCard
                            key={project.id}
                            project={project}
                            onClick={handleProjectClick}
                            onEdit={handleEditProject}
                        />
                    ))}
                </div>
            ) : (
                <EmptyState
                    type="project"
                    title={projects.length === 0 ? "No Projects Yet" : "No Projects Found"}
                    description={projects.length === 0
                        ? "Get started by creating your first project. Track tasks, manage clients, and watch your business grow."
                        : `There are no projects with status "${filter.replace('_', ' ')}". Try a different filter.`}
                    actionLabel={projects.length === 0 ? "Create New Project" : undefined}
                    onAction={projects.length === 0 ? handleCreateProject : undefined}
                    secondaryAction={projects.length === 0 ? { label: "Learn how projects work", link: "/admin" } : undefined}
                />
            )}

            {/* Modal */}
            {isModalOpen && (
                <ProjectModal
                    project={selectedProject}
                    onClose={() => { setIsModalOpen(false); setSelectedProject(null); }}
                    onSave={handleSaveProject}
                    clients={clients}
                />
            )}
        </div>
    );
};

export default AdminProjectsPage;
