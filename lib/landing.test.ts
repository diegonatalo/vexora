import { existsSync } from "node:fs";
import path from "node:path";
import { describe, expect, it } from "vitest";
import { FAQ, FEATURES, SCREENSHOT, STEPS } from "@/lib/landing";

describe("landing", () => {
  it("os prints existem em public/ e estão em WebP", () => {
    for (const src of [SCREENSHOT.light, SCREENSHOT.dark]) {
      expect(src).toMatch(/^\/landing\/.+\.webp$/);
      expect(existsSync(path.join(process.cwd(), "public", src)), src).toBe(true);
    }
  });

  it("tem 3 passos, de 3 a 6 recursos e de 3 a 5 perguntas, sem títulos repetidos", () => {
    expect(STEPS).toHaveLength(3);
    expect(FEATURES.length).toBeGreaterThanOrEqual(3);
    expect(FEATURES.length).toBeLessThanOrEqual(6);
    expect(FAQ.length).toBeGreaterThanOrEqual(3);
    expect(FAQ.length).toBeLessThanOrEqual(5);
    for (const titles of [STEPS.map((s) => s.title), FEATURES.map((f) => f.title), FAQ.map((f) => f.question)]) {
      expect(new Set(titles).size).toBe(titles.length);
    }
  });
});
