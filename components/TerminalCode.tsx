"use client";

import { useEffect, useRef, useState } from "react";
import { useInView } from "framer-motion";

interface Token {
  text: string;
  color: string;
}

const COLORS = {
  keyword: "#00E5FF",
  string: "#5DE5A0",
  comment: "#4b6a8a",
  variable: "#ffffff",
  punct: "#a0a0a0",
  func: "#c0c0c0",
};

// Each line is an array of colored tokens
const CODE_LINES: Token[][] = [
  [
    { text: "import", color: COLORS.keyword },
    { text: " { ", color: COLORS.punct },
    { text: "Avellum", color: COLORS.variable },
    { text: " } ", color: COLORS.punct },
    { text: "from", color: COLORS.keyword },
    { text: " ", color: COLORS.punct },
    { text: "'@avellum/sdk'", color: COLORS.string },
  ],
  [],
  [
    { text: "const", color: COLORS.keyword },
    { text: " agent ", color: COLORS.variable },
    { text: "= ", color: COLORS.punct },
    { text: "await", color: COLORS.keyword },
    { text: " Avellum.", color: COLORS.func },
    { text: "verify", color: COLORS.keyword },
    { text: "({", color: COLORS.punct },
  ],
  [
    { text: "  address", color: COLORS.variable },
    { text: ": ", color: COLORS.punct },
    { text: '"0x7a3..."', color: COLORS.string },
    { text: ",", color: COLORS.punct },
  ],
  [
    { text: "  protocol", color: COLORS.variable },
    { text: ": ", color: COLORS.punct },
    { text: '"x402"', color: COLORS.string },
  ],
  [{ text: "})", color: COLORS.punct }],
  [],
  [
    { text: "console", color: COLORS.func },
    { text: ".", color: COLORS.punct },
    { text: "log", color: COLORS.keyword },
    { text: "(agent.trustScore)", color: COLORS.punct },
  ],
  [
    { text: "// => 94", color: COLORS.comment },
  ],
];

// Flatten all characters with their colors for typing
function flattenLines() {
  const chars: { char: string; color: string }[] = [];
  CODE_LINES.forEach((line, lineIdx) => {
    line.forEach((token) => {
      for (const ch of token.text) {
        chars.push({ char: ch, color: token.color });
      }
    });
    if (lineIdx < CODE_LINES.length - 1) {
      chars.push({ char: "\n", color: "" });
    }
  });
  return chars;
}

const ALL_CHARS = flattenLines();
const CHAR_DELAY = 35; // ms per character

export default function TerminalCode() {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true });
  const [charCount, setCharCount] = useState(0);
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!inView) return;
    let i = 0;
    const interval = setInterval(() => {
      i++;
      setCharCount(i);
      if (i >= ALL_CHARS.length) {
        clearInterval(interval);
        setDone(true);
      }
    }, CHAR_DELAY);
    return () => clearInterval(interval);
  }, [inView]);

  // Build visible spans
  const visible = ALL_CHARS.slice(0, charCount);
  const elements: React.ReactNode[] = [];
  let lineNum = 1;

  // Add first line number
  elements.push(
    <span key="ln-1" className="terminal-line-num">
      {String(lineNum).padStart(2, " ")}
      {"  "}
    </span>
  );

  visible.forEach((c, i) => {
    if (c.char === "\n") {
      elements.push(<br key={`br-${i}`} />);
      lineNum++;
      elements.push(
        <span key={`ln-${lineNum}`} className="terminal-line-num">
          {String(lineNum).padStart(2, " ")}
          {"  "}
        </span>
      );
    } else {
      elements.push(
        <span key={i} style={{ color: c.color }}>
          {c.char}
        </span>
      );
    }
  });

  return (
    <div ref={ref} className="terminal-window">
      {/* Title bar */}
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <span className="terminal-dot terminal-dot-red" />
          <span className="terminal-dot terminal-dot-yellow" />
          <span className="terminal-dot terminal-dot-green" />
        </div>
        <span className="terminal-filename">avellum.ts</span>
      </div>
      {/* Code body */}
      <pre className="terminal-body">
        <code>
          {elements}
          {!done && <span className="terminal-cursor">|</span>}
          {done && <span className="terminal-cursor terminal-cursor-idle">|</span>}
        </code>
      </pre>
    </div>
  );
}
