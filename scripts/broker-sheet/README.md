# Broker verification sheet

A round trip for collecting real broker data by hand and publishing it.

```
database ──export_sheet.py──▶ xlsx (Google Sheets) ──fill in by hand──▶ import_sheet.py ──▶ SQL ──▶ Supabase SQL editor
```

Requires Python 3.10+ and `openpyxl` (`pip install openpyxl`).

## 1. Export

Run this in the Supabase SQL editor and save the single JSON cell as
`brokers.json`:

```sql
select json_agg(b order by b.sort_order, b.name) from (
  select br.*, coalesce((select json_agg(l) from public.broker_links l
                         where l.broker_id = br.id), '[]') as broker_links
  from public.brokers br) b;
```

```
python3 scripts/broker-sheet/export_sheet.py brokers.json -o FX-Partners-Brokers-Data.xlsx
```

Upload the file to Google Drive and open it with Google Sheets. The guide tab
explains every column. Do not delete the hidden «الأصل» tab: it is the copy
the import compares against.

## 2. Import

Download the filled sheet as .xlsx, then:

```
python3 scripts/broker-sheet/import_sheet.py FILLED.xlsx -o import.sql
```

It writes `import.sql` and `import.report.txt`. Read the report first. It lists,
per company, every field that will change, plus the cells it refused and why:
a spread that is not a number, a link without `https://`, an unknown regulator
or platform. Then paste `import.sql` into the SQL editor and run it. It is one
transaction, so it applies completely or not at all, and running it twice
changes nothing the second time.

What the import does and does not do:

- It writes only cells that differ from the hidden original. A sheet exported
  a month ago will not undo edits made on the site since.
- «غير متوفرة» or an empty cell becomes NULL, never a zero or a "no".
- Feature flags are tri-state: نعم = true, لا = false (checked and not
  offered), غير متوفرة = null (not checked).
- Licences are written only as regulator codes the site knows (FCA, CySEC,
  ASIC, FSCA, DFSA, FSA, CBCS, FSC). Anything else is reported, not guessed.
- A company set to «مرفوضة» is also unpublished.
- Referral links are added, never deleted. Remove a link from the admin panel.
- Ratings, review counts and the external-directory columns are read-only and
  are never imported.
- New rows (a slug not in the original) are inserted as drafts unless «النشر»
  says «منشورة».
