/* ==========================================================
   MEMES SECTION  ·  filter + download + tweet
   Uses event delegation, so it works even if include.js
   injects partials/memes.html after this script has loaded.
   ========================================================== */

const TOAST_MS = 2200;
let toastTimer;

const $ = (sel, root = document) => root.querySelector(sel);

function toast(message) {
  const el = $('#memes-toast');
  if (!el) return;
  el.textContent = message;
  el.classList.add('is-visible');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => el.classList.remove('is-visible'), TOAST_MS);
}

/* ---------- Filter ---------- */
function applyFilter(button) {
  const section = button.closest('.memes');
  const filter = button.dataset.filter;

  section.querySelectorAll('.chip').forEach((chip) => {
    const active = chip === button;
    chip.classList.toggle('is-active', active);
    chip.setAttribute('aria-selected', String(active));
  });

  section.querySelectorAll('.meme-card').forEach((card) => {
    const show = filter === 'all' || card.dataset.category === filter;
    card.classList.remove('is-entering');
    card.classList.toggle('is-hidden', !show);
    if (show) {
      void card.offsetWidth; // restart the pop animation
      card.classList.add('is-entering');
    }
  });
}

/* ---------- Download the exact image the visitor sees (desktop or mobile) ---------- */
async function downloadImage(button, card) {
  const img = $('img', card);
  const url = img.currentSrc || img.src;
  const filename = url.split('/').pop().split('?')[0] || 'pepehood-meme.webp';

  button.classList.add('is-busy');
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error('bad response');
    const blob = await res.blob();
    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = `pepehood-${filename}`;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 1000);
    toast('Downloaded! Now go post it 🏹');
  } catch {
    // Fallback (e.g. opened via file://): plain link download
    const a = document.createElement('a');
    a.href = url;
    a.download = `pepehood-${filename}`;
    a.click();
    toast('Downloading…');
  } finally {
    button.classList.remove('is-busy');
  }
}

/* ---------- Tweet: new tab, text = the image title ---------- */
function tweet(card) {
  const text = card.dataset.title;
  const url = `https://x.com/intent/post?text=${encodeURIComponent(text)}`;
  window.open(url, '_blank', 'noopener,noreferrer');
}

/* ---------- One delegated listener ---------- */
document.addEventListener('click', (e) => {
  const chip = e.target.closest('.memes .chip');
  if (chip) return applyFilter(chip);

  const btn = e.target.closest('.memes [data-action]');
  if (!btn) return;
  const card = btn.closest('.meme-card');

  if (btn.dataset.action === 'download') downloadImage(btn, card);
  if (btn.dataset.action === 'tweet') tweet(card);
});
