(() => {
  "use strict";

  const header = document.querySelector("[data-site-header]");
  if (!header) return;

  const root = document.documentElement;
  const toggle = header.querySelector("[data-nav-toggle]");
  const nav = header.querySelector("[data-site-nav]");
  const logo = header.querySelector("[data-logo]");
  const links = Array.from(nav.querySelectorAll("a"));
  const desktop = window.matchMedia("(min-width: 992px)");

  const isOpen = () => toggle.getAttribute("aria-expanded") === "true";

  /* ---------- open / close ---------- */
  function setMenu(open) {
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close menu" : "Open menu");
    nav.classList.toggle("is-open", open);
    root.classList.toggle("nav-open", open);
  }

  toggle.addEventListener("click", () => setMenu(!isOpen()));

  // choosing a menu item closes the menu (icon returns to hamburger)
  nav.addEventListener("click", (e) => {
    if (e.target.closest("a")) setMenu(false);
  });

  // logo → home; if already on the home page, glide back to the top
  logo.addEventListener("click", (e) => {
    setMenu(false);
    if (
      location.pathname === "/" ||
      location.pathname.endsWith("/index.html")
    ) {
      e.preventDefault();
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  });

  // leaving mobile size (rotate / resize) resets the menu
  desktop.addEventListener("change", (e) => {
    if (e.matches) setMenu(false);
  });

  /* ---------- keyboard: Esc + focus trap ---------- */
  document.addEventListener("keydown", (e) => {
    if (!isOpen() || desktop.matches) return;

    if (e.key === "Escape") {
      setMenu(false);
      toggle.focus();
      return;
    }
    if (e.key !== "Tab") return;

    const items = Array.from(header.querySelectorAll("a[href], button")).filter(
      (el) => el.getClientRects().length > 0,
    );
    const first = items[0];
    const last = items[items.length - 1];
    const active = document.activeElement;

    if (!header.contains(active)) {
      e.preventDefault();
      first.focus();
    } else if (e.shiftKey && active === first) {
      e.preventDefault();
      last.focus();
    } else if (!e.shiftKey && active === last) {
      e.preventDefault();
      first.focus();
    }
  });

  /* ---------- scroll state + progress line ---------- */
  let ticking = false;

  function clearActive() {
    links.forEach((l) => {
      l.classList.remove("is-active");
      l.removeAttribute("aria-current");
    });
  }

  function onScroll() {
    const y = window.scrollY;
    const max = root.scrollHeight - window.innerHeight;
    header.classList.toggle("is-scrolled", y > 24);
    header.style.setProperty(
      "--progress",
      max > 0 ? Math.min(y / max, 1).toFixed(4) : "0",
    );
    if (y < 80) clearActive(); // back on the hero: no active link
    ticking = false;
  }

  window.addEventListener(
    "scroll",
    () => {
      if (!ticking) {
        ticking = true;
        requestAnimationFrame(onScroll);
      }
    },
    { passive: true },
  );
  window.addEventListener("resize", onScroll, { passive: true });
  onScroll();

  /* ---------- scrollspy ---------- */
  const sections = new Map();
  links.forEach((a) => {
    const href = a.getAttribute("href") || "";
    if (href.length > 1 && href.startsWith("#")) {
      const section = document.getElementById(href.slice(1));
      if (section) sections.set(section, a);
    }
  });

  if ("IntersectionObserver" in window && sections.size) {
    const spy = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (!entry.isIntersecting) return;
          clearActive();
          const link = sections.get(entry.target);
          link.classList.add("is-active");
          link.setAttribute("aria-current", "true");
        });
      },
      { rootMargin: "-45% 0px -50% 0px" }, // thin band in the middle of the screen
    );
    sections.forEach((_, section) => spy.observe(section));
  }
})();

export function initNavbar() {
  const normalize = (p) =>
    p.replace(/index\.html$/, "").replace(/\/$/, "") || "/";
  const current = normalize(location.pathname);

  document.querySelectorAll(".navbar a").forEach((link) => {
    if (normalize(new URL(link.href).pathname) === current) {
      link.setAttribute("aria-current", "page");
    }
  });
}
