# How to upload the new Dean & Chairmen design to Sitefinity (test run)

**Goal:** see the new design inside the real website, **without changing the live page.**
We make a hidden copy of the page, put the new design on the copy, and look at it with **Preview**.

> **Golden rule:** never click **Publish** on the test page. Use only **Preview** and **Save as draft**.
> Menu names below are from Sitefinity 14. If yours look a little different, look for the closest match.

## Files

Each design option has its own folder here, for example `option-2-name-cards/`. Pick the option you want to test and use the files inside that folder:

| File | What it is |
|---|---|
| `00-check-in-live-site.html` | Open this in your browser first. It shows what you should get. The empty little boxes in the header and footer only appear in this local copy; ignore them. |
| `01-styles.css` | The design: colours, fonts, layout. It's long (about 85 KB) because the KFUPM font is built in. That's expected. This file is **the same for every option and every site**. |
| `02-content.html` | The content: the Dean and the chairmen, in that option's layout. |

To rebuild these files after a design change: `node tools/build-sitefinity.mjs CCM/pages/dean-chairmen`

---

## Step 1: Make a hidden test copy of the page

1. Go to **https://ccm.kfupm.edu.sa/Sitefinity** and log in.
2. In the top menu, click **Pages**.
3. Find **Dean & Chairmen** in the list. It's under **People**; click the arrow next to People to expand it.
4. Click **Actions** (or the **⋯** menu) next to *Dean & Chairmen* and choose **Duplicate**.
5. Fill in the form:
   - **Title:** `Dean & Chairmen TEST`
   - **URL:** `dean-chairmen-test`
   - **Navigation:** untick **Show in navigation**, so it never appears in the site menu.
6. Click **Create and go to add content**. The page editor opens.

*No "Duplicate" option?* Use **Create a page** instead. Choose **People** as the parent, untick *Show in navigation*, and pick the same template that *Dean & Chairmen* uses. You can see that template in the original page's **Actions → Template**.

## Step 2: Remove the old content (on the TEST page only)

7. Check the top of the editor. It must say **Dean & Chairmen TEST**. If it doesn't, stop.
8. In the main area, to the right of the green side menu, are the old pieces: the headings "Dean" and "Academic Chairmen", and the people lists.
   For each one, hover over it, open its **▾ / More** menu, and choose **Delete**.
9. Parts you can't select (the header, the grey "People" band, the side menu, the footer) come from the shared template. Leave them alone.

## Step 3: Add the design (CSS widget)

10. The widget panel is on the right side. Open the **Scripts & Styles** group and **drag the "CSS" widget** into the empty main area.
11. Click **Edit** on the new widget and choose **Write CSS**.
12. In VS Code, open `01-styles.css`, press **Ctrl+A** then **Ctrl+C**, and paste it into the box. Click **Save**.

## Step 4: Add the content (Content block)

13. Open the **Content** group and **drag a "Content block"** just **below** the CSS widget.
14. Click **Edit**. In the editor's toolbar, click the **HTML** button (it may look like **`<>`**) to switch to code view.
15. In VS Code, open `02-content.html` and copy everything (**Ctrl+A**, **Ctrl+C**). Paste it into the code view and click **Save**.
    Don't switch back to the normal view before saving, because the visual editor can rewrite the code.

> **Options 2, 3 and 6 have clicks** (a pop-up, or a row that opens). They work without JavaScript, but the Content block editor may delete the special attributes they need (`popover`, `popovertarget`, `<details>`). In Preview, click a card or row. If nothing happens, use the **Embed code** widget instead (see the table below).

## Step 5: Look at it (Preview, not Publish)

16. Click **Preview** at the top of the editor. A tab opens showing the page as a visitor would see it.
    Compare it with `00-check-in-live-site.html`. Also make the browser window narrow to check the phone layout.
17. Click **Save as draft**, then **Back to Pages**. **Don't click Publish.**

## Step 6: Tell Claude how it went

- Send screenshots of the Preview, wide and narrow.
- Note anything that looks different from `00-check-in-live-site.html`.
- If a step didn't match what you saw (for example, no CSS widget or no HTML button), describe what you saw instead.

---

## If something goes wrong

| What you see | What to do |
|---|---|
| No **CSS** widget in *Scripts & Styles* | Tell Claude. There's another way to add it. |
| The people show up but **without the design** (plain text, square photos) | The CSS didn't get saved. Open the CSS widget again and check the box isn't empty. |
| The design shows, but **icons are missing or the layout is jumbled** after saving | The Content block editor changed the HTML. Delete it, and use the **Embed code** widget (in *Scripts & Styles*) instead, with the same `02-content.html`. It keeps the code exactly as pasted. |
| **Clicking a card or row does nothing** (options 2, 3 and 6) | Same cause: the editor removed the attributes the click needs. Use the **Embed code** widget instead. |
| "This page is locked by …" | Someone else is editing it. Wait, or ask them. |
| You accidentally changed the **real** page | Don't publish. Open it and look for **Revision history** in the page's Actions menu to go back to the last published version. Or leave it unpublished and tell Claude. |

## After the test: going live (not now)

The content above is **typed into the page by hand**. That's fine for a test. But the live page should keep reading from Sitefinity's **People** list, so that when a chairman changes, someone just edits *Content → People* and the page updates by itself.

The next step will be a new **widget template** that shows the People list in the new design. That needs **Design → Widget Templates**, which this account doesn't have yet. Access is being requested from the site administrator. Until then, pages are built as HTML + CSS.

**Clean-up:** when we're done testing, delete the *Dean & Chairmen TEST* page.
