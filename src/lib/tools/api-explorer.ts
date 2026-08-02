/**
 * API explorer — returns documented endpoints for known services.
 */

export function apiExplorer(service: string) {
  const apis: Record<string, Array<{ name: string; endpoint: string; method: string; auth: string; description: string }>> = {
    github: [
      { name: "Search Repos", endpoint: "GET /search/repositories?q={query}", method: "GET", auth: "None (rate-limited)", description: "Search public repositories" },
      { name: "Get User", endpoint: "GET /users/{username}", method: "GET", auth: "None (rate-limited)", description: "Get public user profile" },
      { name: "List Repos", endpoint: "GET /users/{username}/repos", method: "GET", auth: "None (rate-limited)", description: "List user's repositories" },
    ],
    reddit: [
      { name: "Search", endpoint: "GET /search.json?q={query}", method: "GET", auth: "None", description: "Search Reddit posts" },
      { name: "User About", endpoint: "GET /user/{username}/about.json", method: "GET", auth: "None", description: "Get user info" },
    ],
    mastodon: [
      { name: "Account Lookup", endpoint: "GET /api/v1/accounts/lookup?acct={username}", method: "GET", auth: "None", description: "Lookup Mastodon account" },
    ],
    hibp: [
      { name: "Breached Account", endpoint: "GET /breachedaccount?account={email}", method: "GET", auth: "API Key Required", description: "Check if email is in breaches" },
      { name: "Password Check", endpoint: "GET /range/{hash-prefix}", method: "GET", auth: "None", description: "Check password (k-anonymity)" },
    ],
  };
  const result = apis[service.toLowerCase()];
  if (!result) return { service, endpoints: [], error: `No APIs found for "${service}". Try: github, reddit, mastodon, hibp` };
  return { service, endpoints: result };
}
