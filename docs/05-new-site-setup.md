# 5. Set up a new site (ICS, COE, MATH)

Before the first redesigned page on a department site, do three things on **that site's own Sitefinity**: upload the shared files, run the Sitefinity test once, and record the results. CCM is done; its results are in [reference/sitefinity-test-results-ccm.md](reference/sitefinity-test-results-ccm.md).

> **COE runs Sitefinity 15.1**, with a newer page editor than the other sites (14.4). Menu names and some behaviours may differ, so the test matters most there.
> **ISE is on hold.** It isn't a Sitefinity site, so these steps don't apply to it.

## Step 1: Upload the shared files
Follow [Upload the shared files](03-shared-files.md) with the site's own library and `<SITE>/cms-links.json`, for example `ICS/cms-links.json`. Every site needs its own copy of the files.

## Step 2: Ask Claude to prepare the test page
Claude copies `CCM/pages/sitefinity-test/` to the new site, points it at one of that site's live pages, and builds it. You get:
- `<SITE>/upload/sitefinity-test/test-page/01-content.html`: the test content;
- `<SITE>/upload/sitefinity-test/test-page/00-check-in-live-site.html`: what you should get;
- reference pictures in `<SITE>/pages/sitefinity-test/previews/`.

## Step 3: Run the test (about 30 minutes)
The test answers five questions:
1. Can a page **link to the one CSS file** in the library?
2. Does the **Content block** keep our code (icons, classes), and do **pop-ups** survive?
3. Does the site's **old theme** change our fonts or colours?
4. Do the **fonts** load from the library?
5. When we **replace the CSS file**, does the page update by itself?

**a. Make a hidden page.** **Pages → Create a page**: title `Sitefinity Test`, under **People** (or any section), URL `sitefinity-test`, **untick Show in navigation**, and the same template as a normal inside page. Then **Create and go to add content**.

**b. CSS widget.** **Scripts & Styles → CSS** → **Link to a file** → the short link of the site's `ccm-styles.css` → **Media** `all` → **Save**. Don't click **Select**.

**c. Content block.** **Content → Content block** below it → **Edit** → **HTML** (`<>`) → paste `01-content.html` → **Save**.

**d. Preview** and compare with the reference pictures:

| Test box | What you should see |
|---|---|
| **Test 1: Design and fonts** | Headings in KFUPM Display (bold, slightly slanted), text in Open Sans, and the Arabic line in IBM Plex Sans Arabic (only if its optional links are filled in). **No** sentence starting "Test 1 failed". At the bottom: **Design build:** and a code. |
| **Test 2: Card** | A white card with a light beige KFUPM pattern behind the photo, small icons before each contact line, one rounded button. |
| **Test 3: Pop-up** | Clicking the name opens a box over the page; the X and the Esc key close it. **No** sentence starting "Test 3 failed". |
| **Phone** | A narrow window (**F12** → phone button) looks like the phone reference picture. |
| **Old theme** | No old colours, fonts, underlines or bullets inside our area. |

**e. Check what was saved.** Copy the Content block's HTML view into `<SITE>/upload/sitefinity-test/test-page/content-after-save.html` and run:
```
node tools/compare-saved.mjs ICS/upload/sitefinity-test/test-page
```

**f. If the pop-up failed** (on CCM it did): delete the Content block, add an **Embed code** widget with the same code, and preview again.

**g. Replace test.** Make any small design change with Claude (or ask Claude to rebuild), so the build says **CHANGED**. Replace `ccm-styles.css` in the library, open Preview again without editing the page, and press **Ctrl+F5**. **Design build:** should show the new code.

**h. Save as draft.** **Never Publish.** Keep the page as a draft for testing new components later.

## Step 4: Record the results
Send Claude the filled-in table below, the `compare-saved` output and two screenshots (wide and narrow). Claude writes them up as `docs/reference/sitefinity-test-results-<site>.md`, like the CCM one.

| # | Question | ✅ / ❌ | Notes |
|---|---|---|---|
| 1 | Library accepts `ccm-styles.css` and the fonts | | |
| 2 | CSS widget **Link to a file** works (Test 1 passes) | | |
| 3 | Content block keeps the code (`compare-saved` shows no REMOVED) | | |
| 4 | Pop-up works in a Content block / in an Embed code widget | | |
| 5 | No old-theme styles inside our area; the phone layout matches | | |
| 6 | After replacing `ccm-styles.css`, Preview shows the new build code | | |

Problems you may meet are in [Troubleshooting](07-troubleshooting.md). They were all seen on CCM.
