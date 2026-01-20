import React, { useMemo, memo } from 'react';
import { motion } from 'framer-motion';

const FloatingBalloons = memo(() => {
    // Minimal color palette: Gold, Yellow, Black, White, Grey/Silver
    const balloonColors = [
        'rgba(212, 175, 55, 0.7)',  // Gold
        'rgba(241, 196, 15, 0.7)',  // Yellow
        'rgba(26, 26, 26, 0.8)',    // Black
        'rgba(255, 255, 255, 0.8)', // White
        'rgba(189, 195, 199, 0.7)', // Grey
        'rgba(149, 165, 166, 0.6)', // Silver/Slate
    ];

    // Create 32 balloons with a distribution favoring sides
    const balloons = useMemo(() => {
        return Array.from({ length: 32 }).map((_, i) => {
            // Distribution logic: 
            // 40% Left Sidebar (0-30vw)
            // 40% Right Sidebar (70-100vw)
            // 20% Center (30-70vw)
            const rand = Math.random();
            let leftBase;
            if (rand < 0.4) {
                leftBase = Math.random() * 30; // Left
            } else if (rand < 0.8) {
                leftBase = 70 + Math.random() * 30; // Right
            } else {
                leftBase = 30 + Math.random() * 40; // Center
            }

            return {
                id: i,
                color: balloonColors[Math.floor(Math.random() * balloonColors.length)],
                size: Math.random() * (45 - 20) + 20,
                left: leftBase,
                delay: Math.random() * 6, // uniform early start
                duration: Math.random() * (30 - 18) + 18,
                opacity: Math.random() * (0.8 - 0.3) + 0.3,
                sway: Math.random() > 0.5 ? 4 : -4
            };
        });
    }, []);

    return (
        <div style={{
            position: 'absolute',
            inset: 0,
            pointerEvents: 'none',
            overflow: 'hidden',
            zIndex: 0
        }}>
            {balloons.map((b) => (
                <motion.div
                    key={b.id}
                    initial={{ y: '105vh', x: `${b.left}vw`, opacity: 0 }}
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
                        repeat: Infinity,
                        delay: b.delay,
                        ease: "linear",
                    }}
                    style={{
                        position: 'absolute',
                        width: b.size,
                        height: b.size * 1.2,
                        background: b.color,
                        borderRadius: '50% 50% 50% 50% / 45% 45% 55% 55%',
                        border: '1px solid rgba(255,255,255,0.1)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        display: 'flex',
                        justifyContent: 'center',
                        willChange: 'transform',
                        WebkitTransform: 'translate3d(0,0,0)',
                        backfaceVisibility: 'hidden'
                    }}
                >
                    {/* Minimal Balloon string */}
                    <div style={{
                        position: 'absolute',
                        bottom: -b.size * 1.5,
                        width: '0.5px',
                        height: b.size * 1.5,
                        background: 'rgba(0,0,0,0.08)',
                    }} />

                    {/* Subtle Balloon knot */}
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
});

export default FloatingBalloons;
