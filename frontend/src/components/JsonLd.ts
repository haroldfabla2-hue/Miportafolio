export const getOrganizationSchema = () => ({
  "@context": "https://schema.org",
  "@type": "Organization",
  "name": "Alberto Farah",
  "url": "https://albertofarah.com",
  "logo": "https://albertofarah.com/logo.png",
  "sameAs": [
    "https://github.com/albertofarah",
    "https://linkedin.com/in/albertofarah"
  ],
  "contactPoint": {
    "@type": "ContactPoint",
    "email": "alberto.farah.b@gmail.com",
    "contactType": "customer service"
  }
});

export const getSoftwareApplicationSchema = (name: string, description: string, url: string) => ({
  "@context": "https://schema.org",
  "@type": "SoftwareApplication",
  "name": name,
  "operatingSystem": "Windows, macOS, Linux",
  "applicationCategory": "BusinessApplication",
  "offers": {
    "@type": "Offer",
    "price": "0.00",
    "priceCurrency": "USD"
  },
  "url": url,
  "description": description
});

export const getFAQPageSchema = (faqs: { question: string, answer: string }[]) => ({
  "@context": "https://schema.org",
  "@type": "FAQPage",
  "mainEntity": faqs.map(faq => ({
    "@type": "Question",
    "name": faq.question,
    "acceptedAnswer": {
      "@type": "Answer",
      "text": faq.answer
    }
  }))
});

export const getServiceSchema = (name: string, description: string) => ({
  "@context": "https://schema.org",
  "@type": "Service",
  "serviceType": name,
  "provider": {
    "@type": "Organization",
    "name": "Alberto Farah",
    "url": "https://albertofarah.com"
  },
  "description": description
});
