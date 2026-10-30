"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import { toast } from "sonner";
import {
  ArrowDown, ArrowUp, ChevronDown, ExternalLink, Eye, EyeOff, Loader2, Lock, Plus, RotateCcw, Save, Trash2,
} from "lucide-react";
import {
  CUSTOM_KINDS,
  SECTION_ICONS,
  SECTION_TONES,
  type CustomKind,
  type PageDef,
  type SectionRow,
} from "@/lib/page-sections";
import { savePageSections, resetPageSections, type EditorSection } from "@/lib/actions/page-sections";
import { cn } from "@/lib/utils";

type I18n = { ar: string; en: string };
type Item = EditorSection & { uid: string; open?: boolean };

const input =
  "w-full rounded-xl border border-fg/10 bg-ink-900/60 px-3 py-2 text-sm text-fg placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none";
const small = "rounded-lg p-2 text-slate-400 transition hover:bg-fg/5 hover:text-fg disabled:opacity-30";

const ICON_LABELS: Record<string, string> = {
  shield: "درع", trophy: "كأس", chart: "رسم بياني", users: "أشخاص", handshake: "مصافحة", gift: "هدية",
  zap: "برق", star: "نجمة", globe: "كرة أرضية", wallet: "محفظة", book: "كتاب", calendar: "تقويم",
  bell: "جرس", scale: "ميزان", target: "هدف", sparkles: "لمعة",
};
const TONE_LABELS: Record<string, string> = { brand: "أزرق", accent: "سماوي", amber: "كهرماني", emerald: "أخضر" };

let counter = 0;
const uid = () => `s${++counter}`;

/** Fresh content for a new custom block, valid for its schema. */
function blank(kind: CustomKind): unknown {
  return CUSTOM_KINDS[kind].schema.parse(
    kind === "cards" ? { items: [{}, {}, {}] } : {}
  );
}

/** The list the editor starts from: saved rows, or the code's default order. */
function initial(page: PageDef, saved: SectionRow[]): Item[] {
  const rows: EditorSection[] = saved.length
    ? saved.map((r) => (r.kind === "builtin" ? { kind: "builtin", builtin: r.builtin, is_visible: r.is_visible } : r))
    : page.builtins.map((b) => ({ kind: "builtin" as const, builtin: b.id, is_visible: true }));
  const listed = new Set(rows.filter((r) => r.kind === "builtin").map((r) => (r as { builtin: string }).builtin));
  for (const b of page.builtins) if (!listed.has(b.id)) rows.push({ kind: "builtin", builtin: b.id, is_visible: true });
  return rows
    .filter((r) => r.kind !== "builtin" || page.builtins.some((b) => b.id === r.builtin))
    .map((r) => ({ ...r, uid: uid() }));
}

