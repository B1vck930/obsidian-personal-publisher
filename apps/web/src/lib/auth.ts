import { createHash, timingSafeEqual } from "node:crypto";

const hashPrefix = "sha256:";

export function hashOwnerToken(ownerToken: string): string {
  return `${hashPrefix}${createHash("sha256").update(ownerToken).digest("hex")}`;
}

export function verifyOwnerToken(ownerToken: string, storedHash: string): boolean {
  const expected = hashOwnerToken(ownerToken);
  const expectedBuffer = Buffer.from(expected);
  const storedBuffer = Buffer.from(storedHash);

  if (expectedBuffer.length !== storedBuffer.length) {
    return false;
  }

  return timingSafeEqual(expectedBuffer, storedBuffer);
}
