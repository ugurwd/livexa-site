/* LIVEXA ana sayfa v19 · YAYIN · IE-2026-10-11-068 · hareket sistemi (yön notu §5; v18 önizlemeden taşındı, IE-062).
   Kaydırmaya bağlı; okur durunca sayfa durur. Yalnız transform / opacity / clip-path (+ molekül stroke-dashoffset).
   Metin üretmez, metin değiştirmez. Yasal metin ve beyan cümleleri hiçbir harekete bağlanmaz.
   Stil yalnız CSSOM ile yazılır (CSP style-src 'self'). */
(function () {
  'use strict';
  var kok = document.documentElement;

  var azHareket = window.matchMedia('(prefers-reduced-motion: reduce)');
  var genis = window.matchMedia('(min-width:1100px)');
  var IO = 'IntersectionObserver' in window;
  var sinirla = function (v, a, b) { return Math.max(a, Math.min(b, v)); };

  // Sabitlenen alanın üst payı: gezinme
  var ust = 0;
  var ustOlc = function () {
    var g = document.querySelector('.gezinme');
    ust = g ? g.offsetHeight : 0;
    kok.style.setProperty('--v18-ust', ust + 'px');
  };
  ustOlc();

  // ---------- Sofra öğeleri ----------
  var sofra = document.getElementById('bolum-sofra');
  var iz = sofra && sofra.querySelector('.v18-sofra__iz');
  var pencere = sofra && sofra.querySelector('.v18-sofra__pencere');
  var serit = sofra && sofra.querySelector('.v18-sofra__serit');
  var duraklar = sofra ? [].slice.call(sofra.querySelectorAll('.v18-durak')) : [];
  var gorseller = duraklar.map(function (d) { return d.querySelector('.v18-durak__gorsel'); });
  var metinler = sofra ? [].slice.call(sofra.querySelectorAll('.v18-metin')) : [];
  var parcalar = sofra ? [].slice.call(sofra.querySelectorAll('.v18-sofra__ilerleme i')) : [];
  var noktalar = sofra ? [].slice.call(sofra.querySelectorAll('.v18-sofra__noktalar i')) : [];
  var etkin = -1;

  var metinSec = function (i, ilk) {
    if (i === etkin) return;
    metinler.forEach(function (m, j) {
      var on = j === i;
      if (!on && m.classList.contains('etkin') && !ilk) {
        m.classList.add('cikti');
        setTimeout(function () { m.classList.remove('cikti'); }, 320);
      }
      m.classList.toggle('etkin', on);
      if (on) { m.removeAttribute('inert'); m.removeAttribute('aria-hidden'); }
      else { m.setAttribute('inert', ''); m.setAttribute('aria-hidden', 'true'); }
    });
    parcalar.forEach(function (p, j) { p.classList.toggle('dolu', j <= i); });
    etkin = i;
  };
  var noktaSec = function (i) { noktalar.forEach(function (n, j) { n.classList.toggle('dolu', j === i); }); };
  noktaSec(0);

  var panoramaAcik = function () { return sofra && genis.matches && !azHareket.matches && !kok.classList.contains('v18-sabitlemesiz'); };

  var sofraKare = function () {
    if (!panoramaAcik()) return;
    var r = iz.getBoundingClientRect();
    var vh = window.innerHeight;
    var gecen = ust - r.top;                         // sabitlenmeden bu yana kaydırılan
    var toplam = r.height - (vh - ust);              // sabit kaydırma mesafesi (400 vh)
    var bekle = 0.5 * vh;
    var p = sinirla((gecen - bekle) / Math.max(1, toplam - 2 * bekle), 0, 1);
    var pw = pencere.clientWidth;
    var x = -(Math.max(0, serit.offsetWidth - pw)) * p;
    serit.style.transform = 'translate3d(' + x.toFixed(1) + 'px,0,0)';
    for (var i = 0; i < duraklar.length; i++) {
      var d = duraklar[i], w = d.offsetWidth, sol = d.offsetLeft + x;
      var gorunur = sol < pw && sol + w > 0;
      var g = gorseller[i];
      if (gorunur) {
        // pencereye sağdan girerken u=0, soldan çıkarken u=1. Ken Burns: ölçek 1,04 → 1,01 (tabak kesilmez);
        // kayma, ölçeğin açtığı payın içinde kalır (|t| ≤ (s − 1) / 2), kart kenarında boşluk açılmaz.
        var u = sinirla((pw - sol) / (pw + w), 0, 1);
        var s = 1.04 - 0.03 * u;
        var t = (s - 1) / 2 * 100 * (1 - 2 * u);
        g.style.transform = 'translate3d(' + t.toFixed(2) + '%,0,0) scale(' + s.toFixed(4) + ')';
        g.style.willChange = 'transform';
      } else if (g.style.willChange) {
        g.style.willChange = '';
      }
    }
    // Etkin durak: sahne merkezleri, pencerede soldan sağa kayan bir referans çizgisini geçtikçe değişir
    // (p=0 → ilk sahne, p=1 → son sahne; değişim p = 1/6, 1/2, 5/6'da).
    metinSec(Math.round(p * (duraklar.length - 1)));
  };

  // ---------- Sofra adımları: masaüstünde her tekerlek/trackpad hareketi bir sonraki (önceki) bileşene geçer ----------
  // Sabitleme bölgesinde tekerlek olayı Lenis'e ulaşmadan yakalanır; sayfa, hedef durağın kaydırma konumuna götürülür.
  // Kayma sürerken ve hareket durmadan (trackpad ataleti) yeni adım alınmaz. Uçlarda olay serbest kalır, sayfa akar.
  var adimKilit = 0, sonTekerlek = 0;
  var durakY = function (k) {
    var vh = window.innerHeight, r = iz.getBoundingClientRect();
    var toplam = r.height - (vh - ust), bekle = 0.5 * vh;
    var gecen = bekle + (k / (duraklar.length - 1)) * Math.max(1, toplam - 2 * bekle);
    return window.scrollY + r.top - ust + gecen;
  };
  if (sofra) sofra.addEventListener('wheel', function (e) {
    if (!panoramaAcik() || e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX)) return;
    var simdi = Date.now(), aradanGecen = simdi - sonTekerlek;
    sonTekerlek = simdi;
    var r = iz.getBoundingClientRect();
    if (r.top > ust + 2 || r.bottom < window.innerHeight - 2) return;   // sabitleme bölgesi dışında
    var n = duraklar.length, k = etkin < 0 ? 0 : etkin, yon = e.deltaY > 0 ? 1 : -1;
    var hedef = k + yon;
    var y = window.scrollY;
    var basY = y + r.top - ust, sonuY = y + r.bottom - window.innerHeight;  // sabitlemenin başı ve sonu
    if (hedef < 0 && y <= basY + 4) return;                             // en baştan yukarı: sayfa akar
    if (hedef > n - 1 && y >= sonuY - 4) return;                        // en sondan aşağı: sayfa akar
    e.preventDefault(); e.stopPropagation();
    if (simdi < adimKilit || aradanGecen < 140) return;                 // kayma ya da aynı hareketin devamı
    // son duraktan sonra bölüm sonuna, ilk duraktan önce bölüm başına: boş kaydırma kalmaz
    var hedefY = hedef > n - 1 ? sonuY : hedef < 0 ? basY : durakY(hedef);
    adimKilit = simdi + 900;
    if (window.livexaLenis) window.livexaLenis.scrollTo(hedefY, { duration: 0.85, lock: true, force: true });
    else window.scrollTo({ top: hedefY, behavior: 'smooth' });
  }, { passive: false, capture: true });

  // ---------- Hero çıkışı ----------
  var heroKart = document.getElementById('hero-kart');
  var gunes = document.querySelector('.uo-gunes');
  var hero = document.getElementById('bolum-00-hero');
  var heroKare = function () {
    if (azHareket.matches || !hero) return;
    var y = window.scrollY;
    if (y > hero.offsetHeight + 200) return;
    var t = sinirla(y / 600, 0, 1);
    if (heroKart) heroKart.style.transform = 'translate3d(0,' + (-40 * t).toFixed(1) + 'px,0) scale(' + (1 - 0.06 * t).toFixed(4) + ')';
    if (gunes) gunes.style.transform = 'translate3d(0,' + (-0.3 * y).toFixed(1) + 'px,0)';
  };

  // ---------- Şeffaflık görseli paralaksı (0,12) ----------
  var seffafImg = document.querySelector('.dn-seffaf__dugme img');
  var seffafKare = function () {
    if (azHareket.matches || !seffafImg) return;
    var r = seffafImg.parentNode.getBoundingClientRect();
    if (r.bottom < 0 || r.top > window.innerHeight) return;
    var m = (r.top + r.height / 2 - window.innerHeight / 2) * -0.12;
    seffafImg.style.transform = 'translate3d(0,' + sinirla(m, -40, 40).toFixed(1) + 'px,0) scale(1.08)';
  };

  // ---------- Tek kare döngüsü (kaydırma ile beslenir; Lenis pencere kaydırmasını sürer) ----------
  var bekliyor = false;
  var kare = function () { bekliyor = false; heroKare(); sofraKare(); seffafKare(); };
  var iste = function () { if (!bekliyor) { bekliyor = true; window.requestAnimationFrame(kare); } };
  window.addEventListener('scroll', iste, { passive: true });
  window.addEventListener('resize', function () { ustOlc(); if (!panoramaAcik() && serit) { serit.style.transform = ''; gorseller.forEach(function (g) { g.style.transform = ''; g.style.willChange = ''; }); } iste(); });
  window.addEventListener('load', function () { ustOlc(); iste(); });
  metinSec(0, true);
  iste();

  // ---------- Mobil/tablet şerit: nokta ve ortadaki kartta tek yönlü Ken Burns ----------
  if (sofra && IO) {
    var seritGozcu = new IntersectionObserver(function (g) {
      g.forEach(function (e) {
        if (e.isIntersecting && e.intersectionRatio >= 0.6 && !genis.matches) {
          var i = duraklar.indexOf(e.target);
          noktaSec(i);
          if (!azHareket.matches) e.target.classList.add('ortada'); // 8 sn, 1,0 → 1,04, sonunda durur; döngü yok
        }
      });
    }, { root: null, threshold: [0.6] });
    duraklar.forEach(function (d) { seritGozcu.observe(d); });
  }

  // ---------- Görünüme girişler (yalnız hareket izni varsa; ilk ekrandakiler dokunulmaz) ----------
  if (azHareket.matches || !IO) return;
  kok.classList.add('v18-hazir');
  var esik = window.innerHeight * 0.9;
  var asagida = function (el) { return el.getBoundingClientRect().top > esik; };
  var gozle = function (els, esikDeger, gir) {
    var gz = new IntersectionObserver(function (g) {
      g.forEach(function (e) { if (e.isIntersecting) { gir(e.target); gz.unobserve(e.target); } });
    }, { rootMargin: '0px 0px -8% 0px', threshold: esikDeger });
    els.forEach(function (el) { gz.observe(el); });
  };

  // Bölüm başlıkları: kelime kelime 24 px yükselme, 700 ms, 70 ms aralık (toplam ≤ 350 ms)
  var basliklar = [].slice.call(document.querySelectorAll('main .bolum .d2')).filter(function (h) { return !h.closest('[hidden]') && asagida(h); });
  basliklar.forEach(function (h) {
    var n = 0;
    var yuru = function (dugum) {
      [].slice.call(dugum.childNodes).forEach(function (c) {
        if (c.nodeType === 3) {
          var parcalar2 = c.textContent.split(/(\s+)/);
          var frag = document.createDocumentFragment();
          parcalar2.forEach(function (p) {
            if (!p) return;
            if (/^\s+$/.test(p)) { frag.appendChild(document.createTextNode(p)); return; }
            var s = document.createElement('span');
            s.className = 'v18-k';
            s.textContent = p;
            s.style.setProperty('--v18-gecikme', Math.min(350, n * 70) + 'ms');
            n++;
            frag.appendChild(s);
          });
          dugum.replaceChild(frag, c);
        } else if (c.nodeType === 1 && c.tagName.toLowerCase() !== 'svg') {
          yuru(c);
        }
      });
    };
    yuru(h);
    h.classList.add('v18-kelime');
  });
  gozle(basliklar, 0.2, function (h) { h.classList.add('v18-gor'); });

  // Beyan kartları + molekül çizimi (1.200 ms, kart girişinden 150 ms sonra)
  var kartlar = [].slice.call(document.querySelectorAll('.dn-kart')).filter(asagida);
  kartlar.forEach(function (k) {
    k.classList.add('v18-once');
    [].forEach.call(k.querySelectorAll('.mol__bag path'), function (p) {
      var L = p.getTotalLength ? p.getTotalLength() : 0;
      if (!L) return;
      p.style.strokeDasharray = L.toFixed(1);
      p.style.strokeDashoffset = L.toFixed(1);
    });
  });
  gozle(kartlar, 0.15, function (k) {
    k.classList.remove('v18-once'); k.classList.add('v18-gor');
    [].forEach.call(k.querySelectorAll('.mol__bag path'), function (p) {
      p.style.transition = 'stroke-dashoffset 1200ms cubic-bezier(.2,.7,.2,1) 150ms';
      requestAnimationFrame(function () { p.style.strokeDashoffset = '0'; });
    });
  });

  // Kullanım: iki sahne aşağıdan yukarı açılır, akşam 120 ms sonra. Yasal metin hareket etmez.
  var kSahneler = [].slice.call(document.querySelectorAll('.v18-kul .dn-sahne__kare')).filter(asagida);
  kSahneler.forEach(function (s, i) { s.classList.add('v18-once'); s.style.setProperty('--v18-gecikme', (i * 120) + 'ms'); });
  // Gözlem üst figure'da: kendi clip-path'i kesişimi sıfırlar ve tembel görseli yükletmez.
  gozle(kSahneler.map(function (s) { return s.parentNode; }), 0.15, function (f) { var s = f.querySelector('.dn-sahne__kare'); s.classList.remove('v18-once'); s.classList.add('v18-gor'); });
  kSahneler.forEach(function (s) { var i = s.querySelector('img'); if (i) i.loading = 'eager'; });

  // Sipariş: 1 ve 2 kutu, 90 ms aralık
  var paketler = [].slice.call(document.querySelectorAll('.dn-paket')).filter(asagida);
  paketler.forEach(function (p, i) { p.classList.add('v18-once'); p.style.setProperty('--v18-gecikme', (i * 90) + 'ms'); });
  gozle(paketler, 0.15, function (p) { p.classList.remove('v18-once'); p.classList.add('v18-gor'); });
})();
