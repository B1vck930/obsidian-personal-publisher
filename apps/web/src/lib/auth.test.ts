import { describe, expect, it } from "vitest";
import { hashOwnerToken, verifyOwnerToken } from "./auth";
import { generateOwnerToken } from "./token";

describe("owner tokens", () => {
  it("generates a non-empty owner token", () => {
    expect(generateOwnerToken()).toEqual(expect.any(String));
    expect(generateOwnerToken().length).toBeGreaterThan(20);
  });

  it("hashes and verifies owner tokens", () => {
    const token = generateOwnerToken();
    const hash = hashOwnerToken(token);

    expect(hash).not.toBe(token);
    expect(verifyOwnerToken(token, hash)).toBe(true);
    expect(verifyOwnerToken("wrong-token", hash)).toBe(false);
  });
});
