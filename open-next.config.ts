import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No incremental cache is configured: the site's pages read Supabase at
// request time, and the few `revalidate` pages simply re-render per request on
// Workers. Add an R2 cache here later if page rendering cost ever matters.
export default defineCloudflareConfig();
