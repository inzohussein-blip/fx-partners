#!/usr/bin/env python3
"""
Turn a filled-in broker verification sheet into one SQL file for Supabase.

    python3 scripts/broker-sheet/import_sheet.py FILLED.xlsx [-o import.sql]

The sheet (see export_sheet.py) carries a hidden copy of every row as it was
exported ("الأصل"). This script compares each company row with its original,
by slug, and writes an UPDATE for the cells that actually changed — so a stale
sheet cannot overwrite edits made on the site since, and re-sorting or
filtering rows changes nothing. Rows whose slug is not in the original are
new companies and become INSERTs.

Nothing is written to the database here. The output is reviewed and then run
in the Supabase SQL editor, inside one transaction.

Rules that mirror the site's own:
  * "غير متوفرة" or an empty cell is NULL — never a zero, never a "no".
  * Feature flags are tri-state: نعم = true, لا = false, غير متوفرة = null.
  * Only regulator codes the site knows are written as licences; anything
    else is reported, not guessed.
  * Ratings and review counts are read-only (they come from real reviews);
    the external-directory columns are reference only. Neither is imported.
  * A company marked «مرفوضة» is also unpublished.
  * Referral links are added, never deleted.
"""

from __future__ import annotations

import argparse
import datetime as dt
import re
import sys
from dataclasses import dataclass, field

from openpyxl import load_workbook

MAIN, ORIG = "الشركات", "الأصل"
NA = "غير متوفرة"

# ---- value vocabularies (must match src/lib/brokers.ts) --------------------
REGULATORS = {"fca": "fca", "cysec": "cysec", "asic": "asic", "fsca": "fsca", "dfsa": "dfsa",
              "fsa": "fsa", "cbcs": "cbcs", "fsc": "fscm", "fscm": "fscm"}
PLATFORMS = {"mt4": "mt4", "metatrader 4": "mt4", "metatrader4": "mt4",
             "mt5": "mt5", "metatrader 5": "mt5", "metatrader5": "mt5",
             "ctrader": "ctrader", "tradingview": "tradingview",
             "منصّة خاصة": "proprietary", "منصة خاصة": "proprietary", "خاصة": "proprietary",
             "proprietary": "proprietary"}
BADGES = {"الأعلى طلباً": "hot", "أفضل بونص ترحيبي": "best_welcome", "شريك بلاتيني": "platinum",
          "الأعلى تقييماً": "top_rated", "أقل سبريد": "low_spread"}
BADGE_KEYS = set(BADGES.values())
VERIFY = {"موثّقة": "verified", "موثقة": "verified", "موثّقة جزئياً": "partial", "موثقة جزئيا": "partial",
          "موثقة جزئياً": "partial", "غير موثّقة": "unverified", "غير موثقة": "unverified",
          "قيد التحقّق": "in_review", "قيد التحقق": "in_review", "مرفوضة": "rejected"}
YES, NO = {"نعم", "yes", "true"}, {"لا", "no", "false"}

# ---- sheet column -> database field ----------------------------------------
# (group, header): (db column, kind). Group names are the merged band in row 1.
G_TRACK, G_SITE, G_LIC, G_TERMS, G_FEAT, G_BONUS, G_LINK = (
    "المتابعة", "الظهور في الموقع", "الترخيص والكيان القانوني", "شروط التداول",
    "المزايا", "البونصات", "الشراكة والإحالة")
