// Core Data Models
// Adapted from Brandistry types for consistent frontend structure

// Using const objects instead of enums for extensive compatibility (erasableSyntaxOnly safe)

export const UserRole = {
    SUPER_ADMIN: 'SUPER_ADMIN',
    ADMIN: 'ADMIN',
    WORKER: 'WORKER',
    CLIENT: 'CLIENT'
} as const;
export type UserRole = typeof UserRole[keyof typeof UserRole];

export const ProjectStatus = {
    PLANNING: 'PLANNING',
    ACTIVE: 'ACTIVE',
    REVIEW: 'REVIEW',
    COMPLETED: 'COMPLETED',
    ON_HOLD: 'ON_HOLD'
} as const;
export type ProjectStatus = typeof ProjectStatus[keyof typeof ProjectStatus];

export const TaskStatus = {
    TODO: 'TODO',
    IN_PROGRESS: 'IN_PROGRESS',
    REVIEW: 'REVIEW',
    DONE: 'DONE'
} as const;
export type TaskStatus = typeof TaskStatus[keyof typeof TaskStatus];

export const AssetStatus = {
    DRAFT: 'DRAFT',
    PENDING_REVIEW: 'PENDING_REVIEW',
    CHANGES_REQUESTED: 'CHANGES_REQUESTED',
    APPROVED: 'APPROVED',
    DELIVERED: 'DELIVERED',
    REJECTED: 'REJECTED'
} as const;
export type AssetStatus = typeof AssetStatus[keyof typeof AssetStatus];

export const AssetType = {
    IMAGE: 'IMAGE',
    VIDEO: 'VIDEO',
    DOCUMENT: 'DOCUMENT',
    SPREADSHEET: 'SPREADSHEET',
    PRESENTATION: 'PRESENTATION',
    AUDIO: 'AUDIO',
    ARCHIVE: 'ARCHIVE'
} as const;
export type AssetType = typeof AssetType[keyof typeof AssetType];

export const LeadStatus = {
    NEW: 'NEW',
    CONTACTED: 'CONTACTED',
    QUALIFIED: 'QUALIFIED',
    PROPOSAL: 'PROPOSAL',
    NEGOTIATION: 'NEGOTIATION',
    WON: 'WON',
    LOST: 'LOST'
} as const;
export type LeadStatus = typeof LeadStatus[keyof typeof LeadStatus];

export const EventType = {
    MEETING: 'MEETING',
    DEADLINE: 'DEADLINE',
    REMINDER: 'REMINDER',
    CALL: 'CALL',
    PROJECT_MILESTONE: 'PROJECT_MILESTONE'
} as const;
export type EventType = typeof EventType[keyof typeof EventType];

export interface CalendarEvent {
    id: string;
    title: string;
    description?: string;
    startTime: string;
    endTime: string;
    allDay: boolean;
    type: EventType;
    color?: string;
    projectId?: string;
    project?: { id: string; name: string };
    clientId?: string;
    client?: { id: string; company: string };
    createdById: string;
    createdBy: { id: string; name: string; avatar?: string };
    createdAt: string;
    updatedAt: string;
}

export interface User {
    id: string;
    name: string;
    email: string;
    role: UserRole | string; // Allow string for flexibility with AuthSystem
    avatar: string;
    company?: string;
    specialty?: string;
    assignedProjectIds?: string[];
    assignedClientIds?: string[];
    // AuthContext compatibility
    googleConnected?: boolean;
    onboardingCompleted?: boolean;
    permissions?: string[];
    workerRole?: {
        id: string;
        name: string;
        color: string;
    };
}

export interface Client {
    id: string;
    name: string;
    email: string; // Primary contact email
    companyName: string;
    industry?: string;
    status: 'ACTIVE' | 'INACTIVE' | 'LEAD';
    totalRevenue?: number;
    projectCount?: number;
    avatar?: string;
}

export interface Project {
    id: string;
    name: string;
    description: string;
    clientId: string;
    clientName?: string; // Denormalized for ease
    status: ProjectStatus;
    startDate: string;
    endDate?: string;
    budget: number;
    spent?: number;
    progress: number;
    thumbnail?: string;
    teamIds?: string[];
    tags?: string[];
}

export interface Task {
    id: string;
    title: string;
    description?: string;
    status: TaskStatus;
    priority: 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';
    projectId: string;
    assigneeId?: string;
    assignee?: User; // Expanded
    creatorId: string;
    dueDate?: string;
    createdAt: string;
    dependencies?: string[]; // IDs of tasks that must be done first
    tags?: string[];
}

export interface Asset {
    id: string;
    title: string;
    type: AssetType;
    url: string; // S3 or local URL
    status: AssetStatus;
    projectId: string;
    uploaderId: string;
    version: number;
    size?: number; // In bytes
    mimeType?: string;
    createdAt: string;
    updatedAt: string;
}

export interface Lead {
    id: string;
    name: string;
    email: string;
    company?: string;
    phone?: string;
    source?: string;
    status: LeadStatus;
    value: number;
    notes?: string;
    assignedToId?: string;
    assignedTo?: { id: string; name: string; avatar?: string };
    createdAt: string;
    updatedAt: string;
}

// -- Utility Types --

export interface ApiResponse<T> {
    data: T;
    message?: string;
    success: boolean;
}

export interface PaginatedResponse<T> {
    items: T[];
    total: number;
    page: number;
    pageSize: number;
    totalPages: number;
}
