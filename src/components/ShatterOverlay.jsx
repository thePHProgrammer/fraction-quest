import { useEffect, useMemo } from "react";

export default function ShatterOverlay({ active, onDone }) {
  const shards = useMemo(() => {
    const cols = 7, rows = 5, arr = [];
    for (let r = 0; r < rows; r++) {
      for (let c = 0; c < cols; c++) {
        const cx = (c + 0.5) / cols, cy = (r + 0.5) / rows;
        arr.push({
          id: r * cols + c,
          left: `${(c / cols) * 100}%`,
          top: `${(r / rows) * 100}%`,
          w: `${100 / cols}%`,
          h: `${100 / rows}%`,
          dx: `${(cx - 0.5) * 720 + (Math.random() - 0.5) * 140}px`,
          dy: `${(cy - 0.5) * 600 + (Math.random() - 0.5) * 100}px`,
          dz: `${(Math.random() - 0.5) * 200}px`,
          rx: `${(Math.random() - 0.5) * 360}deg`,
          ry: `${(Math.random() - 0.5) * 360}deg`,
          rz: `${(Math.random() - 0.5) * 300}deg`,
          del: `${Math.floor(Math.random() * 140)}ms`,
        });
      }
    }
    return arr;
  }, []);

  const particles = useMemo(
    () =>
      Array.from({ length: 45 }, (_, i) => ({
        id: i,
        left: `${38 + Math.random() * 24}%`,
        top: `${38 + Math.random() * 24}%`,
        w: `${Math.random() * 10 + 4}px`,
        h: `${Math.random() * 10 + 4}px`,
        pvx: `${(Math.random() - 0.5) * 600}px`,
        pvy: `${(Math.random() - 0.5) * 520}px`,
        pvz: `${(Math.random() - 0.5) * 200}px`,
        prz: `${(Math.random() - 0.5) * 720}deg`,
        pd: `${Math.random() * 0.65 + 0.5}s`,
        del: `${Math.random() * 180}ms`,
      })),
    []
  );

  useEffect(() => {
    if (!active) return;
    const t = setTimeout(onDone, 1700);
    return () => clearTimeout(t);
  }, [active, onDone]);

  if (!active) return null;
  return (
    <>
      <div className="gold-flash" />
      {shards.map((s) => (
        <div
          key={s.id}
          className="shatter-shard fly"
          style={{
            position: "fixed",
            left: s.left,
            top: s.top,
            width: s.w,
            height: s.h,
            "--dx": s.dx,
            "--dy": s.dy,
            "--dz": s.dz,
            "--rx": s.rx,
            "--ry": s.ry,
            "--rz": s.rz,
            animationDelay: s.del,
            clipPath: "polygon(8% 0%,92% 3%,100% 88%,78% 100%,4% 97%,0% 18%)",
          }}
        />
      ))}
      <div className="correct-burst">✦ CORRECT! ✦</div>
      {particles.map((p) => (
        <div
          key={p.id}
          className="g-particle"
          style={{
            left: p.left,
            top: p.top,
            width: p.w,
            height: p.h,
            "--pvx": p.pvx,
            "--pvy": p.pvy,
            "--pvz": p.pvz,
            "--prz": p.prz,
            "--pd": p.pd,
            animationDelay: p.del,
          }}
        />
      ))}
    </>
  );
}
