# 2. How we design and agree

## Design by page type
Most pages on the five sites are one of 13 **page types**: text page, about page, program page, people list, contact page, and so on. We design each type **once**, agree on it, and use it on every page of that type, on every site.

The list of types, their pages, their status and the order of work is in [`design-system/page-types.html`](../design-system/page-types.html). Open it in a browser.

## The seven steps
| # | Step | Who |
|---|---|---|
| 1 | **Sample page.** Pick one real page of the type, with its real content. | Claude |
| 2 | **Options.** Two or three layouts of the same content, on a compare page with desktop and phone pictures. Each option shows the real site's header, menu and footer around it. | Claude |
| 3 | **Review.** On the compare page, mark each option **First choice**, **Could work** or **No**, and write comments. Mixing options is fine. Click **Copy feedback** and send it to Claude. | You and your team |
| 4 | **One combined design.** Steps 3 and 4 repeat, two rounds at most. | Claude |
| 5 | **Approve.** You say "approved". It's logged with the date in `page-types.html`. Options that weren't chosen, and their styles, are deleted. | You |
| 6 | **Test in Sitefinity** on a hidden page: [Test a page](04-test-a-page.md). | You |
| 7 | **Use it everywhere:** every page of that type on the current department's site. | Both |

**Not re-opened for each page:** colours, fonts, sizes, spacing, the header and footer, and designs that were already approved. To change an approved design, we change it in `design-system/`, so every page changes together.

## Reviewing on a compare page
1. Open `<SITE>/pages/<page>/index.html`, for example [`CCM/pages/home/index.html`](../CCM/pages/home/index.html).
2. Open each option. Make the window narrow to see the phone layout.
3. Under each option's picture, choose **First choice**, **Could work** or **No**, and add a comment.
4. At the bottom: add your name (optional) and overall comments. Then:
   - **Copy feedback** and paste it in your message to Claude, or
   - **Download as a file**, so teammates can send you their feedback.

Your answers stay saved in your browser until you click **Clear my answers**.

## After every page: two checks (brand and quality)

Every page is checked twice before it goes into Sitefinity: **first the automatic check, then the checklist.** Together they cover the KFUPM brand rules and our design guide.

| | 1. Automatic check | 2. Page checklist |
|---|---|---|
| **What** | A script: `tools/check-page.mjs` | A page you fill in: `design-system/checklist.html` |
| **Who** | The computer, in a few seconds | A person, about 10 minutes |
| **Brand rules it covers** | Colours, fonts, sizes, spacing and corners come **only** from the design system, so only from the KFUPM palette and fonts. Nothing on the page can add its own: no inline styles, no unknown classes, no other fonts. | What only an eye can judge: the colour balance (mostly White, Beige and Turquoise), the college colour used only as decoration, text on allowed backgrounds, FAST Matrix rules, logo rules, and the fonts as seen in Sitefinity Preview. |
| **Other rules** | Headings in order (titles in Title Case), image descriptions, photos and files from the CMS, working links, phone and office formats, and things Sitefinity's editor deletes. | Layout on phone, tablet and desktop, consistency with other pages, wording, accessibility, and safe upload. |

### 1. Run the automatic check
1. In VS Code, open the terminal: **Terminal → New Terminal**.
2. Type the command with the page's folder, and press **Enter**:
   ```
   node tools/check-page.mjs CCM/pages/home
   ```
3. Read the result. The last line looks like `Result: 0 errors, 0 warnings`.
   - **ERROR** = must be fixed before upload. Each line says what's wrong and on which line of the file.
   - **WARN** = have a look, then fix it or accept it knowingly.
   - It also checks the design system's own CSS: "0 CSS warnings" means every colour, size and space comes from the brand tokens.

### 2. Go through the page checklist
1. Open [`design-system/checklist.html`](../design-system/checklist.html) in your browser (double-click it).
2. Fill in the page name, the site and the date.
3. Answer every item **Yes**, **No** or **N/A**. Each item says how to check it, and the group's **See the rules** link opens that part of the design guide.
4. The bar at the top shows **Ready to upload** only when there's no **No** left. **Copy result** gives you a record to keep or send to Claude. **Start a new page** clears it.

When a new rule appears, it goes into the checker (if a computer can check it) or the checklist (if a person must).

## How a page folder is organised
```
CCM/pages/home/
  index.html            the compare page (open this)
  option-1-classic.html one option: the full preview
  option-2-....html
  live-frame.js         the live site's header, menu and footer, for previews (made by a tool)
  previews/             the pictures on the compare page (made by a tool)
```
Inside each option, the part between `SITEFINITY:START` and `SITEFINITY:END` is what goes into Sitefinity. Everything else is only for the preview.
