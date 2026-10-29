/* LIVEXA — satın al formunda promosyon kodu (IE-2026-10-28-promo). Kod ödeme altyapısında doğrulanır ve indirim orada
   hesaplanır; bu betik yalnız sonucu gösterir ve uygulanan kodu satis.js'e verir (window.lxPromoKod). */
(function () {
  'use strict';
  var UC = 'https://livexa-paytr.wakaresearch.com/promo/dogrula';
  var kutu = document.getElementById('sa-promo'), girdi = document.getElementById('sa-promo-kod'),
    dugme = document.getElementById('sa-promo-uygula'), sonuc = document.getElementById('sa-promo-sonuc');
  if (!kutu || !girdi || !dugme || !sonuc) return;
  var M = {};
  var sablon = kutu.querySelector('template[data-promo]');
  if (sablon) [].forEach.call(sablon.content.querySelectorAll('[data-m]'), function (e) { M[e.getAttribute('data-m')] = e.textContent; });
  var doldur = function (s, d) { return String(s || '').replace(/\{(\w+)\}/g, function (_, k) { return d[k] != null ? d[k] : ''; }); };
  var tl = function (k) { return (k / 100).toLocaleString('tr-TR', { minimumFractionDigits: k % 100 ? 2 : 0, maximumFractionDigits: 2 }) + ' TL'; };
  var paket = function () { var r = document.querySelector('input[name="paket"]:checked'); return r ? r.value : '1'; };
  var uygulanan = '', bekliyor = false;
  window.lxPromoKod = function () { return uygulanan; };

  function yaz(metin, tur) { sonuc.textContent = metin; sonuc.className = 'sa-promo__sonuc' + (tur ? ' sa-promo__sonuc--' + tur : ''); }
  function kaldirDugmesi() {
    var b = document.createElement('button'); b.type = 'button'; b.className = 'sa-promo__kaldir'; b.textContent = M.kaldir || 'Kaldır';
    b.addEventListener('click', function () { uygulanan = ''; girdi.value = ''; girdi.readOnly = false; dugme.hidden = false; yaz(''); girdi.focus(); });
    sonuc.appendChild(document.createTextNode(' ')); sonuc.appendChild(b);
  }
  function uygula(sessiz) {
    var kod = girdi.value.trim();
    if (!kod) { if (!sessiz) yaz(M.bos, 'hata'); return; }
    if (bekliyor) return; bekliyor = true; dugme.disabled = true; if (!sessiz) yaz(M.bekle);
    fetch(UC, { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ kod: kod, paket: paket() }), credentials: 'omit', cache: 'no-store' })
      .then(function (r) { return r.json(); })
      .then(function (v) {
        if (v.gecerli) {
          uygulanan = v.kod; girdi.value = v.kod; girdi.readOnly = true; dugme.hidden = true;
          yaz(doldur(M.tamam, { kod: v.kod, indirim: tl(v.indirimKurus), tutar: tl(v.tutarKurus) }), 'tamam'); kaldirDugmesi();
          if (window.lxOlay) window.lxOlay('promo_uygula', 'gecerli-' + v.kod);
        } else {
          uygulanan = ''; girdi.readOnly = false; dugme.hidden = false;
          yaz(M[v.neden] || M.yok, 'hata');
          if (window.lxOlay) window.lxOlay('promo_uygula', 'gecersiz-' + (v.neden || 'yok'));
        }
      }, function () { yaz(M.servis, 'hata'); })
      .then(function () { bekliyor = false; dugme.disabled = false; });
  }
  dugme.addEventListener('click', function () { uygula(false); });
  girdi.addEventListener('keydown', function (e) { if (e.key === 'Enter') { e.preventDefault(); if (!girdi.readOnly) uygula(false); } });
  // Paket değişince uygulanmış kod yeni pakete göre yeniden kontrol edilir
  document.addEventListener('change', function (e) {
    if (e.target && e.target.name === 'paket' && uygulanan) { girdi.readOnly = false; girdi.value = uygulanan; uygulanan = ''; uygula(true); }
  }, true);
  // Ödeme ekranı açılınca kod değiştirilemez
  if ('MutationObserver' in window) new MutationObserver(function () {
    var acik = document.body.classList.contains('sa-odeme-acik');
    girdi.readOnly = acik || !!uygulanan; dugme.disabled = acik; [].forEach.call(sonuc.querySelectorAll('button'), function (b) { b.disabled = acik; });
  }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
  // Ödeme başlatılırken kod geçersiz çıktıysa (süre/sınır değişti) satis.js bunu çağırır
  window.lxPromoRed = function (neden) { uygulanan = ''; girdi.readOnly = false; dugme.hidden = false; yaz((M[neden] || M.yok) + ' ' + (M.odemeYok || ''), 'hata'); girdi.focus(); };
})();
