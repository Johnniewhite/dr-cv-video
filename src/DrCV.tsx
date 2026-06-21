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

// ── Timeline (frames @ 30fps) — fast, punchy ───────────────────────
const MW = 22; // montage word duration
const T = {
  hook1: { from: 0, dur: 46 },
  hook2: { from: 46, dur: 46 },
  brand: { from: 92, dur: 52 },
  diag: { from: 144, dur: 98 },
  montage: { from: 242, dur: MW * 5 }, // 110
  payoff: { from: 352, dur: 110 },
  cta: { from: 462, dur: 120 },
};
export const TOTAL = T.cta.from + T.cta.dur; // 582 ≈ 19.4s

const sfx = (n: string) => staticFile(`sfx/${n}.wav`);
const signal = "#7ef0ad";

// responsive: vertical (9:16) scales type down + reflows
const useResp = () => {
  const { width, height } = useVideoConfig();
  const V = height > width;
  return { V, k: V ? 0.58 : 1, padX: V ? 64 : 150 };
};

// ── helpers ────────────────────────────────────────────────────────
const useSlam = (delay = 0, damping = 14, from = 1.16) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping, mass: 0.6 } });
  return {
    transform: `scale(${interpolate(s, [0, 1], [from, 1])})`,
    opacity: interpolate(frame - delay, [0, 5], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp" }),
  };
};
const useRise = (delay = 0, dist = 38, damping = 200) => {
  const frame = useCurrentFrame();
  const { fps } = useVideoConfig();
  const s = spring({ frame: frame - delay, fps, config: { damping } });
  return {
    opacity: interpolate(s, [0, 1], [0, 1]),
    transform: `translateY(${interpolate(s, [0, 1], [dist, 0])}px)`,
  };
};
const outAt = (frame: number, dur: number, fade = 10) =>
  interpolate(frame, [dur - fade, dur], [1, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" });

const Eyebrow: React.FC<{ children: React.ReactNode; color?: string; size?: number }> = ({
  children,
  color = C.brand,
  size = 24,
}) => (
  <div style={{ fontFamily: MONO, fontSize: size, letterSpacing: 7, textTransform: "uppercase", color }}>
    {children}
  </div>
);

// ── Scene 1: the 6-second hook ─────────────────────────────────────
const Hook1: React.FC = () => {
  const frame = useCurrentFrame();
  const { k } = useResp();
  const six = useSlam(2, 11, 1.4);
  const sweep = interpolate(frame, [4, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const sub = useRise(14, 24);
  const box = 460 * (k < 1 ? 0.85 : 1);
  const r = box / 2 - 40;
  const circ = 2 * Math.PI * r;
  return (
    <AbsoluteFill style={{ background: C.ink, opacity: outAt(frame, T.hook1.dur, 8), justifyContent: "center", alignItems: "center" }}>
      <div style={{ position: "relative", width: box, height: box, display: "flex", alignItems: "center", justifyContent: "center" }}>
        <svg width={box} height={box} style={{ position: "absolute", transform: "rotate(-90deg)" }}>
          <circle cx={box / 2} cy={box / 2} r={r} fill="none" stroke="#ffffff14" strokeWidth={10} />
          <circle cx={box / 2} cy={box / 2} r={r} fill="none" stroke={signal} strokeWidth={10} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - sweep)} />
        </svg>
        <div style={{ ...six, fontFamily: DISPLAY, fontWeight: 600, fontSize: 320 * (k < 1 ? 0.85 : 1), color: C.white, lineHeight: 1 }}>6</div>
      </div>
      <div style={{ ...sub, marginTop: 8, textAlign: "center" }}>
        <Eyebrow color={signal} size={30}>seconds</Eyebrow>
        <div style={{ fontFamily: BODY, fontSize: 34 * (k < 1 ? 0.85 : 1), color: "#ffffffcc", marginTop: 18 }}>
          That&apos;s all a recruiter gives your CV.
        </div>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 2: overlooked ────────────────────────────────────────────
const Hook2: React.FC = () => {
  const frame = useCurrentFrame();
  const { k } = useResp();
  const top = useRise(2, 22);
  const word = useSlam(6, 13, 1.12);
  const strike = interpolate(frame, [16, 40], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.7, 0, 0.2, 1) });
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: outAt(frame, T.hook2.dur, 8), justifyContent: "center", alignItems: "center" }}>
      <div style={{ ...top, marginBottom: 18 }}><Eyebrow color={C.inkSoft}>Most never make the cut</Eyebrow></div>
      <div style={{ ...word, position: "relative", fontFamily: DISPLAY, fontWeight: 600, fontSize: 220 * k, color: C.ink, letterSpacing: -8 * k, lineHeight: 1 }}>
        Overlooked
        <span style={{ position: "absolute", left: "-1%", right: "-1%", top: "54%", height: 18 * k, borderRadius: 999, background: C.brandSoft, transform: `scaleX(${strike})`, transformOrigin: "left center" }} />
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 3: brand slam ────────────────────────────────────────────
const StethoGlyph: React.FC<{ size: number; color: string }> = ({ size, color }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none" stroke={color} strokeWidth={2.1} strokeLinecap="round" strokeLinejoin="round">
    <path d="M5 3v6a5 5 0 0 0 10 0V3" />
    <circle cx={19} cy={14} r={2.4} />
    <path d="M10 14v1a7 7 0 0 0 7 7" />
  </svg>
);

const BrandScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { k } = useResp();
  const mark = useSlam(2, 12, 1.3);
  const sub = useRise(14, 24);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.brand}, #0a3a24)`, opacity: outAt(frame, T.brand.dur, 8), justifyContent: "center", alignItems: "center" }}>
      <div style={{ ...mark, display: "flex", alignItems: "center", gap: 26 * k }}>
        <div style={{ width: 92 * k, height: 92 * k, borderRadius: 24 * k, background: "#ffffff14", display: "flex", alignItems: "center", justifyContent: "center" }}>
          <StethoGlyph size={48 * k} color={signal} />
        </div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 150 * k, color: C.white, letterSpacing: -5 * k }}>
          Dr <span style={{ color: signal }}>CV</span>
        </div>
      </div>
      <div style={{ ...sub, fontFamily: BODY, fontSize: 38 * (k < 1 ? 0.8 : 1), color: "#ffffffcc", marginTop: 30, textAlign: "center", padding: "0 40px" }}>
        An honest second opinion on your CV.
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 4: diagnosis ─────────────────────────────────────────────
const ScoreRing: React.FC = () => {
  const frame = useCurrentFrame();
  const r = 130;
  const circ = 2 * Math.PI * r;
  const prog = interpolate(frame, [6, 46], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const shown = Math.round(prog * 71);
  return (
    <div style={{ position: "relative", width: 300, height: 300, flexShrink: 0 }}>
      <svg width={300} height={300} style={{ transform: "rotate(-90deg)" }}>
        <circle cx={150} cy={150} r={r} fill="none" stroke={C.line} strokeWidth={16} />
        <circle cx={150} cy={150} r={r} fill="none" stroke={C.brand} strokeWidth={16} strokeLinecap="round" strokeDasharray={circ} strokeDashoffset={circ * (1 - prog * 0.71)} />
      </svg>
      <div style={{ position: "absolute", inset: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center" }}>
        <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 100, color: C.ink, lineHeight: 1 }}>{shown}</div>
        <Eyebrow color={C.inkSoft} size={16}>/ 100</Eyebrow>
      </div>
    </div>
  );
};
const Meter: React.FC<{ label: string; score: number; delay: number; vertical: boolean }> = ({ label, score, delay, vertical }) => {
  const frame = useCurrentFrame();
  const w = interpolate(frame, [delay, delay + 26], [0, score], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.16, 1, 0.3, 1) });
  const r = useRise(delay - 4, 18);
  return (
    <div style={{ ...r, marginBottom: 26, width: vertical ? "100%" : 560, maxWidth: 620 }}>
      <div style={{ display: "flex", justifyContent: "space-between", marginBottom: 10 }}>
        <span style={{ fontFamily: BODY, fontSize: 27, color: C.inkSoft }}>{label}</span>
        <span style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 27, color: C.ink }}>{Math.round(w)}</span>
      </div>
      <div style={{ height: 12, borderRadius: 999, background: C.brandFaint, overflow: "hidden" }}>
        <div style={{ height: "100%", width: `${w}%`, borderRadius: 999, background: `linear-gradient(90deg, ${C.brandSoft}, ${C.brand})` }} />
      </div>
    </div>
  );
};
const DiagScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { V, padX } = useResp();
  const eb = useRise(2, 16);
  const title = useRise(8, 34);
  const ring = <ScoreRing />;
  const text = (
    <div style={{ flex: V ? "0 0 auto" : 1, width: V ? "100%" : undefined, display: "flex", flexDirection: "column", alignItems: V ? "center" : "flex-start", textAlign: V ? "center" : "left" }}>
      <div style={{ ...eb, marginBottom: 22 }}><Eyebrow>Free · 30 seconds</Eyebrow></div>
      <div style={{ ...title, fontFamily: DISPLAY, fontWeight: 600, color: C.ink, fontSize: 72, lineHeight: 0.98, letterSpacing: -3, marginBottom: 40 }}>
        Your CV, scored
        <br />
        honestly.
      </div>
      <Meter label="Impact & results" score={82} delay={16} vertical={V} />
      <Meter label="Clarity & structure" score={74} delay={24} vertical={V} />
      <Meter label="Keyword match" score={61} delay={32} vertical={V} />
    </div>
  );
  return (
    <AbsoluteFill style={{ background: C.bg, opacity: outAt(frame, T.diag.dur, 10) }}>
      <AbsoluteFill style={{ flexDirection: V ? "column" : "row", alignItems: "center", justifyContent: "center", padding: `0 ${padX}px`, gap: V ? 56 : 100 }}>
        {V ? ring : null}
        {text}
        {V ? null : ring}
      </AbsoluteFill>
    </AbsoluteFill>
  );
};

