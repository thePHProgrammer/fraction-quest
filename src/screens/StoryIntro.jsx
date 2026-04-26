import { useEffect, useRef, useState } from "react";
import { Stars } from "../components/Stars";
import MusicBtn from "../components/MusicBtn";
import { useTypewriter } from "../hooks/useTypewriter";
import { sfx } from "../audio/sfx";
import { playBGM } from "../audio/bgm";

const STORY = {
  EN: [
    { speaker: "narrator", bg: "night", text: "Long ago, the Kingdom of Arithmia was held together by the legendary Fraction Crystal — a jewel that kept all numbers in perfect balance." },
    { speaker: "narrator", bg: "dark",  text: "But Fracton the Void Wyrm descended from the sky and shattered the Crystal into shards, scattering them across the realm — and plunging the kingdom into chaos." },
    { speaker: "narrator", bg: "dark",  text: "Twelve of Fracton's generals seized each shard, using its power to corrupt the land and imprison the kingdom's people in their own fractured numbers." },
    { speaker: "eldrin",   bg: "library", portrait: "🧙", name: "Archmagus Eldrin", text: "Ah... at last you have come. I am Archmagus Eldrin, keeper of the Ancient Number Arts. You, young champion, are the one prophecy spoke of." },
    { speaker: "eldrin",   bg: "library", portrait: "🧙", name: "Archmagus Eldrin", text: "Master the art of fractions. Defeat each general. Reclaim the shards. And face Fracton himself in the Void Citadel. The Kingdom of Arithmia is counting on you!" },
  ],
  TL: [
    { speaker: "narrator", bg: "night", text: "Noong unang panahon, ang Kaharian ng Arithmia ay pinanatili ng maalamat na Fraction Crystal — isang hiyas na nag-uugnay sa lahat ng numero sa ganap na balanse." },
    { speaker: "narrator", bg: "dark",  text: "Ngunit si Fracton ang Void Wyrm ay bumaba mula sa langit at binasag ang Crystal sa mga piraso, ikinalat ang mga ito sa kaharian — at nagdulot ng kaguluhan." },
    { speaker: "narrator", bg: "dark",  text: "Labindalawang heneral ni Fracton ang kumuha ng bawat piraso, gamit ang kapangyarihan nito upang sirain ang lupain at ikulong ang mga tao sa sariling fractured na mga numero." },
    { speaker: "eldrin",   bg: "library", portrait: "🧙", name: "Archmagus Eldrin", text: "Ah... narito ka na rin sa wakas. Ako si Archmagus Eldrin, tagapag-ingat ng Sinaunang Sining ng Numero. Ikaw, batang kampeon, ang sinasabi ng propesiya." },
    { speaker: "eldrin",   bg: "library", portrait: "🧙", name: "Archmagus Eldrin", text: "Pag-aralan ang sining ng praksiyon. Talunin ang bawat heneral. Bawiin ang mga piraso. At harapin si Fracton mismo sa Void Citadel. Umaasa sa iyo ang Kaharian ng Arithmia!" },
  ],
};

const BG_MAP = { night: "story-bg-night", dark: "story-bg-dark", library: "story-bg-library" };

export default function StoryIntro({ lang = "EN", save, persistSave, onDone }) {
  const slides = STORY[lang] || STORY.EN;
  const [idx, setIdx] = useState(0);
  const lockRef = useRef(false);
  const safeIdx = Math.min(idx, slides.length - 1);
  const slide = slides[safeIdx];
  const [text, isDone] = useTypewriter(slide.text, 22);

  // Set the missionSeen flag *on mount* so a refresh mid-story still counts as seen.
  useEffect(() => {
    if (save && !save.missionSeen) {
      save.missionSeen = true;
      persistSave?.(save);
    }
    playBGM("overworld");
  }, []);

  const advance = () => {
    if (lockRef.current) return;
    sfx.click();
    if (!isDone) return;
    lockRef.current = true;
    setTimeout(() => { lockRef.current = false; }, 120);
    if (safeIdx < slides.length - 1) setIdx((i) => Math.min(i + 1, slides.length - 1));
    else onDone();
  };

  return (
    <div
      className={`story-screen ${BG_MAP[slide.bg] || "story-bg-dark"} fade-in`}
      onClick={advance}
      style={{ cursor: "pointer" }}
    >
      <Stars />
      <MusicBtn />
      <div style={{ zIndex: 1, display: "flex", flexDirection: "column", alignItems: "center", gap: "1.2rem", width: "100%", padding: "0 1rem" }}>
        {slide.speaker === "eldrin"
          ? <div className="story-portrait">{slide.portrait}</div>
          : <div className="narrator-icon">📜</div>}
        <div className="progress-dots">
          {slides.map((_, i) => <span key={i} className={i === safeIdx ? "active" : ""} />)}
        </div>
        <div className="dialogue-card">
          <div className="dialogue-name" style={!slide.name ? { color: "rgba(255,255,255,.3)" } : undefined}>
            {slide.name || (lang === "TL" ? "Tagapagsalaysay" : "Narrator")}
          </div>
          <div className="dialogue-text">
            {text}
            {!isDone && <span className="dialogue-cursor" />}
          </div>
          <div className="tap-hint">
            {isDone
              ? (safeIdx < slides.length - 1
                  ? (lang === "TL" ? "I-tap para magpatuloy →" : "Tap to continue →")
                  : (lang === "TL" ? "I-tap para magsimula →" : "Tap to begin →"))
              : (lang === "TL" ? "I-tap para laktawan..." : "Tap to skip...")}
          </div>
        </div>
      </div>
    </div>
  );
}
