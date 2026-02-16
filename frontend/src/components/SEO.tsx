import React, { useEffect } from 'react';

interface SEOProps {
    title: string;
    description: string;
}

const SEO: React.FC<SEOProps> = ({ title, description }) => {
    useEffect(() => {
        document.title = `${title} | MiWeb Agency OS`;
        const metaDesc = document.querySelector('meta[name="description"]');
        if (metaDesc) {
            metaDesc.setAttribute('content', description);
        } else {
            const meta = document.createElement('meta');
            meta.name = 'description';
            meta.content = description;
            document.head.appendChild(meta);
        }
    }, [title, description]);

    return null;
};

export default SEO;
