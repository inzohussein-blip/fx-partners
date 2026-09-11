import type { MetadataRoute } from "next";
import { getSiteUrl } from "@/lib/utils";

/**
 * robots.txt
 *
 * The site *wants* to be read — by Google, by answer engines, by the agents
 * people now ask "which broker should I use?". A bare `User-agent: *` already
 * permits all of them, but several AI crawlers look for their own token before
 * anything else, and publishers routinely block them, so being explicit is a
 * signal in itself: these names are listed to say yes on purpose.
 *
 * Note that Google-Extended and Applebot-Extended are not crawlers at all —
 * they are the opt-in tokens that decide whether already-crawled pages may be
 * used for AI answers and grounding. Listing them as allowed is what makes the
 * site quotable in Gemini and Apple Intelligence rather than merely indexed.
 */

/** Private surfaces: dashboards, auth, and the tracked redirect endpoints. */
const PRIVATE = ["/dashboard/", "/auth/", "/api/", "/go/", "/r/", "/401", "/403"];

/**
 * Image + preview endpoints live under /api but must stay crawlable, otherwise
 * every share card and image result renders as a broken box.
 */
const PUBLIC_API = ["/api/og/", "/api/banner", "/api/public/"];

/** Answer engines, assistants, and the agents acting for a person mid-task. */
const AI_AGENTS = [
  "GPTBot",
  "OAI-SearchBot",
  "ChatGPT-User",
  "ClaudeBot",
  "Claude-User",
  "Claude-SearchBot",
  "anthropic-ai",
  "PerplexityBot",
  "Perplexity-User",
  "Google-Extended",
  "Applebot-Extended",
  "Amazonbot",
  "meta-externalagent",
  "FacebookBot",
  "cohere-ai",
  "YouBot",
  "Diffbot",
  "CCBot",
];

/** Classic search + the archives that keep a durable public record. */
const SEARCH_AND_ARCHIVE = [
  "Googlebot",
  "Googlebot-Image",
  "Googlebot-News",
  "Bingbot",
  "DuckDuckBot",
  "YandexBot",
  "Applebot",
  "Slurp",
  "ia_archiver",
  "archive.org_bot",
];

export default function robots(): MetadataRoute.Robots {
  const base = getSiteUrl();
  const rule = (userAgent: string | string[]) => ({
    userAgent,
    allow: ["/", ...PUBLIC_API],
    disallow: PRIVATE,
  });

  return {
    rules: [rule("*"), rule(SEARCH_AND_ARCHIVE), rule(AI_AGENTS)],
    sitemap: `${base}/sitemap.xml`,
    host: base,
  };
}
