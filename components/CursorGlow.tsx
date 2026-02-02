"use client";

import { useEffect, useRef, useState } from "react";

const FOLLOWER_LERP = 0.15;
const MAGNETIC_RADIUS = 100;
const MAX_PULL = 4;
const MAGNETIC_SELECTOR = ".btn-interactive, .btn-angular, .wallet-adapter-button";
const LINK_SELECTOR =
  "a, button, [role='button'], .btn-interactive, .btn-angular, .nav-link-glow, .wallet-adapter-button";

const PARTICLE_LIFETIME = 600;
const PARTICLE_MAX = 40;
const SPAWN_INTERVAL = 25; // ms between spawns

function lerp(a: number, b: number, t: number) {
  return a + (b - a) * t;
}

interface Particle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  born: number;
}

export default function CursorGlow() {
  const [enabled, setEnabled] = useState(false);

  const dotRef = useRef<HTMLDivElement>(null);
  const followerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  const mouse = useRef({ x: -200, y: -200 });
  const followerPos = useRef({ x: -200, y: -200 });
  const visible = useRef(false);
  const hovering = useRef(false);
  const rafId = useRef(0);
  const particles = useRef<Particle[]>([]);
  const lastSpawn = useRef(0);
  const prevMouse = useRef({ x: -200, y: -200 });

  useEffect(() => {
    const pointer = window.matchMedia("(pointer: fine)");
    const hover = window.matchMedia("(hover: hover)");
    if (pointer.matches && hover.matches) {
      setEnabled(true);
    }
  }, []);

  useEffect(() => {
    if (!enabled) return;

    const dot = dotRef.current;
    const follower = followerRef.current;
    const canvas = canvasRef.current;
    if (!dot || !follower || !canvas) return;

    const ctx = canvas.getContext("2d")!;
    let magneticEls: HTMLElement[] = [];

    function resize() {
      const dpr = window.devicePixelRatio || 1;
      canvas!.width = window.innerWidth * dpr;
      canvas!.height = window.innerHeight * dpr;
      canvas!.style.width = window.innerWidth + "px";
      canvas!.style.height = window.innerHeight + "px";
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    }
    resize();

    function onMouseMove(e: MouseEvent) {
      mouse.current.x = e.clientX;
      mouse.current.y = e.clientY;

      if (!visible.current) {
        visible.current = true;
        dot!.style.opacity = "1";
        follower!.style.opacity = "1";
      }

      // Spawn particles when cursor moves
      const now = performance.now();
      const dx = e.clientX - prevMouse.current.x;
      const dy = e.clientY - prevMouse.current.y;
      const moved = Math.sqrt(dx * dx + dy * dy);

      if (moved > 2 && now - lastSpawn.current > SPAWN_INTERVAL) {
        lastSpawn.current = now;
        if (particles.current.length < PARTICLE_MAX) {
          particles.current.push({
            x: e.clientX,
            y: e.clientY,
            vx: (Math.random() - 0.5) * 0.8,
            vy: (Math.random() - 0.5) * 0.8,
            size: 2 + Math.random() * 2,
            born: now,
          });
        }
      }

      prevMouse.current.x = e.clientX;
      prevMouse.current.y = e.clientY;

      // Magnetic pull
      magneticEls = Array.from(
        document.querySelectorAll(MAGNETIC_SELECTOR)
      ) as HTMLElement[];

      magneticEls.forEach((el) => {
        const rect = el.getBoundingClientRect();
        const cx = rect.left + rect.width / 2;
        const cy = rect.top + rect.height / 2;
        const ddx = e.clientX - cx;
        const ddy = e.clientY - cy;
        const dist = Math.sqrt(ddx * ddx + ddy * ddy);

        if (dist < MAGNETIC_RADIUS) {
          const t = 1 - dist / MAGNETIC_RADIUS;
          const pull = t * t * MAX_PULL;
          const angle = Math.atan2(ddy, ddx);
          el.style.translate = `${Math.cos(angle) * pull}px ${Math.sin(angle) * pull}px`;
        } else {
          el.style.translate = "";
        }
      });
    }

    function onMouseOver(e: MouseEvent) {
      if (e.target instanceof Element && e.target.closest(LINK_SELECTOR)) {
        hovering.current = true;
      } else {
        hovering.current = false;
      }
    }

    function onMouseOut(e: MouseEvent) {
      if (
        e.relatedTarget instanceof Element &&
        e.relatedTarget.closest(LINK_SELECTOR)
      ) {
        hovering.current = true;
      } else {
        hovering.current = false;
      }
    }

    function onMouseLeave() {
      visible.current = false;
      hovering.current = false;
      dot!.style.opacity = "0";
      follower!.style.opacity = "0";
      magneticEls.forEach((el) => {
        el.style.translate = "";
      });
    }

    function onMouseEnter() {
      visible.current = true;
      dot!.style.opacity = "1";
      follower!.style.opacity = "1";
    }

    function tick() {
      const mx = mouse.current.x;
      const my = mouse.current.y;
      const now = performance.now();

      // Dot — tracks cursor exactly
      dot!.style.transform = `translate3d(${mx - 3}px, ${my - 3}px, 0)`;

      // Follower — lerp with hover state
      followerPos.current.x = lerp(followerPos.current.x, mx, FOLLOWER_LERP);
      followerPos.current.y = lerp(followerPos.current.y, my, FOLLOWER_LERP);
      const fx = followerPos.current.x;
      const fy = followerPos.current.y;

      if (hovering.current) {
        follower!.style.transform = `translate3d(${fx - 19.6}px, ${fy - 19.6}px, 0) scale(1.4)`;
        follower!.style.background = "rgba(0, 229, 255, 0.1)";
      } else {
        follower!.style.transform = `translate3d(${fx - 14}px, ${fy - 14}px, 0) scale(1)`;
        follower!.style.background = "transparent";
      }

      // Particles — draw on canvas
      ctx.clearRect(0, 0, canvas!.width, canvas!.height);
      const alive: Particle[] = [];

      for (const p of particles.current) {
        const age = now - p.born;
        if (age >= PARTICLE_LIFETIME) continue;

        p.x += p.vx;
        p.y += p.vy;

        const progress = age / PARTICLE_LIFETIME;
        const opacity = 0.6 * (1 - progress);

        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = `rgba(0, 229, 255, ${opacity})`;
        ctx.fill();

        alive.push(p);
      }
      particles.current = alive;

      rafId.current = requestAnimationFrame(tick);
    }

    document.addEventListener("mousemove", onMouseMove);
    document.body.addEventListener("mouseover", onMouseOver);
    document.body.addEventListener("mouseout", onMouseOut);
    document.documentElement.addEventListener("mouseenter", onMouseEnter);
    document.documentElement.addEventListener("mouseleave", onMouseLeave);
    window.addEventListener("resize", resize);
    rafId.current = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(rafId.current);
      document.removeEventListener("mousemove", onMouseMove);
      document.body.removeEventListener("mouseover", onMouseOver);
      document.body.removeEventListener("mouseout", onMouseOut);
      document.documentElement.removeEventListener("mouseenter", onMouseEnter);
      document.documentElement.removeEventListener("mouseleave", onMouseLeave);
      window.removeEventListener("resize", resize);
      magneticEls.forEach((el) => {
        el.style.translate = "";
      });
    };
  }, [enabled]);

  if (!enabled) return null;

  return (
    <div
      style={{
        position: "fixed",
        top: 0,
        left: 0,
        width: 0,
        height: 0,
        overflow: "visible",
        pointerEvents: "none",
        zIndex: 9998,
      }}
    >
      {/* Particle trail canvas */}
      <canvas
        ref={canvasRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          pointerEvents: "none",
        }}
      />
      {/* Follower circle */}
      <div
        ref={followerRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 28,
          height: 28,
          borderRadius: "50%",
          border: "1px solid rgba(0, 229, 255, 0.4)",
          background: "transparent",
          pointerEvents: "none",
          willChange: "transform",
          transition: "background 0.2s ease-out",
          opacity: 0,
        }}
      />
      {/* Dot */}
      <div
        ref={dotRef}
        style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: 6,
          height: 6,
          borderRadius: "50%",
          border: "1.5px solid #00E5FF",
          background: "transparent",
          pointerEvents: "none",
          willChange: "transform",
          opacity: 0,
        }}
      />
    </div>
  );
}
