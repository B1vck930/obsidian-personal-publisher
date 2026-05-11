import { describe, expect, it } from "vitest";
import { buildPublicPageUrl } from "./urls";

describe("buildPublicPageUrl", () => {
  it("builds public page URLs without duplicate slashes", () => {
    expect(buildPublicPageUrl("https://example.com/", "abc123")).toBe(
      "https://example.com/p/abc123"
    );
  });
});
