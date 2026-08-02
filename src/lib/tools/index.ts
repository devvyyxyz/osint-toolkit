/**
 * Tools barrel — re-exports all simple tool implementations.
 *
 * Consumers should import from `@/lib/tools` (this barrel) or
 * `@/lib/simple-tools` (the backward-compat re-export).
 */

export { emailLookup } from "./email-lookup";
export { phoneLookup } from "./phone-lookup";
export { nameSearch } from "./name-search";
export { fingerprint } from "./fingerprint";
export { urlSafetyCheck } from "./url-safety-check";
export { linkExtractor } from "./link-extractor";
export { waybackExplorer } from "./wayback-explorer";
export { techDetector } from "./tech-detector";
export { codeSearch } from "./code-search";
export { dnsHistory } from "./dns-history";
export { hashtagTracker } from "./hashtag-tracker";
export { apiExplorer } from "./api-explorer";