FIELDS: dict[tuple[str, str], tuple[str, str]] = {
    (G_TRACK, "اسم الشركة"): ("name", "name"),
    (G_TRACK, "حالة التوثيق"): ("verification_status", "verify"),
    (G_TRACK, "تاريخ آخر مراجعة"): ("verified_at", "date"),
    (G_SITE, "النشر"): ("is_published", "publish"),
    (G_SITE, "علاقة الشراكة"): ("status", "partner"),
    (G_SITE, "ترتيب العرض"): ("sort_order", "int"),
    (G_SITE, "رابط الشعار"): ("logo_url", "url"),
    (G_SITE, "الوصف في الموقع"): ("description", "text"),
    (G_LIC, "التراخيص الموثّقة"): ("licenses", "licences"),
    (G_LIC, "الكيان القانوني"): ("legal_entity", "text"),
    (G_LIC, "رقم الترخيص"): ("licence_numbers", "text"),
    (G_LIC, "رابط التحقّق في سجل الجهة الرقابية"): ("verification_url", "url"),
    (G_LIC, "الموقع الرسمي"): ("official_website", "url"),
    (G_TERMS, "سبريد يبدأ من (نقطة)"): ("spread_from", "spread"),
    (G_TERMS, "الرافعة القصوى"): ("leverage_max", "leverage"),
    (G_TERMS, "الحد الأدنى للإيداع ($)"): ("min_deposit", "money"),
    (G_TERMS, "المنصّات"): ("platforms", "platforms"),
    (G_TERMS, "طرق الإيداع"): ("deposit_methods", "list"),
    (G_TERMS, "الدول المقبولة"): ("accepted_countries", "countries"),
    (G_FEAT, "حساب إسلامي (بدون سواب)"): ("swap_free", "bool"),
    (G_FEAT, "الروبوتات (EA)"): ("supports_ea", "bool"),
    (G_FEAT, "التحوّط (Hedging)"): ("allows_hedging", "bool"),
    (G_FEAT, "السكالبينغ"): ("allows_scalping", "bool"),
    (G_FEAT, "تداول الذهب"): ("supports_gold", "bool"),
    (G_BONUS, "بونص الإيداع"): ("deposit_bonus", "text"),
    (G_BONUS, "بونص ترحيبي"): ("welcome_bonus", "text"),
    (G_BONUS, "بونص بدون إيداع"): ("bonus_no_deposit", "bool"),
    (G_BONUS, "البونص قابل للسحب"): ("bonus_withdrawable", "bool"),
    (G_BONUS, "الشارات"): ("badges", "badges"),
    (G_LINK, "رابط الإحالة"): ("referral_url", "links"),
    (G_LINK, "عمولة الوكيل"): ("agent_commission", "link_text"),
    (G_LINK, "مزايا العميل"): ("client_benefits", "link_text"),
}
# Columns with no copy in «الأصل»: written for every row, but only when the
# value differs from the database (IS DISTINCT FROM), so unchanged rows no-op.
UNTRACKED = {"name", "verification_status", "verified_at"}
ARRAY_FIELDS = {"licenses", "platforms", "deposit_methods", "accepted_countries", "badges"}


class Invalid(ValueError):
    pass


# ---- parsing ----------------------------------------------------------------
ARABIC_DIGITS = str.maketrans("٠١٢٣٤٥٦٧٨٩۰۱۲۳۴۵۶۷۸۹٫", "01234567890123456789.")


def blank(v) -> bool:
    return v is None or (isinstance(v, str) and v.strip() in ("", NA, "—", "-"))


def text(v) -> str:
    if isinstance(v, float) and v.is_integer():
        v = int(v)
    return str(v).strip()


def norm(v) -> str:
    """Comparable form of a cell: dates as ISO, whole floats as ints."""
    if v is None:
        return ""
    if isinstance(v, dt.datetime):
        return v.date().isoformat()
    if isinstance(v, dt.date):
        return v.isoformat()
    return text(v)


def split_list(v) -> list[str]:
    return [p.strip() for p in re.split(r"[،,;\n]+", text(v)) if p.strip()]


def number(v, *, lo: float, hi: float, integer=False) -> float | int:
    if isinstance(v, (int, float)) and not isinstance(v, bool):
        n = float(v)
    else:
        s = text(v).translate(ARABIC_DIGITS).replace("$", "").replace("نقطة", "").replace(" ", "")
        s = s.replace(",", ".") if s.count(",") == 1 and "." not in s else s.replace(",", "")
        try:
            n = float(s)
        except ValueError:
            raise Invalid(f"ليس رقماً: «{text(v)}»")
    if not (lo <= n <= hi):
        raise Invalid(f"خارج النطاق المعقول ({lo}–{hi}): {n:g}")
    if integer:
        if not n.is_integer():
            raise Invalid(f"يجب أن يكون عدداً صحيحاً: {n:g}")
        return int(n)
    return round(n, 2)


