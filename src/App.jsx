import { useEffect, useMemo, useState } from "react";
import "./styles/cinematic.css";

import { loadSave, saveSave } from "./game/store";
import { setSfxMuted } from "./audio/sfx";
import { stopBGM } from "./audio/bgm";

import { GENS, WORLDS, BOSS_DEDUP_KEY } from "./game/registry";
import { VILLAINS } from "./game/villains";

import TitleScreen from "./screens/TitleScreen";
import StoryIntro from "./screens/StoryIntro";
import LevelMap from "./screens/LevelMap";
import PreBattle from "./screens/PreBattle";
import BattleScene from "./screens/BattleScene";
import LevelComplete from "./screens/LevelComplete";
import VictoryScreen from "./screens/VictoryScreen";
import DefeatScreen from "./screens/DefeatScreen";

const writeSave = saveSave;

export default function App() {
  const [gs, setGs] = useState(() => loadSave());
  const [screen, setScreen] = useState(() => (gs.missionSeen ? "title" : "title"));
  const [worldIdx, setWorldIdx] = useState(0);
  const [pHPLast, setPHPLast] = useState(3);
  const lang = gs.lang || "EN";

  // Persist save changes (writeSave is also called eagerly by dedup/recordPerf;
  // this useEffect is a safety net for high-level state changes).
  useEffect(() => { writeSave(gs); }, [gs]);
  useEffect(() => () => stopBGM(), []);

  const setLang = (l) => setGs((p) => ({ ...p, lang: l }));

  const goTitle = () => setScreen("title");

  const handleStart = () => {
    // Mission story shows once. After that the Title button takes you straight to the map.
    // Re-read storage in case another tab marked it seen.
    const fresh = loadSave();
    if (!fresh.missionSeen) setScreen("story");
    else setScreen("map");
  };

  const handleStoryDone = () => {
    // Defensively re-stamp the flag — on-mount inside StoryIntro already did this.
    setGs((p) => ({ ...p, missionSeen: true }));
    setScreen("map");
  };

  const handleSelect = (wi) => {
    setWorldIdx(wi);
    setScreen("prebattle");
  };

  const handleBoss = () => {
    setWorldIdx(-1);
    setScreen("prebattle");
  };

  // ── Battle helpers ──────────────────────────────────────────
  const isBoss = worldIdx === -1;
  const activeWorld = !isBoss ? WORLDS[worldIdx] : null;
  const activeVillainEntry = isBoss ? VILLAINS.boss : (activeWorld ? VILLAINS[activeWorld.id] : null);
  const battleProps = useMemo(() => {
    if (isBoss) {
      // Boss draws random questions across all generators.
      const ids = Object.keys(GENS);
      const bossGen = (diff) => {
        const id = ids[Math.floor(Math.random() * ids.length)];
        return GENS[id](diff);
      };
      return {
        generator: bossGen,
        dedupKey: BOSS_DEDUP_KEY,
        baseDiff: 2,
        villain: VILLAINS.boss.villain,
        isBoss: true,
        totalQuestions: VILLAINS.boss.villain.hp,
      };
    }
    if (!activeWorld) return null;
    return {
      generator: GENS[activeWorld.id],
      dedupKey: `${activeWorld.id}__cinematic`,
      baseDiff: 1,
      villain: VILLAINS[activeWorld.id]?.villain,
      isBoss: false,
      totalQuestions: VILLAINS[activeWorld.id]?.villain?.hp ?? 5,
    };
  }, [isBoss, worldIdx, activeWorld]);

  const handleWin = (pHP) => {
    setPHPLast(pHP);
    if (isBoss) {
      // Mark boss as cleared.
      setGs((p) => ({ ...p, bossDone: true }));
    } else if (activeWorld) {
      // Mark all levels of the world as 3 stars (single battle = whole world cleared).
      setGs((p) => {
        const newStars = { ...(p.stars || {}) };
        activeWorld.levels.forEach((_, li) => {
          newStars[`${activeWorld.id}-${li}`] = Math.max(newStars[`${activeWorld.id}-${li}`] || 0, pHP >= 3 ? 3 : pHP >= 2 ? 2 : 1);
        });
        return { ...p, stars: newStars };
      });
    }
    setScreen("levelcomplete");
  };

  const handleContinue = () => {
    if (isBoss) setScreen("victory");
    else setScreen("map");
  };

  const handleLose = () => setScreen("defeat");

  const handleRestart = () => {
    stopBGM();
    setScreen("map");
  };

  const handleResetProgress = () => {
    if (typeof window !== "undefined" && !window.confirm(lang === "TL" ? "I-reset ang lahat ng progreso?" : "Reset all progress?")) return;
    const fresh = { stars: {}, performance: {}, seen: {}, missionSeen: gs.missionSeen, lang: gs.lang, bossDone: false, version: 3, xp: 0, lv: 1, tutSeen: {} };
    setGs(fresh);
    saveSave(fresh);
    setScreen("title");
  };

  // ── Render ──────────────────────────────────────────────────
  if (screen === "title")
    return <TitleScreen lang={lang} onStart={handleStart} />;

  if (screen === "story")
    return (
      <StoryIntro
        lang={lang}
        save={gs}
        persistSave={(s) => { saveSave(s); setGs({ ...s }); }}
        onDone={handleStoryDone}
      />
    );

  if (screen === "map")
    return (
      <LevelMap
        worlds={WORLDS}
        gs={gs}
        lang={lang}
        onSelect={handleSelect}
        onBoss={handleBoss}
        onChangeLang={setLang}
        onReset={handleResetProgress}
      />
    );

  if (screen === "prebattle" && activeVillainEntry)
    return (
      <PreBattle
        villain={activeVillainEntry.villain}
        lesson={activeVillainEntry.lesson}
        isBoss={isBoss}
        onStartBattle={() => setScreen("battle")}
        onBack={() => setScreen("map")}
        lang={lang}
      />
    );

  if (screen === "battle" && battleProps)
    return (
      <BattleScene
        key={battleProps.dedupKey}
        {...battleProps}
        save={gs}
        onWin={handleWin}
        onLose={handleLose}
        onBack={() => setScreen("map")}
        lang={lang}
      />
    );

  if (screen === "levelcomplete")
    return <LevelComplete pHP={pHPLast} isBoss={isBoss} onContinue={handleContinue} lang={lang} />;

  if (screen === "victory")
    return <VictoryScreen onRestart={() => setScreen("map")} lang={lang} />;

  if (screen === "defeat")
    return <DefeatScreen onRestart={handleRestart} lang={lang} />;

  // Fallback: kick to title.
  return <TitleScreen lang={lang} onStart={handleStart} />;
}

// Sync SFX mute with the music toggle on first paint so audio plays correctly out of the gate.
if (typeof window !== "undefined") {
  setSfxMuted(false);
}
