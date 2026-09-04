"use client";

import { useState } from "react";
import { useRouter } from "@/i18n/navigation";
import {
  saveBroker,
  deleteBroker,
  saveBrokerLink,
  deleteBrokerLink,
  approveReview,
  deleteReview,
  addAdminReview,
} from "@/lib/actions/brokers";
import { Stars, StarInput } from "@/components/brokers/stars";
import { BADGES, BADGE_KEYS, REGULATORS, REGULATOR_KEYS } from "@/lib/brokers";
import {
  Plus,
  Trash2,
  Loader2,
  Check,
  X,
  ChevronDown,
  Link2,
  ShieldCheck,
  Pencil,
  BarChart3,
} from "lucide-react";

type AdminLink = {
  id: string;
  label: string | null;
  referral_url: string;
  agent_commission: string | null;
  client_benefits: string | null;
  sort_order: number;
  code: string | null;
  clicks: number;
};

export type CountryStat = { country: string; hits: number };

export type AdminBroker = {
  id: string;
  slug: string;
  name: string;
  logo_url: string | null;
  status: "partnered" | "not_partnered";
  deposit_bonus: string | null;
  welcome_bonus: string | null;
  description: string | null;
  rating: number;
  reviews_count: number;
  badges: string[] | null;
  spread_from: number | null;
  leverage_max: string | null;
  bonus_no_deposit: boolean;
  bonus_withdrawable: boolean;
  supports_gold: boolean;
  licenses: string[] | null;
  is_published: boolean;
  sort_order: number;
  broker_links: AdminLink[];
};

export type PendingReview = {
  id: string;
  broker_id: string;
  broker_name: string;
  user_name: string | null;
  comment: string;
  stars: number;
  created_at: string;
};

const EMPTY = {
  id: undefined as string | undefined,
  name: "",
  slug: "",
  logo_url: "",
  status: "not_partnered" as "partnered" | "not_partnered",
  deposit_bonus: "",
  welcome_bonus: "",
  description: "",
  is_published: true,
  badges: [] as string[],
  spread_from: "",
  leverage_max: "",
  bonus_no_deposit: false,
  bonus_withdrawable: false,
  supports_gold: false,
  licenses: [] as string[],
};

const input =
  "w-full rounded-xl border border-white/10 bg-ink-900/60 px-3 py-2.5 text-white placeholder:text-slate-600 focus:border-brand-500/50 focus:outline-none";

