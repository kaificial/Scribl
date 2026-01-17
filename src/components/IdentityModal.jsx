import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { User, ArrowRight } from 'lucide-react';

export default function IdentityModal({ isOpen, onSave }) {
    const [name, setName] = useState('');

    const handleSubmit = (e) => {
        e.preventDefault();
        if (name.trim()) {
            onSave(name.trim());
        }
    };

    return (
        <AnimatePresence>
            {isOpen && (
                <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    style={{
                        position: 'fixed',
                        inset: 0,
                        backgroundColor: 'rgba(0, 0, 0, 0.4)',
                        backdropFilter: 'blur(8px)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        zIndex: 10000,
                        padding: '20px'
                    }}
                >
                    <motion.div
                        initial={{ scale: 0.9, opacity: 0, y: 20 }}
                        animate={{ scale: 1, opacity: 1, y: 0 }}
                        exit={{ scale: 0.9, opacity: 0, y: 20 }}
                        style={{
                            backgroundColor: 'rgba(255, 255, 255, 0.9)',
                            padding: '40px',
                            borderRadius: '32px',
                            width: '100%',
                            maxWidth: '440px',
                            boxShadow: '0 20px 60px rgba(0, 0, 0, 0.1)',
                            textAlign: 'center',
                            border: '1px solid rgba(255, 255, 255, 0.5)'
                        }}
                    >
                        <div style={{
                            width: '64px',
                            height: '64px',
                            backgroundColor: '#1a1a1a',
                            borderRadius: '20px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            margin: '0 auto 24px',
                            color: 'white'
                        }}>
                            <User size={32} />
                        </div>

                        <h2 style={{ fontSize: '1.75rem', marginBottom: '12px', fontWeight: 600 }}>Welcome to Scribl</h2>
                        <p style={{ color: '#666', marginBottom: '32px', lineHeight: 1.5 }}>
                            Before we start, what should we call you? Your name will appear next to your drawings and messages.
                        </p>

                        <form onSubmit={handleSubmit}>
                            <div style={{ position: 'relative', marginBottom: '24px' }}>
                                <input
                                    autoFocus
                                    type="text"
                                    value={name}
                                    onChange={(e) => setName(e.target.value)}
                                    placeholder="Enter your name"
                                    style={{
                                        width: '100%',
                                        padding: '16px 24px',
                                        borderRadius: '16px',
                                        border: '2px solid #eee',
                                        fontSize: '1.1rem',
                                        transition: 'all 0.3s ease',
                                        outline: 'none',
                                        fontFamily: 'inherit'
                                    }}
                                    onFocus={(e) => e.target.style.borderColor = '#1a1a1a'}
                                    onBlur={(e) => e.target.style.borderColor = '#eee'}
                                />
                            </div>

                            <button
                                type="submit"
                                disabled={!name.trim()}
                                style={{
                                    width: '100%',
                                    padding: '16px',
                                    borderRadius: '16px',
                                    border: 'none',
                                    backgroundColor: name.trim() ? '#1a1a1a' : '#eee',
                                    color: 'white',
                                    fontSize: '1.1rem',
                                    fontWeight: 600,
                                    cursor: name.trim() ? 'pointer' : 'default',
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center',
                                    gap: '8px',
                                    transition: 'all 0.3s ease'
                                }}
                            >
                                Get Started
                                <ArrowRight size={20} />
                            </button>
                        </form>
                    </motion.div>
                </motion.div>
            )}
        </AnimatePresence>
    );
}
