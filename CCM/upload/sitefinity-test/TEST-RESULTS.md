# Sitefinity test: results (CCM site)

- **Run:** 2026-11-21 by the project owner, guided by Claude, following [HOW-TO-TEST.md](HOW-TO-TEST.md).
- **Site:** https://ccm.kfupm.edu.sa, Sitefinity 14.4 DX (MVC), theme `CCM`.
- **Page:** the hidden test page `sitefinity-test`, kept as a draft and never published.
- **Outcome:** every question answered. The "one linked CSS file per site" approach works. Pages with a pop-up need the **Embed code** widget. **One open issue:** browser caching (see Issue 6).

## Summary

| # | Question | Result | Short answer |
|---|---|---|---|
| 1 | Library accepts `ccm-styles.css` | ✅ | Uploaded to **Documents & Files → Default library → styles**. |
| 2 | CSS widget **Link to a file** works | ✅ | Only after fixing Issues 1–3. |
| 3a | Pop-up (`popover`) works in a Content block | ❌ | Stripped when the page is shown (Issue 4). |
| 3b | Expanding row (`<details>`) works in a Content block | ✅ | |
| 3c | Content block keeps the HTML on save | ✅ | Nothing removed; harmless additions (Observation 2). |
| 3d | Embed code widget keeps everything | ✅ | The pop-up opens, and X and Esc close it. |
| 4 | No old-theme styles leak into our area | ✅ | |
| 4b | Phone layout matches the reference | ✅ | |
| 5 | Library accepts `.woff2` fonts, and they work | ✅ | Fonts and the FAST Matrix SVG load from the CCM library. |
| 6 | Replacing `ccm-styles.css` updates the page | ✅ | Build `0a10fc8a` → `d1c51b26` showed after Ctrl+F5. Watch the cache (Issue 6). |

## Library structure (re-upload)

The owner **deleted the test uploads on 2026-11-21**, to upload them again in tidy folders. Folders, not libraries: creating a library named `design-system` failed with "Library with the same name already exists". Use the same names on every site:

```
Content → Documents & Files → Default library
└── design-system/
    ├── styles/      ccm-styles.css
    └── fonts/       kfupm-bold.woff2, ibmplexsansarabic-regular.woff2,
                     ibmplexsansarabic-medium.woff2, ibmplexsansarabic-semibold.woff2,
                     ibmplexsansarabic-bold.woff2
Content → Images → Default library
└── design-system/
    ├── graphics/    fast-matrix-four-beige.svg  (the pattern the round-2 designs use)
    └── logos/       (later: department logos)
```

Expected links, for example `/docs/default-source/design-system/styles/ccm-styles.css` and `/images/default-source/design-system/graphics/fast-matrix-four-beige.svg`. Check each one opens before putting it in `CCM/cms-links.json`: Sitefinity lowercases names and may change them.

Not re-uploaded yet (the owner chose to wait), so `CCM/cms-links.json` is empty and the build uses its fallbacks. During the test, fonts came back as `application/octet-stream` with `nosniff`, which browsers accept for fonts, and the SVG from the Images library came back as `image/svg+xml`.

## Issues found and their solutions

### Issue 1: the CSS widget's "Select" button doesn't show library files
- **Seen:** under **Link to a file**, clicking **Select** opens a picker that lists server folders (AdminApp, App_Data, bin, Mvc, ResourcePackages, Sitefinity), and the uploaded CSS isn't there.
- **Cause:** that picker browses the web application's file system, not the Documents library.
- **Solution:** don't click Select. **Type the link** into the text box and click **Save**.

### Issue 2: `media="a"` stopped the CSS loading
- **Seen:** the page showed plain text with "Test 1 failed…" visible. The page source had `<link href="…ccm-styles.css" media="a">`.
- **Cause:** the widget's **Media** field held `a`, probably `all` cut short. Browsers skip a stylesheet whose media value they don't understand.
- **Solution:** set **Media** to `all`, or leave it empty.
- **How to find it:** in Preview, press Ctrl+U and search for `ccm-styles`. That shows the exact `<link>` tag Sitefinity writes.

### Issue 3: Sitefinity gives library links as `http://`
- **Seen:** the link copied from a library item starts with `http://ccm.kfupm.edu.sa/…`, although the site runs on https.
- **Cause:** the site appears to sit behind an https proxy and builds its links as http. Browsers block an http stylesheet on an https page.
- **Solution:**
  - In the CSS widget, use the **short link** `/docs/default-source/styles/ccm-styles.css`. It uses the page's own address.
  - In `cms-links.json`, use **`https://`** links. `build-sitefinity.mjs` refuses anything else and names the bad entry.

