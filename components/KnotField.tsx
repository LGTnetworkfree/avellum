'use client';

import { useEffect, useRef } from 'react';

export default function KnotField() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    let isVisible = true;

    const observer = new IntersectionObserver(
      ([entry]) => { isVisible = entry.isIntersecting; },
      { threshold: 0 }
    );
    observer.observe(canvas);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    // Knot curve: a parametric Lissajous-like figure
    function knotX(t: number, cx: number, rx: number, phaseX: number) {
      return cx + rx * Math.sin(3 * t + phaseX);
    }

    function knotY(t: number, cy: number, ry: number, phaseY: number) {
      return cy + ry * Math.sin(2 * t + phaseY);
    }

    const draw = () => {
      if (!isVisible) {
        animationId = requestAnimationFrame(draw);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w * 0.5;
      const cy = h * 0.5;

      ctx.clearRect(0, 0, w, h);
      time += 0.003;

      // Subtle radial glow behind the knot
      const bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, Math.min(w, h) * 0.5);
      bgGlow.addColorStop(0, 'rgba(0, 229, 255, 0.04)');
      bgGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, w, h);

      const curves = [
        { rx: w * 0.38, ry: h * 0.32, phaseX: time * 0.4, phaseY: time * 0.3, alpha: 0.5, width: 1.5 },
        { rx: w * 0.34, ry: h * 0.28, phaseX: time * 0.4 + 0.8, phaseY: time * 0.3 + 1.2, alpha: 0.35, width: 1 },
        { rx: w * 0.30, ry: h * 0.24, phaseX: time * 0.4 + 1.6, phaseY: time * 0.3 + 2.4, alpha: 0.25, width: 1 },
        { rx: w * 0.42, ry: h * 0.35, phaseX: time * 0.4 + 2.4, phaseY: time * 0.3 + 0.6, alpha: 0.2, width: 0.8 },
        { rx: w * 0.26, ry: h * 0.20, phaseX: time * 0.4 + 3.2, phaseY: time * 0.3 + 1.8, alpha: 0.15, width: 0.8 },
      ];

      // Draw each intertwined curve
      for (const curve of curves) {
        ctx.beginPath();
        const steps = 300;
        for (let i = 0; i <= steps; i++) {
          const t = (i / steps) * Math.PI * 2;
          const x = knotX(t, cx, curve.rx, curve.phaseX);
          const y = knotY(t, cy, curve.ry, curve.phaseY);
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.closePath();
        ctx.strokeStyle = `rgba(0, 229, 255, ${curve.alpha})`;
        ctx.lineWidth = curve.width;
        ctx.stroke();
      }

      // Traveling dots along the primary curve
      for (let i = 0; i < 6; i++) {
        const t = ((time * 1.5 + i * (Math.PI * 2) / 6) % (Math.PI * 2));
        const curve = curves[0];
        const x = knotX(t, cx, curve.rx, curve.phaseX);
        const y = knotY(t, cy, curve.ry, curve.phaseY);

        const dotGlow = ctx.createRadialGradient(x, y, 0, x, y, 8);
        dotGlow.addColorStop(0, 'rgba(0, 229, 255, 0.6)');
        dotGlow.addColorStop(1, 'rgba(0, 229, 255, 0)');
        ctx.beginPath();
        ctx.arc(x, y, 8, 0, Math.PI * 2);
        ctx.fillStyle = dotGlow;
        ctx.fill();

        ctx.beginPath();
        ctx.arc(x, y, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = '#00E5FF';
        ctx.fill();
      }

      // Secondary dots on the second curve
      for (let i = 0; i < 4; i++) {
        const t = ((time * 1.2 + i * (Math.PI * 2) / 4 + Math.PI * 0.5) % (Math.PI * 2));
        const curve = curves[1];
        const x = knotX(t, cx, curve.rx, curve.phaseX);
        const y = knotY(t, cy, curve.ry, curve.phaseY);

        ctx.beginPath();
        ctx.arc(x, y, 1.2, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(0, 229, 255, 0.4)';
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      observer.disconnect();
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
