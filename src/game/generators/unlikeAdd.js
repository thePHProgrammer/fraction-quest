import { R, simplify, shuf, lcm } from "../math";
import { fpPair } from "../fingerprint";

const TIPS = [
  "Different bottoms? Find the LCM, convert both, then ADD the tops 🧮",
  "Equivalent fractions: multiply top AND bottom by the same number",
  "Step 1: common denominator. Step 2: add numerators. Step 3: simplify ✅",
];

export function genUnlikeAdd(diff = 0) {
  const spike = Math.random() < 0.2;
  const d = spike ? Math.min(2, diff + 1) : diff;

  let d1, d2, n1, n2;
  for (let i = 0; i < 12; i++) {
    if (d === 0) {
      d1 = R(2, 4); d2 = R(2, 5);
    } else if (d === 1) {
      d1 = R(2, 6); d2 = R(2, 8);
    } else {
      d1 = R(3, 9); d2 = R(3, 11);
    }
    if (d1 === d2) continue;
    n1 = R(1, d1 - 1);
    n2 = R(1, d2 - 1);
    break;
  }

  const L = lcm(d1, d2);
  const numSum = (n1 * (L / d1)) + (n2 * (L / d2));
  const [ansN, ansD] = simplify(numSum, L);

  const correct = { n: ansN, d: ansD, isCorrect: true };
  const seen = new Set([`${ansN}/${ansD}`]);
  const choices = [correct];

  const fakes = [
    { n: n1 + n2, d: d1 + d2 },
    { n: n1 + n2, d: Math.max(d1, d2) },
    simpPair(numSum + 1, L),
    simpPair(Math.max(1, numSum - 1), L),
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
    instruction: "Add the fractions! ➕",
    displayOp: { n1, d1, op: "+", n2, d2 },
    choices: shuf(choices),
    answer: { n: ansN, d: ansD },
    hint: TIPS[R(0, TIPS.length - 1)],
    process: `LCM(${d1}, ${d2}) = ${L} → ${n1 * (L/d1)}/${L} + ${n2 * (L/d2)}/${L} = ${numSum}/${L} → ${ansN}/${ansD}`,
    fingerprint: fpPair("add", [n1, d1], [n2, d2], { commutative: true, sep: "+" }),
  };
}

const simpPair = (n, d) => {
  const [a, b] = simplify(n, d);
  return { n: a, d: b };
};
