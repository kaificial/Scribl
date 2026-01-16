import React, { useEffect, useState, useRef } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Share2, Trash2, X, Pencil, Check, Settings, Gift, Edit, Eye } from 'lucide-react';
import { motion } from 'framer-motion';
import { CakeDoodle } from '../components/HandDrawnIcons';
import { api } from '../services/api';
import '../App.css';

const InteractiveItem = ({ item, type, isOwner, onUpdate, onDelete, onEdit, isViewMode }) => {
    // Manual drag logic for moving
    const handleMoveStart = (e) => {
        if (isViewMode) return;
        // check 
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
                transform: `translate(-50%, -50%) rotate(${item.rotation || 0}deg)`,
                cursor: !isViewMode ? 'grab' : 'default',
                zIndex: !isViewMode ? 10 : 1,
                touchAction: 'none',
                userSelect: 'none',
                border: (!isOwner && !isViewMode) ? '1px dashed rgba(0,0,0,0.1)' : 'none',
                borderRadius: '8px'
            }}
        >
            <div style={{ position: 'relative', width: '100%', height: '100%' }}>

                {/* Control buttons (delete/edit) - not in view mode */}
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
                        {/* Resize  */}
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

                        {/* Rotate  */}
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
    const [card, setCard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [viewMode, setViewMode] = useState(false);
    const currentUserId = localStorage.getItem('userId');

    const recipient = card?.recipientName || searchParams.get('recipient') || "Friend";
    useEffect(() => {
        setIsLoading(true);
        const urlRecipient = searchParams.get('recipient');

        api.getCard(id)
            .then(data => {
                if (data) {
                    setCard(data);
                    // If DB card is missing recipient name but we have it in URL, update DB
                    if (!data.recipientName && urlRecipient) {
                        api.createCard(id, data.creatorName || "Anonymous", urlRecipient)
                            .then(updated => setCard(updated))
                            .catch(console.error);
                    }
                } else if (urlRecipient) {
                    api.createCard(id, "Anonymous", urlRecipient)
                        .then(newCard => setCard(newCard))
                        .catch(console.error);
                } else {
                    // Initialize empty local state if card not found in the DB yet
                    setCard({ id, messages: [], drawings: [] });
                }
            })
            .catch(err => {
                console.error("Fetch failed:", err);
                setCard({ id, messages: [], drawings: [] });
            })
            .finally(() => setIsLoading(false));
    }, [id, searchParams]);

    const refreshCard = () => {
        api.getCard(id).then(data => data && setCard(data)).catch(console.error);
    };

    const handleUpdate = async (itemId, type, updates) => {
        setCard(prev => {
            const newCard = { ...prev };
            if (type === 'message') {
                newCard.messages = newCard.messages.map(m => m.id === itemId ? { ...m, ...updates } : m);
            } else {
                newCard.drawings = newCard.drawings.map(d => d.id === itemId ? { ...d, ...updates } : d);
            }
            return newCard;
        });

        try {
            if (type === 'message') await api.updateMessage(id, itemId, updates);
            else await api.updateDrawing(id, itemId, updates);
        } catch (err) {
            console.error(err);
        }
    };

    const handleDelete = async (itemId, type) => {
        if (!window.confirm("Are you sure you want to delete this?")) return;

        setCard(prev => {
            const newCard = { ...prev };
            if (type === 'message') {
                newCard.messages = newCard.messages.filter(m => m.id !== itemId);
            } else {
                newCard.drawings = newCard.drawings.filter(d => d.id !== itemId);
            }
            return newCard;
        });

        try {
            if (type === 'message') await api.deleteMessage(id, itemId);
            else await api.deleteDrawing(id, itemId);
        } catch (err) {
            console.error("Delete failed:", err);
            refreshCard();
            alert("Failed to delete item.");
        }
    };

    const handleEdit = (itemId, type) => {
        const recipientName = searchParams.get('recipient');
        if (type === 'drawing') {
            nav(`/card/${id}/write?drawingId=${itemId}&recipient=${encodeURIComponent(recipientName || '')}`);
        }
    };

    if (isLoading) return <div className="app-container">Loading...</div>;
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
            {/* Header */}
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

                <div style={{ pointerEvents: 'auto', display: 'flex', gap: 10 }}>
                    <motion.button
                        onClick={() => nav(`/gift/${id}/edit`)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            background: 'white',
                            border: '1px solid rgba(26, 26, 26, 0.2)',
                            borderRadius: '50%',
                            width: 50,
                            height: 50,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            color: '#1a1a1a'
                        }}
                        title="Edit Wrapped Experience"
                    >
                        <Edit size={20} />
                    </motion.button>

                    <motion.button
                        onClick={() => nav(`/card/${id}/recipient`)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                        style={{
                            background: 'white',
                            border: '1px solid rgba(26, 26, 26, 0.2)',
                            borderRadius: '50%',
                            width: 50,
                            height: 50,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            boxShadow: '0 2px 10px rgba(0,0,0,0.1)',
                            color: '#1a1a1a'
                        }}
                        title="Preview Recipient View"
                    >
                        <Eye size={20} />
                    </motion.button>

                    <motion.button
                        onClick={() => nav(`/gift/${id}`)}
                        animate={{
                            scale: [1, 1.05, 1],
                            boxShadow: [
                                '0 2px 10px rgba(255, 215, 0, 0.3)',
                                '0 4px 20px rgba(255, 215, 0, 0.6)',
                                '0 2px 10px rgba(255, 215, 0, 0.3)'
                            ]
                        }}
                        transition={{
                            duration: 2,
                            repeat: Infinity,
                            ease: "easeInOut"
                        }}
                        style={{
                            background: 'linear-gradient(135deg, #FFD700 0%, #FFA500 100%)',
                            border: 'none',
                            borderRadius: '50%',
                            width: 50,
                            height: 50,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'pointer',
                            color: 'white'
                        }}
                        title="View Gift Experience"
                    >
                        <Gift size={24} />
                    </motion.button>
                </div>
            </div>

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

            {/* Toggle view/edit mode button */}
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
                            <Settings size={16} /> Unlock Layout
                        </>
                    ) : (
                        <>
                            <Check size={16} /> Done
                        </>
                    )}
                </button>
            </div>
            {/* footer */}
            <div style={{ position: 'absolute', bottom: 15, left: 0, right: 0, textAlign: 'center', fontSize: '0.7rem', color: '#ccc', zIndex: 10, pointerEvents: 'none' }}>
                <span style={{ pointerEvents: 'auto' }}>
                    2026 <a href="https://kaificial.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Kaificial</a>
                </span>
            </div>
        </div>
    );
}
