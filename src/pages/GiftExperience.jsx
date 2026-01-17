import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import gsap from 'gsap';
import { api } from '../services/api';
import ProgressBar from '../components/wrapped/ProgressBar';
import WelcomeSlide from '../components/wrapped/WelcomeSlide';
import StatsSlide from '../components/wrapped/StatsSlide';
import HiddenMessageSlide from '../components/wrapped/HiddenMessageSlide';

export default function GiftExperience() {
    const { id } = useParams();
    const nav = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [card, setCard] = useState(null);
    const [showFullCanvas, setShowFullCanvas] = useState(false);
    const [isAnimating, setIsAnimating] = useState(false);
    const [showPrompt, setShowPrompt] = useState(false);
    const containerRef = useRef(null);
    const scrollTimeoutRef = useRef(null);
    const peelRef = useRef(null);
    const timelineRef = useRef(null);
    const flapRef = useRef(null);
    const cardPreviewRef = useRef(null);

    const totalSlides = 4;

    useEffect(() => {
        api.getCard(id).then(setCard).catch(console.error);
    }, [id]);

    // setup gsap timeline for the peel animation
    useEffect(() => {
        if (!peelRef.current || currentSlide !== 3) return;

        const timeline = gsap.timeline({
            paused: true,
            defaults: {
                ease: "power1.inOut",
                duration: 0.75
            }
        });

        timeline
            .to('.peel-sticky', { rotation: 10 }, 0)
            .to('.peel-back', { height: 30, top: 37 }, 0)
            .to('.peel-back .peel-circle', { marginTop: -17 }, 0)
            .to('.peel-front', { height: 23, boxShadow: '0 -20px 4px -20px rgba(0,0,0,.1)' }, 0)
            .to('.peel-front .peel-circle', { marginTop: -30, backgroundColor: '#b8941d' }, 0);

        timelineRef.current = timeline;

        return () => {
            timeline.kill();
        };
    }, [currentSlide]);

    useEffect(() => {
        const handleWheel = (e) => {
            if (showFullCanvas) return; // Don't scroll if showing full canvas

            clearTimeout(scrollTimeoutRef.current);

            scrollTimeoutRef.current = setTimeout(() => {
                if (e.deltaY > 0 && currentSlide < totalSlides - 1) {
                    setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
                } else if (e.deltaY < 0 && currentSlide > 0) {
                    setCurrentSlide(prev => Math.max(prev - 1, 0));
                }
            }, 50);
        };

        const handleKeyDown = (e) => {
            if (showFullCanvas) return;

            if (e.key === 'ArrowDown' && currentSlide < totalSlides - 1) {
                setCurrentSlide(prev => Math.min(prev + 1, totalSlides - 1));
            } else if (e.key === 'ArrowUp' && currentSlide > 0) {
                setCurrentSlide(prev => Math.max(prev - 1, 0));
            }
        };

        window.addEventListener('wheel', handleWheel, { passive: true });
        window.addEventListener('keydown', handleKeyDown);

        return () => {
            window.removeEventListener('wheel', handleWheel);
            window.removeEventListener('keydown', handleKeyDown);
            clearTimeout(scrollTimeoutRef.current);
        };
    }, [currentSlide, showFullCanvas, totalSlides]);

    if (!card) {
        return (
            <div style={{
                width: '100vw',
                height: '100vh',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                background: 'linear-gradient(135deg, #1a1a1a 0%, #2d2d2d 100%)',
                color: 'white',
                fontSize: '1.5rem'
            }}>
                Loading your gift...
            </div>
        );
    }

    // calculate some stats for the slides
    const stats = {
        messageCount: card.messages?.length || 0,
        drawingCount: card.drawings?.length || 0,
        contributorCount: new Set([
            ...(card.messages?.map(m => m.userId) || []),
            ...(card.drawings?.map(d => d.userId) || [])
        ]).size
    };

    // parse the wrapped settings
    let wrappedData = null;
    try {
        if (card.wrappedData) {
            wrappedData = JSON.parse(card.wrappedData);
        }
    } catch (e) {
        console.error('Failed to parse wrapped data', e);
    }

    return (
        <div
            ref={containerRef}
            style={{
                width: '100vw',
                height: '100vh',
                overflow: 'hidden',
                position: 'fixed',
                top: 0,
                left: 0
            }}
        >
            {!showFullCanvas && <ProgressBar totalSlides={totalSlides} currentSlide={currentSlide} />}

            <motion.div
                animate={{
                    y: `-${currentSlide * 100}vh`
                }}
                transition={{
                    duration: 0.8,
                    ease: [0.43, 0.13, 0.23, 0.96]
                }}
                style={{
                    height: `${totalSlides * 100}vh`,
                    width: '100%'
                }}
            >
                <WelcomeSlide
                    isActive={currentSlide === 0}
                    customImage={wrappedData?.welcome?.image}
                    customTitle={wrappedData?.welcome?.title}
                    customSubtitle={wrappedData?.welcome?.subtitle}
                    customMessage={wrappedData?.welcome?.message}
                />
                <StatsSlide
                    isActive={currentSlide === 1}
                    stats={stats}
                    customPhotos={wrappedData?.stats?.photos}
                    customTitle={wrappedData?.stats?.title}
                    customSubtitle={wrappedData?.stats?.subtitle}
                />
                <HiddenMessageSlide
                    isActive={currentSlide === 2}
                    customTitle={wrappedData?.hidden?.title}
                    customSubtitle={wrappedData?.hidden?.subtitle}
                    customMessage={wrappedData?.hidden?.message}
                />


                {/* final blank slide */}
                <div style={{
                    width: '100%',
                    height: '100vh',
                    background: '#fffcf5',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexDirection: 'column',
                    gap: '60px'
                }}>
                    {currentSlide === 3 && (
                        <>
                            {/* envelope design stuff */}
                            <motion.div
                                initial={{ opacity: 0, y: -20 }}
                                animate={{ opacity: 1, y: 0 }}
                                transition={{ duration: 0.8 }}
                                style={{
                                    position: 'relative',
                                    width: '320px',
                                    height: '224px',
                                    perspective: '1000px'
                                }}
                            >
                                {/* back layer with lowest z-index */}
                                <div
                                    style={{
                                        position: 'absolute',
                                        top: '32px',
                                        left: 0,
                                        width: '320px',
                                        height: '192px',
                                        background: '#f5e6d3',
                                        border: '1px solid rgba(0,0,0,0.05)',
                                        borderRadius: '3px',
                                        zIndex: 1
                                    }}
                                />

                                {/* card preview inside the envelope */}
                                <div
                                    ref={cardPreviewRef}
                                    onClick={() => {
                                        if (showPrompt) {
                                            // Fade out and navigate
                                            gsap.to(cardPreviewRef.current, {
                                                duration: 0.6,
                                                opacity: 0,
                                                ease: 'power2.inOut',
                                                onComplete: () => {
                                                    nav(`/card/${id}/recipient`);
                                                }
                                            });
                                        }
                                    }}
                                    style={{
                                        position: 'absolute',
                                        top: '50px',
                                        left: '20px',
                                        width: '280px',
                                        height: '160px',
                                        background: '#fffcf5',
                                        borderRadius: '3px',
                                        overflow: 'hidden',
                                        boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                        zIndex: 2,
                                        cursor: showPrompt ? 'pointer' : 'default'
                                    }}
                                >
                                    {/* scaled down card stuff */}
                                    {card.drawings?.slice(0, 3).map((d, idx) => (
                                        <div
                                            key={d.id}
                                            style={{
                                                position: 'absolute',
                                                left: `${d.x * 0.7}%`,
                                                top: `${d.y * 0.7}%`,
                                                width: d.width ? `${d.width * 0.3}px` : '120px',
                                                transform: `translate(-50%, -50%) rotate(${d.rotation || 0}deg) scale(0.35)`,
                                                pointerEvents: 'none'
                                            }}
                                        >
                                            <img
                                                src={d.imageData}
                                                style={{
                                                    width: '100%',
                                                    height: 'auto',
                                                    display: 'block',
                                                    filter: 'drop-shadow(0 2px 4px rgba(0,0,0,0.1))'
                                                }}
                                                alt="Preview"
                                            />
                                        </div>
                                    ))}
                                    {card.messages?.slice(0, 2).map((m, idx) => (
                                        <div
                                            key={m.id}
                                            style={{
                                                position: 'absolute',
                                                left: `${m.x * 0.7}%`,
                                                top: `${m.y * 0.7}%`,
                                                width: m.width ? `${m.width * 0.3}px` : '90px',
                                                transform: `translate(-50%, -50%) rotate(${m.rotation || 0}deg) scale(0.35)`,
                                                pointerEvents: 'none',
                                                fontSize: '0.6rem'
                                            }}
                                        >
                                            <div
                                                dangerouslySetInnerHTML={{ __html: m.content }}
                                                style={{
                                                    fontFamily: 'var(--font-serif)',
                                                    color: '#1a1a1a'
                                                }}
                                            />
                                        </div>
                                    ))}
                                </div>

                                {/* side flaps above the card preview */}
                                <svg width="320" height="224" viewBox="0 0 320 224" style={{ position: 'absolute', top: 0, left: 0, zIndex: 5, pointerEvents: 'none' }}>
                                    <path d="M 0 32 L 160 128 L 0 224 Z" fill="#fcf9f4" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                                    <path d="M 320 32 L 160 128 L 320 224 Z" fill="#fcf9f4" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                                </svg>

                                {/* bottom flap above the card preview */}
                                <svg width="320" height="224" viewBox="0 0 320 224" style={{ position: 'absolute', top: 0, left: 0, zIndex: 6, pointerEvents: 'none' }}>
                                    <path d="M 0 224 L 160 128 L 320 224 Z" fill="#fffbf7" stroke="rgba(0,0,0,0.05)" strokeWidth="1" />
                                </svg>

                                {/* top triangle flap below the card when it opens */}
                                <div
                                    ref={flapRef}
                                    style={{
                                        position: 'absolute',
                                        top: '32px',
                                        left: '0',
                                        width: '0',
                                        height: '0',
                                        borderLeft: '160px solid transparent',
                                        borderRight: '160px solid transparent',
                                        borderTop: '96px solid #f5e6d3',
                                        transformOrigin: '50% 0%',
                                        transformStyle: 'preserve-3d',
                                        zIndex: 3
                                    }}
                                />

                                {/* the sticker you peel off */}
                                <div
                                    ref={peelRef}
                                    style={{
                                        position: 'absolute',
                                        top: '128px',
                                        left: '160px',
                                        transform: 'translate(-50%, -50%)',
                                        width: '60px',
                                        height: '60px',
                                        backfaceVisibility: 'hidden',
                                        zIndex: 10
                                    }}
                                >
                                    {/* back sticky layer for shadows */}
                                    <div
                                        className="peel-sticky peel-back"
                                        style={{
                                            position: 'absolute',
                                            top: '18px',
                                            left: 0,
                                            width: '60px',
                                            height: '2px',
                                            transform: 'rotate(45deg)'
                                        }}
                                    >
                                        <div
                                            className="peel-circle-wrapper"
                                            style={{
                                                position: 'absolute',
                                                width: '60px',
                                                height: '60px',
                                                left: 0,
                                                top: 0,
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <div
                                                className="peel-circle"
                                                style={{
                                                    position: 'absolute',
                                                    width: '47px',
                                                    height: '47px',
                                                    margin: '6.5px',
                                                    marginTop: '-43px',
                                                    borderRadius: '999px',
                                                    backgroundColor: '#d4af37',
                                                    backgroundImage: 'linear-gradient(to top, rgba(212,175,55,0), rgba(255,255,255,.8))'
                                                }}
                                            />
                                        </div>
                                    </div>

                                    {/* front sticky layer */}
                                    <div
                                        className="peel-sticky peel-front"
                                        style={{
                                            position: 'absolute',
                                            bottom: 0,
                                            left: 0,
                                            width: '60px',
                                            height: '50px',
                                            transform: 'rotate(45deg)',
                                            boxShadow: '0 -47px 7px -47px rgba(0,0,0,.3)'
                                        }}
                                    >
                                        <div
                                            className="peel-circle-wrapper"
                                            style={{
                                                position: 'absolute',
                                                width: '60px',
                                                height: '60px',
                                                left: 0,
                                                top: 0,
                                                overflow: 'hidden'
                                            }}
                                        >
                                            <div
                                                className="peel-circle"
                                                style={{
                                                    position: 'absolute',
                                                    width: '47px',
                                                    height: '47px',
                                                    margin: '6.5px',
                                                    marginTop: '-4px',
                                                    borderRadius: '999px',
                                                    background: '#d4af37',
                                                    backgroundImage: 'linear-gradient(to top, rgba(212,175,55,0) 75%, #c9a134 95%)'
                                                }}
                                            />
                                        </div>
                                    </div>
                                </div>
                            </motion.div>

                            <motion.button
                                initial={{ opacity: 0 }}
                                animate={{ opacity: 1 }}
                                transition={{ delay: 0.4, duration: 0.6 }}
                                whileHover={{ scale: 1.05 }}
                                whileTap={{ scale: 0.95 }}
                                disabled={isAnimating}
                                onClick={() => {
                                    if (isAnimating || !timelineRef.current || !flapRef.current || !cardPreviewRef.current) return;
                                    setIsAnimating(true);

                                    // chain animations: peel then flap opens then card comes out
                                    timelineRef.current.play().then(() => {
                                        // After peel completes, open the flap
                                        gsap.to(flapRef.current, {
                                            duration: 1,
                                            rotateX: -180,
                                            ease: 'power2.inOut',
                                            onComplete: () => {
                                                // change card z-index so it shows up above the flap
                                                cardPreviewRef.current.style.zIndex = '4';

                                                // after flap opens slide the card out slowly
                                                gsap.to(cardPreviewRef.current, {
                                                    duration: 2,
                                                    y: -180,
                                                    ease: 'power2.out',
                                                    onComplete: () => {
                                                        // show the prompt after the card is fully out
                                                        setShowPrompt(true);
                                                        setIsAnimating(false);
                                                    }
                                                });
                                            }
                                        });
                                    });
                                }}
                                style={{
                                    padding: '14px 40px',
                                    background: '#1a1a1a',
                                    color: 'white',
                                    border: 'none',
                                    borderRadius: '50px',
                                    fontSize: '1.1rem',
                                    cursor: isAnimating ? 'default' : 'pointer',
                                    fontFamily: 'var(--font-sans)',
                                    letterSpacing: '0.5px',
                                    opacity: isAnimating ? 0.7 : 1
                                }}
                            >
                                {isAnimating ? 'Opening...' : 'Open'}
                            </motion.button>

                            {/* click prompt after card pops up */}
                            {showPrompt && (
                                <motion.p
                                    initial={{ opacity: 0, y: 10 }}
                                    animate={{ opacity: 1, y: 0 }}
                                    transition={{ duration: 0.5 }}
                                    style={{
                                        position: 'absolute',
                                        bottom: '120px',
                                        left: '50%',
                                        transform: 'translateX(-50%)',
                                        color: '#fff',
                                        fontSize: '1.1rem',
                                        fontFamily: 'var(--font-sans)',
                                        textAlign: 'center',
                                        margin: 0,
                                        pointerEvents: 'none',
                                        background: 'rgba(0,0,0,0.5)',
                                        padding: '10px 20px',
                                        borderRadius: '8px',
                                        backdropFilter: 'blur(4px)'
                                    }}
                                >
                                    Click the card to view
                                </motion.p>
                            )}
                        </>
                    )}
                </div>
            </motion.div>
        </div>
    );
}
