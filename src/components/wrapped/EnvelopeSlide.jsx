import React, { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import gsap from 'gsap';

export default function EnvelopeSlide({ isActive, onComplete, cardContent }) {
    // Stages: 'idle', 'open', 'expanded'
    const [stage, setStage] = useState('idle');
    const peelRef = useRef(null);
    const timelineRef = useRef(null);

    // setup gsap for the peeling part
    useEffect(() => {
        if (!peelRef.current) return;

        const timeline = gsap.timeline({
            paused: true,
            defaults: {
                ease: "power1.inOut",
                duration: 0.75
            }
        });

        timeline
            .to('.peel-sticky', { rotation: 10 }, 0)
            .to('.peel-back', { height: 90, top: 110 }, 0)
            .to('.peel-back .peel-circle', { marginTop: -50 }, 0)
            .to('.peel-front', { height: 70, boxShadow: '0 -60px 10px -60px rgba(0,0,0,.1)' }, 0)
            .to('.peel-front .peel-circle', { marginTop: -90, backgroundColor: '#e2d439' }, 0)
            .to('.peel-text', { delay: 0.3, duration: 0.05, opacity: 0, ease: 'none' }, 0);

        timelineRef.current = timeline;

        return () => {
            timeline.kill();
        };
    }, []);

    const handlePeelEnter = () => {
        if (timelineRef.current && stage === 'idle') {
            timelineRef.current.play();
        }
    };

    const handlePeelLeave = () => {
        if (timelineRef.current && stage === 'idle') {
            timelineRef.current.reverse();
        }
    };

    const handleEnvelopeClick = () => {
        if (stage === 'idle') {
            setStage('open');
        }
    };

    const handleCanvasClick = (e) => {
        e.stopPropagation();
        if (stage === 'open') {
            setStage('expanded');
            // Navigate/Complete after zoom animation
            setTimeout(() => {
                if (onComplete) onComplete();
            }, 800);
        }
    };

    return (
        <div className="w-full h-full min-h-screen flex flex-col items-center justify-center bg-[#fffcf5] overflow-hidden relative"
            style={{ perspective: '1000px' }}>

            {/* middle part you can interact with */}
            <div className="relative w-40 h-28 cursor-pointer" onClick={handleEnvelopeClick}>

                {/* base layer of the envelope */}
                <div className="absolute inset-0 bg-[#f5e6d3] rounded shadow-lg z-0 transition-colors duration-500"
                    style={{ border: '1px solid rgba(0,0,0,0.05)' }} />

                {/* the actual birthday card inside */}
                <motion.div
                    initial={{ y: 0, scale: 0.95 }}
                    animate={{
                        y: stage === 'open' ? -120 : stage === 'expanded' ? -120 : 0,
                        zIndex: 2 // put it in between the back and front
                    }}
                    transition={{ duration: 1, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute top-4 left-4 right-4 bottom-4 bg-white rounded shadow-sm overflow-hidden border border-gray-100"
                    onClick={handleCanvasClick}
                >
                    <div className="w-full h-full flex flex-col items-center justify-center p-4 bg-gray-50 bg-opacity-50">
                        {/* some placeholder stuff */}
                        <div className="w-20 h-20 rounded-full bg-gray-200 mb-4 animate-pulse" />
                        <div className="w-3/4 h-2 bg-gray-200 rounded mb-2" />
                        <div className="w-1/2 h-2 bg-gray-200 rounded" />

                        {/* the real content of the card */}
                        {cardContent && (
                            <div className="absolute inset-0 z-10 pointer-events-none opacity-50">
                                {cardContent}
                            </div>
                        )}
                    </div>

                    {/* glow when you hover */}
                    <AnimatePresence>
                        {stage === 'open' && (
                            <motion.div
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                exit={{ opacity: 0 }}
                                className="absolute inset-0 bg-blue-500 bg-opacity-5 hover:bg-opacity-10 transition-all cursor-zoom-in"
                            />
                        )}
                    </AnimatePresence>
                </motion.div>

                {/* the front flaps of the envelope */}
                <svg className="absolute inset-0 w-full h-full z-10 pointer-events-none drop-shadow-md" viewBox="0 0 320 224">
                    {/* flap on the left */}
                    <path d="M 0 0 L 160 112 L 0 224 Z" fill="#fcf9f4" stroke="rgba(0,0,0,0.02)" />
                    {/* flap on the right */}
                    <path d="M 320 0 L 160 112 L 320 224 Z" fill="#fcf9f4" stroke="rgba(0,0,0,0.02)" />
                    {/* flap on the bottom */}
                    <path d="M 0 224 L 160 112 L 320 224 Z" fill="#fffbf7" stroke="rgba(0,0,0,0.02)" />
                </svg>

                {/* the top triangle flap */}
                <motion.div
                    initial={{ rotateX: 0 }}
                    animate={{
                        rotateX: stage !== 'idle' ? -180 : 0,
                    }}
                    transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                    className="absolute top-0 left-0 w-full h-1/2 origin-top transform-gpu z-20"
                    style={{ transformStyle: 'preserve-3d' }}
                >
                    <svg className="w-full h-full" viewBox="0 0 320 112">
                        <path d="M 0 0 L 160 112 L 320 0 Z" fill="#fcf9f4" stroke="rgba(0,0,0,0.05)" />
                    </svg>

                    {/* the back of the flap */}
                    <div className="absolute inset-0 bg-[#f5e6d3] opacity-0" style={{ backfaceVisibility: 'hidden', transform: 'rotateX(180deg)', opacity: stage !== 'idle' ? 1 : 0 }} />
                </motion.div>

                {/* the wax seal and prompts */}
                {stage === 'idle' && (
                    <div
                        ref={peelRef}
                        onMouseEnter={handlePeelEnter}
                        onMouseLeave={handlePeelLeave}
                        className="absolute top-[45%] left-1/2 -translate-x-1/2 -translate-y-1/2 z-30"
                        style={{
                            width: '180px',
                            height: '180px',
                            position: 'absolute',
                            backfaceVisibility: 'hidden'
                        }}
                    >
                        {/* background layer for the reveal */}
                        <div
                            className="peel-reveal"
                            style={{
                                position: 'absolute',
                                width: '180px',
                                height: '180px',
                                left: 0,
                                top: 0,
                                overflow: 'hidden',
                                transform: 'rotate(45deg)'
                            }}
                        >
                            <div
                                className="peel-circle"
                                style={{
                                    position: 'absolute',
                                    width: '140px',
                                    height: '140px',
                                    margin: '20px',
                                    borderRadius: '999px',
                                    background: '#fafafa',
                                    boxShadow: '0 1px 0px rgba(0,0,0,.15)',
                                    fontFamily: 'helvetica neue, arial',
                                    fontWeight: 200,
                                    lineHeight: '140px',
                                    textAlign: 'center',
                                    cursor: 'pointer',
                                    transform: 'rotate(-45deg)'
                                }}
                            >
                                Hello!
                            </div>
                        </div>

                        {/* back sticky part for shadows */}
                        <div
                            className="peel-sticky peel-back"
                            style={{
                                position: 'absolute',
                                top: '30px',
                                left: 0,
                                width: '180px',
                                height: '10px',
                                transform: 'rotate(45deg)'
                            }}
                        >
                            <div
                                className="peel-circle-wrapper"
                                style={{
                                    position: 'absolute',
                                    width: '180px',
                                    height: '180px',
                                    left: 0,
                                    top: 0,
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    className="peel-circle"
                                    style={{
                                        position: 'absolute',
                                        width: '140px',
                                        height: '140px',
                                        margin: '20px',
                                        marginTop: '-130px',
                                        borderRadius: '999px',
                                        backgroundColor: '#fbec3f',
                                        backgroundImage: 'linear-gradient(to top, rgba(251,236,63,0), rgba(255,255,255,.8))'
                                    }}
                                />
                            </div>
                        </div>

                        {/* text that says peel me */}
                        <h4
                            className="peel-text"
                            style={{
                                fontFamily: 'helvetica neue, arial',
                                fontWeight: 200,
                                textAlign: 'center',
                                position: 'absolute',
                                width: '180px',
                                height: '140px',
                                lineHeight: '140px',
                                color: '#1a1a1a',
                                fontSize: '16px',
                                pointerEvents: 'none'
                            }}
                        >
                            Peel Me!
                        </h4>

                        {/* front sticky part */}
                        <div
                            className="peel-sticky peel-front"
                            style={{
                                position: 'absolute',
                                bottom: 0,
                                left: 0,
                                width: '180px',
                                height: '150px',
                                transform: 'rotate(45deg)',
                                boxShadow: '0 -140px 20px -140px rgba(0,0,0,.3)'
                            }}
                        >
                            <div
                                className="peel-circle-wrapper"
                                style={{
                                    position: 'absolute',
                                    width: '180px',
                                    height: '180px',
                                    left: 0,
                                    top: 0,
                                    overflow: 'hidden'
                                }}
                            >
                                <div
                                    className="peel-circle"
                                    style={{
                                        position: 'absolute',
                                        width: '140px',
                                        height: '140px',
                                        margin: '20px',
                                        marginTop: '-10px',
                                        borderRadius: '999px',
                                        background: '#fbec3f',
                                        backgroundImage: 'linear-gradient(to top, rgba(251,236,63,0) 75%, #f7bb37 95%)'
                                    }}
                                />
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* prompts for each stage */}
            <div className="mt-8 h-8 flex flex-col items-center">
                <AnimatePresence mode="wait">
                    {stage === 'idle' && (
                        <motion.p
                            key="click-open"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: 0.6 }}
                            exit={{ opacity: 0 }}
                            className="text-gray-500 font-serif italic text-sm"
                        >
                            Click to open
                        </motion.p>
                    )}
                    {stage === 'open' && (
                        <motion.p
                            key="click-expand"
                            initial={{ opacity: 0 }}
                            animate={{ opacity: [0.3, 0.8, 0.3], scale: [0.98, 1, 0.98] }}
                            transition={{ repeat: Infinity, duration: 1.5 }}
                            className="text-gray-700 font-serif font-medium text-lg tracking-wide"
                        >
                            Click to expand
                        </motion.p>
                    )}
                </AnimatePresence>
            </div>

            {/* the final reveal overlay */}
            <AnimatePresence>
                {stage === 'expanded' && (
                    <motion.div
                        initial={{ opacity: 0, scale: 0.5 }}
                        animate={{ opacity: 1, scale: 1 }}
                        exit={{ opacity: 0, scale: 1.5 }}
                        transition={{ duration: 0.8, ease: [0.4, 0, 0.2, 1] }}
                        className="fixed inset-0 z-[100] bg-white flex items-center justify-center overflow-hidden"
                    >
                        {/* the final full view of the card */}
                        <div className="w-full h-full max-w-4xl max-h-[80vh] m-8 border shadow-2xl rounded-xl bg-white p-8 relative overflow-hidden">
                            <div className="absolute inset-0 opacity-5 pointer-events-none"
                                style={{ backgroundImage: 'radial-gradient(circle, #000 1px, transparent 0)', backgroundSize: '40px 40px' }} />

                            <div className="h-full flex flex-col items-center justify-center text-center">
                                <motion.h1
                                    initial={{ opacity: 0, y: 20 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ delay: 0.4 }}
                                    className="text-5xl font-serif text-gray-900 mb-6"
                                >
                                    Birthday Canvas
                                </motion.h1>
                                <motion.div
                                    initial={{ scaleX: 0 }}
                                    animate={{ scaleX: 1 }}
                                    transition={{ delay: 0.6, duration: 1 }}
                                    className="w-32 h-[1px] bg-gray-300 mb-8 origin-center"
                                />
                                <motion.p
                                    initial={{ opacity: 0 }}
                                    animate={{ opacity: 0.6 }}
                                    transition={{ delay: 0.8 }}
                                    className="text-lg text-gray-500 font-sans tracking-widest uppercase text-sm"
                                >
                                    Unwrapping magical moments...
                                </motion.p>
                            </div>
                        </div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    );
}
