# 7. Troubleshooting

Most of these were seen during the CCM Sitefinity test ([results](reference/sitefinity-test-results-ccm.md)).

## The design doesn't show

| What you see | Why | What to do |
|---|---|---|
| Plain text and square photos, or the sentence "Test 1 failed" | The CSS didn't load. | In Preview, press **Ctrl+U** and search for `ccm-styles`. Check the `<link>` tag: the link must start with `/docs/` and **media** must be `all`. A stray value like `media="a"` stops it. |
| The CSS link was chosen with **Select** and doesn't work | **Select** browses the server's folders, not the library. | Type the short link instead: `/docs/default-source/design-system/styles/ccm-styles.css`. |
| The link starts with `http://` and the CSS is blocked | Sitefinity shows library links as `http://`, but the site runs on `https://`, and browsers block http files on https pages. | In the CSS widget, use the short link that starts with `/`. In `cms-links.json`, `http://` is fine: the tools switch it. |
| The page editor shows no design, only "Included in the HTML head tag" | The editor doesn't apply a linked CSS. | Judge the design in **Preview**, never in the editor. |

## Fonts, files and updates

| What you see | Why | What to do |
|---|---|---|
| Text in a plain font in Preview | A font link is wrong, or the file is missing. | Run `node tools/check-cms-links.mjs CCM`. It names the broken link. |
| `00-check-in-live-site.html` shows Segoe UI on your computer | The website only lets its own pages use its fonts. | Normal. Judge fonts in Preview. |
| Preview still shows the old design after replacing `ccm-styles.css` | The library tells browsers to keep files for 90 days. | Press **Ctrl+F5**. For visitors, the administrator must shorten the cache: see [Upload the shared files](03-shared-files.md#before-real-pages-go-live). |
| The build stops with "must be a full https:// link" | A link in `cms-links.json` isn't a website link. | Copy the link again from the library. |
| Uploading a `.woff2` or `.css` file says "file type not allowed" | The library doesn't allow that file type. | Ask the site administrator to allow it in the library settings. (It worked on CCM.) |

## The content breaks after saving

| What you see | Why | What to do |
|---|---|---|
| A pop-up shows open over the page and won't close, or a click does nothing | The Content block removes the pop-up code when it shows the page. | Use an **Embed code** widget for pages with pop-ups. |
| Icons missing or the layout jumbled after saving | The Content block's editor changed the code. | Run `compare-saved` (see [Tools](06-tools.md)) and send the output to Claude. Meanwhile, use an **Embed code** widget. |
| `compare-saved` lists changed image links (`/images/…`) or added `sfref` or `data-sf-ec-immutable` | Sitefinity's normal tidying. | Harmless. Nothing to do. |

## Sitefinity in general

| What you see | What to do |
|---|---|
| No **CSS** widget in *Scripts & Styles* | Tell Claude. There's another way to add it. |
| "This page is locked by …" | Someone else is editing it. Wait, or ask them. |
| You changed the **real** page by mistake | Don't publish. Open the page's **Actions → Revision history** and go back to the last published version, or tell Claude. |
| A profile link shows "page not found" | The People widget was deleted from the page that shows the profiles. Restore it from **Revision history**. |
