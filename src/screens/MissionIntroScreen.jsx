import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useReducedMotion } from "../hooks/useReducedMotion";
import { sfx } from "../audio/sfx";

const PANELS = {
  EN: [
    { bg: "linear-gradient(180deg,#022c22 0%,#020617 100%)", emoji: "🏰🌳📐", title: "Long ago, in the Fraction Kingdom…", body: "Numbers lived in harmony — halves played with thirds, and quarters danced with sixths." },
    { bg: "linear-gradient(180deg,#1c0a00 0%,#000 100%)", emoji: "💀⚡", title: "Then HE came.", body: "The Fraction King shattered every fraction in two. Halves became chaos. Wholes became broken." },
    { bg: "linear-gradient(180deg,#082f49 0%,#020617 100%)", emoji: "🐹✨", title: "But one hero remained…", body: "A small hamster named Hammy — the last who remembers how the pieces fit together." },
    { bg: "linear-gradient(180deg,#451a03 0%,#000 100%)", emoji: "👑⚔️", title: "FRACTION QUEST", body: "Tap to begin." },
  ],
  TL: [
    { bg: "linear-gradient(180deg,#022c22 0%,#020617 100%)", emoji: "🏰🌳📐", title: "Noong unang panahon, sa Kaharian ng Praksiyon…", body: "Magkakasundo ang mga numero — naglalaro ang kalahati sa katlo, sumasayaw ang ikaapat sa ikaanim." },
    { bg: "linear-gradient(180deg,#1c0a00 0%,#000 100%)", emoji: "💀⚡", title: "Tapos siya dumating.", body: "Binasag ng Hari ng Praksiyon ang lahat. Naging gulo ang kalahati. Nawasak ang buo." },
    { bg: "linear-gradient(180deg,#082f49 0%,#020617 100%)", emoji: "🐹✨", title: "Pero may isang bayani…", body: "Isang munting hamster na si Hammy — ang nag-iisang nakakaalala kung paano nababagay ang mga piraso." },
    { bg: "linear-gradient(180deg,#451a03 0%,#000 100%)", emoji: "👑⚔️", title: "FRACTION QUEST", body: "I-tap para magsimula." },
  ],
};

export default function MissionIntroScreen({ lang = "EN", save, persistSave, onDone }) {
  const reduce = useReducedMotion();
  const [step, setStep] = useState(0);
  const panels = PANELS[lang] || PANELS.EN;

  useEffect(() => {
    if (save && !save.missionSeen) {
      save.missionSeen = true;
      persistSave?.(save);
    }
  }, []);

  useEffect(() => {
    if (step === 1) sfx.thunder();
    if (step === 3) sfx.levelUp();
  }, [step]);

  const advance = () => {
    sfx.click();
    if (step >= panels.length - 1) onDone?.();
    else setStep((s) => s + 1);
  };

  const skip = () => { sfx.click(); onDone?.(); };

  const p = panels[step];

  return (
    <div
      className="min-h-screen flex flex-col items-center justify-center px-5 py-10 relative cursor-pointer select-none"
      style={{ background: p.bg, transition: "background 700ms ease" }}
      onClick={advance}
    >
      <button
        onClick={(e) => { e.stopPropagation(); skip(); }}
        className="absolute top-4 right-4 text-xs font-black px-3 py-1.5 rounded-full text-white/80 hover:text-white"
        style={{ background: "rgba(255,255,255,0.08)", border: "1px solid rgba(255,255,255,0.15)" }}
      >
        {lang === "TL" ? "Laktawan ›" : "Skip ›"}
      </button>

      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={reduce ? { opacity: 0 } : { opacity: 0, y: 24 }}
          animate={reduce ? { opacity: 1 } : { opacity: 1, y: 0 }}
          exit={reduce ? { opacity: 0 } : { opacity: 0, y: -24 }}
          transition={{ duration: reduce ? 0.15 : 0.55, ease: "easeOut" }}
          className="flex flex-col items-center text-center max-w-md"
        >
          <motion.div
            className="text-7xl sm:text-8xl mb-6 select-none"
            animate={reduce ? {} : (step === 1 ? { x: [-3, 3, -2, 2, 0], scale: [1, 1.06, 1] } : { y: [0, -6, 0] })}
            transition={reduce ? {} : (step === 1 ? { duration: 0.5 } : { duration: 2.4, repeat: Infinity, ease: "easeInOut" })}
            style={{ filter: "drop-shadow(0 6px 18px rgba(0,0,0,.5))" }}
          >
            {p.emoji}
          </motion.div>

          <h1
            className={step === 3 ? "text-4xl sm:text-5xl text-yellow-300" : "text-2xl sm:text-3xl text-white"}
            style={{ fontFamily: "Fredoka One,cursive", fontWeight: 900, lineHeight: 1.15 }}
          >
            {p.title}
          </h1>

          <p className="mt-4 text-base sm:text-lg text-white/80 font-bold leading-relaxed">{p.body}</p>

          <div className="mt-8 flex gap-2">
            {panels.map((_, i) => (
              <div
                key={i}
                className="h-1.5 rounded-full transition-all"
                style={{ width: i === step ? 28 : 12, background: i <= step ? "rgba(255,255,255,.85)" : "rgba(255,255,255,.2)" }}
              />
            ))}
          </div>

          <div className="mt-3 text-xs font-bold text-white/50">
            {step < panels.length - 1
              ? (lang === "TL" ? "I-tap para magpatuloy ›" : "Tap to continue ›")
              : (lang === "TL" ? "I-tap para magsimula ›" : "Tap to begin ›")}
          </div>
        </motion.div>
      </AnimatePresence>
    </div>
  );
}
