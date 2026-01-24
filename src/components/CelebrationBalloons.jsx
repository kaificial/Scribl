import React, { useMemo } from 'react';
import { motion } from 'framer-motion';

const CelebrationBalloons = ({ count = 40, fast = true }) => {
    const balloonColors = [
        'rgba(255, 255, 255, 0.9)', // White
        'rgba(189, 195, 199, 0.8)', // Grey
        'rgba(26, 26, 26, 0.9)',    // Black
        'rgba(212, 175, 55, 0.8)',  // Gold
        'rgba(241, 196, 15, 0.8)',  // Yellow
        'rgba(139, 69, 19, 0.8)',   // Brown
        'rgba(210, 180, 140, 0.8)', // Tan
        'rgba(255, 253, 208, 0.9)', // Cream
    ];

    const balloons = useMemo(() => {
        return Array.from({ length: count }).map((_, i) => ({
            id: i,
            color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
            size: Math.random() * (60 - 30) + 30,
            left: Math.random() * 100,
            delay: Math.random() * 1.5, // Start much sooner
            duration: fast ? (Math.random() * 5 + 10) : (Math.random() * 8 + 18),
            opacity: Math.random() * (0.8 - 0.4) + 0.4,
            sway: (Math.random() - 0.5) * 30
        }));
    }, [count, fast]);

    return (
        <div style={{
            position: 'fixed',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 2000 // Above everything
        }}>
            {balloons.map((b) => (
                <motion.div
                    key={b.id}
                    initial={{ y: '110vh', x: `${b.left}vw`, opacity: 0 }}
                    animate={{
                        y: '-20vh',
                        x: [
                            `${b.left}vw`,
                            `${b.left + b.sway}vw`,
                            `${b.left}vw`
                        ],
                        opacity: [0, b.opacity, b.opacity, 0]
                    }}
                    transition={{
                        duration: b.duration,
                        delay: b.delay,
                        ease: "easeInOut",
                    }}
                    style={{
                        position: 'absolute',
                        width: b.size,
                        height: b.size * 1.2,
                        background: b.color,
                        borderRadius: '50% 50% 50% 50% / 45% 45% 55% 55%',
                        border: '1px solid rgba(255,255,255,0.2)',
                        boxShadow: '0 8px 25px rgba(0,0,0,0.1)',
                        display: 'flex',
                        justifyContent: 'center',
                        willChange: 'transform'
                    }}
                >
                    <div style={{
                        position: 'absolute',
                        bottom: -b.size,
                        width: '0.5px',
                        height: b.size,
                        background: 'rgba(0,0,0,0.1)',
                    }} />
                    <div style={{
                        position: 'absolute',
                        bottom: -b.size / 15,
                        width: b.size / 6,
                        height: b.size / 15,
                        background: b.color,
                        clipPath: 'polygon(0% 100%, 50% 0%, 100% 100%)'
                    }} />
                </motion.div>
            ))}
        </div>
    );
};

export default CelebrationBalloons;
