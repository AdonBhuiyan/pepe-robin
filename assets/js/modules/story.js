// "Reading light": story lines start dim and light up as they scroll into view.
// Works even if the partial is injected after page load (include.js).

const arm = (root) => {
  if (window.matchMedia("(prefers-reduced-motion: reduce)").matches) return;
  if (!("IntersectionObserver" in window)) return;

  const lines = root.querySelectorAll("[data-line]");
  if (!lines.length) return;

  const observer = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("is-lit");
        observer.unobserve(entry.target);
      });
    },
    { rootMargin: "0px 0px -18% 0px", threshold: 0.15 }
  );

  root.classList.add("is-armed");
  lines.forEach((line) => observer.observe(line));
};

const start = () => {
  const root = document.querySelector("[data-story]:not([data-story-ready])");
  if (!root) return false;
  root.setAttribute("data-story-ready", "");
  arm(root);
  return true;
};

if (!start()) {
  const watcher = new MutationObserver(() => {
    if (start()) watcher.disconnect();
  });
  watcher.observe(document.documentElement, { childList: true, subtree: true });
}