export function PageSectionsEditor({
  pages,
  page,
  saved,
}: {
  pages: { key: string; label: string; path: string }[];
  page: PageDef;
  saved: SectionRow[];
}) {
  const router = useRouter();
  const [items, setItems] = useState<Item[]>(() => initial(page, saved));
  const [dirty, setDirty] = useState(false);
  const [busy, setBusy] = useState<"save" | "reset" | null>(null);
  const [adding, setAdding] = useState<CustomKind>("cards");

  const update = (next: Item[]) => {
    setItems(next);
    setDirty(true);
  };
  const move = (i: number, d: -1 | 1) => {
    const j = i + d;
    if (j < 0 || j >= items.length) return;
    const next = [...items];
    [next[i], next[j]] = [next[j], next[i]];
    update(next);
  };
  const patch = (i: number, p: Partial<Item>) => update(items.map((it, n) => (n === i ? ({ ...it, ...p } as Item) : it)));
  const setConfig = (i: number, config: unknown) => patch(i, { config } as Partial<Item>);

  async function save() {
    setBusy("save");
    const res = await savePageSections(
      page.key,
      items.map(({ uid: _u, open: _o, ...s }) => s as EditorSection)
    );
    setBusy(null);
    if (!res.ok) return toast.error(res.error ?? "تعذّر الحفظ");
    toast.success("حُفظ. تظهر التغييرات في الموقع خلال لحظات.");
    setDirty(false);
    router.refresh();
  }

  async function reset() {
    if (!confirm("إرجاع الصفحة إلى ترتيبها الأصلي وحذف كل الأقسام المضافة إليها؟")) return;
    setBusy("reset");
    const res = await resetPageSections(page.key);
    setBusy(null);
    if (!res.ok) return toast.error(res.error ?? "تعذّر الإرجاع");
    toast.success("أُرجعت الصفحة إلى الترتيب الأصلي.");
    setItems(initial(page, []));
    setDirty(false);
    router.refresh();
  }

  return (
    <div className="space-y-5">
      {/* Page picker */}
      <div className="card-surface flex flex-wrap items-center gap-3 p-4">
        <label className="text-sm text-slate-400" htmlFor="page-pick">الصفحة</label>
        <select
          id="page-pick"
          className={cn(input, "w-auto min-w-56")}
          value={page.key}
          onChange={(e) => {
            if (dirty && !confirm("لديك تغييرات غير محفوظة. الانتقال يتجاهلها؟")) return;
            router.push(`/dashboard/admin/pages?page=${e.target.value}`);
          }}
        >
          {pages.map((p) => (
            <option key={p.key} value={p.key} className="bg-ink-900">{p.label}</option>
          ))}
        </select>
        <a
          href={page.path}
          target="_blank"
          rel="noopener"
          className="inline-flex items-center gap-1.5 text-sm font-semibold text-brand-300 hover:text-brand-200"
        >
          عرض الصفحة <ExternalLink className="h-4 w-4" aria-hidden />
        </a>
        <span className="ms-auto text-xs text-slate-500">{saved.length ? "مخصّصة" : "على الترتيب الأصلي"}</span>
      </div>

      {/* Sections */}
      <ol className="space-y-2">
        {items.map((it, i) => {
          const isBuiltin = it.kind === "builtin";
          const b = isBuiltin ? page.builtins.find((x) => x.id === (it as { builtin: string }).builtin) : undefined;
          const label = isBuiltin ? b?.label : CUSTOM_KINDS[it.kind as CustomKind].label;
          const summary = !isBuiltin ? summaryOf(it.kind as CustomKind, (it as { config: unknown }).config) : "";
          return (
            <li key={it.uid} className={cn("card-surface", !it.is_visible && "opacity-60")}>
              <div className="flex items-center gap-2 p-3">
                <span className="w-6 text-center text-xs text-slate-500">{i + 1}</span>
                <div className="min-w-0 flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-fg">{label}</span>
                    <span className={cn("rounded-full px-2 py-0.5 text-[11px]", isBuiltin ? "bg-fg/5 text-slate-400" : "bg-brand-500/10 text-brand-200")}>
                      {isBuiltin ? "قسم أساسي" : "قسم مضاف"}
                    </span>
                    {!it.is_visible && <span className="text-[11px] text-amber-300">مخفي</span>}
                  </div>
                  {summary && <div className="truncate text-xs text-slate-500">{summary}</div>}
                </div>
                <button type="button" className={small} onClick={() => move(i, -1)} disabled={i === 0} aria-label="أعلى">
                  <ArrowUp className="h-4 w-4" />
                </button>
                <button type="button" className={small} onClick={() => move(i, 1)} disabled={i === items.length - 1} aria-label="أسفل">
                  <ArrowDown className="h-4 w-4" />
                </button>
                {b?.required ? (
                  <span className="p-2 text-slate-600" title="قسم أساسي لا يُخفى"><Lock className="h-4 w-4" /></span>
                ) : (
                  <button type="button" className={small} onClick={() => patch(i, { is_visible: !it.is_visible })} aria-label={it.is_visible ? "إخفاء" : "إظهار"}>
                    {it.is_visible ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                  </button>
                )}
                {!isBuiltin && (
                  <>
                    <button type="button" className={small} onClick={() => patch(i, { open: !it.open })} aria-label="تعديل" aria-expanded={!!it.open}>
                      <ChevronDown className={cn("h-4 w-4 transition", it.open && "rotate-180")} />
                    </button>
                    <button
                      type="button"
                      className={cn(small, "hover:text-red-300")}
                      onClick={() => confirm("حذف هذا القسم؟") && update(items.filter((_, n) => n !== i))}
                      aria-label="حذف"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </>
                )}
              </div>
              {!isBuiltin && it.open && (
                <div className="border-t border-fg/5 p-4">
                  <ConfigForm kind={it.kind as CustomKind} config={(it as { config: unknown }).config} onChange={(c) => setConfig(i, c)} />
                </div>
              )}
            </li>
          );
        })}
      </ol>

      {/* Add + save */}
      <div className="card-surface flex flex-wrap items-center gap-3 p-4">
        <select className={cn(input, "w-auto")} value={adding} onChange={(e) => setAdding(e.target.value as CustomKind)} aria-label="نوع القسم">
          {(Object.keys(CUSTOM_KINDS) as CustomKind[]).map((k) => (
            <option key={k} value={k} className="bg-ink-900">{CUSTOM_KINDS[k].label}</option>
          ))}
        </select>
        <button
          type="button"
          onClick={() => update([...items, { kind: adding, is_visible: true, config: blank(adding), uid: uid(), open: true } as Item])}
          className="inline-flex items-center gap-2 rounded-xl border border-fg/10 px-4 py-2 text-sm font-semibold text-fg hover:bg-fg/5"
        >
          <Plus className="h-4 w-4" /> إضافة قسم
        </button>
        <span className="text-xs text-slate-500">يُضاف في آخر الصفحة، ثم حرّكه بالأسهم.</span>
        <div className="ms-auto flex gap-2">
          <button
            type="button"
            onClick={reset}
            disabled={busy !== null || saved.length === 0}
            className="inline-flex items-center gap-2 rounded-xl border border-fg/10 px-4 py-2 text-sm text-slate-300 hover:bg-fg/5 disabled:opacity-40"
          >
            {busy === "reset" ? <Loader2 className="h-4 w-4 animate-spin" /> : <RotateCcw className="h-4 w-4" />}
            الترتيب الأصلي
          </button>
          <button
            type="button"
            onClick={save}
            disabled={busy !== null || !dirty}
            className="btn-gradient inline-flex items-center gap-2 rounded-xl px-5 py-2 text-sm font-semibold text-white disabled:opacity-50"
          >
            {busy === "save" ? <Loader2 className="h-4 w-4 animate-spin" /> : <Save className="h-4 w-4" />}
            حفظ
          </button>
        </div>
      </div>
      <p className="text-xs leading-relaxed text-slate-500">
        النصوص تُعرض كما هي (بلا HTML). الروابط: مسار داخل الموقع يبدأ بـ «/» مثل /compare، أو رابط خارجي يبدأ بـ https://.
        القسم الذي لا نص له بلغة ما لا يظهر في نسخة تلك اللغة.
      </p>
    </div>
  );
}

function summaryOf(kind: CustomKind, config: unknown): string {
  const c = config as Record<string, unknown>;
  const t = (v: unknown) => ((v as I18n | undefined)?.ar || "").trim();
  if (kind === "cards") return `${t(c.title) || "بدون عنوان"} · ${(c.items as unknown[] | undefined)?.length ?? 0} بطاقات`;
  if (kind === "banner") return t(c.text);
  return t(c.title);
}

// ---------------------------------------------------------------------------
// Forms
// ---------------------------------------------------------------------------

function Bi({
  label,
  value,
  onChange,
  multiline,
}: {
  label: string;
  value: I18n;
  onChange: (v: I18n) => void;
  multiline?: boolean;
}) {
  const Field = multiline ? "textarea" : "input";
  return (
    <div className="space-y-1.5">
      <div className="text-xs font-semibold text-slate-400">{label}</div>
      <div className="grid gap-2 sm:grid-cols-2">
        <Field className={input} rows={multiline ? 3 : undefined} placeholder="بالعربية" value={value.ar} onChange={(e) => onChange({ ...value, ar: e.target.value })} />
        <Field className={input} rows={multiline ? 3 : undefined} placeholder="In English" dir="ltr" value={value.en} onChange={(e) => onChange({ ...value, en: e.target.value })} />
      </div>
    </div>
  );
}

function Href({ value, onChange, label = "الرابط" }: { value: string; onChange: (v: string) => void; label?: string }) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      <input className={input} dir="ltr" placeholder="/compare  أو  https://…" value={value} onChange={(e) => onChange(e.target.value)} />
    </label>
  );
}