def url(v) -> str:
    s = text(v)
    if not re.match(r"^https?://[^\s]+\.[^\s]+$", s, re.I):
        raise Invalid(f"ليس رابطاً يبدأ بـ http(s)://: «{s}»")
    return s


def parse(kind: str, v, warn) -> object:
    """Cell value -> Python value for the database. None means NULL."""
    if kind in ("links",):
        return [] if blank(v) else [url(u) for u in re.split(r"[\s،,]+", text(v)) if u.strip()]
    if blank(v):
        if kind == "name":
            raise Invalid("اسم الشركة لا يمكن أن يكون فارغاً")
        if kind in ("publish", "partner"):
            raise Invalid("الحقل مطلوب")
        return [] if kind in ("licences", "platforms", "list", "countries", "badges") else None
    if kind in ("text", "name", "link_text"):
        return text(v)
    if kind == "url":
        return url(v)
    if kind == "int":
        return number(v, lo=0, hi=100000, integer=True)
    if kind == "spread":
        return number(v, lo=0, hi=100)
    if kind == "money":
        return number(v, lo=0, hi=10_000_000)
    if kind == "leverage":
        s = text(v).translate(ARABIC_DIGITS).replace(" ", "")
        m = re.fullmatch(r"1:(\d{1,5})", s)
        if not m:
            raise Invalid(f"الصيغة المتوقعة 1:500، وجدت «{text(v)}»")
        return f"1:{int(m.group(1))}"
    if kind == "bool":
        s = text(v).lower()
        if s in YES:
            return True
        if s in NO:
            return False
        raise Invalid(f"القيم المقبولة: نعم / لا / غير متوفرة — وجدت «{text(v)}»")
    if kind == "publish":
        s = text(v)
        if s in ("منشورة", "منشور"):
            return True
        if s in ("مسودة",):
            return False
        raise Invalid(f"القيم المقبولة: منشورة / مسودة — وجدت «{s}»")
    if kind == "partner":
        s = text(v)
        if s == "شريك معتمد":
            return "partnered"
        if s == "غير متعاقد":
            return "not_partnered"
        raise Invalid(f"القيم المقبولة: شريك معتمد / غير متعاقد — وجدت «{s}»")
    if kind == "verify":
        s = text(v)
        if s not in VERIFY:
            raise Invalid(f"حالة توثيق غير معروفة: «{s}»")
        return VERIFY[s]
    if kind == "date":
        if isinstance(v, dt.datetime):
            return v.date().isoformat()
        if isinstance(v, dt.date):
            return v.isoformat()
        s = text(v).translate(ARABIC_DIGITS).replace("/", "-")
        try:
            return dt.date.fromisoformat(s).isoformat()
        except ValueError:
            raise Invalid(f"التاريخ بصيغة 2026-09-24، وجدت «{text(v)}»")
    if kind == "licences":
        out = []
        for tok in split_list(v):
            code = REGULATORS.get(tok.lower().split(":")[0].strip())
            if code:
                out.append(code)
            else:
                warn(f"جهة رقابية غير مدعومة في الموقع «{tok}» — لم تُكتب (المدعوم: FCA، CySEC، ASIC، FSCA، DFSA، FSA، CBCS، FSC)")
        return list(dict.fromkeys(out))
    if kind == "platforms":
        out = []
        for tok in split_list(v):
            code = PLATFORMS.get(tok.lower())
            if code:
                out.append(code)
            else:
                warn(f"منصّة غير معروفة «{tok}» — لم تُكتب (المعروف: MT4، MT5، cTrader، TradingView، منصّة خاصة)")
        return list(dict.fromkeys(out))
    if kind == "countries":
        out = []
        for tok in split_list(v):
            t = tok.upper()
            if re.fullmatch(r"[A-Z]{2}", t):
                out.append(t)
            else:
                warn(f"رمز دولة غير صالح «{tok}» — يجب أن يكون حرفين مثل IQ أو SA")
        return list(dict.fromkeys(out))
    if kind == "badges":
        out = []
        for tok in split_list(v):
            key = BADGES.get(tok) or (tok if tok in BADGE_KEYS else None)
            if key:
                out.append(key)
            else:
                warn(f"شارة غير معروفة «{tok}» — لم تُكتب")
        return list(dict.fromkeys(out))
    if kind == "list":
        return split_list(v)
    raise AssertionError(kind)


