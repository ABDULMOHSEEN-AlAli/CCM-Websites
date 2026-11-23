# KFUPM Brand Guidelines: web reference for CCM pages

Source: `Branding\KFUPM Brand Guidelines.pdf` (71 pages, outlined text, no table of contents). The file is an **excerpt**: it starts at section 3 (Brand Logo) and ends at section 11 (Iconography). Sections 1 and 2 (likely the brand story and voice) are not in it.
Citations use the form **p31/53**, meaning PDF page 31, with "Page 53" printed on the slide. Printed page = PDF page + 22.
Anything the guidelines do not cover is marked *Not specified in guidelines*. My own advice is only in the last section.

## Quick tokens

| Token | Hex | Role (source) |
|---|---|---|
| Turquoise | `#115F66` | Primary. Dominant colour and default logo colour (p31/53, p8/30) |
| Green | `#009767` | Primary (p31/53) |
| Beige | `#ECE0C7` | Primary (p31/53) |
| Sand | `#AA8C6D` | Secondary/accent (p31/53, p39/61) |
| Yellow | `#F0BA4F` | Secondary/accent. Counts as large text only on many backgrounds (p32/54) |
| Blue | `#71B8D4` | Secondary/accent |
| White / Gray / Black | `#FFFFFF` / `#ADACAD` / `#000000` | Secondary/accent |
| Success / Error / Warning / Info | `#2AA880` / `#DE5E5E` / `#F2C56C` / `#89C4DB` | Web "Feedback Color Palette" (p39/61) |
| CCM college colour | **unresolved** (see Conflicts below) | Accent only, always alongside the primary palette (p36/58) |

```css
/* Fonts named in the guidelines: KFUPM Display (headlines), IBM Plex Sans Arabic (body), Segoe UI (fallback) */
--font-display: "KFUPM Display", "Segoe UI", sans-serif; /* weights 400, 700, 900 */
--font-body:    "IBM Plex Sans Arabic", "Segoe UI", sans-serif; /* 100-700 in folder; guide shows 300, 400, 700 */
/* WEBSITES (KFUPM web team, 2026-11-23): English text uses Open Sans; IBM Plex is for documents.
   Our design: --ccm-font-body: "Open Sans", "IBM Plex Sans Arabic", "Segoe UI", system-ui, sans-serif */
```

### Colour conflicts between the PDF, the .ase swatches and the SVG files
| Item | .ase swatch | PDF | Other |
|---|---|---|---|
| **CCM college colour** | RGB `#9BC9C3` (CMYK 36-7-24-0) | p34/56 label: HEX `6bbdbe`, RGB 107-189-190, CMYK 59-0-27-0, Pantone 7472 U. The swatch fill and the CCM example covers on p35/57 and p36/58 render at about `#49C0BF` | `CCM Logo\*_CollegeColor.svg` and `COMP_SM_College*.svg` use `#4EABB1` |
| **Chemicals & Materials** | `#DD9D5E` (CMYK 10-40-70-0) | p34/56: `#F0BA4F`, RGB 240-186-69, Pantone 4023 C. These are the Yellow values, so this looks like a copy-paste error. Renders at about `#F8B532` on p35/57 | n/a |
| Yellow, RGB label | `#F0BA4F` | p31/53 and p39/61 print RGB **240-186-69** (= `#F0BA45`), but HEX F0BA4F (= 240-186-**79**). The swatch renders as `#F0BA4F` | The hex value is correct |
| Sand, web palette | `#AA8C6D` | p39/61 prints RGB **164-138-112** (= `#A48A70`) with HEX AA8C6D. p31/53 prints RGB 170-140-109 (matches the hex) | The hex value is correct |
| Black | `#000000` | HEX printed as "00000" (five digits) on p31/53 and p39/61 | Typo |
| Green in logo SVGs | `#009767` | n/a | `*_C.svg` lockups use `#019467`, `COMP_SM_C.svg` uses `#009567` (minor) |
| Seal | KSA Green `#225232`, Seal Yellow `#E5B961` | No values printed. Rendered green is about `#205232` | CMYK .ase names the yellow "Pantone 7403 U" |

Matches with no conflict: Turquoise, Green, Beige, Blue, Gray and White, and the other college and extra colours (`#3D3C7F`, `#004A81`, `#8D5035`, `#A31F34`, `#F58220`, `#7577B8`, `#B9DB9F`, `#F06861`).

## 1. Colour