// ── Scene 5: the pipeline montage (full-frame word slams) ──────────
const MONTAGE = [
  { n: "01", word: "Diagnose", bg: C.bg, color: C.brand },
  { n: "02", word: "Rewrite", bg: C.brand, color: C.white },
  { n: "03", word: "Match", bg: C.ink, color: signal },
  { n: "04", word: "Tailor", bg: C.brandFaint, color: C.brand },
  { n: "05", word: "Prep", bg: C.brand, color: C.white },
];
const Mword: React.FC<{ n: string; word: string; bg: string; color: string }> = ({ n, word, bg, color }) => {
  const frame = useCurrentFrame();
  const { k, padX } = useResp();
  const slam = useSlam(0, 12, 1.14);
  const tag = useRise(3, 16);
  return (
    <AbsoluteFill style={{ background: bg, justifyContent: "center", alignItems: "center", opacity: outAt(frame, MW, 5) }}>
      <div style={{ ...slam, fontFamily: DISPLAY, fontWeight: 600, fontSize: 230 * k, color, letterSpacing: -8 * k, lineHeight: 1 }}>{word}</div>
      <div style={{ ...tag, position: "absolute", top: 90, left: padX }}><Eyebrow color={color} size={26}>{n} / 06</Eyebrow></div>
    </AbsoluteFill>
  );
};
const MontageScene: React.FC = () => (
  <AbsoluteFill>
    {MONTAGE.map((m, i) => (
      <Sequence key={m.n} from={i * MW} durationInFrames={MW} layout="none">
        <Mword {...m} />
      </Sequence>
    ))}
  </AbsoluteFill>
);

