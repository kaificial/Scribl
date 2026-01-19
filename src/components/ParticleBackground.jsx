import React, { useEffect, useRef } from 'react';

const DotInteraction = () => {
    const canvasRef = useRef(null);
    const mouseRef = useRef({ x: -9999, y: -9999 });
    const animationRef = useRef(null);
    const dotEnergyRef = useRef(new Map());

    useEffect(() => {
        const canvas = canvasRef.current;
        const ctx = canvas.getContext('2d');

        const dotSpacing = 36; // Increased spacing (fewer dots)
        const interactionRadius = 120;
        const energyDecay = 0.015; // Faster decay for performance

        let dots = [];
        const resizeCanvas = () => {
            canvas.width = window.innerWidth;
            canvas.height = window.innerHeight;

            // only redo the dots when the window resizes
            dots = [];
            for (let x = dotSpacing / 2; x < canvas.width; x += dotSpacing) {
                for (let y = dotSpacing / 2; y < canvas.height; y += dotSpacing) {
                    dots.push({ x, y, key: `${x}-${y}` });
                }
            }
        };
        resizeCanvas();
        window.addEventListener('resize', resizeCanvas);

        const handleMouseMove = (e) => {
            mouseRef.current = { x: e.clientX, y: e.clientY };
        };
        window.addEventListener('mousemove', handleMouseMove);

        const handleMouseLeave = () => {
            mouseRef.current = { x: -9999, y: -9999 };
        };
        window.addEventListener('mouseleave', handleMouseLeave);

        const animate = () => {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            const mouse = mouseRef.current;
            const dotEnergy = dotEnergyRef.current;

            // update how much energy each dot has
            dots.forEach((dot) => {
                const dx = mouse.x - dot.x;
                const dy = mouse.y - dot.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                // give some energy to dots near the mouse
                if (distance < interactionRadius) {
                    const intensity = 1 - distance / interactionRadius;
                    const currentEnergy = dotEnergy.get(dot.key) || 0;
                    dotEnergy.set(dot.key, Math.max(currentEnergy, intensity));
                }

                // make the energy fade away
                const energy = dotEnergy.get(dot.key);
                if (energy > 0) {
                    dotEnergy.set(dot.key, Math.max(0, energy - energyDecay));
                }
            });

            // draw the dots that have some energy
            const activeDots = [];
            dots.forEach((dot) => {
                const energy = dotEnergy.get(dot.key) || 0;

                if (energy > 0.05) {
                    activeDots.push({ ...dot, energy });

                    // draw a darker dot
                    const size = 1.5 + energy * 2.5;
                    ctx.beginPath();
                    ctx.arc(dot.x, dot.y, size, 0, Math.PI * 2);
                    ctx.fillStyle = `rgba(26, 26, 26, ${energy * 0.4})`;
                    ctx.fill();
                }
            });

            // draw lines between dots that are close (limit count for performance)
            const lineLimit = 150;
            let linesDrawn = 0;

            for (let i = 0; i < activeDots.length && linesDrawn < lineLimit; i++) {
                const dot1 = activeDots[i];
                for (let j = i + 1; j < activeDots.length && linesDrawn < lineLimit; j++) {
                    const dot2 = activeDots[j];
                    const dx = dot1.x - dot2.x;
                    const dy = dot1.y - dot2.y;
                    const distanceSq = dx * dx + dy * dy;

                    if (distanceSq < 10000) { // 100^2
                        const distance = Math.sqrt(distanceSq);
                        const avgEnergy = (dot1.energy + dot2.energy) / 2;
                        const opacity = (1 - distance / 100) * avgEnergy * 0.12;

                        ctx.beginPath();
                        ctx.moveTo(dot1.x, dot1.y);
                        ctx.lineTo(dot2.x, dot2.y);
                        ctx.strokeStyle = `rgba(26, 26, 26, ${opacity})`;
                        ctx.lineWidth = 0.5;
                        ctx.stroke();
                        linesDrawn++;
                    }
                }
            }

            animationRef.current = requestAnimationFrame(animate);
        };

        animate();

        return () => {
            window.removeEventListener('resize', resizeCanvas);
            window.removeEventListener('mousemove', handleMouseMove);
            window.removeEventListener('mouseleave', handleMouseLeave);
            if (animationRef.current) {
                cancelAnimationFrame(animationRef.current);
            }
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            style={{
                position: 'absolute',
                top: 0,
                left: 0,
                width: '100%',
                height: '100%',
                pointerEvents: 'none',
                zIndex: 0
            }}
        />
    );
};

export default DotInteraction;
