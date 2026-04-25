const CAP_BATTLE = 30;
const CAP_BOSS = 60;

export function pickQuestion(gen, key, diff, save, persist) {
  if (!save.seen) save.seen = {};
  const seen = save.seen[key] = save.seen[key] || [];
  const cap = key.startsWith("boss") ? CAP_BOSS : CAP_BATTLE;
  let q;
  for (let i = 0; i < 12; i++) {
    q = gen(diff);
    const fp = q && q.fingerprint;
    if (!fp || !seen.includes(fp)) {
      if (fp) {
        seen.push(fp);
        if (seen.length > cap) seen.shift();
      }
      persist(save);
      return q;
    }
  }
  if (seen.length >= cap * 0.9) {
    save.seen[key] = seen.slice(Math.floor(cap * 0.7));
    persist(save);
    return gen(diff);
  }
  const keep = Math.max(1, Math.floor(seen.length * 0.5));
  save.seen[key] = seen.slice(-keep);
  persist(save);
  return gen(diff);
}

export function adaptDiff(baseDiff, perfArr = []) {
  if (!Array.isArray(perfArr) || perfArr.length < 5) return baseDiff;
  const acc = perfArr.reduce((a, b) => a + b, 0) / perfArr.length;
  if (acc > 0.85) return Math.min(2, baseDiff + 1);
  if (acc < 0.5)  return Math.max(0, baseDiff - 1);
  return baseDiff;
}

export function recordPerf(save, key, correct, persist) {
  save.performance = save.performance || {};
  const arr = save.performance[key] = save.performance[key] || [];
  arr.push(correct ? 1 : 0);
  if (arr.length > 10) arr.shift();
  persist(save);
}
