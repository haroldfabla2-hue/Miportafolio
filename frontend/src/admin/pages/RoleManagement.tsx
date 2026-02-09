import React, { useState, useEffect } from 'react';
import api from '../../services/api';
import { useAuth } from '../../context/AuthContext';

interface Permission {
    id: string;
    code: string;
    name: string;
    description: string;
    category: string;
}

interface WorkerRole {
    id: string;
    name: string;
    description: string;
    color: string;
    isSystem: boolean;
    permissions: { permission: Permission }[];
    _count?: { users: number };
}

const RoleManagement: React.FC = () => {
    const { hasPermission } = useAuth();
    const [roles, setRoles] = useState<WorkerRole[]>([]);
    const [permissions, setPermissions] = useState<Record<string, Permission[]>>({});
    const [selectedRole, setSelectedRole] = useState<WorkerRole | null>(null);
    const [isEditing, setIsEditing] = useState(false);
    const [isCreating, setIsCreating] = useState(false);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);

    // Form state
    const [formName, setFormName] = useState('');
    const [formDescription, setFormDescription] = useState('');
    const [formColor, setFormColor] = useState('#6366f1');
    const [formPermissions, setFormPermissions] = useState<string[]>([]);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            const [rolesRes, permsRes] = await Promise.all([
                api.get('/worker-roles'),
                api.get('/permissions/grouped'),
            ]);
            setRoles(rolesRes.data);
            setPermissions(permsRes.data);
        } catch (error) {
            console.error('Error fetching data:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleSelectRole = (role: WorkerRole) => {
        setSelectedRole(role);
        setFormName(role.name);
        setFormDescription(role.description || '');
        setFormColor(role.color);
        setFormPermissions(role.permissions.map(p => p.permission.code));
        setIsEditing(false);
        setIsCreating(false);
    };

    const handleCreateNew = () => {
        setSelectedRole(null);
        setFormName('');
        setFormDescription('');
        setFormColor('#6366f1');
        setFormPermissions([]);
        setIsCreating(true);
        setIsEditing(true);
    };

    const handleTogglePermission = (code: string) => {
        setFormPermissions(prev =>
            prev.includes(code)
                ? prev.filter(p => p !== code)
                : [...prev, code]
        );
    };

    const handleToggleCategory = (category: string) => {
        const categoryPerms = permissions[category].map(p => p.code);
        const allSelected = categoryPerms.every(code => formPermissions.includes(code));

        if (allSelected) {
            setFormPermissions(prev => prev.filter(p => !categoryPerms.includes(p)));
        } else {
            setFormPermissions(prev => [...new Set([...prev, ...categoryPerms])]);
        }
    };

    const handleSave = async () => {
        if (!formName.trim()) return;

        setSaving(true);
        try {
            const data = {
                name: formName,
                description: formDescription,
                color: formColor,
                permissionCodes: formPermissions,
            };

            if (isCreating) {
                await api.post('/worker-roles', data);
            } else if (selectedRole) {
                await api.put(`/worker-roles/${selectedRole.id}`, data);
            }

            await fetchData();
            setIsEditing(false);
            setIsCreating(false);
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error saving role');
        } finally {
            setSaving(false);
        }
    };

    const handleDelete = async () => {
        if (!selectedRole || selectedRole.isSystem) return;

        if (!confirm(`Are you sure you want to delete "${selectedRole.name}"?`)) return;

        try {
            await api.delete(`/worker-roles/${selectedRole.id}`);
            setSelectedRole(null);
            await fetchData();
        } catch (error: any) {
            alert(error.response?.data?.message || 'Error deleting role');
        }
    };

    if (!hasPermission('roles:manage')) {
        return (
            <div style={{ padding: '2rem', color: '#888', textAlign: 'center' }}>
                <h2>Access Denied</h2>
                <p>You don't have permission to manage roles.</p>
            </div>
        );
    }

    if (loading) {
        return <div style={{ padding: '2rem', color: '#fff' }}>Loading...</div>;
    }

    return (
        <div style={{ padding: '1.5rem', color: '#fff' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <div>
                    <h1 style={{ fontSize: '1.75rem', fontWeight: 700, marginBottom: '0.25rem' }}>Role Management</h1>
                    <p style={{ color: '#888', fontSize: '0.9rem' }}>Create and manage worker roles with custom permissions</p>
                </div>
                <button
                    onClick={handleCreateNew}
                    style={{
                        background: 'var(--color-accent)',
                        color: '#000',
                        border: 'none',
                        padding: '0.75rem 1.5rem',
                        borderRadius: '8px',
                        fontWeight: 600,
                        cursor: 'pointer',
                    }}
                >
                    + Create Role
                </button>
            </div>

            <div style={{ display: 'grid', gridTemplateColumns: '300px 1fr', gap: '1.5rem' }}>
                {/* Roles List */}
                <div style={{ background: 'var(--admin-card-bg)', borderRadius: '12px', padding: '1rem', border: '1px solid var(--admin-border-color)' }}>
                    <h3 style={{ fontSize: '0.875rem', color: '#888', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Roles</h3>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                        {roles.map(role => (
                            <div
                                key={role.id}
                                onClick={() => handleSelectRole(role)}
                                style={{
                                    padding: '0.75rem 1rem',
                                    borderRadius: '8px',
                                    cursor: 'pointer',
                                    background: selectedRole?.id === role.id ? 'rgba(99, 102, 241, 0.15)' : 'transparent',
                                    border: selectedRole?.id === role.id ? '1px solid rgba(99, 102, 241, 0.3)' : '1px solid transparent',
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: '0.75rem',
                                    transition: 'all 0.2s',
                                }}
                            >
                                <div
                                    style={{
                                        width: '12px',
                                        height: '12px',
                                        borderRadius: '50%',
                                        background: role.color,
                                        flexShrink: 0,
                                    }}
                                />
                                <div style={{ flex: 1 }}>
                                    <div style={{ fontWeight: 600, fontSize: '0.9rem' }}>{role.name}</div>
                                    <div style={{ color: '#666', fontSize: '0.75rem' }}>
                                        {role._count?.users || 0} users • {role.permissions.length} permissions
                                    </div>
                                </div>
                                {role.isSystem && (
                                    <span style={{ fontSize: '0.65rem', background: 'rgba(255,255,255,0.1)', padding: '0.2rem 0.5rem', borderRadius: '4px', color: '#888' }}>
                                        System
                                    </span>
                                )}
                            </div>
                        ))}
                    </div>
                </div>

                {/* Role Details / Editor */}
                <div style={{ background: 'var(--admin-card-bg)', borderRadius: '12px', padding: '1.5rem', border: '1px solid var(--admin-border-color)' }}>
                    {!selectedRole && !isCreating ? (
                        <div style={{ textAlign: 'center', color: '#666', padding: '3rem' }}>
                            Select a role to view details or create a new one
                        </div>
                    ) : (
                        <>
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                                <div style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                                    {isEditing ? (
                                        <input
                                            type="color"
                                            value={formColor}
                                            onChange={e => setFormColor(e.target.value)}
                                            style={{ width: '40px', height: '40px', border: 'none', borderRadius: '8px', cursor: 'pointer' }}
                                        />
                                    ) : (
                                        <div style={{ width: '40px', height: '40px', borderRadius: '8px', background: formColor }} />
                                    )}
                                    <div>
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formName}
                                                onChange={e => setFormName(e.target.value)}
                                                placeholder="Role name"
                                                style={{
                                                    background: 'var(--admin-bg)',
                                                    border: '1px solid var(--admin-border-color)',
                                                    borderRadius: '6px',
                                                    padding: '0.5rem 0.75rem',
                                                    color: '#fff',
                                                    fontSize: '1.25rem',
                                                    fontWeight: 700,
                                                    width: '300px',
                                                }}
                                            />
                                        ) : (
                                            <h2 style={{ fontSize: '1.25rem', fontWeight: 700 }}>{formName}</h2>
                                        )}
                                        {isEditing ? (
                                            <input
                                                type="text"
                                                value={formDescription}
                                                onChange={e => setFormDescription(e.target.value)}
                                                placeholder="Description (optional)"
                                                style={{
                                                    background: 'var(--admin-bg)',
                                                    border: '1px solid var(--admin-border-color)',
                                                    borderRadius: '6px',
                                                    padding: '0.4rem 0.75rem',
                                                    color: '#888',
                                                    fontSize: '0.85rem',
                                                    width: '300px',
                                                    marginTop: '0.5rem',
                                                }}
                                            />
                                        ) : (
                                            <p style={{ color: '#888', fontSize: '0.85rem' }}>{formDescription || 'No description'}</p>
                                        )}
                                    </div>
                                </div>

                                <div style={{ display: 'flex', gap: '0.5rem' }}>
                                    {isEditing ? (
                                        <>
                                            <button
                                                onClick={() => { setIsEditing(false); setIsCreating(false); if (selectedRole) handleSelectRole(selectedRole); }}
                                                style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid var(--admin-border-color)', background: 'transparent', color: '#888', cursor: 'pointer' }}
                                            >
                                                Cancel
                                            </button>
                                            <button
                                                onClick={handleSave}
                                                disabled={saving || !formName.trim()}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '6px',
                                                    border: 'none',
                                                    background: 'var(--color-accent)',
                                                    color: '#000',
                                                    fontWeight: 600,
                                                    cursor: saving ? 'not-allowed' : 'pointer',
                                                    opacity: saving ? 0.7 : 1,
                                                }}
                                            >
                                                {saving ? 'Saving...' : 'Save'}
                                            </button>
                                        </>
                                    ) : (
                                        <>
                                            <button
                                                onClick={() => setIsEditing(true)}
                                                disabled={selectedRole?.isSystem}
                                                style={{
                                                    padding: '0.5rem 1rem',
                                                    borderRadius: '6px',
                                                    border: '1px solid var(--admin-border-color)',
                                                    background: 'transparent',
                                                    color: selectedRole?.isSystem ? '#555' : '#fff',
                                                    cursor: selectedRole?.isSystem ? 'not-allowed' : 'pointer',
                                                }}
                                            >
                                                Edit
                                            </button>
                                            {!selectedRole?.isSystem && (
                                                <button
                                                    onClick={handleDelete}
                                                    style={{ padding: '0.5rem 1rem', borderRadius: '6px', border: '1px solid #ef4444', background: 'transparent', color: '#ef4444', cursor: 'pointer' }}
                                                >
                                                    Delete
                                                </button>
                                            )}
                                        </>
                                    )}
                                </div>
                            </div>

                            {/* Permissions Grid */}
                            <h3 style={{ fontSize: '0.875rem', color: '#888', marginBottom: '1rem', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Permissions ({formPermissions.length} selected)
                            </h3>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))', gap: '1rem' }}>
                                {Object.entries(permissions).map(([category, perms]) => {
                                    const allSelected = perms.every(p => formPermissions.includes(p.code));
                                    const someSelected = perms.some(p => formPermissions.includes(p.code));

                                    return (
                                        <div key={category} style={{ background: 'var(--admin-bg)', borderRadius: '8px', padding: '1rem', border: '1px solid var(--admin-border-color)' }}>
                                            <div
                                                style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.75rem', cursor: isEditing ? 'pointer' : 'default' }}
                                                onClick={() => isEditing && handleToggleCategory(category)}
                                            >
                                                <input
                                                    type="checkbox"
                                                    checked={allSelected}
                                                    ref={el => { if (el) el.indeterminate = someSelected && !allSelected; }}
                                                    onChange={() => { }}
                                                    disabled={!isEditing}
                                                    style={{ cursor: isEditing ? 'pointer' : 'default' }}
                                                />
                                                <span style={{ fontWeight: 600, fontSize: '0.9rem' }}>{category}</span>
                                            </div>
                                            <div style={{ display: 'flex', flexDirection: 'column', gap: '0.4rem', paddingLeft: '1.5rem' }}>
                                                {perms.map(perm => (
                                                    <label
                                                        key={perm.id}
                                                        style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', cursor: isEditing ? 'pointer' : 'default', color: '#aaa', fontSize: '0.85rem' }}
                                                    >
                                                        <input
                                                            type="checkbox"
                                                            checked={formPermissions.includes(perm.code)}
                                                            onChange={() => handleTogglePermission(perm.code)}
                                                            disabled={!isEditing}
                                                            style={{ cursor: isEditing ? 'pointer' : 'default' }}
                                                        />
                                                        {perm.name}
                                                    </label>
                                                ))}
                                            </div>
                                        </div>
                                    );
                                })}
                            </div>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
};

export default RoleManagement;
