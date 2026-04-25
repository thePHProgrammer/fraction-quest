import { R, shuf, lcm } from "../math";
import { fpPair } from "../fingerprint";

const TIPS = [
  "Cross-multiply: a/b vs c/d → compare a×d with b×c 🔀",
  "Or convert to a common denominator and compare the tops",
  "Same numerator? Bigger bottom = smaller value (slice is thinner) 🍕",
];

export function genCompare(diff = 0) {
  const spike = Math.random() < 0.2;
  const d = spike ? Math.min(2, diff + 1) : diff;

  let n1, d1, n2, d2;
  for (let i = 0; i < 14; i++) {
    if (d === 0) { d1 = R(2, 5); d2 = R(2, 5); }
    else if (d === 1) { d1 = R(2, 8); d2 = R(2, 8); }
    else { d1 = R(3, 11); d2 = R(3, 11); }
    n1 = R(1, d1 - 1);
    n2 = R(1, d2 - 1);
    if (!(n1 === n2 && d1 === d2)) break;
  }

  const cross1 = n1 * d2;
  const cross2 = n2 * d1;
  const correctSym = cross1 < cross2 ? "<" : cross1 > cross2 ? ">" : "=";

  const choices = shuf([
    { label: "<", isCorrect: correctSym === "<" },
    { label: "=", isCorrect: correctSym === "=" },
    { label: ">", isCorrect: correctSym === ">" },
  ]);

  return {
    type: "mc-compare",
    instruction: "Compare the fractions! 🔍",
    displayOp: { n1, d1, op: "?", n2, d2 },
    choices,
    answer: { sym: correctSym },
    hint: TIPS[R(0, TIPS.length - 1)],
    process: `Cross-multiply: ${n1}×${d2}=${cross1}, ${d1}×${n2}=${cross2} → ${n1}/${d1} ${correctSym} ${n2}/${d2}`,
    fingerprint: fpPair("cmp", [n1, d1], [n2, d2], { commutative: false, sep: "?" }),
  };
}
