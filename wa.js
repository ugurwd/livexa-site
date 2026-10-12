/* LIVEXA · sabit WhatsApp düğmesi · IE-2026-10-12-104. Metin üretmez, metin değiştirmez.
   1) Beyan bölümü (#bolum-02-beyan / #sa-beyan) veya zorunlu metin (#zorunlu-bilgiler, p.zorunlu) görünür alandayken gizlenir.
   2) Mobil yapışkan satın al çubuğu (#site-cubuk) görünürken çubuğun üstüne kayar. */
(function () {
  'use strict';
  var d = document.querySelector('.wa-dugme');
  if (!d) return;
  var kok = document.documentElement;
  var cubuk = document.getElementById('site-cubuk');
  function cubukKonum() {
    var gorunur = cubuk && cubuk.getClientRects().length > 0 && getComputedStyle(cubuk).position === 'fixed' &&
      !cubuk.classList.contains('gizli') && !cubuk.classList.contains('v22-gizli') && !cubuk.classList.contains('v24-gizli');
    if (gorunur) kok.style.setProperty('--wa-alt', (cubuk.offsetHeight + 12) + 'px');
    else kok.style.removeProperty('--wa-alt');
  }
  if (cubuk) {
    cubukKonum();
    new MutationObserver(cubukKonum).observe(cubuk, { attributes: true, attributeFilter: ['class', 'style'] });
    window.addEventListener('resize', cubukKonum);
    window.addEventListener('load', cubukKonum);
  }
  if (!('IntersectionObserver' in window)) return;
  var hedefler = [];
  ['bolum-02-beyan', 'sa-beyan', 'zorunlu-bilgiler'].forEach(function (id) { var e = document.getElementById(id); if (e) hedefler.push(e); });
  Array.prototype.forEach.call(document.querySelectorAll('p.zorunlu'), function (e) { hedefler.push(e); });
  if (!hedefler.length) return;
  var ic = new Set();
  var io = new IntersectionObserver(function (g) {
    g.forEach(function (x) { if (x.isIntersecting) ic.add(x.target); else ic.delete(x.target); });
    d.classList.toggle('wa-dugme--gizli', ic.size > 0);
  }, { threshold: 0 });
  hedefler.forEach(function (e) { io.observe(e); });
})();
