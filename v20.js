/* LIVEXA ana sayfa v20 · YAYIN · IE-2026-10-11-075 · insanlı yaşam bandı (bolum-yasam).
   Yön notu 2026-10-11-insanli-yasam §2, §7: kamera sabit; kaydırmaya birebir, doğrusal bindirme A → B → C → D.
   Kaydırma durursa geçiş yarıda durur. Yalnız opacity. Metin üretmez, metin değiştirmez.
   Ayrıca: mobil yapışkan satın al çubuğu bu bantta gizlenir; kutu görseli ile insan karesi arasında ≥ 100vh boşluk. */
(function () {
  'use strict';
  var bant = document.getElementById('bolum-yasam');
  if (!bant) return;
  var kok = document.documentElement;
  var azHareket = window.matchMedia('(prefers-reduced-motion: reduce)');
  var sinirla = function (v, a, b) { return Math.max(a, Math.min(b, v)); };
  var iz = bant.querySelector('.v20-yasam__iz');
  var sabit = bant.querySelector('.v20-yasam__sabit');
  var kareler = bant.querySelector('.v20-yasam__kareler');
  var katman = [].slice.call(bant.querySelectorAll('.v20-kare__gorsel'));
  var parca = [].slice.call(bant.querySelectorAll('.v20-yasam__ilerleme i'));

  var ust = function () { var g = document.querySelector('.gezinme'); return g ? g.offsetHeight : 0; };

  // ---------- Bindirme ----------
  var acik = function () { return !azHareket.matches && kok.classList.contains('js'); };
  var kare = function () {
    if (!acik()) return;
    var vh = window.innerHeight, u = ust();
    var r = iz.getBoundingClientRect();
    var toplam = Math.max(1, r.height - (vh - u));
    var p = sinirla((u - r.top) / toplam, 0, 1);
    // 1/8 bekleme · 3 × 1/4 geçiş · 1/8 bekleme (masaüstü 40 + 3×80 + 40 = 320vh; mobil 260vh aynı oranla)
    var f = sinirla((p - 0.125) / 0.75 * 3, 0, 3);
    var k = Math.floor(f), kesir = f - k;
    for (var i = 0; i < katman.length; i++) {
      if (i > 0) katman[i].style.opacity = sinirla(f - (i - 1), 0, 1).toFixed(3);
      // will-change yalnız geçişteki iki katmanda
      katman[i].style.willChange = kesir > 0 && (i === k || i === k + 1) ? 'opacity' : '';
    }
    var etkin = Math.round(f);
    parca.forEach(function (q, j) { q.classList.toggle('dolu', j <= etkin); });
  };
  var bekliyor = false;
  var iste = function () { if (!bekliyor) { bekliyor = true; window.requestAnimationFrame(function () { bekliyor = false; kare(); }); } };
  window.addEventListener('scroll', iste, { passive: true });

  // ---------- Kutu görseli ile insan karesi arasında ≥ 100vh (bandın üst boşluğu) ----------
  var enBuyukVh = 0, sonGen = 0;
  var bosluk = function () {
    var vh = Math.max(window.innerHeight, kok.clientHeight);
    if (window.innerWidth === sonGen && vh <= enBuyukVh) return; // mobil adres çubuğu: yalnız büyür, kayma yok
    sonGen = window.innerWidth; enBuyukVh = Math.max(enBuyukVh, vh);
    var y = window.scrollY, alt = 0;
    [].forEach.call(document.querySelectorAll('#bolum-siparis img, #bolum-siparis video'), function (el) {
      var rr = el.getBoundingClientRect(); if (rr.height) alt = Math.max(alt, rr.bottom + y);
    });
    if (!alt) return;
    var pad = parseFloat(getComputedStyle(bant).paddingTop) || 0;
    var ic = kareler.getBoundingClientRect().top - sabit.getBoundingClientRect().top;
    var dogal = (bant.getBoundingClientRect().top + y) + ic - alt; // boşluksuz uzaklık
    var gerek = Math.max(0, Math.ceil(enBuyukVh - dogal + 32));
    if (Math.abs(gerek - pad) > 1) bant.style.setProperty('--v20-bosluk', gerek + 'px');
  };

  // ---------- Mobil yapışkan çubuk: bantta gizli ----------
  var cubuk = document.getElementById('site-cubuk');
  if (cubuk && 'IntersectionObserver' in window) {
    new IntersectionObserver(function (g) {
      var ic = g[g.length - 1].isIntersecting;
      cubuk.classList.toggle('v20-gizli', ic);
      if (ic) cubuk.setAttribute('aria-hidden', 'true');
      else if (!cubuk.classList.contains('gizli')) cubuk.removeAttribute('aria-hidden');
    }, { rootMargin: '25% 0px 25% 0px', threshold: 0 }).observe(iz);
  }

  var hepsi = function () { bosluk(); iste(); };
  window.addEventListener('resize', function () { bosluk(); if (!acik()) katman.forEach(function (k) { k.style.opacity = ''; k.style.willChange = ''; }); iste(); });
  window.addEventListener('load', hepsi);
  if (azHareket.addEventListener) azHareket.addEventListener('change', function () { sonGen = 0; hepsi(); if (!acik()) katman.forEach(function (k) { k.style.opacity = ''; k.style.willChange = ''; }); });
  hepsi();
})();
