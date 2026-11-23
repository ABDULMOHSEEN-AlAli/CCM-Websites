// Find the CCM faculty affiliated with every KFUPM research center (Research Groups page).
//   node tools/research-centers.mjs [out dir]
// The results hold faculty emails, so they go to a temporary folder by default,
// not into the project. The Research Groups options are built from centers.json.
// Read only (GET requests). Writes centers.json and roster.json, prints a summary.
//
// 1. CCM roster, from the four department faculty pages:
//    - every faculty name on the list (ICS/COE <strong> names, MATH card names, ISE list),
//    - plus emails where the list shows them (ICS, COE, MATH) or the profile does (ISE).
//    A person can be on two department pages (for example a joint appointment).
// 2. All 22 research centers on kfupm.edu.sa/research/our-research/our-research-centers
//    (21 on ri.kfupm.edu.sa, and CIPR on cpg.kfupm.edu.sa), every People-type page.
// 3. Each person on a center page:
//      sure   = their email is on a CCM department page (and the center doesn't say
//               another department), or the center itself names a CCM department
//      unsure = only the name matches, or the center and the department site disagree
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
const OUT = process.argv[2] || fs.mkdtempSync(path.join(os.tmpdir(), 'ccm-research-'));
const UA = { 'User-Agent': 'Mozilla/5.0' };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
async function get(url) {
  for (let i = 0; i < 3; i++) {
    try {
      const c = new AbortController(); const tm = setTimeout(() => c.abort(), 30000);
      const r = await fetch(url, { headers: UA, redirect: 'follow', signal: c.signal });
      clearTimeout(tm);
      return { status: r.status, url: r.url, html: r.ok ? await r.text() : '' };
    } catch { await sleep(1500); }
  }
  return { status: 0, url, html: '' };
}
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&nbsp;|&#160;/g, ' ').replace(/&#39;|&rsquo;|&#8217;/g, '\'')
  .replace(/&quot;|&ldquo;|&rdquo;/g, '"').replace(/&#(\d+);/g, (m, n) => String.fromCodePoint(+n)).replace(/[​ ]/g, ' ');
const lines = (html) => decode(html.replace(/<script[\s\S]*?<\/script>|<style[\s\S]*?<\/style>/g, '')
  .replace(/<[^>]+>/g, '\n')).split('\n').map((x) => x.replace(/\s+/g, ' ').trim()).filter(Boolean);
const EMAIL = /[A-Za-z0-9._%+-]+@kfupm\.edu\.sa/;
const NOT_NAME = /professor|lecturer|director|scholar|instructor|engineer|researcher|scientist|dean|chair|postdoc|assistant|associate|fellow|visiting|department|dept|center|centre|college|manager|coordinator|specialist|officer|google|pure|website|profile|phone|tel|ext|building|bldg|room|office|contact|address|dhahran|kfupm|saudi|ksa|email|research|interest|areas?\b|computer science|computer engineering|mathematics|systems engineering|sciences?\b|[0-9@]/i;
const nameLike = (x) => x && x.length >= 5 && x.length <= 70 && !NOT_NAME.test(x.replace(/,?\s*Ph\.?\s?D\.?/i, '')) && x.split(' ').length >= 2;
const GENERIC = /^(info|ri|dr|crf|c-ise|webmaster|irc|arc|jrc|cems|crac|pcrc|ceee|mwsc|arcmst|theolive|cnp|info-cnp)\b|^irc-|^jrc-/i;
const norm = (n) => n.toLowerCase().replace(/,?\s*ph\.?\s?d\.?/g, '').replace(/^(dr|prof|professor|mr|ms|mrs|eng|engr)\.?\s+/g, '')
  .replace(/[^a-z ]/g, ' ').replace(/\b(al|el|bin|abu|ibn|md|muhammad|mohammad|mohammed|mohamed|muhamad)\b/g, ' ').replace(/\s+/g, ' ').trim();
const nameKey = (n) => { const p = norm(n).split(' ').filter(Boolean); return p.length > 1 ? `${p[0]}|${p[p.length - 1]}` : ''; };

// People on a page: each personal email, with the name and the lines between them
function people(html) {
  const L = lines(html);
  const out = [];
  for (let i = 0; i < L.length; i++) {
    const m = L[i].match(EMAIL);
    if (!m || GENERIC.test(m[0])) continue;
    let j = i - 1; const between = [];
    while (j >= 0 && i - j <= 6 && !nameLike(L[j])) { between.unshift(L[j]); j--; }
    if (j < 0 || i - j > 6) continue;
    out.push({ name: L[j], email: m[0].toLowerCase(), info: between.join(' ') });
  }
  const seen = new Set();
  return out.filter((p) => !seen.has(p.email) && seen.add(p.email));
}

// ---- 1. CCM roster --------------------------------------------------------------
const roster = []; // {name, email, dept}
const add = (name, email, dept) => { name = decode(name).replace(/\s+/g, ' ').trim(); if (nameLike(name) || email) roster.push({ name, email: (email || '').toLowerCase(), dept }); };
for (const [dept, url] of [['ICS', 'https://ics.kfupm.edu.sa/people/faculty'], ['COE', 'https://coe.kfupm.edu.sa/people/faculty']]) {
  const { html } = await get(url);
  for (const card of html.split(/class="card-body"/).slice(1)) {
    const name = (card.match(/<strong[^>]*>\s*([^<]+?)\s*<\/strong>/) || [])[1];
    const email = (card.match(/mailto:([^"\s]+@kfupm\.edu\.sa)/i) || [])[1];
    if (name) add(name, email && !GENERIC.test(email) ? email : '', dept);
  }
}
{
  const { html } = await get('https://math.kfupm.edu.sa/people/math-faculty-directory');
  for (const card of html.split(/class="card-name"/).slice(1)) {
    const name = (card.match(/^[^>]*>\s*([^<]+?)\s*</) || [])[1];
    const email = (card.split(/class="card-name"/)[0].match(/mailto:([^"\s]+@kfupm\.edu\.sa)/i) || [])[1];
    if (name) add(name, email && !GENERIC.test(email) ? email : '', 'MATH');
  }
}
{
  const { html } = await get('https://ise.kfupm.edu.sa/people/faculty');
  const links = [...new Set([...html.matchAll(/href="(\/people\/faculty\/[^"\/]+\/)"[^>]*>([\s\S]*?)<\/a>/g)].map((m) => m[1]))];
  for (const l of links) {
    const r = await get('https://ise.kfupm.edu.sa' + l);
    const emails = [...r.html.matchAll(/[A-Za-z0-9._%+-]+@kfupm\.edu\.sa/g)].map((m) => m[0]).filter((e) => !GENERIC.test(e));
    const h = decode((r.html.match(/<h1[^>]*>([\s\S]*?)<\/h1>/i) || r.html.match(/<h2[^>]*>([\s\S]*?)<\/h2>/i) || ['', ''])[1].replace(/<[^>]+>/g, '')).trim();
    const fromSlug = l.split('/')[3].replace(/^dr-/, '').split('-').map((w) => w[0].toUpperCase() + w.slice(1)).join(' ');
    add(nameLike(h) ? h : 'Dr. ' + fromSlug, emails[0] || '', 'ISE');
    await sleep(120);
  }
}
const emailDepts = new Map(); const nameDepts = new Map();
for (const r of roster) {
  if (r.email) emailDepts.set(r.email, new Set([...(emailDepts.get(r.email) || []), r.dept]));
  const k = nameKey(r.name); if (k) nameDepts.set(k, new Set([...(nameDepts.get(k) || []), r.dept]));
}

// ---- 2. The 22 research centers -------------------------------------------------------
const list = await get('https://kfupm.edu.sa/research/our-research/our-research-centers');
const centers = [];
for (const m of list.html.matchAll(/href="(https:\/\/ri\.kfupm\.edu\.sa\/([A-Za-z-]+))"/g)) {
  if (!centers.some((c) => c.slug === m[2])) centers.push({ slug: m[2], url: m[1] });
}
// Consortia are not centers; CIPR is listed without a link on that page and lives on cpg.kfupm.edu.sa
const NOT_CENTER = new Set(['theolive']);
const keep = centers.filter((c) => !NOT_CENTER.has(c.slug));
keep.push({ slug: 'cipr', url: 'https://cpg.kfupm.edu.sa/cipr/', peoplePages: ['https://cpg.kfupm.edu.sa/people/cipr/'] });

const PEOPLE_WORDS = /people|affiliat|member|staff|faculty|researcher|team|scholar|postdoc|director|expert/i;
const DEPT = (info) => /\bDCC\b|community college/i.test(info) ? 'other'
  : /information (and|&) computer science/i.test(info) ? 'ICS' : /computer engineering/i.test(info) ? 'COE'
  : /industrial (and|&) systems? eng|systems engineering department/i.test(info) ? 'ISE'
  : /mathematic/i.test(info) ? 'MATH' : /department|dept/i.test(info) ? 'other' : null;

const result = { checked: new Date().toISOString(), roster: { total: roster.length, withEmail: emailDepts.size }, centers: [] };
for (const c of keep) {
  const home = await get(c.url);
  const title = decode((home.html.match(/<title>([^<]*)/i) || ['', ''])[1]).replace(/\s+/g, ' ').replace(/\s*\|.*$/, '').trim();
  let pages = c.peoplePages;
  if (!pages) {
    const base = new URL(home.url || c.url);
    const slugPath = base.pathname.replace(/\/$/, '').toLowerCase();
    pages = [...new Set([...home.html.matchAll(/href="([^"#]+)"/g)].map((m) => decode(m[1]))
      .map((h) => { try { return new URL(h, base).href.replace(/^http:/, 'https:'); } catch { return null; } })
      .filter((h) => h && new URL(h).hostname === base.hostname && new URL(h).pathname.toLowerCase().startsWith(slugPath + '/') &&
        PEOPLE_WORDS.test(new URL(h).pathname) && !/news|event|join|job|apply/i.test(h)))];
  }
  const entry = { slug: c.slug, url: c.url, status: home.status, title, peoplePages: [], people: 0, ccm: [] };
  const seen = new Set();
  for (const p of pages) {
    const r = await get(p);
    const ps = people(r.html);
    entry.peoplePages.push({ url: p, status: r.status, people: ps.length });
    for (const person of ps) {
      if (seen.has(person.email)) continue; seen.add(person.email); entry.people++;
      const listed = DEPT(person.info);
      const byEmail = emailDepts.get(person.email);
      const byName = nameDepts.get(nameKey(person.name));
      let dept = null, sure = false, how = '';
      if (byEmail) {
        if (listed && listed !== 'other' && !byEmail.has(listed)) { dept = [...byEmail][0]; how = `the center says ${listed}, the department site says ${[...byEmail].join(' and ')}`; }
        else if (listed === 'other') { dept = [...byEmail][0]; how = `the center says "${person.info.slice(0, 60)}", but the email is on the ${[...byEmail].join(' and ')} site`; }
        else { dept = listed || [...byEmail][0]; sure = true; how = listed ? 'department on the center page, email on the department site' : 'email on the department site'; }
      } else if (listed && listed !== 'other') {
        dept = listed; sure = true; how = 'department on the center page';
        if (byName && !byName.has(listed)) { sure = false; how = `the center says ${listed}, a person with this name is on the ${[...byName].join(' and ')} site`; }
      } else if (byName) {
        dept = [...byName][0]; how = listed === 'other' ? `same name as CCM faculty, but the center says "${person.info.slice(0, 60)}"` : 'same name as CCM faculty; the email is not on the department site';
      }
      if (dept) entry.ccm.push({ name: person.name, email: person.email, dept, sure, how, info: person.info, page: p });
    }
    // Second pass: CCM names anywhere on the page, for people listed without an email
    const found = new Set(entry.ccm.map((x) => nameKey(x.name)));
    for (const line of lines(r.html)) {
      if (!nameLike(line)) continue;
      const k = nameKey(line);
      if (!k || found.has(k) || !nameDepts.has(k)) continue;
      found.add(k);
      entry.ccm.push({ name: line, email: '', dept: [...nameDepts.get(k)][0], sure: false, how: 'name only: listed on the center page without an email', info: '', page: p });
    }
    await sleep(120);
  }
  result.centers.push(entry);
  const u = entry.ccm.filter((x) => !x.sure).length;
  console.log(`${c.slug.padEnd(12)} ${String(home.status).padEnd(4)} pages:${String(pages.length).padEnd(3)} people:${String(entry.people).padEnd(4)} CCM:${String(entry.ccm.length).padEnd(3)} unsure:${u}  ${title}`);
}
fs.writeFileSync(`${OUT}/centers.json`, JSON.stringify(result, null, 1));
fs.writeFileSync(`${OUT}/roster.json`, JSON.stringify(roster, null, 1));
const byD = (d) => roster.filter((r) => r.dept === d).length;
console.log(`\nResults: ${OUT}`);
console.log(`CCM roster: ${roster.length} (ICS ${byD('ICS')}, ISE ${byD('ISE')}, COE ${byD('COE')}, MATH ${byD('MATH')}); ${emailDepts.size} with an email. Centers: ${result.centers.length}.`);
