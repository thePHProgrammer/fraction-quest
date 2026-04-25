import { genSimplify } from "../src/game/generators/simplify.js";
import { genUnlikeAdd } from "../src/game/generators/unlikeAdd.js";
import { genUnlikeSub } from "../src/game/generators/unlikeSub.js";
import { genMultiply } from "../src/game/generators/multiply.js";
import { genDivide } from "../src/game/generators/divide.js";
import { genCompare } from "../src/game/generators/compare.js";
import { genEquivalent } from "../src/game/generators/equivalent.js";
import { isEquivalent, parseFrac } from "../src/game/math.js";
import { pickQuestion } from "../src/game/dedup.js";

const gens = [
  ["simplify", genSimplify],
  ["unlikeAdd", genUnlikeAdd],
  ["unlikeSub", genUnlikeSub],
  ["multiply", genMultiply],
  ["divide", genDivide],
  ["compare", genCompare],
  ["equivalent", genEquivalent],
];

let failures = 0;

for (const [name, g] of gens) {
  for (let diff = 0; diff <= 2; diff++) {
    for (let i = 0; i < 60; i++) {
      const q = g(diff);
      if (!q.fingerprint) { console.error(`[${name}/${diff}] no fingerprint`); failures++; }
      if (!q.process) { console.error(`[${name}/${diff}] no process`); failures++; }
      if (q.choices.length !== 4 && q.type !== "mc-compare") { console.error(`[${name}/${diff}] choices=${q.choices.length}`); failures++; }
      if (q.type === "mc-compare" && q.choices.length !== 3) { console.error(`[${name}/${diff}] compare choices=${q.choices.length}`); failures++; }
      const correctCount = q.choices.filter((c) => c.isCorrect).length;
      if (correctCount !== 1) { console.error(`[${name}/${diff}] correctCount=${correctCount} q=${JSON.stringify(q)}`); failures++; }
      if (q.type === "mc-frac") {
        const correct = q.choices.find((c) => c.isCorrect);
        for (const c of q.choices) {
          if (c === correct) continue;
          if (isEquivalent([c.n, c.d], [correct.n, correct.d])) {
            console.error(`[${name}/${diff}] distractor ${c.n}/${c.d} equivalent to correct ${correct.n}/${correct.d}`);
            failures++;
          }
        }
      }
    }
  }
}

const tests = [
  ["1/2", [1, 2]],
  ["3/4", [3, 4]],
  ["5", [5, 1]],
  ["1 1/2", [3, 2]],
  ["2 3/4", [11, 4]],
  ["", null],
  ["abc", null],
  ["1/0", null],
];
for (const [input, expected] of tests) {
  const got = parseFrac(input);
  const ok = (expected === null && got === null) || (got && expected && got[0] === expected[0] && got[1] === expected[1]);
  if (!ok) { console.error(`parseFrac("${input}") = ${JSON.stringify(got)}, expected ${JSON.stringify(expected)}`); failures++; }
}

const save = { seen: {} };
const persist = () => {};
const seen = new Set();
let immediateRepeats = 0;
let prev = null;
for (let i = 0; i < 30; i++) {
  const q = pickQuestion(genSimplify, "test_world__0", 1, save, persist);
  if (prev && q.fingerprint === prev) immediateRepeats++;
  prev = q.fingerprint;
  seen.add(q.fingerprint);
}
if (immediateRepeats > 0) {
  console.error(`pickQuestion produced ${immediateRepeats} immediate repeat(s)`);
  failures++;
}
if (seen.size < 18) {
  console.error(`pickQuestion produced only ${seen.size} unique fingerprints in 30 calls (< 18)`);
  failures++;
}

if (failures > 0) {
  console.error(`\n${failures} failure(s)`);
  process.exit(1);
} else {
  console.log("All smoke checks passed.");
}
