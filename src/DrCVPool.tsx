import React from "react";
import {
  AbsoluteFill,
  Sequence,
  useCurrentFrame,
  useVideoConfig,
  interpolate,
  spring,
  Easing,
  staticFile,
} from "remotion";
import { Audio } from "@remotion/media";
import { DISPLAY, BODY, MONO, C } from "./theme";

const signal = "#7ef0ad";
const sfx = (n: string) => staticFile(`sfx/${n}.wav`);
const green = `linear-gradient(160deg, ${C.brand}, #0a3a24)`;

// ── Timeline (frames @ 30fps) — intense + fast ─────────────────────
const MW = 30;
const T = {
  counter: { from: 0, dur: 96 },
  pool: { from: 96, dur: 70 },
  montage: { from: 166, dur: MW * 4 }, // 120
  merit: { from: 286, dur: 64 },
  stats: { from: 350, dur: 84 },
  cta: { from: 434, dur: 140 },
};
export const POOL_TOTAL = T.cta.from + T.cta.dur; // 574 ≈ 19.1s

const useResp = () => {
  const { width, height } = useVideoConfig();
  const V = height > width;
  return { V, k: V ? 0.58 : 1, padX: V ? 64 : 150 };
};
const useSlam = (delay = 0, damping = 13, from = 1.18) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping, mass: 0.6 } });
  return {
    transform: `scale(${interpolate(s, [0, 1], [from, 1])})`,
    opacity: interpolate(frame - delay, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  };
};
const useRise = (delay = 0, dist = 34, damping = 200) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping } });
  return { opacity: interpolate(s, [0, 1], [0, 1]), transform: `translateY(${interpolate(s, [0, 1], [dist, 0])}px)` };
};
const outAt = (frame: number, dur: number, fade = 9) =>
  interpolate(frame, [dur - fade, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({ children, color = C.brand, size = 24 }) => (
  <div style={{ fontFamily: MONO, fontSize: size, letterSpacing: 7, textTransform: "uppercase", color }}>{children}</div>
);
const StethoGlyph: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3v6a5 5 0 0 0 10 0V3" />
    <circle cx={19} cy={14} r={2.4} />
    <path d="M10 14v1a7 7 0 0 0 7 7" />
  </svg>
);

// ── Scene 1: the counter (0 → 770+) ────────────────────────────────
const CounterScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { k } = useResp();
  const n = Math.round(
    interpolate(frame, [8, 74], [0, 770], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.12, 0.9, 0.2, 1) }),
  );
  const plus = interpolate(frame, [74, 82], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });
  const num = useSlam(2, 12, 1.3);
  const label = useRise(10, 22);
  return (
    <AbsoluteFill style={{ background: green, opacity: outAt(frame, T.counter.dur, 8), justifyContent: "center", alignItems: "center" }}>
      <div style={{ ...num, fontFamily: DISPLAY, fontWeight: 600, fontSize: 380 * k, color: C.white, lineHeight: 0.9, letterSpacing: -14 * k, display: "flex", alignItems: "flex-start" }}>
        {n.toLocaleString()}
        <span style={{ color: signal, opacity: plus, fontSize: 240 * k, marginTop: 20 * k }}>+</span>
      </div>
      <div style={{ ...label, marginTop: 10 }}>
        <Eyebrow color={signal} size={32 * (k < 1 ? 0.8 : 1)}>professionals diagnosed — free</Eyebrow>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: the talent pool ───────────────────────────────────────
const PoolScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { k } = useResp();
  const top = useRise(2, 22);
  const big = useSlam(8, 13, 1.16);
  const sub = useRise(22, 22);
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: outAt(frame, T.pool.dur, 9), justifyContent: "center", alignItems: "center" }}>
      <div style={{ ...top }}><Eyebrow color={C.inkSoft}>And every one of them joins</Eyebrow></div>
      <div style={{ ...big, fontFamily: DISPLAY, fontWeight: 600, fontSize: 168 * k, color: C.brand, letterSpacing: -6 * k, lineHeight: 0.95, marginTop: 14, textAlign: "center" }}>
        the talent pool.
      </div>
      <div style={{ ...sub, fontFamily: BODY, fontSize: 40 * (k < 1 ? 0.82 : 1), color: C.inkSoft, marginTop: 24, textAlign: "center", padding: "0 40px" }}>
        Where real employers come to hire.
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: the journey montage ───────────────────────────────────
const MONTAGE = [
  { n: "01", word: "Diagnosed", bg: C.bg, color: C.brand },
  { n: "02", word: "Matched", bg: C.brand, color: C.white },
  { n: "03", word: "Recommended", bg: C.ink, color: signal },
  { n: "04", word: "Hired", bg: C.brand, color: C.white },
];
const Mword: React.FC<{ n: string; word: string; bg: string; color: string; last: boolean }> = ({ n, word, bg, color, last }) => {
  const frame = useCurrentFrame();
  const { k, padX } = useResp();
  const slam = useSlam(0, last ? 10 : 12, last ? 1.3 : 1.14);
  const tag = useRise(3, 16);
  const size = (word.length > 9 ? 168 : last ? 250 : 220) * k;
  return (
    <AbsoluteFill style={{ background: bg, justifyContent: "center", alignItems: "center", opacity: outAt(frame, MW, 5) }}>
      <div style={{ ...slam, fontFamily: DISPLAY, fontWeight: 600, fontSize: size, color, letterSpacing: -8 * k, lineHeight: 1, textAlign: "center" }}>{word}{last ? "." : ""}</div>
      <div style={{ ...tag, position: "absolute", top: 90, left: padX }}><Eyebrow color={color} size={26}>{n} / 04</Eyebrow></div>
    </AbsoluteFill>
  );
};
const MontageScene: React.FC = () => (
  <AbsoluteFill>
    {MONTAGE.map((m, i) => (
      <Sequence key={m.n} from={i * MW} durationInFrames={MW} layout="none">
        <Mword {...m} last={i === MONTAGE.length - 1} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

// ── Scene 4: the honest hook ───────────────────────────────────────
const MeritScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { k } = useResp();
  const l1 = useRise(2, 26);
  const l2 = useSlam(12, 13, 1.12);
  return (
    <AbsoluteFill style={{ background: green, opacity: outAt(frame, T.merit.dur, 9), justifyContent: "center", alignItems: "center", padding: "0 60px" }}>
      <div style={{ ...l1, fontFamily: BODY, fontSize: 42 * (k < 1 ? 0.82 : 1), color: "#ffffffcc", marginBottom: 18, textAlign: "center" }}>
        Put forward on merit — not a black box.
      </div>
      <div style={{ ...l2, fontFamily: DISPLAY, fontWeight: 600, fontSize: 92 * k, color: C.white, letterSpacing: -3 * k, lineHeight: 0.98, textAlign: "center" }}>
        Companies pay only
        <br />
        when they <span style={{ color: signal }}>hire.</span>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 5: the proof slam ────────────────────────────────────────
const STATS = [
  { v: "770+", l: "diagnosed" },
  { v: "9", l: "boards matched live" },
  { v: "Every", l: "profession, every industry" },
];
const Stat: React.FC<{ v: string; l: string; delay: number }> = ({ v, l, delay }) => {
  const slam = useSlam(delay, 12, 1.2);
  return (
    <div style={{ ...slam, borderLeft: `3px solid ${C.brand}`, paddingLeft: 26 }}>
      <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 110, color: C.ink, lineHeight: 0.92, letterSpacing: -3 }}>{v}</div>
      <div style={{ marginTop: 10 }}><Eyebrow color={C.inkSoft} size={20}>{l}</Eyebrow></div>
    </div>
  );
};
const StatsScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { V, padX } = useResp();
  const eb = useRise(2, 16);
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: outAt(frame, T.stats.dur, 10), justifyContent: "center", padding: `0 ${padX}px` }}>
      <div style={{ ...eb, marginBottom: 40 }}><Eyebrow>The proof</Eyebrow></div>
      <div style={{ display: "flex", flexDirection: V ? "column" : "row", gap: V ? 44 : 70, alignItems: V ? "flex-start" : "center" }}>
        {STATS.map((s, i) => (
          <Stat key={s.l} {...s} delay={4 + i * 6} />
        ))}
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 6: urgency CTA ───────────────────────────────────────────
const CtaScene: React.FC = () => {
  const { k } = useResp();
  const wm = useRise(2, 22);
  const head = useSlam(10, 12, 1.2);
  const sub = useRise(24, 22);
  const pill = useRise(32, 22);
  const fine = useRise(40, 16);
  return (
    <AbsoluteFill style={{ background: green, justifyContent: "center", alignItems: "center", gap: 30, padding: "0 50px" }}>
      <div style={{ ...wm, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 54, height: 54, borderRadius: 15, background: "#ffffff1a", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <StethoGlyph size={28} color={signal} />
        </div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 44, color: C.white }}>Dr <span style={{ color: signal }}>CV</span></div>
      </div>
      <div style={{ ...head, fontFamily: DISPLAY, fontWeight: 600, fontSize: 134 * (k < 1 ? 0.7 : 1), lineHeight: 0.9, letterSpacing: -5, color: C.white, textAlign: "center" }}>
        Get yours <span style={{ color: signal }}>today.</span>
      </div>
      <div style={{ ...sub, fontFamily: BODY, fontSize: 38 * (k < 1 ? 0.82 : 1), color: "#ffffffcc", textAlign: "center" }}>
        Join the talent pool — free, in 30 seconds.
      </div>
      <div style={{ ...pill, display: "flex", alignItems: "center", gap: 14, background: C.white, color: C.brand, fontFamily: BODY, fontWeight: 700, fontSize: 38 * (k < 1 ? 0.85 : 1), padding: "20px 46px", borderRadius: 999 }}>
        cv.belycan.com <span>→</span>
      </div>
      <div style={{ ...fine }}><Eyebrow color="#ffffff99" size={19}>No card · honest, never cruel</Eyebrow></div>
    </AbsoluteFill>
  );
};

// ── Master ─────────────────────────────────────────────────────────
export const DrCVPool: React.FC = () => {
  const scene = (key: keyof typeof T, Comp: React.FC) => (
    <Sequence from={T[key].from} durationInFrames={T[key].dur}>
      <Comp />
    </Sequence>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {scene("counter", CounterScene)}
      {scene("pool", PoolScene)}
      {scene("montage", MontageScene)}
      {scene("merit", MeritScene)}
      {scene("stats", StatsScene)}
      {scene("cta", CtaScene)}

      {/* music bed (Inspired — Kevin MacLeod, CC-BY) */}
      <Audio
        src={staticFile("music/bed.mp3")}
        volume={(f) => interpolate(f, [0, 12, POOL_TOTAL - 34, POOL_TOTAL], [0, 0.62, 0.62, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />

      {/* sound design */}
      <Sequence from={0} layout="none"><Audio src={sfx("riser")} volume={0.4} /></Sequence>
      <Sequence from={20} layout="none"><Audio src={sfx("page-turn")} volume={0.22} /></Sequence>
      <Sequence from={44} layout="none"><Audio src={sfx("page-turn")} volume={0.24} /></Sequence>
      <Sequence from={66} layout="none"><Audio src={sfx("page-turn")} volume={0.26} /></Sequence>
      <Sequence from={T.counter.dur - 14} layout="none"><Audio src={sfx("impact")} volume={0.55} /></Sequence>
      <Sequence from={T.counter.dur - 12} layout="none"><Audio src={sfx("ding")} volume={0.4} /></Sequence>
      <Sequence from={T.pool.from + 8} layout="none"><Audio src={sfx("whoosh")} volume={0.42} /></Sequence>
      {MONTAGE.map((m, i) => (
        <Sequence key={m.n} from={T.montage.from + i * MW} layout="none">
          <Audio src={sfx(i === MONTAGE.length - 1 ? "impact" : i % 2 === 0 ? "page-turn" : "switch")} volume={i === MONTAGE.length - 1 ? 0.55 : 0.34} />
        </Sequence>
      ))}
      <Sequence from={T.merit.from + 12} layout="none"><Audio src={sfx("confirm")} volume={0.4} /></Sequence>
      {STATS.map((s, i) => (
        <Sequence key={s.l} from={T.stats.from + 4 + i * 6} layout="none">
          <Audio src={sfx("switch")} volume={0.3} />
        </Sequence>
      ))}
      <Sequence from={T.cta.from - 18} layout="none"><Audio src={sfx("riser")} volume={0.4} /></Sequence>
      <Sequence from={T.cta.from + 10} layout="none"><Audio src={sfx("impact")} volume={0.55} /></Sequence>
    </AbsoluteFill>
  );
};
