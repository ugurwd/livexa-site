/* LIVEXA · ikinci dalga · ÖNİZLEME IE-2026-10-23-004 (düzeltme turu)
   1) M5 etiket okuyucu (#ud-okuyucu): JS yokken düz liste (ol) olduğu gibi okunur.
      JS varsa: düğme dizisi görünür (aria-expanded + aria-controls, açıklama deseni); her zaman bir okuma açıktır,
      kapatma yoktur. ←/→/↑/↓, Home/End düğmeler arasında odağı taşır. Etiket görselindeki bölgeler (aria-hidden)
      fare içindir, aynı düğmeyi tetikler; 768 px altında yalnız göstergedir. Liste yüksekliği en uzun okumaya sabitlenir.
   2) M2 (#bolum-ritim): önceki/sonraki düğmeleri izi bir kare + 24 px kaydırır (yalnız işaretçi yardımı).
   Metin üretmez, metin değiştirmez. */
(function () {
  'use strict';
  var kok = document.getElementById('ud-okuyucu');
  if (!kok) return;
  var dugmeler = [].slice.call(kok.querySelectorAll('.ud2-ok__dugme'));
  var ogeler = [].slice.call(kok.querySelectorAll('.ud2-ok__oge'));
  var bolgeler = [].slice.call(kok.querySelectorAll('.ud2-bolge'));
  var maskeler = [].slice.call(kok.querySelectorAll('.ud2-ok__maske path'));
  var dizi = kok.querySelector('.ud2-ok__dugmeler');
  var liste = kok.querySelector('.ud2-ok__liste');
  var girisJs = kok.querySelector('.ud2-okuyucu__giris--js');
  var girisDuz = kok.querySelector('.ud2-okuyucu__giris--duz');
  if (!dugmeler.length || dugmeler.length !== ogeler.length) return;

  document.documentElement.classList.add('ud2-js');
  dizi.hidden = false;
  if (girisJs) girisJs.hidden = false;
  if (girisDuz) girisDuz.hidden = true;

  var acik = 0;
  function isaretle(el, i) { el.setAttribute('data-etkin', Number(el.getAttribute('data-i')) === i ? '1' : '0'); }
  function goster(i) {
    acik = i;
    dugmeler.forEach(function (d, k) { d.setAttribute('aria-expanded', k === i ? 'true' : 'false'); });
    ogeler.forEach(function (o, k) { o.hidden = k !== i; });
    bolgeler.forEach(function (b) { isaretle(b, i); });
    maskeler.forEach(function (m) { isaretle(m, i); });
  }
  dugmeler.forEach(function (d, k) {
    d.addEventListener('click', function () { goster(k); });
    d.addEventListener('keydown', function (e) {
      var n = dugmeler.length, h = null;
      if (e.key === 'ArrowDown' || e.key === 'ArrowRight') h = (k + 1) % n;
      else if (e.key === 'ArrowUp' || e.key === 'ArrowLeft') h = (k - 1 + n) % n;
      else if (e.key === 'Home') h = 0;
      else if (e.key === 'End') h = n - 1;
      if (h === null) return;
      e.preventDefault();
      dugmeler[h].focus();
    });
  });
  bolgeler.forEach(function (b) {
    b.addEventListener('click', function () {
      var i = Number(b.getAttribute('data-i'));
      goster(i);
      if (dugmeler[i]) dugmeler[i].focus({ preventScroll: true });
    });
  });

  // en uzun okumaya göre sabit yükseklik: aç/kapa sırasında alttaki içerik zıplamaz
  var bekle = null;
  function olc() {
    liste.style.minHeight = '';
    var en = 0;
    ogeler.forEach(function (o, k) {
      ogeler.forEach(function (p, m) { p.hidden = m !== k; });
      en = Math.max(en, liste.offsetHeight);
    });
    ogeler.forEach(function (p, m) { p.hidden = m !== acik; });
    liste.style.minHeight = en + 'px';
  }
  function yenidenOlc() { clearTimeout(bekle); bekle = setTimeout(olc, 120); }
  goster(0);
  olc();
  window.addEventListener('resize', yenidenOlc);
  [].forEach.call(liste.querySelectorAll('img'), function (im) { if (!im.complete) im.addEventListener('load', yenidenOlc); });
})();

(function () {
  'use strict';
  var iz = document.getElementById('ritim-iz');
  if (!iz) return;
  var az = window.matchMedia('(prefers-reduced-motion: reduce)');
  var oklar = [].slice.call(document.querySelectorAll('.ev2-ritim__ok'));
  function adim() {
    var k = iz.querySelector('.ev2-ritim__kare');
    return (k ? k.getBoundingClientRect().width : 448) + 24;
  }
  function durum() {
    var son = iz.scrollWidth - iz.clientWidth - 2;
    oklar.forEach(function (o) {
      var y = Number(o.getAttribute('data-yon'));
      o.disabled = y < 0 ? iz.scrollLeft <= 2 : iz.scrollLeft >= son;
    });
  }
  oklar.forEach(function (o) {
    o.addEventListener('click', function () {
      iz.scrollBy({ left: Number(o.getAttribute('data-yon')) * adim(), behavior: az.matches ? 'auto' : 'smooth' });
    });
  });
  iz.addEventListener('scroll', durum, { passive: true });
  window.addEventListener('resize', durum);
  // İlk değerlendirme görseller ve yazı tipi oturmadan çalışır; şerit genişledikçe yeniden hesapla
  window.addEventListener('load', durum);
  [].forEach.call(iz.querySelectorAll('img'), function (i) { if (!i.complete) i.addEventListener('load', durum); });
  if ('ResizeObserver' in window) {
    var ro = new ResizeObserver(durum);
    ro.observe(iz);
    var serit = iz.querySelector('.ev2-ritim__serit');
    if (serit) ro.observe(serit);
  }
  durum();
})();
