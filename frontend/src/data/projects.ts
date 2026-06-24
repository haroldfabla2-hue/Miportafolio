export interface Project {
    title: string;
    year: string;
    url: string;
    image: string;
    description: string;
    role: string;
    services: string[];
    translations?: {
        es?: {
            title?: string;
            description?: string;
            role?: string;
            services?: string[];
        };
        en?: {
            title?: string;
            description?: string;
            role?: string;
            services?: string[];
        }
    };
}

export const projects: Project[] = [
    {
        title: "Nuestras Casas",
        year: "2024",
        url: "https://nuestrascasasaqp.com/",
        image: "/projects/project-1.png",
        description: "A modern real estate platform designed to showcase premium properties in Arequipa. The interface focuses on high-quality imagery and seamless navigation to enhance the user's journey from discovery to contact.",
        role: "Lead Designer & Developer",
        services: ["UX/UI Design", "Frontend Development"],
        translations: {
            es: {
                title: "Nuestras Casas",
                description: "Una plataforma inmobiliaria moderna diseñada para mostrar propiedades exclusivas en Arequipa. La interfaz se centra en imágenes de alta calidad y una navegación fluida para mejorar la experiencia del usuario desde el descubrimiento hasta el contacto.",
                role: "Diseñador y Desarrollador Principal",
                services: ["Diseño UX/UI", "Desarrollo Frontend"]
            }
        }
    },
    {
        title: "Nouveau Wellness Concierge",
        year: "2024",
        url: "https://nouveauwc.com/",
        image: "/projects/project-2.png",
        description: "A luxury wellness concierge service website. The design radiates calm and exclusivity, utilizing a soft color palette and elegant typography to reflect the brand's commitment to personalized care.",
        role: "Full Stack Developer",
        services: ["Web Design", "CMS Integration"],
        translations: {
            es: {
                title: "Nouveau Wellness Concierge",
                description: "Un sitio web para un servicio exclusivo de conserjería de bienestar. El diseño irradia calma y exclusividad, utilizando una paleta de colores suave y tipografía elegante que refleja el compromiso de la marca con la atención personalizada.",
                role: "Desarrollador Full Stack",
                services: ["Diseño Web", "Integración de CMS"]
            }
        }
    },
    {
        title: "Bijou Me",
        year: "2025",
        url: "https://bijoume.shop/",
        image: "/projects/project-3.png",
        description: "An e-commerce destination for exclusive jewelry. The site features a sophisticated shopping experience with dynamic product showcases and a seamless checkout process.",
        role: "UI/UX Designer",
        services: ["E-commerce", "Visual Identity"],
        translations: {
            es: {
                title: "Bijou Me",
                description: "Un destino de comercio electrónico para joyería exclusiva. El sitio ofrece una experiencia de compra sofisticada con exhibiciones dinámicas de productos y un proceso de pago integrado.",
                role: "Diseñador UI/UX",
                services: ["Comercio Electrónico", "Identidad Visual"]
            }
        }
    },
    {
        title: "Cidasa",
        year: "2023",
        url: "https://cidasa.com.pe/",
        image: "/projects/project-4.png",
        description: "Corporate website for a leading industrial solutions provider. The focus was on structuring complex information into an accessible, professional digital presence.",
        role: "Frontend Developer",
        services: ["Corporate Site", "SEO"],
        translations: {
            es: {
                title: "Cidasa",
                description: "Sitio web corporativo para un proveedor líder de soluciones industriales. El enfoque consistió en estructurar información compleja en una presencia digital profesional y accesible.",
                role: "Desarrollador Frontend",
                services: ["Sitio Corporativo", "SEO"]
            }
        }
    },
    {
        title: "BSSN USA",
        year: "2024",
        url: "https://bssnusa.com/",
        image: "/projects/bssn-usa.png",
        description: "A robust digital platform for a security and solutions network. Key features include secure client portals and real-time service tracking.",
        role: "Lead Developer",
        services: ["Web App", "Security Integration"],
        translations: {
            es: {
                title: "BSSN USA",
                description: "Una plataforma digital robusta para una red de soluciones y seguridad. Las características clave incluyen portales seguros para clientes y seguimiento de servicios en tiempo real.",
                role: "Desarrollador Principal",
                services: ["Aplicación Web", "Integración de Seguridad"]
            }
        }
    },
    {
        title: "Virako Travel",
        year: "2024",
        url: "https://virakotravel.com/",
        image: "/projects/project-6.png",
        description: "An immersive travel portal that invites users to explore Peruvian destinations. Rich media and storytelling methodologies were used to capture the essence of adventure.",
        role: "Creative Director",
        services: ["Storytelling", "Web Development"],
        translations: {
            es: {
                title: "Virako Travel",
                description: "Un portal de viajes inmersivo que invita a los usuarios a explorar destinos peruanos. Se utilizaron metodologías de narración visual y contenido multimedia enriquecido para capturar la esencia de la aventura.",
                role: "Director Creativo",
                services: ["Narración Digital", "Desarrollo Web"]
            }
        }
    },
    {
        title: "Brandistry",
        year: "2025",
        url: "https://brandistry.digital/",
        image: "/projects/project-7.png",
        description: "Portfolio site for a digital branding agency. The site itself is a testament to modern web trends, featuring bold typography and interactive micro-animations.",
        role: "Web Designer",
        services: ["Motion Design", "Branding"],
        translations: {
            es: {
                title: "Brandistry",
                description: "Sitio web de portafolio para una agencia de branding digital. El sitio en sí es un testimonio de las tendencias web modernas, con tipografía audaz y microanimaciones interactivas.",
                role: "Diseñador Web",
                services: ["Diseño de Movimiento", "Branding"]
            }
        }
    },
    {
        title: "Santo Huevo",
        year: "2025",
        url: "https://santohuevo.com",
        image: "/projects/santo-huevo.png",
        description: "E-commerce platform for Santo Huevo, an egg farm brand. Features include a promotional campaign system with QR codes, WhatsApp integration, and a full online ordering experience for premium eggs and poultry products.",
        role: "Lead Developer",
        services: ["E-commerce", "WhatsApp Integration", "QR Campaign"],
        translations: {
            es: {
                title: "Santo Huevo",
                description: "Plataforma de comercio electrónico para Santo Huevo, una marca de granja avícola. Incluye un sistema de campañas promocionales con códigos QR, integración con WhatsApp y una experiencia completa de pedidos en línea para huevos y productos avícolas premium.",
                role: "Desarrollador Principal",
                services: ["Comercio Electrónico", "Integración con WhatsApp", "Campaña QR"]
            }
        }
    },
    {
        title: "Silhouette Agency OS",
        year: "2026",
        url: "/projects/silhouette",
        image: "/projects/silhouette-mockup.png",
        description: "Autonomous Cognitive Operating System for Creative Agencies. An open-source release showcasing advanced system architecture.",
        role: "Creator & Lead Architect",
        services: ["Open Source", "Cognitive OS", "AI Agents"],
        translations: {
            es: {
                title: "Silhouette Agency OS",
                description: "Sistema Operativo Cognitivo Autónomo para Agencias Creativas. Una versión de código abierto que muestra una arquitectura avanzada de sistemas.",
                role: "Creador y Arquitecto Principal",
                services: ["Código Abierto", "OS Cognitivo", "Agentes de IA"]
            }
        }
    },
    {
        title: "Silhouette Framework v4",
        year: "2026",
        url: "https://github.com/haroldfabla2-hue/framework-silhouette-v4",
        image: "/projects/silhouette-framework.png",
        description: "Intelligent enterprise framework featuring 46+ specialized AI teams, auto-optimization, dynamic workflows, and 24/7 intelligent monitoring.",
        role: "Creator",
        services: ["Enterprise Architecture", "AI/ML Integration", "Workflows"],
        translations: {
            es: {
                title: "Silhouette Framework v4",
                description: "Framework empresarial inteligente que cuenta con más de 46 equipos de IA especializados, autooptimización, flujos de trabajo dinámicos y monitoreo inteligente 24/7.",
                role: "Creador",
                services: ["Arquitectura Empresarial", "Integración de IA/ML", "Flujos de Trabajo"]
            }
        }
    },
    {
        title: "Silhouette Brain",
        year: "2026",
        url: "https://github.com/haroldfabla2-hue/silhouette-brain",
        image: "/projects/silhouette-brain.png",
        description: "Advanced cognitive memory system (4-Tier Memory) for AI Agents, utilizing graph databases and vectorization for deep context retrieval.",
        role: "AI Engineer",
        services: ["Vector Databases", "Graph RAG", "Memory Systems"],
        translations: {
            es: {
                title: "Silhouette Brain",
                description: "Sistema de memoria cognitiva avanzada (Memoria de 4 Niveles) para Agentes de IA, que utiliza bases de datos de grafos y vectorización para una recuperación profunda del contexto.",
                role: "Ingeniero de IA",
                services: ["Bases de Datos Vectoriales", "RAG de Grafos", "Sistemas de Memoria"]
            }
        }
    },
    {
        title: "Contract Generator SaaS",
        year: "2026",
        url: "https://cg.unityiris.com",
        image: "/projects/contract-generator.png",
        description: "AI-powered contract generation SaaS. Automates complex legal drafting workflows using Large Language Models.",
        role: "Full Stack Developer",
        services: ["SaaS", "LLM Integration", "Backend Services"],
        translations: {
            es: {
                title: "Contract Generator SaaS",
                description: "SaaS de generación de contratos impulsado por IA. Automatiza flujos de trabajo de redacción legal complejos utilizando Modelos de Lenguaje Grandes.",
                role: "Desarrollador Full Stack",
                services: ["SaaS", "Integración de LLM", "Servicios de Backend"]
            }
        }
    }
];
