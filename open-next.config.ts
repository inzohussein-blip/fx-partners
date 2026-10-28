import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// Only used by the optional Cloudflare build (`npm run cf:build`); Vercel
// ignores this file. No incremental cache is configured: the site's pages read
// Supabase at request time. Add an R2 cache here if this path is ever used in
// production and page rendering cost matters.
export default defineCloudflareConfig();
