import React from 'react';
import { motion } from 'framer-motion';
import { useTranslation } from 'react-i18next';
import SEO from './SEO';
import Hero from './Hero';
import About from './About';
import Projects from './Projects';
import Process from './Process';
import Services from './Services';

const Home = () => {
    const { t } = useTranslation();
    
    return (
        <div className="home-container overflow-hidden">
            <SEO
                title={t('home.seoTitle')}
                description={t('home.seoDescription')}
            />
            <Hero />
            <About />
            <Projects />
            <Process />
            <Services />
        </div>
    );
};

export default Home;
