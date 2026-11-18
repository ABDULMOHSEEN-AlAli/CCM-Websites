# Prompt for Claude in Chrome — Sitefinity admin discovery (read-only)

> **How to use:**
> 1. Fill in the page list below. If you leave it empty, the agent covers the home page only.
> 2. In Chrome, open https://ccm.kfupm.edu.sa and log in to the Sitefinity admin panel (usually https://ccm.kfupm.edu.sa/Sitefinity).
> 3. Open the **Claude side panel from the extension icon** in that same window. Don't use a claude.ai tab, because it can't control the browser. Start a **new chat** there, then paste everything below the line.
> 4. Paste its full answer into `reference/01-sitefinity-discovery-report.md`.

---

I'm about to redesign some pages on our college website, https://ccm.kfupm.edu.sa, which runs on Sitefinity CMS. I've never used Sitefinity before. A developer (another Claude, working in my code editor) will plan the work from your report, so I need you to explore the admin panel and record how the site is built.

**Before you start:** if you can't see and click in my browser tabs (that is, you have no browser-control tools), stop and tell me in one sentence. Don't do partial work.

**Pages I want to update** (if this list is empty, cover the home page only):
- https://ccm.kfupm.edu.sa/
- [ADD MORE PAGE URLS HERE, ONE PER LINE]

## What's already known (don't re-check these)

- Version: **Sitefinity 14.4.8131.0 DX**, from the page's Generator tag.
- Front end: built with the **MVC** framework and a custom resource package called **"CCM"** (`/ResourcePackages/CCM/`), using Bootstrap 5.0, jQuery 3.6 and Font Awesome 5.
- Site CSS: `main.min.css`, `all-style.min.css` and `custom-ccm.css`. Fonts are Open Sans, Hacen Tunisia Lt and KacstOffice. Main colours are green #007D40 and gold #C69529.
- The home page is English only (`lang="en"`), and no Arabic language links were found.

## Rules: this is READ-ONLY

I'm logged in as an admin, so you could change things by accident. Please follow these rules strictly:

- Do NOT click Publish, Save, Save as draft, Discard, Delete, Unlock, Move, Duplicate, Upload, Install or Restart, and don't change any setting or toggle.
- If a dialog asks you to save or confirm a change, click Cancel.
- Opening the page editor locks the page. Only open it for the pages listed above, one at a time. Leave it with the editor's own "Back to Pages" or "Close" button without saving. If a page is locked by someone else, don't open it. Just note that it's locked.
- Don't copy personal data into your report, such as user lists, email addresses or form submissions. Counts are fine.
- If you're unsure whether a click changes something, don't click it. Write down what you would have needed to check.
- Never guess. If you can't find something, write "Not found" and list where you looked.

## Part B: the admin panel

The menu names below are where these things usually are in Sitefinity 14.x. Look around if they aren't there.

1. **Edition and licence:** under Administration → "Version & Licensing", which edition and licence type is shown, and is there an expiry date?
2. **Page templates:** under Design → Page Templates, list every template with its name, its framework if shown (MVC, Hybrid or Web Forms), the number of pages using it, and which one the target pages use.
3. **Pages:** list the top-level page tree, top-level items only. For each target page, give its title, URL, template, status (published or draft), date last modified, and whether it's shown in navigation.
4. **Widgets on the target pages:** open each target page in the editor and go through each layout area from top to bottom, listing the widgets in it with their type and what they show. Note any widget that contains raw HTML or a `<style>`/`<script>` tag. Also note which parts come from the template (they're locked or greyed out on the page) and which belong to the page itself.
5. **Widget toolbox:** while in the editor, list the widget categories and the widget names in each. Point out any that look custom-made for CCM, not built into Sitefinity.
6. **Adding custom CSS and HTML:** in the toolbox, check whether these widgets exist: "Content block" (does it have an HTML or source view?), "CSS" or "Style sheet", and "JavaScript". These decide whether we can add new designs from the admin panel.
7. **Content types:** under Content, list the types (News, Events, Blogs, Lists, Images, Documents, and any custom modules) with a rough item count for each.
8. **Languages:** under Administration → Settings → Languages, which languages are configured, and which one is the default?
9. **Web services and API:** under Administration → Web services, which services exist, what their URLs are (for example `/api/default`), and who can access them (public or authenticated). Don't create or edit any.
10. **Can we test safely?** Is there any staging or test site mentioned anywhere? In the Pages list, is there a place where unpublished or hidden test pages already live, or could live?
11. **Anything else** that seems important for someone redesigning pages.

## Part C: target page review

For each target page, view the public page:
- Describe it from top to bottom, section by section, saying what each section is and roughly how it looks.
- Resize the window to phone width (about 390px) and note anything that breaks.
- List what looks outdated, inconsistent or broken.

## Report format

Reply with one Markdown document using exactly these headings:

```
# Sitefinity Discovery Report
## 1. Summary for a non-technical reader   (5–8 plain-language sentences)
## 2. Edition & licence
## 3. Page templates                        (table)
## 4. Target pages                          (one sub-section per page: details, widget list, template vs page parts, section-by-section review, mobile issues)
## 5. Widget toolbox                        (by category, custom ones flagged)
## 6. Custom CSS / HTML options             (what exists, what each allows)
## 7. Content types                         (table)
## 8. Languages
## 9. Web services / API
## 10. Safe testing options
## 11. Not found / couldn't check           (item → where you looked)
## 12. Anything else notable
```

Use tables wherever it helps.
