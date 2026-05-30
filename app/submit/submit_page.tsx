"use client";

import { useState, useRef } from "react";
import { supabase } from "../../lib/supabase";

const TAGS = ["Friend", "Family", "Beehive Discord", "Work / Other"];
const MAX_MB = 50;
const MAX_PHOTOS = 6;

export default function SubmitMemory() {
  const [name, setName] = useState("");
  const [relationship, setRelationship] = useState("");
  const [message, setMessage] = useState("");
  const [clipUrl, setClipUrl] = useState("");
  const [selectedFiles, setSelectedFiles] = useState<File[]>([]);
  const [previews, setPreviews] = useState<{ url: string; type: "image" | "video" }[]>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [uploadProgress, setUploadProgress] = useState(0);
  const fileRef = useRef<HTMLInputElement>(null);

  const handleFiles = (fileList: FileList | File[]) => {
    const incoming = Array.from(fileList).filter(
      f => f.type.startsWith("image/") || f.type.startsWith("video/")
    );
    if (!incoming.length) { setError("Please choose image or video files."); return; }

    const oversized = incoming.find(f => f.size > MAX_MB * 1024 * 1024);
    if (oversized) { setError(`"${oversized.name}" is over ${MAX_MB}MB.`); return; }

    const next = [...selectedFiles, ...incoming].slice(0, MAX_PHOTOS);
    setSelectedFiles(next);
    setPreviews(prev => [
      ...prev,
      ...incoming.slice(0, MAX_PHOTOS - prev.length).map(f => ({
        url: URL.createObjectURL(f),
        type: f.type.startsWith("video/") ? "video" as const : "image" as const,
      }))
    ]);
    setError(null);
  };

  const handleSubmit = async () => {
    setError(null);
    if (!name.trim()) { setError("Please enter your name."); return; }
    if (!message.trim()) { setError("Please write a message."); return; }

    setIsSubmitting(true);
    setUploadProgress(10);

    try {
      let image_url: string | null = null;

      if (selectedFiles.length > 0) {
        const uploadedUrls: string[] = [];

        for (let i = 0; i < selectedFiles.length; i++) {
          const file = selectedFiles[i];
          const ext = file.name.split(".").pop();
          const path = `${Date.now()}-${Math.random().toString(36).slice(2)}.${ext}`;

          // Upload directly to Supabase from browser — bypasses Vercel's 4.5MB limit
          const { error: upErr } = await supabase.storage
            .from("birthday-photos")
            .upload(path, file, { contentType: file.type });

          if (upErr) throw upErr;

          const { data: urlData } = supabase.storage
            .from("birthday-photos")
            .getPublicUrl(path);

          uploadedUrls.push(urlData.publicUrl);
          setUploadProgress(10 + Math.round(((i + 1) / selectedFiles.length) * 70));
        }

        image_url = JSON.stringify(uploadedUrls);
      }

      setUploadProgress(85);

      const { error: dbErr } = await supabase
        .from("birthday_messages")
        .insert([{
          sender_name: name.trim(),
          relationship: relationship || "Friend",
          message_text: message.trim(),
          image_url,
          clip_url: clipUrl.trim() || null,
        }]);

      if (dbErr) throw dbErr;

      setUploadProgress(100);
      setTimeout(() => setSubmitted(true), 300);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
      setIsSubmitting(false);
      setUploadProgress(0);
    }
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex items-center justify-center p-6">
        <div className="text-center max-w-sm">
          <div className="text-7xl mb-6 animate-bounce">🍯</div>
          <h1 className="text-3xl font-black text-slate-900 mb-3" style={{ fontFamily: "Georgia, serif" }}>
            Memory sealed!
          </h1>
          <p className="text-slate-500 leading-relaxed mb-8">
            Your message has been added to her birthday board. She&apos;s going to love it. 🐝
          </p>
          <button
            onClick={() => { setSubmitted(false); setName(""); setMessage(""); setClipUrl(""); setSelectedFiles([]); setPreviews([]); setRelationship(""); }}
            className="text-amber-600 font-semibold text-sm hover:underline"
          >
            Add another memory →
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center p-4 py-12">
      <div className="text-center mb-8">
        <p className="text-amber-600 text-xs tracking-[0.2em] uppercase font-semibold mb-2">The Beehive · Birthday Edition</p>
        <h1 className="text-3xl font-black text-slate-900 tracking-tight" style={{ fontFamily: "Georgia, serif" }}>
          Add to the Memory Board
        </h1>
        <p className="text-slate-500 text-sm mt-2 max-w-xs mx-auto">
          Leave a message, share a clip, or attach a photo or video. She&apos;ll see it on her birthday! 🐝
        </p>
      </div>

      <div className="w-full max-w-md bg-white rounded-2xl shadow-xl border border-amber-50 p-6 md:p-8 space-y-5">

        {error && (
          <div className="bg-red-50 text-red-600 text-sm px-4 py-3 rounded-xl border border-red-100">⚠️ {error}</div>
        )}

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Your name</label>
          <input type="text" value={name} onChange={e => setName(e.target.value)}
            placeholder="e.g. Sarah, ModTeam_Alex..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300 transition" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Who are you to her?</label>
          <div className="flex flex-wrap gap-2">
            {TAGS.map(t => (
              <button key={t} onClick={() => setRelationship(t === relationship ? "" : t)}
                className={`px-4 py-1.5 rounded-full text-sm font-medium border transition-all ${
                  relationship === t ? "bg-amber-400 border-amber-400 text-white" : "bg-amber-50 border-amber-100 text-amber-700 hover:border-amber-300"
                }`}>
                {t}
              </button>
            ))}
          </div>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">Your message or memory</label>
          <textarea value={message} onChange={e => setMessage(e.target.value)} rows={4}
            placeholder="Write a favourite moment, inside joke, or birthday wish..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300 transition resize-none" />
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Clip / Video link <span className="font-normal text-slate-400 normal-case">(optional)</span>
          </label>
          <input type="url" value={clipUrl} onChange={e => setClipUrl(e.target.value)}
            placeholder="Twitch, YouTube, TikTok link..."
            className="w-full rounded-xl border border-slate-200 px-4 py-3 text-sm text-slate-800 focus:outline-none focus:ring-2 focus:ring-amber-300 transition" />
          <p className="text-xs text-slate-400 mt-1.5">Paste a Twitch clip, YouTube, or TikTok — it&apos;ll embed on her board.</p>
        </div>

        <div>
          <label className="block text-xs font-bold text-slate-600 uppercase tracking-wider mb-1.5">
            Photos or videos <span className="font-normal text-slate-400 normal-case">(optional, up to 6, max 50MB each)</span>
          </label>
          <div
            onClick={() => fileRef.current?.click()}
            onDrop={e => { e.preventDefault(); if (e.dataTransfer.files.length) handleFiles(e.dataTransfer.files); }}
            onDragOver={e => e.preventDefault()}
            className="border-2 border-dashed border-amber-200 rounded-xl p-5 text-center cursor-pointer hover:border-amber-400 hover:bg-amber-50/50 transition-all"
          >
            <input ref={fileRef} type="file" accept="image/*,video/*" multiple className="hidden"
              onChange={e => { if (e.target.files?.length) handleFiles(e.target.files); }} />
            {previews.length > 0 ? (
              <div className="grid grid-cols-2 gap-3">
                {previews.map(({ url, type }, index) => (
                  type === "video"
                    ? <video key={url} src={url} className="h-24 w-full rounded-xl object-cover" muted />
                    : <img key={url} src={url} alt={`Preview ${index + 1}`} className="h-24 w-full rounded-xl object-cover" />
                ))}
              </div>
            ) : (
              <>
                <div className="text-3xl mb-1">📷</div>
                <p className="text-sm text-slate-400">Click or drag photos / videos here</p>
                <p className="text-xs text-slate-300 mt-1">Supports MP4, MOV, JPG, PNG and more</p>
              </>
            )}
          </div>
          {previews.length > 0 && (
            <button onClick={() => { setSelectedFiles([]); setPreviews([]); }}
              className="mt-1.5 text-xs text-slate-400 hover:text-red-400 transition">
              Remove all files
            </button>
          )}
        </div>

        {isSubmitting && (
          <div className="w-full h-1.5 bg-amber-100 rounded-full overflow-hidden">
            <div className="h-full bg-amber-400 rounded-full transition-all duration-500"
              style={{ width: `${uploadProgress}%` }} />
          </div>
        )}

        <button onClick={handleSubmit} disabled={isSubmitting}
          className={`w-full rounded-full py-4 font-bold text-white text-sm tracking-wide transition-all ${
            isSubmitting ? "bg-amber-300 cursor-not-allowed" : "bg-gradient-to-r from-amber-500 to-yellow-500 hover:from-amber-600 hover:to-yellow-600 hover:shadow-lg active:scale-95 cursor-pointer"
          }`}>
          {isSubmitting ? `Uploading... ${uploadProgress}% 🐝` : "Send my memory 🍯"}
        </button>
      </div>
    </div>
  );
}
