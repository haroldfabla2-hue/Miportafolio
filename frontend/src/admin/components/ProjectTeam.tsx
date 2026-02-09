import React, { useState } from 'react';

interface TeamMember {
    id: string;
    name: string;
    role: string;
    avatar?: string;
}

interface ProjectTeamProps {
    members: TeamMember[];
}

const ProjectTeam: React.FC<ProjectTeamProps> = ({ members = [] }) => {
    const [searchTerm, setSearchTerm] = useState('');

    const filteredMembers = members.filter(m =>
        m.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        m.role.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: '1rem', alignItems: 'center' }}>
                <h3 style={{ margin: 0 }}>Team Members</h3>
                <div style={{ display: 'flex', gap: '1rem' }}>
                    <div style={{ position: 'relative' }}>
                        <input
                            type="text"
                            placeholder="Search members..."
                            value={searchTerm}
                            onChange={(e) => setSearchTerm(e.target.value)}
                            style={{
                                background: 'rgba(255,255,255,0.05)',
                                border: '1px solid rgba(255,255,255,0.1)',
                                borderRadius: '4px',
                                padding: '0.5rem 1rem',
                                color: '#fff',
                                width: '200px'
                            }}
                        />
                    </div>
                    <button className="admin-btn admin-btn-primary">+ Add Member</button>
                </div>
            </div>

            {filteredMembers.length === 0 ? (
                <div className="admin-card" style={{ padding: '3rem', textAlign: 'center' }}>
                    <p style={{ color: '#888' }}>No team members assigned to this project yet.</p>
                </div>
            ) : (
                <div className="admin-grid" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))' }}>
                    {filteredMembers.map(member => (
                        <div key={member.id} className="admin-card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                            <img
                                src={member.avatar || `https://api.dicebear.com/7.x/avataaars/svg?seed=${member.name}`}
                                alt={member.name}
                                style={{ width: '48px', height: '48px', borderRadius: '50%', objectFit: 'cover' }}
                            />
                            <div>
                                <h4 style={{ margin: '0 0 0.25rem 0' }}>{member.name}</h4>
                                <span style={{
                                    fontSize: '0.75rem',
                                    background: 'rgba(255,255,255,0.1)',
                                    padding: '0.2rem 0.5rem',
                                    borderRadius: '12px',
                                    color: '#ccc'
                                }}>
                                    {member.role}
                                </span>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default ProjectTeam;
