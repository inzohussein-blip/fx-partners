# Legal and compliance risk register

Written 14 September 2026, from a review of this codebase.

**This is not legal advice.** I am not a lawyer, and none of what follows is a
substitute for one. It is an engineer's inventory of what the code actually
does, which parts of that carry legal exposure, what has been changed, and what
is still open. Most of the remaining items cannot be closed from the codebase
at all — they need a decision from the owner or an opinion from a qualified
lawyer in the relevant country.

Take this document to that lawyer. It will make the conversation much shorter
than starting from the site.

---

## 1. The single biggest risk is not on this list twice, so read it first

**Promoting leveraged trading is a regulated activity in most of the world.**

FX Partners is an introducing broker: it markets brokers who offer leveraged
forex and CFDs, and is paid per client it introduces. In a large number of
jurisdictions that is a regulated financial promotion, and doing it without
authorisation is an offence — not a civil matter, an offence.

- **United Kingdom.** Communicating a financial promotion without FCA
  authorisation or an authorised approver breaches s.21 FSMA. CFD promotion to
  retail clients carries further restrictions.
- **European Union.** ESMA's product intervention measures and each member
  state's implementation restrict how CFDs may be marketed to retail clients,
  including mandatory risk warnings with loss percentages.
- **United States.** Retail forex solicitation generally requires CFTC/NFA
  registration. This is among the strictest regimes.
- **Gulf states.** Several regulators (including the Saudi CMA and the UAE
  SCA) have issued warnings about unlicensed forex promotion, and licensing
  regimes differ materially between the UAE's onshore and free-zone bodies.
- **Iraq.** The position is less developed than in the Gulf, which is not the
  same as permissive. It needs local advice rather than an assumption.

**The site does not currently geo-restrict anyone.** It is published in Arabic
and English and reachable worldwide.

What was done in code: the terms now state that the service is not offered
where local rules prohibit it (§10), a no-advice clause covers the
calculators and signals as well as the comparisons (§11), and a full risk
warning appears in the footer of every page.

**What is still open, and only the owner can close it:**

1. Decide which countries you are actually targeting, and get advice for each.
2. Decide whether to block the ones you are not. If you decide to, this is a
   middleware change and a small job — ask and it can be built.
3. If you are targeting EU or UK retail clients, expect to need the
   percentage-of-losing-accounts risk warning, which requires each broker to
   give you their figure.

Severity: **high**. Likelihood depends entirely on where traffic comes from.

---

## 2. Data protection

### Closed in this session

| Was | Now |
| --- | --- |
| A 30-day marketing attribution cookie set with no consent | Set only where the marketing category is allowed; the click is still counted without it, from a row holding a country code and no identifier |
| Vercel Analytics and Speed Insights always on | Load only with consent |
| TradingView, Binance, jsDelivr and a currency API loading in the browser, each receiving the visitor's IP | All gated; each degrades to a server-side or bundled fallback rather than breaking |
| No consent mechanism at all | Banner with reject as prominent as accept, a per-category chooser defaulting to off, and a footer link to change it |
| No cookie policy | `/cookies`, listing every cookie and storage key by its literal name in the code |
| Privacy policy naming no controller, no legal bases, no recipients, no retention, no transfers | Rewritten: twelve sections built from what the code does |
| Contact and booking forms relaying name, email, phone and message to Telegram, undisclosed | Disclosed in the privacy policy and in the notice on the form itself, with an alternative route offered |
| No consent statement on any form | Notices on contact, booking, review and board forms; a real unticked checkbox on the broker alert subscription |

### Still open

- **The controller is not named.** `/api/health/legal` returns 503 and lists
  `legal_name`, `location`, `email` as missing. The privacy policy and the
  terms both refer to "the entity named on the About page". Until those are
  filled in from the content editor, both clauses identify nobody, and the
  site fails the e-Commerce Directive's provider-identification requirement.
  **This is a launch blocker.** Severity: **high**, effort: minutes.
- **No data processing agreements are on file.** Supabase, Vercel, Resend and
  Telegram are all processors. The first three publish DPAs you need to accept
  or sign. Severity: medium.
- **Telegram as a processor is a weak point.** It is a consumer chat app, the
  message sits in a chat history indefinitely, and there is no DPA of the kind
  the other three offer. It works, it is now disclosed, and it is the one
  recipient I would replace first. Consider routing form submissions to the
  database and using Telegram only for a content-free "you have a new message"
  ping. Severity: medium.
