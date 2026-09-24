-- ===========================================================================
-- FX Partners — WikiFX external directory (50 brokers)
-- ===========================================================================
-- Source: the ATUOFX repo's wikifx_import_to_supabase.sql, scraped from
-- wikifx.com. THIRD-PARTY, UNVERIFIED. Populates only external_* columns
-- (migration 0030) plus name/logo/platforms; never the review-based rating,
-- reviews_count, or a verified licenses badge. Country/model live in
-- external_wikifx and the UI shows them attributed to WikiFX.
--
-- Existing verified brokers (xm, vantage) match by slug and gain ONLY the
-- external_* fields; their verified data is untouched. Safe to re-run.
-- Run in Supabase SQL Editor on the fx-partners project (ijapxesrwtsdhqhcmnjh).
-- ===========================================================================

begin;

insert into public.brokers
  (slug, name, status, logo_url, is_published, sort_order,
   external_score, external_source, external_wikifx, platforms, description)
values
(
  'avatrade', 'AVATRADE أفاتريد', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/638524966565554499/FXT638524966565554499_113163.png_wiki-template-global', true, 100,
  9.5, 'wikifx', '{"score": 9.5, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "15-20 سنة", "account_type": "ECN", "tags": ["المتجر الرئيسي", "رخصة كاملة", "أعمال عالمية", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/8261153765.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«AVATRADE أفاتريد» مُدرَج في تصنيف WikiFX الخارجي بتقييم 9.5/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'fxcm', 'FXCM', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/0001698019/FXT0001698019_907528.png_wiki-template-global', true, 101,
  9.4, 'wikifx', '{"score": 9.4, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "فوق 20 سنة", "account_type": null, "tags": ["المتجر الرئيسي", "رخصة كاملة", "الوسطاء الإقليميون", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/0001698019.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«FXCM» مُدرَج في تصنيف WikiFX الخارجي بتقييم 9.4/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'ec-markets', 'EC markets', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/638587355731434043/FXT638587355731434043_372803.png_wiki-template-global', true, 102,
  9.24, 'wikifx', '{"score": 9.24, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "10-15 سنة", "account_type": "ECN", "tags": ["المتجر الرئيسي", "رخصة كاملة", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/2001150169.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«EC markets» مُدرَج في تصنيف WikiFX الخارجي بتقييم 9.24/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'gtcfx', 'GTCFX', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/639094285777579614/FXT639094285777579614_155886.png_wiki-template-global', true, 103,
  9.23, 'wikifx', '{"score": 9.23, "regulated_country": "المملكة المتحدة صناعة", "business_model": null, "years": "15-20 سنة", "account_type": "ECN", "tags": ["المتجر الرئيسي", "رخصة كاملة", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/8791637328.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«GTCFX» مُدرَج في تصنيف WikiFX الخارجي بتقييم 9.23/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'finalto', 'Finalto', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/637472792727597608/FXT637472792727597608_331230.jpg_wiki-template-global', true, 104,
  9.2, 'wikifx', '{"score": 9.2, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "10-15 سنة", "account_type": null, "tags": ["التنظيم في الخارج", "رخصة كاملة", "أعمال عالمية", "مخاطر متوسطة محتملة", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/9671603159.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«Finalto» مُدرَج في تصنيف WikiFX الخارجي بتقييم 9.2/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'xm', 'XM', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/0001461138/FXT0001461138_240474.png_wiki-template-global', true, 105,
  9.1, 'wikifx', '{"score": 9.1, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "15-20 سنة", "account_type": "ECN", "tags": ["المتجر الرئيسي", "رخصة كاملة", "أعمال عالمية", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/0001461138.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«XM» مُدرَج في تصنيف WikiFX الخارجي بتقييم 9.1/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'trade-nation', 'TRADE NATION', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/5411633122/FXT5411633122_468951.png_wiki-template-global', true, 106,
  9.09, 'wikifx', '{"score": 9.09, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "10-15 سنة", "account_type": null, "tags": ["التنظيم في الخارج", "رخصة كاملة", "الوسطاء الإقليميون", "مخاطر متوسطة محتملة", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/5411633122.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«TRADE NATION» مُدرَج في تصنيف WikiFX الخارجي بتقييم 9.09/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'go-markets', 'GO Markets', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/638986392774342524/FXT638986392774342524_916918.png_wiki-template-global', true, 107,
  8.98, 'wikifx', '{"score": 8.98, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "فوق 20 سنة", "account_type": null, "tags": ["المتجر الرئيسي", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/0001591281.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  '{}'::text[],
  '«GO Markets» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.98/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'ic-markets-global', 'IC Markets Global', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/639057483006328644/FXT639057483006328644_897490.png_wiki-template-global', true, 108,
  8.9, 'wikifx', '{"score": 8.9, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "15-20 سنة", "account_type": "ECN", "tags": ["المتجر الرئيسي", "رخصة كاملة", "أعمال عالمية", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/9641842942.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«IC Markets Global» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.9/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'fpmarkets', 'fpmarkets', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/637812999570177523/FXT637812999570177523_568066.png_wiki-template-global', true, 109,
  8.88, 'wikifx', '{"score": 8.88, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "فوق 20 سنة", "account_type": "ECN", "tags": ["المتجر الرئيسي", "رخصة كاملة", "أعمال عالمية", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/0361399834.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«fpmarkets» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.88/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'trading-212', 'TRADING 212', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/4591326731/FXT_4591326731_400x226_44575.png_wiki-template-global', true, 110,
  8.82, 'wikifx', '{"score": 8.82, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "10-15 سنة", "account_type": null, "tags": ["بحث ذاتي", "تم إبطاله", "أعمال عالمية", "مخاطر متوسطة محتملة", "صناعة السوق (MM)", "ترخيص تداول الفوركس (EP)"], "profile_url": "https://www.wikifx.com/ar/dealer/4591326731.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  '{}'::text[],
  '«TRADING 212» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.82/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'vantage', 'vantage فانتج', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/637769787838958871/FXT637769787838958871_988985.png_wiki-template-global', true, 111,
  8.7, 'wikifx', '{"score": 8.7, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "10-15 سنة", "account_type": "ECN", "tags": ["المتجر الرئيسي", "رخصة كاملة", "أعمال عالمية", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/0361345333.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«vantage فانتج» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.7/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'vt-markets', 'VT Markets', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/637703290821348250/FXT637703290821348250_311700.jpg_wiki-template-global', true, 112,
  8.68, 'wikifx', '{"score": 8.68, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "10-15 سنة", "account_type": "ECN", "tags": ["المتجر الرئيسي", "رخصة كاملة", "أعمال عالمية", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/8421818926.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«VT Markets» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.68/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'neex', 'Neex', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/3759382964/FXT3759382964_507035.png_wiki-template-global', true, 113,
  8.64, 'wikifx', '{"score": 8.64, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "15-20 سنة", "account_type": "ECN", "tags": ["المتجر الرئيسي", "رخصة كاملة", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/3759382964.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«Neex» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.64/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'hantec-financial', 'HANTEC FINANCIAL', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/7691432837/FXT7691432837_825865.png_wiki-template-global', true, 114,
  8.61, 'wikifx', '{"score": 8.61, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "15-20 سنة", "account_type": "ECN", "tags": ["التنظيم في الخارج", "رخصة كاملة", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/7691432837.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«HANTEC FINANCIAL» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.61/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'mitrade', 'Mitrade', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/638874816566667751/FXT638874816566667751_347683.png_wiki-template-global', true, 115,
  8.61, 'wikifx', '{"score": 8.61, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "10-15 سنة", "account_type": null, "tags": ["المتجر الرئيسي", "بحث ذاتي", "أعمال عالمية", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/4001424292.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  '{}'::text[],
  '«Mitrade» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.61/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'fortune-prime-global', 'Fortune Prime Global', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/1636217011/FXT1636217011_588807.jpg_wiki-template-global', true, 116,
  8.58, 'wikifx', '{"score": 8.58, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "10-15 سنة", "account_type": "ECN", "tags": ["المتجر الرئيسي", "رخصة كاملة", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/1636217011.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«Fortune Prime Global» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.58/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'startrader', 'STARTRADER ستار تريدر', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/639033209220080340/FXT639033209220080340_909304.png_wiki-template-global', true, 117,
  8.57, 'wikifx', '{"score": 8.57, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "10-15 سنة", "account_type": "ECN", "tags": ["المتجر الرئيسي", "رخصة كاملة", "الوسطاء الإقليميون", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/2277676718.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«STARTRADER ستار تريدر» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.57/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'tmgm', 'TMGM', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/637420889940251322/FXT637420889940251322_578747.jpg_wiki-template-global', true, 118,
  8.55, 'wikifx', '{"score": 8.55, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "10-15 سنة", "account_type": "ECN", "tags": ["المتجر الرئيسي", "رخصة كاملة", "الوسطاء الإقليميون", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/7101709423.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«TMGM» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.55/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'hantec-markets', 'HANTEC MARKETS', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/3841659545/FXT3841659545_539463.png_wiki-template-global', true, 119,
  8.53, 'wikifx', '{"score": 8.53, "regulated_country": "المملكة المتحدة صناعة", "business_model": null, "years": "15-20 سنة", "account_type": "ECN", "tags": ["المتجر الرئيسي", "رخصة كاملة", "أعمال عالمية", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/3841659545.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«HANTEC MARKETS» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.53/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'cpt-markets', 'CPT Markets', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/637686185685459802/FXT637686185685459802_602172.png_wiki-template-global', true, 120,
  8.53, 'wikifx', '{"score": 8.53, "regulated_country": "المملكة المتحدة صناعة", "business_model": null, "years": "15-20 سنة", "account_type": "ECN", "tags": ["المتجر الرئيسي", "رخصة كاملة", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/0001264568.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«CPT Markets» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.53/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'puprime', 'PUPRIME', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/639053700098675624/FXT639053700098675624_511988.png_wiki-template-global', true, 121,
  8.53, 'wikifx', '{"score": 8.53, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": null, "account_type": "ECN", "tags": ["المتجر الرئيسي", "رخصة كاملة", "أعمال عالمية", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/3361482328.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«PUPRIME» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.53/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'aims', 'AIMS', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/638452359525511373/FXT638452359525511373_747887.png_wiki-template-global', true, 122,
  8.5, 'wikifx', '{"score": 8.5, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "10-15 سنة", "account_type": null, "tags": ["رخصة كاملة", "أعمال عالمية", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/5691387480.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«AIMS» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.5/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'eto-markets', 'ETO Markets', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/638977828155885507/FXT638977828155885507_148591.png_wiki-template-global', true, 123,
  8.45, 'wikifx', '{"score": 8.45, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "10-15 سنة", "account_type": null, "tags": ["التنظيم في الخارج", "رخصة كاملة", "أعمال عالمية", "مخاطر متوسطة محتملة", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/8461725816.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«ETO Markets» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.45/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'axel', 'AXEL', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/637103591316739179/FXT637103591316739179_242163.png_wiki-template-global', true, 124,
  8.43, 'wikifx', '{"score": 8.43, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": null, "account_type": "ECN", "tags": ["رخصة كاملة", "الوسطاء الإقليميون", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/9201362451.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«AXEL» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.43/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'jefferies', 'Jefferies', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/6651827292/FXT6651827292_286634.png_wiki-template-global', true, 125,
  8.41, 'wikifx', '{"score": 8.41, "regulated_country": "المملكة المتحدة صناعة", "business_model": null, "years": "فوق 20 سنة", "account_type": null, "tags": ["مُدرج", "بحث ذاتي", "أعمال عالمية", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/6651827292.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  '{}'::text[],
  '«Jefferies» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.41/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'sbcfx', 'SBCFX', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/639035632286329252/FXT639035632286329252_896761.png_wiki-template-global', true, 126,
  8.39, 'wikifx', '{"score": 8.39, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": null, "account_type": "ECN", "tags": ["التنظيم في الخارج", "رخصة كاملة", "الوسطاء الإقليميون", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/1821706026.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt5']::text[],
  '«SBCFX» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.39/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'fxtf', 'FXTF', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/5791887240/FXT5791887240_475730.png_wiki-template-global', true, 127,
  8.38, 'wikifx', '{"score": 8.38, "regulated_country": "اليابان", "business_model": "صناعة السوق", "years": "15-20 سنة", "account_type": null, "tags": ["رخصة كاملة", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/5791887240.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«FXTF» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.38/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'phillipsecurities', 'PhillipSecurities', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/636813585924402697/FXT636813585924402697_449983.png_wiki-template-global', true, 128,
  8.37, 'wikifx', '{"score": 8.37, "regulated_country": "اليابان", "business_model": "صناعة السوق", "years": "15-20 سنة", "account_type": null, "tags": ["رخصة كاملة", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/2981995315.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt5']::text[],
  '«PhillipSecurities» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.37/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'oanda', 'OANDA', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/0001134561/FXT0001134561_638384.png_wiki-template-global', true, 129,
  8.34, 'wikifx', '{"score": 8.34, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "فوق 20 سنة", "account_type": null, "tags": ["اللوائح المحلية", "التنظيم في الخارج", "رخصة كاملة", "أعمال عالمية", "مخاطر عالية محتملة", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/0001134561.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«OANDA» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.34/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'exness', 'Exness', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/638421411421340803/FXT638421411421340803_326425.png_wiki-template-global', true, 130,
  8.33, 'wikifx', '{"score": 8.33, "regulated_country": "قبرص", "business_model": "صناعة السوق", "years": "10-15 سنة", "account_type": null, "tags": ["المتجر الرئيسي", "رخصة كاملة", "أعمال عالمية", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/0001390005.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«Exness» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.33/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'fusion-markets', 'Fusion Markets', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/636982926885864007/FXT636982926885864007_945557.png_wiki-template-global', true, 131,
  8.3, 'wikifx', '{"score": 8.3, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": null, "account_type": "ECN", "tags": ["التنظيم في الخارج", "رخصة كاملة", "أعمال عالمية", "مخاطر متوسطة محتملة", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/4631413251.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«Fusion Markets» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.3/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'quadcode-markets', 'quadcode markets', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/1549893917/FXT1549893917_759194.png_wiki-template-global', true, 132,
  8.29, 'wikifx', '{"score": 8.29, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "15-20 سنة", "account_type": null, "tags": ["نطاق العمل المشبوه", "مخاطر متوسطة محتملة", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/1549893917.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  '{}'::text[],
  '«quadcode markets» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.29/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'huatai-securities', 'HUATAI SECURITIES', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/2871840729/FXT2871840729_682261.png_wiki-template-global', true, 133,
  8.28, 'wikifx', '{"score": 8.28, "regulated_country": "الصين", "business_model": "ترخيص تداول", "years": null, "account_type": null, "tags": ["مُدرج", "بحث ذاتي", "ترخيص تداول المشتقات (AGN)"], "profile_url": "https://www.wikifx.com/ar/dealer/2871840729.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  '{}'::text[],
  '«HUATAI SECURITIES» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.28/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'forex-com', 'FOREX.com', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/637920146619815836/FXT637920146619815836_660753.jpg_wiki-template-global', true, 134,
  8.27, 'wikifx', '{"score": 8.27, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "فوق 20 سنة", "account_type": null, "tags": ["اللوائح المحلية", "مُدرج", "رخصة كاملة", "أعمال عالمية", "مخاطر عالية محتملة", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/0001378443.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«FOREX.com» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.27/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'forex-exchange', 'FOREX EXCHANGE', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/636813305047371387/FXT636813305047371387_720311.png_wiki-template-global', true, 135,
  8.27, 'wikifx', '{"score": 8.27, "regulated_country": "اليابان", "business_model": "صناعة السوق", "years": "15-20 سنة", "account_type": null, "tags": ["العلامة البيضاء", "الوسطاء الإقليميون", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/5421519882.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  '{}'::text[],
  '«FOREX EXCHANGE» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.27/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'citic-futures', 'CITIC Futures', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/637922875239643981/FXT637922875239643981_386541.jpg_wiki-template-global', true, 136,
  8.27, 'wikifx', '{"score": 8.27, "regulated_country": "الصين", "business_model": "ترخيص تداول", "years": null, "account_type": null, "tags": ["بحث ذاتي", "ترخيص تداول المشتقات (AGN)"], "profile_url": "https://www.wikifx.com/ar/dealer/9541207464.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  '{}'::text[],
  '«CITIC Futures» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.27/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'ig', 'IG', 'not_partnered', 'https://eimgjys.fxeyee.com/test/logo/637907429344525337/FXT637907429344525337_529191.png_wiki-template-global', true, 137,
  8.26, 'wikifx', '{"score": 8.26, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "فوق 20 سنة", "account_type": null, "tags": ["تم إبطاله", "رخصة كاملة", "أعمال عالمية", "مخاطر عالية محتملة", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/0001473583.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«IG» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.26/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'guodu-futures-co-ltd', 'GUODU FUTURES CO., LTD', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/636971415857723304/FXT636971415857723304_527663.png_wiki-template-global', true, 138,
  8.24, 'wikifx', '{"score": 8.24, "regulated_country": "الصين", "business_model": "ترخيص تداول", "years": null, "account_type": null, "tags": ["بحث ذاتي", "نطاق العمل المشبوه", "ترخيص تداول المشتقات (AGN)"], "profile_url": "https://www.wikifx.com/ar/dealer/3501522997.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  '{}'::text[],
  '«GUODU FUTURES CO., LTD» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.24/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'ai-gold', 'AI GOLD', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/637660155076087120/FXT637660155076087120_330817.jpg_wiki-template-global', true, 139,
  8.21, 'wikifx', '{"score": 8.21, "regulated_country": "اليابان", "business_model": "صناعة السوق", "years": null, "account_type": null, "tags": ["رخصة كاملة", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/2978154574.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt5']::text[],
  '«AI GOLD» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.21/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'plotio', 'PLOTIO', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/639002940585859975/FXT639002940585859975_809037.png_wiki-template-global', true, 140,
  8.16, 'wikifx', '{"score": 8.16, "regulated_country": "Hong Kong تداول", "business_model": null, "years": "10-15 سنة", "account_type": null, "tags": ["التنظيم في الخارج", "رخصة كاملة", "الوسطاء الإقليميون"], "profile_url": "https://www.wikifx.com/ar/dealer/9541124691.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt5']::text[],
  '«PLOTIO» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.16/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'cmc-markets', 'CMC MARKETS', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/638926823938385297/FXT638926823938385297_832551.png_wiki-template-global', true, 141,
  8.15, 'wikifx', '{"score": 8.15, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "فوق 20 سنة", "account_type": null, "tags": ["مُدرج", "تم إبطاله", "رخصة كاملة", "أعمال عالمية", "مخاطر عالية محتملة", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/0361475237.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«CMC MARKETS» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.15/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'spreadex', 'SPREADEX', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/1031629983/FXT1031629983_449367.png_wiki-template-global', true, 142,
  8.14, 'wikifx', '{"score": 8.14, "regulated_country": "المملكة المتحدة صناعة", "business_model": null, "years": "فوق 20 سنة", "account_type": null, "tags": ["بحث ذاتي", "أعمال عالمية", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/1031629983.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  '{}'::text[],
  '«SPREADEX» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.14/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'interactivebrokers', 'InteractiveBrokers', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/637921023163252318/FXT637921023163252318_730140.jpg_wiki-template-global', true, 143,
  8.14, 'wikifx', '{"score": 8.14, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "فوق 20 سنة", "account_type": null, "tags": ["اللوائح المحلية", "مُدرج", "بحث ذاتي", "تم إبطاله", "أعمال عالمية", "مخاطر عالية محتملة", "تنفيذ الفوركس (STP)", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/0001646186.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  '{}'::text[],
  '«InteractiveBrokers» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.14/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'the-access-bank-uk', 'The Access Bank UK', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/2301351520/FXT2301351520_717701.png_wiki-template-global', true, 144,
  8.14, 'wikifx', '{"score": 8.14, "regulated_country": "المملكة المتحدة صناعة", "business_model": null, "years": "15-20 سنة", "account_type": null, "tags": ["بحث ذاتي", "نطاق العمل المشبوه", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/2301351520.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  '{}'::text[],
  '«The Access Bank UK» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.14/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'stonex', 'StoneX', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/637336336919626455/FXT637336336919626455_931491.jpg_wiki-template-global', true, 145,
  8.14, 'wikifx', '{"score": 8.14, "regulated_country": "المملكة المتحدة صناعة", "business_model": null, "years": null, "account_type": null, "tags": ["أعمال عالمية", "مخاطر متوسطة محتملة", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/1393249006.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  '{}'::text[],
  '«StoneX» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.14/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'axi', 'Axi', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/637921078208252766/FXT637921078208252766_771265.png_wiki-template-global', true, 146,
  8.12, 'wikifx', '{"score": 8.12, "regulated_country": "أستراليا", "business_model": "صناعة السوق", "years": "15-20 سنة", "account_type": "ECN", "tags": ["رخصة كاملة", "أعمال عالمية", "مخاطر عالية محتملة", "صناعة السوق (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/1881836086.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«Axi» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.12/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'chaos', 'CHAOS', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/9321919990/FXT_9321919990_400x226.png_wiki-template-global', true, 147,
  8.12, 'wikifx', '{"score": 8.12, "regulated_country": "الصين", "business_model": "ترخيص تداول", "years": null, "account_type": null, "tags": ["نطاق العمل المشبوه", "تم إبطاله", "مخاطر متوسطة محتملة", "ترخيص تداول المشتقات (AGN)"], "profile_url": "https://www.wikifx.com/ar/dealer/9321919990.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  '{}'::text[],
  '«CHAOS» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.12/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'ultima', 'Ultima', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/638933023713541881/FXT638933023713541881_524650.png_wiki-template-global', true, 148,
  8.12, 'wikifx', '{"score": 8.12, "regulated_country": "المملكة المتحدة تنفيذ", "business_model": null, "years": null, "account_type": "ECN", "tags": ["المتجر الرئيسي", "رخصة كاملة", "الوسطاء الإقليميون", "تنفيذ الفوركس (STP)"], "profile_url": "https://www.wikifx.com/ar/dealer/4052654322.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«Ultima» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.12/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
),
(
  'cxm', 'CXM', 'not_partnered', 'https://eimgjys.fxeyee.com/logo/638760027684948180/FXT638760027684948180_358632.png_wiki-template-global', true, 149,
  8.11, 'wikifx', '{"score": 8.11, "regulated_country": "المملكة المتحدة صناعة", "business_model": null, "years": "10-15 سنة", "account_type": "ECN", "tags": ["المتجر الرئيسي", "رخصة كاملة", "الوسطاء الإقليميون", "صناعة السوق المؤسسية (MM)"], "profile_url": "https://www.wikifx.com/ar/dealer/5013391322.html", "source": "wikifx.com", "source_url": "https://www.wikifx.com/ar/wikifxranking.html"}'::jsonb,
  array['mt4']::text[],
  '«CXM» مُدرَج في تصنيف WikiFX الخارجي بتقييم 8.11/10. هذه بيانات من مصدر خارجي (WikiFX) لم تتحقّق منها المنصّة — تحقّق من ترخيص الكيان قبل الإيداع.'
)
on conflict (slug) do update set
  external_score  = excluded.external_score,
  external_source = excluded.external_source,
  external_wikifx = excluded.external_wikifx;

commit;

-- Check:
--   select count(*) from public.brokers where external_source='wikifx';
