import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import sharp from "sharp";

process.env.NEXT_PUBLIC_SUPABASE_URL = "https://proj.supabase.co";
const STORED = "https://proj.supabase.co/storage/v1/object/public/media/logos/";

import { importLogo, isPrivateAddress, isStoredLogo, normaliseLogo } from "@/lib/logo-import";
import { initial } from "@/components/brokers/logo-img";

const png = (w: number, h: number) =>
  sharp({ create: { width: w, height: h, channels: 4, background: { r: 0, g: 120, b: 230, alpha: 0.5 } } })
    .png()
    .toBuffer();

function fakeSupabase() {
  const upload = vi.fn().mockResolvedValue({ error: null });
  const client = {
    storage: {
      from: () => ({
        upload,
        getPublicUrl: (path: string) => ({ data: { publicUrl: `https://proj.supabase.co/storage/v1/object/public/media/${path}` } }),
      }),
    },
  };
  return { client: client as never, upload };
}

describe("isPrivateAddress", () => {
  it.each(["127.0.0.1", "10.1.2.3", "172.16.0.1", "192.168.1.1", "169.254.169.254", "100.64.0.1", "0.0.0.0", "::1", "fd00::1", "fe80::1", "::ffff:127.0.0.1"])(
    "blocks %s",
    (ip) => expect(isPrivateAddress(ip)).toBe(true)
  );
  it.each(["8.8.8.8", "142.250.1.1", "172.32.0.1", "2606:4700::1111"])("allows %s", (ip) =>
    expect(isPrivateAddress(ip)).toBe(false)
  );
});

describe("normaliseLogo", () => {
  it("shrinks a large image to fit 256×256 as WebP, keeping transparency", async () => {
    const out = await normaliseLogo(await png(1200, 400));
    const meta = await sharp(out).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(256);
    expect(meta.height).toBe(85);
    expect(meta.hasAlpha).toBe(true);
  });
  it("never enlarges a small favicon", async () => {
    const meta = await sharp(await normaliseLogo(await png(64, 64))).metadata();
    expect([meta.width, meta.height]).toEqual([64, 64]);
  });
  it("renders SVG logos", async () => {
    const svg = Buffer.from('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 40"><rect width="100" height="40" fill="#0af"/></svg>');
    const meta = await sharp(await normaliseLogo(svg)).metadata();
    expect(meta.format).toBe("webp");
    expect(meta.width).toBe(256);
  });
  it("rejects a file that is not an image", async () => {
    await expect(normaliseLogo(Buffer.from("<html>not found</html>"))).rejects.toThrow("ليس صورة");
  });
});

describe("importLogo", () => {
  const realFetch = globalThis.fetch;
  beforeEach(() => {
    globalThis.fetch = vi.fn();
  });
  afterEach(() => {
    globalThis.fetch = realFetch;
  });

  it("leaves an already stored logo and an empty value alone", async () => {
    const { client, upload } = fakeSupabase();
    expect(await importLogo(client, `${STORED}xm-abc.webp`, "XM")).toEqual({ ok: true, url: `${STORED}xm-abc.webp` });
    expect(await importLogo(client, "  ", "XM")).toEqual({ ok: true, url: "" });
    expect(upload).not.toHaveBeenCalled();
    expect(isStoredLogo(`${STORED}a.webp`)).toBe(true);
    expect(isStoredLogo("https://proj.supabase.co/storage/v1/object/public/media/raw.png")).toBe(false);
  });

  it("downloads, re-encodes and stores an outside logo under logos/", async () => {
    const body = await png(500, 500);
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response(new Uint8Array(body), { status: 200 }));
    const { client, upload } = fakeSupabase();
    const res = await importLogo(client, "https://93.184.216.34/xm.png", "XM Global");
    expect(res.ok).toBe(true);
    expect(res.ok && res.url).toMatch(/\/media\/logos\/xm-global-[0-9a-f]{12}\.webp$/);
    const [, bytes, opts] = upload.mock.calls[0];
    expect((await sharp(bytes).metadata()).width).toBe(256);
    expect(opts).toMatchObject({ contentType: "image/webp", cacheControl: "31536000" });
  });

  it("refuses http, internal addresses and internal redirects", async () => {
    const { client } = fakeSupabase();
    expect(await importLogo(client, "http://93.184.216.34/a.png", "A")).toMatchObject({ ok: false });
    expect(await importLogo(client, "https://127.0.0.1/a.png", "A")).toMatchObject({ ok: false });
    vi.mocked(globalThis.fetch).mockResolvedValue(
      new Response(null, { status: 302, headers: { location: "https://169.254.169.254/latest/meta-data" } })
    );
    expect(await importLogo(client, "https://93.184.216.34/a.png", "A")).toMatchObject({ ok: false, error: "رابط الشعار غير مسموح." });
    expect(globalThis.fetch).toHaveBeenCalledTimes(1);
  });

  it("reports an HTTP error from the outside site", async () => {
    vi.mocked(globalThis.fetch).mockResolvedValue(new Response("gone", { status: 404 }));
    const { client } = fakeSupabase();
    expect(await importLogo(client, "https://93.184.216.34/a.png", "A")).toMatchObject({ ok: false, error: "الموقع أعاد الخطأ 404." });
  });
});

describe("initial", () => {
  it("takes the first letter or digit", () => {
    expect(initial("xm")).toBe("X");
    expect(initial("  (IC Markets)")).toBe("I");
    expect(initial("إنزو")).toBe("إ");
    expect(initial("")).toBe("•");
  });
});
