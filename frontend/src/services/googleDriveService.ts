import api from './api';

export interface DriveFile {
    id: string;
    name: string;
    mimeType: string;
    webViewLink: string;
    iconLink: string;
    thumbnailLink?: string;
    modifiedTime: string;
    parents: string[];
}

export const googleDriveService = {
    /**
     * List files from Google Drive
     */
    listFiles: async (folderId?: string, q?: string) => {
        try {
            const response = await api.get('/google/drive/files', {
                params: { folderId, q }
            });
            return response.data;
        } catch (error) {
            console.error('Error listing files:', error);
            throw error;
        }
    },

    /**
     * Upload a file
     */
    uploadFile: async (file: File, folderId?: string) => {
        try {
            const formData = new FormData();
            formData.append('file', file);
            if (folderId) {
                formData.append('folderId', folderId);
            }

            const response = await api.post('/google/drive/upload', formData, {
                headers: {
                    'Content-Type': 'multipart/form-data'
                }
            });
            return response.data;
        } catch (error) {
            console.error('Error uploading file:', error);
            throw error;
        }
    },

    /**
     * Create a folder
     */
    createFolder: async (name: string, parentId?: string) => {
        try {
            const response = await api.post('/google/drive/folders', {
                name,
                parentId
            });
            return response.data;
        } catch (error) {
            console.error('Error creating folder:', error);
            throw error;
        }
    },

    /**
     * Delete a file
     */
    deleteFile: async (fileId: string) => {
        try {
            const response = await api.delete(`/google/drive/files/${fileId}`);
            return response.data;
        } catch (error) {
            console.error('Error deleting file:', error);
            throw error;
        }
    }
};
