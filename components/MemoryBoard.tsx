"use client";

import { useEffect, useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { supabase } from "../lib/supabase";
import Image from "next/image";

type Memory = {
  id: number;
  sender_name: string;
  relationship: string;
  message_text: string;
  image_url: string | null;
  clip_url: string | null;
  created_at: string;
};


// ── CONFETTI ─────────────────────────────────────────────
const CONFETTI_COLORS = ["#f59e0b","#fbbf24","#fde68a","#fb7185","#a78bfa","#34d399","#60a5fa","#f472b6"];
const CONFETTI_SHAPES = ["circle","square","heart","star"];

function useConfetti(trigger: boolean) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    if (!trigger) return;
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    const pieces = Array.from({ length: 120 }, () => ({
      x: Math.random() * canvas.width,
      y: -20 - Math.random() * 100,
      vx: (Math.random() - 0.5) * 4,
      vy: 2 + Math.random() * 4,
      color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
      shape: CONFETTI_SHAPES[Math.floor(Math.random() * CONFETTI_SHAPES.length)],
      size: 6 + Math.random() * 8,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.15,
      opacity: 1,
    }));
    let frame: number;
    let elapsed = 0;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      elapsed++;
      let alive = false;
      for (const p of pieces) {
        p.x += p.vx; p.y += p.vy; p.vy += 0.08; p.rotation += p.rotSpeed;
        if (elapsed > 60) p.opacity -= 0.012;
        if (p.opacity <= 0 || p.y > canvas.height) continue;
        alive = true;
        ctx.save();
        ctx.globalAlpha = Math.max(0, p.opacity);
        ctx.fillStyle = p.color;
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        if (p.shape === "circle") { ctx.beginPath(); ctx.arc(0,0,p.size/2,0,Math.PI*2); ctx.fill(); }
        else if (p.shape === "square") { ctx.fillRect(-p.size/2,-p.size/2,p.size,p.size); }
        else if (p.shape === "heart") {
          ctx.beginPath();
          ctx.moveTo(0,-p.size*0.3);
          ctx.bezierCurveTo(p.size*0.5,-p.size*0.8,p.size*0.9,p.size*0.1,0,p.size*0.6);
          ctx.bezierCurveTo(-p.size*0.9,p.size*0.1,-p.size*0.5,-p.size*0.8,0,-p.size*0.3);
          ctx.fill();
        } else {
          ctx.beginPath();
          for (let j=0;j<5;j++) {
            const a=(j*Math.PI*2)/5-Math.PI/2; const b=a+Math.PI/5;
            ctx.lineTo(Math.cos(a)*p.size*0.5,Math.sin(a)*p.size*0.5);
            ctx.lineTo(Math.cos(b)*p.size*0.2,Math.sin(b)*p.size*0.2);
          }
          ctx.closePath(); ctx.fill();
        }
        ctx.restore();
      }
      if (alive) { frame = requestAnimationFrame(draw); }
      else { ctx.clearRect(0,0,canvas.width,canvas.height); }
    };
    frame = requestAnimationFrame(draw);
    return () => cancelAnimationFrame(frame);
  }, [trigger]);
  return canvasRef;
}

// ── MUSIC PLAYER ─────────────────────────────────────────
function MusicPlayer() {
  const audioRef = useRef<HTMLAudioElement>(null);
  const [playing, setPlaying] = useState(false);
  useEffect(() => {
    const audio = audioRef.current;
    if (!audio) return;
    audio.volume = 0.35;
    audio.loop = true;
    // Autoplay is allowed here because user already clicked the envelope button
    audio.play().then(() => setPlaying(true)).catch(() => {});
  }, []);
  const toggle = () => {
    const audio = audioRef.current;
    if (!audio) return;
    if (playing) { audio.pause(); setPlaying(false); }
    else { audio.play(); setPlaying(true); }
  };
  return (
    <>
      <audio ref={audioRef} src="/song.mp3" preload="auto" />
      <button onClick={toggle} title={playing ? "Mute music" : "Play music"}
        className={`fixed bottom-6 right-6 z-50 w-12 h-12 rounded-full shadow-lg flex items-center justify-center transition-all duration-200 border-2 ${
          playing ? "bg-amber-400 border-amber-500 hover:bg-amber-500" : "bg-white border-amber-200 hover:border-amber-400"
        }`}>
        {playing ? (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <rect x="5" y="4" width="4" height="16" rx="1" fill="white"/>
            <rect x="15" y="4" width="4" height="16" rx="1" fill="white"/>
          </svg>
        ) : (
          <svg width="20" height="20" viewBox="0 0 24 24" fill="none">
            <path d="M8 5.14v14l11-7-11-7z" fill="#f59e0b"/>
          </svg>
        )}
      </button>
    </>
  );
}

