"use client";

import { useRef, useState } from 'react';
import { motion } from 'framer-motion';

/**
 * A wrapper component that makes its children magnetically attract the cursor.
 */
export const Magnetic = ({ children }: { children: React.ReactNode }) => {
    const ref = useRef<HTMLDivElement>(null);
    const [position, setPosition] = useState({ x: 0, y: 0 });

    const handleMouse = (e: React.MouseEvent<HTMLDivElement>) => {
        if (ref.current) {
            const { clientX, clientY } = e;
            const { height, width, left, top } = ref.current.getBoundingClientRect();
            
            const middleX = left + width / 2;
            const middleY = top + height / 2;
            
            const x = clientX - middleX;
            const y = clientY - middleY;

            setPosition({ x, y });
        }
    };

    const handleMouseLeave = () => {
        setPosition({ x: 0, y: 0 });
    };

    const { x, y } = position;
    return (
        <motion.div
            onMouseMove={handleMouse}
            onMouseLeave={handleMouseLeave}
            ref={ref}
            animate={{ x, y }}
            transition={{ type: 'spring', stiffness: 250, damping: 15, mass: 0.5 }}
        >
            {children}
        </motion.div>
    );
};
