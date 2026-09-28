const cache = new Map();

function loadPartial(url) {
  if (!cache.has(url)) {
    cache.set(
      url,
      fetch(url).then((res) => {
        if (!res.ok) throw new Error(`Failed to load ${url} (${res.status})`);
        return res.text();
      })
    );
  }
  return cache.get(url);
}

export async function includePartials() {
  const slots = document.querySelectorAll('[data-include]');

  await Promise.all(
    [...slots].map(async (slot) => {
      try {
        slot.innerHTML = await loadPartial(slot.dataset.include);
      } catch (err) {
        console.error(err);
      }
    })
  );

  document.dispatchEvent(new CustomEvent('partials:loaded'));
}
