/* LIVEXA v24 · YAYIN · IE-2026-10-12-090 · ana sayfa ve satın al.
   1) Kaydırma takibi: gezinmedeki sayfa içi bağlantılardan (data-izle) içinde bulunulan bölümünki aria-current="true" taşır.
   2) Satın al: mobil yapışkan çubuk "Dört bileşen ne yapar" (#sa-beyan) görünür alandayken gizlenir (satın al v15 yapı notu).
   Metin üretmez, metin değiştirmez, hiçbir metni gizlemez (çubuk yalnız tekrar eden fiyat/düğme taşır). */
(function () {
  'use strict';

  // ---------- 1 · kaydırma takibi ----------
  var baglar = [].slice.call(document.querySelectorAll('.gezinme__linkler a[data-izle]')).map(function (a) {
    var el = document.getElementById(a.getAttribute('data-izle'));
    return el ? { a: a, el: el } : null;
  }).filter(Boolean);
  if (baglar.length) {
    var bekliyor = false;
    var guncelle = function () {
      bekliyor = false;
      var cizgi = window.innerHeight * 0.38, aktif = null;
      baglar.forEach(function (b) {
        var r = b.el.getBoundingClientRect();
        if (r.top <= cizgi && r.bottom > cizgi) aktif = b;
      });
      baglar.forEach(function (b) {
        if (b === aktif) { if (b.a.getAttribute('aria-current') !== 'true') b.a.setAttribute('aria-current', 'true'); }
        else if (b.a.hasAttribute('aria-current')) b.a.removeAttribute('aria-current');
      });
    };
    var iste = function () { if (!bekliyor) { bekliyor = true; window.requestAnimationFrame(guncelle); } };
    window.addEventListener('scroll', iste, { passive: true });
    window.addEventListener('resize', iste);
    window.addEventListener('hashchange', iste);
    guncelle();
  }

  // ---------- 2 · satın al: çubuk beyan bölümünde gizli ----------
  var beyan = document.getElementById('sa-beyan');
  var cubuk = document.getElementById('site-cubuk');
  if (beyan && cubuk && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (g) {
      var ic = g[g.length - 1].isIntersecting;
      cubuk.classList.toggle('v24-gizli', ic);
      if (ic) cubuk.setAttribute('aria-hidden', 'true');
      else cubuk.removeAttribute('aria-hidden');
    }, { threshold: 0 }).observe(beyan);
  }
})();
