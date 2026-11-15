// Tiny synthesised sound effects (no audio files). Off by default; the AudioContext is only
// created after the player switches sound on, which is itself a user gesture.

let ctx = null;
let enabled = false;

function ensure() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") ctx.resume();
  return ctx;
}

function tone({ freq = 440, to = null, dur = 0.12, type = "square", vol = 0.08, delay = 0 }) {
  const c = ensure();
  if (!c) return;
  const t = c.currentTime + delay;
  const o = c.createOscillator();
  const g = c.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, t);
  if (to) o.frequency.exponentialRampToValueAtTime(to, t + dur);
  g.gain.setValueAtTime(vol, t);
  g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
  o.connect(g).connect(c.destination);
  o.start(t);
  o.stop(t + dur + 0.02);
}

function noise({ dur = 0.4, vol = 0.12, delay = 0, lp = 1800 }) {
  const c = ensure();
  if (!c) return;
  const t = c.currentTime + delay;
  const buf = c.createBuffer(1, Math.floor(c.sampleRate * dur), c.sampleRate);
  const d = buf.getChannelData(0);
  for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
  const src = c.createBufferSource();
  src.buffer = buf;
  const f = c.createBiquadFilter();
  f.type = "lowpass";
  f.frequency.value = lp;
  const g = c.createGain();
  g.gain.value = vol;
  src.connect(f).connect(g).connect(c.destination);
  src.start(t);
}

const SFX = {
  jump: () => tone({ freq: 300, to: 620, dur: 0.12, vol: 0.05 }),
  land: () => noise({ dur: 0.08, vol: 0.05, lp: 600 }),
  collect: () => { tone({ freq: 880, dur: 0.09, vol: 0.05 }); tone({ freq: 1320, dur: 0.14, vol: 0.05, delay: 0.07 }); },
  checkpoint: () => { tone({ freq: 523, dur: 0.1, vol: 0.05, type: "triangle" }); tone({ freq: 784, dur: 0.18, vol: 0.05, type: "triangle", delay: 0.09 }); },
  kick: () => { tone({ freq: 140, to: 60, dur: 0.14, type: "sine", vol: 0.2 }); noise({ dur: 0.06, vol: 0.08, lp: 900 }); },
  save: () => noise({ dur: 0.18, vol: 0.1, lp: 700 }),
  goal: () => { noise({ dur: 1.6, vol: 0.12, lp: 2400 }); [523, 659, 784, 1046].forEach((f, i) => tone({ freq: f, dur: 0.22, vol: 0.05, type: "triangle", delay: i * 0.1 })); },
  ui: () => tone({ freq: 660, dur: 0.05, vol: 0.03, type: "triangle" }),
};

export const audio = {
  setEnabled(on) {
    enabled = !!on;
    if (enabled) ensure();
    else if (ctx && ctx.state === "running") ctx.suspend();
  },
  get enabled() { return enabled; },
  play(name) {
    if (!enabled || !SFX[name]) return;
    try { SFX[name](); } catch (e) { /* audio is never essential */ }
  },
};
