# KFUPM CCM Websites: UI Update Project

Updating the UI of selected pages on five KFUPM websites: the College of Computing and Mathematics and its four departments. The project owner is new to Sitefinity, so explain CMS concepts in plain language.

## The five sites

| Folder | Site | Platform |
|---|---|---|
| `CCM/` | https://ccm.kfupm.edu.sa | Sitefinity 14.4 DX (MVC), theme package `CCM` |
| `ICS/` | https://ics.kfupm.edu.sa | Sitefinity 14.4 DX, theme `ICS` |
| `COE/` | https://coe.kfupm.edu.sa | **Sitefinity 15.1 DX**, theme `COE` (newer editor) |
| `MATH/` | https://math.kfupm.edu.sa | Sitefinity 14.4 DX, theme `MATH` |
| `ISE/` | https://ise.kfupm.edu.sa | **Not Sitefinity**: Django, very likely Wagtail CMS. **On hold**: departments are done one at a time, and ISE comes later |

Each site folder has a `README.md` with its page list (from the site menu), the pages being redesigned and known issues.

## Branding: ground truth
`C:\Users\abdulmohseen.alali.CCM\OneDrive - KFUPM\Abdulmohseen's Folder - Main\Branding`
This is the authority for colours, fonts, logos, icons and graphic elements. Read it only; never modify that folder.
- **Read `reference/brand/kfupm-brand-web.md` before any design work.** It summarises the guidelines for the web, with page citations: approved text/background pairs, logo rules, FAST Matrix rules, and the web palette tints.
- Primary colours dominate: Turquoise `#115F66`, Green `#009767`, Beige `#ECE0C7`. Secondary: Sand `#AA8C6D`, Yellow `#F0BA4F`, Blue `#71B8D4`, Gray `#ADACAD`, White, Black. For UI colours use only the web-palette tints and shades (guidelines p39); don't invent new ones.
- **All five sites use CCM colouring only. Departments have no colours of their own** (owner's decision, 2026-11-19). Never add per-site or per-department colours or a `data-site` switch.
- **CCM college colour: `#4EABB1`**, the value the CCM team uses (owner's decision, 2026-11-19), until the branding team confirms. The sources disagree: the guidelines PDF p34 says `#6BBDBE` (with RGB, CMYK 59-0-27-0 and Pantone 7472 U), the PDF shows about `#49C0BF`, and the logo SVGs use `#4EABB1`, which together are one medium teal. Both `.ase` swatch files give a paler teal, `#9BC9C3` / CMYK 36-7-24-0. It's defined once as `--ccm-college`; components use `--ccm-accent`, which equals it. It's an accent only, never text.
- **Content comes from the CMS** (owner's rule): images, documents, logos, fonts and graphics are uploaded to the site's own Sitefinity library and used by link. Never use local paths, other websites or pasted (data URI) files in page HTML; `check-page.mjs` enforces this.
- **Shared CSS files go through `<SITE>/cms-links.json`**: the CMS links of the fonts (WOFF2) and the FAST Matrix SVG, uploaded once per site. Fonts must be on the same site, because browsers block cross-site fonts. The build uses those links and otherwise falls back (Plex → Google Fonts, KFUPM Display and SVG → data URI), reporting what's missing.
- **Department logos** are in `Branding/CCM Logo/Departmentes Logo`: Shorthand Stacked and Full Stacked, each in colour and `_Negative` (white). Web copies are in `design-system/logos/`. Use the PNGs on the web, because the SVG text is live Helvetica Now Display. Full Stacked is the default (our choice). Shorthand Stacked only at 400px wide or more, because its department line is about 3.6% of the logo width (about 11px at 300px wide), against about 7% in Full Stacked. The logo files' turquoise is `#136066` (brand `#115F66`).
- Fonts: **KFUPM Display** for headlines (only weight 700 is embedded in the build) and **IBM Plex Sans Arabic** for body text. Segoe UI is the fallback. KFUPM Display is already slanted 5°, so never add italic.
- Guideline "Pass" pairs aren't always WCAG AA, for example white on Green is 3.73. Text needs at least 4.5:1.
- FAST Matrix: one pattern per page, allowed colour pairs only, never rotated, flipped or stretched. `design-system/graphics/fast-matrix-four-*.svg` is pattern "Four" with a cropped viewBox: `-beige` (Beige on White, used by the designs and listed in `cms-links.json`) and `-green` (Green on Turquoise, only in the design guide's own header).
- The live sites are **off-brand**: `#007D40` green, `#C69529` gold, Open Sans, Hacen Tunisia and KacstOffice. New work follows the brand folder.

## Current approach (decided 2026-11-18)
- The owner's Sitefinity account has only **Dashboard, Pages, Content and Design → Section presets**. There are no Widget Templates, Page Templates or Administration. Access is being requested from the site administrator (Eng. Ahmed).
- **For now, pages are built as HTML + CSS.** Each page is pasted into Sitefinity as a CSS widget plus a Content block (or the Embed code widget). Test pages are hidden duplicates: Preview and Save as draft only, never Publish.
- The long-term goal is still reusable, content-managed pages. When template access arrives, the chosen designs become Razor widget templates over the existing People content type, and the same CSS is reused.
- **The header, footer and side menu stay as they are for now** (owner, 2026-11-19). New designs must look right inside the old green/gold frame; don't propose redesigning them.
- **Every design preview shows the live page around the design** (owner, 2026-11-21): the live header, grey band, side menu and footer, at the real content width. Run `node tools/live-frame.mjs <SITE>/pages/<page>` once per page folder; each option loads the generated `live-frame.js`, and `design-system/preview.js` puts the option's `.ccm-scope` into the live content column. Judge sizes there, not full width.
- **Design by page type** (owner, 2026-11-19). `design-system/page-types.html` groups every page of the five sites into 13 types, with the order of work, the 7 steps for agreeing on a design, and the decisions log. Statuses and decisions live in its `TYPES` data and decisions table: update them when a step is reached. Steps: sample page → 2–3 options on a compare page → owner reviews with `review.js` (First choice / Could work / No + comments, Copy feedback) → one combined design → owner approves (log it) → Sitefinity test → roll out. Don't re-open colours, fonts, spacing, the header/footer or approved types.
- **One CSS file per site, linked** (works: CCM Sitefinity test, 2026-11-21): the build writes `<SITE>/upload/ccm-styles.css`; it's uploaded once to the site's Documents library, and each page's CSS widget uses "Link to a file". Its link goes in `cms-links.json` under `ccm-styles.css`. In the CSS widget, type the short link `/docs/default-source/...css` (Sitefinity shows library links as `http://`, which the https pages block) and leave Media as `all`. **Open issue:** the library serves files with `Cache-Control: max-age=7776000` (90 days), so visitors' browsers may keep an old `ccm-styles.css` after it's replaced; solve before rollout. The build prints a build code (hash) and says CHANGED when the file must be replaced in the library; `<p class="ccm-build">Design build:</p>` shows the code on a page.

## Design system (v0.2 draft, 2026-11-19)
- **`design-system/index.html` is the visual guide.** It covers colour, the CCM college colour, the type scale, spacing, breakpoints, shape, motion, icons, photos/logos, components, accessibility and open decisions. It reads every value live from the CSS, so update `tokens.css` and the guide follows. Keep the guide's text in sync when you add tokens or components. `index.html?college=4EABB1` previews a college-colour candidate.
- **After building or changing any page:**
  1. Run `node tools/check-page.mjs <SITE>/pages/<page>` and fix every ERROR. It checks the uploaded HTML: classes exist, headings, images, links, IDs, empty tags, phone/office formats and placeholders. It also flags CSS values that skip the tokens (warnings).
  2. Go through `design-system/checklist.html`, the person-checked items.
  3. When a rule is added to the guide, add it to the checker (if a machine can check it) or to the checklist.
- **`tokens.css` is the single source of truth:**
  - Colour: the brand palette, web-palette steps `-l1..l3` / `-d1..d3` (p39), feedback colours and semantic roles. Components use the roles (`--ccm-text`, `--ccm-text-muted`, `--ccm-link`, `--ccm-surface-soft`, `--ccm-line`, `--ccm-accent` …), never raw colours.
  - Type: a **fluid modular scale**. size = 16px × ratio^step, ratio 1.125 (Major Second) at 360px growing to 1.2 (Minor Third) at 1280px+, written as `clamp()`. Steps: h5/lead 1, h4 2, h3 3, h2 4, h1 5, display 6. Body 16, sm 14 and xs 12 are fixed. KFUPM Display is never below 18px. To change it, recompute every step from the formula; don't hand-edit one size.
  - Layout: spacing `--ccm-space-1..12` (4px base) and radius `sm 8 / md 12 / lg 16 / xl 24 / pill / round`. Shadows `sm/md/lg`, motion `150/200/250ms`.
  - Breakpoints = Bootstrap 5 (576/768/992/1200/1400). These change `--ccm-page-margin` (16/24/32/40), `--ccm-gutter` (16/24/32), `--ccm-cols` (4/8/12) and `--ccm-section-space` (48/64/80). The container max is 1200px.
  - Component container queries use only 540 / 720 / 860px.
- Icons in uploaded HTML: `ccm-has-ico ccm-c-*` on an element with text, or `ccm-ico` with a `ccm-sr-only` label inside. Never an empty tag.
- All design-system CSS passes the checker with 0 warnings: every colour, size, space, radius and duration is a token. Keep it that way.

## Folders
- `design-system/`: **one stylesheet for all five sites.** Also `page-types.html` (the plan), `checklist.html` and `review.js` (compare-page feedback; preview only).
  - `ccm.css` is the entry file and `@import`s the rest in order: `tokens.css` (all design values) and `components/*.css`. `base.css` also holds `.ccm-prose` (rich text), `.ccm-lead`, `.ccm-tag` and the plain-link style.
  - Every class starts with `ccm-` and sits inside `.ccm-scope`.
  - Width-responsive components use **container queries** on `.ccm-section`, because the Sitefinity content column sits beside a sidebar.
  - `preview.css` and `preview.js` are prototype chrome only and never uploaded. `preview.js` wraps the option in the live frame (`live-frame.js`) and opens a state from the URL, for example `#show=profile-sultan`.
- `<SITE>/pages/<page>/`: design previews. `index.html` compares the options (and loads `design-system/review.js` for feedback; `<body data-review-round="N">` starts a fresh round), `option-N-<name>.html` holds each option, `live-frame.js` is the generated live frame, and `previews/` holds the screenshots. The build and screenshot tools take every `.html` except `index.html`. On a compare page, `cmp__grid--2` lays four options out 2 × 2, and `style="--shot-y: 18%"` on a `.cmp__shots` link starts its thumbnails lower (when the top of two options looks the same).
  - Each option has `<meta name="ccm-live-url">`, links the live theme CSS before `ccm.css`, and loads `live-frame.js` then `preview.js`.
  - Its body is the preview bar plus one `<div class="ccm-scope">` holding the part between `SITEFINITY:START` and `SITEFINITY:END`: that part is what gets uploaded.
- `<SITE>/upload/`: generated by `node tools/build-sitefinity.mjs <SITE>/pages/<page>`. Never hand-edit these.
  - `ccm-styles.css`: the whole design, one file per site.
  - `<page>/<option>/01-content.html` (for the Content block) and `00-check-in-live-site.html` (local check).
  - `HOW-TO-UPLOAD.md` sits in `<SITE>/upload/<page>/`.
- `CCM/pages/sitefinity-test/` + `CCM/upload/sitefinity-test/HOW-TO-TEST.md`: the one-time Sitefinity test (linked CSS, Content block, theme, fonts, file replace). **Done on CCM (2026-11-21): read `CCM/upload/sitefinity-test/TEST-RESULTS.md` before any Sitefinity work.** Copy it to each department site when we start it.
- `tools/`
  - `build-sitefinity.mjs` inlines `@import`s and links fonts and graphics from `<SITE>/cms-links.json`, falling back as described above.
  - `check-page.mjs` is the automatic page check (see Design system above). Add `--all` to list every CSS warning.
  - `compare-saved.mjs <SITE>/upload/<page>/<option>` compares `01-content.html` with `content-after-save.html` (the Content block's HTML view copied back after saving) and lists what Sitefinity removed or rewrote.
  - `screenshot.mjs` takes headless Edge screenshots at desktop 1280 px and phone 390 px (in an iframe), with the live frame: `node tools/screenshot.mjs <SITE>/pages/<page> ["#show=id"] [suffix]`.
  - `live-frame.mjs <SITE>/pages/<page> [live URL]` writes that folder's `live-frame.js` from the live page (scripts and Font Awesome removed, links absolute). Where the design goes comes from the options' `<meta name="ccm-live-section">`: none = inside the content column; `News,Events` = the band holding those placeholders; `main` = everything between header and footer. `lib/live-page.mjs` (fetch + the three splits, tolerant of the live HTML's unclosed tags) is shared with the build.
  - `<meta name="ccm-preview-focus" content="id">` opens a preview scrolled to that element (a band low on a long page). For such pages use `screenshot.mjs … --height=1500 --phone-height=2600`; both shots load the page in an iframe, because headless Edge doesn't capture a page that scrolled itself.
- `reference/`: brand summary and discovery reports. `prompts/`: browser-agent prompts (on hold).

## Dean & Chairmen page (CCM): status
- **Round 3, 2026-11-21** (page type 1, People list, status "Options ready"). Four options in `CCM/pages/dean-chairmen/`, all shown inside the live frame:
  - `option-1a-cards-popup`: white Dean card + four equal chair cards, the whole card opens a contact pop-up (`people-cards.css`, `profile-popup.css`). Needs the **Embed code** widget.
  - `option-1b-cards-link`: the same cards, each a link to the person's full profile page; no pop-up, works in a Content block.
  - `option-2-departments`: light Dean card with a Beige FAST Matrix behind the photo (`leader.css`) + compact department cards with visible contacts (`dept-cards.css`).
  - `option-3-portraits`: arch portraits, max 176px (Dean) / 152px (chairs), one "View full profile" button per chair (`portraits.css`).
- Round-2 feedback (round 3 answers it): no "View details" label or button on cards (the card itself is the click target); the pop-up "looks off" because nothing else on the site uses one, so 1A keeps it and 1B drops it; option 3's email/phone/arrow icons "looked funny", replaced by a "View full profile" button.
- Round-1 feedback they answer: opt 2 liked but the beige Dean panel "felt off"; opt 4 departments loved but "too large" and too much colour behind the Dean; opt 5 lovely but photos too big; opt 6 fine but the Dean is the main person; opt 1 unsure because a 2 × 2 grid ranks the chairs; opt 3 (org chart) rejected. So: the Dean always leads, the four chairs are always equal (one row from 720px, alphabetical by department code), no beige panels, smaller photos.
- The owner's feedback arrives as text, or as a "DESIGN FEEDBACK" text with "Round: 3". **When one option is approved, delete the other options' components** (and their imports in `ccm.css`), and log the decision in `page-types.html`.
- Round 1's other components (people-list, org-chart, leader-hero banner, directory) are deleted; the test page's Test 4 went with the directory.
- The pop-up uses the HTML `popover` attribute (no JavaScript). **CCM Sitefinity test (2026-11-21):** the Content block saves `popover` but strips it when showing the page, so the pop-up shows stuck open; `<details>` works in a Content block. Pages with a pop-up must use the **Embed code** widget. `profile-popup.css` hides `.ccm-profile:not([popover])` as a safety net. The Content block also rewrites library image links to `/images/...` and adds `sfref` / `data-sf-ec-immutable` (harmless).
- No empty elements in uploaded HTML: Sitefinity's editor can delete them. Icons are CSS mask pseudo-elements (`ccm-c-*` classes), and icon-only links carry `ccm-sr-only` text.

## Home page (CCM): status
- **Round 4, 2026-11-21** (page type "Home page", status "Options ready"). The owner chose round 2's **concept 1, "Classic, made clear"**, then **rejected round 3's two variations** (a photo panel with sliding rows; a centred hero with "Find your way" boxes) and asked for other minimal, simple variations of concept 1. `CCM/pages/home/` holds concept 1 and three new variations, all replacing everything between the live header and footer (`<meta name="ccm-live-section" content="main">`). All four keep the order hero → numbers → study → departments → news & events → research, and the same content:
  - `option-1-classic` (the chosen base, unchanged): split hero (text + photo, `.ccm-hero--split`), boxed numbers in a grey band, photo cards, department tiles, news and events side by side with page numbers (`pages.css`).
  - `option-2-text-first`: no hero photo; the six numbers sit in the hero beside the name (`.ccm-hero--stats`).
  - `option-3-lines`: the page wrapped in `<div class="ccm-lines">`: no grey bands (a hairline between sections), the numbers in one outlined strip, cards without frames, a turquoise top line on department tiles, news and events as lists.
  - `option-4-compact`: about a third shorter (2,180 vs 3,280px on desktop, 3,710 vs 4,750px on phones): `.ccm-hero--compact`, study and departments as `.ccm-rows` link lists side by side, the three latest news and events (no page numbers), research as two `.ccm-quick` links.
  - Variations change only those parts, so the owner can mix them. `index.html` (`data-review-round="4"`) has a "What differs" table with the measured lengths and the research notes behind the variations (NN/g university and homepage guidelines, proximity).
  - Components: `home.css` (bands, hero variants, boxed numbers, `.ccm-grid`, department tiles, quick links, row links, the Lines look), `feed.css`, `news.css`, `events.css`, `pages.css`. `slider.css` was deleted with round 3.
- **Owner's design direction for the home page (round-1 feedback, 2026-11-21):** simple and minimal; **no colour blocks at the top** (round 1's Turquoise hero under the green header had "too many colours"); it must read as easily as the old page (same order, one card style, clear section bands); **numbers in boxes**; **no message from the Dean**. Round 2 follows this: white hero, colour only in the photo, buttons and links; light grey bands (`--ccm-surface-alt` = Gray l3) every other section; no FAST Matrix on the home page; event dates as plain text; card and news titles in IBM Plex SemiBold (KFUPM Display for the hero, section titles and numbers).
- The owner deleted the separate News & Events options folder (`CCM/pages/home-news-events/`) during round 2; don't recreate it. Its Highlights and Tabs options and their CSS were removed.
- The pages were generated from real content (21 Nov 2026) by a scratchpad script (`gen-home.mjs`, temporary); edit the HTML directly from now on.
- Live home problems: 6 news + 8 events at full size (about 1,500px); news shows no dates (some are from 2018–2023); events are past and not in date order. The widgets' limit and sort settings can fix part of this with Pages access only.
- No public news API or RSS on CCM (`/api/default/newsitems` and `/rss` are 404), so news dates in previews come from the article text.

## Content facts
- People content type (CCM): detail pages are at `/peoples/<page>/people-detail/<slug>`.
  - Field labels: Title, Rank, Location, Phone, Fax, Mobile phone, Email, Po box, Job title, LinkedIn Profile, Website, Content, Categories, Display Image and URL.
  - Internal field names are unconfirmed. Get them from the People widget template before writing Razor.
- Dr. Malak Baslyman's profile is at `…/dr.-motaz-alfarraj` and Dr. Yasser Almoghathawi's at `…/dr.-anas-alghazi` (recycled items with old URLs).
- Photos are small. The Dean's is 300 × 300 px; Dr. Malak's web copy is 280 × 230 px (the original is 4449 px and 1.7 MB). Designs with large photos need new photos.
- The live site says "Chairman" for all four chairs.

## Tooling notes
- Google Chrome is **not installed**. The owner uses Brave, which Claude in Chrome doesn't support. Read public pages with curl.
- No Python. Node.js 24 and Edge are available. Headless Edge won't lay out narrower than about 500 px, so phone checks use a 390 px iframe (`tools/screenshot.mjs` does this).
- Local file:// previews hit CORS limits. Font Awesome from the live site shows as boxes (`live-frame.mjs` strips the `<i>` icons and `preview.css` redraws the side-menu arrow), and CSS masks that load a separate file are blocked, which is why the FAST Matrix is a background image. Data-URI masks (the icons) and local `@font-face` files work.
- Live CCM layout (Bootstrap 5): the content column is `col-lg-10` beside a `col-lg-2` side menu, about 1076 / 926 / 776px wide at ≥1400 / 1200 / 992px screens; below 992px the side menu hides and the column is the container (696 / 516px, or the screen minus 24px). Base font size is 16px.
