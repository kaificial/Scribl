import React, { useState } from 'react';
import { motion } from 'framer-motion';
import InteractiveGiftBox from './InteractiveGiftBox';

// counting up animation
const AnimatedCounter = ({ value, delay }) => {
    const [count, setCount] = useState(0);

    React.useEffect(() => {
        let start = 0;
        const end = parseInt(value);
        if (start === end) return;

        const duration = 2000;
        const increment = end / (duration / 16);

        const timer = setInterval(() => {
            start += increment;
            if (start >= end) {
                setCount(end);
                clearInterval(timer);
            } else {
                setCount(Math.floor(start));
            }
        }, 16);

        return () => clearInterval(timer);
    }, [value]);

    return (
        <motion.div
            initial={{ opacity: 0, scale: 0.5 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{
                duration: 0.6,
                delay,
                type: "spring",
                stiffness: 200
            }}
            style={{
                fontSize: 'clamp(4rem, 15vw, 8rem)',
                fontWeight: 300,
                color: '#1a1a1a',
                fontFamily: 'var(--font-serif)',
                position: 'relative',
                display: 'inline-block',
                lineHeight: 1
            }}
        >
            {count}
        </motion.div>
    );
};

// small explosion of confetti
const ConfettiPiece = ({ delay, color }) => {
    return (
        <motion.div
            initial={{ scale: 0, x: 0, y: 0, rotate: 0 }}
            animate={{
                scale: [0, 1, 0],
                x: (Math.random() - 0.5) * 300,
                y: (Math.random() - 0.5) * 300,
                rotate: Math.random() * 720
            }}
            transition={{
                duration: 1.5,
                delay: delay,
                ease: "easeOut"
            }}
            style={{
                position: 'absolute',
                width: 10,
                height: 10,
                background: color,
                borderRadius: Math.random() > 0.5 ? '50%' : '0%'
            }}
        />
    );
};

export default function StatsSlide({ isActive, customTitle, customSubtitle, customPhotos }) {
    // showing the interactive gift box here
    return <InteractiveGiftBox isActive={isActive} customTitle={customTitle} customSubtitle={customSubtitle} customPhotos={customPhotos} />;
}
