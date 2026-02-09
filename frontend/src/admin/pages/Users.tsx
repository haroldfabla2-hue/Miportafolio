import React, { useState, useEffect } from 'react';

// Types
interface User {
    id: string;
    email: string;
    name: string;
    role: 'SUPER_ADMIN' | 'ADMIN' | 'WORKER' | 'CLIENT';
    avatar: string | null;
    hourlyRate?: number;
    createdAt: string;
    googleConnected?: boolean;
    assignedDriveFolderId?: string;
    assignedDriveFolderName?: string;
}

import InviteUserModal from '../components/InviteUserModal';
import { api } from '../../services/api';

const roleColors: Record<string, { bg: string; text: string }> = {
    SUPER_ADMIN: { bg: 'rgba(239, 68, 68, 0.15)', text: '#ef4444' },
    ADMIN: { bg: 'rgba(163, 255, 0, 0.15)', text: 'var(--color-accent)' },
    WORKER: { bg: 'rgba(59, 130, 246, 0.15)', text: '#3b82f6' },
    CLIENT: { bg: 'rgba(107, 114, 128, 0.15)', text: '#888' },
};

// User Row with Drive info
const UserRow: React.FC<{
    user: User;
    onEdit: (u: User) => void;
    onDelete: (id: string) => void;
    onAssignFolder: (u: User) => void;
}> = ({ user, onEdit, onDelete, onAssignFolder }) => (
    <tr>
        <td>
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                <div style={{ position: 'relative' }}>
                    <img
                        src={user.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${user.email}`}
                        alt={user.name}
                        style={{ width: '36px', height: '36px', borderRadius: '50%' }}
                    />
                    {user.googleConnected && (
                        <div style={{
                            position: 'absolute', bottom: -2, right: -2,
                            width: '14px', height: '14px', borderRadius: '50%',
                            background: '#22c55e', border: '2px solid var(--admin-card-bg)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: '8px'
                        }}>G</div>
                    )}
                </div>
                <div>
                    <div style={{ fontWeight: 600, color: '#fff' }}>{user.name}</div>
                    <div style={{ fontSize: '0.8rem', color: '#666' }}>{user.email}</div>
                </div>
            </div>
        </td>
        <td>
            <span style={{
                padding: '0.25rem 0.75rem', borderRadius: '20px', fontSize: '0.7rem', fontWeight: 600,
                backgroundColor: roleColors[user.role].bg, color: roleColors[user.role].text
            }}>
                {user.role}
            </span>
        </td>
        <td style={{ color: '#888' }}>{user.hourlyRate ? `$${user.hourlyRate}/hr` : '-'}</td>
        <td>
            {user.assignedDriveFolderName ? (
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                    <span style={{ fontSize: '1rem' }}>📁</span>
                    <span style={{ color: '#888', fontSize: '0.85rem' }}>{user.assignedDriveFolderName}</span>
                </div>
            ) : (
                <button
                    onClick={() => onAssignFolder(user)}
                    style={{
                        background: 'none', border: '1px dashed var(--admin-border-color)',
                        borderRadius: '6px', padding: '0.25rem 0.5rem', color: '#666',
                        cursor: 'pointer', fontSize: '0.75rem'
                    }}
                >
                    + Assign Folder
                </button>
            )}
        </td>
        <td style={{ color: '#666', fontSize: '0.85rem' }}>
            {new Date(user.createdAt).toLocaleDateString()}
        </td>
        <td>
            <div style={{ display: 'flex', gap: '0.5rem' }}>
                <button onClick={() => onEdit(user)} className="admin-btn admin-btn-ghost" style={{ padding: '0.35rem' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7" />
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z" />
                    </svg>
                </button>
                <button onClick={() => onDelete(user.id)} className="admin-btn admin-btn-ghost" style={{ padding: '0.35rem', color: '#ef4444' }}>
                    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                        <polyline points="3 6 5 6 21 6" /><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2" />
                    </svg>
                </button>
            </div>
        </td>
    </tr>
);

// User Modal with Drive Folder Assignment
const UserModal: React.FC<{
    user: Partial<User> | null;
    onClose: () => void;
    onSave: (data: any) => void;
}> = ({ user, onClose, onSave }) => {
    const [formData, setFormData] = useState({
        name: user?.name || '',
        email: user?.email || '',
        role: user?.role || 'CLIENT',
        hourlyRate: user?.hourlyRate || '',
        password: '',
        assignedDriveFolderId: user?.assignedDriveFolderId || '',
        assignedDriveFolderName: user?.assignedDriveFolderName || '',
    });
    const [createNewFolder, setCreateNewFolder] = useState(false);

    const handleSubmit = () => {
        onSave({
            ...formData,
            hourlyRate: formData.hourlyRate ? parseFloat(formData.hourlyRate.toString()) : null,
            assignedDriveFolderId: formData.assignedDriveFolderId || null,
            assignedDriveFolderName: formData.assignedDriveFolderName || null,
        });
        onClose();
    };

    const inputStyle = {
        width: '100%', padding: '0.875rem', background: 'var(--admin-bg)',
        border: '1px solid var(--admin-border-color)', borderRadius: '10px', color: '#fff'
    };

    return (
        <div style={{
            position: 'fixed', inset: 0, backgroundColor: 'rgba(0,0,0,0.8)',
            display: 'flex', alignItems: 'center', justifyContent: 'center', zIndex: 1000, padding: '2rem'
        }}>
            <div style={{
                background: 'var(--admin-card-bg)', border: '1px solid var(--admin-border-color)',
                borderRadius: '20px', width: '100%', maxWidth: '550px', overflow: 'hidden', maxHeight: '90vh', overflowY: 'auto'
            }}>
                <div style={{ padding: '1.5rem', borderBottom: '1px solid var(--admin-border-color)', display: 'flex', justifyContent: 'space-between' }}>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 700, color: '#fff' }}>{user?.id ? 'Edit User' : 'Add User'}</h2>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#888', cursor: 'pointer', fontSize: '1.25rem' }}>✕</button>
                </div>
                <div style={{ padding: '1.5rem', display: 'grid', gap: '1rem' }}>
                    {/* Basic Info */}
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>Name</label>
                        <input type="text" value={formData.name} onChange={(e) => setFormData({ ...formData, name: e.target.value })} style={inputStyle} />
                    </div>
                    <div>
                        <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>Email</label>
                        <input type="email" value={formData.email} onChange={(e) => setFormData({ ...formData, email: e.target.value })} style={inputStyle} />
                    </div>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1rem' }}>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>Role</label>
                            <select value={formData.role} onChange={(e) => setFormData({ ...formData, role: e.target.value as any })} style={inputStyle}>
                                <option value="CLIENT">Client</option>
                                <option value="WORKER">Worker</option>
                                <option value="ADMIN">Admin</option>
                            </select>
                        </div>
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>Hourly Rate</label>
                            <input type="number" value={formData.hourlyRate} onChange={(e) => setFormData({ ...formData, hourlyRate: e.target.value })}
                                placeholder="$0.00" style={inputStyle} />
                        </div>
                    </div>
                    {!user?.id && (
                        <div>
                            <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>Password</label>
                            <input type="password" value={formData.password} onChange={(e) => setFormData({ ...formData, password: e.target.value })} style={inputStyle} />
                        </div>
                    )}

                    {/* Drive Folder Assignment */}
                    <div style={{ borderTop: '1px solid var(--admin-border-color)', paddingTop: '1rem', marginTop: '0.5rem' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '1rem' }}>
                            <span style={{ fontSize: '1.25rem' }}>📁</span>
                            <h3 style={{ fontSize: '1rem', fontWeight: 600, color: '#fff', margin: 0 }}>Google Drive Folder</h3>
                        </div>

                        <div style={{ display: 'flex', gap: '0.75rem', marginBottom: '1rem' }}>
                            <button
                                type="button"
                                onClick={() => setCreateNewFolder(false)}
                                style={{
                                    padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                    background: !createNewFolder ? 'var(--color-accent)' : 'var(--admin-hover-bg)',
                                    color: !createNewFolder ? '#000' : '#888', fontWeight: 500, fontSize: '0.85rem'
                                }}
                            >
                                Use Existing ID
                            </button>
                            <button
                                type="button"
                                onClick={() => setCreateNewFolder(true)}
                                style={{
                                    padding: '0.5rem 1rem', borderRadius: '8px', border: 'none', cursor: 'pointer',
                                    background: createNewFolder ? 'var(--color-accent)' : 'var(--admin-hover-bg)',
                                    color: createNewFolder ? '#000' : '#888', fontWeight: 500, fontSize: '0.85rem'
                                }}
                            >
                                Create New Folder
                            </button>
                        </div>

                        {createNewFolder ? (
                            <div>
                                <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>
                                    New Folder Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.assignedDriveFolderName}
                                    onChange={(e) => setFormData({ ...formData, assignedDriveFolderName: e.target.value, assignedDriveFolderId: '' })}
                                    placeholder="e.g., Client - Company Name"
                                    style={inputStyle}
                                />
                                <p style={{ fontSize: '0.75rem', color: '#666', marginTop: '0.5rem' }}>
                                    A new folder will be created in your Drive and shared with the user.
                                </p>
                            </div>
                        ) : (
                            <div style={{ display: 'grid', gap: '0.75rem' }}>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>
                                        Folder ID
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.assignedDriveFolderId}
                                        onChange={(e) => setFormData({ ...formData, assignedDriveFolderId: e.target.value })}
                                        placeholder="e.g., 1ABC-xyz123..."
                                        style={inputStyle}
                                    />
                                </div>
                                <div>
                                    <label style={{ display: 'block', fontSize: '0.85rem', fontWeight: 600, color: '#888', marginBottom: '0.5rem' }}>
                                        Folder Name (Display)
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.assignedDriveFolderName}
                                        onChange={(e) => setFormData({ ...formData, assignedDriveFolderName: e.target.value })}
                                        placeholder="e.g., Client Files"
                                        style={inputStyle}
                                    />
                                </div>
                            </div>
                        )}
                    </div>

                    {/* Google Status */}
                    {user?.id && (
                        <div style={{
                            display: 'flex', alignItems: 'center', gap: '0.75rem', padding: '0.75rem',
                            background: user.googleConnected ? 'rgba(34, 197, 94, 0.1)' : 'rgba(107, 114, 128, 0.1)',
                            borderRadius: '10px', border: `1px solid ${user.googleConnected ? 'rgba(34, 197, 94, 0.3)' : 'var(--admin-border-color)'}`
                        }}>
                            <span style={{ fontSize: '1.25rem' }}>
                                {user.googleConnected ? '✅' : '⚪'}
                            </span>
                            <div>
                                <p style={{ margin: 0, fontSize: '0.85rem', fontWeight: 500, color: user.googleConnected ? '#22c55e' : '#888' }}>
                                    {user.googleConnected ? 'Google Connected' : 'Google Not Connected'}
                                </p>
                                <p style={{ margin: 0, fontSize: '0.75rem', color: '#666' }}>
                                    {user.googleConnected ? 'User can access Gmail & Drive' : 'User needs to connect in Settings'}
                                </p>
                            </div>
                        </div>
                    )}
                </div>
                <div style={{ padding: '1rem 1.5rem', borderTop: '1px solid var(--admin-border-color)', display: 'flex', justifyContent: 'flex-end', gap: '0.75rem' }}>
                    <button onClick={onClose} className="admin-btn admin-btn-secondary">Cancel</button>
                    <button onClick={handleSubmit} className="admin-btn admin-btn-primary">Save</button>
                </div>
            </div>
        </div>
    );
};

// Main Users Page
const UsersPage: React.FC = () => {
    const [users, setUsers] = useState<User[]>([]);
    const [loading, setLoading] = useState(true);
    const [modalUser, setModalUser] = useState<Partial<User> | null>(null);
    const [showModal, setShowModal] = useState(false);
    const [showInviteModal, setShowInviteModal] = useState(false);
    const [stats, setStats] = useState({ total: 0, byRole: { admins: 0, workers: 0, clients: 0 } });

    useEffect(() => {
        fetchUsers();
        fetchStats();
    }, []);

    const fetchUsers = async () => {
        try {
            const response = await api.get('/users');
            setUsers(response.data);
        } catch (error) {
            console.error('Failed to fetch users:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const response = await api.get('/users/stats');
            setStats(response.data);
        } catch (error) {
            console.error('Failed to fetch stats:', error);
        }
    };

    const handleSave = async (data: any) => {
        try {
            if (modalUser?.id) {
                await api.put(`/users/${modalUser.id}`, data);
            } else {
                await api.post('/users', data);
            }
            fetchUsers();
            fetchStats();
        } catch (error) {
            console.error('Failed to save user:', error);
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm('Are you sure you want to delete this user?')) return;
        try {
            await api.delete(`/users/${id}`);
            fetchUsers();
            fetchStats();
        } catch (error) {
            console.error('Failed to delete user:', error);
        }
    };

    const handleAssignFolder = (user: User) => {
        setModalUser(user);
        setShowModal(true);
    };

    // No demo data - use real data only
    const displayUsers = users;
    const displayStats = stats.total > 0 ? stats : { total: users.length, byRole: { admins: 0, workers: 0, clients: 0 } };

    return (
        <div>
            <div className="admin-page-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                <div>
                    <h1 className="admin-page-title">Team & Users</h1>
                    <p className="admin-page-subtitle">Manage team members, client access, and Drive folders.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="admin-btn admin-btn-secondary" onClick={() => setShowInviteModal(true)}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2" />
                            <circle cx="8.5" cy="7" r="4" />
                            <line x1="20" y1="8" x2="20" y2="14" />
                            <line x1="23" y1="11" x2="17" y2="11" />
                        </svg>
                        Invite User
                    </button>
                    <button className="admin-btn admin-btn-primary" onClick={() => { setModalUser({}); setShowModal(true); }}>
                        <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                            <line x1="12" y1="5" x2="12" y2="19" /><line x1="5" y1="12" x2="19" y2="12" />
                        </svg>
                        Add User
                    </button>
                </div>
            </div>

            {/* Stats */}
            <div className="admin-grid admin-grid-4" style={{ marginBottom: '2rem' }}>
                <div className="admin-card" style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Total Users</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#fff' }}>{displayStats.total}</p>
                </div>
                <div className="admin-card" style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Admins</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: 'var(--color-accent)' }}>{displayStats.byRole.admins}</p>
                </div>
                <div className="admin-card" style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Workers</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#3b82f6' }}>{displayStats.byRole.workers}</p>
                </div>
                <div className="admin-card" style={{ textAlign: 'center' }}>
                    <p style={{ fontSize: '0.8rem', color: '#666', marginBottom: '0.25rem' }}>Clients</p>
                    <p style={{ fontSize: '1.5rem', fontWeight: 700, color: '#888' }}>{displayStats.byRole.clients}</p>
                </div>
            </div>

            {/* Users Table */}
            <div className="admin-card" style={{ padding: 0, overflow: 'hidden' }}>
                <table className="admin-table">
                    <thead>
                        <tr>
                            <th>User</th>
                            <th>Role</th>
                            <th>Rate</th>
                            <th>Drive Folder</th>
                            <th>Joined</th>
                            <th>Actions</th>
                        </tr>
                    </thead>
                    <tbody>
                        {loading ? (
                            <tr><td colSpan={6} style={{ textAlign: 'center', padding: '2rem' }}>Loading...</td></tr>
                        ) : (
                            displayUsers.map(user => (
                                <UserRow
                                    key={user.id}
                                    user={user}
                                    onEdit={(u) => { setModalUser(u); setShowModal(true); }}
                                    onDelete={handleDelete}
                                    onAssignFolder={handleAssignFolder}
                                />
                            ))
                        )}
                    </tbody>
                </table>
            </div>

            {showModal && <UserModal user={modalUser} onClose={() => setShowModal(false)} onSave={handleSave} />}
            <InviteUserModal isOpen={showInviteModal} onClose={() => setShowInviteModal(false)} onSuccess={() => fetchUsers()} />
        </div>
    );
};

export default UsersPage;
