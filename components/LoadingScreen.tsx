"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

export default function LoadingScreen() {
  const [visible, setVisible] = useState(true);
  const [fadeOut, setFadeOut] = useState(false);

  useEffect(() => {
    const t1 = setTimeout(() => setFadeOut(true), 1000);
    const t2 = setTimeout(() => setVisible(false), 1500);
    return () => {
      clearTimeout(t1);
      clearTimeout(t2);
    };
  }, []);

  if (!visible) return null;

  return (
    <div
      className="loading-screen"
      style={{ opacity: fadeOut ? 0 : 1 }}
    >
      <div className="loading-logo">
        <Image
          src="/logo.svg"
          alt="Avellum"
          width={80}
          height={80}
          priority
        />
      </div>
    </div>
  );
}
