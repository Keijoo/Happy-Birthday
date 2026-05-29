"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import EnvelopeCard from "../components/EnvelopeCard";
import MemoryBoard from "../components/MemoryBoard";

// Fixed positions so they don't re-randomise on re-render
const PARTICLES = [
  { id: 0,  src: "/bees/bee_transparent.png",  x: -60,  y: -180, delay: 0,    size: 0.9 },
  { id: 1,  src: "/bees/bee4_transparent.png", x:  55,  y: -200, delay: 0.07, size: 0.8 },
  { id: 2,  src: "/bees/bee2_transparent.png", x: -100, y: -120, delay: 0.12, size: 1.0 },
  { id: 3,  src: "/bees/bee3_transparent.png", x:  90,  y: -140, delay: 0.05, size: 0.85},
  { id: 4,  src: "/bees/bee1_transparent.png", x: -30,  y: -230, delay: 0.18, size: 0.7 },
  { id: 5,  src: "/bees/bee5_transparent.png", x:  120, y: -100, delay: 0.1,  size: 0.75},
  { id: 6,  src: "/bees/bee6_transparent.png", x: -80,  y: -80,  delay: 0.15, size: 0.8 },
  { id: 7,  src: "/bees/bee9_transparent.png", x:  40,  y: -260, delay: 0.22, size: 0.9 },
  // sparkles mixed in
  { id: 8,  src: null, emoji: "✨", x: -140, y: -160, delay: 0.08, size: 1.1 },
  { id: 9,  src: null, emoji: "💛", x:  150, y: -180, delay: 0.14, size: 1.0 },
  { id: 10, src: null, emoji: "🎂", x:   10, y: -290, delay: 0.2,  size: 1.2 },
  { id: 11, src: null, emoji: "🌟", x: -170, y: -60,  delay: 0.06, size: 0.9 },
];

export default function Home() {
  const [currentState, setCurrentState] = useState<"closed" | "transitioning" | "open">("closed");

  const handleOpenSequence = () => {
    setCurrentState("transitioning");
    setTimeout(() => setCurrentState("open"), 2400);
  };

  return (
    <div className="w-full max-w-6xl flex flex-col items-center justify-center relative min-h-[80vh]">
      <AnimatePresence mode="wait">

        {currentState === "closed" && (
          <motion.div
            key="envelope"
            exit={{ scale: 0.9, opacity: 0, y: -20 }}
            transition={{ duration: 0.35 }}
            className="w-full flex justify-center z-10"
          >
            <EnvelopeCard onOpen={handleOpenSequence} />
          </motion.div>
        )}

        {currentState === "transitioning" && (
          <motion.div
            key="transition"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.4 }}
            className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden"
            style={{ background: "radial-gradient(circle at 50% 50%, #fef9c3 0%, #fde68a 50%, #f59e0b 100%)" }}
          >
            {/* Soft warm glow — no white */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.4, 1.8, 2.4], opacity: [0, 0.7, 0.5, 0] }}
              transition={{ duration: 1.8, ease: [0.22, 1, 0.36, 1] }}
              className="absolute w-64 h-64 rounded-full z-0"
              style={{ background: "radial-gradient(circle, rgba(254,249,195,0.85) 0%, rgba(253,230,138,0.4) 55%, transparent 75%)" }}
            />

            {/* Expanding amber ring */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1, 2, 3], opacity: [0, 0.3, 0.15, 0] }}
              transition={{ duration: 2, delay: 0.15, ease: "easeOut" }}
              className="absolute w-48 h-48 rounded-full border border-amber-200/60 z-0"
            />

            {/* Bee artwork + sparkle burst */}
            {PARTICLES.map((p) => (
              <motion.div
                key={p.id}
                initial={{ opacity: 0, x: 0, y: 0, scale: 0 }}
                animate={{ opacity: [0, 1, 1, 0], x: p.x, y: p.y, scale: p.size }}
                transition={{ duration: 1.8, delay: p.delay, ease: [0.22, 1, 0.36, 1] }}
                className="absolute select-none pointer-events-none z-10"
              >
                {p.src
                  ? <Image src={p.src} alt="bee" width={48} height={48} />
                  : <span className="text-3xl">{(p as {emoji:string}).emoji}</span>
                }
              </motion.div>
            ))}

            {/* Central 🍯 */}
            <motion.div
              initial={{ scale: 0, opacity: 0 }}
              animate={{ scale: [0, 1.3, 1], opacity: [0, 1, 1] }}
              transition={{ duration: 0.7, delay: 0.2, ease: [0.34, 1.56, 0.64, 1] }}
              className="text-7xl select-none relative z-10"
            >
              🍯
            </motion.div>

            <motion.p
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.7, duration: 0.6 }}
              className="absolute bottom-24 text-amber-900/60 font-bold tracking-widest text-sm uppercase z-10"
            >
              Happy 30th Birthday 🐝
            </motion.p>
          </motion.div>
        )}

        {currentState === "open" && (
          <motion.div
            key="board"
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6, ease: "easeOut" }}
            className="w-full"
          >
            <MemoryBoard />
          </motion.div>
        )}

      </AnimatePresence>
    </div>
  );
}
