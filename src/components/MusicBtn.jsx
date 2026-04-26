import { useState } from "react";
import { toggleBGM, isMuted as isBgmMuted } from "../audio/bgm";
import { setSfxMuted } from "../audio/sfx";

export default function MusicBtn() {
  const [muted, setMuted] = useState(() => isBgmMuted());
  const onClick = () => {
    const m = toggleBGM();
    setSfxMuted(m);
    setMuted(m);
  };
  return (
    <button className="music-btn" onClick={onClick} title={muted ? "Unmute" : "Mute"}>
      {muted ? "🔇" : "🎵"}
    </button>
  );
}
