// Paket kartındaki düğme: üstteki satın al kutusunda o paketi seçer ve kutuya kaydırır
document.addEventListener('click', function (e) {
  var d = e.target.closest('[data-hn-paket]');
  if (!d) return;
  var r = document.querySelector('#sa-karar input[name="paket"][value="' + d.getAttribute('data-hn-paket') + '"]');
  if (!r) return;
  e.preventDefault();
  r.checked = true;
  r.dispatchEvent(new Event('change', { bubbles: true }));
  document.getElementById('sa-karar').scrollIntoView({ behavior: 'smooth', block: 'start' });
  setTimeout(function () { r.focus({ preventScroll: true }); }, 500);
});
