import { useEffect, useMemo, useRef, useState } from "react";
import MusicBtn from "../components/MusicBtn";
import ShatterOverlay from "../components/ShatterOverlay";
import { Frac, Mixed, richText } from "../components/Frac";
import { useTypewriter } from "../hooks/useTypewriter";
import { sfx } from "../audio/sfx";
import { playBGM } from "../audio/bgm";
import { pickQuestion, adaptDiff, recordPerf } from "../game/dedup";
import { saveSave } from "../game/store";

// Render an answer choice based on the question type.
function ChoiceLabel({ q, c }) {
  if (q.type === "mc-mixed") return <Mixed w={c.w} n={c.n} d={c.d} />;
  if (q.type === "mc-compare") return <span className="ans-symbol">{c.label}</span>;
  return <Frac n={c.n} d={c.d} />;
}

// Build the question prompt from the generator's question object.
function questionPrompt(q, lang) {
  if (q.type === "mc-compare" && q.displayOp) {
    const a = <Frac n={q.displayOp.n1} d={q.displayOp.d1} />;
    const b = <Frac n={q.displayOp.n2} d={q.displayOp.d2} />;
    return (
      <span>
        {lang === "TL" ? "Alin ang tama?" : "Which is correct?"} {a} <span style={{ opacity: 0.5 }}>?</span> {b}
      </span>
    );
  }
  if (q.displayOp) {
    return (
      <span>
        {q.instruction}
        <span style={{ display: "block", marginTop: ".4rem", fontSize: "1.4em" }}>
          <Frac n={q.displayOp.n1} d={q.displayOp.d1} /> <span style={{ fontFamily: "Cinzel,serif", margin: "0 .25em" }}>{q.displayOp.op}</span> <Frac n={q.displayOp.n2} d={q.displayOp.d2} />
        </span>
      </span>
    );
  }
  if (q.displayFrac) {
    return (
      <span>
        {q.instruction}
        <span style={{ display: "block", marginTop: ".4rem", fontSize: "1.4em" }}>
          <Frac n={q.displayFrac.n} d={q.displayFrac.d} />
        </span>
      </span>
    );
  }
  if (q.displayMixed) {
    return (
      <span>
        {q.instruction}
        <span style={{ display: "block", marginTop: ".4rem", fontSize: "1.4em" }}>
          <Mixed w={q.displayMixed.w} n={q.displayMixed.n} d={q.displayMixed.d} />
        </span>
      </span>
    );
  }
  return <span>{richText(q.instruction)}</span>;
}

const BattleRunes = function BattleRunes() {
  const runes = useMemo(
    () => ["✦", "⚡", "☆", "◈", "✧", "⊕", "◆", "∞", "⚔"].map((r, i) => ({
      r,
      left: `${5 + i * 11}%`,
      top: `${15 + Math.sin(i * 1.3) * 40}%`,
      rx: `${(Math.random() - 0.5) * 25}px`,
      ry: `${-10 - Math.random() * 15}px`,
      rr: `${(Math.random() - 0.5) * 20}deg`,
      rf: `${6 + Math.random() * 6}s`,
      rd: `${i * 0.35}s`,
    })),
    []
  );
  return (
    <>
      {runes.map((rn, i) => (
        <div key={i} className="battle-rune" style={{ left: rn.left, top: rn.top, "--rx": rn.rx, "--ry": rn.ry, "--rr": rn.rr, "--rf": rn.rf, "--rd": rn.rd }}>
          {rn.r}
        </div>
      ))}
    </>
  );
};

