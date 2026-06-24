import React from 'react';
import { Helmet } from 'react-helmet-async';
import { useTranslation } from 'react-i18next';

interface SEOProps {
    titleKey?: string;
    titleDefault?: string;
    descriptionKey?: string;
    descriptionDefault?: string;
    title?: string;
    description?: string;
    canonicalPath?: string;
    schemaMarkup?: object;
}

const SEO: React.FC<SEOProps> = ({
    titleKey,
    titleDefault = 'Alberto Farah | Agency OS',
    descriptionKey,
    descriptionDefault = 'Elite Software Engineering & AI solutions agency.',
    title: titleProp,
    description: descriptionProp,
    canonicalPath,
    schemaMarkup
}) => {
    const { t, i18n } = useTranslation();

    const title = titleKey ? t(titleKey) : (titleProp || titleDefault);
    const description = descriptionKey ? t(descriptionKey) : (descriptionProp || descriptionDefault);
    const currentLang = i18n.language || 'en';
    const canonicalUrl = `https://albertofarah.com${canonicalPath || window.location.pathname}`;

    return (
        <Helmet>
            <html lang={currentLang} />
            <title>{title}</title>
            <meta name="description" content={description} />
            <link rel="canonical" href={canonicalUrl} />

            {/* Open Graph */}
            <meta property="og:title" content={title} />
            <meta property="og:description" content={description} />
            <meta property="og:url" content={canonicalUrl} />
            <meta property="og:type" content="website" />

            {/* Twitter */}
            <meta property="twitter:title" content={title} />
            <meta property="twitter:description" content={description} />
            <meta property="twitter:url" content={canonicalUrl} />

            {schemaMarkup && (
                <script type="application/ld+json">
                    {JSON.stringify(schemaMarkup)}
                </script>
            )}
        </Helmet>
    );
};

export default SEO;
