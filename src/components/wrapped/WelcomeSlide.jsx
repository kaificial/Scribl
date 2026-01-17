import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';

// just a tiny bit of confetti
const ConfettiParticle = ({ delay, color }) => {
    return (
        <motion.div
            initial={{ y: -20, opacity: 0, rotate: 0 }}
            animate={{
                y: ['0vh', '110vh'],
                opacity: [0, 1, 1, 0],
                rotate: [0, 360, 720],
                x: [0, Math.random() * 100 - 50]
            }}
            transition={{
                duration: 3 + Math.random() * 2,
                delay: delay,
                repeat: Infinity,
                repeatDelay: Math.random() * 2,
                ease: "linear"
            }}
            style={{
                position: 'absolute',
                width: 8,
                height: 8,
                background: color,
                top: 0,
                left: `${Math.random() * 100}%`,
                borderRadius: Math.random() > 0.5 ? '50%' : '2px'
            }}
        />
    );
};

// the gift box that animates
const GiftBox = ({ isActive }) => {
    return (
        <motion.svg
            width="120"
            height="120"
            viewBox="0 0 120 120"
            style={{ margin: '0 auto' }}
        >
            {/* the bottom part of the box */}
            <motion.rect
                x="25"
                y="50"
                width="70"
                height="60"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isActive ? { pathLength: 1, opacity: 0.3 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 1.5, delay: 0.5 }}
            />

            {/* the lid on top */}
            <motion.rect
                x="20"
                y="40"
                width="80"
                height="15"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isActive ? { pathLength: 1, opacity: 0.3 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 1.5, delay: 0.8 }}
            />

            {/* vertical ribbon line */}
            <motion.line
                x1="60"
                y1="40"
                x2="60"
                y2="110"
                stroke="#1a1a1a"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isActive ? { pathLength: 1, opacity: 0.3 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 1.2, delay: 1.1 }}
            />

            {/* horizontal ribbon line */}
            <motion.line
                x1="25"
                y1="50"
                x2="95"
                y2="50"
                stroke="#1a1a1a"
                strokeWidth="2.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isActive ? { pathLength: 1, opacity: 0.3 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 1.2, delay: 1.4 }}
            />

            {/* the bow on top */}
            <motion.path
                d="M 60 40 Q 50 30, 45 35 Q 50 40, 60 40 Q 70 40, 75 35 Q 70 30, 60 40"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="2.5"
                strokeLinecap="round"
                strokeLinejoin="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isActive ? { pathLength: 1, opacity: 0.3 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 1.5, delay: 1.7 }}
            />
        </motion.svg>
    );
};

// a balloon that floats around
const Balloon = ({ isActive, delay, position }) => {
    return (
        <motion.svg
            width="40"
            height="60"
            viewBox="0 0 40 60"
            style={{ position: 'absolute', ...position }}
            initial={{ y: 20, opacity: 0 }}
            animate={isActive ? { y: [0, -5, 0], opacity: 1 } : { y: 20, opacity: 0 }}
            transition={{
                y: { duration: 2, repeat: Infinity, ease: "easeInOut" },
                opacity: { duration: 0.6, delay }
            }}
        >
            {/* inside of the balloon */}
            <motion.ellipse
                cx="20"
                cy="20"
                rx="12"
                ry="16"
                fill="rgba(255, 215, 0, 0.15)" // Semi-transparent fill
                initial={{ scale: 0, opacity: 0 }}
                animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.8, delay }}
            />
            {/* balloon outline */}
            <motion.ellipse
                cx="20"
                cy="20"
                rx="12"
                ry="16"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isActive ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.8, delay }}
            />
            {/* the string attached to it */}
            <motion.line
                x1="20"
                y1="36"
                x2="20"
                y2="55"
                stroke="#1a1a1a"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isActive ? { pathLength: 1, opacity: 0.25 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.5, delay: delay + 0.3 }}
            />
        </motion.svg>
    );
};



