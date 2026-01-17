import React from 'react';
import { motion } from 'framer-motion';

export default function Balloon({ color, delay, xOffset }) {
    const colors = {
        gold: '#FFD700',
        white: '#FFFFFF',
        black: '#1a1a1a',
        cream: '#FFFDD0'
    };

    return (
        <motion.div
            initial={{
                y: '100vh',
                x: xOffset,
                rotate: 0,
                opacity: 0
            }}
            animate={{
                y: '-20vh',
                x: [xOffset, xOffset + Math.sin(delay) * 50, xOffset],
                rotate: [0, Math.random() > 0.5 ? 20 : -20, 0],
                opacity: [0, 1, 1, 0]
            }}
            transition={{
                duration: 4,
                delay: delay,
                ease: 'easeOut',
                x: {
                    duration: 4,
                    repeat: 0,
                    ease: 'easeInOut'
                }
            }}
            style={{
                position: 'fixed',
                bottom: 0,
                left: 0,
                zIndex: 9999,
                pointerEvents: 'none'
            }}
        >
            {/* the main balloon part */}
            <div style={{
                position: 'relative',
                width: 60,
                height: 75,
                background: colors[color],
                borderRadius: '50% 50% 50% 50% / 60% 60% 40% 40%',
                boxShadow: `inset -10px -10px 20px rgba(0,0,0,0.1), 0 10px 30px rgba(0,0,0,0.2)`,
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
            }}>
                {/* little shine on the side */}
                <div style={{
                    position: 'absolute',
                    top: 15,
                    left: 15,
                    width: 15,
                    height: 20,
                    background: 'rgba(255, 255, 255, 0.6)',
                    borderRadius: '50%',
                    transform: 'rotate(-45deg)'
                }} />

                {/* the knot at the bottom */}
                <div style={{
                    position: 'absolute',
                    bottom: -8,
                    width: 10,
                    height: 15,
                    background: colors[color],
                    borderRadius: '50%',
                    filter: 'brightness(0.9)'
                }} />
            </div>

            {/* the string hanging down */}
            <div style={{
                position: 'absolute',
                top: 75,
                left: '50%',
                transform: 'translateX(-50%)',
                width: 1,
                height: 100,
                background: 'rgba(255, 255, 255, 0.3)',
                transformOrigin: 'top'
            }} />
        </motion.div>
    );
}