export function BrokersManager({
  brokers,
  pending,
  countries = {},
}: {
  brokers: AdminBroker[];
  pending: PendingReview[];
  countries?: Record<string, CountryStat[]>;
}) {
  const router = useRouter();
  const [form, setForm] = useState({ ...EMPTY });
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);

  const refresh = () => router.refresh();

  async function submitBroker() {
    setError(null);
    if (!form.name.trim()) {
      setError("اسم الشركة مطلوب.");
      return;
    }
    setBusy("broker");
    const res = await saveBroker(form);
    setBusy(null);
    if (res.ok) {
      setForm({ ...EMPTY });
      refresh();
    } else setError(res.error ?? "تعذّر الحفظ.");
  }

  function editBroker(b: AdminBroker) {
    setForm({
      id: b.id,
      name: b.name,
      slug: b.slug,
      logo_url: b.logo_url ?? "",
      status: b.status,
      deposit_bonus: b.deposit_bonus ?? "",
      welcome_bonus: b.welcome_bonus ?? "",
      description: b.description ?? "",
      is_published: b.is_published,
      badges: b.badges ?? [],
      spread_from: b.spread_from != null ? String(b.spread_from) : "",
      leverage_max: b.leverage_max ?? "",
      bonus_no_deposit: b.bonus_no_deposit,
      bonus_withdrawable: b.bonus_withdrawable,
      supports_gold: b.supports_gold,
      licenses: b.licenses ?? [],
    });
    window.scrollTo({ top: 0, behavior: "smooth" });
  }

  async function removeBroker(id: string) {
    if (!confirm("حذف هذه الشركة وكل روابطها ومراجعاتها؟")) return;
    setBusy(id);
    await deleteBroker(id);
    setBusy(null);
    refresh();
  }

  async function togglePublish(b: AdminBroker) {
    setBusy(b.id);
    await saveBroker({
      id: b.id,
      name: b.name,
      status: b.status,
      deposit_bonus: b.deposit_bonus ?? "",
      welcome_bonus: b.welcome_bonus ?? "",
      description: b.description ?? "",
      logo_url: b.logo_url ?? "",
      is_published: !b.is_published,
      badges: b.badges ?? [],
      spread_from: b.spread_from,
      leverage_max: b.leverage_max ?? "",
      bonus_no_deposit: b.bonus_no_deposit,
      bonus_withdrawable: b.bonus_withdrawable,
      supports_gold: b.supports_gold,
      licenses: b.licenses ?? [],
    });
    setBusy(null);
    refresh();
  }

  function toggleBadge(key: string) {
    setForm((f) => ({
      ...f,
      badges: f.badges.includes(key)
        ? f.badges.filter((b) => b !== key)
        : [...f.badges, key],
    }));
  }

  return (
    <div className="space-y-8">
      {/* Broker form */}
      <section className="card-surface p-6">
        <h2 className="flex items-center gap-2 text-lg font-semibold text-white">
          {form.id ? <Pencil className="h-4 w-4 text-brand-300" /> : <Plus className="h-4 w-4 text-brand-300" />}
          {form.id ? "تعديل شركة" : "إضافة شركة"}
        </h2>
        <div className="mt-4 grid gap-3 sm:grid-cols-2">
          <input
            className={input}
            placeholder="اسم الشركة"
            value={form.name}
            onChange={(e) => setForm({ ...form, name: e.target.value })}
          />
          <input
            className={input}
            dir="ltr"
            placeholder="slug (اختياري — للرابط)"
            value={form.slug}
            onChange={(e) => setForm({ ...form, slug: e.target.value })}
          />
          <input
            className={input}
            dir="ltr"
            placeholder="رابط الشعار (logo URL)"
            value={form.logo_url}
            onChange={(e) => setForm({ ...form, logo_url: e.target.value })}
          />
          <select
            className={input}
            value={form.status}
            onChange={(e) =>
              setForm({ ...form, status: e.target.value as typeof form.status })
            }
          >
            <option value="not_partnered">غير متعاقد</option>
            <option value="partnered">شريك معتمد</option>
          </select>
          <input
            className={input}
            placeholder="بونص الإيداع (مثال: 100%)"
            value={form.deposit_bonus}
            onChange={(e) => setForm({ ...form, deposit_bonus: e.target.value })}
          />
          <input
            className={input}
            placeholder="البونص الترحيبي (مثال: $50)"
            value={form.welcome_bonus}
            onChange={(e) => setForm({ ...form, welcome_bonus: e.target.value })}
          />
          <input
            className={input}
            dir="ltr"
            type="number"
            step="0.1"
            placeholder="السبريد من (نقاط) — مثال: 0.1"
            value={form.spread_from}
            onChange={(e) => setForm({ ...form, spread_from: e.target.value })}
          />
          <input
            className={input}
            dir="ltr"
            placeholder="الرافعة القصوى — مثال: 1:2000"
            value={form.leverage_max}
            onChange={(e) => setForm({ ...form, leverage_max: e.target.value })}
          />
        </div>

        {/* Bonus / feature toggles */}
        <div className="mt-3 flex flex-wrap gap-4">
          {(
            [
              ["bonus_no_deposit", "بونص بدون إيداع"],
              ["bonus_withdrawable", "بونص قابل للسحب"],
              ["supports_gold", "يدعم تداول الذهب"],
            ] as const
          ).map(([key, label]) => (
            <label key={key} className="flex items-center gap-2 text-sm text-slate-300">
              <input
                type="checkbox"
                checked={form[key]}
                onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
                className="h-4 w-4 rounded accent-brand-500"
              />
              {label}
            </label>
          ))}
        </div>

        <textarea
          className={`${input} mt-3`}
          rows={4}
          placeholder="وصف الصفحة الكامل للشركة…"
          value={form.description}
          onChange={(e) => setForm({ ...form, description: e.target.value })}
        />

        <div className="mt-4">
          <span className="mb-2 block text-sm text-slate-300">التراخيص والرقابة المالية</span>
          <div className="flex flex-wrap gap-2">
            {REGULATOR_KEYS.map((key) => {
              const r = REGULATORS[key];
              const on = form.licenses.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() =>
                    setForm((f) => ({
                      ...f,
                      licenses: f.licenses.includes(key)
                        ? f.licenses.filter((x) => x !== key)
                        : [...f.licenses, key],
                    }))
                  }
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${
                    on
                      ? "bg-emerald-500/15 text-emerald-300 ring-emerald-500/30"
                      : "bg-white/5 text-slate-400 ring-white/10 hover:text-white"
                  }`}
                >
                  {r.flag} {r.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-4">
          <span className="mb-2 block text-sm text-slate-300">الشارات</span>
          <div className="flex flex-wrap gap-2">
            {BADGE_KEYS.map((key) => {
              const meta = BADGES[key];
              const on = form.badges.includes(key);
              return (
                <button
                  key={key}
                  type="button"
                  onClick={() => toggleBadge(key)}
                  className={`inline-flex items-center gap-1.5 rounded-full px-3 py-1.5 text-xs font-medium ring-1 transition ${
                    on
                      ? meta.className
                      : "bg-white/5 text-slate-400 ring-white/10 hover:text-white"
                  }`}
                >
                  <span>{meta.emoji}</span>
                  {meta.label}
                </button>
              );
            })}
          </div>
        </div>

        <div className="mt-3 flex items-center justify-between">
          <label className="flex items-center gap-2 text-sm text-slate-300">
            <input
              type="checkbox"
              checked={form.is_published}
              onChange={(e) => setForm({ ...form, is_published: e.target.checked })}
              className="h-4 w-4 rounded accent-brand-500"
            />
            منشور
          </label>
          <div className="flex gap-2">
            {form.id && (
              <button
                onClick={() => setForm({ ...EMPTY })}
                className="rounded-xl border border-white/10 px-4 py-2.5 text-sm text-slate-300 transition hover:text-white"
              >
                إلغاء
              </button>
            )}
            <button
              onClick={submitBroker}
              disabled={busy === "broker"}
              className="inline-flex items-center gap-2 rounded-xl bg-brand-gradient px-5 py-2.5 text-sm font-semibold text-white transition hover:opacity-90 disabled:opacity-60"
            >
              {busy === "broker" ? <Loader2 className="h-4 w-4 animate-spin" /> : "حفظ"}
            </button>
          </div>
        </div>
        {error && <p className="mt-2 text-sm text-red-400">{error}</p>}
      </section>

      {/* Moderation queue */}
      <section className="card-surface p-6">
        <h2 className="text-lg font-semibold text-white">
          قائمة الإشراف — تعليقات بانتظار الموافقة ({pending.length})
        </h2>
        {pending.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">لا توجد تعليقات معلّقة.</p>
        ) : (
          <div className="mt-4 space-y-3">
            {pending.map((r) => (
              <div key={r.id} className="rounded-xl border border-white/5 bg-ink-900/40 p-4">
                <div className="flex items-center justify-between gap-3">
                  <div>
                    <span className="font-medium text-white">{r.user_name || "عميل"}</span>
                    <span className="ms-2 text-xs text-slate-500">
                      على {r.broker_name}
                    </span>
                  </div>
                  <Stars value={r.stars} />
                </div>
                <p className="mt-2 text-sm text-slate-300" dir="auto">
                  {r.comment}
                </p>
                <div className="mt-3 flex gap-2">
                  <button
                    onClick={async () => {
                      setBusy(r.id);
                      await approveReview(r.id);
                      setBusy(null);
                      refresh();
                    }}
                    disabled={busy === r.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-emerald-500/15 px-3 py-1.5 text-xs text-emerald-300 transition hover:bg-emerald-500/25"
                  >
                    <Check className="h-3.5 w-3.5" /> موافقة
                  </button>
                  <button
                    onClick={async () => {
                      setBusy(r.id);
                      await deleteReview(r.id);
                      setBusy(null);
                      refresh();
                    }}
                    disabled={busy === r.id}
                    className="inline-flex items-center gap-1 rounded-lg bg-white/5 px-3 py-1.5 text-xs text-slate-300 transition hover:bg-red-500/10 hover:text-red-300"
                  >
                    <X className="h-3.5 w-3.5" /> حذف
                  </button>
                </div>
              </div>
            ))}
          </div>
        )}
      </section>

      {/* Brokers list */}
      <section className="card-surface p-6">
        <h2 className="text-lg font-semibold text-white">الشركات ({brokers.length})</h2>
        {brokers.length === 0 ? (
          <p className="mt-4 text-sm text-slate-500">لا توجد شركات بعد.</p>
        ) : (
          <ul className="mt-4 space-y-3">
            {brokers.map((b) => (
              <li key={b.id} className="rounded-xl border border-white/5 bg-ink-900/40">
                <div className="flex items-center justify-between gap-3 p-4">
                  <div className="min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="font-semibold text-white">{b.name}</span>
                      <span
                        className={`rounded-full px-2 py-0.5 text-[10px] ${
                          b.status === "partnered"
                            ? "bg-emerald-500/15 text-emerald-300"
                            : "bg-white/5 text-slate-400"
                        }`}
                      >
                        {b.status === "partnered" ? "شريك" : "غير متعاقد"}
                      </span>
                      {!b.is_published && (
                        <span className="rounded-full bg-white/5 px-2 py-0.5 text-[10px] text-slate-500">
                          مخفي
                        </span>
                      )}
                    </div>
                    <div className="mt-1 flex items-center gap-2 text-xs text-slate-500">
                      <Stars value={b.rating} size={12} />
                      <span dir="ltr">
                        {b.rating.toFixed(1)} ({b.reviews_count}) · {b.broker_links.length} رابط
                      </span>
                    </div>
                  </div>
                  <div className="flex shrink-0 items-center gap-1">
                    <button
                      onClick={() => togglePublish(b)}
                      disabled={busy === b.id}
                      className="rounded-lg px-2 py-1 text-xs text-slate-400 transition hover:text-white"
                    >
                      {b.is_published ? "إخفاء" : "نشر"}
                    </button>
                    <button
                      onClick={() => editBroker(b)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => removeBroker(b.id)}
                      disabled={busy === b.id}
                      className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-red-500/10 hover:text-red-300"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => setExpanded(expanded === b.id ? null : b.id)}
                      className="grid h-8 w-8 place-items-center rounded-lg text-slate-400 transition hover:bg-white/5 hover:text-white"
                    >
                      <ChevronDown
                        className={`h-4 w-4 transition ${expanded === b.id ? "rotate-180" : ""}`}
                      />
                    </button>
                  </div>
                </div>

                {expanded === b.id && (
                  <div className="border-t border-white/5 p-4">
                    <LinksEditor
                      broker={b}
                      countryStats={countries[b.id] ?? []}
                      onDone={refresh}
                    />
                    <AdminReplyForm brokerId={b.id} onDone={refresh} />
                  </div>
                )}
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}

function LinksEditor({
  broker,
  countryStats,
  onDone,
}: {
  broker: AdminBroker;
  countryStats: CountryStat[];
  onDone: () => void;
}) {
  const [label, setLabel] = useState("");
  const [url, setUrl] = useState("");
  const [commission, setCommission] = useState("");
  const [benefits, setBenefits] = useState("");
  const [busy, setBusy] = useState<string | null>(null);

  const totalClicks = broker.broker_links.reduce((s, l) => s + (l.clicks ?? 0), 0);

  async function add() {
    if (!url.trim()) return;
    setBusy("add");
    await saveBrokerLink({
      broker_id: broker.id,
      label,
      referral_url: url,
      agent_commission: commission,
      client_benefits: benefits,
    });
    setBusy(null);
    setLabel("");
    setUrl("");
    setCommission("");
    setBenefits("");
    onDone();
  }

  return (
    <div>
      <h4 className="flex items-center justify-between gap-2 text-sm font-semibold text-white">
        <span className="flex items-center gap-2">
          <Link2 className="h-4 w-4 text-brand-300" /> روابط الإحالة
        </span>
        <span className="inline-flex items-center gap-1 text-xs font-normal text-slate-400">
          <BarChart3 className="h-3.5 w-3.5" /> {totalClicks} نقرة
        </span>
      </h4>

      {broker.broker_links.length > 0 && (
        <ul className="mt-3 space-y-2">
          {broker.broker_links.map((l) => (
            <li
              key={l.id}
              className="flex items-center justify-between gap-3 rounded-lg bg-white/5 px-3 py-2 text-xs"
            >
              <div className="min-w-0 flex-1">
                <div className="truncate text-slate-300" dir="ltr">
                  {l.label ? `${l.label} · ` : ""}
                  {l.referral_url}
                </div>
                <div className="mt-0.5 flex flex-wrap items-center gap-x-2 text-[11px] text-slate-500">
                  {l.code && (
                    <span dir="ltr" className="text-brand-300">
                      /go/{l.code}
                    </span>
                  )}
                  <span className="inline-flex items-center gap-0.5">
                    <BarChart3 className="h-3 w-3" /> {l.clicks ?? 0}
                  </span>
                  {l.agent_commission ? <span>وكيل: {l.agent_commission}</span> : null}
                  {l.client_benefits ? <span>عميل: {l.client_benefits}</span> : null}
                </div>
              </div>
              <button
                onClick={async () => {
                  setBusy(l.id);
                  await deleteBrokerLink(l.id);
                  setBusy(null);
                  onDone();
                }}
                disabled={busy === l.id}
                className="shrink-0 text-slate-500 transition hover:text-red-300"
              >
                <Trash2 className="h-3.5 w-3.5" />
              </button>
            </li>
          ))}
        </ul>
      )}

      {countryStats.length > 0 && (
        <div className="mt-3 rounded-lg border border-white/5 bg-ink-900/40 p-3">
          <div className="text-[11px] font-medium text-slate-500">أهم الدول (نقرات)</div>
          <div className="mt-2 flex flex-wrap gap-2">
            {countryStats.map((c) => (
              <span
                key={c.country}
                className="inline-flex items-center gap-1 rounded-full bg-white/5 px-2 py-0.5 text-[11px] text-slate-300"
                dir="ltr"
              >
                {c.country} · {c.hits}
              </span>
            ))}
          </div>
        </div>
      )}

      <div className="mt-3 grid gap-2 sm:grid-cols-2">
        <input
          className={input}
          placeholder="عنوان الرابط (اختياري)"
          value={label}
          onChange={(e) => setLabel(e.target.value)}
        />
        <input
          className={input}
          dir="ltr"
          placeholder="رابط الإحالة"
          value={url}
          onChange={(e) => setUrl(e.target.value)}
        />
        <input
          className={input}
          placeholder="عمولة الوكيل (مثال: 5$ لكل لوت)"
          value={commission}
          onChange={(e) => setCommission(e.target.value)}
        />
        <input
          className={input}
          placeholder="مميزات العميل (مثال: سبريد مخفض)"
          value={benefits}
          onChange={(e) => setBenefits(e.target.value)}
        />
      </div>
      <button
        onClick={add}
        disabled={busy === "add"}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-brand-500/15 px-3 py-2 text-xs font-semibold text-brand-200 transition hover:bg-brand-500/25"
      >
        {busy === "add" ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        إضافة رابط
      </button>
    </div>
  );
}

function AdminReplyForm({ brokerId, onDone }: { brokerId: string; onDone: () => void }) {
  const [comment, setComment] = useState("");
  const [stars, setStars] = useState(5);
  const [name, setName] = useState("");
  const [busy, setBusy] = useState(false);

  async function post() {
    if (!comment.trim()) return;
    setBusy(true);
    await addAdminReview({ brokerId, comment, stars, displayName: name });
    setBusy(false);
    setComment("");
    setName("");
    setStars(5);
    onDone();
  }

  return (
    <div className="mt-5 border-t border-white/5 pt-4">
      <h4 className="flex items-center gap-2 text-sm font-semibold text-white">
        <ShieldCheck className="h-4 w-4 text-brand-300" /> إضافة تقييم/رد بصفتك الإدارة
      </h4>
      <div className="mt-3 flex items-center gap-3">
        <StarInput value={stars} onChange={setStars} size={22} />
        <input
          className={`${input} flex-1`}
          placeholder="اسم العرض (افتراضي: إدارة FX Partners)"
          value={name}
          onChange={(e) => setName(e.target.value)}
        />
      </div>
      <textarea
        className={`${input} mt-2`}
        rows={2}
        placeholder="نص التقييم/الرد الرسمي…"
        value={comment}
        onChange={(e) => setComment(e.target.value)}
      />
      <button
        onClick={post}
        disabled={busy}
        className="mt-2 inline-flex items-center gap-1.5 rounded-lg bg-white/5 px-3 py-2 text-xs font-semibold text-slate-200 transition hover:bg-white/10"
      >
        {busy ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Plus className="h-3.5 w-3.5" />}
        نشر (يظهر فوراً)
      </button>
    </div>
  );
}
