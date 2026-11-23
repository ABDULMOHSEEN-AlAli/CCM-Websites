# 1. How the system works

## The idea in one picture

```
 design-system/            CCM/pages/home/              CCM/upload/                    Sitefinity
 (the styles)        +     (one page's design)   ──►    (made by the build)    ──►     (the website)
 colours, fonts,           the HTML of each            ccm-styles.css                  CSS widget → links ccm-styles.css
 sizes, components         option                      home/option-1/01-content.html   Content block → 01-content.html
                                    node tools/build-sitefinity.mjs
```

1. **The design system** (`design-system/`) holds every colour, font, size and component. All five sites use it, so they all look the same.
2. **A page design** (`<SITE>/pages/<page>/`) is a few options for one page, built from the design system with the page's real content. You compare them in a browser and choose one.
3. **The build** (`node tools/build-sitefinity.mjs <SITE>/pages/<page>`) turns them into files you can put into Sitefinity:
   - `ccm-styles.css`: the whole design in **one file per site**;
   - `01-content.html` for each option: the page's content.
4. **In Sitefinity**, a page gets two things:
   - a **CSS widget** that *links* to `ccm-styles.css` in the library, so one file serves every page, and
   - a **Content block** (or an **Embed code** widget) holding `01-content.html`.

## Why one CSS file is so useful
`ccm-styles.css` is uploaded **once** to the site's library, and every redesigned page links to it. When the design improves, you replace that one file, and **every page changes together**. No page needs editing. The build prints a **build code** (for example `1cd309a9`), so you can always check which version the library has: run `node tools/check-cms-links.mjs CCM`.

## What we can change, and what waits for template access
Your Sitefinity account can edit **Pages** and **Content**, but not **templates** (the layouts that Sitefinity fills with its own lists). So:

| Kind of page | What we do now | When we get template access |
|---|---|---|
| **Pages written by hand**: about pages, programs, contact, the home page's fixed parts | Our HTML in a Content block. Full control. | Nothing changes. |
| **Pages that show Sitefinity lists**: people lists, profiles, news, events | **The lists stay.** One CSS on the page restyles every item at once: colours, fonts, photo shape, spacing. | We redesign the template once; every item follows. |

Each faculty profile **isn't a page**. It's one record in *Content → People*, shown by the people page. So:
- a person's **information** (phone, photo, bio) is edited in their record, any time;
- the **look** of all profiles comes from one CSS file;
- the **structure** (which fields show, new sections) needs template access.

> **Never delete the People, News or Events widget from a real page.** It's what shows the profiles, articles and events. Without it, those links show "page not found".

## Decisions that apply everywhere
These are settled. Don't re-open them for each page; the full list with dates is in [`design-system/page-types.html`](../design-system/page-types.html).

- **CCM colouring on all five sites.** Departments have no colours of their own.
- **College colour `#4EABB1`**, until the KFUPM branding team confirms it.
- **Fonts:** KFUPM Display for headings, Open Sans for English text (the KFUPM web team's rule; each site's theme already loads it). IBM Plex Sans Arabic only for Arabic text.
- **Header, footer and side menu stay as they are** for now. New designs must look right inside them.
- **Everything comes from the CMS** (photos, documents, fonts, CSS), used by link.
- **One department at a time.** ISE is on hold (it isn't on Sitefinity).
- **Pages are HTML + CSS** until template access arrives.

## What's still open
| What | Who | Why it matters |
|---|---|---|
| Shorten the library's 90-day browser cache | Site administrator (Eng. Ahmed) | **Must be solved before any redesigned page is published.** Otherwise visitors keep an old design after an update. A ready message is in [Upload the shared files](03-shared-files.md#before-real-pages-go-live). |
| Template access (widget and page templates) | Site administrator | Needed to redesign profiles, news and events properly. |
| Confirm the college colour, outlined logo files, a favicon | KFUPM branding team | Small; the design works meanwhile. |
