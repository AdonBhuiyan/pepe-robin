/* ==========================================================================
   MARQUEE  ·  assets/js/marquee.js
   - copies the text group just enough times for a seamless right → left loop
   - keeps the speed constant (pixels per second) on every screen size
   - rebuilds on resize / font load, pauses when offscreen or held
   ========================================================================== */
(() => {
  "use strict";

  const root = document.querySelector("[data-marquee]");
  if (!root) return;

  const track = root.querySelector("[data-marquee-track]");
  const base = track.querySelector("[data-marquee-group]");
  const viewport = root.querySelector(".marquee__viewport");
  const reduce = matchMedia("(prefers-reduced-motion: reduce)");
  const desktop = matchMedia("(min-width: 992px)");

  const SPEED = { mobile: 90, desktop: 140 }; // pixels per second: raise to go faster

  function build() {
    track.querySelectorAll("[data-clone]").forEach((n) => n.remove());
    root.classList.remove("is-ready");
    if (reduce.matches) return; // static layout via CSS

    const groupWidth = base.offsetWidth;
    if (!groupWidth) return;

    // enough groups that after sliding one group left, the viewport is still full
    const total = Math.ceil(viewport.offsetWidth / groupWidth) + 1;
    for (let i = 1; i < total; i++) {
      const copy = base.cloneNode(true);
      copy.removeAttribute("data-marquee-group");
      copy.setAttribute("data-clone", "");
      copy.setAttribute("aria-hidden", "true"); // screen readers read the text once
      track.appendChild(copy);
    }

    const speed = desktop.matches ? SPEED.desktop : SPEED.mobile;
    track.style.setProperty("--marquee-copies", String(total));
    track.style.setProperty("--marquee-duration", (groupWidth / speed).toFixed(2) + "s");
    root.classList.add("is-ready");
  }

  // rebuild once per frame at most (resize, font swap, rotation)
  let queued = false;
  const rebuild = () => {
    if (queued) return;
    queued = true;
    requestAnimationFrame(() => {
      queued = false;
      build();
    });
  };

  if ("ResizeObserver" in window) {
    const ro = new ResizeObserver(rebuild);
    ro.observe(viewport);
    ro.observe(base); // fires when Bangers finishes loading and the text width changes
  } else {
    addEventListener("resize", rebuild);
  }
  reduce.addEventListener("change", rebuild);
  desktop.addEventListener("change", rebuild);
  build();

  // save battery: pause while scrolled out of view
  if ("IntersectionObserver" in window) {
    new IntersectionObserver(([entry]) => {
      root.classList.toggle("is-offscreen", !entry.isIntersecting);
    }).observe(root);
  }

  // touch: press and hold to pause
  const hold = () => root.classList.add("is-held");
  const release = () => root.classList.remove("is-held");
  root.addEventListener("pointerdown", (e) => e.pointerType !== "mouse" && hold());
  addEventListener("pointerup", release);
  addEventListener("pointercancel", release);
})();
