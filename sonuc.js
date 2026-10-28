/* LIVEXA — ödeme sonuç sayfaları: ?s=<sipariş numarası> yalnız worker.js biçimine uyuyorsa gösterilir.
   Değer textContent ile yazılır; sayfa s ile hiçbir servise istek yapmaz. */
(function () {
  'use strict';
  var s = new URLSearchParams(location.search).get('s');
  var p = document.getElementById('os-no'), d = document.getElementById('os-no-deger');
  if (p && d && s && /^LX\d{14}[0-9A-F]{8}$/.test(s)) { d.textContent = s; p.hidden = false; }
})();
