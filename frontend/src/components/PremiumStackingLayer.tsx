import React, { useRef, useState } from 'react';
import { motion, useScroll, useTransform, MotionValue } from 'framer-motion';

interface PremiumStackingLayerProps {
    children: React.ReactNode;
    index: number;
    totalCards: number;
    progress: MotionValue<number>;
    cardRadius?: string; // Optional to match children borders
}

const PremiumStackingLayer: React.FC<PremiumStackingLayerProps> = ({ children, index, totalCards, progress, cardRadius = '25px' }) => {
    const container = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    
    const range = [index * (1 / totalCards), 1];
    const targetScale = 1 - ((totalCards - index) * 0.05);
    const scale = useTransform(progress, range, [1, targetScale]);
    
    // Mouse tracking for tilt and glare
    const [rotateX, setRotateX] = useState(0);
    const [rotateY, setRotateY] = useState(0);
    const [glarePosition, setGlarePosition] = useState({ x: 50, y: 50 });
    const [isHovered, setIsHovered] = useState(false);

    const handleMouseMove = (e: React.MouseEvent<HTMLDivElement>) => {
        if (!cardRef.current) return;
        const rect = cardRef.current.getBoundingClientRect();
        
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        const centerX = rect.width / 2;
        const centerY = rect.height / 2;
        
        // Advanced tilt bounds (subtle)
        const maxRotation = 4;
        const rotX = ((y - centerY) / centerY) * -maxRotation;
        const rotY = ((x - centerX) / centerX) * maxRotation;
        
        setRotateX(rotX);
        setRotateY(rotY);
        
        setGlarePosition({
            x: (x / rect.width) * 100,
            y: (y / rect.height) * 100
        });
    };

    const handleMouseLeave = () => {
        setRotateX(0);
        setRotateY(0);
        setIsHovered(false);
    };

    return (
        <div ref={container} style={{
            height: '100vh',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            position: 'sticky',
            top: 0,
            perspective: '1500px', // Enhances 3D rotation depth
            zIndex: index
        }}>
            <motion.div
                ref={cardRef}
                onMouseMove={handleMouseMove}
                onMouseEnter={() => setIsHovered(true)}
                onMouseLeave={handleMouseLeave}
                animate={{
                    rotateX: isHovered ? rotateX : 0,
                    rotateY: isHovered ? rotateY : 0,
                }}
                transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                style={{
                    scale,
                    transformOrigin: 'top',
                    position: 'relative',
                    top: `calc(-5vh + ${index * 25}px)`,
                    width: '100%',
                    display: 'flex',
                    justifyContent: 'center',
                    willChange: 'transform' // Hardware acceleration
                }}
            >
                <div style={{ position: 'relative', width: '100%', maxWidth: '1000px', display: 'flex', justifyContent: 'center' }}>
                    {children}
                    
                    {/* Dynamic Glare Overlay */}
                    <motion.div 
                        initial={{ opacity: 0 }}
                        animate={{ opacity: isHovered ? 1 : 0 }}
                        transition={{ duration: 0.3 }}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            borderRadius: cardRadius,
                            background: `radial-gradient(circle at ${glarePosition.x}% ${glarePosition.y}%, rgba(255,255,255,0.08) 0%, transparent 60%)`,
                            pointerEvents: 'none',
                            zIndex: 10
                        }} 
                    />
                </div>
            </motion.div>
        </div>
    );
};

export default PremiumStackingLayer;
