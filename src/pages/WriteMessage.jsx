import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send, Type, Image as ImageIcon, X, Bold, Italic, Underline, Minus, Plus, AlignLeft, AlignCenter, AlignRight, RotateCcw, RotateCw, Pencil, Eraser, Move } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import { api } from '../services/api';
import { useCard } from '../hooks/useCard';
import html2canvas from 'html2canvas';
import { v4 as uuidv4 } from 'uuid';
import '../App.css';

const DraggableElement = ({ element, updateElement, removeElement, isSelected, onSelect, activeTool }) => {
    const [dragging, setDragging] = useState(false);

    // manual drag logic for moving stuff
    const handleMoveStart = (e) => {
        if (e.target.dataset.handle || e.target.isContentEditable) return;

        e.preventDefault();
        onSelect(e);
        setDragging(true);

        const startX = e.clientX;
        const startY = e.clientY;
        const startElX = element.x;
        const startElY = element.y;

        const container = e.target.closest('#designer-canvas').getBoundingClientRect();

        const onMove = (moveEvent) => {
            moveEvent.preventDefault();
            const dx = moveEvent.clientX - startX;
            const dy = moveEvent.clientY - startY;

            // convert pixels to percentages for the canvas
            const newX = startElX + (dx / container.width) * 100;
            const newY = startElY + (dy / container.height) * 100;

            updateElement(element.id, { x: newX, y: newY }, true);
        };

        const onUp = () => {
            setDragging(false);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            // push to history only when done
            updateElement(element.id, {});
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    const handleResizeStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);

        const startWidth = element.width || 200;
        const startX = e.clientX;

        const onMove = (moveEvent) => {
            moveEvent.preventDefault();
            moveEvent.stopPropagation();
            const delta = moveEvent.clientX - startX;
            const newWidth = Math.max(50, startWidth + delta);
            updateElement(element.id, { width: newWidth }, true);
        };

        const onUp = () => {
            setDragging(false);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            // push to history only when done
            updateElement(element.id, {});
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    const handleRotateStart = (e) => {
        e.preventDefault();
        e.stopPropagation();
        setDragging(true);

        const canvas = document.getElementById('designer-canvas').getBoundingClientRect();
        // The element's center in SCREEN coordinates
        const centerX = canvas.left + (element.x / 100) * canvas.width;
        const centerY = canvas.top + (element.y / 100) * canvas.height;

        const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const startRotation = element.rotation || 0;

        const onMove = (moveEvent) => {
            moveEvent.preventDefault();
            moveEvent.stopPropagation();
            const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
            const deg = (currentAngle - startAngle) * (180 / Math.PI);
            // round to 1 decimal place to prevent micro-jitter
            const finalRotation = Math.round((startRotation + deg) * 10) / 10;
            updateElement(element.id, { rotation: finalRotation }, true);
        };

        const onUp = () => {
            setDragging(false);
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
            // push to history only when done
            updateElement(element.id, {});
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    const frameClass = element.frame ? `frame-${element.frame}` : '';
    const styleClass = element.msgStyle ? `msg-style-${element.msgStyle}` : '';

    return (
        <div
            className={`draggable-item ${frameClass} ${styleClass} ${isSelected ? 'selected' : ''} ${dragging ? 'dragging' : ''}`}
            data-id={element.id}
            onPointerDown={handleMoveStart}
            onClick={(e) => { e.stopPropagation(); !dragging && onSelect(e); }}
            style={{
                position: 'absolute',
                top: `${element.y}%`,
                left: `${element.x}%`,
                width: element.width || 200,
                // use translate3d for gpu acceleration on ios
                transform: `translate3d(-50%, -50%, 0) rotate(${element.rotation || 0}deg)`,
                cursor: 'grab',
                zIndex: isSelected ? 100 : 10,
                transformOrigin: 'center center',
                userSelect: 'none',
                touchAction: 'none',
                // force gpu acceleration to prevent trail on ipad
                willChange: 'transform',
                WebkitTransform: `translate3d(-50%, -50%, 0) rotate(${element.rotation || 0}deg)`,
                backfaceVisibility: 'hidden',
                WebkitBackfaceVisibility: 'hidden'
            }}
        >
            <div
                className="draggable-content-wrapper"
                style={{
                    position: 'relative',
                    border: (element.type === 'text' && !element.msgStyle) ? '1px solid rgba(0,0,0,0.08)' : ((isSelected && !element.frame && !element.msgStyle) ? '1px dashed #4b89dc' : '1px solid transparent'),
                    background: (element.type === 'text' && !element.msgStyle) ? '#fff' : 'transparent',
                    boxShadow: (element.type === 'text' && !element.msgStyle) ? '0 4px 12px rgba(0,0,0,0.06)' : 'none',
                    padding: 0,
                    height: '100%',
                    borderRadius: (element.msgStyle === 'modern') ? 12 : 8,
                    transition: 'all 0.2s',
                    overflow: 'visible'
                }}
            >
                {/* Real DOM elements for frames/styles (replaces pseudo-elements for html2canvas support) */}
                {element.frame === 'polaroid' && <div className="frame-polaroid-texture" />}
                {element.frame === 'tape' && <div className="frame-tape-piece" />}
                {element.msgStyle === 'sticky' && <div className="msg-style-sticky-corner" />}

                {/* Hover Move Handles (on edges) */}
                <div data-html2canvas-ignore className="hover-move-handle top" style={{ position: 'absolute', top: -10, left: 0, right: 0, height: 20, cursor: 'move', zIndex: 1 }} />
                <div data-html2canvas-ignore className="hover-move-handle bottom" style={{ position: 'absolute', bottom: -10, left: 0, right: 0, height: 20, cursor: 'move', zIndex: 1 }} />
                <div data-html2canvas-ignore className="hover-move-handle left" style={{ position: 'absolute', top: 0, bottom: 0, left: -10, width: 20, cursor: 'move', zIndex: 1 }} />
                <div data-html2canvas-ignore className="hover-move-handle right" style={{ position: 'absolute', top: 0, bottom: 0, right: -10, width: 20, cursor: 'move', zIndex: 1 }} />
                {isSelected && (
                    <button
                        data-html2canvas-ignore
                        onClick={(e) => { e.stopPropagation(); removeElement(element.id); }}
                        style={{
                            position: 'absolute', top: -15, right: -15,
                            background: '#ff5252', color: 'white',
                            borderRadius: '50%', border: '2px solid white',
                            width: 24, height: 24, display: 'flex', alignItems: 'center', justifyContent: 'center',
                            cursor: 'pointer', zIndex: 120
                        }}
                    >
                        <X size={14} />
                    </button>
                )}

                {isSelected && (
                    <div
                        data-html2canvas-ignore
                        data-handle="resize"
                        onPointerDown={handleResizeStart}
                        style={{
                            width: 24, height: 24,
                            background: 'white', border: '2px solid #333',
                            position: 'absolute', right: -12, bottom: -12,
                            cursor: 'nwse-resize', borderRadius: '50%', zIndex: 110,
                            display: 'grid', placeItems: 'center',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}
                    >
                        <div style={{ width: 8, height: 8, background: '#333', borderRadius: '50%', pointerEvents: 'none' }} />
                    </div>
                )}

                {isSelected && (
                    <div
                        data-html2canvas-ignore
                        data-handle="rotate"
                        onPointerDown={handleRotateStart}
                        style={{
                            width: 24, height: 24,
                            background: 'white', border: '2px solid #333',
                            position: 'absolute', left: '50%', top: -40,
                            transform: 'translateX(-50%)',
                            cursor: 'ew-resize', borderRadius: '50%', zIndex: 110,
                            display: 'grid', placeItems: 'center',
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)'
                        }}
                    >
                        <div style={{ width: 2, height: 10, background: '#333', transform: 'rotate(45deg)', pointerEvents: 'none' }} />
                        <div style={{ width: 1, height: 20, background: '#333', position: 'absolute', bottom: -20, zIndex: -1, pointerEvents: 'none' }} />
                    </div>
                )}

                {/* Prominent Move Handle */}
                {isSelected && (
                    <div
                        data-html2canvas-ignore
                        style={{
                            position: 'absolute',
                            top: -15,
                            left: -15,
                            width: 24,
                            height: 24,
                            background: '#1a1a1a',
                            color: 'white',
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            cursor: 'move',
                            zIndex: 110,
                            boxShadow: '0 2px 5px rgba(0,0,0,0.2)',
                            border: '2px solid white'
                        }}
                        title="Drag to move"
                    >
                        <Move size={14} />
                    </div>
                )}

                <div style={{
                    width: '100%',
                    height: '100%',
                    cursor: activeTool === 'select' ? 'move' : 'default'
                }}>
                    {element.type === 'text' ? (
                        <div
                            ref={(el) => {
                                if (el && el.innerHTML !== element.content) {
                                    el.innerHTML = element.content;
                                }
                            }}
                            className="rich-text-editor"
                            contentEditable={isSelected}
                            suppressContentEditableWarning
                            onInput={(e) => updateElement(element.id, { content: e.target.innerHTML }, true)}
                            onBlur={(e) => updateElement(element.id, { content: e.target.innerHTML })}
                            style={{
                                fontFamily: element.fontFamily || 'var(--font-serif)',
                                fontSize: `${element.fontSize || 20}px`,
                                color: element.color || '#1a1a1a',
                                outline: 'none',
                                whiteSpace: 'pre-wrap',
                                width: '100%',
                                wordBreak: 'break-word',
                                pointerEvents: isSelected ? 'auto' : 'none',
                                textAlign: element.textAlign || 'center',
                                lineHeight: 1.4,
                                cursor: 'text',
                                padding: element.msgStyle ? 0 : 10
                            }}
                        />
                    ) : (
                        <img
                            src={element.src}
                            alt="sticker"
                            style={{
                                width: '100%',
                                height: 'auto',
                                display: 'block',
                                border: element.frame ? 'none' : '2px solid #fff',
                                borderRadius: element.frame ? '2px' : '4px',
                                background: element.frame ? 'transparent' : '#fff',
                                boxShadow: element.frame ? 'none' : '0 0 0 1px rgba(0,0,0,0.15), 0 8px 20px rgba(0,0,0,0.1)'
                            }}
                            draggable={false}
                        />
                    )}
                </div>
            </div>
        </div>
    );
};

export default function WriteMessage() {
    const { id } = useParams();
    const nav = useNavigate();
    const [searchParams] = useSearchParams();
    const drawingId = searchParams.get('drawingId');
    const canvasRef = useRef(null);
    const inkingCanvasRef = useRef(null);

    const { card, isLoading: cardLoading, mutate } = useCard(id);
    const [elements, setElements] = useState([]);
    const [history, setHistory] = useState([{ elements: [], paths: [] }]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [selectedId, setSelectedId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(true);
    const [isPenActive, setIsPenActive] = useState(false); // New state to track if a pen (iPad Pencil) is being used

    // some state for drawing
    const [activeTool, setActiveTool] = useState('select'); // 'select', 'pen', 'eraser'
    const [color, setColor] = useState('#2C2C2C');
    const [brushSize, setBrushSize] = useState(5);
    const [isDrawing, setIsDrawing] = useState(false);
    const [paths, setPaths] = useState([]);
    const [imageToCrop, setImageToCrop] = useState(null); // { src, id }
    const [saveStatus, setSaveStatus] = useState('saved'); // 'saved', 'saving', 'error'
    const [lastSaved, setLastSaved] = useState(Date.now());
    const [isInitialLoad, setIsInitialLoad] = useState(true);

    const selectedElement = elements.find(el => el.id === selectedId);

    // Load drawing data from card context
    useEffect(() => {
        if (drawingId && card) {
            const drawing = card.drawings?.find(d => d.id === Number(drawingId));
            if (drawing && drawing.contentJson) {
                try {
                    const parsed = JSON.parse(drawing.contentJson);
                    const els = parsed.elements || (Array.isArray(parsed) ? parsed : []);
                    const pts = parsed.paths || [];
                    setElements(els);
                    setPaths(pts);
                    setHistory([{ elements: JSON.parse(JSON.stringify(els)), paths: JSON.parse(JSON.stringify(pts)) }]);
                    setHistoryIndex(0);
                } catch (e) {
                    console.error("Failed to parse drawing content", e);
                }
            }
            setIsLoading(false);
            setTimeout(() => setIsInitialLoad(false), 500);
        } else if (!drawingId) {
            setIsLoading(false);
            setTimeout(() => setIsInitialLoad(false), 500);
        }
    }, [card, drawingId]);

    // Autosave effect
    useEffect(() => {
        if (isInitialLoad || elements.length === 0 && paths.length === 0) return;

        const timer = setTimeout(() => {
            handleSave(true);
        }, 3000); // 3 second debounce

        return () => clearTimeout(timer);
    }, [elements, paths]);

    // dynamically size canvas to match container for crisp drawings
    useEffect(() => {
        const resizeCanvas = () => {
            if (!inkingCanvasRef.current || !canvasRef.current) return;

            const container = canvasRef.current.getBoundingClientRect();
            const dpr = window.devicePixelRatio || 1;

            // set canvas internal resolution to match display size * device pixel ratio
            inkingCanvasRef.current.width = container.width * dpr;
            inkingCanvasRef.current.height = container.height * dpr;

            // redraw existing paths after resize
            const ctx = inkingCanvasRef.current.getContext('2d');
            ctx.scale(dpr, dpr);
            ctx.lineCap = 'round';
            ctx.lineJoin = 'round';

            ctx.clearRect(0, 0, inkingCanvasRef.current.width, inkingCanvasRef.current.height);
            paths.forEach(path => {
                ctx.beginPath();
                ctx.strokeStyle = path.color;
                ctx.lineWidth = path.width;
                ctx.globalCompositeOperation = path.isEraser ? 'destination-out' : 'source-over';
                path.points.forEach((p, i) => {
                    if (i === 0) ctx.moveTo(p.x, p.y);
                    else ctx.lineTo(p.x, p.y);
                });
                ctx.stroke();
            });
        };

        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);
        return () => window.removeEventListener('resize', resizeCanvas);
    }, [paths]);

    // drawing stuff - render paths whenever they change
    useEffect(() => {
        if (!inkingCanvasRef.current) return;
        const canvas = inkingCanvasRef.current;
        const ctx = canvas.getContext('2d');
        const dpr = window.devicePixelRatio || 1;

        // Reset transform before scaling to prevent accumulation
        ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
        ctx.lineCap = 'round';
        ctx.lineJoin = 'round';

        ctx.clearRect(0, 0, canvas.width / dpr, canvas.height / dpr);
        paths.forEach(path => {
            if (path.points.length < 2) return;
            ctx.beginPath();
            ctx.strokeStyle = path.color;
            ctx.lineWidth = path.width;
            ctx.globalCompositeOperation = path.isEraser ? 'destination-out' : 'source-over';
            path.points.forEach((p, i) => {
                if (i === 0) ctx.moveTo(p.x, p.y);
                else ctx.lineTo(p.x, p.y);
            });
            ctx.stroke();
        });
    }, [paths]);

    const startDrawing = (e) => {
        if (activeTool === 'select') return;

        // Palm Rejection logic
        // If we detect a pen, we set pen active and ignore touch events
        // If it's a touch event and pen is active, ignore it (palm rejection)
        if (e.pointerType === 'pen') {
            setIsPenActive(true);
        } else if (e.pointerType === 'touch' && isPenActive) {
            return;
        }

        // Ignore secondary touches (multi-touch palm)
        if (!e.isPrimary) return;

        // Optional: Ignore low pressure touches if supported
        if (e.pointerType === 'pen' && e.pressure !== undefined && e.pressure < 0.05 && e.pressure > 0) return;

        setIsDrawing(true);
        const rect = inkingCanvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setPaths(prev => [...prev, {
            points: [{ x, y }],
            color: activeTool === 'eraser' ? 'white' : color,
            width: brushSize,
            isEraser: activeTool === 'eraser'
        }]);
    };

    const draw = (e) => {
        if (!isDrawing) return;

        // Palm Rejection: skip if touch and pen is active
        if (e.pointerType === 'touch' && isPenActive) return;
        if (!e.isPrimary) return;

        const rect = inkingCanvasRef.current.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;
        setPaths(prev => {
            const newPaths = [...prev];
            const currentPath = newPaths[newPaths.length - 1];
            if (currentPath) {
                currentPath.points.push({ x, y });
            }
            return newPaths;
        });
    };

    const stopDrawing = (e) => {
        if (e && e.pointerType === 'pen') {
            // Give it a small delay before allowing touch again to prevent accidental taps
            setTimeout(() => setIsPenActive(false), 300);
        }

        if (isDrawing) {
            setIsDrawing(false);
            addToHistory(elements, paths);
        }
    };

    const addToHistory = (newElements, newPaths = paths) => {
        const newHistory = history.slice(0, historyIndex + 1);
        newHistory.push({
            elements: JSON.parse(JSON.stringify(newElements)),
            paths: JSON.parse(JSON.stringify(newPaths))
        });
        setHistory(newHistory);
        setHistoryIndex(newHistory.length - 1);
    };

    const undo = () => {
        if (historyIndex > 0) {
            const newIndex = historyIndex - 1;
            const state = history[newIndex];
            setHistoryIndex(newIndex);
            setElements(JSON.parse(JSON.stringify(state.elements)));
            setPaths(JSON.parse(JSON.stringify(state.paths)));
            setSelectedId(null);
        }
    };

    const redo = () => {
        if (historyIndex < history.length - 1) {
            const newIndex = historyIndex + 1;
            const state = history[newIndex];
            setHistoryIndex(newIndex);
            setElements(JSON.parse(JSON.stringify(state.elements)));
            setPaths(JSON.parse(JSON.stringify(state.paths)));
            setSelectedId(null);
        }
    };

    const addText = () => {
        const newEl = {
            id: uuidv4(),
            type: 'text',
            content: 'Double click to edit',
            x: 50, y: 50,
            color: '#1a1a1a',
            width: 250,
            // organic random rotation (-4 to 4 deg)
            rotation: (Math.random() * 8) - 4,
            fontSize: 24,
            textAlign: 'center'
        };
        const newEls = [...elements, newEl];
        setElements(newEls);
        addToHistory(newEls);
        setSelectedId(newEl.id);
        setActiveTool('select');
    };

    const addImage = (e) => {
        const file = e.target.files[0];
        if (file) {
            const reader = new FileReader();
            reader.onload = (f) => {
                // Just add it directly as an image element first
                const newEl = {
                    id: uuidv4(),
                    type: 'image',
                    src: f.target.result,
                    x: 50, y: 50,
                    width: 250,
                    // organic random rotation (-4 to 4 deg)
                    rotation: (Math.random() * 8) - 4
                };
                const newEls = [...elements, newEl];
                setElements(newEls);
                addToHistory(newEls);
                setSelectedId(newEl.id);
                setActiveTool('select');
            };
            reader.readAsDataURL(file);
        }
    };

    const handleCropDone = (croppedSrc, existingId = null) => {
        if (existingId) {
            updateElement(existingId, { src: croppedSrc });
        } else {
            const newEl = {
                id: uuidv4(),
                type: 'image',
                src: croppedSrc,
                x: 50, y: 50,
                width: 250,
                rotation: 0
            };
            const newEls = [...elements, newEl];
            setElements(newEls);
            addToHistory(newEls);
            setSelectedId(newEl.id);
        }
        setImageToCrop(null);
        setActiveTool('select');
    };

    const updateElement = (elId, updates, skipHistory = false) => {
        setElements(prev => {
            const newEls = prev.map(el => el.id === elId ? { ...el, ...updates } : el);
            if (!skipHistory) addToHistory(newEls);
            return newEls;
        });
    };

    const removeElement = (elId) => {
        const newEls = elements.filter(el => el.id !== elId);
        setElements(newEls);
        addToHistory(newEls);
        setSelectedId(null);
    };

    const handleToolbarClick = (e, command) => {
        e.preventDefault();
        document.execCommand(command, false, null);
    };

    const changeFontSize = (delta) => {
        if (!selectedElement) return;
        const currentSize = selectedElement.fontSize || 24;
        updateElement(selectedElement.id, { fontSize: Math.max(12, Math.min(100, currentSize + delta)) });
    };

    const changeTextAlign = (align) => {
        if (!selectedElement) return;
        updateElement(selectedElement.id, { textAlign: align });
    };

    const handleBack = () => {
        const recipientName = searchParams.get('recipient');
        nav(`/card/${id}?recipient=${encodeURIComponent(recipientName || '')}`);
    };

    const getCursor = () => {
        if (activeTool === 'select') return 'default';
        const size = Math.max(brushSize / 2, 4);
        const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${size * 2}" height="${size * 2}" viewBox="0 0 ${size * 2} ${size * 2}"><circle cx="${size}" cy="${size}" r="${size - 1}" fill="none" stroke="${activeTool === 'eraser' ? '#333' : color}" stroke-width="1" /></svg>`;
        return `url('data:image/svg+xml;base64,${btoa(svg)}') ${size} ${size}, crosshair`;
    };

    const getBoundingBox = () => {
        if (elements.length === 0 && paths.length === 0) return null;

        const container = canvasRef.current.getBoundingClientRect();
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;

        // Use DOM for accurate measurements of elements
        elements.forEach(el => {
            const domEl = document.querySelector(`.draggable-item[data-id="${el.id}"]`);
            if (domEl) {
                const rect = domEl.getBoundingClientRect();
                const relativeX = rect.left - container.left;
                const relativeY = rect.top - container.top;

                minX = Math.min(minX, relativeX);
                minY = Math.min(minY, relativeY);
                maxX = Math.max(maxX, relativeX + rect.width);
                maxY = Math.max(maxY, relativeY + rect.height);
            } else {
                // Fallback if not in DOM yet
                const pxX = (el.x / 100) * container.width;
                const pxY = (el.y / 100) * container.height;
                const halfW = (el.width || 200) / 2;
                const halfH = el.type === 'text' ? 50 : halfW;

                minX = Math.min(minX, pxX - halfW);
                minY = Math.min(minY, pxY - halfH);
                maxX = Math.max(maxX, pxX + halfW);
                maxY = Math.max(maxY, pxY + halfH);
            }
        });

        // for paths (stored in pixel coordinates)
        paths.forEach(path => {
            const halfBrush = (path.width || 5) / 2;
            path.points.forEach(p => {
                minX = Math.min(minX, p.x - halfBrush);
                minY = Math.min(minY, p.y - halfBrush);
                maxX = Math.max(maxX, p.x + halfBrush);
                maxY = Math.max(maxY, p.y + halfBrush);
            });
        });

        // Ensure we don't go out of bounds
        minX = Math.max(0, minX);
        minY = Math.max(0, minY);
        maxX = Math.min(container.width, maxX);
        maxY = Math.min(container.height, maxY);

        const padding = 20;
        const boxX = Math.max(0, minX - padding);
        const boxY = Math.max(0, minY - padding);
        const boxW = Math.min(container.width - boxX, (maxX - minX) + padding * 2);
        const boxH = Math.min(container.height - boxY, (maxY - minY) + padding * 2);

        // Safety check for empty content
        if (boxW <= 0 || boxH <= 0) return null;

        return {
            x: boxX,
            y: boxY,
            width: boxW,
            height: boxH,
            centerX: ((boxX + boxW / 2) / container.width) * 100,
            centerY: ((boxY + boxH / 2) / container.height) * 100
        };
    };

    const handleSave = async (isAutosave = false) => {
        if (isSaving) return;
        setSaveStatus('saving');
        if (!isAutosave) setIsSaving(true);

        // Deselect stuff before screenshot
        if (!isAutosave) {
            setSelectedId(null);
            setActiveTool('select');
            await new Promise(r => setTimeout(r, 150)); // Wait for UI to update
        }

        try {
            const bounds = getBoundingBox();

            const canvas = await html2canvas(canvasRef.current, {
                backgroundColor: '#ffffff',
                scale: isAutosave ? 1.5 : 2, // Lighter for autosave
                logging: false,
                useCORS: true,
                x: bounds ? bounds.x : 0,
                y: bounds ? bounds.y : 0,
                width: bounds ? bounds.width : undefined,
                height: bounds ? bounds.height : undefined,
                ignoreElements: (el) => el.classList.contains('no-export') || el.hasAttribute('data-html2canvas-ignore')
            });

            const dataUrl = canvas.toDataURL('image/jpeg', isAutosave ? 0.5 : 0.7);
            const contentJson = JSON.stringify({ elements, paths });
            const userId = localStorage.getItem('userId');
            const authorName = localStorage.getItem('userName') || "Anonymous";
            const recipientName = searchParams.get('recipient');

            const posX = bounds ? bounds.centerX : 50;
            const posY = bounds ? bounds.centerY : 50;

            const saveOp = (drawingId && drawingId !== 'null')
                ? api.updateDrawing(id, drawingId, { imageData: dataUrl, contentJson, x: posX, y: posY })
                : api.addDrawing(id, { imageData: dataUrl, contentJson, userId, authorName, x: posX, y: posY }, recipientName);

            const updatedCard = await saveOp;
            mutate(updatedCard);

            setSaveStatus('saved');
            setLastSaved(Date.now());

            // If we are on a new drawing, find its ID from the updated card
            if (!drawingId || drawingId === 'null') {
                const drawings = updatedCard.drawings || [];
                // Find the drawing with our userId and the latest ID (numerically highest)
                const newDrawing = [...drawings]
                    .filter(d => d.userId === userId)
                    .sort((a, b) => b.id - a.id)[0];

                if (newDrawing) {
                    nav(`/card/${id}/write?drawingId=${newDrawing.id}&recipient=${encodeURIComponent(recipientName || '')}`, { replace: true });
                }
            }

            if (!isAutosave) {
                nav(`/card/${id}/view?recipient=${encodeURIComponent(recipientName || '')}`);
            }
        } catch (err) {
            console.error("Save error:", err);
            setSaveStatus('error');
            if (!isAutosave) alert(`Failed to save: ${err.message}`);
        } finally {
            if (!isAutosave) setIsSaving(false);
        }
    };

    if (isLoading) {
        return (
            <div className="app-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div style={{ width: '100%', maxWidth: '400px', textAlign: 'center' }}>
                    <div className="text-serif-italic" style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: '#666' }}>Preparing your canvas...</div>
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
        <div className="app-container" style={{ background: '#f8f9fa' }}>
            {/* SAVING OVERLAY */}
            <AnimatePresence>
                {isSaving && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        style={{
                            position: 'fixed',
                            inset: 0,
                            zIndex: 2000,
                            background: 'rgba(255,255,255,0.8)',
                            backdropFilter: 'blur(10px)',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center'
                        }}
                    >
                        <div style={{ width: '100%', maxWidth: '300px', textAlign: 'center' }}>
                            <div className="text-serif-italic" style={{ marginBottom: '1.5rem', fontSize: '1.2rem', color: '#1a1a1a' }}>Sending to canvas...</div>
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
                    </motion.div>
                )}
            </AnimatePresence>

            {/* header section */}
            <div style={{ position: 'fixed', top: 20, left: 20, right: 20, zIndex: 1000, display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                <button
                    onClick={handleBack}
                    style={{
                        background: 'white',
                        border: '1px solid rgba(0,0,0,0.1)',
                        padding: '10px 20px',
                        borderRadius: '50px',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 8,
                        cursor: 'pointer',
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        fontSize: '0.9rem',
                        fontWeight: 500
                    }}
                >
                    <ArrowLeft size={18} /> Exit
                </button>

                <div style={{ display: 'flex', alignItems: 'center', gap: 15 }}>
                    <div style={{
                        background: 'white',
                        padding: '6px 15px',
                        borderRadius: '20px',
                        fontSize: '0.8rem',
                        color: saveStatus === 'error' ? '#ff5252' : '#666',
                        display: 'flex',
                        alignItems: 'center',
                        gap: 5,
                        boxShadow: '0 2px 10px rgba(0,0,0,0.05)',
                        border: '1px solid rgba(0,0,0,0.05)'
                    }}>
                        {saveStatus === 'saving' ? (
                            <>
                                <motion.div
                                    animate={{ rotate: 360 }}
                                    transition={{ repeat: Infinity, duration: 1, ease: "linear" }}
                                    style={{ width: 10, height: 10, border: '2px solid #ddd', borderTopColor: '#1a1a1a', borderRadius: '50%' }}
                                />
                                Saving...
                            </>
                        ) : saveStatus === 'saved' ? (
                            <>
                                <div style={{ width: 6, height: 6, background: '#4CAF50', borderRadius: '50%' }} />
                                Saved
                            </>
                        ) : (
                            <>
                                <div style={{ width: 6, height: 6, background: '#ff5252', borderRadius: '50%' }} />
                                Save Error
                            </>
                        )}
                    </div>
                    <button
                        onClick={() => handleSave(false)}
                        disabled={isSaving}
                        style={{
                            background: '#1a1a1a',
                            color: 'white',
                            border: 'none',
                            padding: '10px 30px',
                            borderRadius: '50px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: 8,
                            cursor: isSaving ? 'default' : 'pointer',
                            opacity: isSaving ? 0.7 : 1,
                            boxShadow: '0 4px 15px rgba(0,0,0,0.1)',
                            fontWeight: 600,
                            fontSize: '0.9rem'
                        }}
                    >
                        Finish Message
                        <Send size={18} />
                    </button>
                </div>
            </div>

            <div className="content-wrapper" style={{
                background: 'none',
                boxShadow: 'none',
                border: 'none',
                width: '100%',
                maxWidth: '1000px',
                height: '80vh',
                display: 'flex',
                flexDirection: 'column',
                gap: 20,
                padding: 0
            }}>
                {/* the main drawing canvas */}
                <div
                    ref={canvasRef}
                    id="designer-canvas"
                    style={{
                        flex: 1,
                        background: 'white',
                        borderRadius: 30,
                        position: 'relative',
                        overflow: 'hidden',
                        boxShadow: '0 10px 60px rgba(0,0,0,0.05)',
                        border: '2px solid rgba(0,0,0,0.08)',
                        cursor: getCursor()
                    }}
                    onClick={() => activeTool === 'select' && setSelectedId(null)}
                >
                    {elements.map(el => (
                        <DraggableElement
                            key={el.id}
                            element={el}
                            isSelected={selectedId === el.id}
                            onSelect={(e) => {
                                if (activeTool !== 'select') return;
                                e.stopPropagation();
                                setSelectedId(el.id);
                            }}
                            updateElement={updateElement}
                            removeElement={removeElement}
                            activeTool={activeTool}
                        />
                    ))}

                    <canvas
                        ref={inkingCanvasRef}
                        onPointerDown={startDrawing}
                        onPointerMove={draw}
                        onPointerUp={stopDrawing}
                        onPointerLeave={stopDrawing}
                        style={{
                            position: 'absolute',
                            inset: 0,
                            width: '100%',
                            height: '100%',
                            touchAction: 'none',
                            pointerEvents: activeTool === 'select' ? 'none' : 'auto',
                            zIndex: 5
                        }}
                    />
                </div>

                {/* toolbar with all the tools */}
                <div className="glass-panel" style={{
                    padding: '8px 12px',
                    display: 'flex',
                    gap: 12,
                    alignItems: 'center',
                    borderRadius: 50,
                    alignSelf: 'center',
                    boxShadow: '0 20px 50px rgba(0,0,0,0.1)',
                    position: 'relative',
                    zIndex: 100,
                    background: 'rgba(255,255,255,0.9)'
                }}>
                    <div style={{ display: 'flex', background: '#f0f0f0', borderRadius: 50, padding: 4 }}>
                        <button
                            onClick={() => { setActiveTool('select'); setSelectedId(null); }}
                            className="toolbar-btn"
                            style={{ background: activeTool === 'select' ? 'white' : 'none', borderRadius: 40, boxShadow: activeTool === 'select' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' }}
                            title="Selection Mode"
                        >
                            <ArrowLeft size={18} style={{ transform: 'rotate(135deg)' }} />
                        </button>
                        <button onClick={addText} className="toolbar-btn" title="Add Text"><Type size={18} /></button>
                        <label className="toolbar-btn" title="Add Sticker" style={{ cursor: 'pointer' }}>
                            <ImageIcon size={18} />
                            <input type="file" accept="image/*" onChange={addImage} style={{ display: 'none' }} />
                        </label>
                        <div style={{ width: 1, background: '#ddd', height: 20, margin: '0 5px', alignSelf: 'center' }} />
                        <button
                            onClick={() => setActiveTool('pen')}
                            className="toolbar-btn"
                            style={{ background: activeTool === 'pen' ? 'white' : 'none', borderRadius: 40, boxShadow: activeTool === 'pen' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' }}
                            title="Draw Mode"
                        >
                            <Pencil size={18} />
                        </button>
                        <button
                            onClick={() => setActiveTool('eraser')}
                            className="toolbar-btn"
                            style={{ background: activeTool === 'eraser' ? 'white' : 'none', borderRadius: 40, boxShadow: activeTool === 'eraser' ? '0 2px 5px rgba(0,0,0,0.1)' : 'none' }}
                            title="Eraser Tool"
                        >
                            <Eraser size={18} />
                        </button>
                    </div>

                    <div style={{ width: 1, height: 24, background: '#eee' }} />


                    {/* SELECTION-BASED TOOLS (Design, Formatting, Crop) */}
                    {activeTool === 'select' && selectedElement && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>

                            {/* 1. Design/Style Section */}
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: '0 8px', borderRight: '1px solid #eee' }}>
                                <div style={{ fontSize: '0.65rem', color: '#999', textTransform: 'uppercase', fontWeight: 600 }}>Design</div>
                                <div style={{ display: 'flex', gap: 3, background: '#f0f0f0', padding: 3, borderRadius: 20 }}>
                                    {selectedElement.type === 'text' ? (
                                        ['none', 'sticky', 'letter', 'modern'].map(s => (
                                            <button
                                                key={s}
                                                onClick={() => updateElement(selectedId, { msgStyle: s === 'none' ? null : s })}
                                                style={{
                                                    padding: '3px 8px', fontSize: '0.65rem', border: 'none', borderRadius: 15,
                                                    background: (selectedElement.msgStyle || 'none') === s ? 'white' : 'transparent',
                                                    boxShadow: (selectedElement.msgStyle || 'none') === s ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                    cursor: 'pointer', textTransform: 'capitalize'
                                                }}
                                            >
                                                {s}
                                            </button>
                                        ))
                                    ) : (
                                        ['none', 'polaroid', 'modern', 'tape'].map(f => (
                                            <button
                                                key={f}
                                                onClick={() => updateElement(selectedId, { frame: f === 'none' ? null : f })}
                                                style={{
                                                    padding: '3px 8px', fontSize: '0.65rem', border: 'none', borderRadius: 15,
                                                    background: (selectedElement.frame || 'none') === f ? 'white' : 'transparent',
                                                    boxShadow: (selectedElement.frame || 'none') === f ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
                                                    cursor: 'pointer', textTransform: 'capitalize'
                                                }}
                                            >
                                                {f}
                                            </button>
                                        ))
                                    )}
                                </div>
                            </div>

                            {/* 2. Type-Specific Actions (Formatting or Crop) */}
                            {selectedElement.type === 'text' ? (
                                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                                    <select
                                        value={selectedElement.fontFamily || 'var(--font-serif)'}
                                        onChange={(e) => updateElement(selectedId, { fontFamily: e.target.value })}
                                        style={{ fontSize: '0.75rem', border: '1px solid #ddd', borderRadius: 6, padding: '3px 6px', outline: 'none', background: 'white' }}
                                    >
                                        <option value="var(--font-serif)">Classic</option>
                                        <option value="var(--font-sans)">Clean</option>
                                        <option value="'Dancing Script', cursive">Cursive</option>
                                        <option value="'Indie Flower', cursive">Handwritten</option>
                                        <option value="'Great Vibes', cursive">Sexy</option>
                                    </select>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button onMouseDown={(e) => handleToolbarClick(e, 'bold')} className="toolbar-btn" style={{ width: 30, height: 30 }}><Bold size={14} /></button>
                                        <button onMouseDown={(e) => handleToolbarClick(e, 'italic')} className="toolbar-btn" style={{ width: 30, height: 30 }}><Italic size={14} /></button>
                                    </div>
                                    <div style={{ display: 'flex', gap: 4 }}>
                                        <button onClick={() => changeTextAlign('left')} className="toolbar-btn" style={{ width: 30, height: 30, background: selectedElement.textAlign === 'left' ? 'white' : 'none' }}><AlignLeft size={14} /></button>
                                        <button onClick={() => changeTextAlign('center')} className="toolbar-btn" style={{ width: 30, height: 30, background: (selectedElement.textAlign || 'center') === 'center' ? 'white' : 'none' }}><AlignCenter size={14} /></button>
                                    </div>
                                    <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
                                        <button onClick={() => changeFontSize(-2)} className="toolbar-btn" style={{ width: 26, height: 26 }}><Minus size={12} /></button>
                                        <span style={{ fontSize: '0.8rem', fontWeight: 600, minWidth: 20, textAlign: 'center' }}>{selectedElement.fontSize || 24}</span>
                                        <button onClick={() => changeFontSize(2)} className="toolbar-btn" style={{ width: 26, height: 26 }}><Plus size={12} /></button>
                                    </div>
                                </div>
                            ) : (
                                <button
                                    onClick={() => setImageToCrop({ src: selectedElement.src, id: selectedElement.id })}
                                    className="toolbar-btn"
                                    style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '6px 14px', width: 'auto', background: 'white', border: '1px solid #eee', borderRadius: 20 }}
                                >
                                    <ImageIcon size={16} />
                                    <span style={{ fontSize: '0.8rem', fontWeight: 600 }}>Modify Crop</span>
                                </button>
                            )}
                        </div>
                    )}

                    <div style={{ width: 1, height: 24, background: '#eee' }} />

                    {/* BRUSH TOOLS section */}
                    {(activeTool === 'pen' || activeTool === 'eraser') && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                                {['#1a1a1a', '#FF5252', '#448AFF', '#66BB6A', '#FFD740'].map(c => (
                                    <div
                                        key={c}
                                        onClick={() => setColor(c)}
                                        style={{ width: 14, height: 14, borderRadius: '50%', background: c, border: `2px solid ${color === c ? 'white' : 'transparent'}`, boxShadow: color === c ? '0 0 0 1px #ddd' : 'none', cursor: 'pointer' }}
                                    />
                                ))}
                            </div>
                            <input
                                type="range" min="1" max="50"
                                value={brushSize}
                                onChange={(e) => setBrushSize(parseInt(e.target.value))}
                                style={{ width: 60 }}
                            />
                        </div>
                    )}

                    <div style={{ width: 1, height: 24, background: '#eee' }} />

                    {/* GLOBAL TOOLS (Undo/Redo) */}
                    <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={undo} disabled={historyIndex <= 0} className="toolbar-btn" style={{ opacity: historyIndex <= 0 ? 0.3 : 1 }} title="Undo"><RotateCcw size={18} /></button>
                        <button onClick={redo} disabled={historyIndex >= history.length - 1} className="toolbar-btn" style={{ opacity: historyIndex >= history.length - 1 ? 0.3 : 1 }} title="Redo"><RotateCw size={18} /></button>
                    </div>

                </div>
            </div>

            {/* footer info */}
            <div className="no-export" style={{ position: 'absolute', bottom: 15, left: 0, right: 0, textAlign: 'center', fontSize: '0.7rem', color: '#aaa', zIndex: 10, pointerEvents: 'none' }}>
                <span style={{ pointerEvents: 'auto' }}>
                    2026 <a href="https://kaificial.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Kaificial</a>
                </span>
            </div>

            <CropModal
                image={imageToCrop}
                onClose={() => setImageToCrop(null)}
                onCropDone={handleCropDone}
            />
        </div>
    );
}

function CropModal({ image, onClose, onCropDone }) {
    const [crop, setCrop] = useState({ x: 10, y: 10, width: 80, height: 80 });
    const imageRef = useRef(null);
    const containerRef = useRef(null);
    const [isDragging, setIsDragging] = useState(false);
    const [isResizing, setIsResizing] = useState(false);
    const [resizeHandle, setResizeHandle] = useState(null);
    const [dragStart, setDragStart] = useState({ x: 0, y: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 });

    if (!image) return null;

    const handlePointerDown = (e, handle = null) => {
        e.stopPropagation();
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        if (handle) {
            setIsResizing(true);
            setResizeHandle(handle);
        } else {
            setIsDragging(true);
        }
        setDragStart({ x, y, cropX: crop.x, cropY: crop.y, cropW: crop.width, cropH: crop.height });
    };

    const handlePointerMove = (e) => {
        if (!isDragging && !isResizing) return;
        const rect = containerRef.current.getBoundingClientRect();
        const x = ((e.clientX - rect.left) / rect.width) * 100;
        const y = ((e.clientY - rect.top) / rect.height) * 100;

        const dx = x - dragStart.x;
        const dy = y - dragStart.y;

        if (isDragging) {
            setCrop(prev => ({
                ...prev,
                x: Math.max(0, Math.min(100 - prev.width, dragStart.cropX + dx)),
                y: Math.max(0, Math.min(100 - prev.height, dragStart.cropY + dy))
            }));
        } else if (isResizing) {
            setCrop(prev => {
                let newCrop = { ...prev };
                if (resizeHandle.includes('e')) newCrop.width = Math.max(10, Math.min(100 - prev.x, dragStart.cropW + dx));
                if (resizeHandle.includes('s')) newCrop.height = Math.max(10, Math.min(100 - prev.y, dragStart.cropH + dy));
                if (resizeHandle.includes('w')) {
                    const nextW = Math.max(10, dragStart.cropW - dx);
                    if (dragStart.cropX + dx >= 0 && dragStart.cropX + dx <= dragStart.cropX + dragStart.cropW - 10) {
                        newCrop.x = dragStart.cropX + dx;
                        newCrop.width = nextW;
                    }
                }
                if (resizeHandle.includes('n')) {
                    const nextH = Math.max(10, dragStart.cropH - dy);
                    if (dragStart.cropY + dy >= 0 && dragStart.cropY + dy <= dragStart.cropY + dragStart.cropH - 10) {
                        newCrop.y = dragStart.cropY + dy;
                        newCrop.height = nextH;
                    }
                }
                return newCrop;
            });
        }
    };

    const stopAction = () => {
        setIsDragging(false);
        setIsResizing(false);
        setResizeHandle(null);
    };

    const applyCrop = () => {
        const canvas = document.createElement('canvas');
        const img = imageRef.current;
        const scaleX = img.naturalWidth / 100;
        const scaleY = img.naturalHeight / 100;

        canvas.width = (crop.width * scaleX);
        canvas.height = (crop.height * scaleY);

        const ctx = canvas.getContext('2d');
        ctx.drawImage(
            img,
            crop.x * scaleX,
            crop.y * scaleY,
            crop.width * scaleX,
            crop.height * scaleY,
            0, 0,
            canvas.width,
            canvas.height
        );

        onCropDone(canvas.toDataURL('image/jpeg', 0.8), image.id);
    };

    const Handle = ({ pos }) => {
        const style = {
            position: 'absolute',
            width: 12, height: 12,
            background: 'white', border: '2px solid #1a1a1a',
            zIndex: 10, borderRadius: '50%',
            cursor: pos.length === 1 ? (pos === 'n' || pos === 's' ? 'ns-resize' : 'ew-resize') : (pos === 'nw' || pos === 'se' ? 'nwse-resize' : 'nesw-resize')
        };

        if (pos.includes('n')) style.top = -6;
        if (pos.includes('s')) style.bottom = -6;
        if (pos.includes('w')) style.left = -6;
        if (pos.includes('e')) style.right = -6;
        if (pos === 'n' || pos === 's') style.left = '50%', style.marginLeft = -6;
        if (pos === 'w' || pos === 'e') style.top = '50%', style.marginTop = -6;

        return <div style={style} onPointerDown={(e) => handlePointerDown(e, pos)} />;
    };

    return (
        <AnimatePresence>
            <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                style={{
                    position: 'fixed', inset: 0, zIndex: 3000,
                    background: 'rgba(0,0,0,0.85)', backdropFilter: 'blur(5px)',
                    display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 20
                }}
            >
                <motion.div
                    initial={{ scale: 0.9, y: 20 }}
                    animate={{ scale: 1, y: 0 }}
                    style={{
                        background: 'white', borderRadius: 24, width: '100%', maxWidth: 600,
                        overflow: 'hidden', boxShadow: '0 20px 60px rgba(0,0,0,0.5)'
                    }}
                >
                    <div style={{ padding: '20px 25px', borderBottom: '1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                        <h3 style={{ margin: 0, fontSize: '1.1rem', fontWeight: 600 }}>Crop Image</h3>
                        <button onClick={onClose} style={{ background: 'none', border: 'none', cursor: 'pointer', color: '#666' }}><X size={20} /></button>
                    </div>

                    <div style={{ padding: 20, background: '#111', display: 'flex', justifyContent: 'center' }}>
                        <div
                            ref={containerRef}
                            style={{ position: 'relative', maxWidth: '100%', maxHeight: '60vh', overflow: 'hidden' }}
                            onPointerMove={handlePointerMove}
                            onPointerUp={stopAction}
                            onPointerLeave={stopAction}
                        >
                            <img
                                ref={imageRef}
                                src={image.src}
                                alt="to crop"
                                style={{ display: 'block', maxWidth: '100%', maxHeight: '60vh', opacity: 0.5, userSelect: 'none', pointerEvents: 'none' }}
                            />
                            <div
                                onPointerDown={(e) => handlePointerDown(e)}
                                style={{
                                    position: 'absolute',
                                    top: `${crop.y}%`, left: `${crop.x}%`,
                                    width: `${crop.width}%`, height: `${crop.height}%`,
                                    border: '2px solid white', boxShadow: '0 0 0 9999px rgba(0,0,0,0.5)',
                                    cursor: 'move', touchAction: 'none'
                                }}
                            >
                                <Handle pos="nw" /> <Handle pos="n" /> <Handle pos="ne" />
                                <Handle pos="w" /> <Handle pos="e" />
                                <Handle pos="sw" /> <Handle pos="s" /> <Handle pos="se" />

                                <div style={{ position: 'absolute', inset: 0, border: '1px solid rgba(255,255,255,0.3)', display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gridTemplateRows: 'repeat(3, 1fr)' }}>
                                    {[...Array(9)].map((_, i) => <div key={i} style={{ border: '0.5px solid rgba(255,255,255,0.1)' }} />)}
                                </div>
                            </div>
                        </div>
                    </div>

                    <div style={{ padding: 15, background: '#f9f9f9', borderTop: '1px solid #eee', textAlign: 'center', fontSize: '0.8rem', color: '#666' }}>
                        Drag corners or edges to resize. Drag the center to reposition.
                    </div>

                    <div style={{ padding: 20, display: 'flex', justifyContent: 'flex-end', gap: 12, background: '#f9f9f9' }}>
                        <button onClick={onClose} style={{ padding: '10px 20px', borderRadius: 12, border: '1px solid #ddd', background: 'white', fontWeight: 500, cursor: 'pointer' }}>Cancel</button>
                        <button onClick={applyCrop} style={{ padding: '10px 25px', borderRadius: 12, border: 'none', background: '#1a1a1a', color: 'white', fontWeight: 600, cursor: 'pointer' }}>Apply Crop</button>
                    </div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    );
}
