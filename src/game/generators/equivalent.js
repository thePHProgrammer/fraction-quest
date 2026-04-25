import { R, simplify, shuf } from "../math";
import { fpSingle } from "../fingerprint";

const TIPS = [
  "Multiply (or divide) BOTH top and bottom by the same number ⚖️",
  "Equivalent fractions look different but are equal in value",
  "Pizza test: 1/2 = 2/4 — same amount, different slices 🍕",
];

export function genEquivalent(diff = 0) {
  const spike = Math.random() < 0.2;
  const d = spike ? Math.min(2, diff + 1) : diff;

  const baseRange = d === 0 ? [2, 5] : d === 1 ? [2, 7] : [2, 10];
  const denom = R(...baseRange);
  const num = R(1, denom - 1);
  const k = d === 0 ? R(2, 3) : d === 1 ? R(2, 5) : R(2, 7);

  const correctN = num * k;
  const correctD = denom * k;

  const seen = new Set([`${correctN}/${correctD}`]);
  const choices = [{ n: correctN, d: correctD, isCorrect: true }];

  const fakes = [
    { n: num + k, d: denom + k },
    { n: correctN + 1, d: correctD },
    { n: correctN, d: correctD + 1 },
    { n: num * (k + 1), d: denom * k },
    { n: num * k, d: denom * (k + 1) },
  ];
  for (const f of fakes) {
    if (choices.length >= 4) break;
    if (!f || f.d <= 0 || f.n <= 0) continue;
    const key = `${f.n}/${f.d}`;
    if (seen.has(key)) continue;
    if (f.n * denom === num * f.d) continue;
    seen.add(key);
    choices.push({ n: f.n, d: f.d, isCorrect: false });
  }
  while (choices.length < 4) {
    const fn = correctN + R(1, 3), fd = correctD + R(1, 3);
    const key = `${fn}/${fd}`;
    if (seen.has(key) || fn * denom === num * fd) continue;
    seen.add(key);
    choices.push({ n: fn, d: fd, isCorrect: false });
  }

  return {
    type: "mc-frac",
    instruction: `Which is EQUIVALENT to ${num}/${denom}? 🟰`,
    displayFrac: { n: num, d: denom },
    choices: shuf(choices),
    answer: { n: correctN, d: correctD },
    hint: TIPS[R(0, TIPS.length - 1)],
    process: `${num}/${denom} × ${k}/${k} = ${correctN}/${correctD}`,
    fingerprint: fpSingle("eq", [num, denom]) + `*${k}`,
  };
}
