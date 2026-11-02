/* LIVEXA · ana sayfa ilk ekran (IE-2026-11-02-ilk-ekran). Metin üretmez, metin değiştirmez.
   1) Sofra: utm_content'teki bileşenin kartı ilk sıraya alınır (kart metni aynı, yalnız sıra). v19.js'ten önce çalışır.
   2) Hero karar bloğu (#hero-karar: fiyat kutuları + düğme) ekrandayken yapışkan çubuk ve yüzen WhatsApp düğmesi gizli,
      blok ekrandan çıkınca görünür. v22/v24/app.js gizlemelerine dokunmaz (ayrı sınıf: ie-gizli / ie-wa-gizli). */
(function () {
  'use strict';

  // ---------- 1 · sofra sırası ----------
  try {
    var icerik = (new URLSearchParams(location.search).get('utm_content') || '').toLowerCase();
    var harita = { krom: '0', kolin: '1', lipid: '1', selenyum: '2', b6: '3' };
    var parca = icerik.split(/[^a-z0-9]+/), hedef = null;
    for (var i = 0; i < parca.length && !hedef; i++) if (harita.hasOwnProperty(parca[i])) hedef = harita[parca[i]];
    if (hedef && hedef !== '0') {
      var sofra = document.getElementById('bolum-sofra');
      ['.v18-sofra__serit', '.v18-sofra__metinler'].forEach(function (s) {
        var kap = sofra && sofra.querySelector(s);
        if (!kap) return;
        var el = kap.querySelector(':scope > [data-i="' + hedef + '"]');
        if (el && el !== kap.firstElementChild) kap.insertBefore(el, kap.firstElementChild);
        if (s === '.v18-sofra__metinler') [].forEach.call(kap.children, function (m, j) { m.classList.toggle('etkin', j === 0); });
      });
      // Mobil şerit bir scroll-snap kabı: tarayıcı ilk yerleşimde tutunduğu kartı (krom) korumak için yeniden tutunur.
      // Kaydırma başa alınır ki tutunulan kart yeni ilk kart olsun; kullanıcı şeride dokunmadıysa yüklemede bir kez daha.
      var serit = sofra && sofra.querySelector('.v18-sofra__serit');
      if (serit) {
        var dokundu = false;
        ['pointerdown', 'touchstart', 'wheel', 'keydown'].forEach(function (o) { serit.addEventListener(o, function () { dokundu = true; }, { passive: true, once: true }); });
        var basaAl = function () { if (!dokundu && serit.scrollLeft !== 0) serit.scrollLeft = 0; };
        void serit.offsetWidth; serit.scrollLeft = 0;
        window.requestAnimationFrame(basaAl);
        window.addEventListener('load', basaAl);
      }
    }
  } catch (e) { /* sıra değişmez */ }

  // ---------- 2 · karar bloğu ekrandayken çubuk ve WA gizli ----------
  var karar = document.getElementById('hero-karar');
  var cubuk = document.getElementById('site-cubuk');
  var wa = document.querySelector('.wa-dugme');
  var uygula = function (gorunur) {
    if (cubuk) {
      cubuk.classList.toggle('ie-gizli', gorunur);
      if (gorunur) cubuk.setAttribute('aria-hidden', 'true');
      else if (!/(^|\s)(gizli|v22-gizli|v24-gizli|ud-gizli)(\s|$)/.test(cubuk.className)) cubuk.removeAttribute('aria-hidden');
    }
    if (wa) wa.classList.toggle('ie-wa-gizli', gorunur);
  };
  if (!karar || !('IntersectionObserver' in window)) { uygula(false); return; }
  var hedefler = [karar.querySelector('.uo-karar__fiyatlar'), karar.querySelector('.uo-karar__eylem')].filter(Boolean);
  if (!hedefler.length) { uygula(false); return; }
  var gezinme = document.querySelector('.gezinme');
  var ust = gezinme ? gezinme.offsetHeight : 0;   // yapışkan gezinmenin arkasında kalan kısım "ekranda" sayılmaz
  var ic = new Set();
  var io = new IntersectionObserver(function (g) {
    g.forEach(function (x) { if (x.isIntersecting) ic.add(x.target); else ic.delete(x.target); });
    uygula(ic.size > 0);
  }, { rootMargin: '-' + ust + 'px 0px 0px 0px', threshold: 0 });
  hedefler.forEach(function (h) { io.observe(h); });
})();
