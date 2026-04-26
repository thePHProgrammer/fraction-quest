// Central registry: world list (cinematic order, mapped to villains) + generator map.

import { R, simplify, shuf } from "./math";
import { fpSingle, fpPair } from "./fingerprint";
import { NEW_GENS } from "./generators";

const TIPS = {
  proper: ["A proper fraction has a top SMALLER than the bottom (less than 1)."],
  improper: ["An improper fraction has a top GREATER OR EQUAL to the bottom."],
  mixed: ["A mixed number is a whole + a proper fraction."],
  add: ["Same denominator? Add the tops, keep the bottom."],
  sub: ["Same denominator? Subtract the tops, keep the bottom."],
};

// ── Same-denominator (legacy) generators ported from the original App.jsx ──

export function genProper(diff = 0) {
  const maxD = diff === 0 ? 5 : diff === 1 ? 10 : 16;
  const d = R(3, maxD), n = R(1, d - 1);
  const w = [];
  while (w.length < 3) {
    const wd = R(2, maxD), wn = wd + R(0, 4);
    if (!w.find((x) => x.n === wn && x.d === wd) && wn !== n) w.push({ n: wn, d: wd, isCorrect: false });
  }
  return {
    type: "mc-frac",
    instruction: "Which one is a PROPER fraction? (top < bottom) 🎯",
    choices: shuf([{ n, d, isCorrect: true }, ...w]),
    answer: { n, d },
    hint: TIPS.proper[0],
    process: `${n} < ${d} → ${n}/${d} is proper.`,
    fingerprint: fpSingle("prop", [n, d]),
  };
}

export function genImproper(diff = 0) {
  const maxD = diff === 0 ? 5 : diff === 1 ? 8 : 12;
  const d = R(2, maxD), w2 = R(1, diff === 0 ? 3 : 5), ex = R(1, d - 1), n = w2 * d + ex;
  const ws = [];
  while (ws.length < 3) {
    const ww = R(1, 4), wn = R(1, d - 1), wd = d + R(-1, 2) || d;
    if (!ws.find((x) => x.w === ww && x.n === wn)) ws.push({ w: ww, n: wn, d: wd, isCorrect: false });
  }
  return {
    type: "mc-mixed",
    instruction: "Convert this improper fraction to a mixed number! 🔄",
    displayFrac: { n, d },
    choices: shuf([{ w: w2, n: ex, d, isCorrect: true }, ...ws]),
    answer: { w: w2, n: ex, d },
    hint: TIPS.improper[0],
    process: `${n} ÷ ${d} = ${w2} R ${ex} → ${w2} ${ex}/${d}`,
    fingerprint: fpSingle("imp", [n, d]),
  };
}

export function genMixed(diff = 0) {
  const maxD = diff === 0 ? 5 : diff === 1 ? 8 : 12;
  const d = R(2, maxD), w2 = R(1, diff === 0 ? 3 : 5), n = R(1, d - 1), ansN = w2 * d + n;
  const ws = [];
  while (ws.length < 3) {
    const wn = ansN + R(-3, 4) || ansN + 1, wd = d + R(-1, 2) || d;
    if (wn > 0 && wd > 0 && !(wn === ansN && wd === d) && !ws.find((x) => x.n === wn && x.d === wd)) ws.push({ n: wn, d: wd, isCorrect: false });
  }
  return {
    type: "mc-frac",
    instruction: "Convert this mixed number to an improper fraction! 🔄",
    displayMixed: { w: w2, n, d },
    choices: shuf([{ n: ansN, d, isCorrect: true }, ...ws]),
    answer: { n: ansN, d },
    hint: TIPS.mixed[0],
    process: `(${w2}×${d})+${n} = ${ansN} → ${ansN}/${d}`,
    fingerprint: `mxd|${w2}+${n}/${d}`,
  };
}

