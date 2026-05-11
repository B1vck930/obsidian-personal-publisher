import { randomBytes } from "node:crypto";

export function generateOwnerToken(): string {
  return randomBytes(32).toString("base64url");
}

export function generateSlug(): string {
  return randomBytes(6).toString("base64url");
}
