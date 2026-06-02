import React, { useRef, useState } from 'react';
import { motion } from 'framer-motion';

interface MagneticButtonProps {
    children: React.ReactNode;
    className?: string;
    style?: React.CSSProperties;
    pullStrength?: number;
}

const MagneticButton: React.FC<MagneticButtonProps> = ({ 
    children, 
    className = '', 
    style = {},
    pullStrength = 0.3
}) => {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent) => {
        if (!ref.current) return;
        const { clientX, clientY } = e;
        const { height, width, left, top } = ref.current.getBoundingClientRect();
        const middleX = clientX - (left + width / 2);
        const middleY = clientY - (top + height / 2);
        
        // Calculate gravitational pull towards the mouse
        setPosition({ 
            x: middleX * pullStrength, 
            y: middleY * pullStrength 
        });
    };

    const reset = () => {
        setPosition({ x: 0, y: 0 });
    };

    return (
        <motion.div
            ref={ref}
            onMouseMove={handleMouse}
            onMouseLeave={reset}
            animate={{ x: position.x, y: position.y }}
            transition={{ type: "spring", stiffness: 150, damping: 15, mass: 0.1 }}
            className={className}
            style={{ ...style, display: 'inline-block' }}
        >
            {children}
        </motion.div>
    );
};

export default MagneticButton;
