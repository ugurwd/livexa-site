/* LIVEXA — satın al: sipariş formu ve PayTR iFrame (IE-2026-10-28-satis-modu).
   Sözleşme: 05-site/paytr/worker.js (POST /odeme/baslat, ALAN tablosu, dogrula(), hata kodları).
   Bütün görünür dizgeler satin-al.html içindeki <template id="sa-mesajlar"> öğesinden okunur (satın al v19 lafzı);
   bu dosyada görünür metin yoktur (önizleme blokları hariç).
   Form verisi çerez, localStorage veya sessionStorage'a yazılmaz; yalnız Worker'a gönderilir.
   İşaretli önizleme blokları yalnız önizleme derlemesinde bulunur; --yayin derlemesi onları siler. */
(function () {
  'use strict';
  var UC = 'https://livexa-paytr.wakaresearch.com/odeme/baslat';
  var ONBILGI = 'c8b6b8771e70bd67';
  var SOZLESME = 'fd2efd9d97ddd08e';
  var PAYTR_IFRAME = 'https://www.paytr.com/odeme/guvenli/';
  var PAYTR_BOYUT = 'https://www.paytr.com/js/iframeResizer.min.js';

  var form = document.getElementById('sa-form');
  var sablon = document.getElementById('sa-mesajlar');
  if (!form || !sablon) return;
  var onay = document.getElementById('odeme-onay');
  var dugme = document.getElementById('odeme-dugme');
  var ozet = document.getElementById('sa-form-ozet');
  var servis = document.getElementById('sa-form-servis');
  var faturaKutu = document.getElementById('sa-fatura-kutu');
  var faturaAlan = document.getElementById('sa-fatura');
  var odeme = document.getElementById('sa-odeme');
  var odemeAlan = document.getElementById('sa-odeme-alan');
  var dugmeMetin = dugme.textContent;
  var kilitli = false;

  function m(ad) {
    var e = sablon.content.querySelector('[data-m="' + ad + '"]');
    return e ? e.textContent : '';
  }

  // worker.js ALAN tablosu (en az, en çok karakter)
  var ALAN = [['ad', 1, 60], ['soyad', 1, 60], ['telefon', 10, 20], ['eposta', 5, 100], ['il', 2, 40], ['ilce', 2, 40], ['adres', 10, 300]];

  // worker.js temiz()
  function temiz(s) {
    return String(s == null ? '' : s).replace(/[\u0000-\u001f\u007f<>]/g, ' ').replace(/\s+/g, ' ').trim();
  }
  function girdi(ad) { return form.querySelector('[name="' + ad + '"]'); }

  function hataYaz(ad, kod) {
    var g = girdi(ad);
    var h = document.getElementById('sa-' + ad.replace('.', '-') + '-hata');
    if (!g || !h) return;
    var yardim = document.getElementById('sa-' + ad.replace('.', '-') + '-yardim');
    var tanim = yardim ? [yardim.id] : [];
    if (kod) {
      h.textContent = m(kod);
      h.hidden = false;
      g.setAttribute('aria-invalid', 'true');
      tanim.unshift(h.id);
    } else {
      h.textContent = '';
      h.hidden = true;
      g.removeAttribute('aria-invalid');
    }
    if (tanim.length) g.setAttribute('aria-describedby', tanim.join(' '));
    else g.removeAttribute('aria-describedby');
  }

  function faturaAcik() { return faturaKutu && faturaKutu.checked; }

  // worker.js dogrula() ile aynı kurallar; hata → v19 hata dizgesi anahtarı
  function dogrula() {
    var hatalar = {};
    ALAN.forEach(function (a) {
      var k = a[0], v = temiz(girdi(k).value);
      if (!v) { hatalar[k] = 'bos'; return; }
      if (k === 'telefon') {
        if (v.length < a[1] || v.length > a[2] || !/^(90)?0?5\d{9}$/.test(v.replace(/[^\d]/g, ''))) hatalar[k] = 'telefon';
        return;
      }
      if (k === 'eposta') {
        if (v.length < a[1] || v.length > a[2] || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v)) hatalar[k] = 'eposta';
        return;
      }
      if (k === 'adres' && v.length < a[1]) { hatalar[k] = 'adres'; return; }
      if (v.length < a[1] || v.length > a[2]) hatalar[k] = 'kontrol';
    });
    if (faturaAcik()) {
      var u = temiz(girdi('fatura.unvan').value);
      if (!u) hatalar['fatura.unvan'] = 'unvan';
      else if (u.length > 150) hatalar['fatura.unvan'] = 'kontrol';
      if (!/^(\d{10}|\d{11})$/.test(temiz(girdi('fatura.vergiNo').value).replace(/\D/g, ''))) hatalar['fatura.vergiNo'] = 'vergino';
    }
    return hatalar;
  }

  var TUM = ALAN.map(function (a) { return a[0]; }).concat(['fatura.unvan', 'fatura.vergiNo']);

  function hatalariGoster(hatalar) {
    var ilk = null;
    TUM.forEach(function (k) {
      hataYaz(k, hatalar[k] || '');
      if (hatalar[k] && !ilk) ilk = girdi(k);
    });
    if (ilk) {
      ozet.textContent = m('ozet');
      ozet.hidden = false;
      ilk.focus();
    } else {
      ozet.textContent = '';
      ozet.hidden = true;
    }
    return !!ilk;
  }

  function servisHata(kod) {
    servis.textContent = m(kod);
    servis.hidden = !kod;
  }

  function dugmeDurum() {
    var pasif = kilitli || !onay.checked;
    dugme.disabled = pasif;
    dugme.setAttribute('aria-disabled', pasif ? 'true' : 'false');
  }

  function govdeKur() {
    var p = document.querySelector('#sa-karar input[name="paket"]:checked');
    var g = { paket: p ? p.value : '1' };
    ALAN.forEach(function (a) { g[a[0]] = temiz(girdi(a[0]).value); });
    if (faturaAcik()) {
      g.fatura = {
        unvan: temiz(girdi('fatura.unvan').value),
        vergiDairesi: temiz(girdi('fatura.vergiDairesi').value),
        vergiNo: temiz(girdi('fatura.vergiNo').value).replace(/\D/g, '')
      };
    }
    g.onay = true;
    g.onbilgi = ONBILGI;
    g.sozlesme = SOZLESME;
    return g;
  }

  function gonder(g) {
    return fetch(UC, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(g),
      credentials: 'omit',
      cache: 'no-store'
    }).then(function (r) {
      return r.json().then(function (j) { return { durum: r.status, veri: j }; }, function () { return { durum: r.status, veri: {} }; });
    });
  }


  function kilitle() {
    kilitli = true;
    [].forEach.call(document.querySelectorAll('#sa-karar input[name="paket"]'), function (r) { r.disabled = true; });
    [].forEach.call(form.querySelectorAll('input, textarea'), function (e) {
      if (e.type === 'checkbox') e.disabled = true; else e.readOnly = true;
    });
    dugmeDurum();
    document.body.classList.add('sa-odeme-acik');
  }

  function iframeAc(token) {
    var f = document.createElement('iframe');
    f.id = 'paytriframe';
    f.src = PAYTR_IFRAME + encodeURIComponent(token);
    f.title = m('iframe');
    f.setAttribute('frameborder', '0');
    f.setAttribute('scrolling', 'no');
    f.style.width = '100%';
    odemeAlan.appendChild(f);
    var s = document.createElement('script');
    s.src = PAYTR_BOYUT;
    s.onload = function () { if (typeof window.iFrameResize === 'function') window.iFrameResize({}, '#paytriframe'); };
    document.head.appendChild(s);
  }

  function odemeAc(token) {
    kilitle();
    odeme.hidden = false;
    iframeAc(token);
    var h = document.getElementById('sa-odeme-h');
    odeme.scrollIntoView({ behavior: 'smooth', block: 'start' });
    if (h) setTimeout(function () { h.focus({ preventScroll: true }); }, 400);
  }

  onay.checked = false;
  onay.addEventListener('change', dugmeDurum);
  dugmeDurum();

  if (faturaKutu) {
    faturaKutu.checked = false;
    faturaKutu.addEventListener('change', function () {
      faturaAlan.hidden = !faturaKutu.checked;
      if (!faturaKutu.checked) { hataYaz('fatura.unvan', ''); hataYaz('fatura.vergiNo', ''); }
    });
  }

  // Ödeme alanı açıldıktan sonra paket kartı düğmeleri seçimi değiştirmez (huni.js'ten önce yakalanır)
  document.addEventListener('click', function (e) {
    if (kilitli && e.target.closest && e.target.closest('[data-hn-paket]')) e.stopPropagation();
  }, true);

  form.addEventListener('submit', function (e) {
    e.preventDefault();
    if (kilitli || !onay.checked) return;
    servisHata('');
    if (hatalariGoster(dogrula())) return;
    var g = govdeKur();
    kilitli = true;
    dugmeDurum();
    dugme.textContent = m('bekle');
    dugme.setAttribute('aria-busy', 'true');
    gonder(g).then(function (y) {
      dugme.textContent = dugmeMetin;
      dugme.removeAttribute('aria-busy');
      kilitli = false;
      var v = y.veri || {};
      if (y.durum === 200 && v.token) { odemeAc(v.token); return; }
      if (y.durum === 400 && v.hata === 'alan' && v.alanlar && v.alanlar.length) {
        var h = {};
        v.alanlar.forEach(function (k) {
          if (k === 'fatura') {
            if (!temiz(girdi('fatura.unvan').value)) h['fatura.unvan'] = 'unvan';
            else h['fatura.vergiNo'] = 'vergino';
          } else if (k === 'telefon' || k === 'eposta') h[k] = k;
          else if (k === 'adres') h[k] = 'adres';
          else h[k] = 'kontrol';
        });
        dugmeDurum();
        hatalariGoster(h);
        return;
      }
      if (y.durum === 400 && (v.hata === 'istek' || v.hata === 'paket' || v.hata === 'onay')) servisHata('red');
      else servisHata('servis');
      dugmeDurum();
    }, function () {
      dugme.textContent = dugmeMetin;
      dugme.removeAttribute('aria-busy');
      kilitli = false;
      servisHata('servis');
      dugmeDurum();
    });
  });
})();
