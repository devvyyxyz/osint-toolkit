/**
 * Email lookup tool — checks MX records, A records, and disposable domains.
 */

import dns from "node:dns/promises";

export async function emailLookup(email: string) {
  const domain = email.split("@")[1];
  if (!domain) throw new Error("Invalid email format");

  let mxRecords: string[] = [];
  let hasMx = false;
  try {
    const mx = await dns.resolveMx(domain);
    mxRecords = mx.map((r) => `${r.priority} ${r.exchange}`);
    hasMx = mx.length > 0;
  } catch { /* no MX */ }

  let aRecords: string[] = [];
  try { aRecords = await dns.resolve4(domain); } catch { /* noop */ }

  return {
    email,
    domain,
    valid: /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email),
    hasMx,
    mxRecords,
    aRecords,
    disposable: ["tempmail", "guerrillamail", "mailinator", "10minutemail", "throwaway"].some(d => domain.includes(d)),
  };
}
