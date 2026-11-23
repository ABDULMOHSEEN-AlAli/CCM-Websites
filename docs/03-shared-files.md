# 3. Upload the shared files

Every redesigned page on a site uses the same **5 files**: three KFUPM Display fonts, the KFUPM pattern, and the design file `ccm-styles.css`. **Open Sans** (all English text) is not uploaded: each site's theme already loads it. You upload them **once per site**, and every page uses their links. Each site needs its own copy, because browsers block fonts that come from another website.

| Site | Status |
|---|---|
| CCM | ✅ Done on 22 November 2026. Links in [`CCM/cms-links.json`](../CCM/cms-links.json). |
| ICS, COE, MATH | Not yet: part of [Set up a new site](05-new-site-setup.md). |

> Library files are public once uploaded. That's normal and needed for fonts and CSS. The **never Publish** rule is only about pages.

## The 5 files

| # | File in this project | Where it goes in Sitefinity |
|---|---|---|
| 1 | `design-system/fonts/KFUPM-Regular.woff2` | Content → **Documents & Files** → Default library → `design-system` → `fonts` |
| 2 | `design-system/fonts/KFUPM-Bold.woff2` | same folder |
| 3 | `design-system/fonts/KFUPM-Black.woff2` | same folder |
| 4 | `design-system/graphics/fast-matrix-four-beige.svg` | Content → **Images** → Default library → `design-system` → `graphics` |
| 5 | `<SITE>/upload/ccm-styles.css`, uploaded **last** | Content → **Documents & Files** → Default library → `design-system` → `styles` |

**Optional, only for Arabic text:** the four `IBMPlexSansArabic-*.woff2` files, in the same `fonts` folder. Until their links are filled in, the design simply leaves Arabic to the browser's own font. (CCM already has them.)

**Not uploaded:** Open Sans (the site's theme has it; the `OpenSans*.woff2` files in `design-system/fonts` are for previews on your computer), `fast-matrix-four-green.svg` and the department logos. They're only used by the design guide on your computer, or not yet used by any design. Photos are uploaded with the page that uses them, not here.

## Steps (CCM as the example; use the site's own name)

### 1. Make the folders (once)
- **Documents & Files → Default library**: a folder `design-system`, with `fonts` and `styles` inside.
- **Images → Default library**: a folder `design-system`, with `graphics` inside.

Use **folders**, not new libraries: creating a library called `design-system` fails with "Library with the same name already exists".

### 2. Upload files 1 to 6

### 3. Copy their links into `<SITE>/cms-links.json`
Click each uploaded file and copy its link. Sitefinity shows it as `http://…`; paste it as it is, because the tools switch it to `https://`. Save the file, then run:
```
node tools/check-cms-links.mjs CCM
```
The six files should say **OK**, and `ccm-styles.css` says **TODO**.

### 4. Build the design file with those links
```
node tools/build-sitefinity.mjs CCM/pages/home
```
It should say **"6 of 6 linked from the CCM Sitefinity library"**. Any page folder of the site works here; they all make the same `ccm-styles.css`.

### 5. Upload `ccm-styles.css` (file 7), then copy its link into `cms-links.json`
Run `node tools/check-cms-links.mjs CCM` again. Every line should say **OK** (the IBM Plex lines may say "optional").

## When the build says `ccm-styles.css … CHANGED`
The design changed. Replace the file in the library:
1. In `Documents & Files → design-system → styles`, open `ccm-styles.css` and **replace** its file with the new `<SITE>/upload/ccm-styles.css`. Look for **Replace file**, **Change** or **Upload new version**. **Don't upload a second copy**, because that makes a new link.
2. Run `node tools/check-cms-links.mjs CCM`. It says whether the library has the latest build.
3. Every page that links the file updates by itself. Until the cache issue below is solved, press **Ctrl+F5** in Preview to see the new version.

If a font or the pattern is ever replaced, copy its new link into `cms-links.json`, build, and replace `ccm-styles.css`.

## On each page: the CSS widget
**CSS widget** → **Link to a file** → type the **short link** (the link without `https://ccm.kfupm.edu.sa`), for example `/docs/default-source/design-system/styles/ccm-styles.css` → **Media** `all` → **Save**.
- Don't click **Select**: it shows the server's folders, not the library.
- Check that **Media** says exactly `all`. A stray letter there stops the CSS loading.

## Before real pages go live
The library tells browsers to keep files for **90 days**. After `ccm-styles.css` is replaced, returning visitors might see the old design for up to 3 months. Only the site administrator can change this. It doesn't block testing, but **it must be solved before any redesigned page is published.**

A message you can send to Eng. Ahmed:

> Hello Eng. Ahmed, for the CCM website redesign we keep one shared CSS file in the Documents library (Default library → design-system → styles → ccm-styles.css), and pages link to it. Library files are currently sent with `Cache-Control: max-age=7776000` (90 days), so after we update the file, visitors keep the old version. Could you set a short client cache, for example one hour, for that folder or for the Documents library? We'll need the same on the ICS, COE and MATH sites later. Thank you.
