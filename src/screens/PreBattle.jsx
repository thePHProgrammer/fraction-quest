import { useEffect, useMemo, useRef, useState } from "react";
import { Stars } from "../components/Stars";
import MusicBtn from "../components/MusicBtn";
import { Frac } from "../components/Frac";
import { useTypewriter } from "../hooks/useTypewriter";
import { sfx } from "../audio/sfx";
import { playBGM } from "../audio/bgm";

export default function PreBattle({ villain, lesson, isBoss = false, onStartBattle, onBack, lang = "EN" }) {
  const [phase, setPhase] = useState("dialogue");
  const [dIdx, setDIdx] = useState(0);
  const lockRef = useRef(false);
  const lines = villain.taunt;
  const line = lines[Math.min(dIdx, lines.length - 1)];
  const portrait = line.speaker === "eldrin" ? "🧙" : villain.emoji;
  const name = line.speaker === "eldrin" ? (lang === "TL" ? "Archmagus Eldrin" : "Archmagus Eldrin") : villain.name;
  const [text, isDone] = useTypewriter(line.text, 22);

  useEffect(() => { playBGM(isBoss ? "boss" : "battle"); }, [isBoss]);

  const advanceDialogue = () => {
    if (lockRef.current || !isDone) return;
    lockRef.current = true;
    setTimeout(() => { lockRef.current = false; }, 120);
    sfx.click();
    if (dIdx < lines.length - 1) setDIdx((i) => i + 1);
    else if (lesson) setPhase("lesson");
    else { sfx.bossRoar(); onStartBattle(); }
  };

  const runes = useMemo(
    () => ["✦", "⚡", "☆", "◈", "✧", "⊕", "◆"].map((r, i) => ({
      r,
      left: `${10 + i * 12}%`,
      top: `${20 + Math.sin(i) * 30}%`,
      rx: `${(Math.random() - 0.5) * 30}px`,
      ry: `${-15 - Math.random() * 20}px`,
      rr: `${(Math.random() - 0.5) * 25}deg`,
      rf: `${5 + Math.random() * 5}s`,
      rd: `${i * 0.4}s`,
    })),
    []
  );

  if (phase === "lesson" && lesson) {
    return (
      <div
        className="prebattle fade-in"
        style={{ background: villain.bgGradient, justifyContent: "center", gap: "1rem", padding: "1rem", zIndex: 1 }}
      >
        <Stars />
        <MusicBtn />
        {runes.map((rn, i) => (
          <div key={i} className="battle-rune" style={{ left: rn.left, top: rn.top, "--rx": rn.rx, "--ry": rn.ry, "--rr": rn.rr, "--rf": rn.rf, "--rd": rn.rd }}>
            {rn.r}
          </div>
        ))}
        <div className="lesson-card" style={{ zIndex: 1 }}>
          <div className="lesson-title">📖 {lesson.title}</div>
          <div className="divider" />
          {lesson.steps.map((s, i) => (
            <div key={i} className="lesson-step">
              <span className="step-num">{i + 1}</span>
              <span>{s}</span>
            </div>
          ))}
          <div className="lesson-example">
            <div className="lesson-ex-frac">
              {lesson.example.d ? <Frac n={lesson.example.n} d={lesson.example.d} /> : lesson.example.n}
            </div>
            <div className="lesson-ex-label">{lesson.example.label}</div>
          </div>
          <div style={{ display: "flex", justifyContent: "center", marginTop: ".4rem" }}>
            <button
              className="btn btn-red"
              onClick={() => { sfx.bossRoar(); onStartBattle(); }}
              style={{ fontFamily: "Cinzel,serif", fontSize: "1.05rem", fontWeight: 700, padding: ".85rem 2.4rem", borderRadius: 50, letterSpacing: ".08em" }}
            >
              ⚔️ {lang === "TL" ? "LABAN!" : "BATTLE!"}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div
      className="prebattle fade-in"
      onClick={advanceDialogue}
      style={{ cursor: "pointer", background: villain.bgGradient, zIndex: 1 }}
    >
      <Stars />
      <MusicBtn />
      <button
        className="btn btn-ghost"
        onClick={(e) => { e.stopPropagation(); onBack?.(); }}
        style={{ position: "absolute", top: "1rem", left: "1rem", zIndex: 5 }}
      >
        ← {lang === "TL" ? "Mapa" : "Map"}
      </button>
      {runes.map((rn, i) => (
        <div key={i} className="battle-rune" style={{ left: rn.left, top: rn.top, "--rx": rn.rx, "--ry": rn.ry, "--rr": rn.rr, "--rf": rn.rf, "--rd": rn.rd }}>
          {rn.r}
        </div>
      ))}
      <div className="villain-arena" style={{ zIndex: 1 }}>
        <div className="villain-sprite" style={{ "--vcol": villain.color }}>{villain.emoji}</div>
        <div className="villain-name-plate">{villain.name}</div>
        <div className="scenery-strip">{villain.scenery}</div>
      </div>
      <div style={{ zIndex: 1, width: "100%", padding: ".8rem clamp(.8rem,3vw,1.5rem) 1.2rem", flexShrink: 0 }}>
        <div className="progress-dots" style={{ marginBottom: ".6rem" }}>
          {lines.map((_, i) => <span key={i} className={i === dIdx ? "active" : ""} />)}
        </div>
        <div className="dialogue-card">
          <div className="dialogue-name">{name}</div>
          <div className="dialogue-text">
            {line.speaker === "eldrin" && <span style={{ marginRight: ".5rem" }}>🧙</span>}
            {text}
            {!isDone && <span className="dialogue-cursor" />}
          </div>
          <div className="tap-hint">
            {isDone
              ? (dIdx < lines.length - 1
                  ? (lang === "TL" ? "I-tap para magpatuloy →" : "Tap to continue →")
                  : (lesson
                      ? (lang === "TL" ? "I-tap para sa aralin →" : "Tap to see lesson →")
                      : (lang === "TL" ? "I-tap para sa laban →" : "Tap to battle →")))
              : (lang === "TL" ? "I-tap para laktawan..." : "Tap to skip...")}
          </div>
        </div>
      </div>
    </div>
  );
}
