import React from 'react';
import { Folder, Users, CheckSquare, PieChart, Search, Box, Plus, FileText, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

type EmptyStateType = 'project' | 'client' | 'task' | 'finance' | 'search' | 'generic' | 'invoice';

interface EmptyStateProps {
    type?: EmptyStateType;
    title: string;
    description: string;
    actionLabel?: string;
    onAction?: () => void;
    actionLink?: string;
    secondaryAction?: {
        label: string;
        link?: string;
        onClick?: () => void;
    };
}

const EmptyState: React.FC<EmptyStateProps> = ({
    type = 'generic',
    title,
    description,
    actionLabel,
    onAction,
    actionLink,
    secondaryAction
}) => {
    // Icon mapping
    const getIcon = () => {
        const props = { size: 32, strokeWidth: 1.5 };
        switch (type) {
            case 'project': return <Folder {...props} />;
            case 'client': return <Users {...props} />;
            case 'task': return <CheckSquare {...props} />;
            case 'finance': return <PieChart {...props} />;
            case 'invoice': return <FileText {...props} />;
            case 'search': return <Search {...props} />;
            case 'generic': default: return <Box {...props} />;
        }
    };

    return (
        <div className="admin-empty-state">
            <div className="admin-empty-icon">
                {getIcon()}
            </div>
            <h3 className="admin-empty-title">{title}</h3>
            <p className="admin-empty-desc">{description}</p>

            <div className="admin-empty-actions">
                {(actionLabel && (onAction || actionLink)) && (
                    actionLink ? (
                        <Link to={actionLink} className="admin-btn admin-btn-primary">
                            <Plus size={18} />
                            {actionLabel}
                        </Link>
                    ) : (
                        <button onClick={onAction} className="admin-btn admin-btn-primary">
                            <Plus size={18} />
                            {actionLabel}
                        </button>
                    )
                )}

                {(secondaryAction && (secondaryAction.onClick || secondaryAction.link)) && (
                    secondaryAction.link ? (
                        <Link to={secondaryAction.link} className="admin-btn admin-btn-ghost">
                            {secondaryAction.label} <ArrowRight size={16} style={{ marginLeft: '4px' }} />
                        </Link>
                    ) : (
                        <button onClick={secondaryAction.onClick} className="admin-btn admin-btn-ghost">
                            {secondaryAction.label} <ArrowRight size={16} style={{ marginLeft: '4px' }} />
                        </button>
                    )
                )}
            </div>
        </div>
    );
};

export default EmptyState;
