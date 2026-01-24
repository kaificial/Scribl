import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCard } from '../hooks/useCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ChevronLeft, X, Sparkles } from 'lucide-react';
import html2canvas from 'html2canvas';
import { api } from '../services/api';
import CelebrationBalloons from '../components/CelebrationBalloons';
import '../App.css';

const AnimatedBirthday = ({ name, delay = 0, isCapturing = false }) => {
    const [show, setShow] = useState(delay === 0 || isCapturing);

    useEffect(() => {
        if (!isCapturing && delay > 0) {
            const timer = setTimeout(() => setShow(true), delay);
            return () => clearTimeout(timer);
        }
    }, [delay, isCapturing]);

    if (!show) return null;

    if (isCapturing) {
        return (
            <div style={{
                position: 'absolute',
                top: '50.5%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                width: '60vw',
                maxWidth: '800px',
                pointerEvents: 'none',
                zIndex: 0,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                textAlign: 'center',
                color: '#666',
                fontFamily: '"Great Vibes", cursive',
                opacity: 0.2
            }}>
                <div style={{ fontSize: '56px', whiteSpace: 'nowrap', lineHeight: 1.1, fontFamily: '"Great Vibes", cursive' }}>Happy Birthday</div>
                <div style={{ fontSize: '72px', whiteSpace: 'nowrap', lineHeight: 1.1, marginTop: '-10px', fontFamily: '"Great Vibes", cursive' }}>{name}!</div>
            </div>
        );
    }

    return (
        <div style={{
            position: 'absolute',
            top: '50%',
            left: '50%',
            transform: 'translate(-50%, -50%)',
            width: '60vw',
            maxWidth: '800px',
            pointerEvents: 'none',
            zIndex: 0,
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            overflow: 'visible'
        }}>
            <svg viewBox="0 0 1000 150" style={{ width: '100%', overflow: 'visible' }}>
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="cursive-write-text"
                    style={{
                        fontFamily: '"Great Vibes", cursive',
                        fontSize: '85px',
                    }}
                >
                    Happy Birthday
                </text>
            </svg>
            <svg viewBox="0 0 1000 180" style={{ width: '100%', overflow: 'visible', marginTop: '-20px' }}>
                <text
                    x="50%"
                    y="50%"
                    textAnchor="middle"
                    dominantBaseline="middle"
                    className="cursive-write-text"
                    style={{
                        fontFamily: '"Great Vibes", cursive',
                        fontSize: '105px',
                        animationDelay: '1.2s'
                    }}
                >
                    {name}!
                </text>
            </svg>
        </div>
    );
};

