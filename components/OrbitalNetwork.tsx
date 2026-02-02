'use client';

import { useEffect, useRef } from 'react';

const NODES = [
  { label: 'INDEX', offset: 0 },
  { label: 'VERIFY', offset: Math.PI * 0.5 },
  { label: 'SCORE', offset: Math.PI },
  { label: 'QUERY', offset: Math.PI * 1.5 },
];

export default function OrbitalNetwork() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: -1000, y: -1000 });
  const positionsRef = useRef<{ x: number; y: number; label: string; isHovered: boolean }[]>([]);

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
    // --- Click handler for node labels ---
    const onClick = () => {
      for (const pos of positionsRef.current) {
        if (pos.isHovered) {
          const heading = document.getElementById('solution-heading');
          const card = document.getElementById(`step-${pos.label.toLowerCase()}`);
          if (heading) {
            heading.scrollIntoView({ behavior: 'smooth', block: 'start' });
          }
          if (card) {
            document.querySelectorAll('.card-highlight').forEach(el => el.classList.remove('card-highlight'));
            setTimeout(() => {
              card.classList.add('card-highlight');
              setTimeout(() => card.classList.remove('card-highlight'), 1800);
            }, 600);
          }
          break;
        }
      }
    };

    canvas.addEventListener('mousemove', onMouseMove);
    canvas.addEventListener('mouseleave', onMouseLeave);
    canvas.addEventListener('click', onClick);

    const resize = () => {
      const dpr = window.devicePixelRatio || 1;
      const rect = canvas.getBoundingClientRect();
      canvas.width = rect.width * dpr;
      canvas.height = rect.height * dpr;
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    };

    resize();
    window.addEventListener('resize', resize);

    const draw = () => {
      const rect = canvas.getBoundingClientRect();
      const w = rect.width;
      const h = rect.height;
      const cx = w / 2;
      const cy = h / 2;
      const radius = Math.min(w, h) * 0.30;
      const mouse = mouseRef.current;

      ctx.clearRect(0, 0, w, h);
      time += 0.002;

      // --- Subtle grid background ---
      ctx.save();
      const gridSize = 32;
      ctx.strokeStyle = 'rgba(30, 58, 90, 0.08)';
      ctx.lineWidth = 1;
      for (let x = 0; x < w; x += gridSize) {
        ctx.beginPath();
        ctx.moveTo(x, 0);
        ctx.lineTo(x, h);
        ctx.stroke();
      }
      for (let y = 0; y < h; y += gridSize) {
        ctx.beginPath();
        ctx.moveTo(0, y);
        ctx.lineTo(w, y);
        ctx.stroke();
      }
      ctx.restore();

      // --- Mouse proximity glow on background ---
      const mouseDist = Math.hypot(mouse.x - cx, mouse.y - cy);
      if (mouse.x > 0 && mouseDist < radius * 2.5) {
        const mouseGlow = ctx.createRadialGradient(mouse.x, mouse.y, 0, mouse.x, mouse.y, 120);
        mouseGlow.addColorStop(0, 'rgba(0, 255, 255, 0.06)');
        mouseGlow.addColorStop(1, 'transparent');
        ctx.fillStyle = mouseGlow;
        ctx.fillRect(0, 0, w, h);
      }

      // --- Background radial glow ---
      const bgGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, radius * 1.8);
      bgGlow.addColorStop(0, 'rgba(0, 212, 255, 0.05)');
      bgGlow.addColorStop(0.5, 'rgba(0, 212, 255, 0.015)');
      bgGlow.addColorStop(1, 'transparent');
      ctx.fillStyle = bgGlow;
      ctx.fillRect(0, 0, w, h);

      // --- Outer orbit ring ---
      ctx.beginPath();
      ctx.arc(cx, cy, radius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(30, 58, 90, 0.4)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // --- Inner orbit ring ---
      const innerRadius = radius * 0.5;
      ctx.beginPath();
      ctx.arc(cx, cy, innerRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(30, 58, 90, 0.25)';
      ctx.lineWidth = 1;
      ctx.stroke();

      // --- Dashed middle ring ---
      const midRadius = radius * 0.75;
      ctx.save();
      ctx.setLineDash([3, 8]);
      ctx.beginPath();
      ctx.arc(cx, cy, midRadius, 0, Math.PI * 2);
      ctx.strokeStyle = 'rgba(30, 58, 90, 0.2)';
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // --- Calculate main node positions ---
      const positions = NODES.map((node) => {
        const angle = node.offset + time;
        const nx = cx + Math.cos(angle) * radius;
        const ny = cy + Math.sin(angle) * radius;
        const distToMouse = Math.hypot(mouse.x - nx, mouse.y - ny);
        const isHovered = distToMouse < 40;
        return { x: nx, y: ny, angle, label: node.label, distToMouse, isHovered };
      });

      // Store positions for click handler & update cursor
      positionsRef.current = positions;
      canvas.style.cursor = positions.some(p => p.isHovered) ? 'pointer' : 'crosshair';

      // --- Connection lines between all nodes ---
      for (let i = 0; i < positions.length; i++) {
        for (let j = i + 1; j < positions.length; j++) {
          const a = positions[i];
          const b = positions[j];
          const eitherHovered = a.isHovered || b.isHovered;

          ctx.beginPath();
          ctx.moveTo(a.x, a.y);
          ctx.lineTo(b.x, b.y);
          ctx.strokeStyle = eitherHovered
            ? 'rgba(0, 255, 255, 0.25)'
            : 'rgba(0, 212, 255, 0.07)';
          ctx.lineWidth = eitherHovered ? 1.5 : 1;
          ctx.stroke();
        }
      }

      // --- Pulse packets traveling along connections ---
      for (let i = 0; i < positions.length; i++) {
        const next = positions[(i + 1) % positions.length];
        const a = positions[i];

        const pulseT = ((time * 8 + i * 1.5) % 4) / 4;
        if (pulseT < 1) {
          const px = a.x + (next.x - a.x) * pulseT;
          const py = a.y + (next.y - a.y) * pulseT;

          const pulseGlow = ctx.createRadialGradient(px, py, 0, px, py, 10);
          pulseGlow.addColorStop(0, 'rgba(0, 255, 255, 0.7)');
          pulseGlow.addColorStop(1, 'rgba(0, 255, 255, 0)');
          ctx.beginPath();
          ctx.arc(px, py, 10, 0, Math.PI * 2);
          ctx.fillStyle = pulseGlow;
          ctx.fill();

          ctx.beginPath();
          ctx.arc(px, py, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = '#00ffff';
          ctx.fill();
        }
      }

      // --- Inner orbit particles (data/agents) ---
      for (let i = 0; i < 8; i++) {
        const pAngle = (Math.PI * 2 * i) / 8 - time * 3;
        const pr = innerRadius + Math.sin(time * 4 + i) * 4;
        const px = cx + Math.cos(pAngle) * pr;
        const py = cy + Math.sin(pAngle) * pr;
        const alpha = 0.3 + Math.sin(time * 3 + i * 0.7) * 0.2;

        ctx.beginPath();
        ctx.arc(px, py, 2, 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 212, 255, ${alpha})`;
        ctx.fill();
      }

      // --- Middle ring particles (verifiers) ---
      for (let i = 0; i < 5; i++) {
        const mAngle = (Math.PI * 2 * i) / 5 + time * 1.5;
        const mx = cx + Math.cos(mAngle) * midRadius;
        const my = cy + Math.sin(mAngle) * midRadius;

        ctx.beginPath();
        ctx.arc(mx, my, 1.5, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(75, 106, 138, 0.6)';
        ctx.fill();
      }

      // --- Center glow ---
      const centerPulse = 0.6 + Math.sin(time * 2) * 0.2;
      const centerGlow = ctx.createRadialGradient(cx, cy, 0, cx, cy, 28);
      centerGlow.addColorStop(0, `rgba(0, 255, 255, ${centerPulse * 0.35})`);
      centerGlow.addColorStop(0.4, `rgba(0, 212, 255, ${centerPulse * 0.1})`);
      centerGlow.addColorStop(1, 'transparent');
      ctx.beginPath();
      ctx.arc(cx, cy, 28, 0, Math.PI * 2);
      ctx.fillStyle = centerGlow;
      ctx.fill();

      // Center diamond
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(time * 0.5);
      ctx.beginPath();
      ctx.moveTo(0, -7);
      ctx.lineTo(7, 0);
      ctx.lineTo(0, 7);
      ctx.lineTo(-7, 0);
      ctx.closePath();
      ctx.strokeStyle = `rgba(0, 255, 255, ${centerPulse})`;
      ctx.lineWidth = 1;
      ctx.stroke();
      ctx.restore();

      // --- Main nodes ---
      positions.forEach((pos) => {
        const hover = pos.isHovered;
        const baseGlowRadius = hover ? 36 : 18;
        const nodeRadius = hover ? 9 : 7;
        const dotRadius = hover ? 4 : 3;

        // Outer glow (bigger + brighter on hover)
        const glow = ctx.createRadialGradient(pos.x, pos.y, 0, pos.x, pos.y, baseGlowRadius);
        glow.addColorStop(0, hover ? 'rgba(0, 255, 255, 0.5)' : 'rgba(0, 255, 255, 0.2)');
        glow.addColorStop(0.5, hover ? 'rgba(0, 255, 255, 0.15)' : 'rgba(0, 255, 255, 0.05)');
        glow.addColorStop(1, 'rgba(0, 255, 255, 0)');
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, baseGlowRadius, 0, Math.PI * 2);
        ctx.fillStyle = glow;
        ctx.fill();

        // Secondary ripple ring on hover
        if (hover) {
          const ripple = 18 + Math.sin(time * 8) * 6;
          ctx.beginPath();
          ctx.arc(pos.x, pos.y, ripple, 0, Math.PI * 2);
          ctx.strokeStyle = `rgba(0, 255, 255, ${0.3 - (ripple - 18) * 0.03})`;
          ctx.lineWidth = 1;
          ctx.stroke();
        }

        // Node ring
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, nodeRadius, 0, Math.PI * 2);
        ctx.strokeStyle = hover ? 'rgba(0, 255, 255, 1)' : 'rgba(0, 255, 255, 0.6)';
        ctx.lineWidth = hover ? 2 : 1.5;
        ctx.stroke();

        // Node fill
        ctx.beginPath();
        ctx.arc(pos.x, pos.y, dotRadius, 0, Math.PI * 2);
        ctx.fillStyle = '#00ffff';
        ctx.fill();

        // Label (brighter + larger on hover)
        ctx.font = hover
          ? '600 10px "JetBrains Mono", monospace'
          : '500 8px "JetBrains Mono", monospace';
        ctx.textAlign = 'center';
        ctx.fillStyle = hover ? 'rgba(0, 255, 255, 1)' : 'rgba(160, 160, 160, 0.8)';
        ctx.fillText(pos.label, pos.x, pos.y + (hover ? 30 : 26));
      });

      animationId = requestAnimationFrame(draw);
    };

    draw();

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener('resize', resize);
      canvas.removeEventListener('mousemove', onMouseMove);
      canvas.removeEventListener('mouseleave', onMouseLeave);
      canvas.removeEventListener('click', onClick);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="w-full h-full"
      style={{ display: 'block', cursor: 'crosshair' }}
    />
  );
}
