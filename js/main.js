// Demo MPC — interacciones mínimas
(function () {
  // Menú móvil
  var nav = document.getElementById('nav');
  var hamb = document.getElementById('hamb');
  if (hamb && nav) {
    hamb.addEventListener('click', function () { nav.classList.add('open'); });
    var close = nav.querySelector('.nav-close');
    if (close) close.addEventListener('click', function () { nav.classList.remove('open'); });
  }

  // Filtros móvil (página de colección)
  var ft = document.getElementById('filtersToggle');
  var filters = document.getElementById('filters');
  if (ft && filters) ft.addEventListener('click', function () { filters.classList.toggle('open'); });

  // Selección de variantes (color / opción) en PDP
  document.querySelectorAll('[data-optgroup]').forEach(function (group) {
    group.addEventListener('click', function (e) {
      var opt = e.target.closest('.chip, .sw-opt, .thumbs div');
      if (!opt) return;
      group.querySelectorAll('.active').forEach(function (a) { a.classList.remove('active'); });
      opt.classList.add('active');
    });
  });

  // Galería PDP: cambiar emoji principal al tocar miniatura
  document.querySelectorAll('.thumbs div').forEach(function (t) {
    t.addEventListener('click', function () {
      var main = document.querySelector('.pdp .main .emo');
      if (main && t.dataset.emo) main.textContent = t.dataset.emo;
    });
  });
})();
