import { useEffect, useState } from "react";

export function useTypewriter(text, speed = 22, active = true) {
  const [shown, setShown] = useState("");
  const [done, setDone] = useState(false);

  useEffect(() => {
    if (!active) { setShown(text); setDone(true); return; }
    setShown(""); setDone(false);
    let i = 0;
    const t = setInterval(() => {
      i++;
      setShown(text.slice(0, i));
      if (i >= text.length) { clearInterval(t); setDone(true); }
    }, speed);
    return () => clearInterval(t);
  }, [text, active, speed]);

  return [shown, done];
}
