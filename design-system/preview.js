// PREVIEW ONLY: never uploaded to any website.
// Opens a pop-up or an expandable row straight from the address bar, so a
// state can be linked or screenshotted. Example:
//   option-2-name-cards.html#show=profile-sultan
(function () {
  var m = location.hash.match(/^#show=([\w-]+)$/);
  if (!m) return;
  var el = document.getElementById(m[1]);
  if (!el) return;
  if (el.hasAttribute('popover') && el.showPopover) {
    el.showPopover();
  } else if (el.tagName === 'DETAILS') {
    el.open = true;
    el.scrollIntoView({ block: 'center' });
  }
})();