// ── Scene 6: payoff (the brand line) ───────────────────────────────
const PayoffScene: React.FC = () => {
  const frame = useCurrentFrame();
  const { k } = useResp();
  const l1 = useRise(2, 30);
  const strike = interpolate(frame, [8, 30], [0, 1], { extrapolateLeft: "clamp", extrapolateRight: "clamp", easing: Easing.bezier(0.7, 0, 0.2, 1) });
  const l2 = useSlam(20, 12, 1.2);
  return (
    <AbsoluteFill style={{ background: `linear-gradient(160deg, ${C.brand}, #0a3a24)`, opacity: outAt(frame, T.payoff.dur, 10), justifyContent: "center", alignItems: "center" }}>
      <div style={{ ...l1, position: "relative", fontFamily: DISPLAY, fontWeight: 600, fontSize: 86 * k, color: "#ffffff99", letterSpacing: -3 * k, lineHeight: 1 }}>
        From overlooked
        <span style={{ position: "absolute", left: "-1%", right: "-1%", top: "52%", height: 9 * k, borderRadius: 999, background: signal, transform: `scaleX(${strike})`, transformOrigin: "left center" }} />
      </div>
      <div style={{ ...l2, fontFamily: DISPLAY, fontWeight: 600, fontSize: 210 * k, color: C.white, letterSpacing: -8 * k, lineHeight: 0.9, marginTop: 14 }}>
        to <span style={{ color: signal }}>hired.</span>
      </div>
    </AbsoluteFill>
  );
};

