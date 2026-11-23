# Documentation: CCM websites redesign

This project updates the look of the College of Computing and Mathematics website and its department websites (ICS, COE, MATH, and ISE later). All five sites share **one design system**. Pages are designed here, checked by tools, and then put into Sitefinity.

## Guides (read them in this order)

| # | Guide | Read it when |
|---|---|---|
| 1 | [How the system works](01-how-it-works.md) | First. The whole idea on one page. |
| 2 | [How we design and agree](02-design-workflow.md) | You start a new page or page type, or **check a page against the brand rules** ([the two checks](02-design-workflow.md#after-every-page-two-checks-brand-and-quality)). |
| 3 | [Upload the shared files](03-shared-files.md) | Once per site, and whenever the build says the CSS **CHANGED**. |
| 4 | [Test a page in Sitefinity](04-test-a-page.md) | You put a design on a hidden test page. |
| 5 | [Set up a new site](05-new-site-setup.md) | Before the first page on ICS, COE or MATH. |
| 6 | [Tools](06-tools.md) | You need a command. |
| 7 | [Troubleshooting](07-troubleshooting.md) | Something looks wrong in Sitefinity. |

## Pages you open in a browser
Double-click these files in File Explorer, or right-click and choose **Open with → Edge or Brave**.

| Page | What it is |
|---|---|
| [`design-system/index.html`](../design-system/index.html) | **The design guide**: colours, fonts, sizes, spacing, components and rules. |
| [`design-system/page-types.html`](../design-system/page-types.html) | **The plan**: every page of the five sites grouped into types, their status, and every decision so far. |
| [`design-system/checklist.html`](../design-system/checklist.html) | **The page checklist**: go through it after building each page. |
| `<SITE>/pages/<page>/index.html` | **A compare page**: the design options for one page, with review buttons. For example [`CCM/pages/home/index.html`](../CCM/pages/home/index.html). |

## Reference
- [KFUPM brand rules for the web](reference/brand.md): the summary of the brand guidelines, with page numbers.
- [Sitefinity test results (CCM)](reference/sitefinity-test-results-ccm.md): what works in Sitefinity and what doesn't.
- Site notes, with each site's pages, status and known issues: [CCM](sites/ccm.md) · [ICS](sites/ics.md) · [COE](sites/coe.md) · [MATH](sites/math.md) · [ISE](sites/ise.md)

## Folder map

```
CLAUDE.md               notes for Claude (the AI assistant), kept up to date by Claude
README.md               the project's front page, pointing here
docs/                   all the documentation (you are here)
design-system/          THE DESIGN: one set of styles for all five sites
  index.html              the design guide
  page-types.html         the plan and the decisions
  checklist.html          the page checklist
  tokens.css              every colour, size and space (change values only here)
  ccm.css                 the entry file that loads everything below
  components/             one CSS file per component
  fonts/  graphics/  logos/   the files the design uses
  preview.css/.js, review.js  for previews on your computer only, never uploaded
CCM/  ICS/  COE/  MATH/   one folder per website
  cms-links.json          the links of the shared files in that site's Sitefinity library
  pages/<page>/           the designs (options) for one page, with a compare page
  upload/                 MADE BY THE BUILD: what you paste into Sitefinity. Don't edit.
    ccm-styles.css          the whole design in one file
    <page>/<option>/        01-content.html (to paste) and 00-check-in-live-site.html (to look at)
tools/                  the commands (see the Tools guide)
```

## Golden rules
1. **Never Publish a test page.** Use **Preview** and **Save as draft** only.
2. **Everything comes from the CMS**: photos, documents, fonts and the CSS are uploaded to the site's own library and used by link.
3. **Change the design only in `design-system/`**, then run the build. Never edit files in `upload/`.
4. **After every page:** run the automatic check (`node tools/check-page.mjs CCM/pages/<page>`), then go through the checklist (`design-system/checklist.html`). See [the two checks](02-design-workflow.md#after-every-page-two-checks-brand-and-quality).
5. **The Branding folder on OneDrive is read-only.** It's the source of truth for colours, fonts and logos.
