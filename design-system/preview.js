// PREVIEW ONLY: never uploaded to any website.
//
// 1. Live frame. When the page folder has a live-frame.js (made by
//    tools/live-frame.mjs), the option's content is shown inside the live
//    site: its header, breadcrumb, side menu and footer. The design is judged
//    where it will really sit, beside the side menu.
// 2. States from the address bar, so a state can be linked or screenshotted:
//      option-1-profile-cards.html#show=profile-sultan   → opens that pop-up
//      …#show=some-details-id                            → opens that <details>
(function () {
  var scope = document.querySelector('.ccm-scope');
  var frame = window.CCM_LIVE_FRAME;

  if (scope && frame) {
    // The live theme's stylesheets go before ours (ccm.css), as on the live site.
    var ours = document.querySelector('link[href*="ccm.css"]');
    (frame.styles || []).forEach(function (href) {
      if (document.querySelector('link[href="' + href + '"]')) return;
      var link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      if (ours) ours.parentNode.insertBefore(link, ours);
      else document.head.appendChild(link);
    });

    // Build the live page with an empty slot in its content column, then move
    // the option's content into that slot.
    var holder = document.createElement('div');
    holder.innerHTML = frame.before + '<div id="preview-slot"></div>' + frame.after;
    var slot = holder.querySelector('#preview-slot');
    slot.parentNode.replaceChild(scope, slot);
    var page = document.createDocumentFragment();
    while (holder.firstChild) page.appendChild(holder.firstChild);
    var bar = document.querySelector('.preview-bar');
    document.body.insertBefore(page, bar ? bar.nextSibling : document.body.firstChild);
    document.body.classList.add('preview-framed');
  } else if (scope) {
    document.body.classList.add('preview-unframed');
    var note = document.querySelector('.preview-bar');
    if (note) {
      var s = document.createElement('span');
      s.className = 'preview-bar__warn';
      s.textContent = 'Shown without the live site: run node tools/live-frame.mjs on this folder.';
      note.appendChild(s);
    }
  }

  var m = location.hash.match(/^#show=([\w-]+)$/);
  if (!m) {
    // A design low on a long page (for example the home page's News & Events
    // band) opens scrolled to it: <meta name="ccm-preview-focus" content="element-id">.
    var focus = document.querySelector('meta[name="ccm-preview-focus"]');
    var target = focus && document.getElementById(focus.content);
    if (target) {
      var go = function () { target.scrollIntoView({ block: 'start', behavior: 'instant' }); };
      if (document.readyState === 'complete') go();
      else window.addEventListener('load', go);
    }
    return;
  }
  var el = document.getElementById(m[1]);
  if (!el) return;
  if (el.hasAttribute('popover') && el.showPopover) {
    el.showPopover();
  } else if (el.tagName === 'DETAILS') {
    el.open = true;
    el.scrollIntoView({ block: 'center', behavior: 'instant' });
  } else if (el.type === 'radio') {
    // A tab, chip or page button, for example #show=tab-events
    el.checked = true;
    var box = el.closest('.ccm-feed') || el.parentElement;
    box.scrollIntoView({ block: 'start', behavior: 'instant' });
  } else {
    el.scrollIntoView({ block: 'start', behavior: 'instant' });
  }
})();
