# Sitefinity test (CCM site): does our method work?

Before we build many pages, we run **one test inside the real CMS**. It answers six questions:

1. Does Sitefinity accept our **CSS file** (`.css`) in the library?
2. Can a page **link to that one CSS file** (CSS widget → "Link to a file")? If yes, one update to the file changes every page. This is the most important question.
3. Does the **Content block** keep our HTML: the pop-up, the expanding row and the icons?
4. Does the **old site theme** change our fonts or colours?
5. Does Sitefinity accept our **font files** (`.woff2`), and do they work from the library?
6. When we **replace the CSS file** in the library, does the page update by itself?

> **Golden rule:** never click **Publish** on the test page. Use only **Preview** and **Save as draft**.
> Uploading files to the library is fine. Library files are public, and that's needed for fonts and CSS.

Time: about 30 to 40 minutes. Menu names are from Sitefinity 14. If yours look a little different, look for the closest match.

## Files

| File | What it is |
|---|---|
| [`../ccm-styles.css`](../ccm-styles.css) | **The design.** One file for every page of the CCM site. Made by the build tool. |
| [`test-page/01-content.html`](test-page/01-content.html) | The test content: four small tests, one per box. |
| [`test-page/00-check-in-live-site.html`](test-page/00-check-in-live-site.html) | Open it in your browser: it shows the result you should get, inside the live page. |
| [Reference picture: desktop](../../pages/sitefinity-test/previews/test-page-desktop.png), [phone](../../pages/sitefinity-test/previews/test-page-phone.png), [pop-up open](../../pages/sitefinity-test/previews/test-page-popup-desktop.png) | Compare the Sitefinity Preview with these. |
| `design-system/fonts/*.woff2`, `design-system/graphics/fast-matrix-four-green.svg` | The shared files for Part F. |

To rebuild after a design change: `node tools/build-sitefinity.mjs CCM/pages/sitefinity-test`

Write your results in the **Results** table at the end of this file as you go. ✅ = worked, ❌ = didn't work.

---

## Part A: Upload the CSS file (once for the CCM site)

1. Go to **https://ccm.kfupm.edu.sa/Sitefinity** and log in.
2. Go to **Content → Documents & Files**. If you can, create a library (folder) called **Web design system**, so all design files stay together.
3. Click **Upload documents** and choose `CCM/upload/ccm-styles.css`. Upload it.
   - Refused, for example "file type not allowed"? Note it in the results (question 1) and skip to Part B. In Part C you'll paste the CSS instead of linking it.
4. Click the uploaded file to open it. Copy its link: it starts with `https://ccm.kfupm.edu.sa/docs/`. If you don't see it, right-click the file's download link and choose **Copy link address**.
5. Paste the link into [`CCM/cms-links.json`](../../cms-links.json), between the quotes after `"ccm-styles.css":`, and save.

## Part B: Make a hidden test page

6. In the top menu, click **Pages**, then **Create a page**.
7. Fill in the form:
   - **Title:** `Sitefinity Test`
   - **Put this page:** under **People**
   - **URL:** `sitefinity-test`
   - **Navigation:** untick **Show in navigation**, so it never appears in the site menu.
   - **Template:** the same one *Dean & Chairmen* uses. To find it, look at the *Dean & Chairmen* page's **Actions → Template** in the Pages list.
8. Click **Create and go to add content**. The page editor opens.

## Part C: Add the design (CSS widget)

9. The widget panel is on the right. Open the **Scripts & Styles** group and **drag the "CSS" widget** into the main content area.
10. Click **Edit** on the widget.
    - **If Part A worked:** choose **Link to a file** and paste the link of `ccm-styles.css`. Click **Save**.
    - **If the .css upload was refused:** choose **Write CSS**. In VS Code, open `CCM/upload/ccm-styles.css`, press **Ctrl+A** then **Ctrl+C**, paste it into the box and click **Save**.

## Part D: Add the content (Content block)

11. Open the **Content** group and **drag a "Content block"** just **below** the CSS widget.
12. Click **Edit**. In the editor's toolbar, click the **HTML** button (it may look like **`<>`**) to switch to code view.
13. In VS Code, open `test-page/01-content.html`, press **Ctrl+A** then **Ctrl+C**, paste it into the code view and click **Save**.
    Don't switch back to the normal view before saving, because the visual editor can rewrite the code.

## Part E: Preview and check

14. Click **Preview** at the top of the editor. A tab opens showing the page as a visitor would see it.
15. Go through each test box on the page and compare it with the reference pictures:

| Test | What you should see |
|---|---|
| **Test 1: Design and fonts** | The headings are in KFUPM Display (bold, slightly slanted). The text is in IBM Plex Sans Arabic. The Arabic line is in the same font as the reference. **No** sentence starting with "Test 1 failed". At the bottom of the box: **Design build:** followed by a code. Note that code. |
| **Test 2: Banner** | A turquoise banner with the green KFUPM pattern behind the photo. Small icons before the email, phone and office lines. Two rounded buttons. |
| **Test 3: Pop-up** | Clicking *Dr. Malak Baslyman* opens a box over the page. The X button and the Esc key close it. **No** sentence starting with "Test 3 failed". |
| **Test 4: Expanding row** | Clicking the row opens the details under it; a second click closes it. |
| **Phone** | Make the browser window narrow (or press **F12** and use the phone button). Compare with the phone reference picture. |
| **Old theme** | Nothing from the old style inside our area: no green `#007D40` or gold colours, no Open Sans font, no extra underlines, bullets or borders. |