// more balloons
const Streamer = ({ isActive, delay, position }) => {
    return (
        <motion.svg
            width="70"
            height="90"
            viewBox="0 0 70 90"
            style={{ position: 'absolute', ...position }}
        >
            {/* another balloon */}
            <motion.ellipse
                cx="35"
                cy="20"
                rx="14"
                ry="18"
                fill="rgba(255, 215, 0, 0.15)"
                initial={{ scale: 0, opacity: 0 }}
                animate={isActive ? { scale: 1, opacity: 1 } : { scale: 0, opacity: 0 }}
                transition={{ duration: 0.8, delay }}
            />
            <motion.ellipse
                cx="35"
                cy="20"
                rx="14"
                ry="18"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="1.5"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isActive ? { pathLength: 1, opacity: 1 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 0.8, delay }}
            />
            {/* another string */}
            <motion.path
                d="M 35 38 Q 30 50, 25 60 T 35 80"
                fill="none"
                stroke="#1a1a1a"
                strokeWidth="1.5"
                strokeLinecap="round"
                initial={{ pathLength: 0, opacity: 0 }}
                animate={isActive ? { pathLength: 1, opacity: 0.2 } : { pathLength: 0, opacity: 0 }}
                transition={{ duration: 1.2, delay: delay + 0.3 }}
            />
        </motion.svg>
    );
};

