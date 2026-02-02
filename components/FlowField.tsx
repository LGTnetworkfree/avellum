'use client';

import { useEffect, useRef } from 'react';

// --- Configuration ---
const LINES_PER_STREAM = 4;
const OUTPUT_BRANCHES = 5;
const PARTICLE_COUNT = 45;
const CYAN = '#00E5FF';

// 3 input streams: x402, MCP, A2A — each with origin angle & slight tint variation
const INPUT_STREAMS = [
  { label: 'x402', originY: 0.18, rgb: '0, 229, 255',  coreAlpha: 0.30, glowAlpha: 0.07 },
  { label: 'MCP',  originY: 0.50, rgb: '0, 210, 255',  coreAlpha: 0.25, glowAlpha: 0.06 },
  { label: 'A2A',  originY: 0.82, rgb: '0, 245, 255',  coreAlpha: 0.28, glowAlpha: 0.065 },
];

// Output branches (angles fanning out from centre to the right)
const OUTPUT_ANGLES = [-0.55, -0.25, 0, 0.25, 0.55]; // radians from horizontal

interface Particle {
  stream: number;   // -1 = output branch, 0-2 = input stream index
  branch: number;   // line index within stream, or branch index for output
  t: number;        // 0-1 progress along path
  speed: number;
  size: number;
  alpha: number;
}

function initParticles(): Particle[] {
  const particles: Particle[] = [];
  const inputCount = Math.floor(PARTICLE_COUNT * 0.55);
  const outputCount = PARTICLE_COUNT - inputCount;

  for (let i = 0; i < inputCount; i++) {
    particles.push({
      stream: Math.floor(Math.random() * 3),
      branch: Math.floor(Math.random() * LINES_PER_STREAM),
      t: Math.random(),
      speed: 0.002 + Math.random() * 0.002,
      size: 1 + Math.random() * 1.5,
      alpha: 0.5 + Math.random() * 0.4,
    });
  }
  for (let i = 0; i < outputCount; i++) {
    particles.push({
      stream: -1,
      branch: Math.floor(Math.random() * OUTPUT_BRANCHES),
      t: Math.random(),
      speed: 0.002 + Math.random() * 0.0025,
      size: 1 + Math.random() * 1.5,
      alpha: 0.5 + Math.random() * 0.4,
    });
  }
  return particles;
}

