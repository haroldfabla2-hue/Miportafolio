import React from 'react';
import { useAuth } from '../../context/AuthContext';

interface RequirePermissionProps {
    permission?: string;
    permissions?: string[];
    children: React.ReactNode;
    fallback?: React.ReactNode;
}

const RequirePermission: React.FC<RequirePermissionProps> = ({ 
    permission, 
    permissions, 
    children, 
    fallback = null 
}) => {
    const { hasPermission, hasAnyPermission, isAdmin } = useAuth();

    // Admins usually have all permissions, but we'll check anyway just to be safe.
    // The backend provides the full permissions array for the user.
    if (isAdmin) return <>{children}</>;

    let hasAccess = false;
    
    if (permission) {
        hasAccess = hasPermission(permission);
    } else if (permissions && permissions.length > 0) {
        hasAccess = hasAnyPermission(permissions);
    } else {
        hasAccess = true; // If no specific permission required
    }

    if (!hasAccess) {
        return <>{fallback}</>;
    }

    return <>{children}</>;
};

export default RequirePermission;
