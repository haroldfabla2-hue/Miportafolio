import React from 'react';
import Hero from './Hero';
import About from './About';
import Projects from './Projects';
import Process from './Process';
import Services from './Services';

const Home: React.FC = () => {
    return (
        <>
            <Hero />
            <About />
            <Projects />
            <Process />
            <Services />
        </>
    );
};

export default Home;
