import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { ChevronLeft, ChevronRight, Heart, MessageCircle, Send, Bookmark, MoreHorizontal } from 'lucide-react';

export default function ContributorsSlide({ isActive, carouselPhotos, customUsername, customVerified, customCaption, customTitle, customSubtitle }) {
    const [currentIndex, setCurrentIndex] = useState(0);
    const [direction, setDirection] = useState(0);
    const [likeCount, setLikeCount] = useState(0);

    const photos = carouselPhotos && carouselPhotos.length > 0 ? carouselPhotos : [];
    const hasPhotos = photos.length > 0;

    const nextPhoto = () => {
        setDirection(1);
        setCurrentIndex((prev) => (prev + 1) % photos.length);
    };

    const prevPhoto = () => {
        setDirection(-1);
        setCurrentIndex((prev) => (prev - 1 + photos.length) % photos.length);
    };

    const goToPhoto = (index) => {
        setDirection(index > currentIndex ? 1 : -1);
        setCurrentIndex(index);
    };

    const variants = {
        enter: (direction) => ({
            x: direction > 0 ? 300 : -300,
            opacity: 0
        }),
        center: {
            x: 0,
            opacity: 1
        },
        exit: (direction) => ({
            x: direction < 0 ? 300 : -300,
            opacity: 0
        })
    };

    return (
        <div style={{
            width: '100%',
            height: '100vh',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            justifyContent: 'center',
            background: '#fffcf5',
            padding: '20px',
            position: 'relative',
            overflow: 'hidden'
        }}>
            {/* background pattern */}
            <div style={{
                position: 'absolute',
                inset: 0,
                backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%231a1a1a' fill-opacity='0.02'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                opacity: 0.4,
                pointerEvents: 'none'
            }} />

            {hasPhotos ? (
                <div style={{
                    maxWidth: 550,
                    width: '100%',
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    gap: 30,
                    position: 'relative',
                    zIndex: 1
                }}>
                    {/* title and subtitle area */}
                    <motion.div
                        initial={{ opacity: 0, y: 20 }}
                        animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                        transition={{ duration: 0.8 }}
                        style={{
                            textAlign: 'center',
                            width: '100%'
                        }}
                    >
                        <h2 style={{
                            fontSize: 'clamp(1.5rem, 4vw, 2rem)',
                            fontWeight: 400,
                            color: '#1a1a1a',
                            marginBottom: 12,
                            fontFamily: 'var(--font-serif)',
                            letterSpacing: '-0.01em'
                        }}>
                            {customTitle || "A Year in Moments"}
                        </h2>
                        <p style={{
                            fontSize: 'clamp(0.9rem, 2.5vw, 1rem)',
                            color: 'rgba(26, 26, 26, 0.6)',
                            fontStyle: 'italic',
                            whiteSpace: 'pre-line'
                        }}>
                            {customSubtitle || "Memories captured, moments cherished"}
                        </p>
                    </motion.div>

                    {/* instagram looking card */}
                    <motion.div
                        initial={{ opacity: 0, scale: 0.95 }}
                        animate={isActive ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
                        transition={{ duration: 0.8, delay: 0.2 }}
                        style={{
                            maxWidth: 470,
                            width: '100%',
                            background: 'white',
                            borderRadius: 8,
                            border: '1px solid rgba(219, 219, 219, 1)',
                            overflow: 'hidden',
                            boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                        }}
                    >
                        {/* header in instagram style */}
                        <div style={{
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            padding: '14px 16px',
                            borderBottom: '1px solid rgba(239, 239, 239, 1)'
                        }}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                                {/* circle for profile pic */}
                                <div style={{
                                    width: 32,
                                    height: 32,
                                    borderRadius: '50%',
                                    background: 'linear-gradient(45deg, #f09433 0%, #e6683c 25%, #dc2743 50%, #cc2366 75%, #bc1888 100%)',
                                    padding: 2,
                                    display: 'flex',
                                    alignItems: 'center',
                                    justifyContent: 'center'
                                }}>
                                    <div style={{
                                        width: '100%',
                                        height: '100%',
                                        borderRadius: '50%',
                                        background: 'white',
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        fontSize: '1rem'
                                    }}>
                                        🎂
                                    </div>
                                </div>

                                {/* username and blue badge */}
                                <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                    <span style={{
                                        fontSize: '14px',
                                        fontWeight: 600,
                                        color: '#262626'
                                    }}>
                                        {customUsername || "year.in.review"}
                                    </span>
                                    {(customVerified !== false) && (
                                        <svg width="12" height="12" viewBox="0 0 40 40" fill="none">
                                            <path d="M19.9998 1.66675L25.2915 13.8334L38.3332 15.2084L28.6248 24.0417L31.0832 36.9167L19.9998 30.5001L8.9165 36.9167L11.3748 24.0417L1.6665 15.2084L14.7082 13.8334L19.9998 1.66675Z" fill="#0095F6" />
                                        </svg>
                                    )}
                                    <span style={{
                                        fontSize: '14px',
                                        color: '#8e8e8e',
                                        marginLeft: 4
                                    }}>
                                        • 1w
                                    </span>
                                </div>
                            </div>

                            <button style={{
                                background: 'none',
                                border: 'none',
                                cursor: 'pointer',
                                padding: 8
                            }}>
                                <MoreHorizontal size={20} color="#262626" />
                            </button>
                        </div>

                        {/* sliding images */}
                        <div style={{
                            position: 'relative',
                            width: '100%',
                            aspectRatio: '1',
                            background: '#fafafa',
                            overflow: 'hidden'
                        }}>
                            <AnimatePresence initial={false} custom={direction}>
                                <motion.img
                                    key={currentIndex}
                                    src={photos[currentIndex]}
                                    alt={`Memory ${currentIndex + 1}`}
                                    custom={direction}
                                    variants={variants}
                                    initial="enter"
                                    animate="center"
                                    exit="exit"
                                    transition={{
                                        x: { type: "spring", stiffness: 200, damping: 25 },
                                        opacity: { duration: 0.4, ease: "easeInOut" }
                                    }}
                                    style={{
                                        position: 'absolute',
                                        width: '100%',
                                        height: '100%',
                                        objectFit: 'cover'
                                    }}
                                />
                            </AnimatePresence>

                            {/* arrows to move between photos */}
                            {photos.length > 1 && (
                                <>
                                    {currentIndex > 0 && (
                                        <button
                                            onClick={prevPhoto}
                                            style={{
                                                position: 'absolute',
                                                left: 12,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'rgba(255, 255, 255, 0.85)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: 30,
                                                height: 30,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                zIndex: 10
                                            }}
                                        >
                                            <ChevronLeft size={18} color="#000" />
                                        </button>
                                    )}
                                    {currentIndex < photos.length - 1 && (
                                        <button
                                            onClick={nextPhoto}
                                            style={{
                                                position: 'absolute',
                                                right: 12,
                                                top: '50%',
                                                transform: 'translateY(-50%)',
                                                background: 'rgba(255, 255, 255, 0.85)',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: 30,
                                                height: 30,
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                cursor: 'pointer',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.1)',
                                                zIndex: 10
                                            }}
                                        >
                                            <ChevronRight size={18} color="#000" />
                                        </button>
                                    )}
                                </>
                            )}

                            {/* little dots for progress */}
                            {photos.length > 1 && (
                                <div style={{
                                    position: 'absolute',
                                    bottom: 12,
                                    left: '50%',
                                    transform: 'translateX(-50%)',
                                    display: 'flex',
                                    gap: 4,
                                    zIndex: 10
                                }}>
                                    {photos.map((_, idx) => (
                                        <div
                                            key={idx}
                                            onClick={() => goToPhoto(idx)}
                                            style={{
                                                width: 6,
                                                height: 6,
                                                borderRadius: '50%',
                                                background: currentIndex === idx
                                                    ? '#0095F6'
                                                    : 'rgba(255, 255, 255, 0.6)',
                                                cursor: 'pointer',
                                                transition: 'all 0.2s ease'
                                            }}
                                        />
                                    ))}
                                </div>
                            )}
                        </div>

                        {/* like and comment buttons */}
                        <div style={{
                            padding: '12px 16px'
                        }}>
                            <div style={{
                                display: 'flex',
                                justifyContent: 'space-between',
                                alignItems: 'center'
                            }}>
                                <div style={{ display: 'flex', gap: 16 }}>
                                    <button
                                        onClick={() => setLikeCount(prev => prev + 1)}
                                        style={{
                                            background: 'none',
                                            border: 'none',
                                            cursor: 'pointer',
                                            padding: 0
                                        }}
                                    >
                                        <motion.div
                                            animate={{ scale: likeCount > 0 ? [1, 1.3, 1] : 1 }}
                                            transition={{ duration: 0.3 }}
                                        >
                                            <Heart
                                                size={24}
                                                color={likeCount > 0 ? '#ed4956' : '#262626'}
                                                fill={likeCount > 0 ? '#ed4956' : 'none'}
                                                strokeWidth={likeCount > 0 ? 0 : 2}
                                            />
                                        </motion.div>
                                    </button>
                                    <button style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 0
                                    }}>
                                        <MessageCircle size={24} color="#262626" strokeWidth={2} />
                                    </button>
                                    <button style={{
                                        background: 'none',
                                        border: 'none',
                                        cursor: 'pointer',
                                        padding: 0
                                    }}>
                                        <Send size={24} color="#262626" strokeWidth={2} />
                                    </button>
                                </div>
                                <button style={{
                                    background: 'none',
                                    border: 'none',
                                    cursor: 'pointer',
                                    padding: 0
                                }}>
                                    <Bookmark size={24} color="#262626" strokeWidth={2} />
                                </button>
                            </div>
                        </div>

                        {/* caption and stuff */}
                        <div style={{ padding: '0 16px 16px 16px' }}>
                            <div style={{
                                fontSize: '14px',
                                fontWeight: 600,
                                color: '#262626',
                                marginBottom: 8
                            }}>
                                {photos.length + likeCount} likes
                            </div>

                            <div style={{
                                fontSize: '14px',
                                color: '#262626',
                                lineHeight: 1.5
                            }}>
                                <span style={{ fontWeight: 600, marginRight: 6 }}>{customUsername || "year.in.review"}</span>
                                <span>{customCaption || "A year of memories, laughter, and moments that made everything worthwhile. Here's to the journey we've shared... and so many more to come ✨"}</span>
                                <button style={{
                                    background: 'none',
                                    border: 'none',
                                    color: '#8e8e8e',
                                    cursor: 'pointer',
                                    padding: 0,
                                    marginLeft: 4,
                                    fontSize: '14px'
                                }}>
                                    more
                                </button>
                            </div>

                            <div style={{
                                fontSize: '12px',
                                color: '#8e8e8e',
                                marginTop: 8,
                                textTransform: 'uppercase',
                                letterSpacing: '0.2px'
                            }}>
                                1 week ago
                            </div>
                        </div>
                    </motion.div>
                </div>
            ) : (
                // placeholder if no photos
                <motion.div
                    initial={{ opacity: 0, y: 20 }}
                    animate={isActive ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
                    transition={{ duration: 0.6, delay: 0.3 }}
                    style={{
                        textAlign: 'center',
                        padding: '60px 40px',
                        maxWidth: 500,
                        background: 'white',
                        borderRadius: 12,
                        border: '1px solid rgba(219, 219, 219, 1)',
                        boxShadow: '0 4px 12px rgba(0,0,0,0.08)'
                    }}
                >
                    <div style={{ fontSize: '4rem', marginBottom: 20 }}>📸</div>
                    <p style={{
                        fontSize: '1.1rem',
                        color: '#262626',
                        lineHeight: 1.6,
                        fontWeight: 500
                    }}>
                        Add photos in the editor to create
                        <br />
                        your year-in-review post
                    </p>
                </motion.div>
            )}
        </div>
    );
}