function MediaEmbed({ url }: { url: string }) {
  const twitchClip =
    url.match(/clips\.twitch\.tv\/([A-Za-z0-9_-]+)/) ||
    url.match(/twitch\.tv\/\S+\/clip\/([A-Za-z0-9_-]+)/);
  if (twitchClip) {
    const slug = twitchClip[1];
    return (
      <iframe
        src={`https://clips.twitch.tv/embed?clip=${slug}&parent=${window.location.hostname}&autoplay=false`}
        className="w-full rounded-xl mb-4"
        style={{ aspectRatio: "16/9", border: "none" }}
        allowFullScreen
      />
    );
  }

  const yt = url.match(
    /(?:youtu\.be\/|youtube\.com\/(?:watch\?v=|shorts\/|embed\/))([A-Za-z0-9_-]{11})/
  );
  if (yt) {
    return (
      <iframe
        src={`https://www.youtube.com/embed/${yt[1]}`}
        className="w-full rounded-xl mb-4"
        style={{ aspectRatio: "16/9", border: "none" }}
        allowFullScreen
      />
    );
  }

  return (
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="flex items-center gap-2 mb-4 text-sm text-amber-700 font-medium bg-amber-50 border border-amber-100 rounded-xl px-4 py-3 hover:bg-amber-100 transition-colors"
    >
      <span>🎬</span>
      <span className="truncate">View clip</span>
      <span className="ml-auto opacity-50">↗</span>
    </a>
  );
}

const TILTS = [-1.8, 1.2, -0.7, 2.1, -1.4, 0.9, -2.3, 1.7];

function getImageUrls(value: string | null) {
  if (!value) return [];

  try {
    const parsed = JSON.parse(value);
    return Array.isArray(parsed) ? parsed.filter((item): item is string => typeof item === "string" && item.length > 0) : [value];
  } catch {
    return [value];
  }
}

const TAG_STYLES: Record<string, string> = {
  "Friend":          "bg-rose-50 text-rose-700 border-rose-100",
  "Family":          "bg-violet-50 text-violet-700 border-violet-100",
  "Beehive Discord": "bg-amber-50 text-amber-700 border-amber-100",
  "Work / Other":    "bg-sky-50 text-sky-700 border-sky-100",
};
const DEFAULT_TAG = "bg-amber-50 text-amber-700 border-amber-100";

const HoneycombDeco = () => (
  <svg
    className="absolute inset-0 w-full h-full pointer-events-none select-none"
    style={{ opacity: 0.18 }}
    aria-hidden="true"
    preserveAspectRatio="xMidYMid slice"
  >
    <defs>
      <pattern id="hc" x="0" y="0" width="36" height="62.35" patternUnits="userSpaceOnUse">
        <polygon
          points="18,1 35,10.18 35,28.53 18,37.7 1,28.53 1,10.18"
          fill="none" stroke="#b45309" strokeWidth="1.4"
        />
        <polygon
          points="36,32.18 53,41.35 53,59.7 36,68.88 19,59.7 19,41.35"
          fill="none" stroke="#b45309" strokeWidth="1.4"
        />
      </pattern>
    </defs>
    <rect width="100%" height="100%" fill="url(#hc)" />
  </svg>
);

