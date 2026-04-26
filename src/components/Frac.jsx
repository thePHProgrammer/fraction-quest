// Inline fraction renderers used across the cinematic screens.

export function Frac({ n, d }) {
  return (
    <span className="frac">
      <span>{n}</span>
      <span className="fb" />
      <span>{d}</span>
    </span>
  );
}

export function Mixed({ w, n, d }) {
  return (
    <span style={{ display: "inline-flex", alignItems: "center", gap: ".25em" }}>
      <span style={{ fontWeight: 800 }}>{w}</span>
      <Frac n={n} d={d} />
    </span>
  );
}

// Replace "a/b" patterns in a string with rendered Frac components.
export function richText(str) {
  if (typeof str !== "string") return str;
  return str.split(/(\d+\/\d+)/g).map((p, i) => {
    const m = p.match(/^(\d+)\/(\d+)$/);
    return m ? <Frac key={i} n={m[1]} d={m[2]} /> : p;
  });
}