**Roles**
- The primary colours (Turquoise, Green, Beige) "should be the dominant elements in all branded materials". The accent colours (Sand, Yellow, Blue, White, Gray, Black) "add flexibility and variety, complementing the primary colors without diminishing [their] prominence" (p31/53).
- The same accents are called "Accent Colors" on p31/53 and the "Secondary Color Palette" on p39/61. p34/56 uses the heading "Secondary Color Palette" for the college colours, so the naming is inconsistent.
- Proportions or ratios: *Not specified in guidelines.*
- Internal KFUPM events may use the primary palette plus **only one** colour from the secondary palette (p37/59).

**Web palette (p39/61).** Each colour is shown with three lighter and three darker steps. The steps have no printed values, so the hex codes below were sampled from the PDF render. The labelled base colours rendered exactly, so the samples are reliable.

| Base | Lighter (1 to 3) | Darker (1 to 3) |
|---|---|---|
| Turquoise | `#699599` `#8FAFB3` `#B5CACC` | `#0B3F44` `#093032` `#062022` |
| Green | `#70BA9A` `#95CBB3` `#B9DDCD` | `#016445` `#014C34` `#003222` |
| Beige | `#F3EADA` `#F6EFE3` `#F9F5EC` | `#C2B8A3` `#9B9283` `#767064` |
| Sand | `#C6B29E` `#D5C6B6` `#E3D9CF` | `#715D49` `#554637` `#392F24` |
| Yellow | `#F5D18E` `#F8DDAB` `#FAE8C7` | `#9D7C35` `#785D28` `#503E1A` |
| Blue | `#A2D0E3` `#BADCEA` `#D1E8F1` | `#4B7B8A` `#395C6A` `#263C47` |
| Gray | `#C8C8C8` `#D6D5D6` `#E4E3E4` | `#737373` `#575657` `#3A393A` |

Each feedback colour has two companion swatches: Success with `#70BA9A`/`#009767`, Error with `#DE7473`/`#D54040`, Warning with `#F5D18E`/`#F0BA4F`, and Info with `#A2D0E3`/`#71B8D4`.

**Approved text and background pairs (p32/54).** The guidelines define three statuses: "Pass", "Pass, Large Text Only" (shown with a yellow tick) and "Does Not Pass". Unapproved combinations "are not approved for KFUPM applications".

| Background | Pass | Large text only | Not approved |
|---|---|---|---|
| Turquoise | White, Beige, Yellow | Green, Sand, Blue | Gray, Black |
| Green | White, Black | Turquoise, Beige | Sand, Yellow, Blue, Gray |
| Beige | Turquoise, Green, Black | Sand | White, Yellow, Blue, Gray |
| Sand | White | Beige, Yellow, Black | Turquoise, Green, Blue, Gray |
| Yellow | Turquoise, Black | White | Green, Beige, Sand, Blue, Gray |
| Blue | White, Turquoise, Black | n/a | Green, Beige, Sand, Yellow, Gray |
| Gray | White, Turquoise, Black | n/a | Green, Beige, Sand, Yellow, Blue |

The grid has no White or Black background row.

**College colours (p34/56, p35/57, p36/58)**
- College colours are accents that distinguish each college. They may be used for internal events, college-specific materials, the college environment and graduation ceremonies (p34/56).
- They must be used **as an accent together with the KFUPM primary palette**. The guidelines list three don'ts: don't use the college colour on its own, don't pair it only with accent colours, and don't use two college colours in one design. Keep colour, type and layout aligned with the master brand (p36/58).
- The p36/58 examples show the correct use as Turquoise-dominant layouts with CCM teal stripes, a circle and a band. The incorrect use makes CCM teal the dominant background with Yellow accents.
- Text on the CCM colour (p35/57): White, Turquoise and Black pass. Green, Beige, Sand, Yellow, Blue and Gray do not pass. That grid has no large-text-only status.

## 2. Typography

