import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';

export default function InteractiveGiftBox({ isActive, customTitle, customSubtitle, customPhotos }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);

    const cards = customPhotos && customPhotos.length > 0
        ? customPhotos.map((photo, index) => ({ id: `custom-${index}`, image: photo }))
        : [];

    const swipeConfidenceThreshold = 10000;
    const swipePower = (offset, velocity) => {
        return Math.abs(offset) * velocity;
    };

    const paginate = (newDirection) => {
        if (newDirection === 1 && currentIndex < cards.length - 1) {
            setDirection(1);
            setCurrentIndex(currentIndex + 1);
        } else if (newDirection === -1 && currentIndex > 0) {
            setDirection(-1);
            setCurrentIndex(currentIndex - 1);
        }
    };

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0,
            scale: 0.9,
            rotate: direction > 0 ? 5 : -5
        }),
        center: {
            zIndex: 1,
            x: 0,
            opacity: 1,
            scale: 1,
            rotate: 0
        },
        exit: (direction) => ({
            zIndex: 0,
            x: direction < 0 ? 300 : -300,
            opacity: 0,
            scale: 0.9,
            rotate: direction < 0 ? 5 : -5
        })
    };


    return (
        <div style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: 'radial-gradient(circle at 30% 20%, #FFF5E8 0%, #FFFBF5 40%, #F5F0E8 100%)',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* the header at the top */}
            <div style={{
                position: 'absolute',
                top: '10%',
                textAlign: 'center',
                zIndex: 2,
                width: '100%',
                padding: '0 20px'
            }}>
                <motion.h1
                    initial={{ opacity: 0, y: -20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.5, duration: 0.8 }}
                    style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '3rem',
                        fontWeight: 700,
                        color: '#1a1a1a',
                        marginBottom: '8px',
                        letterSpacing: '-0.02em'
                    }}
                >
                    {customTitle || "Memories & Milestones"}
                </motion.h1>
                <motion.p
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 0.8, duration: 0.8 }}
                    style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '1.1rem',
                        color: 'rgba(26, 26, 26, 0.6)',
                        fontWeight: 400
                    }}
                >
                    {customSubtitle || "A year filled with joy and laughter"}
                </motion.p>
            </div>

            {/* bubbles you can pop */}
            {[...Array(50)].map((_, i) => {
                const [isPopped, setIsPopped] = React.useState(false);
                const bubbleSize = 20 + Math.random() * 40;
                const animationDuration = 12 + Math.random() * 8;
                const delay = i * 0.2;
                const startLeft = Math.random() * 100; // 0-100% of container width
                const drift = (Math.random() - 0.5) * 10; // Slight horizontal drift

                return (
                    <motion.div
                        key={i}
                        initial={{
                            bottom: -50,
                            left: `${startLeft}%`,
                            scale: 0
                        }}
                        animate={isPopped ? {
                            scale: [1, 1.3, 0],
                            opacity: [1, 0.8, 0]
                        } : {
                            bottom: '100%', // Animate to top of container
                            left: `${startLeft + drift}%`,
                            scale: [0, 1, 1, 0]
                        }}
                        transition={isPopped ? {
                            duration: 0.3,
                            ease: "easeOut"
                        } : {
                            duration: animationDuration,
                            repeat: Infinity,
                            delay: delay,
                            ease: "linear"
                        }}
                        onClick={() => setIsPopped(true)}
                        onAnimationComplete={() => {
                            if (isPopped) {
                                setTimeout(() => setIsPopped(false), animationDuration * 1000);
                            }
                        }}
                        style={{
                            position: 'absolute',
                            width: bubbleSize,
                            height: bubbleSize,
                            borderRadius: '50%',
                            border: '2px solid rgba(255, 215, 0, 0.4)',
                            background: 'radial-gradient(circle at 30% 30%, rgba(255, 255, 255, 0.6), rgba(255, 215, 0, 0.15))',
                            cursor: 'pointer',
                            boxShadow: 'inset 0 0 15px rgba(255, 255, 255, 0.5), 0 0 10px rgba(255, 215, 0, 0.2)',
                            zIndex: 1
                        }}
                    />
                );
            })}

            {/* the stack of photos */}
            {cards.length > 0 && (
                <div style={{
                    position: 'relative',
                    width: '90%',
                    maxWidth: 320, // Polaroid width
                    height: 400, // Polaroid height
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    zIndex: 10,
                    marginTop: '60px' // Space for header
                }}>
                    <AnimatePresence initial={false} custom={direction}>
                        <motion.div
                            key={currentIndex}
                            custom={direction}
                            variants={variants}
                            initial="enter"
                            animate="center"
                            exit="exit"
                            transition={{
                                x: { type: "spring", stiffness: 300, damping: 30 },
                                opacity: { duration: 0.2 },
                                rotate: { duration: 0.4 }
                            }}
                            drag="x"
                            dragConstraints={{ left: 0, right: 0 }}
                            dragElastic={1}
                            onDragEnd={(e, { offset, velocity }) => {
                                const swipe = swipePower(offset.x, velocity.x);

                                if (swipe < -swipeConfidenceThreshold) {
                                    paginate(1);
                                } else if (swipe > swipeConfidenceThreshold) {
                                    paginate(-1);
                                }
                            }}
                            style={{
                                position: 'absolute',
                                width: '100%',
                                height: '100%',
                                background: '#ffffff',
                                boxShadow: '0 10px 30px rgba(0,0,0,0.15)',
                                cursor: 'grab',
                                userSelect: 'none',
                                display: 'flex',
                                flexDirection: 'column',
                                padding: '16px 16px 60px 16px', // Classic Polaroid padding
                                boxSizing: 'border-box'
                            }}
                        >
                            {/* the polaroid part */}
                            <div style={{
                                width: '100%',
                                height: '100%',
                                background: '#e0e0e0',
                                overflow: 'hidden',
                                position: 'relative'
                            }}>
                                {/* the actual photo image */}
                                <img
                                    src={cards[currentIndex].image}
                                    alt=""
                                    style={{
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />

                                {/* slight texture on top */}
                                <div style={{
                                    position: 'absolute',
                                    inset: 0,
                                    background: 'linear-gradient(to bottom right, rgba(0,0,0,0.05), rgba(0,0,0,0.02))',
                                    pointerEvents: 'none'
                                }} />
                            </div>
                        </motion.div>
                    </AnimatePresence>
                </div>
            )}

            {/* hint telling you to swipe */}
            {cards.length > 1 && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 0.6 }}
                    transition={{ delay: 1, duration: 0.8 }}
                    style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '0.9rem',
                        color: '#1a1a1a',
                        marginTop: '20px',
                        fontStyle: 'italic',
                        zIndex: 2,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '4px'
                    }}
                >
                    swipe to see more <span style={{ fontStyle: 'normal' }}>→</span>
                </motion.div>
            )}

            {/* dots showing where you are in the stack */}
            {cards.length > 1 && (
                <div style={{
                    display: 'flex',
                    gap: 8,
                    marginTop: 40,
                    zIndex: 10
                }}>
                    {cards.map((_, index) => (
                        <motion.div
                            key={index}
                            onClick={() => {
                                setDirection(index > currentIndex ? 1 : -1);
                                setCurrentIndex(index);
                            }}
                            animate={{
                                scale: currentIndex === index ? 1.2 : 1,
                                opacity: currentIndex === index ? 1 : 0.4
                            }}
                            style={{
                                width: currentIndex === index ? 24 : 8,
                                height: 8,
                                borderRadius: 4,
                                background: currentIndex === index ? '#1a1a1a' : '#1a1a1a',
                                cursor: 'pointer',
                                transition: 'all 0.3s ease'
                            }}
                        />
                    ))}
                </div>
            )}
        </div>
    );
}
