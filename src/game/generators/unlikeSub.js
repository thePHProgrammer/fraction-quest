import { R, simplify, shuf, lcm } from "../math";
import { fpPair } from "../fingerprint";

const TIPS = [
  "Common bottom first, then SUBTRACT the tops 🔻",
  "Convert both to the LCM denominator before subtracting",
  "Step 1: common denominator. Step 2: subtract numerators. Step 3: simplify ✅",
];

const simpPair = (n, d) => { const [a, b] = simplify(n, d); return { n: a, d: b }; };

export function genUnlikeSub(diff = 0) {
  const spike = Math.random() < 0.2;
  const d = spike ? Math.min(2, diff + 1) : diff;

  let d1, d2, n1, n2;
  for (let i = 0; i < 14; i++) {
    if (d === 0) { d1 = R(2, 4); d2 = R(2, 5); }
    else if (d === 1) { d1 = R(2, 6); d2 = R(2, 8); }
    else { d1 = R(3, 9); d2 = R(3, 11); }
    if (d1 === d2) continue;
    n1 = R(1, d1 - 1);
    n2 = R(1, d2 - 1);
    const L = lcm(d1, d2);
    if (n1 * (L / d1) > n2 * (L / d2)) break;
  }

  const L = lcm(d1, d2);
  const a = n1 * (L / d1);
  const b = n2 * (L / d2);
  const diffNum = a - b;
  const [ansN, ansD] = simplify(diffNum, L);

  const seen = new Set([`${ansN}/${ansD}`]);
  const choices = [{ n: ansN, d: ansD, isCorrect: true }];

  const fakes = [
    { n: Math.abs(n1 - n2), d: Math.max(d1, d2) },
    { n: a + b, d: L },
    simpPair(diffNum + 1, L),
    simpPair(Math.max(1, diffNum - 1), L),
    { n: ansN + 1, d: ansD },
  ];
  for (const f of fakes) {
    if (choices.length >= 4) break;
    if (!f || f.d <= 0 || f.n <= 0) continue;
    const k = `${f.n}/${f.d}`;
    if (seen.has(k)) continue;
    if (f.n * ansD === ansN * f.d) continue;
    seen.add(k);
    choices.push({ n: f.n, d: f.d, isCorrect: false });
  }
  while (choices.length < 4) {
    const fn = ansN + R(1, 3), fd = ansD + R(1, 3);
    const k = `${fn}/${fd}`;
    if (seen.has(k) || fn * ansD === ansN * fd) continue;
    seen.add(k);
    choices.push({ n: fn, d: fd, isCorrect: false });
  }

  return {
    type: "mc-frac",
    instruction: "Subtract the fractions! ➖",
    displayOp: { n1, d1, op: "−", n2, d2 },
    choices: shuf(choices),
    answer: { n: ansN, d: ansD },
    hint: TIPS[R(0, TIPS.length - 1)],
    process: `LCM(${d1}, ${d2}) = ${L} → ${a}/${L} − ${b}/${L} = ${diffNum}/${L} → ${ansN}/${ansD}`,
    fingerprint: fpPair("sub", [n1, d1], [n2, d2], { commutative: false, sep: "-" }),
  };
}