# ---- SQL --------------------------------------------------------------------
def lit(v) -> str:
    if v is None:
        return "null"
    if isinstance(v, bool):
        return "true" if v else "false"
    if isinstance(v, (int, float)):
        return repr(v)
    if isinstance(v, list):
        return "'{}'::text[]" if not v else "array[" + ", ".join(lit(x) for x in v) + "]::text[]"
    return "'" + str(v).replace("'", "''") + "'"


def cast(col: str, value) -> str:
    if col == "status":
        return lit(value) + "::broker_status"
    if col == "verified_at" and value is not None:
        return lit(value) + "::date"
    return lit(value)


# ---- sheet reading ------------------------------------------------------------
def columns(ws) -> dict[tuple[str, str], int]:
    """(group, header) -> column index, reading the merged group band."""
    out, group = {}, ""
    for c in range(1, ws.max_column + 1):
        g = ws.cell(1, c).value
        if g:
            group = str(g).strip()
        h = ws.cell(2, c).value
        if h:
            out[(group, str(h).strip())] = c
    return out


@dataclass
class Row:
    slug: str
    name: str
    changes: dict[str, object] = field(default_factory=dict)
    untracked: dict[str, object] = field(default_factory=dict)
    links: list[str] = field(default_factory=list)
    link_text: dict[str, object] = field(default_factory=dict)
    notes: list[str] = field(default_factory=list)
    is_new: bool = False


def read(path: str) -> tuple[list[Row], list[str]]:
    wb = load_workbook(path, data_only=True)
    if MAIN not in wb.sheetnames:
        sys.exit(f"الورقة «{MAIN}» غير موجودة في الملف.")
    ws = wb[MAIN]
    orig = wb[ORIG] if ORIG in wb.sheetnames else None
    cols = columns(ws)
    ocols = columns(orig) if orig else {}
    slug_col = cols.get((G_TRACK, "المعرّف (slug)"))
    if not slug_col:
        sys.exit("عمود «المعرّف (slug)» غير موجود — هل هذا ملف بيانات الشركات؟")
    problems: list[str] = []
    if orig is None:
        problems.append("الورقة المخفية «الأصل» غير موجودة: لا يمكن معرفة ما تغيّر، فكل الصفوف ستُعامل كتعديل كامل.")

    original: dict[str, dict[int, object]] = {}
    if orig:
        oslug = ocols.get((G_TRACK, "المعرّف (slug)"), 2)
        for r in range(3, orig.max_row + 1):
            s = orig.cell(r, oslug).value
            if s:
                original[str(s).strip()] = {c: orig.cell(r, c).value for c in range(1, orig.max_column + 1)}

    # «الأصل» columns that hold any value. In sheets exported before the name,
    # status and date were copied there, those columns are empty throughout.
    populated = {c for snap in original.values() for c, val in snap.items() if val is not None}

    rows, seen = [], set()
    for r in range(3, ws.max_row + 1):
        raw_slug = ws.cell(r, slug_col).value
        if blank(raw_slug):
            continue
        slug = text(raw_slug).lower()
        if slug in seen:
            problems.append(f"صف {r}: المعرّف «{slug}» مكرّر — تجاهلت التكرار.")
            continue
        seen.add(slug)
        name_col = cols.get((G_TRACK, "اسم الشركة"))
        row = Row(slug=slug, name=text(ws.cell(r, name_col).value) if name_col else slug)
        if not re.fullmatch(r"[a-z0-9]+(?:-[a-z0-9]+)*", slug):
            problems.append(f"صف {r}: المعرّف «{slug}» غير صالح (حروف إنجليزية صغيرة وأرقام وشرطات فقط) — تجاهلت الصف.")
            continue
        row.is_new = bool(original) and slug not in original
        before = original.get(slug)

        for key, (col, kind) in FIELDS.items():
            c = cols.get(key)
            if not c:
                continue
            v = ws.cell(r, c).value
            oc = ocols.get(key)
            # Diffed against «الأصل» when it holds this column. Sheets exported
            # before name/status/date were copied there fall back to the
            # "write where different" batch below.
            tracked = (not row.is_new and before is not None and bool(oc)
                       and (col not in UNTRACKED or oc in populated))
            if tracked:
                o = before.get(oc)
                if norm(v) == norm(o):
                    continue  # unchanged
            elif col in UNTRACKED and not row.is_new and blank(v) and col != "name":
                continue  # an empty date/status is "not filled in", not "clear it"
            try:
                val = parse(kind, v, lambda m: row.notes.append(f"⚠️ {key[1]}: {m}"))
            except Invalid as e:
                row.notes.append(f"❌ {key[1]}: {e} — لم يُكتب هذا الحقل")
                continue
            if kind == "links":
                row.links = val  # type: ignore[assignment]
            elif kind == "link_text":
                row.link_text[col] = val
            elif col in UNTRACKED and not row.is_new and not tracked:
                row.untracked[col] = val
            else:
                row.changes[col] = val

        status = row.changes.get("verification_status", row.untracked.get("verification_status"))
        if status == "rejected":
            row.changes["is_published"] = False
            row.notes.append("ℹ️ الحالة «مرفوضة»: أُخفيت الشركة من الموقع (مسودة).")
        if status == "verified" and (row.changes.get("licenses") == []):
            row.notes.append("⚠️ الحالة «موثّقة» لكن عمود التراخيص فارغ.")
        rows.append(row)
    return rows, problems


