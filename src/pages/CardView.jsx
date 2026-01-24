import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Share2, Trash2, X, Pencil, Check, Settings, Gift, Edit, Eye, Sparkles } from 'lucide-react';
import { motion } from 'framer-motion';
import { CakeDoodle } from '../components/HandDrawnIcons';
import { api } from '../services/api';
import { useCard } from '../hooks/useCard';
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

const InteractiveItem = ({ item, type, isOwner, onUpdate, onDelete, onEdit, isViewMode }) => {
    // manual drag logic for moving things around
    const handleMoveStart = (e) => {
        if (isViewMode) return;
        // just a check
        if (e.target.dataset.handle || e.target.closest('button')) return;

        e.preventDefault();
        e.stopPropagation();

        const startX = e.clientX;
        const startY = e.clientY;

        const container = e.target.closest('.canvas-container').getBoundingClientRect();

        const initialPxX = (item.x / 100) * container.width;
        const initialPxY = (item.y / 100) * container.height;

        const onMove = (moveEvent) => {
            moveEvent.preventDefault();
            moveEvent.stopPropagation();

            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            const newPxX = initialPxX + dx;
            const newPxY = initialPxY + dy;

            const newPercentX = (newPxX / container.width) * 100;
            const newPercentY = (newPxY / container.height) * 100;

            onUpdate(item.id, type, { x: newPercentX, y: newPercentY });
        };

        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    const handleResizeStart = (e) => {
        if (isViewMode) return;
        e.preventDefault();
        e.stopPropagation();

        const startWidth = item.width || (type === 'message' ? 300 : 400);
        const startX = e.clientX;

        const onMove = (moveEvent) => {
            moveEvent.preventDefault();
            moveEvent.stopPropagation();
            const delta = moveEvent.clientX - startX;
            const newWidth = Math.max(100, startWidth + delta);
            onUpdate(item.id, type, { width: newWidth });
        };

        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    const handleRotateStart = (e) => {
        if (isViewMode) return;
        e.preventDefault();
        e.stopPropagation();

        const rect = e.target.parentElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const startRotation = item.rotation || 0;

        const onMove = (moveEvent) => {
            moveEvent.preventDefault();
            moveEvent.stopPropagation();
            const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
            const deg = (currentAngle - startAngle) * (180 / Math.PI);
            onUpdate(item.id, type, { rotation: startRotation + deg });
        };

        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    return (
        <div
            onPointerDown={handleMoveStart}
            style={{
                position: 'absolute',
                left: `${item.x}%`,
                top: `${item.y}%`,
                width: item.width ? `${item.width}px` : (type === 'message' ? '300px' : '400px'),
                transform: `translate3d(-50%, -50%, 0) rotate(${item.rotation || 0}deg)`,
                WebkitTransform: `translate3d(-50%, -50%, 0) rotate(${item.rotation || 0}deg)`,
                willChange: 'transform',
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden',
                cursor: !isViewMode ? 'grab' : 'default',
                zIndex: !isViewMode ? 10 : 1,
                touchAction: 'none',
                userSelect: 'none',
                border: (!isOwner && !isViewMode) ? '1px dashed rgba(0,0,0,0.1)' : 'none',
                borderRadius: '8px'
            }}
        >
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>

                {/* edit and delete buttons only for owners */}
                {(isOwner && !isViewMode) && (
                    <div style={{ position: 'absolute', top: -15, right: -15, display: 'flex', gap: 5, zIndex: 300 }}>
                        {isOwner && type === 'drawing' && (
                            <button
                                onClick={(e) => { e.stopPropagation(); onEdit(item.id, type); }}
                                style={{
                                    background: '#4b89dc', color: 'white',
                                    borderRadius: '50%', border: '2px solid white',
                                    width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                    cursor: 'pointer',
                                    boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                                }}
                                title="Edit"
                            >
                                <Pencil size={14} />
                            </button>
                        )}

                        <button
                            onClick={(e) => { e.stopPropagation(); onDelete(item.id, type); }}
                            style={{
                                background: '#ff5252', color: 'white',
                                borderRadius: '50%', border: '2px solid white',
                                width: 28, height: 28, display: 'flex', alignItems: 'center', justifyContent: 'center',
                                cursor: 'pointer',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }}
                            title="Delete"
                        >
                            <X size={16} />
                        </button>
                    </div>
                )}

                {type === 'message' ? (
                    <div style={{
                        padding: '10px',
                        background: 'transparent',
                        minHeight: 50,
                        border: (isOwner && !isViewMode) ? '1px dashed #bbb' : 'none',
                        borderRadius: '4px'
                    }}>
                        <div dangerouslySetInnerHTML={{ __html: item.content }} style={{ fontFamily: 'var(--font-serif)', fontSize: '1.2rem', margin: 0, color: '#1a1a1a' }} />
                        <div style={{ textAlign: 'right', marginTop: 10, color: '#aaa', fontStyle: 'italic', fontSize: '0.8rem' }}>
                            — {item.authorName || 'Guest'}
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

                {!isViewMode && (
                    <>
                        {/* resize handle */}
                        <div
                            data-handle="resize"
                            onPointerDown={handleResizeStart}
                            style={{
                                width: 24, height: 24,
                                background: '#fff',
                                border: '2px solid #333',
                                borderRadius: '50%',
                                position: 'absolute',
                                right: -12, bottom: -12,
                                cursor: 'nwse-resize',
                                zIndex: 100,
                                display: 'grid', placeItems: 'center',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }}
                        >
                            <div style={{ width: 8, height: 8, background: '#333', borderRadius: '50%', pointerEvents: 'none' }} />
                        </div>

                        {/* rotate handle */}
                        <div
                            data-handle="rotate"
                            onPointerDown={handleRotateStart}
                            style={{
                                width: 24, height: 24,
                                background: '#fff',
                                border: '2px solid #333',
                                borderRadius: '50%',
                                position: 'absolute',
                                left: '50%', top: -40,
                                transform: 'translateX(-50%)',
                                cursor: 'ew-resize',
                                zIndex: 100,
                                display: 'grid', placeItems: 'center',
                                boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                            }}
                        >
                            <div style={{ width: 2, height: 10, background: '#333', transform: 'rotate(45deg)', pointerEvents: 'none' }} />
                            <div style={{ width: 1, height: 20, background: '#333', position: 'absolute', bottom: -20, zIndex: -1, pointerEvents: 'none' }} />
                        </div>
                    </>
                )}
            </div>
        </div>
    );
};

export default function CardView() {
    const { id } = useParams();
    const nav = useNavigate();
    const [searchParams] = useSearchParams();
    const { card, isLoading, mutate } = useCard(id);
    const [viewMode, setViewMode] = useState(false);
    const currentUserId = localStorage.getItem('userId');

    const recipient = card?.recipientName || searchParams.get('recipient') || "Friend";

    // Sync recipient if missing in DB but present in URL
    useEffect(() => {
        if (card && !card.recipientName) {
            const urlRecipient = searchParams.get('recipient');
            if (urlRecipient) {
                api.createCard(id, card.creatorName || "Anonymous", urlRecipient)
                    .then(updated => mutate(updated))
                    .catch(console.error);
            }
        }
    }, [card, id, searchParams, mutate]);

    const refreshCard = () => {
        mutate(null); // Clear cache to force real refresh
    };

    const handleUpdate = async (itemId, type, updates) => {
        const newCard = { ...card };
        if (type === 'message') {
            newCard.messages = newCard.messages.map(m => m.id === itemId ? { ...m, ...updates } : m);
        } else {
            newCard.drawings = newCard.drawings.map(d => d.id === itemId ? { ...d, ...updates } : d);
        }
        mutate(newCard); // Optimistic update

        try {
            if (type === 'message') await api.updateMessage(id, itemId, updates);
            else await api.updateDrawing(id, itemId, updates);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (itemId, type) => {
        if (!window.confirm("Are you sure you want to delete this?")) return;

        const newCard = { ...card };
        if (type === 'message') {
            newCard.messages = newCard.messages.filter(m => m.id !== itemId);
        } else {
            newCard.drawings = newCard.drawings.filter(d => d.id !== itemId);
        }
        mutate(newCard); // Optimistic update

        try {
            if (type === 'message') await api.deleteMessage(id, itemId);
            else await api.deleteDrawing(id, itemId);
        } catch (err) {
            console.error("Delete failed:", err);
            alert("Failed to delete item.");
        }
    };

    const handleEdit = (itemId, type) => {
        const recipientName = searchParams.get('recipient');
        if (type === 'drawing') {
            nav(`/card/${id}/write?drawingId=${itemId}&recipient=${encodeURIComponent(recipientName || '')}`);
        }
    };

    if (isLoading && !card) {
        return (
            <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                    <div className="text-serif-italic" style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: '#666' }}>Opening the card...</div>
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
    if (!card) return <div className="app-container">Card could not be loaded.</div>;

    const handleDashboard = () => {
        nav(`/card/${id}?recipient=${encodeURIComponent(recipient)}`);
    };

    return (
        <div className="canvas-container" style={{
            position: 'fixed', inset: 0,
            background: '#ffffff',
            overflow: 'hidden'
        }}>
            <CelebrationBalloons count={25} fast={true} />
            {/* header section */}
            <div style={{ position: 'absolute', top: 20, left: 20, right: 20, zIndex: 1000, display: 'flex', justifyContent: 'space-between', pointerEvents: 'none' }}>
                <div style={{ pointerEvents: 'auto', display: 'flex', alignItems: 'center', gap: '15px' }}>
                    <button
                        onClick={handleDashboard}
                        style={{
                            background: 'rgba(255,255,255,0.8)',
                            backdropFilter: 'blur(10px)',
                            border: '1px solid rgba(0,0,0,0.05)',
                            color: '#1a1a1a',
                            fontSize: '0.9rem',
                            fontWeight: 500,
                            cursor: 'pointer',
                            padding: '6px 16px',
                            borderRadius: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 5,
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)'
                        }}
                    >
                        <ArrowLeft size={16} />
                        Dashboard
                    </button>

                    <div className="glass-panel" style={{
                        padding: '6px 20px',
                        borderRadius: '50px',
                        fontSize: '0.9rem',
                        color: '#333',
                        fontWeight: 500,
                        background: 'rgba(255,255,255,0.8)',
                        backdropFilter: 'blur(10px)',
                        border: '1px solid rgba(0,0,0,0.05)',
                        boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 10
                    }}>
                        <span>Card for <span className="text-serif-italic" style={{ color: '#000' }}>{recipient}</span></span>
                        {!viewMode && (
                            <div style={{ padding: '2px 8px', background: '#333', color: 'white', borderRadius: 12, fontSize: '0.65rem', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                                Arrange Mode
                            </div>
                        )}
                    </div>
                </div>

                <div style={{ pointerEvents: 'auto', display: 'flex', gap: 12 }}>
                    <motion.button
                        onClick={() => nav(`/card/${id}/recipient`)}
                        whileHover={{ scale: 1.05, backgroundColor: '#f8f8f8' }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            background: 'white',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: '50px',
                            padding: '10px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                            color: '#555',
                            fontSize: '0.85rem',
                            fontWeight: 600
                        }}
                    >
                        <Eye size={18} />
                        <span>Preview the Card</span>
                    </motion.button>

                    <motion.button
                        onClick={() => nav(`/gift/${id}/edit`)}
                        whileHover={{ scale: 1.05, backgroundColor: '#f8f8f8' }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            background: 'white',
                            border: '1px solid rgba(0, 0, 0, 0.1)',
                            borderRadius: '50px',
                            padding: '10px 20px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 10,
                            cursor: 'pointer',
                            boxShadow: '0 4px 15px rgba(0,0,0,0.05)',
                            color: '#555',
                            fontSize: '0.85rem',
                            fontWeight: 600
                        }}
                    >
                        <Sparkles size={18} color="#d4af37" />
                        <span>Customize the Final Experience</span>
                    </motion.button>

                    <motion.button
                        onClick={() => nav(`/gift/${id}`)}
                        animate={{
                            scale: [1, 1.02, 1],
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)',
                            border: 'none',
                            borderRadius: '50px',
                            padding: '12px 28px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 12,
                            cursor: 'pointer',
                            color: 'white',
                            fontSize: '0.9rem',
                            fontWeight: 700,
                            boxShadow: '0 4px 20px rgba(0,0,0,0.2)'
                        }}
                    >
                        <Gift size={20} />
                        <span>Open the Final Experience</span>
                    </motion.button>
                </div>
            </div>

            <AnimatedBirthday name={recipient} delay={5000} />

            {(card?.drawings?.length === 0 && card?.messages?.length === 0) && (
                <div style={{ position: 'absolute', top: '50%', left: '50%', transform: 'translate(-50%, -50%)', color: '#ccc', textAlign: 'center', pointerEvents: 'none' }}>
                    <CakeDoodle size={100} style={{ opacity: 0.2 }} />
                    <p style={{ fontFamily: 'var(--font-sans)', marginTop: 20 }}>The canvas is empty... be the first!</p>
                </div>
            )}

            {card.drawings?.map(d => (
                <InteractiveItem
                    key={d.id}
                    item={d}
                    type="drawing"
                    isOwner={d.userId === currentUserId}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    onEdit={handleEdit}
                    isViewMode={viewMode}
                />
            ))}
            {card.messages?.map(m => (
                <InteractiveItem
                    key={m.id}
                    item={m}
                    type="message"
                    isOwner={m.userId === currentUserId}
                    onUpdate={handleUpdate}
                    onDelete={handleDelete}
                    isViewMode={viewMode}
                />
            ))}

            {/* button to switch between view and edit mode */}
            <div style={{ position: 'absolute', bottom: 30, right: 30, zIndex: 1000 }}>
                <button
                    onClick={() => setViewMode(!viewMode)}
                    className="btn-dark-pill"
                    style={{
                        padding: '10px 20px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        boxShadow: '0 4px 15px rgba(0,0,0,0.2)'
                    }}
                >
                    {viewMode ? (
                        <>
                            <Settings size={18} />
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Rearrange Elements</span>
                                <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>Unlock layout to move things</span>
                            </div>
                        </>
                    ) : (
                        <>
                            <Check size={18} color="#4CAF50" />
                            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-start' }}>
                                <span style={{ fontSize: '0.85rem', fontWeight: 700 }}>Finish Arranging</span>
                                <span style={{ fontSize: '0.65rem', opacity: 0.7 }}>Save and lock layout</span>
                            </div>
                        </>
                    )}
                </button>
            </div>
            {/* click to enlarge hint */}
            {viewMode && (
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
                        letterSpacing: '0.7px',
                        textTransform: 'uppercase'
                    }}>
                        <span>Click any message to enlargen</span>
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