export function genAdd(diff = 0) {
  const maxD = diff === 0 ? 7 : diff === 1 ? 12 : 18;
  const d = R(2, maxD), n1 = R(1, d - 1), n2 = R(1, d - 1);
  const [ansN, ansD] = simplify(n1 + n2, d);
  const ch = shuf([
    { n: ansN, d: ansD, isCorrect: true },
    { n: n1 + n2, d: d * 2, isCorrect: false },
    { n: ansN + R(1, 3), d: ansD, isCorrect: false },
    { n: Math.abs(n1 - n2) || 1, d, isCorrect: false },
  ]);
  return {
    type: "mc-frac",
    instruction: "Add the fractions! ➕",
    displayOp: { n1, d1: d, op: "+", n2, d2: d },
    choices: ch,
    answer: { n: ansN, d: ansD },
    hint: TIPS.add[0],
    process: `${n1}/${d} + ${n2}/${d} = ${n1 + n2}/${d} → ${ansN}/${ansD}`,
    fingerprint: fpPair("addS", [n1, d], [n2, d], { commutative: true, sep: "+" }),
  };
}

export function genSub(diff = 0) {
  const maxD = diff === 0 ? 7 : diff === 1 ? 12 : 18;
  const d = R(2, maxD), n1 = R(2, d - 1), n2 = R(1, n1 - 1);
  const [ansN, ansD] = simplify(n1 - n2, d);
  const ch = shuf([
    { n: ansN, d: ansD, isCorrect: true },
    { n: n1 + n2, d, isCorrect: false },
    { n: ansN + R(1, 3), d: ansD, isCorrect: false },
    { n: Math.max(1, ansN - R(1, 2)), d: ansD, isCorrect: false },
  ]);
  return {
    type: "mc-frac",
    instruction: "Subtract the fractions! ➖",
    displayOp: { n1, d1: d, op: "−", n2, d2: d },
    choices: ch,
    answer: { n: ansN, d: ansD },
    hint: TIPS.sub[0],
    process: `${n1}/${d} − ${n2}/${d} = ${n1 - n2}/${d} → ${ansN}/${ansD}`,
    fingerprint: fpPair("subS", [n1, d], [n2, d], { commutative: false, sep: "-" }),
  };
}

// ── Generator map ────────────────────────────────────────────

export const GENS = {
  proper: genProper,
  improper: genImproper,
  mixed: genMixed,
  add: genAdd,
  sub: genSub,
  ...NEW_GENS,
};

// ── World order on the map (12 worlds + boss) ───────────────
// Order matches a learning-friendly sequence: identity → conversions → like-ops → unlike-ops → multiply/divide → simplify/compare/equivalent

export const WORLDS = [
  { id: "proper",     name: { EN: "Proper Plains",            TL: "Mga Kapatagan ng Tama" },         icon: "🗡️",  levels: [{}, {}, {}] },
  { id: "improper",   name: { EN: "Improper Isle",            TL: "Pulo ng Di-wasto" },              icon: "🏝️",  levels: [{}, {}, {}] },
  { id: "mixed",      name: { EN: "Mixed Mountain",           TL: "Bundok ng Halo-halo" },            icon: "⛰️",  levels: [{}, {}, {}] },
  { id: "add",        name: { EN: "Addition Arch",            TL: "Arko ng Pagdaragdag" },            icon: "➕",  levels: [{}, {}, {}] },
  { id: "sub",        name: { EN: "Subtraction Swamp",        TL: "Latian ng Pagbabawas" },           icon: "➖",  levels: [{}, {}, {}] },
  { id: "unlikeAdd",  name: { EN: "Unlike Plains",            TL: "Mga Kapatagan ng Magkaiba" },      icon: "🌾",  levels: [{}, {}, {}] },
  { id: "unlikeSub",  name: { EN: "Difference Caverns",       TL: "Yungib ng Kaibahan" },             icon: "🕳️",  levels: [{}, {}, {}] },
  { id: "multiply",   name: { EN: "Multiplication Mesa",      TL: "Mesa ng Pagpaparami" },            icon: "✖️",  levels: [{}, {}, {}] },
  { id: "divide",     name: { EN: "Division Desert",          TL: "Disyerto ng Hatian" },             icon: "➗",  levels: [{}, {}, {}] },
  { id: "simplify",   name: { EN: "Lowest Terms Labyrinth",   TL: "Labirinto ng Pinakaliit" },        icon: "✂️",  levels: [{}, {}, {}] },
  { id: "compare",    name: { EN: "Compare Crossroads",       TL: "Sangandaan ng Paghahambing" },     icon: "🔍",  levels: [{}, {}, {}] },
  { id: "equivalent", name: { EN: "Equivalent Echo",          TL: "Alingawngaw ng Katumbas" },        icon: "🟰",   levels: [{}, {}, {}] },
];

export const BOSS_DEDUP_KEY = "boss__main";