16. Take two screenshots of the Preview, one wide and one narrow.

## Part F: Check what Sitefinity saved

The Content block's editor may quietly delete code it doesn't know. This check finds every change.

17. Back in the page editor, click **Edit** on the Content block and switch to the **HTML** view again.
18. Press **Ctrl+A** then **Ctrl+C**. Close the editor with **Cancel** (don't change anything).
19. In VS Code, create a new file `CCM/upload/sitefinity-test/test-page/content-after-save.html`, paste, and save.
20. In the VS Code terminal, run:
    ```
    node tools/compare-saved.mjs CCM/upload/sitefinity-test/test-page
    ```
    It lists anything Sitefinity **REMOVED** or **CHANGED**, and what that breaks. "No changes" is the best result.

**If Test 3 or Test 4 failed, or the report shows REMOVED items:** delete the Content block, drag an **Embed code** widget (in *Scripts & Styles*) to the same place, paste the same `01-content.html` into it, save, and repeat Parts E and F. Note which of the two works.

## Part G: Fonts from the library, and updating the CSS file

This tests questions 5 and 6. Until now the fonts came from a backup (Google Fonts, or inside the CSS file). Now they come from the CCM library.

21. Go to **Content → Documents & Files → Web design system** and upload the five font files from `design-system/fonts/`:
    `KFUPM-Bold.woff2`, `IBMPlexSansArabic-Regular.woff2`, `IBMPlexSansArabic-Medium.woff2`, `IBMPlexSansArabic-SemiBold.woff2` and `IBMPlexSansArabic-Bold.woff2`.
    - Refused ("file type not allowed")? Note it in the results (question 5) and stop here. The site administrator can allow `.woff2` in the Documents library settings. The fonts keep working from the backup until then.
22. Go to **Content → Images**, and upload `design-system/graphics/fast-matrix-four-green.svg`.
23. Copy the link of each of the six files into `CCM/cms-links.json`, next to its name, and save.
24. Run the build: `node tools/build-sitefinity.mjs CCM/pages/sitefinity-test`
    It should say **"6 of 6 linked"** and **"CHANGED"** next to `ccm-styles.css`, with a new build code.
25. In **Documents & Files**, open `ccm-styles.css` and **replace** its file with the new `CCM/upload/ccm-styles.css`. Look for **Replace file**, **Change** or **Upload new version** on the file's edit screen. Don't upload it as a second file, because that creates a second link.
26. Open the test page's **Preview** again, without editing the page. Press **Ctrl+F5** to skip the browser's memory.
    - Does **Design build:** now show the **new** code from step 24? If yes, one file update reaches every page. 🎉
    - Do the fonts still look like the reference?
27. Click **Save as draft**, then **Back to Pages**. **Don't click Publish.** Keep the test page as a draft: we'll reuse it to test new components later.

## Part H: Tell Claude how it went

Send:
- the **Results** table below, filled in;
- the output of `compare-saved.mjs`;
- the two screenshots (wide and narrow);
- anything that didn't match these steps (for example, no "Link to a file" option, or no Replace button).

---

## Results

| # | Question | ✅ / ❌ | Notes |
|---|---|---|---|
| 1 | Library accepts `ccm-styles.css` | | |
| 2 | CSS widget **Link to a file** works (Test 1 passes) | | |
| 3a | Test 3 pop-up works in the Content block | | |
| 3b | Test 4 expanding row works in the Content block | | |
| 3c | `compare-saved.mjs` says "No changes" | | |
| 3d | Embed code widget works (only if 3a to 3c failed) | | |
| 4 | No old-theme styles inside our area | | |
| 4b | Phone layout matches the reference | | |
| 5 | Library accepts `.woff2` fonts, and they show in Preview | | |
| 6 | After replacing `ccm-styles.css`, Preview shows the new build code | | |

## If something goes wrong

| What you see | What to do |
|---|---|
| No **CSS** widget in *Scripts & Styles* | Tell Claude. There's another way to add it. |
| No **Link to a file** option in the CSS widget | Use **Write CSS** for now and note it in the results. |
| The page shows **plain text**, with the sentence "Test 1 failed" | The CSS didn't load. Open the CSS link in a new browser tab: it should show the CSS code. If it downloads a file or shows an error, tell Claude. |
| Preview still shows the **old build code** after replacing the file | Wait 5 minutes and press Ctrl+F5 again. If it still shows the old code, the site keeps old files in memory (cache). Note it: we'll need a different update method. |
| "This page is locked by …" | Someone else is editing it. Wait, or ask them. |
