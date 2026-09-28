// Tokenomics: interactive donut + allocation list.
// Click/tap a slice or a list row to select it; click again to reset.
// On desktop, hovering previews a slice. Works even if the partial is
// injected after page load (include.js).

const DEFAULT = { name: "$PEPEHOOD", pct: "100", color: "" };

const init = (root) => {
  const donut = root.querySelector("[data-donut]");
  const label = root.querySelector("[data-label]");
  const value = root.querySelector("[data-value]");
  const hint = root.querySelector("[data-hint]");
  const segs = [...root.querySelectorAll(".donut__seg")];
  const rows = [...root.querySelectorAll(".alloc__item")];

  const canHover = window.matchMedia("(hover: hover)").matches;
  hint.textContent = canHover ? "Click a slice" : "Tap a slice";

  let locked = null; // index of the slice the user clicked

  const render = (index) => {
    const active = index !== null && index !== undefined;
    const data = active ? segs[index].dataset : DEFAULT;

    donut.classList.toggle("has-active", active);
    segs.forEach((seg, i) => seg.classList.toggle("is-active", active && i === index));
    rows.forEach((row, i) => {
      row.classList.toggle("is-active", active && i === index);
      row.setAttribute("aria-pressed", String(i === locked));
    });

    label.textContent = data.name;
    value.textContent = `${data.pct}%`;
    if (data.color) donut.style.setProperty("--active-c", data.color);
    else donut.style.removeProperty("--active-c");
  };

  // click / tap: lock or unlock a slice
  root.addEventListener("click", (event) => {
    const target = event.target.closest("[data-i]");

    if (target) {
      const index = Number(target.dataset.i);
      locked = locked === index ? null : index;
    } else if (event.target.closest(".donut")) {
      locked = null; // tapping the middle or empty area resets
    } else {
      return;
    }
    render(locked);
  });

  // mouse hover: preview a slice, then go back to the locked one
  root.addEventListener("pointerover", (event) => {
    if (event.pointerType !== "mouse") return;
    const target = event.target.closest("[data-i]");
    if (target) render(Number(target.dataset.i));
  });

  root.addEventListener("pointerout", (event) => {
    if (event.pointerType !== "mouse") return;
    if (!event.target.closest("[data-i]")) return;
    const next = event.relatedTarget?.closest?.("[data-i]");
    if (!next) render(locked);
  });

  // one-time draw-in when the section scrolls into view
  const reduceMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (!reduceMotion && "IntersectionObserver" in window) {
    root.classList.add("is-armed");
    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        root.classList.add("is-drawn");
        observer.disconnect();
      },
      { threshold: 0.25 }
    );
    observer.observe(donut);
  }

  render(null);
};

const start = () => {
  const root = document.querySelector("[data-tokenomics]:not([data-tokenomics-ready])");
  if (!root) return false;
  root.setAttribute("data-tokenomics-ready", "");
  init(root);
  return true;
};

if (!start()) {
  const watcher = new MutationObserver(() => {
    if (start()) watcher.disconnect();
  });
  watcher.observe(document.documentElement, { childList: true, subtree: true });
}
