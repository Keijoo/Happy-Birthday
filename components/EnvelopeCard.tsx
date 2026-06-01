"use client";

import { useMemo, useState } from "react";
import { motion } from "framer-motion";
import Image from "next/image";


// Plays a soft sparkle chime using Web Audio API — no files needed
function playOpenChime() {
  try {
    const ctx = new (window.AudioContext || (window as unknown as { webkitAudioContext: typeof AudioContext }).webkitAudioContext)();
    const notes = [523, 659, 784, 1047]; // C5 E5 G5 C6
    notes.forEach((freq, i) => {
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.value = freq;
      const t = ctx.currentTime + i * 0.12;
      gain.gain.setValueAtTime(0, t);
      gain.gain.linearRampToValueAtTime(0.18, t + 0.04);
      gain.gain.exponentialRampToValueAtTime(0.001, t + 0.5);
      osc.start(t);
      osc.stop(t + 0.5);
    });
  } catch {}
}

interface EnvelopeCardProps {
  onOpen: () => void;
}

// Bees that escape when envelope opens
const EscapingBees = () => {
  const bees = useMemo(() => [
    { id: 0, src: "/bees/bee_transparent.png",  delay: 0,    x: -30, y: -120 },
    { id: 1, src: "/bees/bee4_transparent.png", delay: 0.08, x:  20, y: -140 },
    { id: 2, src: "/bees/bee2_transparent.png", delay: 0.14, x: -50, y: -100 },
    { id: 3, src: "/bees/bee3_transparent.png", delay: 0.06, x:  45, y: -110 },
    { id: 4, src: "/bees/bee1_transparent.png", delay: 0.18, x: -15, y: -155 },
    { id: 5, src: "/bees/bee5_transparent.png", delay: 0.1,  x:  60, y: -90  },
  ], []);

  return (
    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
      {bees.map((bee) => (
        <motion.div
          key={bee.id}
          initial={{ opacity: 0, scale: 0, x: 0, y: 0 }}
          animate={{ opacity: [0, 1, 0], scale: [0.4, 1, 0.6], x: bee.x, y: bee.y }}
          transition={{ duration: 0.9, delay: bee.delay, ease: [0.4, 0, 0.2, 1] }}
          className="absolute w-10 h-10"
        >
          <Image src={bee.src} alt="bee" width={40} height={40} />
        </motion.div>
      ))}
    </div>
  );
};

export default function EnvelopeCard({ onOpen }: EnvelopeCardProps) {
  const [isBtnClicked, setIsBtnClicked] = useState(false);
  const [showBees, setShowBees] = useState(false);

  const handleOpenClick = () => {
    if (isBtnClicked) return;
    setIsBtnClicked(true);
    playOpenChime();
    setTimeout(() => setShowBees(true), 220);
    setTimeout(() => onOpen(), 900);
  };

  return (
    <motion.div
      animate={{ y: isBtnClicked ? -6 : 0, scale: isBtnClicked ? 1.02 : 1 }}
      transition={{ type: "spring", stiffness: 160, damping: 18 }}
      className="w-full max-w-md relative"
    >
      {showBees && <EscapingBees />}

      <div className="relative overflow-hidden rounded-2xl bg-white p-8 text-center shadow-xl ring-1 ring-amber-100 border border-amber-50">
        
        <div className="relative mx-auto mb-10 h-32 w-32 flex items-center justify-center overflow-visible">
          <div className="absolute bottom-0 h-24 w-full rounded-t-sm border-2 border-amber-200 bg-amber-50 shadow-inner" />

          <motion.div
            animate={{
              rotateX: isBtnClicked ? 175 : 0,
              rotateZ: isBtnClicked ? -2 : 0,
              y: isBtnClicked ? 4 : 0,
              backgroundColor: isBtnClicked ? "#fff7d6" : "#fffbeb",
              borderColor: isBtnClicked ? "#fbbf24" : "#fde68a",
            }}
            transition={{ duration: 0.65, ease: [0.22, 1, 0.36, 1] }}
            style={{ originY: "top", transformPerspective: 900 }}
            className="absolute top-8 h-20 w-full rounded-b-xl border-2 border-amber-300 bg-amber-100/50 shadow z-20"
          >
            <div style={{ clipPath: "polygon(0 0, 100% 0, 50% 100%)" }} className="absolute inset-0 bg-current opacity-10" />
          </motion.div>

          <motion.div
            animate={{ opacity: isBtnClicked ? [0, 0.45, 0] : 0, scale: isBtnClicked ? [0.85, 1.15, 1] : 0.85 }}
            transition={{ delay: 0.15, duration: 0.8, ease: "easeOut" }}
            className="absolute -top-10 h-32 w-32 rounded-full bg-yellow-300/70 blur-3xl z-10"
          />

          {/* Her bee artwork instead of emoji */}
          <motion.div
            animate={{ y: isBtnClicked ? -8 : 0 }}
            transition={{ type: "spring", stiffness: 200 }}
            className="absolute bottom-6 z-20"
          >
            <Image src="/bees/bee_transparent.png" alt="bee" width={52} height={52} />
          </motion.div>
        </div>

        <h1 className="mb-2 text-3xl font-extrabold tracking-tight text-slate-900">
          To the Queen of the Beehive
        </h1>
        <p className="mb-8 text-sm font-medium text-amber-600 tracking-wide uppercase">
          Chapter 30 • Est. 1996
        </p>
        <p className="mb-8 text-slate-600 leading-relaxed text-sm">
          Your friends and community gathered some of their absolute favorite moments just for you.
        </p>

        <button
          onClick={handleOpenClick}
          disabled={isBtnClicked}
          className={`group relative inline-flex w-full items-center justify-center overflow-hidden rounded-full bg-gradient-to-r from-amber-500 to-yellow-500 px-8 py-4 font-bold text-white shadow-lg transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-amber-400 focus:ring-offset-2 ${
            isBtnClicked ? "opacity-50 scale-95 cursor-not-allowed" : "hover:from-amber-600 hover:to-yellow-600 hover:shadow-xl active:scale-95 cursor-pointer"
          }`}
        >
          <span className="relative flex items-center gap-2">
            {isBtnClicked ? "Unsealing..." : "Open Your Birthday Gift"}
            <span className="transition-transform duration-200 group-hover:translate-x-1">✨</span>
          </span>
        </button>
      </div>
    </motion.div>
  );
}