| Role | Typeface | Rule |
|---|---|---|
| Headlines, key statements | **KFUPM Display**: Regular, Bold, Black. Covers Arabic and Latin. | "Ideal for large headlines, impactful statements, and key messages in both Arabic and English" (p42/64). "Headlines should always utilize the KFUPM Display typeface". Avoid Plex for headlines (p49/71). |
| Subheadings | KFUPM Display | The hierarchy sample mixes a Regular line with a Bold line (p48/70). |
| Body copy | **IBM Plex Sans Arabic** (covers Arabic and Latin). **On the websites, English text uses Open Sans instead** (KFUPM web team, 2026-11-23: IBM Plex is for documents, not websites). | "The body text should consistently use IBM Plex Sans Arabic". Avoid KFUPM Display in body text or at small sizes (p46/68, p49/71). The specimen shows the Light, Regular and Bold weights. |
| Fallback | **Segoe UI** | Fallback for "digital platforms, devices, and environments where the primary typeface may not be available". The guide adds: "Do not resort to using Segoe UI as the fallback unless the primary typefaces are unavailable" (p47/69). |
| College logo lockups only | Helvetica Now Display, 5° skew | Logo artwork only (p22/44 to p25/47). This font is not in `01 Font\`. |

- Arabic "Decorative Cups" are on by default and can be removed with Stylistic Set 1 (`ss01`) (p45/67). I confirmed `ss01` exists in the font files.
- The hierarchy sample (p48/70) shows a Green heading and subheading with black body text.
- Pixel or point sizes, line height, letter spacing, case rules and maximum line length: *Not specified in guidelines.*

## 3. Logos

**KFUPM logo**
- The primary logo is the icon (an octagon containing the KFUPM Tower) plus the wordmark. Use it prominently in most applications (p2/24).
- Structure: the icon height is 1X. The gap between the icon and the wordmark is 1/4X. The wordmark has a 5° slant (p3/25).
- **Clear space: 1X on every side, where X is the icon height. No text or images may enter that zone** (p4/26, p6/28). p5/27 repeats this page and contains placeholder text ("gfhdgfof"), so it is a draft artefact.
- Lockups (p7/29):
  1. Primary Lockup (global facing) for most uses.
  2. Full Vertical Lockup (local facing), with the full Arabic and English name, for local events and formal use.
  3. Wordmark only, for small spaces where the full logo does not fit.
  4. Iconmark alone, which is not recommended.
  5. **Fav Icon**, "designed specifically for use as a favicon on the KFUPM website".
- Colour versions (p8/30, p9/31). Use the primary version (Turquoise) on light backgrounds and light photos. Use the negative version (white) on dark backgrounds and dark photos.
- Misuse. Don't do any of the following (p10/32):
  - resize the tower inside the octagon
  - rearrange the lockup
  - rotate the logo
  - use colours outside the palette
  - distort the logo
  - reshape the tower
  - change or recreate the wordmark typeface
  - stack or rearrange the elements
  - add effects or shadows
  - add outlines
  - change the icon size relative to the wordmark
  - add gradients
- Placement (p11/33): the logo goes top right, whether the text is Arabic or English. Keep a margin of at least 5% of the poster size from every edge. The logo should be about 25% of the width on horizontal and square posters and about 16% on vertical posters.
- Minimum size: *Not specified in guidelines.*
- Co-branding:
  - With KFUPM as the lead, the partner logo goes bottom left with a descriptor such as "In Partnership With:" or "Sponsored By:" (p12/34).
  - As equal partners, the logos are the same size, with KFUPM top right and the partner top left. Use at most two logos and no custom combined lockups (p13/35).
  - A third party showing KFUPM needs written permission. Keep 2X between the KFUPM logo and the other logo and align their baselines (p14/36).
- The **Seal** is only for formal documents such as certificates, letterheads and contracts. It "must not be used in promotional materials" such as banners, posters or advertising (p16/38, p18/40). Use on the web: *Not specified in guidelines.*

**College (Level 2) lockups**
- All Level 1 to 4 logos must be created and approved by the branding team. "Modifying or altering these lockups is strictly prohibited" (p20/42).
- The master brand is used for website homepages and social media (p21/43).
- Three college lockups are defined (p22/44 to p24/46):
  - **Shorthand Horizontal:** KFUPM followed by "Computing", with 0.25X gaps.
  - **Full Horizontal:** the shorthand line with the full college name beneath it (0.5X gap, 0.4X text height).
  - **Full Stacked:** KFUPM above "College of Computing & Mathematics" (0.35X gap, 0.75X per line).
- In the guideline examples, the KFUPM part is Turquoise and the college name is Green.
- Internal collaborations (p29/51): don't place a sub-brand logo next to the master logo, and use no more than one sub-brand logo per design. Credit other units in text, for example "In collaboration with:".

**CCM file mapping** (`Branding\CCM Logo\`)
| File | Guideline lockup | Colours | Use on |
|---|---|---|---|
| `Computing_ShortHorizontal_C.svg` (647×138) | Shorthand Horizontal | Turquoise and Green | Light backgrounds |
| `Computing_ShortStack_C.svg` / `_W.svg` (647×168) | Full Horizontal (the file name says "ShortStack") | C: Turquoise and Green; W: all white | C on light backgrounds, W on dark backgrounds |
| `Computing_Full_C.svg` / `_W.svg` (548×217) | Full Stacked | C: Turquoise and Green; W: all white | C on light backgrounds, W on dark backgrounds |
| `*_CollegeColor.svg` (all three lockups) | Same lockups, every element in `#4EABB1` | College colour | The guidelines show no college-coloured logo. p10/32 says to use only palette colours |
| `COMP_SM_C` / `_KFUPM` / `_College1` / `_College2.svg` (291×291 with a background) | Not in the guidelines (looks like a social media avatar): icon, KFUPM, "Computing" stacked | C: white background with Turquoise and Green; KFUPM: Turquoise background with white; College1: white background with `#4EABB1`; College2: `#4EABB1` background with white | n/a |

