import { R, simplify, shuf, gcd } from "../math";
import { fpSingle } from "../fingerprint";

const TIPS = [
  "Find the GCD of top and bottom, then divide both by it ✨",
  "A fraction is simplest when numerator and denominator share no common factor > 1",
  "Tip: try dividing both by 2, then 3, then 5… until nothing else divides cleanly",
];

export function genSimplify(diff = 0) {
  const spike = Math.random() < 0.2;
  const d = spike ? Math.min(2, diff + 1) : diff;

  const baseRange = d === 0 ? [2, 5] : d === 1 ? [2, 8] : [3, 11];
  const scaleRange = d === 0 ? [2, 3] : d === 1 ? [2, 5] : [2, 7];

  let n, dd, sn, sdv;
  for (let attempt = 0; attempt < 10; attempt++) {
    const factor = R(...baseRange);
    const a = R(...scaleRange);
    const b = R(a + 1, a + R(2, 6));
    n = factor * a;
    dd = factor * b;
    [sn, sdv] = simplify(n, dd);
    if (sn !== n && sdv > 1 && sn >= 1 && sdv >= 2) break;
  }

  const correct = { n: sn, d: sdv, isCorrect: true };
  const candidates = new Set();
  candidates.add(`${sn}/${sdv}`);

  const distractors = [
    { n, d: dd },
    { n: sn + 1, d: sdv },
    { n: sn, d: sdv + 1 },
    { n: sdv, d: sn },
    { n: Math.max(1, sn - 1), d: sdv },
  ];

  const choices = [correct];
  for (const dx of distractors) {
    if (choices.length >= 4) break;
    if (dx.d <= 0 || dx.n <= 0) continue;
    const key = `${dx.n}/${dx.d}`;
    if (candidates.has(key)) continue;
    if (dx.n * sdv === sn * dx.d) continue;
    candidates.add(key);
    choices.push({ n: dx.n, d: dx.d, isCorrect: false });
  }
  while (choices.length < 4) {
    const fn = sn + R(2, 4), fd = sdv + R(1, 3);
    const key = `${fn}/${fd}`;
    if (candidates.has(key)) continue;
    if (fn * sdv === sn * fd) continue;
    candidates.add(key);
    choices.push({ n: fn, d: fd, isCorrect: false });
  }

  return {
    type: "mc-frac",
    instruction: "Simplify the fraction! ✂️",
    displayFrac: { n, d: dd },
    choices: shuf(choices),
    answer: { n: sn, d: sdv },
    hint: TIPS[R(0, TIPS.length - 1)],
    process: `GCD(${n}, ${dd}) = ${gcd(n, dd)} → divide both by ${gcd(n, dd)} → ${sn}/${sdv}`,
    fingerprint: fpSingle("simp", [n, dd]),
  };
}