def build_sql(rows: list[Row], source: str) -> str:
    out = [
        "-- ===========================================================================",
        f"-- Broker sheet import — generated {dt.datetime.now():%Y-%m-%d %H:%M} from {source}",
        "-- Review, then run the whole file in the Supabase SQL editor. One transaction:",
        "-- if any statement fails, nothing is applied.",
        "-- ===========================================================================",
        "",
        "begin;",
        "",
    ]
    for row in rows:
        stmts = []
        if row.is_new:
            # Empty cells are simply left to the column defaults.
            data = {"slug": row.slug, "name": row.name,
                    **{k: v for k, v in row.changes.items() if v is not None and v != []}}
            data.setdefault("is_published", False)
            data.setdefault("status", "not_partnered")
            data.setdefault("sort_order", 900)  # after the existing directory
            cols = ", ".join(data)
            vals = ", ".join(cast(k, v) for k, v in data.items())
            stmts.append(f"insert into public.brokers ({cols})\nvalues ({vals})\non conflict (slug) do nothing;")
        else:
            if row.changes:
                sets = ",\n  ".join(f"{k} = {cast(k, v)}" for k, v in row.changes.items())
                stmts.append(f"update public.brokers set\n  {sets},\n  updated_at = now()\nwhere slug = {lit(row.slug)};")
        for u in row.links:
            comm = row.link_text.get("agent_commission")
            ben = row.link_text.get("client_benefits")
            stmts.append(
                "insert into public.broker_links (broker_id, referral_url, agent_commission, client_benefits, code)\n"
                f"select b.id, {lit(u)}, {lit(comm)}, {lit(ben)}, substr(md5(random()::text || clock_timestamp()::text), 1, 7)\n"
                f"from public.brokers b where b.slug = {lit(row.slug)}\n"
                f"  and not exists (select 1 from public.broker_links l where l.broker_id = b.id and l.referral_url = {lit(u)});"
            )
        if row.link_text and not (row.is_new and all(v is None for v in row.link_text.values())):
            # Commission / client benefits apply to every link of the broker,
            # including any added just above.
            sets = ", ".join(f"{k} = {lit(v)}" for k, v in row.link_text.items())
            stmts.append(
                f"update public.broker_links l set {sets}\n"
                f"from public.brokers b where l.broker_id = b.id and b.slug = {lit(row.slug)};"
            )
        if stmts:
            out.append(f"-- {row.name} ({row.slug}){' — شركة جديدة' if row.is_new else ''}")
            out.extend(stmts)
            out.append("")
    # Name, verification status and review date have no copy in «الأصل», so
    # they are sent for every row — one statement per column, touching only
    # rows where the value actually differs.
    for col in ("name", "verification_status", "verified_at"):
        pairs = [(r.slug, r.untracked[col]) for r in rows if col in r.untracked and not r.is_new]
        if not pairs:
            continue
        typ = {"verified_at": "date"}.get(col, "text")
        values = ",\n  ".join(f"({lit(sl)}, {lit(v)})" for sl, v in pairs)
        out += [
            f"-- {col}: applied only where it differs",
            f"update public.brokers b set {col} = v.val::{typ}, updated_at = now()",
            f"from (values\n  {values}\n) as v(slug, val)",
            f"where b.slug = v.slug and b.{col} is distinct from v.val::{typ};",
            "",
        ]
    out += [
        "commit;",
        "",
        "-- Check afterwards:",
        "-- select slug, name, is_published, verification_status, licenses, spread_from, min_deposit, swap_free",
        "-- from public.brokers order by updated_at desc limit 50;",
        "",
    ]
    return "\n".join(out)


