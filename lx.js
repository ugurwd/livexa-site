/* LIVEXA — çerezsiz, kimliksiz ziyaret sayacı (IE-2026-10-28-analitik). Panel: analitik.livexa.com.tr
   Çerez, localStorage, sessionStorage ya da ziyaretçi kimliği kullanmaz. Gönderilen: olay adı, sayfa yolu, kanal
   etiketleri (UTM, yönlendiren alan adı, reklam tıklama işaretinin varlığı), cihaz türü (ekran genişliğinden),
   küçük bir ek (paket, bölüm ya da tıklama yeri). Sunucu her olayı tek tek değil, toplu sayaç olarak tutar.
   Kanal bilgisi sayfalar arasında depolamayla değil, site içi bağlantılara eklenen UTM parametreleriyle taşınır. */
(function () {
  'use strict';
  var UC = 'https://livexa-analitik.wakaresearch.com/o';   // sayaç Worker'ı (panel: analitik.livexa.com.tr)
  var q = new URLSearchParams(location.search);
  var test = q.get('lx_test') === '1';
  if (!test && (navigator.webdriver || /bot|crawl|spider|lighthouse|headless/i.test(navigator.userAgent))) return;

  var IC = /(^|\.)livexa\.com\.tr$|(^|\.)paytr\.com$/;        // site içi gezinme ve ödeme dönüşü giriş sayılmaz
  var refHost = '';
  try { refHost = document.referrer ? new URL(document.referrer).hostname.replace(/^www\./, '') : ''; } catch (e) { /* yok */ }
  var icten = IC.test(refHost);

  // Kanal etiketleri: önce adresteki (ilk girişte gelen ya da site içinde taşınan), yoksa yönlendiren
  var a = {};
  ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'].forEach(function (k) {
    var v = q.get(k); if (v) a[k] = v.slice(0, 60);
  });
  if (q.get('lxr')) a.lxr = q.get('lxr').slice(0, 80);
  else if (refHost && !icten) a.lxr = refHost.slice(0, 80);
  var cid = q.get('lxc') || (q.get('gclid') || q.get('gbraid') || q.get('wbraid') ? 'g' : q.get('fbclid') ? 'f' : q.get('ttclid') ? 't' : q.get('msclkid') ? 'm' : '');
  if (cid) a.lxc = cid;
  if (test) a.lx_test = '1';
  var tasinan = new URLSearchParams(a).toString();

  // Ödeme isteği için (satis.js): Worker bu etiketi ödeme dönüş adresine ekler
  window.lxAtif = function () { return tasinan; };

  var cihaz = function () { var w = window.innerWidth; return w < 760 ? 'mobil' : w < 1100 ? 'tablet' : 'masaustu'; };
  var sayfa = location.pathname === '/' ? '/index.html' : location.pathname;
  var kuyruk = [], zaman = 0;
  var gonder = function () {
    clearTimeout(zaman);
    if (!kuyruk.length) return;
    var veri = JSON.stringify(kuyruk.splice(0, 25));
    try {
      if (navigator.sendBeacon && navigator.sendBeacon(UC, new Blob([veri], { type: 'text/plain' }))) return;
    } catch (e) { /* düş */ }
    try { fetch(UC, { method: 'POST', body: veri, keepalive: true, mode: 'cors', credentials: 'omit' }); } catch (e) { /* sessiz */ }
  };
  var olay = function (ad, ek, hemen) {
    kuyruk.push({ o: ad, s: sayfa, e: ek ? String(ek).slice(0, 40) : '', g: ad === 'sayfa' && !icten ? 1 : 0, c: cihaz(), a: a, t: test ? 1 : 0 });
    if (hemen || kuyruk.length >= 10) gonder(); else { clearTimeout(zaman); zaman = setTimeout(gonder, 1500); }
  };
  window.lxOlay = olay;
  document.addEventListener('visibilitychange', function () { if (document.visibilityState === 'hidden') gonder(); });
  window.addEventListener('pagehide', gonder);

  // Tıklanan öğenin sayfadaki yeri: en yakın kimlikli bölüm ya da bilinen sınıf
  var yer = function (el) {
    if (el.closest('.gezinme, header')) return 'menu';
    if (el.closest('#site-cubuk, .uo-cubuk, .dn-cubuk')) return 'cubuk';
    if (el.closest('footer')) return 'altbilgi';
    var b = el.closest('[id]'); return b ? b.id : '';
  };

  // Sayfa görüntüleme (ileri/geri önbellekten dönüşte tekrar sayılmaz)
  olay('sayfa');

  // Ödeme sonuç sayfaları: bir kez sayılır; adres temizlenir ki yenileme tekrar saymasın
  if (/odeme-basarili\.html$/.test(sayfa) && !q.get('lxg')) {
    olay('satin_alma', /^[12]$/.test(q.get('p') || '') ? 'paket-' + q.get('p') : '', true);
    q.set('lxg', '1'); try { history.replaceState(null, '', location.pathname + '?' + q.toString()); } catch (e) { /* yok */ }
  }
  if (/odeme-basarisiz\.html$/.test(sayfa) && !q.get('lxg')) {
    olay('odeme_basarisiz', '', true);
    q.set('lxg', '1'); try { history.replaceState(null, '', location.pathname + '?' + q.toString()); } catch (e) { /* yok */ }
  }

  // Tıklamalar: Satın al çağrıları, WhatsApp, sosyal bağlantılar; site içi bağlantılara kanal etiketi eklenir
  document.addEventListener('click', function (e) {
    var el = e.target && e.target.closest ? e.target.closest('a, button') : null;
    if (!el) return;
    var href = el.getAttribute('href') || '';
    var metin = (el.textContent || '').trim().toLowerCase();
    if (/satin-al\.html/.test(href) || /^#sa-(form|paket|karar)/.test(href) || (/satın al|paketinizi seçin|paket seç/.test(metin) && el.tagName === 'A')) {
      olay('satin_al_tik', yer(el), true);
    } else if (/wa\.me\//.test(href)) {
      olay('whatsapp_tik', yer(el), true);
    } else if (/instagram\.com|facebook\.com/.test(href)) {
      olay('sosyal_tik', /instagram/.test(href) ? 'instagram' : 'facebook', true);
    }
    if (tasinan && el.tagName === 'A' && href && !/^(#|mailto:|tel:|javascript:)/.test(href)) {
      try {
        var u = new URL(href, location.href);
        if (u.origin === location.origin && /\.html$|\/$/.test(u.pathname) && !u.searchParams.has('utm_source') && !u.searchParams.has('lxr')) {
          new URLSearchParams(tasinan).forEach(function (v, k) { u.searchParams.set(k, v); });
          el.setAttribute('href', u.pathname + u.search + u.hash);
        }
      } catch (er) { /* yok */ }
    }
  }, true);

  // Satın al formu: paket seçimi, forma başlama, hata, ödemeye geçme ve ödeme ekranının açılması
  var form = document.getElementById('sa-form');
  var paket = function () { var r = document.querySelector('input[name="paket"]:checked'); return r ? 'paket-' + r.value : ''; };
  document.addEventListener('change', function (e) {
    if (e.target && e.target.name === 'paket') olay('paket_sec', 'paket-' + e.target.value);
  }, true);
  if (form) {
    var basladi = false;
    form.addEventListener('focusin', function (e) {
      if (basladi || !e.target || !/^(INPUT|TEXTAREA|SELECT)$/.test(e.target.tagName) || e.target.type === 'radio') return;
      basladi = true; olay('form_basla', paket());
    });
    form.addEventListener('submit', function () { olay('odeme_tik', paket(), true); }, true);
    var hataSon = 0;
    if ('MutationObserver' in window) {
      new MutationObserver(function () {
        var oz = form.querySelector('[role="alert"]:not([hidden])');
        if (oz && Date.now() - hataSon > 3000) { hataSon = Date.now(); olay('form_hata', paket()); }
      }).observe(form, { subtree: true, attributes: true, attributeFilter: ['hidden'] });
      var acildi = false;
      new MutationObserver(function () {
        if (!acildi && document.body.classList.contains('sa-odeme-acik')) { acildi = true; olay('odeme_acildi', paket(), true); }
      }).observe(document.body, { attributes: true, attributeFilter: ['class'] });
    }
  }

  // Kilit bölümlerin görülmesi (sayfa başına bir kez)
  if ('IntersectionObserver' in window) {
    var izle = ['bolum-sofra', 'bolum-02-beyan', 'bolum-04-kullanim', 'bolum-siparis', 'sa-paket', 'sa-form', 'ud-uyarilar', 'tablolar'];
    var go = new IntersectionObserver(function (g) {
      g.forEach(function (x) { if (x.isIntersecting) { olay('bolum', x.target.id); go.unobserve(x.target); } });
    }, { threshold: 0.35 });
    izle.forEach(function (id) { var el = document.getElementById(id); if (el) go.observe(el); });
  }
})();
