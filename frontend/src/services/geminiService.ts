import { api } from './api';

export const geminiService = {
    /**
     * Generates a "gemified" version of an image using Gemini AI.
     * This follows the Brandistry aesthetic: crystal, glow, and premium polish.
     */
    generateGemifiedImage: async (originalImageUrl: string): Promise<string | null> => {
        try {
            const prompt = `Transform this image into a 'Gemified' version. Apply a crystal-like texture, neon prism lighting, and high-fidelity 3D depth. The aesthetic should be 'Futuristic Luxury'. Original image context: Image provided.`;

            const response = await api.post('/iris/chat', {
                message: `/image ${prompt}`,
                imageUrl: originalImageUrl
            });

            if (response.data && response.data.generatedImage) {
                return response.data.generatedImage;
            }
            return null;
        } catch (error) {
            console.error('Failed to gemify image:', error);
            return null;
        }
    }
};

export default geminiService;
