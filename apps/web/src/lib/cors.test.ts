import { describe, expect, it } from "vitest";
import { corsOptionsResponse, createCorsHeaders, withCors } from "./cors";

describe("cors", () => {
  it("allows the Obsidian app origin", () => {
    const headers = createCorsHeaders(
      requestFrom("app://obsidian.md"),
      "POST, OPTIONS"
    );

    expect(headers).toMatchObject({
      "Access-Control-Allow-Origin": "app://obsidian.md",
      "Access-Control-Allow-Methods": "POST, OPTIONS",
      "Access-Control-Allow-Headers": "Content-Type"
    });
  });

  it("does not echo untrusted origins", () => {
    const headers = createCorsHeaders(
      requestFrom("https://example.com"),
      "POST, OPTIONS"
    );

    expect(headers).toMatchObject({
      "Access-Control-Allow-Origin": "app://obsidian.md",
      Vary: "Origin"
    });
  });

  it("adds cors headers to json responses", () => {
    const response = withCors(
      Response.json({ ok: true }),
      requestFrom("app://obsidian.md"),
      "POST, OPTIONS"
    );

    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "app://obsidian.md"
    );
  });

  it("creates an options preflight response", () => {
    const response = corsOptionsResponse(
      requestFrom("app://obsidian.md"),
      "POST, OPTIONS"
    );

    expect(response.status).toBe(204);
    expect(response.headers.get("Access-Control-Allow-Origin")).toBe(
      "app://obsidian.md"
    );
  });
});

function requestFrom(origin: string): Pick<Request, "headers"> {
  return {
    headers: new Headers({ origin })
  };
}
