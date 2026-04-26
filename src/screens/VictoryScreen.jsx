import { useEffect } from "react";
import { Stars } from "../components/Stars";
import { sfx } from "../audio/sfx";
import { stopBGM } from "../audio/bgm";

export default function VictoryScreen({ onRestart, lang = "EN" }) {
  useEffect(() => {
    stopBGM();
    sfx.levelUp();
  }, []);
  return (
    <div className="cs-screen fade-in" style={{ padding: "2rem", background: "radial-gradient(ellipse at 50% 50%, #1a1005 0%, #06030f 70%)" }}>
      <Stars />
      <div className="end-card" style={{ borderColor: "var(--gold)", zIndex: 1 }}>
        <div style={{ fontSize: "3.5rem", animation: "titleFloat 2s ease-in-out infinite", marginBottom: ".8rem" }}>🏆</div>
        <div className="gold-text">{lang === "TL" ? "TAPOS NA ANG MISYON!" : "QUEST COMPLETE!"}</div>
        <div className="divider" style={{ margin: "1rem 0" }} />
        <div style={{ color: "var(--text)", fontSize: ".92rem", lineHeight: 1.7, marginBottom: "1.4rem" }}>
          {lang === "TL" ? (
            <>
              <strong style={{ color: "var(--red)" }}>Si Fracton ang Void Wyrm</strong> ay natalo na.
              <br />Ang Fraction Crystal ay buo na ulit. Ikaw ay isang tunay na <strong style={{ color: "var(--gold)" }}>Kampeon ng Praksiyon</strong>! ⚔️
            </>
          ) : (
            <>
              <strong style={{ color: "var(--red)" }}>Fracton the Void Wyrm</strong> has been slain.
              <br />The Fraction Crystal is whole again. You are a true <strong style={{ color: "var(--gold)" }}>Fraction Champion</strong>! ⚔️
            </>
          )}
        </div>
        <button className="btn btn-gold" onClick={onRestart}>
          🔄 {lang === "TL" ? "Maglaro Muli" : "Play Again"}
        </button>
      </div>
    </div>
  );
}
