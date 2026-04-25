const V2_KEY = "fq_save_v2";
const V3_KEY = "fq_save_v3";

const ensureShape = (s) => {
  s.stars = s.stars || {};
  s.tutSeen = s.tutSeen || {};
  s.seen = s.seen || {};
  s.performance = s.performance || {};
  if (typeof s.missionSeen !== "boolean") s.missionSeen = false;
  if (typeof s.xp !== "number") s.xp = 0;
  if (typeof s.lv !== "number") s.lv = 1;
  if (s.lang === undefined) s.lang = null;
  s.version = 3;
  return s;
};

export function loadSave() {
  try {
    const v3 = localStorage.getItem(V3_KEY);
    if (v3) return ensureShape(JSON.parse(v3));
  } catch (_) {}
  try {
    const v2 = localStorage.getItem(V2_KEY);
    if (v2) {
      const upgraded = ensureShape({ ...JSON.parse(v2) });
      try { localStorage.setItem(V3_KEY, JSON.stringify(upgraded)); } catch (_) {}
      return upgraded;
    }
  } catch (_) {}
  return ensureShape({});
}

export function saveSave(data) {
  try { localStorage.setItem(V3_KEY, JSON.stringify(data)); } catch (_) {}
}
