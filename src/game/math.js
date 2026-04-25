export const gcd = (a, b) => {
  a = Math.abs(a); b = Math.abs(b);
  while (b) { [a, b] = [b, a % b]; }
  return a || 1;
};

export const lcm = (a, b) => Math.abs((a * b) / gcd(a, b));

export const simplify = (n, d) => {
  const sign = (n < 0) !== (d < 0) ? -1 : 1;
  const an = Math.abs(n), ad = Math.abs(d) || 1;
  const g = gcd(an, ad);
  return [sign * (an / g), ad / g];
};

export const toImproper = (w, n, d) => [w * d + n, d];

export const toMixed = (n, d) => {
  const w = Math.floor(n / d);
  return [w, n - w * d, d];
};

export const R = (min, max) => Math.floor(Math.random() * (max - min + 1)) + min;

export const shuf = (arr) => {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
};

export const pick = (arr) => arr[R(0, arr.length - 1)];

export const canon = (n, d) => simplify(n, d).join("/");

export const isEquivalent = (a, b) => {
  const [an, ad] = a, [bn, bd] = b;
  return an * bd === bn * ad;
};

export const sortByValue = (a, b) => (a[0] / a[1]) - (b[0] / b[1]);

export const parseFrac = (input) => {
  if (input == null) return null;
  const s = String(input).trim();
  if (!s) return null;
  if (/^-?\d+$/.test(s)) return [parseInt(s, 10), 1];
  if (/^-?\d+\/\d+$/.test(s)) {
    const [n, d] = s.split("/").map(Number);
    return d === 0 ? null : [n, d];
  }
  if (/^-?\d+\s+\d+\/\d+$/.test(s)) {
    const [w, frac] = s.split(/\s+/);
    const [n, d] = frac.split("/").map(Number);
    if (d === 0) return null;
    const wn = parseInt(w, 10);
    const sign = wn < 0 ? -1 : 1;
    return [sign * (Math.abs(wn) * d + n), d];
  }
  return null;
};
