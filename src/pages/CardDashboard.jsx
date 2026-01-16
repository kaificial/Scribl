import React, { useState } from 'react';
import { useParams, useSearchParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Link2, PenTool, Type, Eye, ArrowLeft } from 'lucide-react';
import { CakeDoodle, StarDoodle } from '../components/HandDrawnIcons';
import '../App.css';
import { api } from '../services/api';

export default function CardDashboard() {
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const nav = useNavigate();

    const [card, setCard] = useState(null);
    const [isLoading, setIsLoading] = useState(true);
    const [copiedInvite, setCopiedInvite] = useState(false);
    const [copiedGift, setCopiedGift] = useState(false);

    React.useEffect(() => {
        const urlRecipient = searchParams.get('recipient');

        api.getCard(id).then(data => {
            if (data) {
                setCard(data);
                // if db card is missing recipient name but we have it in url, update the db
                if (!data.recipientName && urlRecipient) {
                    api.createCard(id, data.creatorName || "Anonymous", urlRecipient)
                        .then(updated => setCard(updated))
                        .catch(console.error);
                }
            } else if (urlRecipient) {
                // auto-create on join if we have the name but it's not in the db yet
                api.createCard(id, "Anonymous", urlRecipient)
                    .then(newCard => setCard(newCard))
                    .catch(console.error);
            }
            setIsLoading(false);
        }).catch(err => {
            console.error(err);
            setIsLoading(false);
        });
    }, [id, searchParams]);

    const recipient = card?.recipientName || searchParams.get('recipient') || "Friend";

    const inviteLink = `${window.location.origin}/card/${id}?recipient=${encodeURIComponent(recipient)}`;
    const giftLink = `${window.location.origin}/gift/${id}`;

    const copyLink = (link, type) => {
        navigator.clipboard.writeText(link);
        if (type === 'invite') {
            setCopiedInvite(true);
            setTimeout(() => setCopiedInvite(false), 2000);
        } else {
            setCopiedGift(true);
            setTimeout(() => setCopiedGift(false), 2000);
        }
    };

    if (isLoading) return <div className="app-container">Loading dashboard...</div>;

    return (
        <div className="app-container">
            <motion.div
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                className="glass-panel"
                style={{
                    padding: '3rem',
                    borderRadius: '30px',
                    textAlign: 'center',
                    maxWidth: '650px',
                    width: '95%',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: '2rem',
                    background: 'rgba(255, 255, 255, 0.9)',
                    boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)'
                }}
            >
                <div style={{ position: 'absolute', top: 20, left: 30 }}>
                    <button
                        onClick={() => nav('/')}
                        style={{
                            background: 'none',
                            border: 'none',
                            color: '#aaa',
                            fontSize: '0.8rem',
                            cursor: 'pointer',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '4px'
                        }}
                    >
                        <ArrowLeft size={14} /> Home
                    </button>
                </div>

                <div>
                    <h1 style={{ marginTop: '0.5rem', fontWeight: 400 }}>
                        Card for <span className="text-serif-italic" style={{ fontSize: '1.2em', color: '#1a1a1a' }}>{recipient}</span>
                    </h1>
                </div>

                <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem', textAlign: 'left' }}>
                    {/* friend link */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: '#666', fontWeight: 500 }}>1. Share with Friends</label>
                        <div style={{ padding: '12px 16px', background: '#f8f8f8', borderRadius: '12px', border: '1px solid rgba(0,0,0,0.05)', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                            <span style={{ fontSize: '0.8rem', color: '#888', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>Join link...</span>
                            <button onClick={() => copyLink(inviteLink, 'invite')} style={{ border: 'none', background: 'none', color: '#4b89dc', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                                {copiedInvite ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <p style={{ fontSize: '0.7rem', color: '#999' }}>Friends can add messages and stickers.</p>
                    </div>

                    {/* recipient link */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                        <label style={{ fontSize: '0.85rem', color: '#666', fontWeight: 500 }}>2. Share with {recipient}</label>
                        <div style={{ padding: '12px 16px', background: 'linear-gradient(135deg, #1a1a1a 0%, #333 100%)', borderRadius: '12px', color: 'white', display: 'flex', justifyContent: 'space-between', alignItems: 'center', boxShadow: '0 4px 12px rgba(0,0,0,0.1)' }}>
                            <span style={{ fontSize: '0.8rem', color: 'rgba(255,255,255,0.7)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: '140px' }}>Gift link...</span>
                            <button onClick={() => copyLink(giftLink, 'gift')} style={{ border: 'none', background: 'none', color: '#fff', fontSize: '0.85rem', fontWeight: 600, cursor: 'pointer' }}>
                                {copiedGift ? 'Copied!' : 'Copy'}
                            </button>
                        </div>
                        <p style={{ fontSize: '0.7rem', color: '#999' }}>The final "Birthday Wrapped" experience.</p>
                    </div>
                </div>

                <div style={{ width: '100%', height: '1px', background: 'rgba(0,0,0,0.05)' }} />

                {/* choice */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1.5rem', alignItems: 'center' }}>
                    <button
                        className="btn-dark-pill"
                        onClick={() => nav(`/card/${id}/write?recipient=${encodeURIComponent(recipient)}`)}
                        style={{
                            padding: '1.2rem 3rem',
                            fontSize: '1.1rem',
                            width: '100%',
                            maxWidth: '350px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            gap: '12px',
                            boxShadow: '0 10px 30px rgba(0,0,0,0.1)'
                        }}
                    >
                        <PenTool size={22} />
                        Make a Message
                    </button>

                    <button
                        className="dash-btn"
                        onClick={() => nav(`/card/${id}/view?recipient=${encodeURIComponent(recipient)}`)}
                        style={{
                            width: '100%',
                            maxWidth: '350px',
                            border: '1px solid rgba(0,0,0,0.1)',
                            background: 'white',
                            color: '#1a1a1a'
                        }}
                    >
                        <Eye size={20} />
                        View the Full Card
                    </button>

                    <p style={{ marginTop: '0.5rem', fontSize: '0.85rem', color: '#888', fontStyle: 'italic' }}>
                        Add hand-drawn notes with your iPad/Tablet, Pictures, and/or typed out messages.
                    </p>
                </div>

            </motion.div>
            {/* footer */}
            <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: '0.75rem', color: '#aaa', zIndex: 10, pointerEvents: 'none' }}>
                <span style={{ pointerEvents: 'auto' }}>
                    2026 <a href="https://kaificial.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Kaificial</a>
                </span>
            </div>
        </div>
    );
}