export default function WelcomeSlide({ isActive, customImage, customTitle, customSubtitle, customMessage }) {
    const [showConfetti, setShowConfetti] = useState(false);

    const confettiColors = ['#FFFFFF', '#1a1a1a', '#FFD700', '#F5F5DC', '#E8E8E8'];

    useEffect(() => {
        if (isActive) {
            setTimeout(() => setShowConfetti(true), 800);
        }
    }, [isActive]);

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'linear-gradient(135deg, #FFF9F0 0%, #FFFCF5 50%, #FFF5E8 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* tiny dot pattern */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `radial-gradient(circle at 2px 2px, rgba(26, 26, 26, 0.03) 1px, transparent 0)`,
                backgroundSize: '32px 32px',
                opacity: 0.5,
                pointerEvents: 'none'
            }} />

            {/* bunch of confetti */}
            {showConfetti && Array.from({ length: 20 }).map((_, i) => (
                <ConfettiParticle
                    key={i}
                    delay={i * 0.15}
                    color={confettiColors[i % confettiColors.length]}
                />
            ))}

            <motion.div
                initial={{ opacity: 0, y: 30 }}
                animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                style={{
                    textAlign: 'center',
                    padding: '0 30px',
                    maxWidth: 700,
                    position: 'relative',
                    zIndex: 1
                }}
            >
                {/* custom image that shows up if they uploaded one */}
                {customImage && (
                    <motion.div
                        initial={{ scale: 0, rotate: -10 }}
                        animate={isActive ? { scale: 1, rotate: 0 } : { scale: 0, rotate: -10 }}
                        transition={{ duration: 0.8, type: "spring", stiffness: 120 }}
                        style={{
                            width: 120,
                            height: 120,
                            margin: '0 auto 20px',
                            borderRadius: '16px',
                            overflow: 'hidden',
                            border: '3px solid rgba(26, 26, 26, 0.1)',
                            boxShadow: '0 20px 40px rgba(0,0,0,0.08)'
                        }}
                    >
                        <img
                            src={customImage}
                            alt="Welcome"
                            style={{ width: '100%', height: '100%', objectFit: 'cover' }}
                        />
                    </motion.div>
                )}

                {/* gift box and a few balloons */}
                <div style={{ position: 'relative', marginBottom: 40, display: 'inline-block' }}>
                    {/* decorative bits */}
                    <Balloon isActive={isActive} delay={1.3} position={{ top: -20, left: -80 }} />
                    <Balloon isActive={isActive} delay={1.5} position={{ top: 20, right: -70 }} />
                    <Streamer isActive={isActive} delay={1.7} position={{ top: -40, left: -140 }} />
                    <Streamer isActive={isActive} delay={1.8} position={{ top: 10, right: -130 }} />

                    {/* just the gift box */}
                    <motion.div
                        initial={{ scale: 0 }}
                        animate={isActive ? { scale: 1 } : { scale: 0 }}
                        transition={{ duration: 0.6, delay: 0.2, type: "spring", stiffness: 150 }}
                    >
                        <GiftBox isActive={isActive} />
                    </motion.div>
                </div>

                {/* some sparkles */}
                <motion.div
                    style={{
                        position: 'relative',
                        width: '100%',
                        height: 40,
                        marginBottom: 20
                    }}
                >
                    {[...Array(6)].map((_, i) => (
                        <motion.div
                            key={i}
                            initial={{ scale: 0, opacity: 0 }}
                            animate={isActive ? {
                                scale: [0, 1, 0],
                                opacity: [0, 0.4, 0]
                            } : { scale: 0, opacity: 0 }}
                            transition={{
                                duration: 2,
                                delay: 1.3 + i * 0.15,
                                repeat: Infinity,
                                repeatDelay: 1
                            }}
                            style={{
                                position: 'absolute',
                                left: `${20 + i * 12}%`,
                                top: i % 2 === 0 ? 0 : 20,
                                width: 6,
                                height: 6,
                                background: i % 3 === 0 ? '#FFD700' : (i % 2 === 0 ? '#1a1a1a' : '#E8E8E8'),
                                borderRadius: '50%'
                            }}
                        />
                    ))}
                </motion.div>

                <motion.h1
                    initial={{ opacity: 0, y: 20 }}
                    animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.8, delay: 0.6 }}
                    style={{
                        fontSize: 'clamp(2.2rem, 8vw, 4rem)',
                        fontWeight: 400,
                        color: '#1a1a1a',
                        marginBottom: 25,
                        fontFamily: 'var(--font-serif)',
                        lineHeight: 1.2,
                        letterSpacing: '-0.02em'
                    }}
                >
                    {customTitle || "Title here"}
                </motion.h1>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.8, delay: 0.9 }}
                    style={{
                        fontSize: 'clamp(1.1rem, 3.5vw, 1.4rem)',
                        color: 'rgba(26, 26, 26, 0.7)',
                        lineHeight: 1.7,
                        fontFamily: 'var(--font-sans)',
                        marginBottom: 20,
                        whiteSpace: 'pre-line'
                    }}
                >
                    {customSubtitle || "Subtitle here"}
                </motion.p>

                <motion.p
                    initial={{ opacity: 0, y: 10 }}
                    animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
                    transition={{ duration: 0.8, delay: 1.2 }}
                    style={{
                        fontSize: 'clamp(0.95rem, 2.8vw, 1.15rem)',
                        color: 'rgba(26, 26, 26, 0.5)',
                        lineHeight: 1.6,
                        fontFamily: 'var(--font-sans)',
                        fontStyle: 'italic',
                        whiteSpace: 'pre-line'
                    }}
                >
                    {customMessage || "Generic message here"}
                </motion.p>

                {/* hint to scroll down */}
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={isActive ? { opacity: 1, y: [0, 8, 0] } : { opacity: 0 }}
                    transition={{
                        opacity: { duration: 1, delay: 1.8 },
                        y: { duration: 1.5, repeat: Infinity, repeatDelay: 0.3 }
                    }}
                    style={{
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        marginTop: 50,
                        gap: 8
                    }}
                >
                    <span style={{
                        fontSize: '0.8rem',
                        color: 'rgba(26, 26, 26, 0.4)',
                        letterSpacing: '0.08em',
                        textTransform: 'lowercase'
                    }}>
                        scroll to unwrap
                    </span>
                    <svg width="20" height="20" viewBox="0 0 20 20">
                        <path
                            d="M10 3 L10 17 M6 13 L10 17 L14 13"
                            stroke="rgba(26, 26, 26, 0.3)"
                            strokeWidth="1.5"
                            fill="none"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                        />
                    </svg>
                </motion.div>
            </motion.div>
        </div>
    );
}