export default function RecipientView() {
    const { id } = useParams();
    const nav = useNavigate();
    const { card, isLoading: loading } = useCard(id);
    const [selectedItem, setSelectedItem] = useState(null);
    const [isDownloading, setIsDownloading] = useState(false);
    const captureRef = useRef(null);

    // Data is handled by useCard hook

    const handleDownload = async () => {
        if (!captureRef.current) return;
        setIsDownloading(true);

        // ensure fonts are loaded
        try {
            await document.fonts.ready;
        } catch (e) { }

        // Wait for React to re-render the "capture-ready" state
        await new Promise(resolve => setTimeout(resolve, 1000));

        try {
            const canvas = await html2canvas(captureRef.current, {
                useCORS: true,
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                onclone: (doc) => {
                    // font double-check
                    const elements = doc.querySelectorAll('*');
                    elements.forEach(el => {
                        if (el.style.fontFamily && el.style.fontFamily.includes('Great Vibes')) {
                            el.style.fontFamily = '"Great Vibes", cursive';
                        }
                    });
                }
            });
            const link = document.createElement('a');
            link.download = `scribl-card-${id}.png`;
            link.href = canvas.toDataURL('image/png');
            link.click();
        } catch (err) {
            console.error('Download failed', err);
        } finally {
            setIsDownloading(false);
        }
    };

    if (loading) {
        return (
            <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                    <div className="text-serif-italic" style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: '#666' }}>Preparing your card...</div>
                    <div style={{
                        height: '6px',
                        width: '100%',
                        background: 'rgba(0,0,0,0.05)',
                        borderRadius: '10px',
                        overflow: 'hidden',
                        position: 'relative'
                    }}>
                        <motion.div
                            initial={{ x: '-100%' }}
                            animate={{ x: '100%' }}
                            transition={{
                                repeat: Infinity,
                                duration: 1.5,
                                ease: "easeInOut"
                            }}
                            style={{
                                position: 'absolute',
                                top: 0,
                                left: 0,
                                height: '100%',
                                width: '100%',
                                background: 'linear-gradient(90deg, transparent, #1a1a1a, transparent)',
                            }}
                        />
                    </div>
                </div>
            </div>
        );
    }
    if (!card) return <div className="loading-screen" style={{ background: '#ffffff', display: 'grid', placeItems: 'center', height: '100vh', fontFamily: 'var(--font-sans)' }}>Card not found</div>;

    // smush messages and drawings together for the gallery
    const items = [
        ...(card.messages?.map(m => ({ ...m, type: 'message' })) || []),
        ...(card.drawings?.map(d => ({ ...d, type: 'drawing' })) || [])
    ];

    return (
        <div className="canvas-container" style={{
            background: '#ffffff',
            minHeight: '100vh',
            width: '100vw',
            overflow: 'hidden',
            position: 'fixed',
            inset: 0
        }}>
            <CelebrationBalloons count={35} fast={true} />
            {/* floating header with buttons like cardview */}
            <div style={{
                position: 'absolute',
                top: 20,
                left: 20,
                right: 20,
                zIndex: 100,
                display: 'flex',
                justifyContent: 'space-between',
                pointerEvents: 'none'
            }}>
                <button
                    onClick={() => nav(`/gift/${id}`)}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '8px',
                        color: '#bbb',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        pointerEvents: 'auto',
                        transition: 'all 0.2s ease',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#1a1a1a';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#bbb';
                    }}
                >
                    <ChevronLeft size={14} /> Replay
                </button>

                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    style={{
                        background: 'none',
                        border: 'none',
                        padding: '8px',
                        color: '#bbb',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 6,
                        cursor: 'pointer',
                        fontSize: '0.75rem',
                        fontWeight: 500,
                        pointerEvents: 'auto',
                        transition: 'all 0.2s ease',
                        textTransform: 'uppercase',
                        letterSpacing: '0.5px'
                    }}
                    onMouseEnter={(e) => {
                        e.currentTarget.style.color = '#1a1a1a';
                    }}
                    onMouseLeave={(e) => {
                        e.currentTarget.style.color = '#bbb';
                    }}
                >
                    {isDownloading ? '...' : <><Download size={14} /> Download</>}
                </button>
            </div>

            {/* main canvas area that we capture for downloading */}
            <div
                ref={captureRef}
                style={{
                    width: '100%',
                    height: '100%',
                    position: 'absolute',
                    inset: 0,
                    background: '#ffffff',
                    overflow: 'hidden'
                }}
            >
                <div style={{
                    position: 'relative',
                    width: '100%',
                    height: '100%',
                    background: '#ffffff'
                }}>
                    <div className={isDownloading ? "no-animation" : ""} style={{ opacity: 1 }}>
                        <AnimatedBirthday name={card?.recipientName} delay={isDownloading ? 0 : 5000} isCapturing={isDownloading} />
                    </div>
                    {items.map((item, idx) => (
                        <div
                            key={`${item.type}-${item.id}`}
                            onClick={() => setSelectedItem(item)}
                            style={{
                                position: 'absolute',
                                left: `${item.x}%`,
                                top: `${item.y}%`,
                                width: item.width ? `${item.width}px` : (item.type === 'message' ? '300px' : '400px'),
                                // use translate3d for gpu acceleration on ios
                                transform: `translate3d(-50%, -50%, 0) rotate(${item.rotation || 0}deg)`,
                                cursor: 'zoom-in',
                                zIndex: 1,
                                userSelect: 'none',
                                // force gpu acceleration to prevent trail on ipad
                                willChange: 'transform',
                                WebkitTransform: `translate3d(-50%, -50%, 0) rotate(${item.rotation || 0}deg)`,
                                backfaceVisibility: 'hidden',
                                WebkitBackfaceVisibility: 'hidden'
                            }}
                        >
                            <div style={{ position: 'relative', width: '100%', height: '100%' }}>
                                {item.type === 'message' ? (
                                    <div style={{
                                        padding: '10px',
                                        background: 'transparent',
                                        minHeight: 50,
                                        borderRadius: '4px'
                                    }}>
                                        <div dangerouslySetInnerHTML={{ __html: item.content }} style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', margin: 0, color: '#1a1a1a' }} />
                                        <div style={{ textAlign: 'right', marginTop: 10, color: '#aaa', fontStyle: 'italic', fontSize: '0.8rem' }}>
                                            — {item.authorName || item.userName || 'Guest'}
                                        </div>
                                    </div>
                                ) : (
                                    <div style={{ pointerEvents: 'none' }}>
                                        <img
                                            src={item.imageData}
                                            style={{ width: '100%', height: 'auto', display: 'block', filter: 'drop-shadow(0 4px 8px rgba(0,0,0,0.1))' }}
                                            draggable={false}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* lightbox effect when clicking an item */}
            <AnimatePresence>
                {selectedItem && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            background: 'rgba(255, 255, 255, 0.95)',
                            backdropFilter: 'blur(5px)',
                            zIndex: 1000,
                            display: 'grid',
                            placeItems: 'center',
                            cursor: 'zoom-out'
                        }}
                        onClick={() => setSelectedItem(null)}
                    >
                        <motion.div
                            initial={{ scale: 0.9, y: 20 }}
                            animate={{ scale: 1, y: 0 }}
                            exit={{ scale: 0.9, y: 20 }}
                            style={{
                                background: 'white',
                                padding: '60px',
                                borderRadius: '30px',
                                boxShadow: '0 30px 100px rgba(0,0,0,0.1)',
                                position: 'relative',
                                maxHeight: '90vh',
                                maxWidth: '90vw',
                                cursor: 'default'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <div style={{ position: 'absolute', top: 20, right: 20, display: 'flex', gap: 10 }}>
                                {selectedItem.type === 'drawing' && (
                                    <button
                                        onClick={() => {
                                            const link = document.createElement('a');
                                            link.download = `drawing-${selectedItem.id}.png`;
                                            link.href = selectedItem.imageData;
                                            link.click();
                                        }}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            color: '#666',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 6,
                                            fontSize: '0.85rem'
                                        }}
                                        title="Download this image"
                                    >
                                        <Download size={20} />
                                    </button>
                                )}
                                <button
                                    onClick={() => setSelectedItem(null)}
                                    style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        color: '#aaa'
                                    }}
                                >
                                    <X size={24} />
                                </button>
                            </div>

                            {selectedItem.type === 'drawing' ? (
                                <div style={{ textAlign: 'center' }}>
                                    <img
                                        src={selectedItem.imageData}
                                        alt="Drawing"
                                        style={{ maxWidth: '100%', maxHeight: '70vh', borderRadius: 12 }}
                                    />
                                </div>
                            ) : (
                                <div style={{ maxWidth: 600 }}>
                                    <div
                                        style={{
                                            fontSize: '1.8rem',
                                            fontFamily: 'var(--font-serif)',
                                            lineHeight: 1.5,
                                            color: '#1a1a1a'
                                        }}
                                        dangerouslySetInnerHTML={{ __html: selectedItem.content }}
                                    />
                                    <div style={{ textAlign: 'right', marginTop: 30, fontSize: '1.4rem', fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>
                                        — {selectedItem.authorName || selectedItem.userName}
                                    </div>
                                </div>
                            )}
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>

            {/* click to enlarge hint */}
            {!isDownloading && (
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: 15, duration: 1 }}
                    style={{
                        position: 'absolute',
                        bottom: 40,
                        left: 0,
                        right: 0,
                        display: 'flex',
                        justifyContent: 'center',
                        zIndex: 100,
                        pointerEvents: 'none'
                    }}
                >
                    <div style={{
                        background: 'rgba(255, 255, 255, 0.5)',
                        backdropFilter: 'blur(5px)',
                        padding: '6px 16px',
                        borderRadius: '50px',
                        fontSize: '0.7rem',
                        color: '#aaa',
                        display: 'flex',
                        alignItems: 'center',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.02)',
                        fontFamily: 'var(--font-sans)',
                        letterSpacing: '0.7px'
                    }}>
                        <span>click any message to enlargen and download</span>
                    </div>
                </motion.div>
            )}

            {/* footer info */}
            <div style={{ position: 'absolute', bottom: 15, left: 0, right: 0, textAlign: 'center', fontSize: '0.7rem', color: '#ccc', zIndex: 10, pointerEvents: 'none' }}>
                <span style={{ pointerEvents: 'auto' }}>
                    2026 <a href="https://kaificial.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Kaificial</a>
                </span>
            </div>
        </div>
    );
}
