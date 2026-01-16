import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Search, MapPin, Send } from 'lucide-react';
import { api } from '../services/api';
import ParticleBackground from '../components/ParticleBackground';
import '../App.css';



function Home() {
    const [recipient, setRecipient] = useState('');
    const [customId, setCustomId] = useState('');
    const nav = useNavigate();

    const [isCreating, setIsCreating] = useState(false);
    const [linkError, setLinkError] = useState('');

    const handleCreate = async () => {
        if (!recipient.trim()) return alert("Who is this card for?");
        setIsCreating(true);
        setLinkError('');

        const finalId = customId.trim()
            ? customId.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')
            : Math.random().toString(36).substr(2, 9);

        try {
            const response = await api.createCard(finalId, "Anonymous", recipient);
            nav(`/card/${finalId}?recipient=${encodeURIComponent(recipient)}`);
        } catch (err) {
            console.error("Failed to create card:", err);

            // check if it's a 409 conflict since links might be taken
            if (err.response && err.response.status === 409) {
                setLinkError('This link is already taken. Please choose a different one.');
                setIsCreating(false);
            } else {
                // for other errors lets just navigate anyway 
                nav(`/card/${finalId}?recipient=${encodeURIComponent(recipient)}`);
            }
        } finally {
            if (!linkError) {
                setIsCreating(false);
            }
        }
    };

    const containerVariants = {
        hidden: { opacity: 0 },
        visible: {
            opacity: 1,
            transition: {
                staggerChildren: 0.15,
                delayChildren: 0.2
            }
        }
    };

    const itemVariants = {
        hidden: { y: 20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.8, ease: [0.16, 1, 0.3, 1] }
        }
    };

    const navVariants = {
        hidden: { y: -20, opacity: 0 },
        visible: {
            y: 0,
            opacity: 1,
            transition: { duration: 0.8, ease: "easeOut" }
        }
    };

    return (
        <motion.div
            className="hero-container"
            initial="hidden"
            animate="visible"
            variants={containerVariants}
        >
            <ParticleBackground />

            {/* background */}
            <motion.div
                className="hero-bg"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5 }}
            />

            <motion.div
                className="hero-overlay"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ duration: 1.5, delay: 0.2 }}
            />

            {/* nav */}
            <motion.nav className="glass-nav" variants={navVariants}>
                <div className="nav-brand">
                    <span className="brand-icon">
                        <Send size={24} />
                    </span> Scribl
                </div>

                <div className="nav-right">
                    <motion.button
                        className="btn-dark-pill"
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                    >
                        View more
                    </motion.button>
                </div>
            </motion.nav>

            {/* hero */}
            <div className="hero-content">
                <motion.h1 className="hero-title" variants={itemVariants}>
                    Create a collaborative <br />
                    <span className="text-serif-italic">Birthday Card & Experience</span>
                </motion.h1>

                <motion.p className="hero-subtitle" variants={itemVariants}>
                    For ppl who are tired of messy group chats for birthdays. Just a project I made to help people stay close, even when they're hundreds of kilometers apart.
                </motion.p>

                {/* search bar for making a card */}
                <motion.div
                    className="hero-search-bar shadow-soft"
                    variants={itemVariants}
                    whileHover={{ scale: 1.01, boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.15)' }}
                    transition={{ type: "spring", stiffness: 300, damping: 20 }}
                >
                    <div className="input-field">
                        <Send size={22} color="#444" style={{ transform: 'rotate(-45deg)', flexShrink: 0 }} />
                        <input
                            type="text"
                            placeholder="Recipient Name"
                            value={recipient}
                            onChange={(e) => setRecipient(e.target.value)}
                        />
                    </div>
                    <div className="divider" />
                    <div className="input-field" style={{ flex: 1.2 }}>
                        <span style={{ color: '#ccc', fontSize: '0.9rem' }}>/</span>
                        <input
                            type="text"
                            placeholder="custom-link"
                            value={customId}
                            onChange={(e) => setCustomId(e.target.value)}
                        />
                    </div>

                    <motion.button
                        className="btn-search"
                        onClick={handleCreate}
                        disabled={isCreating}
                        whileHover={{ backgroundColor: "#000" }}
                        whileTap={{ scale: 0.98 }}
                    >
                        {isCreating ? 'Creating...' : 'Create Now'}
                    </motion.button>
                </motion.div>

                {/* error display */}
                {linkError && (
                    <motion.div
                        initial={{ opacity: 0, y: -10 }}
                        animate={{ opacity: 1, y: 0 }}
                        style={{
                            marginTop: '1rem',
                            padding: '10px 20px',
                            background: 'rgba(255, 82, 82, 0.1)',
                            border: '1px solid rgba(255, 82, 82, 0.3)',
                            borderRadius: '12px',
                            color: '#ff5252',
                            fontSize: '0.85rem',
                            textAlign: 'center'
                        }}
                    >
                        {linkError}
                    </motion.div>
                )}

                {/* join a card */}
                <motion.div
                    style={{ marginTop: '2rem', display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '10px' }}
                    variants={itemVariants}
                >
                    <span style={{ fontSize: '0.9rem', color: '#666' }}>or join an already existing card</span>
                    <motion.div
                        className="glass-panel"
                        style={{ display: 'flex', padding: '4px 8px 4px 16px', borderRadius: '50px', alignItems: 'center', background: 'rgba(255,255,255,0.6)' }}
                        whileHover={{ background: 'rgba(255,255,255,0.8)' }}
                    >
                        <span style={{ fontSize: '0.9rem', color: '#999', marginRight: 4 }}>/card/</span>
                        <input
                            type="text"
                            placeholder="enter-code"
                            className="clean-input"
                            style={{ background: 'transparent', border: 'none', outline: 'none', width: '120px', fontSize: '0.9rem' }}
                            onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                    nav(`/card/${e.target.value}`);
                                }
                            }}
                        />
                        <motion.button
                            className="btn-dark-pill"
                            style={{ padding: '6px 16px', fontSize: '0.8rem' }}
                            onClick={(e) => {
                                const input = e.target.previousSibling;
                                if (input.value) nav(`/card/${input.value}`);
                            }}
                            whileHover={{ scale: 1.05 }}
                            whileTap={{ scale: 0.95 }}
                        >
                            Join
                        </motion.button>
                    </motion.div>
                </motion.div>
            </div>
            {/* footer */}
            <div style={{ position: 'absolute', bottom: 20, left: 0, right: 0, textAlign: 'center', fontSize: '0.75rem', color: 'rgba(0,0,0,0.4)', zIndex: 100, pointerEvents: 'none' }}>
                <span style={{ pointerEvents: 'auto' }}>
                    2026 <a href="https://kaificial.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Kaificial</a>
                </span>
            </div>
        </motion.div>
    );
}

export default Home;
