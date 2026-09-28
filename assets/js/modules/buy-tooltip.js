let timer;

document.addEventListener("click", (e) => {
  const wrap = document.querySelector("[data-buy-wrap]");
  if (!wrap) return;

  clearTimeout(timer);

  if (e.target.closest(".btn--buy")) {
    wrap.classList.add("is-open");
    timer = setTimeout(() => wrap.classList.remove("is-open"), 2200);
  } else {
    wrap.classList.remove("is-open");
  }
});
