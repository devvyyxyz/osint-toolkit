/**
 * Shared types for the main page and its sub-views.
 */

import type { HitStatus } from "../hit-types";

export interface Hit {
  platformId: string;
  platformName: string;
  category: string;
  url: string;
  status: HitStatus;
  httpStatus: number | null;
  detail: string;
  durationMs: number;
}

export interface SearchResponse {
  username: string;
  total: number;
  found: number;
  notFound: number;
  blocked: number;
  errors: number;
  results: Hit[];
  cached: boolean;
}