No white version of ShortHorizontal is supplied, and there is no CCM favicon file.

## 4. FAST Matrix

- **What it is:** "generative & dynamic patterns" of vertical bars with a consistent **5° skew** taken from the logotype (p51/73). It is built from three units (Bold, Medium and Light) on a grid of squares skewed horizontally by 5° (p52/74). Patterns are made with the **FAST Matrix Generator**, which has settings for Details, Frequency, Random Seed, Animate, Colour Settings, Record (video), Export SVG and Copy SVG (p53/75, p54/76). The generator link is a button in the PDF; its URL is not readable in the render.
- **Usage:** it is "not required for all applications", and "overuse may diminish [its] uniqueness". Use it selectively, to enhance the design without dominating it, with consistent orientation and layering (p55/77, p57/79).
- **Allowed colours.** Only the combinations shown are allowed (p56/78). No college colours or Black appear.

| Background | Allowed matrix colours |
|---|---|
| Turquoise | Green, Beige, White, Yellow, Sand, Blue, Gray |
| Green | Turquoise, Beige, White, Yellow, Blue, Gray (no Sand) |
| Beige | Turquoise, Green, White, Yellow, Sand, Blue, Gray |
| White | Turquoise, Green, Beige, Yellow, Sand, Blue, Gray |
| Yellow / Blue / Gray | Turquoise, Green, Beige, White |
| Sand | Turquoise, Beige, White (no Green) |

- **Don'ts** (p58/80):
  - more than one matrix pattern in the same piece
  - matrix fully covering an image
  - a steeper skew
  - changing the orientation (for example, horizontal bars)
  - flipping
  - mismatched units or broken connections
  - unapproved colours
  - gradients
- **With photos** (p65/87): the matrix can sit as a layer between the background and the subject. A slight overlap is fine if it doesn't cover key features.
- **FAST Container** (p67/89, p68/90): a frame skewed by 5° that holds a photo or a title. It must snap to the matrix on at least one edge.
- **Animated output** is exported as .webm and can be converted to .mp4 or .mov (p59/81).
- **Files:** `03 Fast Matrix\` has 7 SVGs at 1920×1080, all paths filled `#115F66`, with no background.

## 5. Iconography, photography and imagery

- **Icons** (p70/92, p71/93): "simple, modern", built from shapes based on the octagon in the logo icon. That influence should be "integrated naturally, without being forced", so every icon stays "clear and functional". The examples are single-colour Turquoise line icons with rounded ends. Stroke weight, grid and sizes: *Not specified in guidelines.*
  - Files in `04 Icongraphy\`: 13 SVGs (174.63 square viewBox, strokes converted to fills, `#115F66`), plus 14 PNG previews, JPG and PDF versions, and an `.ai` source.
- **Photography style** (p61/83): authentic, diverse and forward-moving. It shows students, faculty and campus life naturally, with real moments of achievement, collaboration and innovation.
- **Cutout images** (p62/84): cut-out portraits and buildings, used with design elements. The examples sit on solid Turquoise, Beige, Yellow or Green.
- **University facilities** (p63/85): architecture shot in daylight or golden hour, with natural light.
- **Lifestyle shots** (p64/86): personal and cultural moments that feel warm and authentic and show connection.
- Photo treatments, filters, aspect ratios and alt text: *Not specified in guidelines.*

## 6. Layout, grid and digital use

- Poster grids are shown only as diagrams (p11/33): 4 columns for vertical and square posters, 6 for horizontal ones. Margins are at least 5%, and the logo sits top right within one column.
- Web grid, breakpoints, spacing scale, components and UI states: *Not specified in guidelines.*
- What the guidelines do say about digital use:
  - the favicon (p7/29)
  - the web palette with tints and the feedback colours (p39/61)
  - Segoe UI as the fallback on digital platforms (p47/69)
  - the master brand on website homepages and social media (p21/43)
  - SVG and .webm export from the generator (p53/75 to p59/81)
  - a mobile digital ID example (p49/71)
