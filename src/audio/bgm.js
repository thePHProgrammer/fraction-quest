// 3-track procedural background music: overworld / battle / boss.
// Adapted from the design's BGM module.

const n2f = (n) => 440 * Math.pow(2, (n - 69) / 12);

const state = {
  ctx: null,
  master: null,
  active: null,
  timer: null,
  muted: false,
};

function ensureCtx() {
  if (state.ctx) return state.ctx;
  try {
    const Ctx = window.AudioContext || window.webkitAudioContext;
    if (!Ctx) return null;
    state.ctx = new Ctx();
    state.master = state.ctx.createGain();
    state.master.gain.value = state.muted ? 0 : 0.13;
    state.master.connect(state.ctx.destination);
  } catch (_) {
    return null;
  }
  return state.ctx;
}

function note(freq, t, dur, type = "sine", vol = 0.1) {
  const ctx = state.ctx;
  if (!ctx || state.muted) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(state.master);
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0, t);
  g.gain.linearRampToValueAtTime(vol, t + 0.015);
  g.gain.exponentialRampToValueAtTime(0.001, t + dur * 0.92);
  o.start(t); o.stop(t + dur + 0.05);
}

function noise(t, dur, vol = 0.05, hp = 800) {
  const ctx = state.ctx;
  if (!ctx || state.muted) return;
  const buf = ctx.createBuffer(1, Math.ceil(ctx.sampleRate * dur), ctx.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 1.5);
  const src = ctx.createBufferSource();
  const flt = ctx.createBiquadFilter();
  const g = ctx.createGain();
  src.buffer = buf; flt.type = "highpass"; flt.frequency.value = hp;
  src.connect(flt); flt.connect(g); g.connect(state.master);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + dur);
  src.start(t); src.stop(t + dur + 0.05);
}

function kick(t, vol = 0.1) {
  const ctx = state.ctx;
  if (!ctx || state.muted) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.connect(g); g.connect(state.master);
  o.type = "sine";
  o.frequency.setValueAtTime(160, t);
  o.frequency.exponentialRampToValueAtTime(38, t + 0.18);
  g.gain.setValueAtTime(vol, t); g.gain.exponentialRampToValueAtTime(0.001, t + 0.28);
  o.start(t); o.stop(t + 0.32);
}

function loopOverworld() {
  if (state.active !== "overworld" || !state.ctx) return;
  const now = state.ctx.currentTime, bpm = 72, b = 60 / bpm;
  const sc = [57, 60, 62, 64, 67, 69, 72].map(n2f);
  const mel = [4, 5, 6, 5, 4, 2, 0, 2, 4, 6, 7, 6, 4, 2, 1, 0];
  mel.forEach((si, i) => note(sc[si % sc.length], now + i * b * 0.5, b * 0.42, "sine", 0.08));
  [0, 2, 4, 2, 0, 3, 4, 3].forEach((si, i) => note(sc[si] * 1.5, now + i * b * 0.5 + b * 0.25, b * 0.35, "triangle", 0.04));
  for (let i = 0; i < 4; i++) {
    note(sc[0] / 2, now + i * b * 2, b * 1.85, "sine", 0.055);
    note(sc[2] / 2, now + i * b * 2 + b, b * 0.9, "sine", 0.03);
  }
  const ms = mel.length * b * 0.5 * 1000;
  state.timer = setTimeout(loopOverworld, ms - 100);
}

function loopBattle() {
  if (state.active !== "battle" || !state.ctx) return;
  const now = state.ctx.currentTime, bpm = 138, b = 60 / bpm;
  const sc = [62, 64, 65, 67, 69, 70, 72, 74].map(n2f);
  const mel = [7, 5, 4, 7, 5, 3, 4, 5, 7, 6, 5, 4, 3, 2, 3, 4];
  const bass = [0, 0, 3, 0, 2, 0, 3, 5];
  mel.forEach((si, i) => note(sc[si % sc.length], now + i * b * 0.25, b * 0.2, "square", 0.052));
  bass.forEach((si, i) => note(sc[si % sc.length] / 2, now + i * b * 0.5, b * 0.44, "sawtooth", 0.038));
  [4, 3, 4, 5, 4, 3, 2, 3].forEach((si, i) => note(sc[si % sc.length] * 2, now + i * b * 0.5 + b * 0.125, b * 0.18, "triangle", 0.025));
  [1, 3].forEach((beat) => noise(now + beat * b, 0.07, 0.055, 1500));
  for (let i = 0; i < 8; i++) noise(now + i * b * 0.5, 0.04, 0.022, 4000);
  [0, 2].forEach((beat) => kick(now + beat * b, 0.09));
  const ms = mel.length * b * 0.25 * 1000;
  state.timer = setTimeout(loopBattle, ms - 100);
}

function loopBoss() {
  if (state.active !== "boss" || !state.ctx) return;
  const now = state.ctx.currentTime, bpm = 100, b = 60 / bpm;
  const sc = [50, 53, 56, 59, 62, 65, 68].map(n2f);
  const mel = [4, 3, 2, 1, 0, 1, 2, 4, 3, 2, 1, 0, 2, 4, 3, 2];
  const bass = [0, 0, 1, 0, 2, 1, 0, 2];
  mel.forEach((si, i) => note(sc[si % sc.length], now + i * b * 0.25, b * 0.22, "square", 0.048));
  bass.forEach((si, i) => note(sc[si % sc.length] / 2, now + i * b * 0.5, b * 0.47, "sawtooth", 0.052));
  [2, 4, 3, 2, 4, 3, 2, 1].forEach((si, i) => note(sc[si % sc.length] * 4, now + i * b * 0.5 + b * 0.12, b * 0.2, "sine", 0.018));
  for (let i = 0; i < 4; i++) kick(now + i * b, 0.12);
  [1, 3].forEach((beat) => noise(now + beat * b, 0.09, 0.065, 1200));
  const ms = mel.length * b * 0.25 * 1000;
  state.timer = setTimeout(loopBoss, ms - 100);
}

export function initBGM() {
  ensureCtx();
  if (state.ctx?.state === "suspended") state.ctx.resume().catch(() => {});
}

export function stopBGM() {
  clearTimeout(state.timer);
  state.active = null;
}

export function playBGM(theme) {
  ensureCtx();
  if (!state.ctx || state.active === theme) return;
  stopBGM();
  state.active = theme;
  if (theme === "overworld") loopOverworld();
  else if (theme === "battle") loopBattle();
  else if (theme === "boss") loopBoss();
}

export function toggleBGM() {
  state.muted = !state.muted;
  if (state.master) state.master.gain.value = state.muted ? 0 : 0.13;
  return state.muted;
}

export function isMuted() {
  return state.muted;
}
