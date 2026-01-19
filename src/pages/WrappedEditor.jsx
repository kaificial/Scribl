import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { ArrowLeft, ChevronLeft, ChevronRight, Save, Upload, X } from 'lucide-react';
import { api } from '../services/api';
import { useCard } from '../hooks/useCard';
import '../App.css';

export default function WrappedEditor() {
    const { id } = useParams();
    const nav = useNavigate();
    const [currentSlide, setCurrentSlide] = useState(0);
    const [isSaving, setIsSaving] = useState(false);
    const [wrappedData, setWrappedData] = useState({
        welcome: {
            title: 'Title here',
            subtitle: 'Subtitle here',
            message: 'Message here',
            image: null
        },
        stats: {
            title: 'Title here',
            subtitle: 'Subtitle here',
            label: 'Label here',
            description: 'Description here',
            photos: [] // Array of photo URLs
        },
        hidden: {
            title: 'Title here',
            subtitle: 'Subtitle here',
            message: 'Hidden message here'
        }
    });

    const slides = ['welcome', 'stats', 'hidden'];
    const slideNames = ['Welcome', 'Pictures', 'Hidden Message'];

    const { card, isLoading, mutate } = useCard(id);

    useEffect(() => {
        if (card?.wrappedData) {
            try {
                const parsed = JSON.parse(card.wrappedData);
                setWrappedData(prev => ({ ...prev, ...parsed }));
            } catch (e) {
                console.error('Failed to parse wrapped data', e);
            }
        }
    }, [card]);

    const handleSave = () => {
        // OPTIMISTIC NAVIGATION: Go back immediately
        nav(`/card/${id}`);

        // Fire and forget (or handle error silently in background)
        api.updateWrappedData(id, wrappedData).catch(err => {
            console.error('Background save failed:', err);
            // Optionally: Restore state or show a subtle notification
        });
    };

    const handleImageUpload = (field, subfield = null) => {
        const input = document.createElement('input');
        input.type = 'file';
        input.accept = 'image/*';
        input.onchange = (e) => {
            const file = e.target.files[0];
            if (file) {
                const reader = new FileReader();
                reader.onload = (event) => {
                    const slideKey = slides[currentSlide];
                    if (subfield) {
                        setWrappedData(prev => ({
                            ...prev,
                            [slideKey]: {
                                ...prev[slideKey],
                                [subfield]: event.target.result
                            }
                        }));
                    } else {
                        setWrappedData(prev => ({
                            ...prev,
                            [slideKey]: {
                                ...prev[slideKey],
                                [field]: event.target.result
                            }
                        }));
                    }
                };
                reader.readAsDataURL(file);
            }
        };
        input.click();
    };

    const updateField = (field, value) => {
        const slideKey = slides[currentSlide];
        setWrappedData(prev => ({
            ...prev,
            [slideKey]: {
                ...prev[slideKey],
                [field]: value
            }
        }));
    };

    const removeImage = (field) => {
        const slideKey = slides[currentSlide];
        setWrappedData(prev => ({
            ...prev,
            [slideKey]: {
                ...prev[slideKey],
                [field]: null
            }
        }));
    };

    const renderSlideEditor = () => {
        const slideKey = slides[currentSlide];
        const data = wrappedData[slideKey];

        switch (slideKey) {
            case 'welcome':
                return (
                    <div style={{ padding: '30px', maxWidth: 700, margin: '0 auto' }}>
                        <h3 style={{ marginBottom: 30, fontSize: '1.5rem', fontWeight: 500 }}>Welcome Slide</h3>

                        {/* section for image uploads */}
                        <div style={{ marginBottom: 30 }}>
                            <label style={{ display: 'block', marginBottom: 10, fontWeight: 500 }}>Welcome Image (optional)</label>
                            {data.image ? (
                                <div style={{ position: 'relative', width: 150, height: 150, margin: '0 auto' }}>
                                    <img src={data.image} alt="Welcome" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }} />
                                    <button
                                        onClick={() => removeImage('image')}
                                        style={{
                                            position: 'absolute',
                                            top: -10,
                                            right: -10,
                                            background: '#ff5252',
                                            color: 'white',
                                            border: 'none',
                                            borderRadius: '50%',
                                            width: 30,
                                            height: 30,
                                            cursor: 'pointer',
                                            display: 'flex',
                                            alignItems: 'center',
                                            justifyContent: 'center'
                                        }}
                                    >
                                        <X size={16} />
                                    </button>
                                </div>
                            ) : (
                                <button
                                    onClick={() => handleImageUpload('image')}
                                    style={{
                                        width: 150,
                                        height: 150,
                                        margin: '0 auto',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        border: '2px dashed rgba(26, 26, 26, 0.3)',
                                        borderRadius: '50%',
                                        background: 'rgba(26, 26, 26, 0.02)',
                                        cursor: 'pointer',
                                        fontSize: '0.9rem',
                                        color: 'rgba(26, 26, 26, 0.5)'
                                    }}
                                >
                                    <Upload size={24} style={{ marginBottom: 10 }} />
                                    Upload Image
                                </button>
                            )}
                        </div>

                        {/* all the text input fields */}
                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Title</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => updateField('title', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '1rem',
                                    border: '1px solid rgba(26, 26, 26, 0.2)',
                                    borderRadius: 8,
                                    fontFamily: 'var(--font-serif)'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Subtitle</label>
                            <textarea
                                value={data.subtitle}
                                onChange={(e) => updateField('subtitle', e.target.value)}
                                rows={3}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '1rem',
                                    border: '1px solid rgba(26, 26, 26, 0.2)',
                                    borderRadius: 8,
                                    fontFamily: 'var(--font-sans)',
                                    resize: 'vertical'
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Bottom Message</label>
                            <textarea
                                value={data.message}
                                onChange={(e) => updateField('message', e.target.value)}
                                rows={2}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '1rem',
                                    border: '1px solid rgba(26, 26, 26, 0.2)',
                                    borderRadius: 8,
                                    fontFamily: 'var(--font-sans)',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>
                );

            case 'stats':
                return (
                    <div style={{ padding: '30px', maxWidth: 700, margin: '0 auto' }}>
                        <h3 style={{ marginBottom: 30, fontSize: '1.5rem', fontWeight: 500 }}>Pictures Slide</h3>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Title</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => updateField('title', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '1rem',
                                    border: '1px solid rgba(26, 26, 26, 0.2)',
                                    borderRadius: 8
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 30 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Subtitle</label>
                            <input
                                type="text"
                                value={data.subtitle}
                                onChange={(e) => updateField('subtitle', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '1rem',
                                    border: '1px solid rgba(26, 26, 26, 0.2)',
                                    borderRadius: 8
                                }}
                            />
                        </div>

                        {/* section for handling multiple photos */}
                        <div style={{ marginBottom: 30, padding: 20, background: 'rgba(26, 26, 26, 0.02)', borderRadius: 12 }}>
                            <h4 style={{ marginBottom: 15, fontSize: '1.1rem' }}>Polaroid Photo Stack</h4>

                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12, marginBottom: 20 }}>
                                {data.photos?.map((photo, pIdx) => (
                                    <div key={pIdx} style={{ position: 'relative', width: 100, height: 100 }}>
                                        <img src={photo} alt="" style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: 8 }} />
                                        <button
                                            onClick={() => {
                                                const newPhotos = [...data.photos];
                                                newPhotos.splice(pIdx, 1);
                                                updateField('photos', newPhotos);
                                            }}
                                            style={{
                                                position: 'absolute',
                                                top: -8,
                                                right: -8,
                                                background: '#ff5252',
                                                color: 'white',
                                                border: 'none',
                                                borderRadius: '50%',
                                                width: 24,
                                                height: 24,
                                                cursor: 'pointer',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                boxShadow: '0 2px 4px rgba(0,0,0,0.2)'
                                            }}
                                        >
                                            <X size={14} />
                                        </button>
                                    </div>
                                ))}
                                <button
                                    onClick={() => {
                                        const input = document.createElement('input');
                                        input.type = 'file';
                                        input.accept = 'image/*';
                                        input.multiple = true;
                                        input.onchange = (e) => {
                                            const files = Array.from(e.target.files);
                                            files.forEach(file => {
                                                const reader = new FileReader();
                                                reader.onload = (event) => {
                                                    setWrappedData(prev => {
                                                        const slideKey = slides[currentSlide];
                                                        const existingPhotos = prev[slideKey].photos || [];
                                                        return {
                                                            ...prev,
                                                            [slideKey]: {
                                                                ...prev[slideKey],
                                                                photos: [...existingPhotos, event.target.result]
                                                            }
                                                        };
                                                    });
                                                };
                                                reader.readAsDataURL(file);
                                            });
                                        };
                                        input.click();
                                    }}
                                    style={{
                                        width: 100,
                                        height: 100,
                                        borderRadius: 8,
                                        border: '2px dashed rgba(26, 26, 26, 0.1)',
                                        background: 'transparent',
                                        display: 'flex',
                                        flexDirection: 'column',
                                        alignItems: 'center',
                                        justifyContent: 'center',
                                        cursor: 'pointer',
                                        color: 'rgba(26, 26, 26, 0.4)'
                                    }}
                                >
                                    <Upload size={24} />
                                    <span style={{ fontSize: '0.75rem', marginTop: 4 }}>Add Photo</span>
                                </button>
                            </div>
                        </div>
                    </div>
                );

            case 'hidden':
                return (
                    <div style={{ padding: '30px', maxWidth: 700, margin: '0 auto' }}>
                        <h3 style={{ marginBottom: 30, fontSize: '1.5rem', fontWeight: 500 }}>Hidden Message Slide</h3>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Title</label>
                            <input
                                type="text"
                                value={data.title}
                                onChange={(e) => updateField('title', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '1rem',
                                    border: '1px solid rgba(26, 26, 26, 0.2)',
                                    borderRadius: 8
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Subtitle</label>
                            <input
                                type="text"
                                value={data.subtitle}
                                onChange={(e) => updateField('subtitle', e.target.value)}
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '1rem',
                                    border: '1px solid rgba(26, 26, 26, 0.2)',
                                    borderRadius: 8
                                }}
                            />
                        </div>

                        <div style={{ marginBottom: 20 }}>
                            <label style={{ display: 'block', marginBottom: 8, fontWeight: 500 }}>Hidden Message</label>
                            <textarea
                                value={data.message}
                                onChange={(e) => updateField('message', e.target.value)}
                                rows={4}
                                placeholder="The message that will be revealed on hover..."
                                style={{
                                    width: '100%',
                                    padding: '12px',
                                    fontSize: '1rem',
                                    border: '1px solid rgba(26, 26, 26, 0.2)',
                                    borderRadius: 8,
                                    fontFamily: 'var(--font-serif)',
                                    fontStyle: 'italic',
                                    resize: 'vertical'
                                }}
                            />
                        </div>
                    </div>
                );



            default:
                return null;
        }
    };

    if (isLoading && !card) {
        return (
            <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                    <div className="text-serif-italic" style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: '#666' }}>Opening the editor...</div>
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

    return (
        <div style={{
            width: '100vw',
            height: '100vh',
            background: '#fffcf5',
            display: 'flex',
            flexDirection: 'column'
        }}>
            {/* header section */}
            <div style={{
                padding: '20px 30px',
                borderBottom: '1px solid rgba(26, 26, 26, 0.1)',
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center'
            }}>
                <button
                    onClick={() => nav(`/card/${id}`)}
                    style={{
                        background: 'none',
                        border: 'none',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        fontSize: '1rem',
                        color: '#1a1a1a'
                    }}
                >
                    <ArrowLeft size={20} /> Back
                </button>



                <button
                    onClick={handleSave}
                    disabled={isSaving}
                    className="btn-dark-pill"
                    style={{ padding: '10px 24px', display: 'flex', alignItems: 'center', gap: 8 }}
                >
                    {isSaving ? 'Saving...' : <><Save size={16} /> Save</>}
                </button>
            </div>

            {/* navigation for the slides */}
            <div style={{
                padding: '20px 30px',
                borderBottom: '1px solid rgba(26, 26, 26, 0.1)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'space-between'
            }}>
                <button
                    onClick={() => setCurrentSlide(Math.max(0, currentSlide - 1))}
                    disabled={currentSlide === 0}
                    style={{
                        background: currentSlide === 0 ? 'rgba(26, 26, 26, 0.1)' : '#1a1a1a',
                        color: currentSlide === 0 ? 'rgba(26, 26, 26, 0.3)' : 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 20px',
                        cursor: currentSlide === 0 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}
                >
                    <ChevronLeft size={20} /> Previous
                </button>

                <div style={{ display: 'flex', gap: 10 }}>
                    {slides.map((_, idx) => (
                        <div
                            key={idx}
                            onClick={() => setCurrentSlide(idx)}
                            style={{
                                width: 40,
                                height: 40,
                                borderRadius: '50%',
                                background: currentSlide === idx ? '#1a1a1a' : 'rgba(26, 26, 26, 0.1)',
                                color: currentSlide === idx ? 'white' : '#1a1a1a',
                                display: 'flex',
                                alignItems: 'center',
                                justifyContent: 'center',
                                cursor: 'pointer',
                                fontWeight: 500,
                                transition: 'all 0.3s ease'
                            }}
                        >
                            {idx + 1}
                        </div>
                    ))}
                </div>

                <button
                    onClick={() => setCurrentSlide(Math.min(slides.length - 1, currentSlide + 1))}
                    disabled={currentSlide === slides.length - 1}
                    style={{
                        background: currentSlide === slides.length - 1 ? 'rgba(26, 26, 26, 0.1)' : '#1a1a1a',
                        color: currentSlide === slides.length - 1 ? 'rgba(26, 26, 26, 0.3)' : 'white',
                        border: 'none',
                        borderRadius: 8,
                        padding: '10px 20px',
                        cursor: currentSlide === slides.length - 1 ? 'not-allowed' : 'pointer',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8
                    }}
                >
                    Next <ChevronRight size={20} />
                </button>
            </div>

            {/* the actual editor content */}
            <div style={{
                flex: 1,
                overflow: 'auto',
                padding: '20px 0'
            }}>
                <AnimatePresence mode="wait">
                    <motion.div
                        key={currentSlide}
                        initial={{ opacity: 0, x: 20 }}
                        animate={{ opacity: 1, x: 0 }}
                        exit={{ opacity: 0, x: -20 }}
                        transition={{ duration: 0.3 }}
                    >
                        {renderSlideEditor()}
                    </motion.div>
                </AnimatePresence>
            </div>

            {/* tells you which slide you are on */}
            <div style={{
                padding: '15px 30px',
                borderTop: '1px solid rgba(26, 26, 26, 0.1)',
                textAlign: 'center',
                color: 'rgba(26, 26, 26, 0.5)',
                fontSize: '0.9rem'
            }}>
                Editing: <strong>{slideNames[currentSlide]}</strong> ({currentSlide + 1} of {slides.length})
            </div>
        </div>
    );
}