export default function FlowField() {
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

    // --- IntersectionObserver to pause off-screen ---
    const observer = new IntersectionObserver(
      ([entry]) => { visibleRef.current = entry.isIntersecting; },
      { threshold: 0 },
    );
    observer.observe(canvas);

    // --- DPR-aware resize ---
    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };
    resize();
    window.addEventListener('resize', resize);

    // --- Path helpers ---

    /** Input stream: Bezier from left edge → centre node */
    function inputPoint(
      streamIdx: number, lineIdx: number, t: number,
      w: number, h: number, cx: number, cy: number, time: number,
    ): { x: number; y: number } {
      const s = INPUT_STREAMS[streamIdx];
      const spread = ((lineIdx - (LINES_PER_STREAM - 1) / 2) / LINES_PER_STREAM) * 0.12;
      const originY = (s.originY + spread) * h;
      const wave = Math.sin(time * 0.7 + streamIdx * 2.1 + lineIdx * 0.8) * 8;

      // Cubic bezier: P0 → P1 → P2 → P3
      const p0x = -10, p0y = originY + wave;
      const p1x = cx * 0.35, p1y = originY + wave * 0.5;
      const p2x = cx * 0.7, p2y = cy + (originY - cy) * 0.2;
      const p3x = cx, p3y = cy;

      const mt = 1 - t;
      const x = mt * mt * mt * p0x + 3 * mt * mt * t * p1x + 3 * mt * t * t * p2x + t * t * t * p3x;
      const y = mt * mt * mt * p0y + 3 * mt * mt * t * p1y + 3 * mt * t * t * p2y + t * t * t * p3y;
      return { x, y };
    }

    /** Output branch: Bezier from centre node → right edge */
    function outputPoint(
      branchIdx: number, lineIdx: number, t: number,
      w: number, h: number, cx: number, cy: number, time: number,
    ): { x: number; y: number } {
      const angle = OUTPUT_ANGLES[branchIdx];
      const spread = ((lineIdx - (LINES_PER_STREAM - 1) / 2) / LINES_PER_STREAM) * 0.06;
      const finalAngle = angle + spread;
      const wave = Math.sin(time * 0.6 + branchIdx * 1.4 + lineIdx * 0.6) * 6;

      const reach = w - cx + 10;
      const endX = cx + reach;
      const endY = cy + Math.sin(finalAngle) * reach + wave;

      const p0x = cx, p0y = cy;
      const p1x = cx + reach * 0.3, p1y = cy + Math.sin(finalAngle) * reach * 0.15;
      const p2x = cx + reach * 0.65, p2y = cy + Math.sin(finalAngle) * reach * 0.65 + wave * 0.5;
      const p3x = endX, p3y = endY;

      const mt = 1 - t;
      const x = mt * mt * mt * p0x + 3 * mt * mt * t * p1x + 3 * mt * t * t * p2x + t * t * t * p3x;
      const y = mt * mt * mt * p0y + 3 * mt * mt * t * p1y + 3 * mt * t * t * p2y + t * t * t * p3y;
      return { x, y };
    }

    function drawBezierPath(
      ctx: CanvasRenderingContext2D,
      pointFn: (t: number) => { x: number; y: number },
      steps: number,
    ) {
      const first = pointFn(0);
      ctx.moveTo(first.x, first.y);
      for (let i = 1; i <= steps; i++) {
        const p = pointFn(i / steps);
        ctx.lineTo(p.x, p.y);
      }
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

      time += 0.008;

      const cx = w * 0.48;
      const cy = h * 0.50;
      const steps = 60;

      // === Central node glow (heartbeat pulse) ===
      const pulse = 0.7 + Math.sin(time * 1.2) * 0.2 + Math.sin(time * 2.8) * 0.1;

      // Outer halo
      const halo = ctx.createRadialGradient(cx, cy, 0, cx, cy, 70);
      halo.addColorStop(0, `rgba(0, 229, 255, ${0.15 * pulse})`);
      halo.addColorStop(0.5, `rgba(0, 229, 255, ${0.04 * pulse})`);
      halo.addColorStop(1, 'transparent');
      ctx.fillStyle = halo;
      ctx.fillRect(0, 0, w, h);

      // === Draw input stream lines ===
      for (let si = 0; si < INPUT_STREAMS.length; si++) {
        const s = INPUT_STREAMS[si];
        for (let li = 0; li < LINES_PER_STREAM; li++) {
          const pointFn = (t: number) => inputPoint(si, li, t, w, h, cx, cy, time);

          // Glow stroke
          ctx.beginPath();
          drawBezierPath(ctx, pointFn, steps);
          ctx.strokeStyle = `rgba(${s.rgb}, ${s.glowAlpha})`;
          ctx.lineWidth = 5;
          ctx.stroke();

          // Core stroke
          ctx.beginPath();
          drawBezierPath(ctx, pointFn, steps);
          ctx.strokeStyle = `rgba(${s.rgb}, ${s.coreAlpha})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // === Draw output branch lines ===
      for (let bi = 0; bi < OUTPUT_BRANCHES; bi++) {
        for (let li = 0; li < LINES_PER_STREAM; li++) {
          const pointFn = (t: number) => outputPoint(bi, li, t, w, h, cx, cy, time);

          // Glow stroke
          ctx.beginPath();
          drawBezierPath(ctx, pointFn, steps);
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.055)';
          ctx.lineWidth = 4;
          ctx.stroke();

          // Core stroke
          ctx.beginPath();
          drawBezierPath(ctx, pointFn, steps);
          ctx.strokeStyle = 'rgba(0, 229, 255, 0.22)';
          ctx.lineWidth = 1;
          ctx.stroke();
        }
      }

      // === Central node core ===
      // Inner bright glow
      const innerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 18);
      innerGlow.addColorStop(0, `rgba(0, 229, 255, ${0.6 * pulse})`);
      innerGlow.addColorStop(0.5, `rgba(0, 229, 255, ${0.15 * pulse})`);
      innerGlow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, 18, 0, Math.PI * 2);
      ctx.fillStyle = innerGlow;
      ctx.fill();

      // Core dot
      ctx.beginPath();
      ctx.arc(cx, cy, 3, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(0, 229, 255, ${0.8 * pulse})`;
      ctx.fill();

      // Ring
      ctx.beginPath();
      ctx.arc(cx, cy, 8 + Math.sin(time * 1.5) * 1.5, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(0, 229, 255, ${0.35 * pulse})`;
      ctx.lineWidth = 1;
      ctx.stroke();

      // === Particles ===
      for (const p of particles) {
        p.t += p.speed;
        if (p.t > 1) {
          p.t = 0;
          p.alpha = 0.5 + Math.random() * 0.4;
          if (p.stream >= 0) {
            p.stream = Math.floor(Math.random() * 3);
            p.branch = Math.floor(Math.random() * LINES_PER_STREAM);
          } else {
            p.branch = Math.floor(Math.random() * OUTPUT_BRANCHES);
          }
        }

        let pos: { x: number; y: number };
        let rgb = '0, 229, 255';
        if (p.stream >= 0) {
          pos = inputPoint(p.stream, p.branch, p.t, w, h, cx, cy, time);
          rgb = INPUT_STREAMS[p.stream].rgb;
        } else {
          pos = outputPoint(p.branch, p.branch % LINES_PER_STREAM, p.t, w, h, cx, cy, time);
        }

        // Particle glow
        const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, p.size * 4);
        glow.addColorStop(0, `rgba(${rgb}, ${p.alpha * 0.45})`);
        glow.addColorStop(1, `rgba(${rgb}, 0)`);
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size * 4, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Particle core
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, p.size, 0, Math.PI * 2);
        ctx.fillStyle = CYAN;
        ctx.globalAlpha = p.alpha;
        ctx.fill();
        ctx.globalAlpha = 1;
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
      className="absolute inset-0 w-full h-full"
      style={{ display: 'block' }}
    />
  );
}
