import { describe, expect, it } from "vitest";
import { defaultPublicPageConfig } from "./theme";

describe("defaultPublicPageConfig", () => {
  it("defaults to the notion theme", () => {
    expect(defaultPublicPageConfig.theme).toBe("notion");
  });

  it("defaults to a seven day expiration", () => {
    expect(defaultPublicPageConfig.expirationDays).toBe(7);
  });
});
