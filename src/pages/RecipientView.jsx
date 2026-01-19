import React, { useState, useEffect, useRef } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useCard } from '../hooks/useCard';
import { motion, AnimatePresence } from 'framer-motion';
import { Download, ChevronLeft, X } from 'lucide-react';
import html2canvas from 'html2canvas';
import { api } from '../services/api';
import '../App.css';

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
        try {
            const canvas = await html2canvas(captureRef.current, {
                useCORS: true,
                backgroundColor: '#ffffff',
                scale: 2
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
                    onClick={() => nav(`/card/${id}/experience`)}
                    style={{
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        padding: '8px 16px',
                        borderRadius: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        pointerEvents: 'auto'
                    }}
                >
                    <ChevronLeft size={16} /> Replay Experience
                </button>

                <button
                    onClick={handleDownload}
                    disabled={isDownloading}
                    style={{
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        padding: '8px 16px',
                        borderRadius: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        fontSize: '0.9rem',
                        fontWeight: 500,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        pointerEvents: 'auto'
                    }}
                >
                    {isDownloading ? 'Capturing...' : <><Download size={16} /> Download</>}
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
                <div style={{ position: 'relative', width: '100%', height: '100%' }}>
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
                                max_width: '90vw',
                                cursor: 'default'
                            }}
                            onClick={e => e.stopPropagation()}
                        >
                            <button
                                onClick={() => setSelectedItem(null)}
                                style={{
                                    position: 'absolute',
                                    top: 20,
                                    right: 20,
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    color: '#aaa'
                                }}
                            >
                                <X size={24} />
                            </button>

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

            {/* footer info */}
            <div style={{ position: 'absolute', bottom: 15, left: 0, right: 0, textAlign: 'center', fontSize: '0.7rem', color: '#ccc', zIndex: 10, pointerEvents: 'none' }}>
                <span style={{ pointerEvents: 'auto' }}>
                    2026 <a href="https://kaificial.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Kaificial</a>
                </span>
            </div>
        </div>
    );
}
