import React from 'react';
import { motion } from 'framer-motion';
import SEO from './SEO';
import Hero from './Hero';
import About from './About';
import Projects from './Projects';
import Process from './Process';
import Services from './Services';

const Home = () => {
    return (
        <div className="home-container overflow-hidden">
            <SEO
                title="Premium Agency OS"
                description="MiWeb is a high-end agency management system with AI insights and predictive simulations."
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
