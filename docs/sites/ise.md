# ISE: Department of Industrial & Systems Engineering

> **On hold (decided 2026-11-19).** We work one department at a time, and ISE comes later. Nothing here is being built yet. Its logo is already in `design-system/logos/ise-*.png`.

| | |
|---|---|
| Website | https://ise.kfupm.edu.sa |
| Platform | **Not Sitefinity.** A Django site, very likely the **Wagtail** CMS (Django security cookies, Wagtail-style image names such as `…max-1900x1900.png`). |
| Chair | Dr. Yasser Almoghathawi |
| Design | Shared with all five sites: [`design-system/`](../../design-system/) |

> The shared CSS works here too, because it's plain CSS. But the Sitefinity upload steps and `tools/build-sitefinity.mjs` don't apply. We need to find out who runs this site and how pages are edited (Wagtail admin is usually at `/admin/`).

## Pages being redesigned

None yet. When a page starts, it gets a folder `ISE/pages/<page>/`, the same as on [CCM](ccm.md).

## All pages on the site

Taken from the site menu on 2026-11-18.

**Home:** `/`

**About us:** `/about`
- Chairman Message: `/about/chairman-message`
- Vision & Mission: `/about/vision-mission`

**Academics:** `/academics`
- Undergraduate
  - BS in Industrial & Systems Engineering: `/academics/undergraduate-program/bs-in-industrial-systems-engineering`
  - Program Intro & History: `/academics/undergraduate-program/program-intro-history`
  - Degree Plan: `/academics/undergraduate-program/degree-plan-new`
  - Concentration (CX) Program: Decision Analytics: `/academics/undergraduate-program/concentration-cx-program-decision-analytics`
  - Concentration Mapping: `/academics/undergraduate-program/concentration-mapping-industrial-systems-engineering`
- Graduate
  - ISE Graduate Programs: `/academics/graduate-program/ise-graduate-programs`
  - M.S. (Thesis-based) in ISE: `/academics/graduate-program/ms-program-in-ise`
  - M.S. (Project-based) in Maintenance and Reliability: `/academics/graduate-program/professional-master-mx-in-ise`
  - Ph.D. in ISE: `/academics/graduate-program/phd-program-in-ise`
  - PhD Comprehensive Exam: `/academics/graduate-program/phd-comprehensive-exam`
  - ISE Graduate Courses Description: `/academics/graduate-program/ise-graduate-courses-description`
- Accreditation
  - About ABET Accreditation: `/academics/accreditation/about-abet`
  - ABET: ISE Program: `/academics/accreditation/ise-program`
  - ABET: ISE Degree Plan: `/academics/accreditation/abet-ise-degree-plan`

**People:** `/people`
- Faculty: `/people/faculty`
- Staff: `/people/staff`
- Graduate Students: `/people/graduate-students`

**Research:** `/research`
- Research Areas: `/research/research-areas`
- Research Statistics: `/research/research-statistics`
- Industrial Advisory Committee: `/research/industrial-advisory-committee`
- Industry Liaison Committee: `/research/industry-liaison-committee`

**News & Events:** `/news-and-events`
- Faculty Seminar Series: `/news-and-events/faculty-seminar-series`
- Graduate Seminar Series: `/news-and-events/graduate-seminar-series`
- Guest Seminar Series: `/news-and-events/guest-seminar-series`
- ISE Industry Talks: `/news-and-events/ise-industry-talks`

**Students:** `/students`
- ISE Club: `/students/ise-club`
- IEOM KFUPM Student Chapter: `/students/ieom-kfupm-student-chapter`

**Contact Us:** `/contact-us`

## Clean-up candidates (linked from the public homepage)

- Template placeholder pages: `/academics/program-1/sub-prog-1`, `/academics/program-1/sub-prog-2` and `/academics/program-2/sub-prog-3`.
- Test pages: `/testing`, `/testing/standard-page-1` and `/testing/standard-page-2`.
