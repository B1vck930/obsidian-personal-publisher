import { describe, expect, it } from "vitest";
import {
  defaultSettings,
  normalizePositiveNumber,
  normalizeSettings
} from "../src/settingsCore";

describe("normalizePositiveNumber", () => {
  it("keeps valid positive numbers", () => {
    expect(normalizePositiveNumber("14", 7)).toBe(14);
  });

  it("falls back for invalid values", () => {
    expect(normalizePositiveNumber("abc", 7)).toBe(7);
    expect(normalizePositiveNumber("0", 7)).toBe(7);
  });
});

describe("normalizeSettings", () => {
  it("fills missing settings from defaults", () => {
    expect(normalizeSettings(null)).toEqual(defaultSettings);
  });

  it("keeps supported theme values", () => {
    expect(normalizeSettings({ defaultTheme: "vercel" }).defaultTheme).toBe(
      "vercel"
    );
  });

  it("falls back to notion for unsupported theme values", () => {
    expect(
      normalizeSettings({
        defaultTheme: "unsupported" as typeof defaultSettings.defaultTheme
      }).defaultTheme
    ).toBe("notion");
  });
});
