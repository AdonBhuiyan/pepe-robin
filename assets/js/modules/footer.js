/* Footer: keeps the copyright year current */
const setYear = () =>
  document.querySelectorAll('[data-year]').forEach((el) => {
    el.textContent = new Date().getFullYear();
  });

document.readyState === 'loading'
  ? document.addEventListener('DOMContentLoaded', setYear)
  : setYear();

// If include.js injects the footer later, run again after it loads
window.addEventListener('load', setYear);
