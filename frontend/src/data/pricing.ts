export const pricingFallback = [
    {
        id: 'plan-esencial',
        slug: 'plan-esencial',
        type: 'PRICING',
        title: 'Esencial',
        content: 'Ideal para negocios locales y profesionales que necesitan presencia web confiable.',
        status: 'PUBLISHED',
        metadata: {
            price: '$800 USD',
            badge: 'One-page',
            popular: false,
            features: ['Landing Page (One-page)', 'Diseño Responsivo', 'Formulario de Contacto', 'Optimización Básica SEO', '1 Revisión'],
            i18n: {
                en: {
                    title: 'Essential',
                    content: 'Ideal for local businesses and professionals needing a reliable web presence.',
                    badge: 'One-page',
                    price: '$800 USD',
                    features: ['Landing Page (One-page)', 'Responsive Design', 'Contact Form', 'Basic SEO Optimization', '1 Revision']
                }
            }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'plan-profesional',
        slug: 'plan-profesional',
        type: 'PRICING',
        title: 'Profesional',
        content: 'Para empresas en crecimiento que requieren un embudo de ventas y CMS.',
        status: 'PUBLISHED',
        metadata: {
            price: '$1,500 USD',
            badge: 'Multi-page',
            popular: true,
            features: ['Hasta 5 Páginas', 'Panel Autoadministrable (CMS)', 'Integración con CRM', 'Optimización SEO Avanzada', '2 Revisiones'],
            i18n: {
                en: {
                    title: 'Professional',
                    content: 'For growing companies requiring a sales funnel and CMS.',
                    badge: 'Multi-page',
                    price: '$1,500 USD',
                    features: ['Up to 5 Pages', 'Self-managed Panel (CMS)', 'CRM Integration', 'Advanced SEO Optimization', '2 Revisions']
                }
            }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    },
    {
        id: 'plan-corporativo',
        slug: 'plan-corporativo',
        type: 'PRICING',
        title: 'Corporativo',
        content: 'Desarrollo a medida con integraciones complejas e IA.',
        status: 'PUBLISHED',
        metadata: {
            price: 'Desde $3,500 USD',
            badge: 'Full Stack',
            popular: false,
            features: ['Múltiples Páginas Ilimitadas', 'Web App / Plataforma a medida', 'Automatizaciones e IA', 'Pasarelas de Pago', 'Soporte Prioritario'],
            i18n: {
                en: {
                    title: 'Corporate',
                    content: 'Custom development with complex integrations and AI.',
                    badge: 'Full Stack',
                    price: 'From $3,500 USD',
                    features: ['Unlimited Pages', 'Custom Web App / Platform', 'Automations & AI', 'Payment Gateways', 'Priority Support']
                }
            }
        },
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
    }
] as any[];