// ── Scene 7: CTA ───────────────────────────────────────────────────
const CtaScene: React.FC = () => {
  const { k } = useResp();
  const wm = useRise(2, 24);
  const head = useSlam(10, 14, 1.15);
  const pill = useRise(24, 24);
  const sub = useRise(32, 16);
  return (
    <AbsoluteFill style={{ background: C.bg, justifyContent: "center", alignItems: "center", gap: 36, padding: "0 50px" }}>
      <div style={{ ...wm, display: "flex", alignItems: "center", gap: 16 }}>
        <div style={{ width: 56, height: 56, borderRadius: 16, background: C.brand, display: "flex", alignItems: "center", justifyContent: "center" }}>
          <StethoGlyph size={30} color={C.white} />
        </div>
        <div style={{ fontFamily: DISPLAY, fontWeight: 600, fontSize: 48, color: C.ink }}>Dr <span style={{ color: C.brand }}>CV</span></div>
      </div>
      <div style={{ ...head, fontFamily: DISPLAY, fontWeight: 600, fontSize: 116 * (k < 1 ? 0.74 : 1), lineHeight: 0.92, letterSpacing: -4, color: C.ink, textAlign: "center" }}>
        Get diagnosed <span style={{ color: C.brand }}>free.</span>
      </div>
      <div style={{ ...pill, display: "flex", alignItems: "center", gap: 14, background: C.brand, color: C.white, fontFamily: BODY, fontWeight: 600, fontSize: 36 * (k < 1 ? 0.85 : 1), padding: "20px 44px", borderRadius: 999 }}>
        cv.belycan.com <span>→</span>
      </div>
      <div style={{ ...sub }}><Eyebrow color={C.inkSoft} size={20}>Free · no card · honest, never cruel</Eyebrow></div>
    </AbsoluteFill>
  );
};

// ── Master ─────────────────────────────────────────────────────────
export const DrCV: React.FC = () => {
  const scene = (key: keyof typeof T, Comp: React.FC) => (
    <Sequence from={T[key].from} durationInFrames={T[key].dur}>
      <Comp />
    </Sequence>
  );
  return (
    <AbsoluteFill style={{ backgroundColor: C.bg }}>
      {scene("hook1", Hook1)}
      {scene("hook2", Hook2)}
      {scene("brand", BrandScene)}
      {scene("diag", DiagScene)}
      {scene("montage", MontageScene)}
      {scene("payoff", PayoffScene)}
      {scene("cta", CtaScene)}

      {/* ── Music bed (Inspired — Kevin MacLeod, CC-BY) ── */}
      <Audio
        src={staticFile("music/bed.mp3")}
        volume={(f) => interpolate(f, [0, 12, TOTAL - 34, TOTAL], [0, 0.62, 0.62, 0], { extrapolateLeft: "clamp", extrapolateRight: "clamp" })}
      />

      {/* ── Sound design, synced to the cuts ── */}
      <Sequence from={T.hook1.from + 2} layout="none"><Audio src={sfx("switch")} volume={0.4} /></Sequence>
      <Sequence from={T.hook2.from + 14} layout="none"><Audio src={sfx("whoosh")} volume={0.45} /></Sequence>
      <Sequence from={T.brand.from} layout="none"><Audio src={sfx("impact")} volume={0.5} /></Sequence>
      <Sequence from={T.diag.from + 46} layout="none"><Audio src={sfx("confirm")} volume={0.5} /></Sequence>
      {MONTAGE.map((m, i) => (
        <Sequence key={m.n} from={T.montage.from + i * MW} layout="none">
          <Audio src={sfx(i % 2 === 0 ? "page-turn" : "switch")} volume={0.34} />
        </Sequence>
      ))}
      <Sequence from={T.payoff.from - 20} layout="none"><Audio src={sfx("riser")} volume={0.45} /></Sequence>
      <Sequence from={T.payoff.from + 20} layout="none"><Audio src={sfx("impact")} volume={0.6} /></Sequence>
      <Sequence from={T.payoff.from + 22} layout="none"><Audio src={sfx("ding")} volume={0.4} /></Sequence>
      <Sequence from={T.cta.from} layout="none"><Audio src={sfx("whoosh")} volume={0.4} /></Sequence>
    </AbsoluteFill>
  );
};
