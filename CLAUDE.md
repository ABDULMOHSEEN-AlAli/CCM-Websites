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
- FAST Matrix: one pattern per page, allowed colour pairs only, never rotated, flipped or stretched. `design-system/graphics/fast-matrix-four-green.svg` is pattern "Four" with a cropped viewBox and Green fill.
- The live sites are **off-brand**: `#007D40` green, `#C69529` gold, Open Sans, Hacen Tunisia and KacstOffice. New work follows the brand folder.

## Current approach (decided 2026-11-18)
- The owner's Sitefinity account has only **Dashboard, Pages, Content and Design → Section presets**. There are no Widget Templates, Page Templates or Administration. Access is being requested from the site administrator (Eng. Ahmed).
- **For now, pages are built as HTML + CSS.** Each page is pasted into Sitefinity as a CSS widget plus a Content block (or the Embed code widget). Test pages are hidden duplicates: Preview and Save as draft only, never Publish.
- The long-term goal is still reusable, content-managed pages. When template access arrives, the chosen designs become Razor widget templates over the existing People content type, and the same CSS is reused.
- **The header, footer and side menu stay as they are for now** (owner, 2026-11-19). New designs must look right inside the old green/gold frame; don't propose redesigning them.
- **Design by page type** (owner, 2026-11-19). `design-system/page-types.html` groups every page of the five sites into 13 types, with the order of work, the 7 steps for agreeing on a design, and the decisions log. Statuses and decisions live in its `TYPES` data and decisions table: update them when a step is reached. Steps: sample page → 2–3 options on a compare page → owner reviews with `review.js` (First choice / Could work / No + comments, Copy feedback) → one combined design → owner approves (log it) → Sitefinity test → roll out. Don't re-open colours, fonts, spacing, the header/footer or approved types.
- **One CSS file per site, linked** (pending the Sitefinity test): the build writes `<SITE>/upload/ccm-styles.css`; it's uploaded once to the site's Documents library, and each page's CSS widget uses "Link to a file". Its link goes in `cms-links.json` under `ccm-styles.css`. The build prints a build code (hash) and says CHANGED when the file must be replaced in the library; `<p class="ccm-build">Design build:</p>` shows the code on a page.

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
  - `preview.css` and `preview.js` are prototype chrome only and never uploaded. `preview.js` opens a state from the URL, for example `#show=profile-sultan`.
- `<SITE>/pages/<page>/`: design previews. `index.html` compares the options (and loads `design-system/review.js` for feedback), `option-N-<name>.html` holds each option, and `previews/` holds the screenshots. The build and screenshot tools take every `.html` except `index.html`.
  - Each option has `<meta name="ccm-live-url">`.
  - The part between `SITEFINITY:START` and `SITEFINITY:END` is what gets uploaded.
- `<SITE>/upload/`: generated by `node tools/build-sitefinity.mjs <SITE>/pages/<page>`. Never hand-edit these.
  - `ccm-styles.css`: the whole design, one file per site.
  - `<page>/<option>/01-content.html` (for the Content block) and `00-check-in-live-site.html` (local check).
  - `HOW-TO-UPLOAD.md` sits in `<SITE>/upload/<page>/`.
- `CCM/pages/sitefinity-test/` + `CCM/upload/sitefinity-test/HOW-TO-TEST.md`: the one-time Sitefinity test (linked CSS, Content block, theme, fonts, file replace). Copy it to each department site when we start it.
- `tools/`
  - `build-sitefinity.mjs` inlines `@import`s and links fonts and graphics from `<SITE>/cms-links.json`, falling back as described above.
  - `check-page.mjs` is the automatic page check (see Design system above). Add `--all` to list every CSS warning.
  - `compare-saved.mjs <SITE>/upload/<page>/<option>` compares `01-content.html` with `content-after-save.html` (the Content block's HTML view copied back after saving) and lists what Sitefinity removed or rewrote.
  - `screenshot.mjs` takes headless Edge screenshots at desktop 1280 px and phone 390 px (in an iframe): `node tools/screenshot.mjs <SITE>/pages/<page> ["#show=id"] [suffix]`.
- `reference/`: brand summary and discovery reports. `prompts/`: browser-agent prompts (on hold).

## Dean & Chairmen page (CCM): status
- Six options are in `CCM/pages/dean-chairmen/`:
  1. contact list
  2. name cards + pop-up
  3. org chart
  4. departments first (Dean banner with FAST Matrix)
  5. arch portraits
  6. expandable directory
- This is page type 1 (People list) in `design-system/page-types.html`, status "Options ready". The compare page has the review tools; the owner's feedback arrives as a "DESIGN FEEDBACK" text.
- The component CSS for every option is in the design system. **Delete the components of options that aren't chosen.**
- The pop-up uses the HTML `popover` attribute and the directory uses `<details>`; neither needs JavaScript. The Sitefinity Content block may strip those attributes, and the Embed code widget is the fallback. `CCM/upload/sitefinity-test/` tests exactly this (not run yet).
- No empty elements in uploaded HTML: Sitefinity's editor can delete them. Icons are CSS mask pseudo-elements (`ccm-c-*` classes), and icon-only links carry `ccm-sr-only` text.

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
- Local file:// previews hit CORS limits. Font Awesome from the live site shows as boxes, and CSS masks that load a separate file are blocked, which is why the FAST Matrix is a background image. Data-URI masks (the icons) and local `@font-face` files work.