def build_report(rows: list[Row], problems: list[str]) -> str:
    changed = [r for r in rows if r.changes or r.links or r.link_text]
    new = [r for r in rows if r.is_new]
    lines = ["تقرير استيراد ملف بيانات الشركات", "=" * 34, "",
             f"صفوف مقروءة: {len(rows)}",
             f"شركات عُدّلت حقولها: {len([r for r in changed if not r.is_new])}",
             f"شركات جديدة: {len(new)}",
             f"روابط إحالة جديدة: {sum(len(r.links) for r in rows)}",
             f"أخطاء (حقول لم تُكتب): {sum(1 for r in rows for n in r.notes if n.startswith('❌'))}",
             f"تنبيهات: {sum(1 for r in rows for n in r.notes if n.startswith('⚠️'))}", ""]
    if problems:
        lines += ["مشاكل عامة:"] + [f"  - {p}" for p in problems] + [""]
    for r in rows:
        # Untracked values are sent for every row; list them only where they
        # say something (a verification outcome, a date, or alongside edits).
        busy = bool(r.changes or r.links or r.link_text)
        interesting_untracked = {k: v for k, v in r.untracked.items()
                                 if k != "name" and (busy or k == "verified_at"
                                                     or v in ("verified", "rejected"))}
        if not (r.changes or r.links or r.link_text or r.notes or interesting_untracked):
            continue
        lines.append(f"■ {r.name} ({r.slug}){' — جديدة' if r.is_new else ''}")
        for k, v in r.changes.items():
            if r.is_new and (v is None or v == []):
                continue
            shown = "فارغ" if v is None or v == [] else ("، ".join(v) if isinstance(v, list) else v)
            lines.append(f"    {k} ← {shown}")
        for k, v in interesting_untracked.items():
            lines.append(f"    {k} ← {v if v is not None else 'فارغ'}   (يُكتب فقط إن اختلف عن الموقع)")
        for u in r.links:
            lines.append(f"    رابط إحالة جديد ← {u}")
        for k, v in r.link_text.items():
            if r.is_new and v is None:
                continue
            lines.append(f"    {k} ← {v if v is not None else 'فارغ'}")
        lines += [f"    {n}" for n in r.notes]
        lines.append("")
    lines.append("الحقول بلا نسخة أصلية (الاسم، حالة التوثيق، تاريخ المراجعة) تُكتب لكل الصفوف، لكن فقط حين تختلف عن قاعدة البيانات.")
    return "\n".join(lines)


def main() -> None:
    ap = argparse.ArgumentParser(description=__doc__, formatter_class=argparse.RawDescriptionHelpFormatter)
    ap.add_argument("xlsx")
    ap.add_argument("-o", "--out", default="broker-sheet-import.sql")
    ap.add_argument("--report", default=None, help="report path (default: <out>.report.txt)")
    a = ap.parse_args()
    rows, problems = read(a.xlsx)
    sql = build_sql(rows, a.xlsx.split("/")[-1])
    report = build_report(rows, problems)
    open(a.out, "w", encoding="utf-8").write(sql)
    rp = a.report or a.out.rsplit(".", 1)[0] + ".report.txt"
    open(rp, "w", encoding="utf-8").write(report)
    print("\n".join(report.splitlines()[:9]))
    print(f"\nSQL → {a.out}\nالتقرير → {rp}")


if __name__ == "__main__":
    main()
