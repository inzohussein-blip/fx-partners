-- ===========================================================================
-- Migration 0025 — رصد النقرات: روابط الوكلاء وروابط حسابات الشركات
-- ---------------------------------------------------------------------------
-- قبل هذه الهجرة كان الرصد ناقصاً من طرفين:
--
--   * رابط الوكيل (/r/<slug>) يزيد عدّاداً واحداً فقط — بلا وقت ولا دولة ولا
--     مصدر. فلا يمكن معرفة «كم نقرة هذا الأسبوع» ولا من أين جاءت.
--
--   * نقرة رابط الشركة (/go/<code>) تُسجَّل بلا نسبة إلى الوكيل الذي جلب
--     الزائر. وهذا هو الرقم الأهم لوكيل ماستر: أي وكيل يقود فعلاً إلى فتح
--     حسابات لدى الشركات. كان مفقوداً تماماً.
--
-- تضيف هذه الهجرة صفوف أحداث للنقرات، وتنسب نقرة الشركة إلى الوكيل عبر
-- كوكي fxp_ref، وتوفّر دوال تجميع يومية يقرأها كل طرف في حدود صلاحيته.
-- ===========================================================================

-- ---------------------------------------------------------------------------
-- 1) أحداث نقرات روابط الوكلاء
-- ---------------------------------------------------------------------------
create table if not exists public.referral_link_clicks (
  id         uuid primary key default gen_random_uuid(),
  link_id    uuid references public.referral_links(id) on delete cascade,
  ib_id      uuid references public.ib_accounts(id) on delete cascade,
  country    text,
  referer    text,
  created_at timestamptz not null default now()
);
create index if not exists idx_ref_clicks_link on public.referral_link_clicks(link_id, created_at desc);
create index if not exists idx_ref_clicks_ib   on public.referral_link_clicks(ib_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 2) نسبة نقرة رابط الشركة إلى الوكيل الذي جلب الزائر
-- ---------------------------------------------------------------------------
alter table public.broker_link_clicks
  add column if not exists ib_id    uuid references public.ib_accounts(id) on delete set null,
  add column if not exists ref_slug text;

create index if not exists idx_link_clicks_ib
  on public.broker_link_clicks(ib_id, created_at desc);

-- ---------------------------------------------------------------------------
-- 3) تتبّع نقرة رابط الوكيل — تُستدعى من /r/<slug> والزائر غير مسجّل
-- ---------------------------------------------------------------------------
-- الدالة القديمة كانت بمعامل واحد. نُسقطها ونُنشئ نسخة بمعاملات اختيارية،
-- فتبقى الاستدعاءات القديمة بمعامل واحد صالحة.
drop function if exists public.track_referral_click(text);

create or replace function public.track_referral_click(
  link_slug text,
  p_country text default null,
  p_referer text default null
)
returns text
language plpgsql security definer set search_path = public as $$
declare
  v_id   uuid;
  v_ib   uuid;
  v_dest text;
begin
  update public.referral_links
     set clicks = clicks + 1
   where slug = link_slug and is_active = true
   returning id, ib_id, target_url into v_id, v_ib, v_dest;

  if v_id is null then
    return null;
  end if;

  insert into public.referral_link_clicks (link_id, ib_id, country, referer)
  values (v_id, v_ib, nullif(p_country, ''), left(nullif(p_referer, ''), 300));

  return v_dest;
end; $$;

grant execute on function public.track_referral_click(text, text, text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 4) تحويل slug إلى ib_id — يستعملها /go/<code> لنسب النقرة للوكيل
-- ---------------------------------------------------------------------------
create or replace function public.ib_for_ref_slug(link_slug text)
returns uuid
language sql stable security definer set search_path = public as $$
  select ib_id from public.referral_links
   where slug = link_slug and is_active = true
   limit 1;
$$;

grant execute on function public.ib_for_ref_slug(text) to anon, authenticated;

