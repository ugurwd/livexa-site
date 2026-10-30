/* LIVEXA — çerez bandı, Çerez Tercihleri paneli ve rızaya bağlı Meta pikseli (IE-2026-10-30-meta-web).
   Metin kaynağı: 03-icerik/taslaklar/2026-10-30-cerez-bandi.md (gövde hash 62347eca2502aaaa). Görünür dizgelerin tamamı
   sayfadaki <template id="lx-cerez-sablon"> öğesindedir; bu dosyada görünür metin yoktur.
   Rıza kaydı: localStorage "lx_cerez" = {"v":1,"pazarlama":true|false,"t":"<ISO>"}; 12 ay sonra bant yeniden sorulur.
   Geçerli bir kabul kaydı yoksa connect.facebook.net'ten hiçbir şey yüklenmez ve fbq tanımlanmaz.
   Rıza geri alınınca _fbp ve _fbc silinir, sayfa yenilenir (MT-7).
   Dışa açılan: window.lxCerez = { riza(), odemeMeta(), odemeBasladi(siparis, paket), panelAc() } — satis.js kullanır. */
(function () {
  'use strict';
  var ANAHTAR = 'lx_cerez';
  var PIKSEL = '2811235389270344';
  var BETIK = 'https://connect.facebook.net/en_US/fbevents.js';
  var DEGER = { '1': 2900, '2': 5500 };   // paket → TL (KDV ve kargo dahil liste fiyatı; worker.js FIYAT)
  var yerel = null;                      // localStorage yazılamazsa yalnız bu sayfa için tutulan seçim
  var yuklendi = false;

  // ------------------------------------------------------------------ kayıt
  function oku() {
    var k = null;
    try { k = JSON.parse(window.localStorage.getItem(ANAHTAR) || 'null'); } catch (e) { k = null; }
    if (!k && yerel) k = yerel;
    if (!k || k.v !== 1 || typeof k.pazarlama !== 'boolean' || typeof k.t !== 'string') return null;
    var t = new Date(k.t);
    if (isNaN(t.getTime())) return null;
    var bitis = new Date(t.getTime()); bitis.setMonth(bitis.getMonth() + 12);
    if (Date.now() >= bitis.getTime()) return null;   // 12 ay doldu: yeniden sorulur
    return k;
  }
  function yaz(pazarlama) {
    var k = { v: 1, pazarlama: !!pazarlama, t: new Date().toISOString() };
    yerel = k;
    try { window.localStorage.setItem(ANAHTAR, JSON.stringify(k)); } catch (e) { /* yalnız bu sayfa */ }
    return k;
  }
  function riza() { var k = oku(); return !!(k && k.pazarlama === true); }

  // ------------------------------------------------------------------ çerezler
  function cerez(ad) {
    var m = document.cookie.match(new RegExp('(?:^|;\\s*)' + ad + '=([^;]*)'));
    return m ? decodeURIComponent(m[1]) : '';
  }
  function metaCerezleriniSil() {
    var alanlar = ['', 'www.livexa.com.tr', '.livexa.com.tr', 'livexa.com.tr', location.hostname];
    ['_fbp', '_fbc'].forEach(function (ad) {
      alanlar.forEach(function (a) {
        document.cookie = ad + '=; Max-Age=0; Expires=Thu, 01 Jan 1970 00:00:00 GMT; Path=/' + (a ? '; Domain=' + a : '');
      });
    });
    // fbevents.js'in yerel depolamaya yazdığı anahtarlar (2026-10-30 gözlemi) da kaldırılır
    try { ['lastExternalReferrer', 'lastExternalReferrerTime', 'multiFbc'].forEach(function (a) { window.localStorage.removeItem(a); }); } catch (e) { /* yok */ }
  }

  // ------------------------------------------------------------------ piksel
  function sayfaAdi() { return location.pathname === '/' ? 'index.html' : location.pathname.replace(/^.*\//, ''); }

  function pikselYukle() {
    if (yuklendi || !riza()) return;
    yuklendi = true;
    /* Meta'nın standart yükleyicisi (fbq kuyruğu); betik yalnız bu noktada eklenir */
    !function (f, b, e, v, n, t, s) {
      if (f.fbq) return; n = f.fbq = function () { n.callMethod ? n.callMethod.apply(n, arguments) : n.queue.push(arguments); };
      if (!f._fbq) f._fbq = n; n.push = n; n.loaded = !0; n.version = '2.0'; n.queue = [];
      t = b.createElement(e); t.async = !0; t.src = v; s = b.getElementsByTagName(e)[0]; s.parentNode.insertBefore(t, s);
    }(window, document, 'script', BETIK);
    // Otomatik yapılandırma (düğme tıklamaları, sayfa meta verisi) kapalı; init'e kullanıcı verisi verilmez
    window.fbq('set', 'autoConfig', false, PIKSEL);
    window.fbq('init', PIKSEL);
    window.fbq('track', 'PageView');
    var ad = sayfaAdi();
    if (ad === 'satin-al.html') {
      window.fbq('track', 'ViewContent', { content_ids: ['livexa-1', 'livexa-2'], currency: 'TRY' });
    } else if (ad === 'odeme-basarili.html') {
      var q = new URLSearchParams(location.search), s = q.get('s') || '', p = q.get('p') || '';
      if (/^LX\d{14}[0-9A-F]{8}$/.test(s) && DEGER[p]) {
        window.fbq('track', 'Purchase',
          { value: DEGER[p], currency: 'TRY', content_ids: ['livexa-' + p], num_items: Number(p) },
          { eventID: 'p-' + s });   // meta.js ile aynı event_id; Meta tekilleştirir
      }
    }
  }

  // satis.js: /odeme/baslat gövdesine eklenecek alan (yalnız o anda geçerli kabul kaydı varsa)
  function odemeMeta() {
    if (!riza()) return null;
    var fbc = cerez('_fbc');
    if (!fbc) {
      var fbclid = new URLSearchParams(location.search).get('fbclid');
      if (fbclid) fbc = 'fb.1.' + Date.now() + '.' + fbclid;
    }
    var m = { riza: true, url: location.href };
    var fbp = cerez('_fbp');
    if (fbp) m.fbp = fbp;
    if (fbc) m.fbc = fbc;
    return m;
  }
  // satis.js: /odeme/baslat sipariş numarası döndürdüğünde
  function odemeBasladi(siparis, paket) {
    if (!riza() || !yuklendi || typeof window.fbq !== 'function' || !siparis || !DEGER[paket]) return;
    window.fbq('track', 'InitiateCheckout',
      { value: DEGER[paket], currency: 'TRY', content_ids: ['livexa-' + paket] },
      { eventID: 'ic-' + siparis });
  }

  // ------------------------------------------------------------------ arayüz
  var sablon = document.getElementById('lx-cerez-sablon');
  var bant = null, panel = null, anahtar = null, durum = null, acan = null;

  function kur() {
    if (!sablon || bant) return;
    var parca = sablon.content.cloneNode(true);
    bant = parca.querySelector('.lx-cerez');
    panel = parca.querySelector('.lx-cerez-panel');
    anahtar = parca.querySelector('[data-cerez-anahtar]');
    durum = parca.querySelector('[data-cerez-durum]');
    document.body.appendChild(parca);

    bant.querySelector('[data-cerez="kabul"]').addEventListener('click', function () { sec(true); });
    bant.querySelector('[data-cerez="red"]').addEventListener('click', function () { sec(false); });
    bant.querySelector('[data-cerez="duzenle"]').addEventListener('click', function (e) { panelAc(e.currentTarget); });
    // Bant Esc ile kapanmaz: kapatma kabul sayılmaz, seçim yapılana kadar açık kalır (bant md, koşul 2)

    anahtar.addEventListener('click', function () { anahtarYaz(anahtar.getAttribute('aria-checked') !== 'true'); });
    panel.querySelector('[data-cerez="kaydet"]').addEventListener('click', kaydet);
    panel.addEventListener('cancel', function () { durum.hidden = true; });   // Esc: kaydetmeden kapanır
    panel.addEventListener('click', function (e) { if (e.target === panel && panel.open) panel.close(); });   // arka plana dokunma: kaydetmeden kapanır
    panel.addEventListener('close', function () {
      document.documentElement.classList.remove('lx-cerez-panel-acik');
      if (acan && document.contains(acan)) acan.focus();
      acan = null;
    });
    if ('ResizeObserver' in window) new ResizeObserver(boslukAyarla).observe(bant);
    window.addEventListener('resize', boslukAyarla);
  }

  // Bant içeriği kapatmasın: bant yüksekliği kadar sayfa sonuna boşluk
  function boslukAyarla() {
    var acik = bant && !bant.hidden;
    document.documentElement.style.setProperty('--lx-cerez-h', acik ? bant.offsetHeight + 'px' : '0px');
    document.documentElement.classList.toggle('lx-cerez-acik', !!acik);
  }
  function bantGoster(g) { kur(); if (!bant) return; bant.hidden = !g; boslukAyarla(); }

  function anahtarYaz(acik) {
    anahtar.setAttribute('aria-checked', acik ? 'true' : 'false');
    var etiket = anahtar.querySelector('[data-cerez-etiket]');
    etiket.textContent = etiket.getAttribute(acik ? 'data-acik' : 'data-kapali');
  }

  function panelAc(kaynak) {
    kur(); if (!panel) return;
    acan = kaynak || document.activeElement;
    anahtarYaz(riza());   // varsayılan kapalı; daha önce kabul edildiyse açık
    durum.hidden = true;
    document.documentElement.classList.add('lx-cerez-panel-acik');
    if (typeof panel.showModal === 'function') { if (!panel.open) panel.showModal(); }
    else panel.setAttribute('open', '');
    var bas = panel.querySelector('#lx-cerez-panel-bas'); if (bas) bas.focus();
  }

  // Banttaki iki eşit düğme
  function sec(pazarlama) {
    var odakBantta = bant.contains(document.activeElement);
    yaz(pazarlama);
    bantGoster(false);
    if (pazarlama) pikselYukle(); else metaCerezleriniSil();
    var hedef = document.getElementById('ana'); if (hedef && odakBantta) hedef.focus({ preventScroll: true });
  }

  function kaydet() {
    var onceki = riza();
    var yeni = anahtar.getAttribute('aria-checked') === 'true';
    yaz(yeni);
    bantGoster(false);
    durum.hidden = false;
    if (yeni) {
      pikselYukle();
      setTimeout(function () { if (panel.open) panel.close(); }, 1200);
    } else {
      metaCerezleriniSil();
      if (onceki || yuklendi) setTimeout(function () { location.reload(); }, 900);   // betik bellekten de çıksın
      else setTimeout(function () { if (panel.open) panel.close(); }, 1200);
    }
  }

  // Altbilgideki "Çerez tercihleri" bağlantısı paneli açar (betik çalışmazsa politika sayfasına gider)
  document.addEventListener('click', function (e) {
    var a = e.target && e.target.closest ? e.target.closest('[data-cerez-tercih]') : null;
    if (!a || !sablon) return;
    e.preventDefault();
    panelAc(a);
  });

  window.lxCerez = { riza: riza, odemeMeta: odemeMeta, odemeBasladi: odemeBasladi, panelAc: panelAc };

  // ------------------------------------------------------------------ açılış
  var k = oku();
  if (k && k.pazarlama === true) { pikselYukle(); }
  else {
    metaCerezleriniSil();          // rıza yoksa ya da süresi dolduysa kalmış Meta çerezi tutulmaz
    if (!k) bantGoster(true);
  }
})();