### Issue 4: the Content block strips `popover` when it shows the page
- **Seen:** the profile pop-up showed open over the page with no dark backdrop and couldn't be closed.
- **Cause:** the **saved** HTML still had `popover`, `popovertarget` and `popovertargetaction` (checked in `content-after-save.html`). The **shown** page had no `popover` anywhere (Ctrl+U on Preview). Sitefinity cleans the Content block's HTML on output and drops attributes it doesn't know. `<details name="…">` survived.
- **Solution:** put pages with a pop-up in an **Embed code** widget (*Scripts & Styles*). There the pop-up works fully. Designs without a pop-up can stay in a Content block.
- **Safety net added to the CSS** (`profile-popup.css`): `.ccm-profile:not([popover]) { display: none; }`. If the attribute is ever stripped, the box stays hidden instead of covering the page.

### Issue 5: wrong font links in `cms-links.json`
- **Seen:** the build stopped with "must be a full https:// link".
- **Causes:** all the links were `http://`, and the Regular font's link was missing `.woff2`, so it returned 404.
- **Solution:** both fixed. **Note:** the build checks only the *format* of a link, not that it opens. After pasting links, check each one, for example with `curl -sI <link>`, before relying on it.

### Issue 6 (OPEN): the library tells browsers to keep files for 90 days
- **Seen:** library files are served with `Cache-Control: public, max-age=7776000` (90 days).
- **Effect:** the owner saw the new build only after **Ctrl+F5**. A returning visitor's browser may keep the old `ccm-styles.css`, the old design, for up to 90 days after a replacement.
- **Options:**
  1. **Recommended:** ask the site administrator (Eng. Ahmed) to set a short client cache, for example one hour, on the Documents library or on the `styles` folder.
  2. Add the build code to the link in each page's CSS widget (`…ccm-styles.css?v=d1c51b26`). This works without the administrator, but every page must be edited after each design change.
- **Must be solved before real pages go live.**

## Observations

1. **Editor view vs Preview.** The page editor doesn't apply a CSS widget that links into `<head>`. It only says "Included in the HTML `<head>` tag". Always judge the design in **Preview**.
2. **The Content block changes on save:**
   - library image links become short links (`https://ccm.kfupm.edu.sa/images/…` → `/images/…`);
   - it adds `sfref="…"` on `<img>` and `data-sf-ec-immutable` on `<img>`, `<a>` and `<article>`.
   All harmless, and classes are kept.
3. **`compare-saved.mjs` false alarm.** It reported a changed `src` on the third image because Dr. Malak's photo appears twice and the tool paired the images by position. The saved HTML was correct. The tool should match by content, not by position (not fixed yet).
4. **The build code works as a version check.** `<p class="ccm-build">Design build:</p>` shows the code of the CSS the browser actually loaded. It's now styled as a beige pill, so it's easy to spot. Compare it with the code the build prints.
5. **File size.** With the fonts linked from the library, `ccm-styles.css` went from about 105 KB (KFUPM Display packed inside the file) to about 66 KB.
6. **No theme leaks.** Inside `.ccm-scope` the old CCM theme (green/gold, Open Sans) didn't affect headings, lists or links.

## Rules for building real pages (from this test)

1. Upload `ccm-styles.css`, the 5 fonts and the SVG **once per site**. Put their `https://` links in `<SITE>/cms-links.json`, and check each link opens.
2. On each page, a **CSS widget** → **Link to a file** → type `/docs/default-source/styles/ccm-styles.css` → Media `all`. Don't click Select.
3. Page content: **Content block** when there's no pop-up, **Embed code** widget when there is one.
4. After a design change: run the build. If it says CHANGED, **replace** the library file (don't add a second copy). Check the build code in Preview with Ctrl+F5.
5. Solve Issue 6 (cache) before rollout.

## For the department sites (ICS, COE, MATH)

Repeat this test on each site before building pages there. Copy `CCM/pages/sitefinity-test/` and this folder, and use the site's own library and `cms-links.json`. Watch for the same issues. **COE runs Sitefinity 15.1** with a newer editor, so Issues 1, 2 and 4 may behave differently there.
