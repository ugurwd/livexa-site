/* LIVEXA · İçerik ve kullanım · ÖNİZLEME IE-2026-10-21-001
   Mobil yapışkan çubuk (#site-cubuk) "Dört bileşen ne yapar" (#ud-beyan), "Uyarılar" (#ud-uyarilar)
   ve "Sipariş" (#ud-siparis) görünür alandayken gizlenir (ürün detay v4 yapı notu).
   Metin üretmez, metin değiştirmez. */
(function () {
  'use strict';
  var cubuk = document.getElementById('site-cubuk');
  var hedefler = ['ud-beyan', 'ud-uyarilar', 'ud-siparis'].map(function (i) { return document.getElementById(i); }).filter(Boolean);
  if (!cubuk || !hedefler.length || !('IntersectionObserver' in window)) return;
  var gorunen = {};
  var io = new IntersectionObserver(function (g) {
    g.forEach(function (e) { gorunen[e.target.id] = e.isIntersecting; });
    var gizle = Object.keys(gorunen).some(function (k) { return gorunen[k]; });
    cubuk.classList.toggle('gizli', gizle);
    if (gizle) cubuk.setAttribute('aria-hidden', 'true'); else cubuk.removeAttribute('aria-hidden');
  }, { threshold: 0 });
  hedefler.forEach(function (h) { io.observe(h); });
})();
