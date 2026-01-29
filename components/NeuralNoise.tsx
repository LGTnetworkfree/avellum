'use client';

import { useEffect, useRef } from 'react';

export default function NeuralNoise() {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    useEffect(() => {
        const canvas = canvasRef.current;
        if (!canvas) return;

        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let width: number;
        let height: number;
        let animationFrameId: number;

        const resize = () => {
            const parent = canvas.parentElement;
            if (parent) {
                width = parent.clientWidth;
                height = parent.clientHeight;
                canvas.width = width;
                canvas.height = height;
            }
        };

        resize();
        window.addEventListener('resize', resize);

        const draw = () => {
            ctx.fillStyle = '#050d18';
            ctx.fillRect(0, 0, width, height);

            const imageData = ctx.getImageData(0, 0, width, height);
            const data = imageData.data;
            const scale = 0.003;
            const time = Date.now() * 0.0002;

            for (let x = 0; x < width; x += 2) {
                for (let y = 0; y < height; y += 2) {
                    const v = Math.sin(x * scale + time) * Math.cos(y * scale + time) + Math.sin((x + y) * scale * 2);
                    let gray = (v + 2) / 4 * 255;
                    gray += (Math.random() - 0.5) * 50;

                    const threshold = 120 + (Math.random() * 40);
                    if (gray > threshold) {
                        const index = (y * width + x) * 4;
                        data[index] = 0;     // R
                        data[index + 1] = 212; // G
                        data[index + 2] = 255; // B
                        data[index + 3] = 180; // A
                    }
                }
            }

            ctx.putImageData(imageData, 0, 0);
            animationFrameId = requestAnimationFrame(draw);
        };

        draw();

        return () => {
            window.removeEventListener('resize', resize);
            cancelAnimationFrame(animationFrameId);
        };
    }, []);

    return (
        <canvas
            ref={canvasRef}
            id="noiseCanvas"
            className="w-full h-full opacity-60 contrast-[1.8] brightness-125 block"
        />
    );
}
