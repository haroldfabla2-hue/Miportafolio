import api from './api';

export interface EmailMessage {
    id: string;
    threadId: string;
    labelIds: string[];
    snippet: string;
    payload: {
        headers: { name: string; value: string }[];
        body: { data: string };
        parts?: { mimeType: string; body: { data: string } }[];
    };
    internalDate: string;
}

export interface EmailThread {
    id: string;
    snippet: string;
    messages: EmailMessage[];
}

export const gmailService = {
    /**
     * List messages/threads from Gmail
     */
    listThreads: async (maxResults = 20, q?: string) => {
        try {
            const response = await api.get('/google/gmail/threads', {
                params: { maxResults, q }
            });
            return response.data;
        } catch (error) {
            console.error('Error listing threads:', error);
            throw error;
        }
    },

    /**
     * Get a specific thread
     */
    getThread: async (threadId: string) => {
        try {
            const response = await api.get(`/google/gmail/threads/${threadId}`);
            return response.data;
        } catch (error) {
            console.error('Error getting thread:', error);
            throw error;
        }
    },

    /**
     * Send an email
     */
    sendEmail: async (to: string, subject: string, body: string, attachments?: File[]) => {
        try {
            const formData = new FormData();
            formData.append('to', to);
            formData.append('subject', subject);
            formData.append('body', body);

            if (attachments) {
                attachments.forEach(file => {
                    formData.append('attachments', file);
                });
            }

            const response = await api.post('/google/gmail/send', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error sending email:', error);
            throw error;
        }
    },

    /**
     * Reply to an email
     */
    reply: async (threadId: string, messageId: string, body: string, all: boolean = false) => {
        try {
            const response = await api.post(`/google/gmail/threads/${threadId}/reply`, {
                messageId,
                body,
                replyAll: all
            });
            return response.data;
        } catch (error) {
            console.error('Error replying to email:', error);
            throw error;
        }
    },

    /**
     * Mark as read/unread/archived
     */
    modifyThread: async (threadId: string, addLabels: string[], removeLabels: string[]) => {
        try {
            const response = await api.post(`/google/gmail/threads/${threadId}/modify`, {
                addLabels,
                removeLabels
            });
            return response.data;
        } catch (error) {
            console.error('Error modifying thread:', error);
            throw error;
        }
    },

    /**
     * Check connection status
     */
    checkStatus: async () => {
        try {
            const response = await api.get('/google/status');
            return response.data; // { connected: boolean, email: string }
        } catch (error) {
            return { connected: false };
        }
    },

    /**
     * Init OAuth flow
     */
    connect: () => {
        window.location.href = `${api.defaults.baseURL}/auth/google/connect?redirect=${window.location.origin}/admin/email`;
    }
};
