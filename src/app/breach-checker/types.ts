/**
 * Shared types for the Breach Checker tool.
 */

export interface Breach {
  name: string;
  domain: string;
  breachDate: string;
  addedDate: string;
  pwnCount: number;
  description: string;
  logoPath: string;
  dataClasses: string[];
  isVerified: boolean;
  isFabricated: boolean;
  isSensitive: boolean;
  isRetired: boolean;
  isSpamList: boolean;
}

export interface Paste {
  source: string;
  id: string;
  title: string;
  date: string;
  emailCount: number;
}

export interface BreachCheckResult {
  query: string;
  queryType: "email" | "username";
  found: boolean;
  breachCount: number;
  breaches: Breach[];
  pasteCount: number;
  pastes: Paste[];
  fetchedAt: string;
  durationMs: number;
  cached: boolean;
  apiStatus: "ok" | "no_api_key" | "cloudflare_blocked" | "rate_limited" | "error";
  apiMessage?: string;
  error?: string;
}

export interface PasswordCheckResult {
  found: boolean;
  count: number;
  hashPrefix: string;
  severity: "safe" | "low" | "moderate" | "high" | "critical";
  severityLabel: string;
  durationMs: number;
  cached: boolean;
  error?: string;
}

export interface BreachStats {
  uniqueDataClasses: string[];
  dataClassCounts: Array<{ name: string; count: number }>;
  earliestBreach: string | null;
  latestBreach: string | null;
  severityLabel: string;
  severityDescription: string;
  severityColor: string;
  severityBg: string;
}
