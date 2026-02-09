import React, { useEffect, useState } from 'react';
import { motion } from 'framer-motion';

const Cursor: React.FC = () => {
    const [mousePosition, setMousePosition] = useState({ x: 0, y: 0 });
    const [isHovering, setIsHovering] = useState(false);

    useEffect(() => {
        const updateMousePosition = (e: MouseEvent) => {
            setMousePosition({ x: e.clientX, y: e.clientY });

            // Check if hovering over clickable element
            const target = e.target as HTMLElement;
            const isClickable = target.closest('a, button, [role="button"]') !== null;
            setIsHovering(isClickable);
        };

        window.addEventListener('mousemove', updateMousePosition);

        return () => {
            window.removeEventListener('mousemove', updateMousePosition);
        };
    }, []);

    return (
        <motion.div
            style={{
                position: 'fixed',
                left: 0,
                top: 0,
                width: isHovering ? 60 : 20,
                height: isHovering ? 60 : 20,
                borderRadius: '50%',
                backgroundColor: isHovering ? 'rgba(255, 255, 255, 0.1)' : 'var(--color-accent)',
                border: isHovering ? '1px solid rgba(255, 255, 255, 0.5)' : 'none',
                pointerEvents: 'none',
                zIndex: 9999,
                mixBlendMode: 'difference',
                backdropFilter: isHovering ? 'blur(2px)' : 'none',
            }}
            animate={{
                x: mousePosition.x - (isHovering ? 30 : 10),
                y: mousePosition.y - (isHovering ? 30 : 10),
                scale: isHovering ? 1.5 : 1
            }}
            transition={{
                type: "spring",
                stiffness: 150,
                damping: 15,
                mass: 0.5
            }}
        />
    );
};

export default Cursor;