- **Retention is stated but not enforced.** The privacy policy commits to 24
  months for contact messages and click records. Nothing deletes them. Either
  build the job or change the wording — a stated retention period that is not
  honoured is worse than none. Severity: medium.
- **No documented breach procedure.** GDPR gives you 72 hours. Decide now who
  is called and in what order. Severity: low until it matters, then total.

---

## 3. Advertising and consumer protection

### Closed in this session

The site was publishing business metrics that nothing produced: "2,400+ active
agents", "40+ partner brokers", "60+ countries", "$18B+ volume", "$4.6M+ paid
to agents". Actual figures at the time: five seeded brokers, no agents. These
are now read from the database and a count below three is not published at all.

Also removed: four invented team members with names and job titles; invented
market percentage moves presented as data; "we guarantee the best"; "Paid
within 24 hours"; "Join thousands of agents"; "the world's best brokers";
"24/7 support". Testimonials were already fixed in an earlier session and
render nothing until real ones exist.

### Still open

- **The commission tier table is a commercial offer I cannot verify.** 40% /
  55% / 60% revenue share and $400 / $800 / $1,200 CPA are presented as this
  business's terms. If they are not what the partner agreements actually say,
  that is a misrepresentation. A note now says the rates are indicative and
  governed by the signed agreement, which helps, but the numbers should still
  be true. **Owner to confirm.** Severity: medium.
- **Affiliate disclosure placement.** The relationship is disclosed in the
  terms (§3) and on `/about`. Several regimes — the US FTC most explicitly —
  expect disclosure *near the affiliate link*, not only on a policy page. The
  broker cards and comparison tables carry `rel="sponsored"` but no visible
  statement. Severity: medium, effort: small.
- **Broker data accuracy.** Terms §12 now disclaims it and tells readers to
  verify a licence with the regulator. The underlying discipline — leave a
  field empty rather than guess — is enforced in code and should stay that
  way.

---

## 4. Accessibility

Audited across twelve public pages at phone width in both themes. All 23
`<img>` tags carry alt text; every control has a visible focus ring; six
unlabelled form controls, eleven heading-order skips and the tap targets that
fall outside WCAG 2.5.8's inline-link exemption were all fixed. The audit now
reports zero failures.

Not covered and worth knowing:

- No screen reader was actually driven. The checks are structural (names,
  labels, roles, contrast, target size), which catches most of it but is not
  the same as using the site with VoiceOver or NVDA.
- The dashboard was not audited. It is behind authentication and Arabic-only.
- Contrast: measured and fixed in an earlier session, and one regression I
  introduced this session (an off-palette amber) was caught and fixed. I tried
  twice to re-measure the whole site automatically and both attempts produced
  unreliable output — a CSS model that cannot see gradient-filled text, then a
  pixel histogram that picks antialiasing fringe. The new surfaces were
  checked visually instead. A dedicated tool (axe, Lighthouse) would do this
  better than the scripts in this repo.

---

## 5. Intellectual property

- Broker logos are rendered from `logo_url` in the database. Using a company's
  mark to identify it in an editorial comparison is generally defensible, and
  terms §6 now states that position, disclaims any affiliation, and offers a
  takedown route. Severity: low.
- The only bundled image, `public/images/hero-platform.webp`, was of unknown
  origin and unreferenced. Deleted.
- Everything else is uploaded through the dashboard, so provenance is the
  uploader's responsibility. §6 now says so.

---

## 6. Things that are fine, recorded so they are not re-litigated

- No advertising cookies, no ad networks, no cross-site tracking, no sale of
  data — true of the codebase, and the cookie policy says so.
- Click tracking stores a country code and a referrer, never an IP or a
  personal identifier.
- Row-level security is enforced in the database; administrative operations go
  through narrowly scoped functions.
- The service-role key is server-only and has never carried the
  `NEXT_PUBLIC_` prefix. The repository is public; secrets live in GitHub
  Actions and Vercel environment settings.
- An open redirect in `/r/<slug>` was found and closed in an earlier session,
  at both the database and the route layer, with tests.

---

## Priority order

1. Fill in the operator details. `/api/health/legal` tells you when it's done.
2. Get advice on which countries you may lawfully market to, and act on it.
3. Confirm the commission tiers are real.
4. Accept the processor DPAs; reconsider Telegram.
5. Add affiliate disclosure next to the links themselves.
6. Build the retention job, or soften what the policy promises.
