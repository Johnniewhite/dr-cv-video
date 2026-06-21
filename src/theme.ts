import { loadFont as loadDisplay } from "@remotion/google-fonts/BricolageGrotesque";
import { loadFont as loadBody } from "@remotion/google-fonts/InterTight";
import { loadFont as loadMono } from "@remotion/google-fonts/GeistMono";

// Brand type stack — mirrors the live site (cv.belycan.com).
export const { fontFamily: DISPLAY } = loadDisplay();
export const { fontFamily: BODY } = loadBody();
export const { fontFamily: MONO } = loadMono();

// Brand palette — the Dr CV clinical-green editorial system.
export const C = {
  bg: "#f6f7f4",
  ink: "#0b1f18",
  inkSoft: "#4a5953",
  brand: "#0e4a2e",
  brandSoft: "#1f8a5b",
  brandFaint: "#e9f3ee",
  line: "#d8e2dc",
  white: "#ffffff",
};
