-- ===========================================================================
-- 0032 — hide binary-options platforms from the directory
-- ===========================================================================
-- The external directory import brought in platforms whose core product is
-- binary / digital options. They were listed on the same cards, with the same
-- "trading company" framing, as licensed forex and CFD brokers. Binary options
-- are banned for retail clients in the EU, the UK and Australia, most of these
-- platforms hold no licence from a major regulator, and listing them beside
-- regulated brokers undercuts the whole premise of a comparison site.
--
-- Unpublished, not deleted: the rows and their data stay, and any of them can
-- be republished from the admin panel if that is ever a deliberate decision.
-- Safe to re-run. The external-directory seeds never touch is_published on
-- conflict, so re-running them does not bring these back.
-- ===========================================================================

update public.brokers
set is_published = false
where slug in (
  'gc-option',
  'iq-option',
  'binarium',
  'binomo',
  'closeoption',
  '1primeoptions',
  'expert-option',
  'olymp-trade',
  'optionfield',
  'pocket-option',
  'quotex',
  'videforex',
  'highlow',
  'ayrex',
  'nadex'
)
and is_published;
