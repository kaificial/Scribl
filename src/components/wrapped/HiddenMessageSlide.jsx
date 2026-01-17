import React, { useState, useRef, useEffect } from 'react';
import { motion, useMotionValue, useSpring, useTransform } from 'framer-motion';

export default function HiddenMessageSlide({ isActive, customTitle, customSubtitle, customMessage }) {
    const containerRef = useRef(null);
    const [isHovering, setIsHovering] = useState(false);

    // where the mouse is for the spotlight
    const mouseX = useMotionValue(0);
    const mouseY = useMotionValue(0);

    // smoothing out the tilt
    const springConfig = { damping: 25, stiffness: 150 };
    const tiltX = useSpring(useTransform(mouseY, [0, window.innerHeight], [5, -5]), springConfig);
    const tiltY = useSpring(useTransform(mouseX, [0, window.innerWidth], [-5, 5]), springConfig);

    useEffect(() => {
        const handleMouseMove = (e) => {
            mouseX.set(e.clientX);
            mouseY.set(e.clientY);
        };

        window.addEventListener('mousemove', handleMouseMove);
        return () => window.removeEventListener('mousemove', handleMouseMove);
    }, [mouseX, mouseY]);

    // little floating bits
    const particles = Array.from({ length: 20 }).map((_, i) => ({
        id: i,
        size: Math.random() * 4 + 2,
        x: Math.random() * 100,
        y: Math.random() * 100,
        duration: Math.random() * 20 + 10,
        delay: Math.random() * 5
    }));

    return (
        <div
            ref={containerRef}
            style={{
                width: '100%',
                height: '100vh',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                background: '#111', // Darker background for spotlight contrast
                color: '#fff',
                position: 'relative',
                overflow: 'hidden',
                cursor: 'none' // Hide default cursor for immersion
            }}
            onMouseEnter={() => setIsHovering(true)}
            onMouseLeave={() => setIsHovering(false)}
        >
            {/* spotlight effect */}
            <motion.div
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    x: mouseX,
                    y: mouseY,
                    width: 400,
                    height: 400,
                    background: 'radial-gradient(circle, rgba(255,255,255,0.15) 0%, rgba(255,255,255,0) 60%)',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 20
                }}
            />

            {/* actual cursor dot */}
            <motion.div
                style={{
                    position: 'fixed',
                    left: 0,
                    top: 0,
                    x: mouseX,
                    y: mouseY,
                    width: 20,
                    height: 20,
                    background: 'white',
                    borderRadius: '50%',
                    transform: 'translate(-50%, -50%)',
                    pointerEvents: 'none',
                    zIndex: 21,
                    mixBlendMode: 'difference'
                }}
            />

            {/* background floating bits */}
            {particles.map((p) => (
                <motion.div
                    key={p.id}
                    animate={{
                        y: [0, -100, 0],
                        opacity: [0.2, 0.5, 0.2]
                    }}
                    transition={{
                        duration: p.duration,
                        repeat: Infinity,
                        delay: p.delay,
                        ease: "linear"
                    }}
                    style={{
                        position: 'absolute',
                        left: `${p.x}%`,
                        top: `${p.y}%`,
                        width: p.size,
                        height: p.size,
                        borderRadius: '50%',
                        background: 'rgba(255,255,255,0.3)',
                        pointerEvents: 'none'
                    }}
                />
            ))}

            {/* container that tilts in 3d */}
            <motion.div
                style={{
                    perspective: 1000,
                    rotateX: tiltX,
                    rotateY: tiltY,
                    maxWidth: '800px',
                    width: '90%',
                    textAlign: 'center',
                    zIndex: 10
                }}
            >
                {/* header section */}
                <motion.div
                    initial={{ opacity: 0, y: -20 }}
                    animate={isActive ? { opacity: 1, y: 0 } : {}}
                    transition={{ delay: 0.5 }}
                    style={{ marginBottom: 60 }}
                >
                    <h2 style={{
                        fontFamily: 'var(--font-serif)',
                        fontSize: '2rem',
                        fontWeight: 300,
                        color: 'rgba(255,255,255,0.9)',
                        marginBottom: 10
                    }}>
                        {customTitle || "Title here"}
                    </h2>
                    <p style={{
                        fontFamily: 'var(--font-sans)',
                        fontSize: '0.9rem',
                        color: 'rgba(255,255,255,0.5)',
                        letterSpacing: '0.1em',
                        textTransform: 'uppercase'
                    }}>
                        {customSubtitle || "Subtitle here"}
                    </p>
                </motion.div>

                {/* area for the hidden message */}
                <div style={{ position: 'relative', minHeight: '300px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>

                    {/* blurry background layer */}
                    <div
                        style={{
                            opacity: 0.1,
                            filter: 'blur(8px)',
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            lineHeight: 1.4,
                            color: 'white',
                            userSelect: 'none'
                        }}
                    >
                        {customMessage || "Hidden message here"}
                    </div>

                    {/* layer that reveals the text */}
                    <motion.div
                        style={{
                            position: 'absolute',
                            inset: 0,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontFamily: 'var(--font-serif)',
                            fontSize: 'clamp(2rem, 5vw, 3.5rem)',
                            lineHeight: 1.4,
                            color: '#fff',
                            textShadow: '0 0 20px rgba(255,255,255,0.5)',
                            // Mask magic: reveal content based on mouse pivot
                            maskImage: useMotionValue('radial-gradient(circle at 50% 50%, black 150px, transparent 250px)'),
                            WebkitMaskImage: useMotionValue('radial-gradient(circle at 50% 50%, black 150px, transparent 250px)'),
                            pointerEvents: 'none' // Click through logic
                        }}
                        ref={ref => {
                            if (!ref) return;
                            const updateMask = () => {
                                // Get relative position
                                const rect = ref.getBoundingClientRect();
                                const x = mouseX.get() - rect.left;
                                const y = mouseY.get() - rect.top;
                                const gradient = `radial-gradient(circle at ${x}px ${y}px, black 120px, transparent 250px)`;
                                ref.style.maskImage = gradient;
                                ref.style.webkitMaskImage = gradient;
                                requestAnimationFrame(updateMask);
                            };
                            updateMask();
                        }}
                    >
                        {customMessage || "Hidden message here"}
                    </motion.div>
                </div>

            </motion.div>

            {/* hint at the bottom */}
            <motion.div
                initial={{ opacity: 0 }}
                animate={isActive ? { opacity: 0.5 } : { opacity: 0 }}
                transition={{ delay: 2 }}
                style={{
                    position: 'absolute',
                    bottom: 40,
                    fontFamily: 'var(--font-sans)',
                    fontSize: '0.8rem',
                    color: 'rgba(255,255,255,0.5)',
                    pointerEvents: 'none'
                }}
            >
                Hint text here...
            </motion.div>
        </div>
    );
}
