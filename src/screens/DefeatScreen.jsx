import { Stars } from "../components/Stars";

export default function DefeatScreen({ onRestart, lang = "EN" }) {
  return (
    <div className="cs-screen fade-in" style={{ padding: "2rem", background: "radial-gradient(ellipse at 50% 50%, #1a0005 0%, #04010a 70%)" }}>
      <Stars />
      <div className="end-card" style={{ borderColor: "var(--red)", zIndex: 1 }}>
        <div style={{ fontSize: "3.5rem", marginBottom: ".8rem" }}>💀</div>
        <div className="red-text">{lang === "TL" ? "TINALO!" : "DEFEATED!"}</div>
        <div className="divider" style={{ margin: "1rem 0", background: "linear-gradient(90deg,transparent,rgba(233,69,96,.4),transparent)" }} />
        <div style={{ color: "var(--text)", fontSize: ".92rem", lineHeight: 1.7, marginBottom: "1.4rem" }}>
          {lang === "TL" ? (
            <>
              Tumawa ang heneral habang ikaw ay bumagsak...
              <br /><span style={{ color: "var(--gold)" }}>Pag-aralan ang aralin, bumangon muli, at bawiin ang Arithmia!</span>
            </>
          ) : (
            <>
              The general laughs as you fall...
              <br /><span style={{ color: "var(--gold)" }}>Study the lesson, rise again, and reclaim Arithmia!</span>
            </>
          )}
        </div>
        <button className="btn btn-gold" onClick={onRestart}>
          ⚔️ {lang === "TL" ? "Bumangon Muli" : "Rise Again"}
        </button>
      </div>
    </div>
  );
}
