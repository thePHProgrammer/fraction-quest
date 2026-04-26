import { useEffect, useMemo } from "react";
import { Stars } from "../components/Stars";
import MusicBtn from "../components/MusicBtn";
import { sfx } from "../audio/sfx";
import { playBGM } from "../audio/bgm";
import { buildMapNodes } from "../game/villains";

export default function LevelMap({ worlds, gs, onSelect, onBoss, onChangeLang, onReset, lang = "EN" }) {
  useEffect(() => { playBGM("overworld"); }, []);

  // Build node list: 1 per world + 1 boss node at the top.
  const totalCount = worlds.length + 1;
  const nodes = useMemo(() => buildMapNodes(totalCount), [totalCount]);

  // Determine availability for each world.
  const worldStatus = useMemo(() => {
    const out = {};
    let prevDone = true;
    let prevHasAcc = false;

    worlds.forEach((w, i) => {
      const allLevelsBeaten = w.levels.every((_, li) => gs.stars?.[`${w.id}-${li}`]);
      const lastLevelKey = `${w.id}__${w.levels.length - 1}`;
      const arr = gs.performance?.[lastLevelKey] || [];
      const acc = arr.length >= 5 ? arr.reduce((a, b) => a + b, 0) / arr.length : 0;
      const hasGoodAcc = arr.length >= 5 && acc >= 0.7;

      let unlocked;
      if (i === 0) unlocked = true;
      else if (prevDone) unlocked = true;
      else if (prevHasAcc) unlocked = true;
      else unlocked = false;

      out[w.id] = {
        unlocked,
        done: allLevelsBeaten,
        stars: w.levels.reduce((acc, _, li) => acc + (gs.stars?.[`${w.id}-${li}`] || 0), 0),
        maxStars: w.levels.length * 3,
      };
      prevDone = allLevelsBeaten;
      prevHasAcc = hasGoodAcc;
    });
    return out;
  }, [worlds, gs]);

  const allWorldsDone = worlds.every((w) => worldStatus[w.id]?.done);

  const lockedClick = () => sfx.wrong();

  return (
    <div className="cs-screen" style={{ padding: "1rem", justifyContent: "flex-start", background: "radial-gradient(ellipse at 50% 100%, #0d1a35 0%, #06030f 70%)" }}>
      <Stars />
      <MusicBtn />
      <button
        className="btn btn-ghost lang-btn"
        onClick={() => onChangeLang?.(lang === "TL" ? "EN" : "TL")}
      >
        {lang === "TL" ? "EN" : "TL"}
      </button>

      <div style={{ zIndex: 1, textAlign: "center", paddingTop: "1rem" }}>
        <div className="cinzel" style={{ fontSize: "clamp(.6rem,1.8vw,.85rem)", color: "var(--text)", letterSpacing: ".4em", opacity: 0.5, marginBottom: ".3rem" }}>
          {lang === "TL" ? "Kaharian ng Arithmia" : "Kingdom of Arithmia"}
        </div>
        <div className="cinzel gold-text" style={{ fontSize: "clamp(1.2rem,3.5vw,1.8rem)" }}>
          ⚔️ {lang === "TL" ? "Piliin ang Iyong Laban" : "Choose Your Battle"}
        </div>
      </div>

      <div className="map-wrap" style={{ zIndex: 1 }}>
        <svg viewBox="0 0 100 100" preserveAspectRatio="none" style={{ width: "100%", height: "100%", opacity: 0.22, position: "absolute", top: 0, left: 0 }}>
          {nodes.slice(0, -1).map((n, i) => {
            const nx = nodes[i + 1];
            return <line key={i} x1={n.x} y1={n.y} x2={nx.x} y2={nx.y} stroke="#ffd700" strokeWidth="0.7" strokeDasharray="2,1.5" />;
          })}
        </svg>
        {worlds.map((w, i) => {
          const node = nodes[i];
          const st = worldStatus[w.id];
          const cls = `map-node ${st.done ? "done" : st.unlocked ? "avail" : "lock"}`;
          return (
            <div
              key={w.id}
              className={cls}
              style={{ left: `${node.x}%`, top: `${node.y}%` }}
              onClick={() => st.unlocked ? (sfx.click(), onSelect(i)) : lockedClick()}
              title={w.name?.[lang] || w.name?.EN || w.id}
            >
              <span style={{ fontSize: "1.4rem" }}>{st.done ? "✅" : w.icon}</span>
              <span className="cinzel" style={{ fontSize: ".46rem", color: "var(--text)", marginTop: "1px", maxWidth: "60px", textAlign: "center", lineHeight: 1.1, letterSpacing: ".08em" }}>
                {(w.name?.[lang] || w.name?.EN || w.id).split(" ").slice(0, 2).join(" ")}
              </span>
            </div>
          );
        })}
        {/* Boss node */}
        <div
          className={`map-node boss ${allWorldsDone ? "avail" : "lock"}`}
          style={{ left: `${nodes[nodes.length - 1].x}%`, top: `${nodes[nodes.length - 1].y}%`, borderColor: "var(--red)" }}
          onClick={() => allWorldsDone ? (sfx.click(), onBoss?.()) : lockedClick()}
          title="Fracton the Void Wyrm"
        >
          <span style={{ fontSize: "2rem" }}>🐉</span>
          <span className="cinzel" style={{ fontSize: ".46rem", color: "var(--red)", marginTop: "1px", letterSpacing: ".1em" }}>BOSS</span>
        </div>
      </div>

      <div style={{ zIndex: 1, display: "flex", gap: ".7rem", padding: ".6rem", flexWrap: "wrap", justifyContent: "center" }}>
        {[["✅", lang === "TL" ? "Tapos" : "Cleared"], ["⚡", lang === "TL" ? "Bukas" : "Available"], ["🔒", lang === "TL" ? "Sarado" : "Locked"]].map(([e, l]) => (
          <div key={l} style={{ display: "flex", gap: ".3rem", alignItems: "center", color: "var(--text)", fontSize: ".72rem", opacity: 0.6 }}>
            <span>{e}</span>
            <span>{l}</span>
          </div>
        ))}
      </div>
      {onReset && (
        <button className="btn btn-ghost" onClick={onReset} style={{ marginTop: ".4rem", zIndex: 1 }}>
          {lang === "TL" ? "I-reset ang Progreso" : "Reset Progress"}
        </button>
      )}
    </div>
  );
}
