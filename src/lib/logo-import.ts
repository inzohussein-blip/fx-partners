import { createHash } from "node:crypto";
import { lookup } from "node:dns/promises";
import { isIP } from "node:net";
import sharp from "sharp";
import type { SupabaseClient } from "@supabase/supabase-js";

/**
 * Broker and partner logos live in our own storage (the public `media`
 * bucket, under logos/), never on someone else's server: a hotlinked logo
 * breaks when Google, Wikipedia or the broker's CDN moves it, and every
 * visitor's browser talks to that third party.
 *
 * importLogo() takes whatever the admin gave — an outside URL, or a file
 * they uploaded to the bucket — and stores one normalised copy: at most
 * 256×256, WebP, transparency kept. It runs once, when the logo is saved,
 * so pages serve a small file straight from the Supabase CDN and Vercel does
 * no image work per visit.
 */

const MAX_BYTES = 4 * 1024 * 1024;
const MAX_REDIRECTS = 3;
const TIMEOUT_MS = 10_000;
const SIZE = 256;
const BUCKET = "media";
const FOLDER = "logos/";

function publicPrefix(): string {
  return `${(process.env.NEXT_PUBLIC_SUPABASE_URL ?? "").replace(/\/$/, "")}/storage/v1/object/public/${BUCKET}/`;
}

/** Already a normalised logo in our bucket: nothing to do. */
export function isStoredLogo(url: string | null | undefined): boolean {
  return !!url && url.startsWith(publicPrefix() + FOLDER);
}

/** Loopback, private, link-local and other non-public addresses. */
export function isPrivateAddress(ip: string): boolean {
  if (isIP(ip) === 4) {
    const [a, b] = ip.split(".").map(Number);
    return (
      a === 0 || a === 10 || a === 127 ||
      (a === 100 && b >= 64 && b <= 127) ||
      (a === 169 && b === 254) ||
      (a === 172 && b >= 16 && b <= 31) ||
      (a === 192 && b === 168) ||
      (a === 198 && (b === 18 || b === 19)) ||
      a >= 224
    );
  }
  const v6 = ip.toLowerCase();
  if (v6.startsWith("::ffff:")) return isPrivateAddress(v6.slice(7));
  return (
    v6 === "::" || v6 === "::1" ||
    v6.startsWith("fc") || v6.startsWith("fd") ||
    v6.startsWith("fe8") || v6.startsWith("fe9") || v6.startsWith("fea") || v6.startsWith("feb") ||
    v6.startsWith("ff")
  );
}

class LogoError extends Error {}

/**
 * Download an image over https only, refusing internal addresses at every
 * redirect hop (the URL comes from an admin form, but the server should not
 * be usable to probe its own network), with a size cap and a timeout.
 */
async function download(url: string): Promise<Buffer> {
  let current = url;
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    let u: URL;
    try {
      u = new URL(current);
    } catch {
      throw new LogoError("رابط الشعار غير صالح.");
    }
    if (u.protocol !== "https:") throw new LogoError("يجب أن يبدأ رابط الشعار بـ https.");
    const host = u.hostname.replace(/^\[|\]$/g, "");
    const addrs = isIP(host) ? [{ address: host }] : await lookup(host, { all: true }).catch(() => []);
    if (addrs.length === 0) throw new LogoError("تعذّر الوصول إلى موقع الشعار.");
    if (addrs.some((a) => isPrivateAddress(a.address))) throw new LogoError("رابط الشعار غير مسموح.");

    const res = await fetch(u, {
      redirect: "manual",
      signal: AbortSignal.timeout(TIMEOUT_MS),
      headers: { "user-agent": "PartnersFX-LogoImport/1.0", accept: "image/*" },
    }).catch(() => null);
    if (!res) throw new LogoError("انتهت مهلة تحميل الشعار أو تعذّر الاتصال.");

    if (res.status >= 300 && res.status < 400) {
      const next = res.headers.get("location");
      if (!next) break;
      current = new URL(next, u).toString();
      continue;
    }
    if (!res.ok) throw new LogoError(`الموقع أعاد الخطأ ${res.status}.`);

    const declared = Number(res.headers.get("content-length") ?? 0);
    if (declared > MAX_BYTES) throw new LogoError("ملف الشعار أكبر من 4 ميغابايت.");
    const buf = Buffer.from(await res.arrayBuffer());
    if (buf.length > MAX_BYTES) throw new LogoError("ملف الشعار أكبر من 4 ميغابايت.");
    return buf;
  }
  throw new LogoError("تحويلات كثيرة عند تحميل الشعار.");
}

/** Decode anything sharp reads (PNG, JPEG, WebP, GIF, SVG, ICO-as-PNG…) and re-encode. */
export async function normaliseLogo(input: Buffer): Promise<Buffer> {
  try {
    return await sharp(input, { density: 300, limitInputPixels: 40_000_000 })
      .rotate()
      .resize(SIZE, SIZE, { fit: "inside", withoutEnlargement: true })
      .webp({ quality: 90, alphaQuality: 100 })
      .toBuffer();
  } catch {
    throw new LogoError("الملف ليس صورة يمكن قراءتها.");
  }
}

function slugPart(name: string): string {
  return (
    name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "").slice(0, 40) || "logo"
  );
}

export type ImportResult = { ok: true; url: string } | { ok: false; error: string };

/**
 * Store a normalised copy of `source` and return its public URL. A logo
 * already under logos/ is returned unchanged; an empty value stays empty.
 * `supabase` must be signed in as an admin (storage RLS, migration 0021).
 */
export async function importLogo(
  supabase: SupabaseClient,
  source: string,
  name: string
): Promise<ImportResult> {
  const url = source.trim();
  if (!url || isStoredLogo(url)) return { ok: true, url };
  try {
    // Our own uploads come through the public URL too; that host is
    // Supabase, never an internal address.
    const raw = await download(url);
    const webp = await normaliseLogo(raw);
    const hash = createHash("sha256").update(webp).digest("hex").slice(0, 12);
    const path = `${FOLDER}${slugPart(name)}-${hash}.webp`;
    const { error } = await supabase.storage.from(BUCKET).upload(path, webp, {
      contentType: "image/webp",
      cacheControl: "31536000",
      upsert: true,
    });
    if (error) return { ok: false, error: `تعذّر الحفظ في التخزين: ${error.message}` };
    return { ok: true, url: supabase.storage.from(BUCKET).getPublicUrl(path).data.publicUrl };
  } catch (e) {
    return { ok: false, error: e instanceof LogoError ? e.message : "تعذّر نقل الشعار." };
  }
}
