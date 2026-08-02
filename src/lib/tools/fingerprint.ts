/**
 * Fingerprint tool — generates a SHA-256 hash fingerprint of input data.
 */

import { createHash } from "node:crypto";

export function fingerprint(data: Record<string, string>) {
  const hash = createHash("sha256").update(JSON.stringify(data)).digest("hex");
  return {
    input: data,
    fingerprint: hash,
    shortId: hash.substring(0, 16),
    algorithm: "SHA-256",
  };
}
