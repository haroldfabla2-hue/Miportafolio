export interface Project {
    title: string;
    year: string;
    url: string;
    image: string;
    description: string;
    role: string;
    services: string[];
}

export const projects: Project[] = [
    {
        title: "Nuestras Casas",
        year: "2024",
        url: "https://nuestrascasasaqp.com/",
        image: "/projects/project-1.png",
        description: "A modern real estate platform designed to showcase premium properties in Arequipa. The interface focuses on high-quality imagery and seamless navigation to enhance the user's journey from discovery to contact.",
        role: "Lead Designer & Developer",
        services: ["UX/UI Design", "Frontend Development"]
    },
    {
        title: "Nouveau Wellness Concierge",
        year: "2024",
        url: "https://nouveauwc.com/",
        image: "/projects/project-2.png",
        description: "A luxury wellness concierge service website. The design radiates calm and exclusivity, utilizing a soft color palette and elegant typography to reflect the brand's commitment to personalized care.",
        role: "Full Stack Developer",
        services: ["Web Design", "CMS Integration"]
    },
    {
        title: "Bijou Me",
        year: "2025",
        url: "https://bijoume.shop/",
        image: "/projects/project-3.png",
        description: "An e-commerce destination for exclusive jewelry. The site features a sophisticated shopping experience with dynamic product showcases and a seamless checkout process.",
        role: "UI/UX Designer",
        services: ["E-commerce", "Visual Identity"]
    },
    {
        title: "Cidasa",
        year: "2023",
        url: "https://cidasa.com.pe/",
        image: "/projects/project-4.png",
        description: "Corporate website for a leading industrial solutions provider. The focus was on structuring complex information into an accessible, professional digital presence.",
        role: "Frontend Developer",
        services: ["Corporate Site", "SEO"]
    },
    {
        title: "BSSN USA",
        year: "2024",
        url: "https://bssnusa.com/",
        image: "/projects/project-5.png",
        description: "A robust digital platform for a security and solutions network. Key features include secure client portals and real-time service tracking.",
        role: "Lead Developer",
        services: ["Web App", "Security Integration"]
    },
    {
        title: "Virako Travel",
        year: "2024",
        url: "https://virakotravel.com/",
        image: "/projects/project-6.png",
        description: "An immersive travel portal that invites users to explore Peruvian destinations. Rich media and storytelling methodologies were used to capture the essence of adventure.",
        role: "Creative Director",
        services: ["Storytelling", "Web Development"]
    },
    {
        title: "Brandistry",
        year: "2025",
        url: "https://brandistry.digital/",
        image: "/projects/project-7.png",
        description: "Portfolio site for a digital branding agency. The site itself is a testament to modern web trends, featuring bold typography and interactive micro-animations.",
        role: "Web Designer",
        services: ["Motion Design", "Branding"]
    },
    {
        title: "Trophy Club Frenchies",
        year: "2025",
        url: "https://trophyclubfrenchies.com/",
        image: "/projects/project-8.png",
        description: "A showcase site for a premium French Bulldog breeder. The design emphasizes trust and pedigree through a clean, gallery-focused layout.",
        role: "Web Developer",
        services: ["Gallery Design", "Mobile Optimization"]
    }
];