-- ---------------------------------------------------------------------------
-- 5) RLS
-- ---------------------------------------------------------------------------
alter table public.referral_link_clicks enable row level security;

-- الوكيل يقرأ نقراته هو فقط؛ المدير يقرأ الكل. لا أحد يكتب من العميل —
-- الكتابة تتمّ داخل دالة SECURITY DEFINER أعلاه.
drop policy if exists "ref clicks read" on public.referral_link_clicks;
create policy "ref clicks read" on public.referral_link_clicks
  for select using (public.owns_ib(ib_id) or public.is_admin());

-- نقرات روابط الشركات: كانت للمدير فقط. الوكيل الآن يرى النقرات المنسوبة
-- إليه — وهي حركته هو — ولا يرى شيئاً عن غيره.
drop policy if exists "clicks admin read" on public.broker_link_clicks;
drop policy if exists "clicks read" on public.broker_link_clicks;
create policy "clicks read" on public.broker_link_clicks
  for select using (public.is_admin() or public.owns_ib(ib_id));

-- ---------------------------------------------------------------------------
-- 6) دوال التقارير
-- ---------------------------------------------------------------------------
-- كلها SECURITY INVOKER: تعمل بصلاحيات المستدعي، فتصفّيها سياسات RLS أعلاه
-- تلقائياً — الوكيل يرى سطوره والمدير يرى الكل، بلا شرط مكرّر في كل دالة.

-- سلسلة يومية لنقرات روابط الوكيل.
create or replace function public.referral_clicks_daily(p_days int default 30)
returns table (day date, clicks bigint)
language sql stable set search_path = public as $$
  select d::date as day, count(c.id) as clicks
    from generate_series(
           current_date - (greatest(p_days, 1) - 1),
           current_date,
           interval '1 day'
         ) d
    left join public.referral_link_clicks c
      on c.created_at >= d and c.created_at < d + interval '1 day'
   group by d
   order by d;
$$;

-- سلسلة يومية لنقرات روابط الشركات.
create or replace function public.broker_clicks_daily(p_days int default 30)
returns table (day date, clicks bigint)
language sql stable set search_path = public as $$
  select d::date as day, count(c.id) as clicks
    from generate_series(
           current_date - (greatest(p_days, 1) - 1),
           current_date,
           interval '1 day'
         ) d
    left join public.broker_link_clicks c
      on c.created_at >= d and c.created_at < d + interval '1 day'
   group by d
   order by d;
$$;

-- أي وكيل يقود فعلاً إلى نقر روابط الشركات. هذا هو الرقم الذي لم يكن موجوداً.
create or replace function public.broker_clicks_by_agent(p_days int default 30)
returns table (ib_id uuid, ib_code text, display_name text, clicks bigint)
language sql stable set search_path = public as $$
  select a.id, a.ib_code, a.display_name, count(c.id) as clicks
    from public.broker_link_clicks c
    join public.ib_accounts a on a.id = c.ib_id
   where c.created_at >= now() - make_interval(days => greatest(p_days, 1))
   group by a.id, a.ib_code, a.display_name
   order by count(c.id) desc;
$$;

-- توزيع النقرات على الدول (لأي من الجدولين حسب p_source).
create or replace function public.clicks_by_country(
  p_days int default 30,
  p_source text default 'referral'
)
returns table (country text, clicks bigint)
language sql stable set search_path = public as $$
  select coalesce(country, '—') as country, count(*) as clicks
    from (
      select country, created_at from public.referral_link_clicks
       where p_source = 'referral'
      union all
      select country, created_at from public.broker_link_clicks
       where p_source = 'broker'
    ) s
   where created_at >= now() - make_interval(days => greatest(p_days, 1))
   group by 1
   order by 2 desc
   limit 20;
$$;

grant execute on function public.referral_clicks_daily(int)   to authenticated;
grant execute on function public.broker_clicks_daily(int)     to authenticated;
grant execute on function public.broker_clicks_by_agent(int)  to authenticated;
grant execute on function public.clicks_by_country(int, text) to authenticated;