export default function BattleScene({
  generator, dedupKey, baseDiff = 1,
  villain, isBoss = false,
  save, onWin, onLose, onBack,
  totalQuestions = null,
  lang = "EN",
}) {
  const maxEHP = villain.hp;
  const maxQ = totalQuestions ?? villain.hp; // run for villain.hp questions (1 per HP) by default
  const perfArr = save?.performance?.[dedupKey] || [];
  const initialDiff = adaptDiff(baseDiff, perfArr);

  const nextQ = () => pickQuestion(generator, dedupKey, initialDiff, save, saveSave);
  const [eHP, setEHP] = useState(maxEHP);
  const [pHP, setPHP] = useState(3);
  const [qIdx, setQIdx] = useState(0);
  const [q, setQ] = useState(() => nextQ());
  const [selected, setSelected] = useState(null);
  const [shatter, setShatter] = useState(false);
  const [wrongFlash, setWrongFlash] = useState(false);
  const [enemyHit, setEnemyHit] = useState(false);
  const [playerHit, setPlayerHit] = useState(false);
  const [playerAtk, setPlayerAtk] = useState(false);
  const [showHint, setShowHint] = useState(false);
  const [showProcess, setShowProcess] = useState(false);
  const [missesOnQ, setMissesOnQ] = useState(0);
  const [defeatDlg, setDefeatDlg] = useState(false);
  const [defeatText] = useTypewriter(villain.defeatLine, 24, defeatDlg);
  const ended = useRef(false);

  useEffect(() => { playBGM(isBoss ? "boss" : "battle"); }, [isBoss]);

  const goNextQ = (advanceCount = true) => {
    if (advanceCount) setQIdx((qi) => qi + 1);
    setSelected(null);
    setShowHint(false);
    setShowProcess(false);
    setMissesOnQ(0);
    setQ(nextQ());
  };

  const handleAnswer = (idx) => {
    if (selected !== null || defeatDlg || ended.current) return;
    setSelected(idx);
    const correctIdx = q.choices.findIndex((c) => c.isCorrect);
    const isCorrect = idx === correctIdx;

    if (isCorrect) {
      sfx.correct();
      recordPerf(save, dedupKey, true, saveSave);
      setPlayerAtk(true);
      setTimeout(() => setPlayerAtk(false), 500);
      setTimeout(() => { setEnemyHit(true); setTimeout(() => setEnemyHit(false), 600); }, 280);
      const newEHP = Math.max(0, eHP - 1);
      setTimeout(() => { setEHP(newEHP); setShatter(true); }, 230);
    } else {
      sfx.wrong();
      recordPerf(save, dedupKey, false, saveSave);
      setMissesOnQ((prev) => {
        if (prev === 0) setShowHint(true);
        else if (q?.process) setShowProcess(true);
        return prev + 1;
      });
      setWrongFlash(true);
      setPlayerHit(true);
      const newPHP = pHP - 1;
      setPHP(newPHP);
      setTimeout(() => { setPlayerHit(false); setWrongFlash(false); }, 600);
      if (newPHP <= 0) {
        ended.current = true;
        setTimeout(() => onLose?.(), 1000);
        return;
      }
      // After a wrong answer, give the player a moment to read the hint, then proceed.
      setTimeout(() => {
        setSelected(null);
        if (qIdx + 1 < maxQ) goNextQ(true);
      }, 2400);
    }
  };

  const handleShatterDone = () => {
    setShatter(false);
    if (eHP <= 0 && !ended.current) {
      ended.current = true;
      setDefeatDlg(true);
      setTimeout(() => { setDefeatDlg(false); onWin?.(pHP); }, 3800);
      return;
    }
    if (qIdx + 1 < maxQ) goNextQ(true);
    else if (!ended.current) {
      // Out of questions but enemy still alive — treat as a partial victory if you've beaten enough.
      ended.current = true;
      setTimeout(() => onWin?.(pHP), 600);
    }
  };

  const progPct = (qIdx / maxQ) * 100;

  return (
    <div className="battle-wrap">
      <ShatterOverlay active={shatter} onDone={handleShatterDone} />
      {wrongFlash && <div className="wrong-flash" />}
      <MusicBtn />

      <div className="battle-scene" style={{ background: villain.bgGradient }}>
        <BattleRunes />
        <div className="battle-floor" />
        <div className="hp-bar-enemy">
          <div className="enemy-name-lbl">⚔️ {villain.name}</div>
          <div className="hp-track">
            <div className="hp-fill hp-fill-enemy" style={{ width: `${(eHP / maxEHP) * 100}%` }} />
          </div>
          <div style={{ display: "flex", justifyContent: "space-between", marginTop: ".15rem" }}>
            <span style={{ fontSize: ".62rem", color: "var(--red)", opacity: 0.7 }}>{eHP}/{maxEHP} HP</span>
            <span style={{ fontSize: ".62rem", color: "var(--text)", opacity: 0.55 }}>Q{Math.min(qIdx + 1, maxQ)}/{maxQ}</span>
          </div>
        </div>
        <div className="enemy-sprite-wrap">
          <div className={`enemy-sprite ${enemyHit ? "enemy-hit" : ""}`} style={{ "--vcol": villain.color }}>{villain.emoji}</div>
        </div>
        <div className="player-sprite-wrap">
          <div className={`player-sprite ${playerHit ? "player-hit" : playerAtk ? "player-attack" : ""}`}>🧙</div>
          <div className="player-hp-row">
            {Array.from({ length: 3 }, (_, i) => (
              <span key={i} className={`heart ${i >= pHP ? "empty" : ""}`}>❤️</span>
            ))}
          </div>
          <div className="prog-strip" style={{ width: "75px" }}>
            <div className="prog-fill" style={{ width: `${progPct}%` }} />
          </div>
        </div>
        <div className="scenery-strip">{villain.scenery}</div>
        {onBack && (
          <button
            className="btn btn-ghost"
            onClick={onBack}
            style={{ position: "absolute", top: ".6rem", left: ".6rem", zIndex: 5, padding: ".3rem .7rem", fontSize: ".7rem" }}
          >
            ← {lang === "TL" ? "Mapa" : "Map"}
          </button>
        )}
      </div>

      <div className="action-panel">
        {defeatDlg ? (
          <div className="battle-dialogue" style={{ flex: 1, alignItems: "center" }}>
            <div className="bd-portrait">{villain.emoji}</div>
            <div className="bd-body">
              <div className="bd-name">{villain.name}</div>
              <div className="bd-text">
                {defeatText}
                {!defeatText.length && <span className="dialogue-cursor" />}
              </div>
            </div>
          </div>
        ) : (
          <>
            <div className="q-text">{questionPrompt(q, lang)}</div>
            {showHint && q?.hint && (
              <div className="hint-box">
                <span>💡</span>
                <span>{q.hint}</span>
              </div>
            )}
            {showProcess && q?.process && (
              <div className="process-box">
                <div className="label">{lang === "TL" ? "Hakbang-hakbang" : "Step by step"}</div>
                <span>{q.process}</span>
              </div>
            )}
            <div className={`answers ${q.type === "mc-compare" ? "cmp" : ""}`}>
              {q.choices.map((c, i) => {
                let cls = "ans-btn";
                const correctIdx = q.choices.findIndex((cc) => cc.isCorrect);
                if (selected !== null) {
                  if (i === correctIdx) cls += " correct";
                  else if (i === selected) cls += " wrong";
                }
                return (
                  <button
                    key={i}
                    className={cls}
                    disabled={selected !== null}
                    onClick={() => { try { navigator.vibrate?.(10); } catch (_) {} sfx.click(); handleAnswer(i); }}
                  >
                    <span className="ans-label">{["A", "B", "C", "D", "E"][i] || ""}</span>
                    <ChoiceLabel q={q} c={c} />
                  </button>
                );
              })}
            </div>
          </>
        )}
      </div>
    </div>
  );
}
