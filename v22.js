/* LIVEXA ana sayfa v22 · YAYIN · IE-2026-10-12-084 · yaşam bandı (bolum-yasam).
   Bant statiktir; bu betik yalnız mobil yapışkan satın al çubuğunu bantta gizler. Metin üretmez, metin değiştirmez. */
(function () {
  'use strict';
  var bant = document.getElementById('bolum-yasam');
  var cubuk = document.getElementById('site-cubuk');
  if (!bant || !cubuk || !('IntersectionObserver' in window)) return;
  new IntersectionObserver(function (g) {
    var ic = g[g.length - 1].isIntersecting;
    cubuk.classList.toggle('v22-gizli', ic);
    if (ic) cubuk.setAttribute('aria-hidden', 'true');
    else if (!cubuk.classList.contains('gizli')) cubuk.removeAttribute('aria-hidden');
  }, { rootMargin: '0px', threshold: 0 }).observe(bant);
})();
