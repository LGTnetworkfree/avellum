'use client';

import { useEffect, useRef } from 'react';

const LINE_COUNT = 10;       // convergence lines (top + bottom)
const ORBIT_COUNT = 4;       // concentric rings
const PARTICLE_COUNT = 20;   // nodes traveling along lines
const CYAN = '#00E5FF';

interface Particle {
  lineIdx: number;
  t: number;        // 0 = edge, 1 = center
  speed: number;
  size: number;
  alpha: number;
}

function initParticles(): Particle[] {
  return Array.from({ length: PARTICLE_COUNT }, () => ({
    lineIdx: Math.floor(Math.random() * LINE_COUNT),
    t: Math.random(),
    speed: 0.003 + Math.random() * 0.003,
    size: 1.5 + Math.random() * 1.5,
    alpha: 0.5 + Math.random() * 0.4,
  }));
}

export default function ProtocolOrbit() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const visibleRef = useRef(true);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationId: number;
    let time = 0;
    const particles = initParticles();

    // --- IntersectionObserver ---
    const observer = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting; },
      { threshold: 0 },
    );
    observer.observe(canvas);

    // --- DPR resize ---
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // Pre-compute line angles — evenly spaced, coming from top and bottom
    const lineAngles: number[] = [];
    for (let i = 0; i < LINE_COUNT; i++) {
      lineAngles.push((i / LINE_COUNT) * Math.PI * 2);
    }

    // --- Draw loop ---
    const draw = () => {
      if (!visibleRef.current) {
        animationId = requestAnimationFrame(draw);
        return;
      }

      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      ctx.clearRect(0, 0, w, h);

      time += 0.006;

      const cx = w / 2;
      const cy = h / 2;
      const maxR = Math.min(w, h) * 0.46;

      // === Central glow (pulse) ===
      const pulse = 0.7 + Math.sin(time * 1.4) * 0.2 + Math.sin(time * 3.1) * 0.1;

      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, maxR * 0.45);
      halo.addColorStop(0, `rgba(0, 229, 255, ${0.14 * pulse})`);
      halo.addColorStop(0.5, `rgba(0, 229, 255, ${0.04 * pulse})`);
      halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      // === Concentric orbital rings ===
      for (let i = 1; i <= ORBIT_COUNT; i++) {
        const r = (i / ORBIT_COUNT) * maxR;
        const wobble = Math.sin(time * 0.8 + i * 1.2) * 1.5;

        // Glow ring
        ctx.beginPath();
        ctx.arc(cx, cy, r + wobble, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.04 + 0.02 * (ORBIT_COUNT - i)})`;
        ctx.lineWidth = 3;
        ctx.stroke();

        // Core ring
        ctx.beginPath();
        ctx.arc(cx, cy, r + wobble, 0, Math.PI * 2);
        ctx.strokeStyle = `rgba(0, 229, 255, ${0.12 + 0.04 * (ORBIT_COUNT - i)})`;
        ctx.lineWidth = 0.7;
        ctx.stroke();

        // Small orbit dots (2-3 per ring, rotating)
        const dotCount = 2 + (i % 2);
        for (let d = 0; d < dotCount; d++) {
          const angle = (d / dotCount) * Math.PI * 2 + time * (0.3 + i * 0.15) * (i % 2 === 0 ? 1 : -1);
          const dx = cx + Math.cos(angle) * (r + wobble);
          const dy = cy + Math.sin(angle) * (r + wobble);
          const dotAlpha = 0.4 + Math.sin(time * 2 + d + i) * 0.2;

          ctx.beginPath();
          ctx.arc(dx, dy, 2, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(0, 229, 255, ${dotAlpha})`;
          ctx.fill();
        }
      }

      // === Convergence lines (from edges toward center) ===
      for (let i = 0; i < LINE_COUNT; i++) {
        const angle = lineAngles[i];
        const startX = cx + Math.cos(angle) * (maxR + 30);
        const startY = cy + Math.sin(angle) * (maxR + 30);

        // Glow
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.04)';
        ctx.lineWidth = 4;
        ctx.stroke();

        // Core
        ctx.beginPath();
        ctx.moveTo(startX, startY);
        ctx.lineTo(cx, cy);
        ctx.strokeStyle = 'rgba(0, 229, 255, 0.12)';
        ctx.lineWidth = 0.5;
        ctx.stroke();
      }

      // === Particles traveling along lines toward center ===
      for (const p of particles) {
        p.t += p.speed;
        if (p.t > 1) {
          p.t = 0;
          p.lineIdx = Math.floor(Math.random() * LINE_COUNT);
          p.alpha = 0.5 + Math.random() * 0.4;
        }

        const angle = lineAngles[p.lineIdx];
        const dist = (maxR + 30) * (1 - p.t); // converging: far → center
        const px = cx + Math.cos(angle) * dist;
        const py = cy + Math.sin(angle) * dist;

        // Glow
        const glow = ctx.createRadialGradient(px, py, 0, px, py, p.size * 5);
        glow.addColorStop(0, `rgba(0, 229, 255, ${p.alpha * 0.4})`);
        glow.addColorStop(1, 'rgba(0, 229, 255, 0)');
        ctx.beginPath();
        ctx.arc(px, py, p.size * 5, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Core
        ctx.beginPath();
        ctx.arc(px, py, p.size, 0, Math.PI * 2);
        ctx.fillStyle = CYAN;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
      }

      // === Center node ===
      // Inner glow
      const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 22);
      innerGlow.addColorStop(0, `rgba(0, 229, 255, ${0.5 * pulse})`);
      innerGlow.addColorStop(0.5, `rgba(0, 229, 255, ${0.12 * pulse})`);
      innerGlow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, 22, 0, Math.PI * 2);
      ctx.fillStyle = innerGlow;
      ctx.fill();

      // Ring
      ctx.beginPath();
      ctx.arc(cx, cy, 10 + Math.sin(time * 1.5) * 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 229, 255, ${0.3 * pulse})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // Core dot
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 229, 255, ${0.8 * pulse})`;
      ctx.fill();

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
    <div className="absolute inset-0 flex items-center justify-center">
      {/* Canvas animation layer */}
      <canvas
        ref={canvasRef}
        className="absolute inset-0 w-full h-full"
        style={{ display: 'block' }}
      />
      {/* Logo overlay — slow rotation, centered on canvas center */}
      <img
        src="/logo.svg"
        alt=""
        className="spin-slow opacity-60 relative z-[1]"
        style={{ width: '38%', height: 'auto' }}
      />
    </div>
  );
}
