"use server";

import { revalidatePath } from "next/cache";
import { PDFDocument, StandardFonts, rgb } from "pdf-lib";
import { createClient as createServerClient } from "@/lib/supabase/server";

type ActionResult = { ok: boolean; error?: string };

const BUCKET = "agreements";

// Keep only characters the standard PDF font (WinAnsi) can encode.
function sanitize(s: string): string {
  return (s || "").replace(/[^\x20-\xFF]/g, "").trim();
}

function admin() {
  const url = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
  return { url, key };
}

const CLAUSES = [
  "This Partnership Agreement is entered into between FX Partners (the Company) and the undersigned partner.",
  "1. The partner agrees to promote the Company's services in a lawful and ethical manner.",
  "2. Commissions are earned per the partner's active tier and are paid according to the Company's payout policy.",
  "3. The partner shall keep all confidential information private (NDA) and shall not misrepresent the Company.",
  "4. Either party may terminate this agreement with written notice; earned and cleared commissions remain payable.",
  "5. This agreement is governed by the applicable laws of the Company's jurisdiction.",
];

export async function signAgreement(input: {
  signatureDataUrl: string;
  signerName: string;
}): Promise<ActionResult> {
  const { signatureDataUrl, signerName } = input;
  if (!signatureDataUrl?.startsWith("data:image/png")) {
    return { ok: false, error: "التوقيع مطلوب." };
  }

  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false, error: "غير مصرّح" };

  const { url, key } = admin();
  if (!url || !key) {
    return { ok: false, error: "لم يتم إعداد التخزين (SERVICE_ROLE) بعد." };
  }

  const { data: ib } = await supabase
    .from("ib_accounts")
    .select("id,ib_code")
    .eq("user_id", user.id)
    .maybeSingle();

  const name = sanitize(signerName) || user.email?.split("@")[0] || "Partner";

  // Build the signed PDF.
  let pdfBytes: Uint8Array;
  try {
    const pdf = await PDFDocument.create();
    const page = pdf.addPage([595, 842]); // A4
    const font = await pdf.embedFont(StandardFonts.Helvetica);
    const bold = await pdf.embedFont(StandardFonts.HelveticaBold);
    const navy = rgb(0.04, 0.09, 0.18);
    const gray = rgb(0.3, 0.35, 0.42);

    let y = 780;
    page.drawText("FX Partners", { x: 50, y, size: 22, font: bold, color: navy });
    y -= 26;
    page.drawText("Partnership Agreement", { x: 50, y, size: 14, font: bold, color: gray });
    y -= 40;

    for (const clause of CLAUSES) {
      // naive word-wrap at ~90 chars
      const words = clause.split(" ");
      let line = "";
      for (const w of words) {
        if ((line + " " + w).length > 92) {
          page.drawText(line, { x: 50, y, size: 10, font, color: navy });
          y -= 16;
          line = w;
        } else {
          line = line ? `${line} ${w}` : w;
        }
      }
      if (line) {
        page.drawText(line, { x: 50, y, size: 10, font, color: navy });
        y -= 16;
      }
      y -= 6;
    }

    y -= 20;
    page.drawText(`Signed by: ${name}`, { x: 50, y, size: 11, font: bold, color: navy });
    y -= 18;
    if (ib?.ib_code) {
      page.drawText(`IB Code: ${ib.ib_code}`, { x: 50, y, size: 10, font, color: gray });
      y -= 18;
    }
    page.drawText(`Date: ${new Date().toISOString().slice(0, 19).replace("T", " ")} UTC`, {
      x: 50,
      y,
      size: 10,
      font,
      color: gray,
    });

    // Signature image
    const base64 = signatureDataUrl.split(",")[1] ?? "";
    const sigBytes = Buffer.from(base64, "base64");
    const png = await pdf.embedPng(sigBytes);
    const dims = png.scaleToFit(220, 90);
    page.drawText("Signature:", { x: 50, y: y - 40, size: 10, font, color: gray });
    page.drawImage(png, { x: 50, y: y - 40 - dims.height, width: dims.width, height: dims.height });

    pdfBytes = await pdf.save();
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : "فشل توليد المستند" };
  }

  // Upload to a private Storage bucket via the service role.
  const { createClient: createAdmin } = await import("@supabase/supabase-js");
  const store = createAdmin(url, key);
  await store.storage.createBucket(BUCKET, { public: false }).catch(() => {});

  const path = `${user.id}/${Date.now()}.pdf`;
  const { error: upErr } = await store.storage
    .from(BUCKET)
    .upload(path, pdfBytes, { contentType: "application/pdf", upsert: false });
  if (upErr) return { ok: false, error: upErr.message };

  const { error: insErr } = await supabase.from("agreements").insert({
    user_id: user.id,
    ib_id: ib?.id ?? null,
    version: "v1",
    signer_name: name,
    pdf_path: path,
  });
  if (insErr) return { ok: false, error: insErr.message };

  revalidatePath("/dashboard/agreement");
  return { ok: true };
}

/** Signed URL to download the current partner's latest agreement PDF. */
export async function getAgreementUrl(): Promise<{ ok: boolean; url?: string }> {
  const supabase = createServerClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return { ok: false };

  const { data: row } = await supabase
    .from("agreements")
    .select("pdf_path")
    .eq("user_id", user.id)
    .order("signed_at", { ascending: false })
    .limit(1)
    .maybeSingle();
  if (!row?.pdf_path) return { ok: false };

  const { url, key } = admin();
  if (!url || !key) return { ok: false };
  const { createClient: createAdmin } = await import("@supabase/supabase-js");
  const store = createAdmin(url, key);
  const { data } = await store.storage
    .from(BUCKET)
    .createSignedUrl(row.pdf_path, 300);
  return data?.signedUrl ? { ok: true, url: data.signedUrl } : { ok: false };
}
