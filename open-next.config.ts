import { defineCloudflareConfig } from "@opennextjs/cloudflare";

// No incremental cache is configured: the site's pages read Supabase at
// request time, and the few `revalidate` pages simply re-render per request on
// Workers. Add an R2 cache here later if page rendering cost ever matters.
//
// `npm run build` is the OpenNext build (so Cloudflare Workers Builds' default
// build command produces the worker), and OpenNext itself runs the plain
// Next.js build through `build:next`. Without this it would call
// `npm run build` and recurse.
export default {
  ...defineCloudflareConfig(),
  buildCommand: "npm run build:next",
};
