/* ==========================================================
   CONTACT ADDRESS  ·  copy to clipboard
   Event delegation, so it works even if include.js injects
   the partial after this script has loaded.
   ========================================================== */

const RESET_MS = 2200;
const timers = new WeakMap();

async function writeClipboard(text) {
  if (navigator.clipboard && window.isSecureContext) {
    await navigator.clipboard.writeText(text);
    return;
  }
  // Fallback for http:// or older browsers
  const ta = document.createElement('textarea');
  ta.value = text;
  ta.setAttribute('readonly', '');
  ta.style.cssText = 'position:fixed;top:-9999px;opacity:0';
  document.body.appendChild(ta);
  ta.select();
  const ok = document.execCommand('copy');
  ta.remove();
  if (!ok) throw new Error('copy failed');
}

function setState(btn, copied, message) {
  const label = btn.querySelector('.contact__copy-label');
  const status = document.getElementById('contact-status');
  btn.classList.toggle('is-copied', copied);
  if (label) label.textContent = copied ? 'Copied!' : 'Copy';
  if (status) status.textContent = message || '';
}

document.addEventListener('click', async (e) => {
  const btn = e.target.closest('[data-copy-target]');
  if (!btn) return;

  const target = document.querySelector(btn.dataset.copyTarget);
  if (!target) return;

  clearTimeout(timers.get(btn));

  try {
    await writeClipboard(target.textContent.trim());
    setState(btn, true, 'Address copied to clipboard 🏹');
  } catch {
    // Last resort: select the text so the visitor can copy manually
    const range = document.createRange();
    range.selectNodeContents(target);
    const sel = window.getSelection();
    sel.removeAllRanges();
    sel.addRange(range);
    setState(btn, false, 'Could not copy automatically. The address is selected, press Ctrl/Cmd + C.');
  }

  timers.set(btn, setTimeout(() => setState(btn, false, ''), RESET_MS));
});
