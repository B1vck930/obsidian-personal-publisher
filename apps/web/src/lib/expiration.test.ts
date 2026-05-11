import { describe, expect, it } from "vitest";
import { calculateExpiresAt, isPagePubliclyAvailable } from "./expiration";

describe("expiration", () => {
  it("defaults to seven days", () => {
    const now = new Date("2026-05-11T00:00:00.000Z");

    expect(calculateExpiresAt(now)).toBe("2026-05-18T00:00:00.000Z");
  });

  it("treats expired pages as unavailable", () => {
    expect(
      isPagePubliclyAvailable(
        { deleted_at: null, expires_at: "2026-05-10T00:00:00.000Z" },
        new Date("2026-05-11T00:00:00.000Z")
      )
    ).toBe(false);
  });

  it("treats non-expired pages as available", () => {
    expect(
      isPagePubliclyAvailable(
        { deleted_at: null, expires_at: "2026-05-12T00:00:00.000Z" },
        new Date("2026-05-11T00:00:00.000Z")
      )
    ).toBe(true);
  });
});
