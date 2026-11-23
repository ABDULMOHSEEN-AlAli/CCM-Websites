# 6. Tools

Run these in the VS Code terminal (**Terminal → New Terminal**), from the project folder. They need Node.js, which is installed. None of them changes anything in Sitefinity.

## The ones you'll use

| Command | When | What it does |
|---|---|---|
| `node tools/check-page.mjs CCM/pages/home` | After building or changing a page | Checks the part of each option that gets uploaded: headings, images, links, phone and office formats, class names, and things Sitefinity's editor deletes. Fix every **ERROR**. Add `--all` to list every style warning. |
| `node tools/build-sitefinity.mjs CCM/pages/home` | After a design change, before uploading | Makes the upload files: `CCM/upload/ccm-styles.css` and, for each option, `01-content.html` and `00-check-in-live-site.html`. It prints the **build code** and says **CHANGED** when `ccm-styles.css` must be replaced in the library. |
| `node tools/check-cms-links.mjs CCM` | After pasting links into `cms-links.json`, and after replacing `ccm-styles.css` | Opens every link in `CCM/cms-links.json` and checks that the file is there, is the right kind of file, matches ours, and (for the CSS) is the latest build. **OK** = good, **WARN** = look at it, **ERROR** = fix it, **TODO** = not uploaded yet. |
| `node tools/compare-saved.mjs CCM/upload/home/option-1-classic` | After saving a Content block in Sitefinity | Compares what you pasted (`01-content.html`) with what Sitefinity saved (`content-after-save.html`, which you copy from the Content block's HTML view). Lists anything **REMOVED** or **CHANGED**, and what it breaks. |

You can give a page folder (all its options) or one option file, for example `CCM/pages/home/option-1-classic.html`.

## The ones Claude uses for previews

| Command | What it does |
|---|---|
| `node tools/screenshot.mjs CCM/pages/home` | Takes the desktop and phone pictures in `previews/` with Microsoft Edge. Add `"#show=<id>"` and a name to picture a pop-up (or a tile's names) open, or `"#look=<name>"` and a name to picture a colour look. |
| `node tools/live-frame.mjs CCM/pages/home` | Copies the live site's header, menu and footer into the page folder's `live-frame.js`, so previews show the design inside the real site. Run it again if the live header or menu changes. |

## Data tools

| Command | What it does |
|---|---|
| `node tools/research-centers.mjs` | Opens every People page of all 22 KFUPM research centers and finds the CCM faculty on them, matched with the four department faculty lists. Prints a summary per center and saves the results (with faculty emails) in a temporary folder, not in the project. Used to build the Research Groups page; run it again to refresh the names. |

## Files the tools read and write

| File | Written by | Notes |
|---|---|---|
| `<SITE>/cms-links.json` | **You** | The library links of the shared files (5 needed, plus 4 optional IBM Plex files for Arabic). Paste links as Sitefinity shows them (`http://` is fine). |
| `<SITE>/upload/…` | The build | Never edit by hand; build again instead. |
| `<SITE>/upload/<page>/<option>/content-after-save.html` | **You** | Copied from Sitefinity, for `compare-saved`. |
| `<SITE>/pages/<page>/previews/`, `live-frame.js` | The preview tools | Used by the compare pages and previews. |
