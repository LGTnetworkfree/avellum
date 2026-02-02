'use client';

import { useRef, useEffect, useState, createContext, useContext, Fragment, type ReactNode } from 'react';
import { motion, useInView } from 'framer-motion';

/* ── Hero animation context (shared inView trigger) ── */
const HeroContext = createContext(false);

export function HeroSection({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });

  return (
    <HeroContext.Provider value={inView}>
      <div ref={ref} className={className}>
        {children}
      </div>
    </HeroContext.Provider>
  );
}

/* ── HeroTitle: word-by-word fade-in + accent glow ── */
export function HeroTitle({
  lines,
  accent,
  className,
}: {
  lines: string[];
  accent: string;
  className?: string;
}) {
  const inView = useContext(HeroContext);
  const [glowActive, setGlowActive] = useState(false);

  let wordIndex = 0;
  const elements: ReactNode[] = [];

  lines.forEach((line, lineIdx) => {
    const words = line.split(' ');
    words.forEach((word, wordIdx) => {
      const idx = wordIndex++;
      elements.push(
        <motion.span
          key={`w-${idx}`}
          initial={{ opacity: 0, y: 20 }}
          animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
          transition={{ duration: 0.5, ease: 'easeOut', delay: idx * 0.15 }}
          style={{ display: 'inline-block' }}
        >
          {word}
        </motion.span>
      );
      if (wordIdx < words.length - 1) {
        elements.push(<Fragment key={`sp-${idx}`}>{' '}</Fragment>);
      }
    });
    if (lineIdx < lines.length - 1) {
      elements.push(<br key={`br-${lineIdx}`} />);
    }
  });

  const accentDelay = wordIndex * 0.15 + 0.2;

  useEffect(() => {
    if (inView) {
      const timer = setTimeout(() => setGlowActive(true), accentDelay * 1000);
      return () => clearTimeout(timer);
    }
  }, [inView, accentDelay]);

  return (
    <h1 className={className}>
      {elements}
      <br />
      <motion.span
        initial={{ opacity: 0, y: 20 }}
        animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 20 }}
        transition={{ duration: 0.5, ease: 'easeOut', delay: accentDelay }}
        className={`italic text-[#00ffff] ${glowActive ? 'hero-glow-fade' : ''}`}
        style={{ display: 'inline-block' }}
      >
        {accent}
      </motion.span>
    </h1>
  );
}

/* ── HeroParagraph: delayed fade-in + subtle slide ── */
export function HeroParagraph({
  children,
  delay,
  className,
}: {
  children: ReactNode;
  delay: number;
  className?: string;
}) {
  const inView = useContext(HeroContext);

  return (
    <motion.p
      initial={{ opacity: 0, y: 10 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 10 }}
      transition={{ duration: 0.5, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.p>
  );
}

/* ── HeroLabel: staggered fade-in for metadata rows ── */
export function HeroLabel({
  children,
  index,
  baseDelay,
  className,
}: {
  children: ReactNode;
  index: number;
  baseDelay: number;
  className?: string;
}) {
  const inView = useContext(HeroContext);

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={inView ? { opacity: 1 } : { opacity: 0 }}
      transition={{ duration: 0.4, ease: 'easeOut', delay: baseDelay + index * 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── FadeIn: sections fade in + slide up ── */
export function FadeIn({
  children,
  className,
  delay = 0,
}: {
  children: ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── ScaleIn: visuals fade in + scale ── */
export function ScaleIn({
  children,
  className,
}: {
  children: ReactNode;
  className?: string;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-60px 0px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, scale: 0.95 }}
      animate={inView ? { opacity: 1, scale: 1 } : { opacity: 0, scale: 0.95 }}
      transition={{ duration: 0.8, ease: 'easeOut' }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── StaggerItem: individual list item with index-based delay ── */
export function StaggerItem({
  children,
  className,
  index,
}: {
  children: ReactNode;
  className?: string;
  index: number;
}) {
  const ref = useRef(null);
  const inView = useInView(ref, { once: true, margin: '-40px 0px' });

  return (
    <motion.div
      ref={ref}
      initial={{ opacity: 0, y: 30 }}
      animate={inView ? { opacity: 1, y: 0 } : { opacity: 0, y: 30 }}
      transition={{ duration: 0.6, ease: 'easeOut', delay: index * 0.1 }}
      className={className}
    >
      {children}
    </motion.div>
  );
}

/* ── CountUp: animate number from 0 to target ── */
export function CountUp({
  end,
  duration = 1.5,
  prefix = '',
  suffix = '',
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);

  useEffect(() => {
    if (!inView || end === 0) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3); // easeOutCubic
      setValue(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, end, duration]);

  return (
    <span ref={ref}>
      {prefix}
      {value.toLocaleString()}
      {suffix}
    </span>
  );
}

/* ── LiveCounter: CountUp + periodic "+1" floater ── */
export function LiveCounter({
  end,
  duration = 1.5,
  prefix = '',
  suffix = '',
}: {
  end: number;
  duration?: number;
  prefix?: string;
  suffix?: string;
}) {
  const ref = useRef<HTMLSpanElement>(null);
  const inView = useInView(ref, { once: true });
  const [value, setValue] = useState(0);
  const [plusKey, setPlusKey] = useState(0);
  const [showPlus, setShowPlus] = useState(false);

  useEffect(() => {
    if (!inView || end === 0) return;
    const start = performance.now();
    const tick = (now: number) => {
      const elapsed = (now - start) / 1000;
      const progress = Math.min(elapsed / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      setValue(Math.round(eased * end));
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }, [inView, end, duration]);

  useEffect(() => {
    if (!inView) return;
    let timerId: ReturnType<typeof setTimeout>;
    const scheduleNext = () => {
      const delay = 10000 + Math.random() * 5000;
      timerId = setTimeout(() => {
        setPlusKey((k) => k + 1);
        setShowPlus(true);
        setTimeout(() => setShowPlus(false), 800);
        scheduleNext();
      }, delay);
    };
    scheduleNext();
    return () => clearTimeout(timerId);
  }, [inView]);

  return (
    <span ref={ref} className="relative inline-block">
      {prefix}
      {value.toLocaleString()}
      {suffix}
      {showPlus && (
        <span key={plusKey} className="live-counter-plus">+1</span>
      )}
    </span>
  );
}

/* ── StatBar: animated progress bar triggered on scroll ── */
export function StatBar({ percent }: { percent: number }) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });

  return (
    <div ref={ref} className="stat-bar">
      <div
        className="stat-bar-fill"
        style={{ width: inView ? `${percent}%` : '0%' }}
      />
    </div>
  );
}
