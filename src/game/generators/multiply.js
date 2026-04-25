import { R, simplify, shuf } from "../math";
import { fpPair } from "../fingerprint";

const TIPS = [
  "Multiply tops × tops, bottoms × bottoms, then simplify ✖️",
  "Tip: cross-cancel before multiplying — saves big simplifications",
  "Don't add or convert — just multiply straight across, then reduce",
];

const simpPair = (n, d) => { const [a, b] = simplify(n, d); return { n: a, d: b }; };

export function genMultiply(diff = 0) {
  const spike = Math.random() < 0.2;
  const d = spike ? Math.min(2, diff + 1) : diff;

  let n1, d1, n2, d2;
  if (d === 0) { d1 = R(2, 4); d2 = R(2, 4); n1 = R(1, d1 - 1); n2 = R(1, d2 - 1); }
  else if (d === 1) { d1 = R(2, 7); d2 = R(2, 7); n1 = R(1, d1 - 1); n2 = R(1, d2 - 1); }
  else { d1 = R(2, 9); d2 = R(2, 9); n1 = R(1, d1 - 1); n2 = R(1, d2 - 1); }

  const num = n1 * n2;
  const den = d1 * d2;
  const [ansN, ansD] = simplify(num, den);

  const seen = new Set([`${ansN}/${ansD}`]);
  const choices = [{ n: ansN, d: ansD, isCorrect: true }];

  const fakes = [
    { n: num, d: den },
    { n: n1 + n2, d: d1 + d2 },
    simpPair(num + n1, den),
    simpPair(num, den + d2),
    { n: ansN + 1, d: ansD },
  ];
  for (const f of fakes) {
    if (choices.length >= 4) break;
    if (!f || f.d <= 0 || f.n <= 0) continue;
    const k = `${f.n}/${f.d}`;
    if (seen.has(k) || f.n * ansD === ansN * f.d) continue;
    seen.add(k);
    choices.push({ n: f.n, d: f.d, isCorrect: false });
  }
  while (choices.length < 4) {
    const fn = ansN + R(1, 4), fd = ansD + R(1, 3);
    const k = `${fn}/${fd}`;
    if (seen.has(k) || fn * ansD === ansN * fd) continue;
    seen.add(k);
    choices.push({ n: fn, d: fd, isCorrect: false });
  }

  return {
    type: "mc-frac",
    instruction: "Multiply the fractions! ✖️",
    displayOp: { n1, d1, op: "×", n2, d2 },
    choices: shuf(choices),
    answer: { n: ansN, d: ansD },
    hint: TIPS[R(0, TIPS.length - 1)],
    process: `${n1}×${n2}=${num}, ${d1}×${d2}=${den} → ${num}/${den} → ${ansN}/${ansD}`,
    fingerprint: fpPair("mul", [n1, d1], [n2, d2], { commutative: true, sep: "*" }),
  };
}
