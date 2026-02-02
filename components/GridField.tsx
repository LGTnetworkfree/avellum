'use client';

import { useEffect, useRef } from 'react';

const SPACING = 40;
const DOT_RADIUS = 1;
const BASE_OPACITY = 0.08;
const WAVE_SPEED = 0.0015;
const MOUSE_RADIUS = 120;

export default function GridField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const visibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;

    // --- Mouse tracking ---
    const onMouseMove = (e: MouseEvent) => {
      const rect = canvas.getBoundingClientRect();
      mouseRef.current = { x: e.clientX - rect.left, y: e.clientY - rect.top };
    };
    const onMouseLeave = () => {
      mouseRef.current = { x: -1000, y: -1000 };
    };
    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);

    // --- Resize handler ---
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // --- IntersectionObserver: pause when off-screen ---
    const observer = new IntersectionObserver(
      ([entry]) => {
        visibleRef.current = entry.isIntersecting;
      },
      { threshold: 0 }
    );
    observer.observe(canvas);

    // --- Draw loop ---
    const draw = () => {
      if (!visibleRef.current) {
        animationId = requestAnimationFrame(draw);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, w, h);
      time += WAVE_SPEED;

      const cols = Math.ceil(w / SPACING) + 1;
      const rows = Math.ceil(h / SPACING) + 1;
      const centerX = w / 2;
      const centerY = h / 2;

      for (let row = 0; row < rows; row++) {
        for (let col = 0; col < cols; col++) {
          const x = col * SPACING;
          const y = row * SPACING;

          // Wave pulse radiating from center
          const distFromCenter = Math.hypot(x - centerX, y - centerY);
          const wave = Math.sin(distFromCenter * 0.02 - time * 40) * 0.5 + 0.5;
          let opacity = BASE_OPACITY + wave * 0.04;

          // Mouse proximity brightening
          const distToMouse = Math.hypot(x - mouse.x, y - mouse.y);
          let color = `rgba(75, 106, 138, ${opacity})`;

          if (distToMouse < MOUSE_RADIUS) {
            const proximity = 1 - distToMouse / MOUSE_RADIUS;
            opacity = Math.min(opacity + proximity * 0.5, 0.7);
            const r = Math.round(75 + (0 - 75) * proximity);
            const g = Math.round(106 + (212 - 106) * proximity);
            const b = Math.round(138 + (255 - 138) * proximity);
            color = `rgba(${r}, ${g}, ${b}, ${opacity})`;
          }

          ctx.beginPath();
          ctx.arc(x, y, DOT_RADIUS, 0, Math.PI * 2);
          ctx.fillStyle = color;
          ctx.fill();
        }
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="absolute inset-0 w-full h-full pointer-events-auto"
      style={{ display: 'block', zIndex: 0 }}
    />
  );
}
