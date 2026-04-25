let sharedCtx = null;
let sharedGain = null;
let muted = false;

const ensureCtx = () => {
  if (!sharedCtx) {
    try {
      const Ctx = window.AudioContext || window.webkitAudioContext;
      if (!Ctx) return null;
      sharedCtx = new Ctx();
      sharedGain = sharedCtx.createGain();
      sharedGain.gain.value = 0.18;
      sharedGain.connect(sharedCtx.destination);
    } catch (_) { return null; }
  }
  if (sharedCtx.state === "suspended") {
    sharedCtx.resume().catch(() => {});
  }
  return sharedCtx;
};

export const setSfxMuted = (m) => {
  muted = !!m;
  if (sharedGain) sharedGain.gain.value = muted ? 0 : 0.18;
};

const tone = (freq, dur, type = "square", t0 = 0, vol = 1) => {
  const ctx = ensureCtx(); if (!ctx || muted) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  const start = ctx.currentTime + t0;
  o.type = type; o.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, start);
  g.gain.exponentialRampToValueAtTime(vol, start + 0.005);
  g.gain.exponentialRampToValueAtTime(0.0001, start + dur);
  o.connect(g); g.connect(sharedGain);
  o.start(start); o.stop(start + dur + 0.02);
};

const noiseBurst = (dur, t0 = 0, vol = 0.4) => {
  const ctx = ensureCtx(); if (!ctx || muted) return;
  const buf = ctx.createBuffer(1, Math.max(1, Math.floor(ctx.sampleRate * dur)), ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < data.length; i++) data[i] = (Math.random() * 2 - 1) * (1 - i / data.length);
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.value = vol;
  src.connect(g); g.connect(sharedGain);
  src.start(ctx.currentTime + t0);
};

export const sfx = {
  correct() { tone(523.25, 0.09, "square", 0, 0.6); tone(659.25, 0.09, "square", 0.07, 0.6); tone(783.99, 0.13, "square", 0.14, 0.7); },
  wrong()   { tone(311.13, 0.10, "square", 0, 0.6); tone(246.94, 0.18, "square", 0.09, 0.6); },
  levelUp() { tone(523.25, 0.10, "square", 0, 0.7); tone(659.25, 0.10, "square", 0.10, 0.7); tone(783.99, 0.10, "square", 0.20, 0.7); tone(1046.50, 0.20, "square", 0.30, 0.8); },
  bossRoar(){ tone(82.41, 0.40, "sawtooth", 0, 0.9); tone(110, 0.30, "sawtooth", 0.10, 0.7); noiseBurst(0.55, 0, 0.5); },
  click()   { tone(880, 0.04, "square", 0, 0.4); },
  thunder() { noiseBurst(0.45, 0, 0.7); tone(60, 0.35, "sawtooth", 0.02, 0.6); },
};
