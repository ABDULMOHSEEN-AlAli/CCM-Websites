# 4. Test a page in Sitefinity

**Goal:** see a design inside the real website **without changing the real page**. We make a hidden copy of the page, put the design on it, and look at it with **Preview**.

> **Golden rule:** never click **Publish** on a test page. Use only **Preview** and **Save as draft**.
> Before deleting anything, check that the editor's title ends with **TEST**.

**Before you start:** the site's shared files must be in its library ([Upload the shared files](03-shared-files.md)). Run `node tools/check-cms-links.mjs CCM`: every line should say **OK** (the IBM Plex lines may say "optional"). If `ccm-styles.css` says WARN, replace it in the library first.

## The files for a page
After `node tools/build-sitefinity.mjs CCM/pages/<page>`, each option has a folder in `CCM/upload/<page>/`:

| File | What it's for |
|---|---|
| `01-content.html` | **Paste this** into Sitefinity. |
| `00-check-in-live-site.html` | **Open this** in your browser: the result you should get, inside the live page. On your computer its text may show in Segoe UI, because the website only lets its own pages use its fonts. Judge the fonts in Preview. |

## Steps

### 1. Make a hidden copy
1. Log in at `https://ccm.kfupm.edu.sa/Sitefinity` and go to **Pages**.
2. Next to the real page, open **Actions** (or **⋯**) → **Duplicate**.
3. **Title:** the page's name + ` TEST`. **URL:** the page's address + `-test`. **Untick Show in navigation.**
4. **Create and go to add content.** Check that the title says **TEST**.

*No Duplicate option?* Use **Create a page**: same parent, same template (see the real page's **Actions → Template**), and untick *Show in navigation*.

### 2. Remove the old content (on the TEST copy only)
Delete the old widgets in the main area: hover, open **▾ / More** → **Delete**. Leave the header, menu, side menu and footer alone; they come from the template. See the page notes below for what to delete on each page.

### 3. Add the design: a CSS widget
**Scripts & Styles → CSS** widget → **Link to a file** → the short link of `ccm-styles.css` (`/docs/default-source/design-system/styles/ccm-styles.css`) → **Media** `all` → **Save**. Don't click **Select**.

### 4. Add the content: a Content block or an Embed code widget
Drag it just **below** the CSS widget, then paste the whole of `01-content.html` (in VS Code: **Ctrl+A**, **Ctrl+C**).

| The design has… | Use | Where to paste |
|---|---|---|
| no pop-ups | **Content block** (*Content* group) | **Edit** → the **HTML** button (`<>`) → paste → **Save**. Don't switch back to the normal view before saving. |
| pop-ups (for example Dean & Chairmen option 1A) | **Embed code** widget (*Scripts & Styles*) | Paste → **Save**. |

Why: the Content block keeps the pop-up code when it saves, but removes it when it shows the page. The Embed code widget keeps everything.

### 5. Preview
Click **Preview** and compare with `00-check-in-live-site.html`, wide and narrow (**F12** → the phone button). Check:
- the fonts: KFUPM Display for headings, Open Sans for text;
- all photos show, and links go to the right pages;
- nothing from the old style shows inside our area: no green or gold, no Open Sans;
- the layout uses the space it should (full width on the home page, the content column elsewhere).

### 6. Check what Sitefinity saved (Content block only)
Open the Content block again → **HTML** → **Ctrl+A**, **Ctrl+C** → **Cancel**. In VS Code, save it as `content-after-save.html` in the option's upload folder, then run:
```
node tools/compare-saved.mjs CCM/upload/<page>/<option>
```
"No changes" is best. Shortened image links (`/images/…`) and added `sfref` or `data-sf-ec-immutable` markers are normal and harmless.

### 7. Save as draft, then tell Claude
**Save as draft** → **Back to Pages**. **Don't Publish.** Send Claude screenshots (wide and narrow), the `compare-saved` output, and anything that didn't match these steps.

To try another option on the same test page, replace only the Content block's code. The CSS widget stays.

---

## Page notes

### Home page (CCM)
- **Copy:** Duplicate **Home** → `Home TEST`, URL `home-test`.
- **Delete:** the four bands between the header and the footer: the dark *About College* band, the three program cards, the dark *Facts* band, and *News & Events*. Hover over a band's top edge until its own bar appears → **▾ / More** → **Delete**. If a band can't be deleted, delete the widgets inside it and tell Claude.
- **Paste:** a Content block in the empty main area. No pop-ups.
- **The news and events are typed copies**, so they won't update. That's fine for judging the look. On the real home page, the live **News** and **Events** widgets must stay, and our CSS will style them.
- The hero title is the page's one main heading (H1), because the home template has none.
- Tested on CCM: works as expected (22 November 2026).

### Research Groups (CCM)
- **Copy:** Duplicate **Research → Research Groups** → `Research Groups TEST`, URL `research-groups-test`.
- **Delete (TEST copy only):** the old content in the main column.
- **Paste:** a Content block. No pop-ups; the names open with `<details>`, which works in a Content block.
- **Colour look:** the map and the mosaic carry one `ccm-look-…` class on their section. The upload file has the default look; once a look is chosen, it becomes the default.
- **Option 4B needs two pages:** also create `CCM Faculty in Research Centers TEST` under Research Groups and paste `option-4b-page-2-affiliated-faculty`. Its "See the CCM faculty" links must then point to that page's web address.
- Consider renaming the real page to "Research Centers" later (page settings); keep its web address.

### Programs (CCM)
- **Copy:** Duplicate **Academics → Programs** → `Programs TEST`, URL `programs-test`.
- **Delete (TEST copy only):** the old content in the main column (the department headings and their program boxes).
- **Paste:** a Content block. No pop-ups; option 5's open-and-close rows work in a Content block.

### Dean & Chairmen (CCM)
- **Copy:** Duplicate **People → Dean & Chairmen** → `Dean & Chairmen TEST`, URL `dean-chairmen-test`.
- **Delete (TEST copy only):** the headings "Dean" and "Academic Chairmen" and the two people lists.
- **Paste:** option **1A** (pop-ups) → **Embed code** widget. Options 1B, 2 and 3 → Content block.
- **Going live is different:** the real page must **keep** its People widget, because it shows every profile (`…/people-detail/<name>`). We'll hide the old list with CSS instead of deleting it.

### Sitefinity test page
Used once per site to check that the method works: [Set up a new site](05-new-site-setup.md). On CCM it's the hidden draft `sitefinity-test`, kept for testing new components.

## Clean-up
Keep a TEST page as a draft while we compare options. Delete it when that page is finished.
