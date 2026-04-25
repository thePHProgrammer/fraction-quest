import { canon, sortByValue, simplify } from "./math";

const toCanonPair = (a) => {
  const [n, d] = simplify(a[0], a[1]);
  return [n, d];
};

export const fpSingle = (tag, a) => `${tag}|${canon(a[0], a[1])}`;

export function fpPair(tag, a, b, { commutative = false, sep = "+" } = {}) {
  const ca = toCanonPair(a);
  const cb = toCanonPair(b);
  const [x, y] = commutative ? [ca, cb].sort(sortByValue) : [ca, cb];
  return `${tag}|${x.join("/")}${sep}${y.join("/")}`;
}

export const fpProperPick = (a) => fpSingle("propPick", a);
export const fpImproper = (a) => fpSingle("imp", a);
export const fpMixed = (w, n, d) => `mxd|${w}+${canon(n, d)}`;
