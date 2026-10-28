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

  // Her durağın p değeri: o durağın fotoğrafını pencerenin ortasına getiren şerit kayması (uçlarda sınırlanır)
  // Ölçüm bir kez yapılır (boyut değişince yenilenir); her karede düzen okunmaz.
  var durakPOnbellek = null;
  var durakP = function () {
    if (durakPOnbellek) return durakPOnbellek;
    var pw = pencere.clientWidth, en = Math.max(1, serit.offsetWidth - pw);
    durakPOnbellek = duraklar.map(function (d) { return sinirla((d.offsetLeft + d.offsetWidth / 2 - pw / 2) / en, 0, 1); });
    return durakPOnbellek;
  };
  window.addEventListener('resize', function () { durakPOnbellek = null; });
  window.addEventListener('load', function () { durakPOnbellek = null; });
  var enYakinDurak = function (p) {
    var ps = durakP(), k = 0;
    for (var i = 1; i < ps.length; i++) if (Math.abs(ps[i] - p) < Math.abs(ps[k] - p)) k = i;
    return k;
  };
  var sofraKare = function () {
    if (!panoramaAcik()) return;
    var r = iz.getBoundingClientRect();
    var vh = window.innerHeight;
    var gecen = ust - r.top;                         // sabitlenmeden bu yana kaydırılan
    var toplam = r.height - (vh - ust);              // sabit kaydırma mesafesi (400 vh)
    var bekle = 0;                                   // durak başı/sonu = sabitleme başı/sonu (boş adım yok)
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
    // Etkin durak: şerit konumuna en yakın durak (her durak kendi fotoğrafını pencere ortasına getirir).
    metinSec(enYakinDurak(p));
  };

  // ---------- Sofra adımları (masaüstü): her kaydırma hareketi tam olarak bir sonraki ya da önceki bileşene gider ----------
  // Trackpad ve Magic Mouse parmak kalktıktan sonra da 1–2 sn küçülen olaylar (atalet) gönderir. Bir hareket bir adım harcar,
  // ataletin devamı yutulur. Yeni hareket üç yoldan tanınır: (a) olaylar arasında 160 ms'den uzun boşluk, (b) yön değişimi,
  // (c) küçülen olayların ardından yeniden büyüme — atalet sürerken yapılan yeni kaydırma (boşluk oluşmaz, yalnız büyüklük artar).
  // Kayma sürerken gelen yeni hareket sıraya alınır, kayma bitince uygulanır. Hedef gerçek kaydırma konumundan bulunur.
  // Klavye, kaydırma çubuğu ya da sürükleme ile duraklar arasında kalınırsa kaydırma bitince en yakın durağa oturur.
  var adimKilit = 0, sonTekerlek = 0, oturtZaman = 0, bekleyenYon = 0;
  var izler = [], harcandi = false, sondu = false, hareketBas = 0, sonYon = 0;
  var durakY = function (k) {
    var vh = window.innerHeight, r = iz.getBoundingClientRect();
    var toplam = r.height - (vh - ust);
    return Math.round(window.scrollY + r.top - ust + durakP()[k] * Math.max(1, toplam));
  };
  var bolge = function () {                                  // sabitlemenin başı ve sonu (sayfa koordinatı)
    var r = iz.getBoundingClientRect(), y = window.scrollY;
    return { bas: Math.round(y + r.top - ust), son: Math.round(y + r.bottom - window.innerHeight) };
  };
  var ort = function (d) { var s = 0; for (var i = 0; i < d.length; i++) s += d[i]; return d.length ? s / d.length : 0; };
  var hareketOku = function (a, yon, simdi) {
    var yeni = simdi - sonTekerlek > 160 || yon !== sonYon;
    sonYon = yon;
    if (!yeni) {
      izler.push(a); if (izler.length > 12) izler.shift();
      if (izler.length >= 6) {
        var sa = ort(izler.slice(-3)), oa = ort(izler.slice(-9, -3));
        if (sa < oa * 0.97) sondu = true;                                                   // küçülüyor: atalet
        else if (sondu && simdi - hareketBas > 250 && sa > oa * 1.25 && sa - oa >= 1.5) yeni = true; // yeniden büyüdü
      }
    }
    if (yeni) { izler = [a]; harcandi = false; sondu = false; hareketBas = simdi; }
    return yeni;
  };
  var hedefBul = function (y, yon) {
    var n = duraklar.length, i, v;
    if (yon > 0) { for (i = 0; i < n; i++) { v = durakY(i); if (v > y + 3) return v; } }
    else { for (i = n - 1; i >= 0; i--) { v = durakY(i); if (v < y - 3) return v; } }
    return null;
  };
  var git = function (hedefY) {
    adimKilit = Date.now() + 1200;                            // yedek; asıl kilit kayma bitince açılır
    var bitti = function () {
      adimKilit = 0;
      if (!bekleyenYon) return;
      var yn = bekleyenYon, h = hedefBul(window.scrollY, yn); bekleyenYon = 0;
      if (h !== null) git(h); else harcandi = false;          // uçtaysa sıradaki hareket sayfayı bölümden çıkarır
    };
    if (window.livexaLenis) window.livexaLenis.scrollTo(hedefY, { duration: 0.55, lock: true, force: true, onComplete: bitti });
    else { window.scrollTo({ top: hedefY, behavior: 'smooth' }); setTimeout(bitti, 600); }
  };
  var tuket = function (e) { e.preventDefault(); e.stopPropagation(); };
  window.addEventListener('wheel', function (e) {
    if (!sofra || !panoramaAcik() || e.ctrlKey || Math.abs(e.deltaY) < Math.abs(e.deltaX) || e.deltaY === 0) return;
    // Hareket zamanı olayın kendi zaman damgasıyla ölçülür: sayfa meşgulken işleme gecikmesi yapay boşluk yaratmaz
    var an = e.timeStamp || performance.now(), yon = e.deltaY > 0 ? 1 : -1;
    var yeni = hareketOku(Math.abs(e.deltaY), yon, an);
    sonTekerlek = an;
    var y = window.scrollY, z = bolge();
    var kilitli = Date.now() < adimKilit;
    if (y < z.bas - 2 || y > z.son + 2) {                      // bölümün dışında
      if (kilitli) { tuket(e); if (yeni) { bekleyenYon = yon; harcandi = true; } return; }   // giriş kayması sürüyor
      // Giriş: bu olay kaydırmayı bölümün içine taşıyacaksa şerit uçtaki durağa oturur (atalet ortada bırakmaz)
      var L = window.livexaLenis, hedefCizgi = (L && typeof L.targetScroll === 'number' ? L.targetScroll : y) + e.deltaY;
      var giris = (y < z.bas - 2 && yon > 0 && hedefCizgi > z.bas) ? z.bas : (y > z.son + 2 && yon < 0 && hedefCizgi < z.son) ? z.son : null;
      if (giris !== null) { tuket(e); harcandi = true; git(giris); }
      return;
    }
    if (kilitli) { tuket(e); if (yeni) { bekleyenYon = yon; harcandi = true; } return; }     // kayma sürüyor: yeni hareket sıraya
    if (harcandi) { tuket(e); return; }                       // adım atmış hareketin devamı (atalet)
    var hedefY = hedefBul(y, yon);
    if (hedefY === null) return;                              // son duraktan aşağı / ilk duraktan yukarı: sayfa akar
    tuket(e); harcandi = true; git(hedefY);
  }, { passive: false, capture: true });
  // Kaydırma durunca (tekerlek dışı yollar): duraklar arasında kalındıysa en yakın durağa otur
  window.addEventListener('scroll', function () {
    if (!panoramaAcik() || !iz) return;
    clearTimeout(oturtZaman);
    oturtZaman = setTimeout(function () {
      if (Date.now() < adimKilit) return;
      var y = window.scrollY, z = bolge();
      if (y <= z.bas + 2 || y >= z.son - 2) return;
      var adaylar = [], en = null, i;
      for (i = 0; i < duraklar.length; i++) adaylar.push(durakY(i));
      adaylar.forEach(function (v) { if (en === null || Math.abs(v - y) < Math.abs(en - y)) en = v; });
      if (Math.abs(en - y) > 3) git(en);
    }, 220);
  }, { passive: true });

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
