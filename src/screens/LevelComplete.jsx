import { useEffect, useState } from "react";
import { sfx } from "../audio/sfx";

export default function LevelComplete({ pHP, isBoss = false, onContinue, lang = "EN" }) {
  const stars = pHP >= 3 ? 3 : pHP >= 2 ? 2 : 1;
  const [shown, setShown] = useState([false, false, false]);

  useEffect(() => {
    sfx.levelUp();
    [0, 1, 2].forEach((i) =>
      setTimeout(() => setShown((s) => s.map((v, j) => (j === i ? true : v))), 400 + i * 280)
    );
  }, []);

  return (
    <div className="lc-overlay">
      <div className="lc-card">
        <div className="gold-text" style={{ fontSize: "clamp(1.4rem,4vw,2.2rem)" }}>
          {isBoss
            ? (lang === "TL" ? "🐉 NATALO ANG WYRM!" : "🐉 WYRM SLAIN!")
            : (lang === "TL" ? "✦ TAGUMPAY! ✦" : "✦ VICTORY! ✦")}
        </div>
        <div className="star-row">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={`s-star ${shown[i] && i < stars ? "pop" : ""}`}
              style={{
                animationDelay: `${i * 280}ms`,
                filter: i < stars ? "drop-shadow(0 0 10px #ffd700)" : "grayscale(1) opacity(.2)",
              }}
            >
              ⭐
            </span>
          ))}
        </div>
        {isBoss && (
          <div className="cinzel" style={{ color: "var(--gold)", fontSize: ".8rem", marginBottom: ".8rem", opacity: 0.85 }}>
            {lang === "TL" ? "Si Fracton ang Void Wyrm ay wala na!" : "Fracton the Void Wyrm is no more!"}
          </div>
        )}
        <button className="btn btn-gold" onClick={onContinue}>
          {isBoss
            ? (lang === "TL" ? "🏆 Angkinin ang Tagumpay" : "🏆 Claim Victory")
            : (lang === "TL" ? "⚔️ Magpatuloy" : "⚔️ Continue")}
        </button>
      </div>
    </div>
  );
}
