import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import EmptyState from '../components/EmptyState';
import { motion, AnimatePresence } from 'framer-motion';

// Types
interface Task {
    id: string;
    title: string;
    description?: string;
    status: 'TODO' | 'IN_PROGRESS' | 'REVIEW' | 'DONE';
    priority?: 'LOW' | 'MEDIUM' | 'HIGH';
    projectId?: string;
    project?: { id: string; name: string };
    assigneeId?: string;
    assignee?: { id: string; name: string; avatar: string | null } | null;
    createdAt: string;
    dueDate?: string;
}

interface Project { id: string; name: string; }
interface User { id: string; name: string; avatar?: string | null; }

const columns = [
    { id: 'TODO', title: 'To Do', color: '#888' },
    { id: 'IN_PROGRESS', title: 'In Progress', color: '#3b82f6' },
    { id: 'REVIEW', title: 'Review', color: '#f59e0b' },
    { id: 'DONE', title: 'Done', color: '#22c55e' },
];

// Task Card
const TaskCard: React.FC<{ task: Task; onDragStart: (task: Task) => void; onClick: () => void }> = ({ task, onDragStart, onClick }) => {
    const priorityColors = { HIGH: '#ef4444', MEDIUM: '#f59e0b', LOW: '#22c55e' };

    return (
        <motion.div
            layout
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            draggable
            onDragStart={(e) => {
                // Set custom drag image or effect if needed
                onDragStart(task);
                e.currentTarget.style.opacity = '0.5';
            }}
            onDragEnd={(e) => {
                e.currentTarget.style.opacity = '1';
            }}
            onClick={onClick}
            style={{
                background: 'var(--admin-card-bg)', // Glass effect via admin-card-bg
                border: '1px solid var(--admin-border-color)',
                borderRadius: '12px', padding: '1rem', marginBottom: '0.75rem', cursor: 'grab',
                position: 'relative', overflow: 'hidden',
                boxShadow: '0 2px 5px rgba(0,0,0,0.05)'
            }}
            whileHover={{ y: -3, boxShadow: '0 8px 15px rgba(0,0,0,0.2)', borderColor: 'var(--color-accent)' }}
            whileTap={{ scale: 0.98 }}
        >
            {/* Priority Indicator Line */}
            {task.priority && (
                <div style={{
                    position: 'absolute', left: 0, top: 0, bottom: 0, width: '4px',
                    backgroundColor: priorityColors[task.priority]
                }} />
            )}

            <div style={{ marginLeft: '8px' }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '0.5rem' }}>
                    <h4 style={{ fontSize: '0.9rem', fontWeight: 600, color: '#fff', flex: 1, margin: 0, lineHeight: 1.4 }}>{task.title}</h4>
                </div>

                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginTop: '0.75rem' }}>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '2px' }}>
                        {task.project && (
                            <span style={{ fontSize: '0.7rem', color: '#888', background: 'var(--admin-hover-bg)', padding: '2px 6px', borderRadius: '4px', alignSelf: 'start' }}>
                                {task.project.name}
                            </span>
                        )}
                        {task.dueDate && (
                            <span style={{ fontSize: '0.7rem', color: '#aaa' }}>
                                📅 {new Date(task.dueDate).toLocaleDateString(undefined, { month: 'short', day: 'numeric' })}
                            </span>
                        )}
                    </div>

                    {task.assignee ? (
                        <img
                            src={task.assignee.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${task.assignee.name}`}
                            alt={task.assignee.name}
                            title={task.assignee.name}
                            style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px solid var(--admin-border-color)' }}
                        />
                    ) : (
                        <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '1px dashed #666', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: '0.6rem', color: '#666' }}>
                            ?
                        </div>
                    )}
                </div>
            </div>
        </motion.div>
    );
};

// Kanban Column
const KanbanColumn: React.FC<{
    column: typeof columns[0]; tasks: Task[];
    onDrop: (columnId: string) => void; onDragStart: (task: Task) => void; onTaskClick: (task: Task) => void;
}> = ({ column, tasks, onDrop, onDragStart, onTaskClick }) => {
    const [isDragOver, setIsDragOver] = useState(false);

    return (
        <div
            onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
            onDragLeave={() => setIsDragOver(false)}
            onDrop={() => { onDrop(column.id); setIsDragOver(false); }}
            style={{
                flex: 1, minWidth: '280px', maxWidth: '350px',
                background: isDragOver ? `color-mix(in srgb, ${column.color} 10%, transparent)` : 'transparent',
                borderRadius: '16px', padding: '0.5rem', transition: 'all 0.3s',
                display: 'flex', flexDirection: 'column'
            }}
        >
            <div style={{
                display: 'flex', alignItems: 'center', justifyContent: 'space-between',
                marginBottom: '1rem', padding: '0.75rem',
                background: 'var(--admin-hover-bg)', borderRadius: '12px',
                border: `1px solid ${isDragOver ? column.color : 'transparent'}`
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <div style={{ width: '10px', height: '10px', borderRadius: '50%', backgroundColor: column.color, boxShadow: `0 0 10px ${column.color}` }} />
                    <span style={{ fontWeight: 600, color: '#fff', fontSize: '0.95rem' }}>{column.title}</span>
                </div>
                <span style={{
                    background: 'var(--admin-bg)', padding: '2px 8px', borderRadius: '12px',
                    fontSize: '0.75rem', color: '#aaa', fontWeight: 600
                }}>
                    {tasks.length}
                </span>
            </div>

            <div style={{ flex: 1, overflowY: 'auto', paddingRight: '4px', minHeight: '100px' }} className="custom-scrollbar">
                <AnimatePresence>
                    {tasks.map(task => (
                        <TaskCard key={task.id} task={task} onDragStart={onDragStart} onClick={() => onTaskClick(task)} />
                    ))}
                </AnimatePresence>
                {tasks.length === 0 && (
                    <div style={{
                        border: '2px dashed var(--admin-border-color)', borderRadius: '12px',
                        height: '100px', display: 'flex', alignItems: 'center', justifyContent: 'center',
                        color: '#666', fontSize: '0.8rem'
                    }}>
                        Drop here
                    </div>
                )}
            </div>
        </div>
    );
};

// Task Modal (Enhanced)
const TaskModal: React.FC<{
    task: Partial<Task> | null; projects: Project[]; users: User[];
    onClose: () => void; onSave: (data: any) => void; onDelete?: () => void;
}> = ({ task, projects, users, onClose, onSave, onDelete }) => {
    const [formData, setFormData] = useState({
        title: task?.title || '',
        description: task?.description || '',
        status: task?.status || 'TODO',
        priority: task?.priority || 'MEDIUM',
        projectId: task?.projectId || task?.project?.id || '',
        assigneeId: task?.assigneeId || task?.assignee?.id || '',
        dueDate: task?.dueDate ? new Date(task.dueDate).toISOString().split('T')[0] : ''
    });

    const inputStyle = { width: '100%', padding: '0.875rem', background: 'var(--admin-bg)', border: '1px solid var(--admin-border-color)', borderRadius: '10px', color: '#fff', fontSize: '0.95rem' };
    const labelStyle = { display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#aaa', marginBottom: '0.5rem' };

    return (
        <motion.div
            initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
            style={{ position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.6)', backdropFilter: 'blur(5px)', display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem' }}
        >
            <motion.div
                initial={{ scale: 0.9, y: 20 }} animate={{ scale: 1, y: 0 }}
                style={{ background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border-color)', borderRadius: '24px', width: '100%', maxWidth: '550px', maxHeight: '90vh', overflow: 'hidden', display: 'flex', flexDirection: 'column', boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)' }}
            >
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--admin-border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: 'var(--admin-hover-bg)' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff', margin: 0 }}>{task?.id ? 'Edit Task' : 'New Task'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.5rem', padding: '0 0.5rem' }}>×</button>
                </div>

                <div style={{ padding: '2rem', display: 'grid', gap: '1.25rem', overflowY: 'auto' }} className="custom-scrollbar">
                    <div>
                        <label style={labelStyle}>Task Title</label>
                        <input type="text" value={formData.title} onChange={(e) => setFormData({ ...formData, title: e.target.value })} placeholder="What needs to be done?" style={inputStyle} required autoFocus />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Status</label>
                            <select value={formData.status} onChange={(e) => setFormData({ ...formData, status: e.target.value as any })} style={inputStyle}>
                                <option value="TODO">To Do</option>
                                <option value="IN_PROGRESS">In Progress</option>
                                <option value="REVIEW">Review</option>
                                <option value="DONE">Done</option>
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Priority</label>
                            <select value={formData.priority} onChange={(e) => setFormData({ ...formData, priority: e.target.value as any })} style={inputStyle}>
                                <option value="LOW">Low</option>
                                <option value="MEDIUM">Medium</option>
                                <option value="HIGH">High</option>
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Description</label>
                        <textarea value={formData.description} onChange={(e) => setFormData({ ...formData, description: e.target.value })} placeholder="Add more details..." rows={4} style={{ ...inputStyle, resize: 'vertical', fontFamily: 'inherit' }} />
                    </div>

                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={labelStyle}>Project</label>
                            <select value={formData.projectId} onChange={(e) => setFormData({ ...formData, projectId: e.target.value })} style={inputStyle}>
                                <option value="">No project</option>
                                {projects.map(p => <option key={p.id} value={p.id}>{p.name}</option>)}
                            </select>
                        </div>
                        <div>
                            <label style={labelStyle}>Assignee</label>
                            <select value={formData.assigneeId} onChange={(e) => setFormData({ ...formData, assigneeId: e.target.value })} style={inputStyle}>
                                <option value="">Unassigned</option>
                                {users.map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
                            </select>
                        </div>
                    </div>

                    <div>
                        <label style={labelStyle}>Due Date</label>
                        <input type="date" value={formData.dueDate} onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })} style={inputStyle} />
                    </div>
                </div>

                <div style={{ padding: '1.5rem', borderTop: '1px solid var(--admin-border-color)', display: 'flex', justifyContent: 'space-between', background: 'var(--admin-hover-bg)' }}>
                    {task?.id && onDelete ? (
                        <button onClick={onDelete} className="admin-btn" style={{ background: 'rgba(239,68,68,0.15)', color: '#ef4444', border: 'none' }}>Delete</button>
                    ) : <div />}
                    <div style={{ display: 'flex', gap: '0.75rem' }}>
                        <button onClick={onClose} className="admin-btn admin-btn-secondary">Cancel</button>
                        <button onClick={() => onSave(formData)} className="admin-btn admin-btn-primary">{task?.id ? 'Save Changes' : 'Create Task'}</button>
                    </div>
                </div>
            </motion.div>
        </motion.div>
    );
};

// Main Tasks Page
const TasksPage: React.FC = () => {
    const [tasks, setTasks] = useState<Task[]>([]);
    const [projects, setProjects] = useState<Project[]>([]);
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [draggingTask, setDraggingTask] = useState<Task | null>(null);
    const [modalOpen, setModalOpen] = useState(false);
    const [selectedTask, setSelectedTask] = useState<Task | null>(null);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [tasksRes, projectsRes, usersRes] = await Promise.all([
                api.get('/tasks'),
                api.get('/crm/projects'),
                api.get('/users'),
            ]);

            setTasks(tasksRes.data);
            setProjects(projectsRes.data);

            const filteredUsers = usersRes.data.filter((u: any) => u.role !== 'CLIENT');
            setUsers(filteredUsers);
        } catch (error) {
            console.error('Failed to fetch data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleDrop = async (newStatus: string) => {
        if (!draggingTask || draggingTask.status === newStatus) return;

        // Optimistic update
        setTasks(prev => prev.map(t => t.id === draggingTask.id ? { ...t, status: newStatus as Task['status'] } : t));

        try {
            await api.put(`/tasks/${draggingTask.id}`, { ...draggingTask, status: newStatus });
        } catch (error) {
            console.error('Failed to update task:', error);
            fetchData(); // Revert on error
        }
        setDraggingTask(null);
    };

    const handleSave = async (data: any) => {
        try {
            const url = selectedTask?.id ? `/tasks/${selectedTask.id}` : '/tasks';
            const method = selectedTask?.id ? 'put' : 'post';

            // Clean up empty fields
            if (!data.projectId) delete data.projectId;
            if (!data.assigneeId) delete data.assigneeId;

            // @ts-ignore
            await api[method](url, data);

            fetchData();
            setModalOpen(false);
            setSelectedTask(null);
        } catch (error) {
            console.error('Failed to save task:', error);
        }
    };

    const handleDelete = async () => {
        if (!selectedTask?.id || !confirm('Delete this task?')) return;

        try {
            await api.delete(`/tasks/${selectedTask.id}`);
            fetchData();
            setModalOpen(false);
            setSelectedTask(null);
        } catch (error) {
            console.error('Failed to delete task:', error);
        }
    };

    const openModal = (task?: Task) => {
        setSelectedTask(task || null);
        setModalOpen(true);
    };

    const getTasksByStatus = (status: string) => tasks.filter(t => t.status === status);

    return (
        <div style={{ height: '100%', display: 'flex', flexDirection: 'column' }}>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '2rem' }}>
                <div>
                    <h1 className="admin-page-title">Tasks Board</h1>
                    <p className="admin-page-subtitle">Manage your team's workflow and priorities.</p>
                </div>
                <button className="admin-btn admin-btn-primary" onClick={() => openModal()}>
                    <span style={{ fontSize: '1.2rem', marginRight: '0.5rem' }}>+</span>
                    New Task
                </button>
            </div>

            {loading ? (
                <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem' }}>
                    {[1, 2, 3, 4].map(i => <div key={i} className="admin-skeleton" style={{ flex: 1, minWidth: '280px', height: '600px', borderRadius: '16px' }} />)}
                </div>
            ) : tasks.length === 0 ? (
                <EmptyState
                    type="task"
                    title="No Tasks Yet"
                    description="Keep track of your work, assign responsibilities, and monitor progress."
                    actionLabel="Create First Task"
                    onAction={() => openModal()}
                />
            ) : (
                <div style={{ display: 'flex', gap: '1.5rem', overflowX: 'auto', paddingBottom: '1rem', height: '100%', alignItems: 'stretch' }} className="custom-scrollbar">
                    {columns.map(column => (
                        <KanbanColumn
                            key={column.id}
                            column={column}
                            tasks={getTasksByStatus(column.id)}
                            onDrop={handleDrop}
                            onDragStart={setDraggingTask}
                            onTaskClick={openModal}
                        />
                    ))}
                </div>
            )}

            <AnimatePresence>
                {modalOpen && (
                    <TaskModal
                        task={selectedTask}
                        projects={projects}
                        users={users}
                        onClose={() => { setModalOpen(false); setSelectedTask(null); }}
                        onSave={handleSave}
                        onDelete={selectedTask?.id ? handleDelete : undefined}
                    />
                )}
            </AnimatePresence>
        </div>
    );
};

export default TasksPage;