// ── LIGHTBOX ──────────────────────────────────────────────
function Lightbox({ mem, onClose }: { mem: Memory; onClose: () => void }) {
  const tagStyle = TAG_STYLES[mem.relationship] ?? DEFAULT_TAG;
  const imageUrls = getImageUrls(mem.image_url);

  // Close on Escape key
  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    window.addEventListener("keydown", handler);
    return () => window.removeEventListener("keydown", handler);
  }, [onClose]);

  return (
    <motion.div
      key="backdrop"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.2 }}
      className="fixed inset-0 z-50 flex items-center justify-center p-4 md:p-8"
      style={{ background: "rgba(28,25,23,0.75)", backdropFilter: "blur(6px)" }}
      onClick={onClose}
    >
      <motion.div
        key="card"
        initial={{ scale: 0.75, opacity: 0, rotate: -2 }}
        animate={{ scale: 1, opacity: 1, rotate: 0 }}
        exit={{ scale: 0.75, opacity: 0, rotate: 2 }}
        transition={{ type: "spring", stiffness: 260, damping: 24 }}
        className="relative bg-white rounded-2xl shadow-2xl overflow-hidden w-full max-w-lg max-h-[90vh] overflow-y-auto"
        onClick={e => e.stopPropagation()}
      >
        {/* Close button */}
        <button
          onClick={onClose}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-black/10 hover:bg-black/20 flex items-center justify-center text-slate-700 transition-colors"
          aria-label="Close"
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none">
            <path d="M1 1l12 12M13 1L1 13" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
          </svg>
        </button>

        {/* Photo */}
        {imageUrls.length > 0 && (
          <div className="grid gap-3 p-4 md:p-5 pb-0">
            {imageUrls.map((src, index) => {
              const isVideo = /\.(mp4|mov|webm|ogg)$/i.test(src);
              return isVideo ? (
                <video key={`${src}-${index}`} src={src} controls playsInline
                  className="w-full rounded-2xl" style={{ maxHeight: 320 }} />
              ) : (
                <img key={`${src}-${index}`} src={src}
                  alt={`Memory from ${mem.sender_name} ${index + 1}`}
                  className="w-full rounded-2xl object-cover" style={{ maxHeight: 320 }} />
              );
            })}
          </div>
        )}

        {/* Clip embed */}
        {mem.clip_url && (
          <div className={imageUrls.length > 0 ? "px-5 pt-4" : "px-5 pt-5"}>
            <MediaEmbed url={mem.clip_url} />
          </div>
        )}

        {/* Body */}
        <div className="px-6 py-5">
          <p className="text-slate-700 leading-relaxed italic text-base mb-6">
            &quot;{mem.message_text}&quot;
          </p>
          <div className="flex items-center justify-between border-t border-slate-100 pt-4">
            <div>
              <p className="font-bold text-slate-900">{mem.sender_name}</p>
            </div>
            {mem.relationship && (
              <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${tagStyle}`}>
                {mem.relationship}
              </span>
            )}
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
}

// ── MAIN BOARD ────────────────────────────────────────────
export default function MemoryBoard() {
  const [memories, setMemories] = useState<Memory[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("All");
  const [selected, setSelected] = useState<Memory | null>(null);
  const [showConfetti, setShowConfetti] = useState(false);
  const confettiRef = useConfetti(showConfetti);

  useEffect(() => {
    supabase
      .from("birthday_messages")
      .select("*")
      .order("created_at", { ascending: true })
      .then(({ data, error }) => {
        if (!error && data) setMemories(data as Memory[]);
        setLoading(false);
        setTimeout(() => setShowConfetti(true), 300);
      });
  }, []);

  const tags = ["All", ...Array.from(new Set(memories.map(m => m.relationship).filter(Boolean)))];
  const filtered = filter === "All" ? memories : memories.filter(m => m.relationship === filter);

  const containerVariants = {
    hidden: { opacity: 0 },
    show: { opacity: 1, transition: { staggerChildren: 0.1 } },
  };
  const itemVariants = {
    hidden: { opacity: 0, y: 32, scale: 0.96 },
    show: {
      opacity: 1, y: 0, scale: 1,
      transition: { type: "spring" as const, stiffness: 90, damping: 18 },
    },
  };

  return (
    <div className="w-full relative">
      <canvas ref={confettiRef} className="fixed inset-0 pointer-events-none z-50" />
      <MusicPlayer />

      {/* ── LIGHTBOX (portal-style overlay) ── */}
      <AnimatePresence>
        {selected && (
          <Lightbox mem={selected} onClose={() => setSelected(null)} />
        )}
      </AnimatePresence>

      {/* ── AMBIENT BEES — fixed to viewport so they never get clipped ── */}
      <div className="fixed inset-0 pointer-events-none z-20">
        {([
          { pos: { top: "6%",  left: "5%"  }, src: "/bees/bee_transparent.png",  dur: 3.5 },
          { pos: { top: "4%",  right: "8%" }, src: "/bees/bee4_transparent.png", dur: 4.2 },
          { pos: { top: "10%", left: "18%" }, src: "/bees/bee2_transparent.png", dur: 5.1 },
          { pos: { top: "8%",  right: "20%"}, src: "/bees/bee3_transparent.png", dur: 3.9 },
        ]).map(({ pos, src, dur }, i) => (
          <span
            key={i}
            className="absolute w-10 h-10 opacity-70 select-none"
            style={{ ...pos, animation: `beeFloat ${dur}s ease-in-out infinite`, animationDelay: `${i * 0.4}s` }}
          >
            <Image src={src} alt="bee" width={40} height={40} />
          </span>
        ))}
      </div>

      {/* ── HERO ── */}
      <div className="relative text-center mb-14 overflow-hidden min-h-[320px] rounded-3xl">
        <HoneycombDeco />

        <p className="text-amber-600 text-xs tracking-[0.25em] uppercase font-semibold mb-3">
          Est. 1994 · Chapter Thirty
        </p>
        <h1
          className="font-black text-slate-900 leading-none tracking-tighter"
          style={{
            fontFamily: "'Georgia','Times New Roman',serif",
            fontSize: "clamp(2.8rem,8vw,5rem)",
            textShadow: "2px 4px 0px rgba(251,191,36,0.25)",
          }}
        >
          Thirty Years<br/>
          <span className="text-amber-500">of You</span>
        </h1>
        <p className="mt-5 text-slate-500 text-base max-w-md mx-auto leading-relaxed">
          A collection of memories, love, clips, and inside jokes from your favourite people. 🍯
        </p>

        {tags.length > 1 && (
          <div className="flex flex-wrap justify-center gap-2 mt-8">
            {tags.map(tag => (
              <button
                key={tag}
                onClick={() => setFilter(tag)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all duration-150 ${
                  filter === tag
                    ? "bg-amber-400 border-amber-400 text-white shadow-sm"
                    : "bg-white border-amber-100 text-amber-700 hover:border-amber-300"
                }`}
              >
                {tag}
              </button>
            ))}
          </div>
        )}

        <div className="flex items-center gap-4 mt-10 max-w-xs mx-auto">
          <div className="flex-1 h-px bg-amber-200" />
          <span className="text-amber-300 text-lg">✦</span>
          <div className="flex-1 h-px bg-amber-200" />
        </div>
      </div>

      {/* ── LOADING ── */}
      {loading && (
        <div className="flex items-center justify-center py-24 text-amber-600 text-lg gap-3">
          <span className="animate-spin inline-block w-8 h-8"><Image src="/bees/bee_transparent.png" alt="bee" width={32} height={32} /></span>
          Loading memories...
        </div>
      )}

      {/* ── EMPTY ── */}
      {!loading && filtered.length === 0 && (
        <div className="text-center py-24 text-slate-400">
          <p className="text-5xl mb-4">🍯</p>
          <p className="text-base">No memories here yet.</p>
        </div>
      )}

      {/* ── GRID ── */}
      {!loading && filtered.length > 0 && (
        <motion.div
          variants={containerVariants}
          initial="hidden"
          animate="show"
          className="columns-1 sm:columns-2 lg:columns-3 gap-6"
        >
          {filtered.map((mem, i) => {
            const tilt = TILTS[i % TILTS.length];
            const tagStyle = TAG_STYLES[mem.relationship] ?? DEFAULT_TAG;
            const imageUrls = getImageUrls(mem.image_url);
            const hasMedia = imageUrls.length > 0 || mem.clip_url;

            return (
              <motion.div
                key={mem.id}
                variants={itemVariants}
                initial={{ rotate: tilt }}
                whileHover={{ rotate: 0, scale: 1.03, zIndex: 10 }}
                transition={{ type: "spring", stiffness: 200, damping: 20 }}
                onClick={() => setSelected(mem)}
                className={`break-inside-avoid bg-white rounded-2xl shadow-md border border-amber-50 overflow-hidden 
                  cursor-pointer mb-6 select-none
                  ${hasMedia ? "p-0" : "p-6"}`}
              >
                {imageUrls.length > 0 && (
                  <div className="grid gap-2 p-2">
                    {imageUrls.slice(0, 2).map((src, index) => {
                      const isVideo = /\.(mp4|mov|webm|ogg)$/i.test(src);
                      return isVideo ? (
                        <video key={`${src}-${index}`} src={src} muted playsInline
                          className="w-full rounded-xl object-cover pointer-events-none"
                          style={{ maxHeight: imageUrls.length === 1 ? 220 : 120 }} />
                      ) : (
                        <img key={`${src}-${index}`} src={src}
                          alt={`Memory from ${mem.sender_name} ${index + 1}`}
                          className="w-full rounded-xl object-cover pointer-events-none"
                          style={{ maxHeight: imageUrls.length === 1 ? 220 : 120 }} />
                      );
                    })}
                  </div>
                )}

                {/* Show clip placeholder on card (not full embed — saves loading) */}
                {mem.clip_url && imageUrls.length === 0 && (
                  <div className="w-full bg-slate-50 flex items-center justify-center gap-2 text-slate-400 text-sm"
                    style={{ aspectRatio: "16/9" }}>
                    <span className="text-2xl">🎬</span>
                    <span>Click to play clip</span>
                  </div>
                )}

                <div className={hasMedia ? "p-5" : ""}>
                  <p className="text-slate-700 leading-relaxed text-sm italic mb-5 line-clamp-4">
                    &quot;{mem.message_text}&quot;
                  </p>
                  <div className="flex items-center justify-between">
                    <p className="font-bold text-slate-900 text-sm">{mem.sender_name}</p>
                    {mem.relationship && (
                      <span className={`rounded-full px-3 py-1 text-xs font-semibold border ${tagStyle}`}>
                        {mem.relationship}
                      </span>
                    )}
                  </div>
                </div>
              </motion.div>
            );
          })}
        </motion.div>
      )}

      {!loading && memories.length > 0 && (
        <div className="flex justify-center items-center gap-3 mt-16 select-none" style={{opacity: 0.65}}>
          {["/bees/bee_transparent.png","/bees/bee1_transparent.png","/bees/bee9_transparent.png","/bees/bee2_transparent.png","/bees/bee4_transparent.png"].map((src, i) => (
            <span key={i} className="w-8 h-8 inline-block"
              style={{ animation: `beeFloat ${3+i*0.5}s ease-in-out infinite`, animationDelay: `${i*0.3}s` }}>
              <Image src={src} alt="bee" width={32} height={32} />
            </span>
          ))}
        </div>
      )}

      <style>{`
        @keyframes beeFloat {
          0%, 100% { transform: translateY(0px) rotate(-3deg); }
          50% { transform: translateY(-10px) rotate(3deg); }
        }
      `}</style>
    </div>
  );
}