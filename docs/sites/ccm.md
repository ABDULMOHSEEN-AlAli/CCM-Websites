# CCM: College of Computing and Mathematics

| | |
|---|---|
| Website | https://ccm.kfupm.edu.sa |
| Platform | Sitefinity 14.4 DX (MVC), theme package `CCM` |
| Design | Shared with all five sites: [`design-system/`](../../design-system/) |

## Pages being redesigned

| Page | Live address | Status | Files |
|---|---|---|---|
| Dean & Chairmen | `/peoples/dean-chairmen` | Round 3: 4 design options. Waiting for a choice. | [CCM/pages/dean-chairmen/](../../CCM/pages/dean-chairmen/): open `index.html` |
| Research Groups | `/research/research-groups` | Round 6: three options (research map, mosaic, center cards); the map and the mosaic have colour looks to choose from in the preview. The mosaic shows the totals, then equal tiles. Names confirmed: 13 centers, 119 affiliated faculty (133 center entries), none to check. | [CCM/pages/research-groups/](../../CCM/pages/research-groups/): open `index.html` |
| Programs | `/academics/programs` | Round 2: option 1 (first choice), 1B (clearer headings), 2 (cards) and 3 (tiles); departments in the order ICS, ISE, COE, MATH. Waiting for a choice. | [CCM/pages/programs/](../../CCM/pages/programs/): open `index.html` |
| Home page | `/` | Round 6: concepts 1 ("good"), 3 (lines) and 4 (compact), all with the same hero photo and no FAST Matrix. To be presented to the Dr., who chooses and mixes. Option 1 of round 4 was tested on the hidden draft *Home TEST* (2026-11-22): works. | [CCM/pages/home/](../../CCM/pages/home/): open `index.html` |
| Sitefinity test (hidden, never published) | `/peoples/sitefinity-test` | Done 2026-11-21 | [Sitefinity test results](../reference/sitefinity-test-results-ccm.md) |

## Files

Shared files are in the CCM library; their links are in [`CCM/cms-links.json`](../../CCM/cms-links.json). How the folders work: [docs/README.md](../README.md#folder-map).

## All pages on the site

Taken from the site menu on 2026-11-18. News, events and other detail pages are listed by their address pattern only.

**Home:** `/`

**About Us**
- Overview: `/about-us/overview`
- Vision & Mission: `/about-us/vision-mission-and-goals`
- Contact Us: `/about-us/contact-us`

**Academics**
- Departments: `/academics/departments`
- Programs: `/academics/programs`
  - Undergraduate Programs: `/academics/programs/undergraduate-programs`
  - Graduate Programs: `/academics/programs/graduate-programs`

**Research**
- Research Groups: `/research/research-groups`

**IT Services**
- Academic Initiative: `/it-services/academic-initiative`
- CCM Network Accounts: `/it-services/ccm-network-accounts`
- Contacts for Services: `/it-services/contacts-for-services`
- Email Aliases: `/it-services/email-aliases`
- FAQs: `/it-services/faqs`
- Home Directory Access: `/it-services/home-directory-access`
- PC Labs in CCM: `/it-services/pc-labs-in-ccm`
- Personal Website: `/it-services/personal-website`
- Printing: `/it-services/printing`
- Remote Login and VPN: `/it-services/remote-login-and-vpn`
- Security: `/it-services/security`
- Software: `/it-services/software`
- Student Project Support: `/it-services/student-project-support`

**People**
- Dean & Chairmen: `/peoples/dean-chairmen` (profiles: `/peoples/dean-chairmen/people-detail/<name>`)
- College Administration: `/peoples/college-administration`

**News & Events**
- News: `/news` (articles: `/news/news-detail/<name>`)
- Events: `/events` (events: `/events/events-details/<name>`)

**Homepage "featured" pages**
- Featured this month: `/featured-detail/featured-this-month`
- Prospective students: `/featured-detail/prospective-students`
- Research: `/featured-detail/research`

## Known issues

- Two People profiles use old addresses: Dr. Malak Baslyman's is at `…/people-detail/dr.-motaz-alfarraj` and Dr. Yasser Almoghathawi's is at `…/people-detail/dr.-anas-alghazi`. Fix them in Content → People → URL.
- Every People photo has the alt text "...".
- Photos are small: the Dean's is 300 × 300 px.