- Social media sizes and templates: *Not specified in guidelines.*

## 7. Accessibility and contrast

- "Use only approved color combinations. Take special care with reverse type and text overlays" (p32/54, p35/57).
- Yellow combinations pass "only for large text" and should be used "sparingly", mainly in headlines (p32/54).
- WCAG level, contrast ratios, the size that counts as "large text", focus states and motion: *Not specified in guidelines.*

## Developer notes (not from guidelines)

1. **Decide on the CCM colour before building.** There are four candidates: `#9BC9C3` (both .ase files: RGB file `#9BC9C3`, CMYK file 36-7-24-0), `#6BBDBE` (PDF label), about `#49C0BF` (how the PDF renders it) and `#4EABB1` (logo SVGs). The last three are one medium teal; the .ase value is a different, paler teal. Ask the KFUPM branding team and put the answer in one token, `--ccm-college`. Value in use since 2026-11-19: `#4EABB1`, the one the CCM team uses (owner's decision), pending the branding team's confirmation. Until then, use the `_C` and `_W` logos, which contain no college colour. All five sites use this one colour; departments have none.
6. **Department logos** (received 2026-11-19, `CCM Logo/Departmentes Logo/<dept>/`): `Full Stacked` (KFUPM + "Department of …") and `Shorthand Stacked` (KFUPM Computing + "Department of …"), each with a `_Negative` (all white) version, as .ai, .pdf, .png (about 2,700px wide) and .svg. The SVG department names are live `<text>` in Helvetica Now Display, so use the PNGs on the web until outlined SVGs arrive. The logo files use turquoise `#136066` and green `#019667`, a hair off the brand's `#115F66` / `#009767`.
2. **The guideline "Pass" does not mean WCAG AA.** Measured contrast ratios:
   - meet 4.5:1: White on Turquoise **7.36**, Turquoise on Beige **5.63**, Black on Green **5.62**, Black on Sand **6.68**
   - fall below 4.5:1: White on Green 3.73, Yellow on Turquoise 4.15, White on Sand 3.14, White on Blue 2.21, White on Gray 2.26, Green on Beige 2.86
   - fall below 3:1 even though "large only" is allowed: Green on Turquoise 1.97, Sand on Turquoise 2.34, White on Yellow 1.77
   - CCM colours: White on `#9BC9C3` is 1.82; Turquoise on it is 4.04 and Black on it is 11.54
   - For body text and links, use Turquoise or the darker steps from p39 (Green dark 1 `#016445` = 7.22 on white). Keep `#009767` text to 24px and up (or 18.66px bold).
3. **Fonts:**
   - Self-host the WOFF2 files from `01 Font\KFUPM Display\WOFF\`. The internal family name is "KFUPM" (weights 400, 700 and 900).
   - The design has a built-in 5° slant (italicAngle −5). Never add `font-style: italic`, and set `font-synthesis: none`.
   - IBM Plex Sans Arabic is TTF only in the folder; we converted it to WOFF2. On the websites it is only for Arabic letters (`unicode-range`).
   - **Open Sans** is the websites' English text font (KFUPM web team, 2026-11-23). The CCM, ICS and COE themes already load it (weights 300, 400, 600, 700, 800 and italics; no 500), so it is not uploaded.
   - The site is English only, so `ss01` doesn't matter yet.
4. **The logo SVGs contain live `<text>` set in "Helvetica Now Display" with `skewX(-5.19)`.** That font isn't supplied, so the college name will render in a fallback font on the web. Convert the text to outlines or ask for outlined files, and fix the off-brand greens (`#019467`, `#009567`).
5. **Logo position:** the "top right" rule comes from the poster pages. Confirm with branding whether it applies to an English website header. Keep 1X clear space. Since no minimum size is given, I suggest keeping the icon at least 24px tall.
6. **Favicon:** the guidelines define one, but the folder doesn't include it. Ask the branding team for it.
7. **Matrix on the web:**
   - use one pattern per view
   - mark it decorative with `aria-hidden="true"`
   - recolour it only to the allowed combinations
   - never rotate, flip or stretch it
   - respect `prefers-reduced-motion` for animated versions
8. **Don't use the Seal on the website.** The live site's `#007D40` green, `#C69529` gold and Font Awesome 5 are off-brand. (Open Sans is not: it is the web team's font for English text, 2026-11-23.)
9. `DC Upgrade - Assessment Findings and Required Actions.docx` has nothing to do with the website or branding. Its metadata says it is a CCM data-centre assessment, but the body now holds only a stub "Exam Scheduling Term 262" table. It has a KFUPM letterhead.