function Pick<T extends string>({
  label,
  value,
  options,
  labels,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  labels: Record<string, string>;
  onChange: (v: T) => void;
}) {
  return (
    <label className="block space-y-1.5">
      <span className="text-xs font-semibold text-slate-400">{label}</span>
      <select className={input} value={value} onChange={(e) => onChange(e.target.value as T)}>
        {options.map((o) => (
          <option key={o} value={o} className="bg-ink-900">{labels[o] ?? o}</option>
        ))}
      </select>
    </label>
  );
}

type Link = { label: I18n; href: string };
type Card = { icon: string; title: I18n; body: I18n; href: string; tone: string };

function ConfigForm({ kind, config, onChange }: { kind: CustomKind; config: unknown; onChange: (c: unknown) => void }) {
  const c = config as Record<string, unknown>;
  const set = (k: string, v: unknown) => onChange({ ...c, [k]: v });

  if (kind === "cards") {
    const items = (c.items as Card[]) ?? [];
    const setItem = (n: number, p: Partial<Card>) => set("items", items.map((it, i) => (i === n ? { ...it, ...p } : it)));
    const moveItem = (n: number, d: -1 | 1) => {
      const j = n + d;
      if (j < 0 || j >= items.length) return;
      const next = [...items];
      [next[n], next[j]] = [next[j], next[n]];
      set("items", next);
    };
    return (
      <div className="space-y-4">
        <Bi label="عنوان القسم" value={c.title as I18n} onChange={(v) => set("title", v)} />
        <Bi label="وصف تحت العنوان" value={c.subtitle as I18n} onChange={(v) => set("subtitle", v)} multiline />
        <Pick label="عدد الأعمدة" value={String(c.columns) as "2" | "3" | "4"} options={["2", "3", "4"] as const} labels={{ 2: "عمودان", 3: "3 أعمدة", 4: "4 أعمدة" }} onChange={(v) => set("columns", Number(v))} />
        <div className="space-y-3">
          {items.map((it, n) => (
            <div key={n} className="rounded-xl border border-fg/10 p-3">
              <div className="mb-3 flex items-center gap-2">
                <span className="text-sm font-semibold text-fg">بطاقة {n + 1}</span>
                <div className="ms-auto flex">
                  <button type="button" className={small} onClick={() => moveItem(n, -1)} disabled={n === 0} aria-label="أعلى"><ArrowUp className="h-4 w-4" /></button>
                  <button type="button" className={small} onClick={() => moveItem(n, 1)} disabled={n === items.length - 1} aria-label="أسفل"><ArrowDown className="h-4 w-4" /></button>
                  <button type="button" className={cn(small, "hover:text-red-300")} onClick={() => set("items", items.filter((_, i) => i !== n))} aria-label="حذف البطاقة"><Trash2 className="h-4 w-4" /></button>
                </div>
              </div>
              <div className="space-y-3">
                <div className="grid gap-3 sm:grid-cols-2">
                  <Pick label="الأيقونة" value={it.icon} options={SECTION_ICONS as readonly string[]} labels={ICON_LABELS} onChange={(v) => setItem(n, { icon: v })} />
                  <Pick label="اللون" value={it.tone} options={SECTION_TONES as readonly string[]} labels={TONE_LABELS} onChange={(v) => setItem(n, { tone: v })} />
                </div>
                <Bi label="العنوان" value={it.title} onChange={(v) => setItem(n, { title: v })} />
                <Bi label="النص" value={it.body} onChange={(v) => setItem(n, { body: v })} multiline />
                <Href label="رابط البطاقة (اختياري)" value={it.href} onChange={(v) => setItem(n, { href: v })} />
              </div>
            </div>
          ))}
          {items.length < 12 && (
            <button
              type="button"
              onClick={() => set("items", [...items, { icon: "sparkles", title: { ar: "", en: "" }, body: { ar: "", en: "" }, href: "", tone: "brand" }])}
              className="inline-flex items-center gap-2 text-sm font-semibold text-brand-300 hover:text-brand-200"
            >
              <Plus className="h-4 w-4" /> بطاقة جديدة
            </button>
          )}
        </div>
      </div>
    );
  }

  if (kind === "cta") {
    const p = c.primary as Link;
    const s = c.secondary as Link;
    return (
      <div className="space-y-4">
        <Bi label="العنوان" value={c.title as I18n} onChange={(v) => set("title", v)} />
        <Bi label="النص" value={c.body as I18n} onChange={(v) => set("body", v)} multiline />
        <Bi label="الزر الرئيسي" value={p.label} onChange={(v) => set("primary", { ...p, label: v })} />
        <Href label="رابط الزر الرئيسي" value={p.href} onChange={(v) => set("primary", { ...p, href: v })} />
        <Bi label="الزر الثانوي (اختياري)" value={s.label} onChange={(v) => set("secondary", { ...s, label: v })} />
        <Href label="رابط الزر الثانوي" value={s.href} onChange={(v) => set("secondary", { ...s, href: v })} />
      </div>
    );
  }

  if (kind === "banner") {
    const l = c.link as Link;
    return (
      <div className="space-y-4">
        <Bi label="نص البانر" value={c.text as I18n} onChange={(v) => set("text", v)} multiline />
        <Bi label="نص الرابط (اختياري)" value={l.label} onChange={(v) => set("link", { ...l, label: v })} />
        <Href value={l.href} onChange={(v) => set("link", { ...l, href: v })} />
        <div className="grid gap-3 sm:grid-cols-2">
          <Pick label="اللون" value={c.tone as string} options={SECTION_TONES as readonly string[]} labels={TONE_LABELS} onChange={(v) => set("tone", v)} />
          <label className="block space-y-1.5">
            <span className="text-xs font-semibold text-slate-400">يختفي بعد تاريخ (اختياري)</span>
            <input type="date" dir="ltr" className={input} value={(c.expires as string) ?? ""} onChange={(e) => set("expires", e.target.value)} />
          </label>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <Bi label="العنوان" value={c.title as I18n} onChange={(v) => set("title", v)} />
      <Bi label="النص (سطر فارغ = فقرة جديدة)" value={c.body as I18n} onChange={(v) => set("body", v)} multiline />
    </div>
  );
}
