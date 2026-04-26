import { memo, useMemo } from "react";

export const Stars = memo(function Stars({ count = 120 }) {
  const stars = useMemo(
    () =>
      Array.from({ length: count }, (_, i) => ({
        id: i,
        left: `${Math.random() * 100}%`,
        top: `${Math.random() * 100}%`,
        sz: `${Math.random() * 2.4 + 0.5}px`,
        dur: `${Math.random() * 4 + 2}s`,
        del: `${Math.random() * 5}s`,
        op: Math.random() * 0.4 + 0.1,
      })),
    [count]
  );
  return (
    <div className="starfield">
      {stars.map((x) => (
        <div
          key={x.id}
          className="star"
          style={{
            left: x.left,
            top: x.top,
            width: x.sz,
            height: x.sz,
            "--dur": x.dur,
            "--del": x.del,
            "--op": x.op,
          }}
        />
      ))}
    </div>
  );
});
