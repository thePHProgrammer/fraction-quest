import { Stars } from "../components/Stars";
import MusicBtn from "../components/MusicBtn";
import { sfx } from "../audio/sfx";
import { initBGM } from "../audio/bgm";

export default function TitleScreen({ onStart, lang = "EN" }) {
  const go = () => {
    initBGM();
    sfx.levelUp();
    onStart();
  };
  const features = lang === "TL"
    ? [
        ["🧌", "Talunin ang 12 Heneral sa kaharian"],
        ["🐉", "Harapin si Fracton ang Void Wyrm"],
        ["📖", "Matuto ng praksiyon sa pamamagitan ng laban"],
        ["🎵", "Epikong synthesized na musika"],
        ["✨", "3D gintong shatter sa bawat tagumpay"],
      ]
    : [
        ["🧌", "Defeat 12 Generals across the realm"],
        ["🐉", "Face Fracton the Void Wyrm"],
        ["📖", "Learn fractions through battle"],
        ["🎵", "Epic synthesized battle music"],
        ["✨", "3D gold shatter on every victory"],
      ];
  return (
    <div className="cs-screen fade-in" style={{ gap: "1.5rem", padding: "2rem", background: "radial-gradient(ellipse at 50% 60%, #1a0535 0%, #06030f 70%)" }}>
      <Stars />
      <MusicBtn />
      <div style={{ textAlign: "center", zIndex: 1 }}>
        <div style={{ fontSize: "clamp(3rem,8vw,5.5rem)", animation: "titleFloat 3s ease-in-out infinite", filter: "drop-shadow(0 0 30px rgba(255,215,0,.5))" }}>⚔️</div>
        <div className="title-hero">FRACTION<br />QUEST</div>
        <div className="cinzel" style={{ fontSize: ".72rem", color: "var(--text)", letterSpacing: ".5em", textTransform: "uppercase", marginTop: ".4rem", opacity: 0.5 }}>
          {lang === "TL" ? "Mga Tala ng Arithmia" : "Chronicles of Arithmia"}
        </div>
      </div>
      <div style={{ zIndex: 1, maxWidth: "360px", width: "100%", display: "flex", flexDirection: "column", gap: ".4rem" }}>
        {features.map(([e, t], i) => (
          <div key={i} style={{ display: "flex", gap: ".6rem", alignItems: "center", color: "var(--text)", fontSize: ".85rem", opacity: 0.75 }}>
            <span>{e}</span>
            <span>{t}</span>
          </div>
        ))}
      </div>
      <button className="btn btn-gold" onClick={go} style={{ zIndex: 1 }}>
        ⚔️ {lang === "TL" ? "Simulan ang Pakikipagsapalaran" : "Begin the Quest"}
      </button>
    </div>
  );
}
