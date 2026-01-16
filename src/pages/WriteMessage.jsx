import React, { useState, useRef, useEffect } from 'react';
import { useParams, useNavigate, useSearchParams } from 'react-router-dom';
import { ArrowLeft, Send, Type, Image as ImageIcon, X, Bold, Italic, Underline, Minus, Plus, AlignLeft, AlignCenter, AlignRight, RotateCcw, RotateCw, Pencil, Eraser } from 'lucide-react';
import { api } from '../services/api';
import html2canvas from 'html2canvas';
import { v4 as uuidv4 } from 'uuid';
import '../App.css';

const DraggableElement = ({ element, updateElement, removeElement, isSelected, onSelect }) => {

    // manual drag logic for moving stuff
    const handleMoveStart = (e) => {
        if (e.target.dataset.handle || e.target.isContentEditable) return;

        e.preventDefault();
        onSelect(e);

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

            updateElement(element.id, { x: newX, y: newY });
        };

        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    const handleResizeStart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const startWidth = element.width || 200;
        const startX = e.clientX;

        const onMove = (moveEvent) => {
            moveEvent.preventDefault();
            moveEvent.stopPropagation();
            const delta = moveEvent.clientX - startX;
            const newWidth = Math.max(50, startWidth + delta);
            updateElement(element.id, { width: newWidth });
        };

        const onUp = () => {
            window.removeEventListener('pointermove', onMove);
            window.removeEventListener('pointerup', onUp);
        };

        window.addEventListener('pointermove', onMove);
        window.addEventListener('pointerup', onUp);
    };

    const handleRotateStart = (e) => {
        e.preventDefault();
        e.stopPropagation();

        const rect = e.target.parentElement.getBoundingClientRect();
        const centerX = rect.left + rect.width / 2;
        const centerY = rect.top + rect.height / 2;

        const startAngle = Math.atan2(e.clientY - centerY, e.clientX - centerX);
        const startRotation = element.rotation || 0;

        const onMove = (moveEvent) => {
            moveEvent.preventDefault();
            moveEvent.stopPropagation();
            const currentAngle = Math.atan2(moveEvent.clientY - centerY, moveEvent.clientX - centerX);
            const deg = (currentAngle - startAngle) * (180 / Math.PI);
            updateElement(element.id, { rotation: startRotation + deg });
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
            className="draggable-item"
            data-id={element.id}
            onPointerDown={handleMoveStart}
            onClick={(e) => { e.stopPropagation(); onSelect(e); }}
            style={{
                position: 'absolute',
                top: `${element.y}%`,
                left: `${element.x}%`,
                width: element.width || 200,
                transform: `translate(-50%, -50%) rotate(${element.rotation || 0}deg)`,
                cursor: 'grab',
                zIndex: isSelected ? 100 : 10,
                transformOrigin: 'center center',
                userSelect: 'none',
                touchAction: 'none'
            }}
        >
            <div
                style={{
                    position: 'relative',
                    border: isSelected ? '1px dashed #4b89dc' : '1px solid transparent',
                    padding: 0,
                    height: '100%'
                }}
            >
                {isSelected && (
                    <button
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

                <div style={{ width: '100%', height: '100%' }}>
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
                                fontFamily: 'var(--font-serif)',
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
                                padding: 10
                            }}
                        />
                    ) : (
                        <img
                            src={element.src}
                            alt="sticker"
                            style={{ width: '100%', height: 'auto', display: 'block' }}
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

    const [elements, setElements] = useState([]);
    const [history, setHistory] = useState([{ elements: [], paths: [] }]);
    const [historyIndex, setHistoryIndex] = useState(0);
    const [selectedId, setSelectedId] = useState(null);
    const [isSaving, setIsSaving] = useState(false);
    const [isLoading, setIsLoading] = useState(!!drawingId);

    // some state for drawing
    const [activeTool, setActiveTool] = useState('select'); // 'select', 'pen', 'eraser'
    const [color, setColor] = useState('#2C2C2C');
    const [brushSize, setBrushSize] = useState(5);
    const [isDrawing, setIsDrawing] = useState(false);
    const [paths, setPaths] = useState([]);

    const selectedElement = elements.find(el => el.id === selectedId);

    // initial load if we are in edit mode
    useEffect(() => {
        if (drawingId) {
            api.getCard(id).then(card => {
                const drawing = card.drawings.find(d => d.id === Number(drawingId));
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
            }).catch(e => {
                console.error(e);
                setIsLoading(false);
            });
        }
    }, [id, drawingId]);

    // drawing stuff
    useEffect(() => {
        if (!inkingCanvasRef.current) return;
        const ctx = inkingCanvasRef.current.getContext('2d');
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
    }, [paths]);

    const startDrawing = (e) => {
        if (activeTool === 'select') return;
        setIsDrawing(true);
        const rect = inkingCanvasRef.current.getBoundingClientRect();
        const scaleX = inkingCanvasRef.current.width / rect.width;
        const scaleY = inkingCanvasRef.current.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        setPaths(prev => [...prev, {
            points: [{ x, y }],
            color: activeTool === 'eraser' ? 'white' : color,
            width: brushSize,
            isEraser: activeTool === 'eraser'
        }]);
    };

    const draw = (e) => {
        if (!isDrawing) return;
        const rect = inkingCanvasRef.current.getBoundingClientRect();
        const scaleX = inkingCanvasRef.current.width / rect.width;
        const scaleY = inkingCanvasRef.current.height / rect.height;
        const x = (e.clientX - rect.left) * scaleX;
        const y = (e.clientY - rect.top) * scaleY;
        setPaths(prev => {
            const newPaths = [...prev];
            const currentPath = newPaths[newPaths.length - 1];
            currentPath.points.push({ x, y });
            return newPaths;
        });
    };

    const stopDrawing = () => {
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
            rotation: 0,
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
                const newEl = {
                    id: uuidv4(),
                    type: 'image',
                    src: f.target.result,
                    x: 50, y: 50,
                    width: 200,
                    rotation: 0
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

        // for text and stickers
        elements.forEach(el => {
            const pxX = (el.x / 100) * container.width;
            const pxY = (el.y / 100) * container.height;
            const halfW = (el.width || 200) / 2;
            const halfH = el.type === 'text' ? 50 : halfW;

            minX = Math.min(minX, pxX - halfW);
            minY = Math.min(minY, pxY - halfH);
            maxX = Math.max(maxX, pxX + halfW);
            maxY = Math.max(maxY, pxY + halfH);
        });

        // for paths
        paths.forEach(path => {
            path.points.forEach(p => {
                const pxX = (p.x / 1000) * container.width;
                const pxY = (p.y / 1000) * container.height;
                minX = Math.min(minX, pxX);
                minY = Math.min(minY, pxY);
                maxX = Math.max(maxX, pxX);
                maxY = Math.max(maxY, pxY);
            });
        });

        const padding = 40;
        const boxX = Math.max(0, minX - padding);
        const boxY = Math.max(0, minY - padding);
        const boxW = Math.min(container.width - boxX, (maxX - minX) + padding * 2);
        const boxH = Math.min(container.height - boxY, (maxY - minY) + padding * 2);

        return {
            x: boxX,
            y: boxY,
            width: boxW,
            height: boxH,
            centerX: ((boxX + boxW / 2) / container.width) * 100,
            centerY: ((boxY + boxH / 2) / container.height) * 100
        };
    };

    const handleSave = async () => {
        if (isSaving) return;
        setIsSaving(true);
        setSelectedId(null);
        setActiveTool('select');

        await new Promise(r => setTimeout(r, 100));

        try {
            const bounds = getBoundingBox();

            const canvas = await html2canvas(canvasRef.current, {
                backgroundColor: '#ffffff',
                scale: 2,
                logging: false,
                useCORS: true,
                // if there is content crop to it, otherwise just capture the whole canvas
                x: bounds ? bounds.x : 0,
                y: bounds ? bounds.y : 0,
                width: bounds ? bounds.width : undefined,
                height: bounds ? bounds.height : undefined
            });

            const dataUrl = canvas.toDataURL('image/png', 0.8);
            const contentJson = JSON.stringify({ elements, paths });
            const userId = localStorage.getItem('userId');
            const authorName = localStorage.getItem('userName') || "Anonymous";
            const recipientName = searchParams.get('recipient');

            // use the center of the stuff for how it shows up on the card
            const posX = bounds ? bounds.centerX : 50;
            const posY = bounds ? bounds.centerY : 50;

            if (drawingId) {
                await api.updateDrawing(id, drawingId, {
                    imageData: dataUrl,
                    contentJson,
                    x: posX,
                    y: posY
                });
            } else {
                await api.addDrawing(id, {
                    imageData: dataUrl,
                    contentJson,
                    userId,
                    authorName,
                    x: posX,
                    y: posY
                }, recipientName);
            }

            nav(`/card/${id}?recipient=${encodeURIComponent(recipientName || '')}`);
        } catch (err) {
            console.error(err);
            alert(`Failed to save: ${err.message}`);
            setIsSaving(false);
        }
    };

    if (isLoading) return <div className="app-container">Loading editor...</div>;

    return (
        <div className="app-container" style={{ background: '#f8f9fa' }}>
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

                <button
                    onClick={handleSave}
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
                    {isSaving ? 'Saving...' : 'Finish Message'}
                    <Send size={18} />
                </button>
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
                        boxShadow: '0 10px 40px rgba(0,0,0,0.04)',
                        border: '1px solid rgba(0,0,0,0.02)',
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
                        />
                    ))}

                    <canvas
                        ref={inkingCanvasRef}
                        width={1000}
                        height={1000}
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

                    {activeTool === 'select' && selectedElement && selectedElement.type === 'text' && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ display: 'flex', gap: 5 }}>
                                <button onMouseDown={(e) => handleToolbarClick(e, 'bold')} className="toolbar-btn"><Bold size={16} /></button>
                                <button onMouseDown={(e) => handleToolbarClick(e, 'italic')} className="toolbar-btn"><Italic size={16} /></button>
                                <button onMouseDown={(e) => handleToolbarClick(e, 'underline')} className="toolbar-btn"><Underline size={16} /></button>
                            </div>
                            <div style={{ display: 'flex', gap: 5 }}>
                                <button onClick={() => changeTextAlign('left')} className="toolbar-btn" style={{ background: selectedElement.textAlign === 'left' ? 'white' : 'none', boxShadow: selectedElement.textAlign === 'left' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', borderRadius: 4 }}><AlignLeft size={16} /></button>
                                <button onClick={() => changeTextAlign('center')} className="toolbar-btn" style={{ background: selectedElement.textAlign === 'center' ? 'white' : 'none', boxShadow: selectedElement.textAlign === 'center' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', borderRadius: 4 }}><AlignCenter size={16} /></button>
                                <button onClick={() => changeTextAlign('right')} className="toolbar-btn" style={{ background: selectedElement.textAlign === 'right' ? 'white' : 'none', boxShadow: selectedElement.textAlign === 'right' ? '0 1px 3px rgba(0,0,0,0.1)' : 'none', borderRadius: 4 }}><AlignRight size={16} /></button>
                            </div>
                            <div style={{ width: 1, height: 20, background: '#eee', margin: '0 5px' }} />
                            <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
                                <button onClick={() => changeFontSize(-2)} className="toolbar-btn"><Minus size={14} /></button>
                                <input
                                    type="text"
                                    value={selectedElement.fontSize === undefined ? 24 : selectedElement.fontSize}
                                    onChange={(e) => {
                                        const val = e.target.value;
                                        if (val === "" || /^\d+$/.test(val)) {
                                            updateElement(selectedElement.id, { fontSize: val === "" ? "" : parseInt(val) }, true);
                                        }
                                    }}
                                    onBlur={(e) => {
                                        if (e.target.value === "" || parseInt(e.target.value) < 1) {
                                            updateElement(selectedElement.id, { fontSize: 24 });
                                        }
                                    }}
                                    style={{ width: 45, border: '1px solid #ddd', borderRadius: 4, padding: '2px 5px', textAlign: 'center' }}
                                />
                                <button onClick={() => changeFontSize(2)} className="toolbar-btn"><Plus size={14} /></button>
                            </div>
                        </div>
                    )}

                    {(activeTool === 'pen' || activeTool === 'eraser') && (
                        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(5, 1fr)', gap: 4 }}>
                                {['#1a1a1a', '#FF5252', '#448AFF', '#66BB6A', '#FFD740', '#AB47BC', '#FF9800', '#00BCD4', '#E91E63', '#8BC34A'].map(c => (
                                    <div
                                        key={c}
                                        onClick={() => setColor(c)}
                                        style={{ width: 14, height: 14, borderRadius: '50%', background: c, border: '1px solid #ddd', cursor: 'pointer', boxShadow: color === c ? '0 0 0 2px white, 0 0 0 3px #1a1a1a' : 'none' }}
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

                    <div style={{ display: 'flex', gap: 5 }}>
                        <button onClick={undo} disabled={historyIndex <= 0} className="toolbar-btn" style={{ opacity: historyIndex <= 0 ? 0.3 : 1 }}><RotateCcw size={18} /></button>
                        <button onClick={redo} disabled={historyIndex >= history.length - 1} className="toolbar-btn" style={{ opacity: historyIndex >= history.length - 1 ? 0.3 : 1 }}><RotateCw size={18} /></button>
                    </div>
                </div>
            </div>
            {/* footer info */}
            <div className="no-export" style={{ position: 'absolute', bottom: 15, left: 0, right: 0, textAlign: 'center', fontSize: '0.7rem', color: '#aaa', zIndex: 10, pointerEvents: 'none' }}>
                <span style={{ pointerEvents: 'auto' }}>
                    2026 <a href="https://kaificial.vercel.app" target="_blank" rel="noopener noreferrer" style={{ color: 'inherit', textDecoration: 'underline' }}>Kaificial</a>
                </span>
            </div>
        </div>
    );
}
