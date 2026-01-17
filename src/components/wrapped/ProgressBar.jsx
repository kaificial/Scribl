import React from 'react';
import { motion } from 'framer-motion';

export default function ProgressBar({ totalSlides, currentSlide }) {
    return (
        <div style={{
            position: 'fixed',
            top: 30,
            left: '50%',
            transform: 'translateX(-50%)',
            display: 'flex',
            gap: 12,
            zIndex: 1000,
            padding: '8px 20px',
            background: 'rgba(255, 252, 245, 0.95)',
            borderRadius: 30,
            border: '1px solid rgba(0, 0, 0, 0.1)',
            boxShadow: '0 2px 10px rgba(0,0,0,0.05)'
        }}>
            {Array.from({ length: totalSlides }).map((_, index) => (
                <div
                    key={index}
                    style={{
                        position: 'relative',
                        width: 6,
                        height: 6,
                        borderRadius: '50%',
                        background: index <= currentSlide
                            ? '#1a1a1a'
                            : 'rgba(26, 26, 26, 0.15)',
                        transition: 'all 0.3s ease'
                    }}
                >
                    {index === currentSlide && (
                        <motion.div
                            initial={{ scale: 0 }}
                            animate={{ scale: 1 }}
                            style={{
                                position: 'absolute',
                                inset: -4,
                                borderRadius: '50%',
                                border: '1px solid rgba(26, 26, 26, 0.3)'
                            }}
                        />
                    )}
                </div>
            ))}
        </div>
    );
}
