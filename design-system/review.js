// PREVIEW ONLY: never uploaded to any website.
// Adds the review tools to a compare page (any page with .cmp__card items):
//   - on each option: First choice / Could work / No, and a comment box
//   - at the bottom: your name, overall comments, Copy feedback, Download, Clear
// Answers are saved in this browser only (localStorage), per compare page.
// Step 3 of "How we agree on a design" in design-system/page-types.html.
(function () {
  var cards = Array.prototype.slice.call(document.querySelectorAll('.cmp__card'));
  if (!cards.length) return;

  var KEY = 'ccm-review:' + location.pathname;
  var CHOICES = [['first', 'First choice'], ['maybe', 'Could work'], ['no', 'No']];
  var state = { reviewer: '', overall: '', options: {} };
  try { state = Object.assign(state, JSON.parse(localStorage.getItem(KEY) || '{}')); } catch (e) { /* private window */ }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(state)); } catch (e) { /* not saved */ } }
  function text(el) { return el ? el.textContent.replace(/\s+/g, ' ').trim() : ''; }

  // The project path of this page, e.g. CCM/pages/dean-chairmen/index.html
  var file = decodeURIComponent(location.pathname).replace(/^.*?\/((?:CCM|ICS|COE|MATH|ISE)\/pages\/.*)$/, '$1');
  var pageTitle = text(document.querySelector('h1'));

  // ---- 1. Controls on each option card -------------------------------------
  var options = cards.map(function (card, i) {
    var id = 'opt' + (i + 1);
    var label = [text(card.querySelector('.cmp__num')), text(card.querySelector('.cmp__title'))].filter(Boolean).join(': ') || 'Option ' + (i + 1);
    var saved = state.options[id] || {};
    var box = document.createElement('div');
    box.className = 'rv';
    box.innerHTML =
      '<fieldset class="rv__pick"><legend class="rv__legend">Your view of ' + label.replace(/</g, '&lt;') + '</legend>' +
      CHOICES.map(function (c) {
        return '<label class="rv__opt"><input type="radio" name="rv-' + id + '" value="' + c[0] + '"' +
          (saved.pick === c[0] ? ' checked' : '') + '><span>' + c[1] + '</span></label>';
      }).join('') + '</fieldset>' +
      '<label class="rv__label" for="rv-note-' + id + '">What do you like, or want changed?</label>' +
      '<textarea class="rv__note" id="rv-note-' + id + '" rows="2"></textarea>';
    box.querySelector('textarea').value = saved.note || '';
    card.querySelector('.cmp__body').appendChild(box);
    if (saved.pick) card.setAttribute('data-rv', saved.pick);

    box.addEventListener('change', function (e) {
      if (e.target.type !== 'radio') return;
      var pick = e.target.value;
      // Only one option can be the first choice: the previous one becomes "Could work".
      if (pick === 'first') {
        options.forEach(function (o) {
          if (o.id !== id && (state.options[o.id] || {}).pick === 'first') {
            state.options[o.id].pick = 'maybe';
            o.card.setAttribute('data-rv', 'maybe');
            o.box.querySelector('input[value="maybe"]').checked = true;
          }
        });
      }
      state.options[id] = Object.assign(state.options[id] || {}, { pick: pick });
      card.setAttribute('data-rv', pick);
      save(); summary();
    });
    box.querySelector('textarea').addEventListener('input', function (e) {
      state.options[id] = Object.assign(state.options[id] || {}, { note: e.target.value });
      save();
    });
    return { id: id, label: label, card: card, box: box };
  });

  // ---- 2. Feedback panel after the grid ------------------------------------
  var panel = document.createElement('section');
  panel.className = 'rv-panel';
  panel.setAttribute('aria-labelledby', 'rv-panel-h');
  panel.innerHTML =
    '<h2 id="rv-panel-h">Your feedback</h2>' +
    '<p class="rv-panel__help">Mark each option above and add comments. Then copy your feedback and send it to Claude, or download it as a file to share. Your answers stay saved in this browser.</p>' +
    '<div class="rv-panel__fields">' +
      '<div><label class="rv__label" for="rv-reviewer">Your name (optional)</label><input class="rv__input" id="rv-reviewer" autocomplete="name"></div>' +
      '<div class="rv-panel__wide"><label class="rv__label" for="rv-overall">Overall comments: mixing options, wording, anything else</label><textarea class="rv__note" id="rv-overall" rows="4"></textarea></div>' +
    '</div>' +
    '<p class="rv-panel__sum" id="rv-sum" aria-live="polite"></p>' +
    '<div class="rv-panel__actions">' +
      '<button class="ccm-btn ccm-btn--primary" type="button" id="rv-copy">Copy feedback</button>' +
      '<button class="ccm-btn ccm-btn--outline" type="button" id="rv-download">Download as a file</button>' +
      '<button class="rv-clear" type="button" id="rv-clear">Clear my answers</button>' +
      '<span class="rv-panel__done" id="rv-done" role="status"></span>' +
    '</div>';
  var grid = document.querySelector('.cmp__grid');
  grid.parentNode.insertBefore(panel, grid.nextSibling);

  var reviewer = panel.querySelector('#rv-reviewer');
  var overall = panel.querySelector('#rv-overall');
  reviewer.value = state.reviewer || '';
  overall.value = state.overall || '';
  reviewer.addEventListener('input', function () { state.reviewer = reviewer.value; save(); });
  overall.addEventListener('input', function () { state.overall = overall.value; save(); });

  function pickOf(o) { return (state.options[o.id] || {}).pick || ''; }
  function nameOf(pick) { var c = CHOICES.filter(function (x) { return x[0] === pick; })[0]; return c ? c[1] : 'Not marked'; }
  function summary() {
    var first = options.filter(function (o) { return pickOf(o) === 'first'; })[0];
    var n = function (p) { return options.filter(function (o) { return pickOf(o) === p; }).length; };
    panel.querySelector('#rv-sum').textContent =
      'First choice: ' + (first ? first.label : 'none yet') +
      ' · Could work: ' + n('maybe') + ' · No: ' + n('no') + ' · Not marked: ' + n('');
  }
  summary();

  function report() {
    var lines = ['DESIGN FEEDBACK', 'Page: ' + pageTitle, 'File: ' + file];
    if (state.reviewer) lines.push('Reviewer: ' + state.reviewer);
    lines.push('Date: ' + new Date().toISOString().slice(0, 10), '');
    var first = options.filter(function (o) { return pickOf(o) === 'first'; })[0];
    lines.push('First choice: ' + (first ? first.label : 'none'), '');
    options.forEach(function (o) {
      var s = state.options[o.id] || {};
      lines.push(o.label + ': ' + nameOf(s.pick));
      if (s.note && s.note.trim()) lines.push('  ' + s.note.trim().replace(/\n/g, '\n  '));
    });
    if (state.overall && state.overall.trim()) lines.push('', 'Overall:', state.overall.trim());
    return lines.join('\n') + '\n';
  }
  function done(msg) {
    var el = panel.querySelector('#rv-done');
    el.textContent = msg;
    setTimeout(function () { el.textContent = ''; }, 4000);
  }

  panel.querySelector('#rv-copy').addEventListener('click', function () {
    var t = report();
    function fallback() {
      var ta = document.createElement('textarea');
      ta.value = t; ta.setAttribute('readonly', ''); ta.style.position = 'fixed'; ta.style.opacity = '0';
      document.body.appendChild(ta); ta.select();
      var ok = false; try { ok = document.execCommand('copy'); } catch (e) { /* ignore */ }
      document.body.removeChild(ta);
      done(ok ? 'Copied. Paste it in your message to Claude.' : 'Copy didn\'t work here. Use "Download as a file" instead.');
    }
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(t).then(function () { done('Copied. Paste it in your message to Claude.'); }, fallback);
    } else { fallback(); }
  });
  panel.querySelector('#rv-download').addEventListener('click', function () {
    var slug = (file.split('/')[2] || 'page') + '-feedback' + (state.reviewer ? '-' + state.reviewer.trim().toLowerCase().replace(/[^a-z0-9]+/g, '-') : '') + '.txt';
    var a = document.createElement('a');
    a.href = URL.createObjectURL(new Blob([report()], { type: 'text/plain;charset=utf-8' }));
    a.download = slug;
    document.body.appendChild(a); a.click(); document.body.removeChild(a);
    setTimeout(function () { URL.revokeObjectURL(a.href); }, 1000);
    done('Saved as ' + slug + '.');
  });
  panel.querySelector('#rv-clear').addEventListener('click', function () {
    if (!confirm('Clear all your marks and comments on this page?')) return;
    state = { reviewer: '', overall: '', options: {} };
    try { localStorage.removeItem(KEY); } catch (e) { /* ignore */ }
    options.forEach(function (o) {
      o.card.removeAttribute('data-rv');
      o.box.querySelectorAll('input').forEach(function (i) { i.checked = false; });
      o.box.querySelector('textarea').value = '';
    });
    reviewer.value = ''; overall.value = '';
    summary(); done('Cleared.');
  });
})();
