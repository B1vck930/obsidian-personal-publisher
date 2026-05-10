import { describe, expect, it } from "vitest";
import { extractTitle } from "../src/markdownTransform";

describe("extractTitle", () => {
  it("uses the first H1", () => {
    expect(extractTitle("# Example\n\nBody", "fallback")).toBe("Example");
  });

  it("falls back when no H1 exists", () => {
    expect(extractTitle("Body", "fallback")).toBe("fallback");
  });
});
