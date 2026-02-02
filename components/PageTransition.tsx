"use client";

import { usePathname } from "next/navigation";
import { AnimatePresence, motion } from "framer-motion";

export default function PageTransition({
  children,
}: {
  children: React.ReactNode;
}) {
  const pathname = usePathname();

  return (
    <AnimatePresence mode="wait">
      <motion.div key={pathname}>
        {/* Cyan flash overlay */}
        <motion.div
          style={{
            position: "fixed",
            inset: 0,
            background: "#00E5FF",
            pointerEvents: "none",
            zIndex: 50,
          }}
          initial={{ opacity: 0.08 }}
          animate={{ opacity: 0 }}
          transition={{ duration: 0.1 }}
        />

        {/* Scan line */}
        <motion.div
          style={{
            position: "fixed",
            left: 0,
            width: "100%",
            height: "2px",
            background:
              "linear-gradient(90deg, transparent 0%, #00E5FF 20%, #00E5FF 80%, transparent 100%)",
            boxShadow:
              "0 0 15px 3px rgba(0,229,255,0.4), 0 0 40px 5px rgba(0,229,255,0.15)",
            pointerEvents: "none",
            zIndex: 51,
          }}
          initial={{ top: "0%", opacity: 1 }}
          animate={{ top: "100%", opacity: [1, 1, 0] }}
          transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
        />

        {/* Content — clip reveal on enter, glitch on exit */}
        <motion.div
          initial={{ clipPath: "inset(0 0 100% 0)" }}
          animate={{ clipPath: "inset(0 0 0% 0)" }}
          exit={{
            opacity: [1, 0.5, 0.8, 0],
            x: [0, -3, 4, 0],
            filter: [
              "brightness(1) hue-rotate(0deg)",
              "brightness(1.4) hue-rotate(40deg)",
              "brightness(0.7) hue-rotate(-30deg)",
              "brightness(1) hue-rotate(0deg)",
            ],
            transition: { duration: 0.15, ease: "easeIn" },
          }}
          transition={{
            clipPath: { duration: 0.3, ease: [0.4, 0, 0.2, 1] },
          }}
        >
          {children}
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
