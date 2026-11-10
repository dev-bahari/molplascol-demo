/* Moldes & Plásticos de Colombia — tienda demo (sin backend)
   Catálogo, carrito (localStorage), filtros, PDP, checkout y confirmación. */
(function () {
  'use strict';

  var WA = '573102251681';
  var FREE = 150000, SHIP = 12900, EXPRESS = 19900;

  var $ = function (s, r) { return (r || document).querySelector(s); };
  var $$ = function (s, r) { return Array.prototype.slice.call((r || document).querySelectorAll(s)); };
  var fmt = function (n) { return '$' + Math.round(n).toLocaleString('es-CO'); };
  var esc = function (s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); };
  var norm = function (s) { return String(s).normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase(); };
  var qs = new URLSearchParams(location.search);
  var store = {
    get: function (k, d) { try { var v = localStorage.getItem(k); return v ? JSON.parse(v) : d; } catch (e) { return d; } },
    set: function (k, v) { try { localStorage.setItem(k, JSON.stringify(v)); } catch (e) { /* modo privado */ } }
  };

  /* ---------------- iconos (trazo, estilo Lucide) ---------------- */
  var I = {
    search: '<circle cx="11" cy="11" r="7"/><path d="m20 20-3.5-3.5"/>',
    user: '<circle cx="12" cy="8" r="4"/><path d="M4 21a8 8 0 0 1 16 0"/>',
    bag: '<path d="M5.5 7h13l1 14h-15z"/><path d="M9 10V6a3 3 0 0 1 6 0v4"/>',
    menu: '<path d="M4 7h16M4 12h16M4 17h16"/>',
    x: '<path d="M6 6l12 12M18 6 6 18"/>',
    down: '<path d="m6 9 6 6 6-6"/>',
    right: '<path d="m9 6 6 6-6 6"/>',
    arrow: '<path d="M5 12h14M13 6l6 6-6 6"/>',
    plus: '<path d="M12 5v14M5 12h14"/>',
    minus: '<path d="M5 12h14"/>',
    truck: '<path d="M2.5 6.5h11v9h-11zM13.5 9.5h4l3 3v3h-7"/><circle cx="6.5" cy="17.5" r="1.8"/><circle cx="16.5" cy="17.5" r="1.8"/>',
    shield: '<path d="M12 3 5 6v5c0 4.5 3 8.3 7 10 4-1.7 7-5.5 7-10V6z"/><path d="m9 12 2 2 4-4"/>',
    factory: '<path d="M3 21V10l6 3v-3l6 3V5h6v16z"/><path d="M7 17h2M12 17h2M17 17h1"/>',
    swap: '<path d="M4 9h13l-3-3M20 15H7l3 3"/>',
    lock: '<rect x="5" y="11" width="14" height="10" rx="2"/><path d="M8 11V8a4 4 0 0 1 8 0v3"/>',
    check: '<path d="m5 12.5 4.5 4.5L19 7.5"/>',
    grid3: '<rect x="4" y="4" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="4" width="6.5" height="6.5" rx="1"/><rect x="4" y="13.5" width="6.5" height="6.5" rx="1"/><rect x="13.5" y="13.5" width="6.5" height="6.5" rx="1"/>',
    grid4: '<path d="M4 4h4v4H4zM10 4h4v4h-4zM16 4h4v4h-4zM4 10h4v4H4zM10 10h4v4h-4zM16 10h4v4h-4zM4 16h4v4H4zM10 16h4v4h-4zM16 16h4v4h-4z"/>',
    filter: '<path d="M4 7h16M7 12h10M10 17h4"/>',
    box: '<path d="M21 8 12 3 3 8v8l9 5 9-5z"/><path d="m3 8 9 5 9-5M12 13v8"/>',
    tag: '<path d="M3 12V4h8l10 10-8 8z"/><circle cx="7.5" cy="7.5" r="1.3"/>',
    info: '<circle cx="12" cy="12" r="9"/><path d="M12 11v5M12 8h.01"/>',
    pin: '<path d="M12 21s-7-6.2-7-11.5a7 7 0 0 1 14 0C19 14.8 12 21 12 21z"/><circle cx="12" cy="9.5" r="2.5"/>',
    clock: '<circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/>'
  };
  function ic(n) { return '<svg class="ico" viewBox="0 0 24 24" aria-hidden="true">' + I[n] + '</svg>'; }
  var WA_SVG = '<svg viewBox="0 0 32 32" aria-hidden="true"><path d="M16 3C9 3 3.3 8.6 3.3 15.6c0 2.5.7 4.8 1.9 6.8L3 29l6.8-2.1c1.9 1 4 1.6 6.2 1.6 7 0 12.7-5.6 12.7-12.6S23 3 16 3zm0 23c-2 0-3.9-.6-5.5-1.6l-.4-.2-4 1.2 1.3-3.9-.3-.4a10.2 10.2 0 0 1-1.7-5.6C5.4 9.8 10.1 5.2 16 5.2s10.6 4.6 10.6 10.4S21.9 26 16 26zm5.8-7.8c-.3-.2-1.9-.9-2.2-1-.3-.1-.5-.2-.7.2-.2.3-.8 1-1 1.2-.2.2-.4.2-.7.1-.3-.2-1.3-.5-2.5-1.5-.9-.8-1.6-1.8-1.7-2.1-.2-.3 0-.5.1-.6l.5-.6c.2-.2.2-.3.3-.5.1-.2 0-.4 0-.5l-1-2.4c-.3-.6-.5-.5-.7-.5h-.6c-.2 0-.5.1-.8.4-.3.3-1 1-1 2.5s1.1 2.9 1.2 3.1c.1.2 2.1 3.3 5.2 4.6 2.6 1 3.1.8 3.7.8.6-.1 1.9-.8 2.1-1.5.3-.7.3-1.4.2-1.5-.1-.2-.3-.3-.6-.4z"/></svg>';
  var logoN = 0;
  function logo() {
    var id = 'lg' + (logoN++);
    return '<svg viewBox="0 0 48 48" aria-hidden="true"><defs><linearGradient id="' + id + '" x1="0" y1="0" x2="1" y2="1"><stop offset="0" stop-color="#F7A43C"/><stop offset="1" stop-color="#E2571A"/></linearGradient></defs>' +
      '<g fill="none" stroke="url(#' + id + ')" stroke-width="3.6" stroke-linejoin="round" stroke-linecap="round">' +
      '<path d="M6 41V15.5L24 5.5l18 10V33"/><path d="M13 41V19.5l11-6.2 11 6.2V30"/><path d="M20 41V23.6l4-2.2 4 2.2v4"/></g>' +
      '<rect x="27.5" y="27" width="4.6" height="8.5" rx="1" fill="#2C2A7C"/></svg>';
  }
  function brand() { return '<a class="brand" href="index.html" aria-label="Moldes &amp; Plásticos de Colombia — inicio">' + logo() + '<span class="brand-txt">Moldes &amp; Plásticos<small>de Colombia</small></span></a>'; }

  /* ---------------- catálogo ---------------- */
  var MULTI = 'conic-gradient(#F5C518 0 20%,#E0336B 0 40%,#1F8FE0 0 60%,#3BAA35 0 80%,#F08A24 0)';
  function c(n, h, f, out) { return { n: n, h: h, f: f, out: !!out }; }
  var PRODUCTS = [
    { id: 'volqueta-mpc', name: 'Volqueta MPC Construcción', col: 'jugueteria', sub: 'Carros y volquetas', price: 54900, compare: 64900, img: 'img/ig01.jpg',
      colors: [c('Verde', '#2EAA3F', 'Verde'), c('Azul', '#1F6FD1', 'Azul'), c('Amarillo', '#F5C518', 'Amarillo'), c('Rojo', '#D62828', 'Rojo')],
      desc: 'Volqueta de juguete con tolva basculante, cabina detallada y llantas de gran agarre para todo tipo de terreno. Inyectada en plástico de alto impacto, libre de carga estática y con acabados que no se despintan.',
      specs: [['Material', 'Polipropileno de alto impacto'], ['Edad', 'Desde 3 años'], ['Incluye', 'Tolva basculante funcional'], ['Origen', 'Hecho en Colombia']] },
    { id: 'carro-paseador', name: 'Carro paseador MPC con manija', col: 'jugueteria', sub: 'Montables y triciclos', price: 159900, compare: 179900, isNew: true, img: 'img/hero-paseador.webp', pos: '50% center',
      colors: [c('Azul / Verde lima', '#1F4FD1', 'Azul')],
      desc: 'Carro montable con manija trasera para que papá o mamá lo empujen y baranda de seguridad desmontable. Cuando tu hijo crece, quitas la manija y la baranda y queda como montable de impulso. Timón con pito y espacio de almacenamiento bajo el asiento.',
      specs: [['Material', 'Polietileno de alto impacto'], ['Edad', '1 a 3 años'], ['Peso máximo', '25 kg'], ['Origen', 'Hecho en Colombia']] },
    { id: 'jeep-montable', name: 'Jeep montable MPC', col: 'jugueteria', sub: 'Montables y triciclos', price: 189900, isNew: true, img: 'img/hero-jeeps.webp', pos: '66% center',
      colors: [c('Azul', '#1F4FD1', 'Azul'), c('Rojo', '#D62828', 'Rojo'), c('Verde', '#7DC242', 'Verde'), c('Rosado', '#EE7FB0', 'Rosado')],
      desc: 'Jeep montable de impulso con barra antivuelco, timón y llantas anchas de alto agarre. Gráficos de competencia y cuatro colores para escoger. Resiste el juego dentro y fuera de casa.',
      specs: [['Material', 'Polietileno de alto impacto'], ['Edad', '2 a 5 años'], ['Peso máximo', '30 kg'], ['Origen', 'Hecho en Colombia']] },
    { id: 'triciclo-policia', name: 'Triciclo Policía Nacional', col: 'jugueteria', sub: 'Montables y triciclos', price: 89900, isNew: true, img: 'img/ig10.jpg',
      colors: [c('Azul / Verde', '#2B4FB5', 'Azul')],
      desc: 'Triciclo con diseño inspirado en la Policía Nacional de Colombia: manubrio ergonómico, sillín anatómico y platón trasero para llevar sus juguetes. Estructura reforzada pensada para el uso diario.',
      specs: [['Material', 'Polietileno inyectado'], ['Edad', '2 a 5 años'], ['Peso máximo', '30 kg'], ['Origen', 'Hecho en Colombia']] },
    { id: 'jeep-mpc', name: 'Jeep MPC Aventura', col: 'jugueteria', sub: 'Carros y volquetas', price: 49900, img: 'img/ig03.jpg',
      colors: [c('Amarillo', '#F5C518', 'Amarillo'), c('Azul', '#1F6FD1', 'Azul'), c('Naranja', '#E4572E', 'Naranja'), c('Rosado', '#F0A6C8', 'Rosado', true), c('Verde', '#3BAA35', 'Verde')],
      desc: 'Jeep todoterreno con barra antivuelco, ruedas de alto desempeño y gráficos exclusivos MPC. Resistente a golpes y caídas, listo para cualquier aventura dentro o fuera de casa.',
      specs: [['Material', 'Polipropileno de alto impacto'], ['Edad', 'Desde 3 años'], ['Diseño', 'Exclusivo MPC'], ['Origen', 'Hecho en Colombia']] },
    { id: 'triciclo-racing-86', name: 'Triciclo Racing 86', col: 'jugueteria', sub: 'Montables y triciclos', price: 89900, compare: 99900, img: 'img/ig11.jpg',
      colors: [c('Rojo', '#D62828', 'Rojo')],
      desc: 'El favorito de los pequeños pilotos: triciclo con gráficos de competencia, platón trasero y llantas anchas que dan estabilidad. Pedales antideslizantes y manubrio con agarre suave.',
      specs: [['Material', 'Polietileno inyectado'], ['Edad', '2 a 5 años'], ['Peso máximo', '30 kg'], ['Origen', 'Hecho en Colombia']] },
    { id: 'triciclo-chopper', name: 'Triciclo Chopper', col: 'jugueteria', sub: 'Montables y triciclos', price: 89900, img: 'img/ig09.jpg',
      colors: [c('Negro / Rojo', '#22212B', 'Negro')],
      desc: 'Estilo chopper con manubrio alto y gráficos de llamas. Platón trasero de carga, sillín acolchado de una pieza y estructura que soporta el juego rudo.',
      specs: [['Material', 'Polietileno inyectado'], ['Edad', '2 a 5 años'], ['Peso máximo', '30 kg'], ['Origen', 'Hecho en Colombia']] },
    { id: 'triciclo-candy-rush', name: 'Triciclo Candy Rush', col: 'jugueteria', sub: 'Montables y triciclos', price: 89900, isNew: true, img: 'img/ig12.jpg',
      colors: [c('Fucsia / Rosado', '#E0337A', 'Rosado')],
      desc: 'Triciclo en tonos dulces con gráficos Candy Rush, sillín anatómico y platón trasero. Colores vivos y resistentes al sol.',
      specs: [['Material', 'Polietileno inyectado'], ['Edad', '2 a 5 años'], ['Peso máximo', '30 kg'], ['Origen', 'Hecho en Colombia']] },
    { id: 'mug-roma', name: 'Mug Roma', col: 'hogar', sub: 'Vasos y mugs', price: 8900, isNew: true, img: 'img/ig07.jpg',
      colors: [c('Azul hielo', '#9CC7EC', 'Azul'), c('Verde limón', '#C6E14B', 'Verde'), c('Blanco', '#F2F2EE', 'Blanco'), c('Menta', '#7FD9C4', 'Verde'), c('Coral', '#F28B7B', 'Rosado')],
      desc: 'Mug de copa alta con asa ergonómica y acabado esmerilado. Ideal para aromáticas, jugos y bebidas frías. Ligero, irrompible y apto para lavavajillas.',
      specs: [['Material', 'Polipropileno libre de BPA'], ['Capacidad', '350 ml aprox.'], ['Uso', 'Bebidas frías y tibias'], ['Origen', 'Hecho en Colombia']] },
    { id: 'set-bowls', name: 'Set de 5 bowls de colores', col: 'hogar', sub: 'Cocina y mesa', price: 44900, compare: 52900, img: 'img/ig04.jpg',
      colors: [c('Surtido', MULTI, 'Multicolor')],
      desc: 'Cinco bowls translúcidos en colores para servir pasabocas, ensaladas, crispetas o fruta. Apilables, livianos y perfectos para reuniones y uso diario.',
      specs: [['Material', 'Polipropileno libre de BPA'], ['Contenido', '5 bowls'], ['Diámetro', '20 cm aprox.'], ['Origen', 'Hecho en Colombia']] },
    { id: 'hermeticos-x6', name: 'Set 6 contenedores herméticos', col: 'hogar', sub: 'Organización', price: 39900, img: 'img/ig06.jpg',
      colors: [c('Surtido', MULTI, 'Multicolor')],
      desc: 'Seis contenedores con tapa de cierre hermético en tres tamaños. Mantienen frescos tus alimentos y ordenan la nevera y la despensa.',
      specs: [['Material', 'Polipropileno libre de BPA'], ['Contenido', '6 contenedores con tapa'], ['Apto para', 'Nevera y microondas (sin tapa)'], ['Origen', 'Hecho en Colombia']] },
    { id: 'vaso-disco', name: 'Vaso Colección Disco', col: 'hogar', sub: 'Vasos y mugs', price: 6900, img: 'img/ig08.jpg',
      colors: [c('Verde', '#5BD35B', 'Verde'), c('Naranja', '#F7A21B', 'Naranja'), c('Limón', '#C9E53A', 'Amarillo'), c('Rosado', '#F49AB0', 'Rosado'), c('Azul', '#3EB3F0', 'Azul')],
      desc: 'Vaso alto de pie esmerilado para cócteles, jugos y limonadas. El preferido de bares, restaurantes y eventos por su resistencia y sus colores.',
      specs: [['Material', 'Polipropileno libre de BPA'], ['Capacidad', '450 ml aprox.'], ['Uso', 'Hogar, bares y eventos'], ['Origen', 'Hecho en Colombia']] },
    { id: 'ponchera-multiusos', name: 'Ponchera multiusos', col: 'hogar', sub: 'Cocina y mesa', price: 16900, img: 'img/ig02.jpg',
      colors: [c('Turquesa', '#1FA7B8', 'Azul'), c('Fucsia', '#E0336B', 'Rosado'), c('Verde menta', '#4FBF9F', 'Verde')],
      desc: 'Ponchera de bordes reforzados para lavar, guardar o servir. Muy pedida para armar anchetas y regalos corporativos de temporada.',
      specs: [['Material', 'Polipropileno'], ['Capacidad', '8 litros aprox.'], ['Uso', 'Hogar, anchetas, negocio'], ['Origen', 'Hecho en Colombia']] },
    { id: 'bandeja-rectangular', name: 'Bandeja rectangular de servicio', col: 'hogar', sub: 'Cocina y mesa', price: 9900, img: 'img/ig05.jpg',
      colors: [c('Beige', '#E9D9B8', 'Beige'), c('Blanco', '#F7F7F5', 'Blanco'), c('Rojo', '#D62828', 'Rojo'), c('Verde', '#1F8A4C', 'Verde'), c('Café', '#6B4226', 'Café', true)],
      desc: 'Bandeja rectangular con fondo texturizado antideslizante. Pensada para panaderías, cafeterías y restaurantes, y para servir en casa.',
      specs: [['Material', 'Polipropileno de alto impacto'], ['Medidas', '35 × 18 cm aprox.'], ['Uso', 'Hogar y negocio'], ['Origen', 'Hecho en Colombia']] },
    { id: 'set-vasos-disco', name: 'Set ×5 vasos Colección Disco', col: 'hogar', sub: 'Vasos y mugs', price: 31900, compare: 34500, soldout: true, img: 'img/ig08.jpg',
      colors: [c('Surtido', MULTI, 'Multicolor', true)],
      desc: 'Los cinco colores de la Colección Disco en un solo set. Próximamente de nuevo en stock.',
      specs: [['Material', 'Polipropileno libre de BPA'], ['Contenido', '5 vasos'], ['Capacidad', '450 ml aprox. c/u'], ['Origen', 'Hecho en Colombia']] }
  ];
  PRODUCTS.forEach(function (p, i) { p.rank = i; });
  var FAM = { Rojo: '#D62828', Azul: '#1F6FD1', Verde: '#2EAA3F', Amarillo: '#F5C518', Naranja: '#F08A24', Rosado: '#EE7FB0', Blanco: '#F2F2EE', Beige: '#E9D9B8', Negro: '#22212B', 'Café': '#6B4226', Multicolor: MULTI };
  var pos = function (p) { return p && p.pos ? ' style="object-position:' + p.pos + '"' : ''; };
  var byId = function (id) { return PRODUCTS.filter(function (p) { return p.id === id; })[0]; };
  var inStock = function (p) { return !p.soldout && p.colors.some(function (x) { return !x.out; }); };

  var COLS = {
    todo: { t: 'Todo el catálogo', d: 'Juguetes y artículos para el hogar diseñados, moldeados e inyectados en nuestra planta.', f: function () { return true; } },
    jugueteria: { t: 'Juguetería', d: 'Triciclos, volquetas y jeeps en plástico de alto impacto. Resistentes, seguros y con diseño propio MPC.', f: function (p) { return p.col === 'jugueteria'; } },
    hogar: { t: 'Hogar & Cocina', d: 'Bowls, bandejas, herméticos, mugs y vasos para tu casa y para tu negocio.', f: function (p) { return p.col === 'hogar'; } },
    novedades: { t: 'Novedades', d: 'Lo último que salió de nuestros moldes.', f: function (p) { return p.isNew; } },
    ofertas: { t: 'Ofertas', d: 'Precios especiales por tiempo limitado.', f: function (p) { return !!p.compare; } }
  };

  /* ---------------- carrito ---------------- */
  var cart = store.get('mpc_cart', []).filter(function (l) { return byId(l.id); });
  var tier = function (q) { return q >= 50 ? 0.25 : q >= 12 ? 0.15 : 0; };
  function calc(l) {
    var p = byId(l.id), base = p.price * l.q, d = tier(l.q);
    return { p: p, base: base, d: d, total: base * (1 - d) };
  }
  function totals() {
    var sub = 0, base = 0, n = 0;
    cart.forEach(function (l) { var k = calc(l); sub += k.total; base += k.base; n += l.q; });
    return { sub: sub, save: base - sub, n: n };
  }
  function saveCart() { store.set('mpc_cart', cart); refreshCart(); }
  function addToCart(id, color, q) {
    var hit = cart.filter(function (l) { return l.id === id && l.c === color; })[0];
    if (hit) hit.q = Math.min(999, hit.q + q); else cart.push({ id: id, c: color, q: q });
    saveCart(); openDrawer('cart');
  }
  function setQty(key, q) {
    var parts = key.split('|');
    cart = cart.map(function (l) { if (l.id === parts[0] && l.c === parts[1]) l.q = q; return l; }).filter(function (l) { return l.q > 0; });
    saveCart();
  }
  function waCartLink() {
    var t = totals(), lines = cart.map(function (l) { var k = calc(l); return '• ' + l.q + ' × ' + k.p.name + ' (' + l.c + ') — ' + fmt(k.total); });
    var msg = 'Hola, quiero cotizar este pedido:\n' + lines.join('\n') + '\nSubtotal: ' + fmt(t.sub) + '\n¿Me confirman disponibilidad y envío?';
    return 'https://wa.me/' + WA + '?text=' + encodeURIComponent(msg);
  }
  function meterHTML(sub) {
    var left = FREE - sub, pct = Math.min(100, sub / FREE * 100);
    var txt = left > 0 ? 'Te faltan <b>' + fmt(left) + '</b> para el <b>envío gratis</b>' : '<b>¡Tienes envío gratis!</b>';
    return '<div class="meter">' + txt + '<div class="meter-bar"><i style="transform:scaleX(' + (pct / 100) + ')"></i></div></div>';
  }
  function linesHTML() {
    return cart.map(function (l) {
      var k = calc(l), key = esc(l.id + '|' + l.c);
      return '<div class="line-item" data-key="' + key + '">' +
        '<a href="producto.html?p=' + l.id + '"><img src="' + k.p.img + '" alt="' + esc(k.p.name) + '"' + pos(k.p) + '></a>' +
        '<div><a class="li-name" href="producto.html?p=' + l.id + '">' + esc(k.p.name) + '</a><div class="li-meta">Color: ' + esc(l.c) + ' · ' + fmt(k.p.price) + ' c/u</div>' +
        (k.d ? '<span class="li-tier">Precio por mayor −' + (k.d * 100) + '%</span>' : '') +
        '<div><span class="qty"><button type="button" data-dec aria-label="Quitar uno">' + ic('minus') + '</button><input data-qty inputmode="numeric" value="' + l.q + '" aria-label="Cantidad"><button type="button" data-inc aria-label="Agregar uno">' + ic('plus') + '</button></span>' +
        '<button type="button" class="remove" data-rm>Eliminar</button></div></div>' +
        '<div class="li-price">' + fmt(k.total) + (k.d ? '<s>' + fmt(k.base) + '</s>' : '') + '</div></div>';
    }).join('');
  }
  function emptyHTML() {
    return '<div class="empty">' + ic('bag') + '<p>Tu carrito está vacío.</p><a class="btn btn-dark" href="coleccion.html">Explorar el catálogo</a></div>';
  }
  function refreshCart() {
    var t = totals();
    $$('[data-cart-count]').forEach(function (el) { el.textContent = t.n; el.hidden = !t.n; });
    var body = $('#cartBody'), foot = $('#cartFoot');
    if (body) {
      body.innerHTML = cart.length ? meterHTML(t.sub) + linesHTML() : emptyHTML();
      foot.hidden = !cart.length;
      foot.innerHTML = '<div class="sum-row"><span>Subtotal</span><b>' + fmt(t.sub) + '</b></div>' +
        (t.save ? '<div class="sum-row" style="color:var(--ok)"><span>Ahorro por mayor</span><span>−' + fmt(t.save) + '</span></div>' : '') +
        '<p class="note" style="margin:0">Impuestos incluidos. Envío calculado al finalizar.</p>' +
        '<a class="btn btn-dark btn-block" href="checkout.html">Finalizar compra ' + ic('arrow') + '</a>' +
        '<a class="btn btn-line btn-block" href="carrito.html">Ver carrito</a>' +
        '<a class="btn btn-wa btn-block" target="_blank" rel="noopener" href="' + waCartLink() + '">Cotizar este carrito por WhatsApp</a>';
    }
    if (document.body.dataset.page === 'cart') renderCartPage();
  }
  document.addEventListener('click', function (e) {
    var li = e.target.closest('.line-item'); if (!li) return;
    var key = li.dataset.key, q = parseInt($('[data-qty]', li).value, 10) || 1;
    if (e.target.closest('[data-inc]')) setQty(key, Math.min(999, q + 1));
    else if (e.target.closest('[data-dec]')) setQty(key, q - 1);
    else if (e.target.closest('[data-rm]')) setQty(key, 0);
  });
  document.addEventListener('change', function (e) {
    if (!e.target.matches('[data-qty]')) return;
    var li = e.target.closest('.line-item'), q = Math.max(0, Math.min(999, parseInt(e.target.value, 10) || 0));
    setQty(li.dataset.key, q);
  });

  /* ---------------- UI común ---------------- */
  function toast(msg) {
    var t = $('#toast'); if (!t) return;
    t.innerHTML = ic('check') + esc(msg); t.classList.add('on');
    clearTimeout(t._h); t._h = setTimeout(function () { t.classList.remove('on'); }, 2600);
  }
  function openDrawer(which) {
    closeDrawers();
    var d = which === 'cart' ? $('#cartDrawer') : which === 'menu' ? $('#menuDrawer') : $('.facets');
    if (!d) return;
    d.classList.add('on'); $('#scrim').classList.add('on'); document.body.classList.add('lock');
  }
  function closeDrawers() {
    $$('.drawer.on, .facets.on').forEach(function (d) { d.classList.remove('on'); });
    var s = $('#scrim'); if (s) s.classList.remove('on');
    document.body.classList.remove('lock');
  }
  document.addEventListener('keydown', function (e) { if (e.key === 'Escape') closeDrawers(); });

  function megaFor(key, img, label) {
    var subs = []; PRODUCTS.forEach(function (p) { if (p.col === key && subs.indexOf(p.sub) < 0) subs.push(p.sub); });
    return '<div class="mega"><div><h4>Categorías</h4><a class="sub" href="coleccion.html?c=' + key + '">Ver todo</a>' +
      subs.map(function (s) { return '<a class="sub" href="coleccion.html?c=' + key + '&sub=' + encodeURIComponent(s) + '">' + s + '</a>'; }).join('') +
      '</div><figure><a href="coleccion.html?c=' + key + '"><img src="' + img + '" alt="" loading="lazy"></a><figcaption>' + label + '</figcaption></figure></div>';
  }
  function renderChrome() {
    var hdr = $('#hdr');
    if (hdr) {
      hdr.outerHTML =
        '<div class="announce">Envío gratis desde <b>' + fmt(FREE) + '</b> · Paga a cuotas con <b>Sistecrédito</b> y <b>Addi</b></div>' +
        '<header class="header"><div class="wrap header-row">' +
          '<div style="display:flex;align-items:center;gap:6px"><button class="tool menu-btn" data-open="menu" aria-label="Abrir menú">' + ic('menu') + '</button>' + brand() + '</div>' +
          '<nav class="nav" aria-label="Principal">' +
            '<div class="nav-item"><a class="nav-link" href="coleccion.html?c=jugueteria">Juguetería ' + ic('down') + '</a>' + megaFor('jugueteria', 'img/ig11.jpg', 'Triciclos MPC') + '</div>' +
            '<div class="nav-item"><a class="nav-link" href="coleccion.html?c=hogar">Hogar &amp; Cocina ' + ic('down') + '</a>' + megaFor('hogar', 'img/ig07.jpg', 'Nuevo: Mug Roma') + '</div>' +
            '<div class="nav-item"><a class="nav-link" href="coleccion.html?c=novedades">Novedades</a></div>' +
            '<div class="nav-item"><a class="nav-link" href="coleccion.html?c=ofertas">Ofertas</a></div>' +
            '<div class="nav-item"><a class="nav-link" href="mayoristas.html">Mayoristas</a></div>' +
          '</nav>' +
          '<div class="tools"><button class="tool" data-search aria-label="Buscar">' + ic('search') + '</button>' +
            '<button class="tool hide-sm" data-account aria-label="Mi cuenta">' + ic('user') + '</button>' +
            '<button class="tool" data-open="cart" aria-label="Carrito">' + ic('bag') + '<span class="count" data-cart-count hidden>0</span></button></div>' +
        '</div><div class="search-bar" id="searchBar"><div class="wrap"><form action="coleccion.html" role="search"><input name="q" placeholder="Busca triciclos, volquetas, vasos…" aria-label="Buscar productos"><button class="btn btn-dark" type="submit">Buscar</button></form></div></div></header>';
    }
    var ftr = $('#ftr');
    if (ftr) {
      ftr.outerHTML = '<footer class="footer"><div class="wrap"><div class="foot-grid">' +
        '<div>' + brand() + '<p>Diseñamos el molde, inyectamos la pieza y la despachamos a todo el país. Juguetes y artículos para el hogar hechos en Colombia.</p><div class="pay-row"><span>Visa</span><span>Mastercard</span><span>PSE</span><span>Nequi</span><span>Sistecrédito</span><span>Addi</span></div></div>' +
        '<div><h4>Tienda</h4><a href="coleccion.html?c=jugueteria">Juguetería</a><a href="coleccion.html?c=hogar">Hogar &amp; Cocina</a><a href="coleccion.html?c=novedades">Novedades</a><a href="coleccion.html?c=ofertas">Ofertas</a></div>' +
        '<div><h4>Empresa</h4><a href="index.html#fabrica">La fábrica</a><a href="mayoristas.html">Ventas por mayor</a><a href="https://wa.me/' + WA + '" target="_blank" rel="noopener">Contacto</a></div>' +
        '<div><h4>Ayuda</h4><a href="#">Envíos y entregas</a><a href="#">Cambios y garantías</a><a href="#">Términos y condiciones</a><a href="#">Tratamiento de datos</a></div>' +
        '</div><div class="foot-bottom"><span>© 2026 Moldes &amp; Plásticos de Colombia</span><span>Lun–Vie 7:30–17:00 · Sáb 8:00–14:00 · WhatsApp 310 225 1681</span></div></div></footer>';
    }
    var shared = document.createElement('div');
    shared.innerHTML =
      '<div class="scrim" id="scrim"></div>' +
      '<aside class="drawer right" id="cartDrawer" aria-label="Carrito"><div class="drawer-head"><h3>Tu carrito</h3><button class="tool" data-close aria-label="Cerrar">' + ic('x') + '</button></div><div class="drawer-body" id="cartBody"></div><div class="drawer-foot" id="cartFoot" hidden></div></aside>' +
      '<aside class="drawer left" id="menuDrawer" aria-label="Menú"><div class="drawer-head">' + brand() + '<button class="tool" data-close aria-label="Cerrar">' + ic('x') + '</button></div><div class="drawer-body mnav">' +
        '<details><summary>Juguetería ' + ic('down') + '</summary><a href="coleccion.html?c=jugueteria">Ver todo</a><a href="coleccion.html?c=jugueteria&sub=Montables%20y%20triciclos">Montables y triciclos</a><a href="coleccion.html?c=jugueteria&sub=Carros%20y%20volquetas">Carros y volquetas</a></details>' +
        '<details><summary>Hogar &amp; Cocina ' + ic('down') + '</summary><a href="coleccion.html?c=hogar">Ver todo</a><a href="coleccion.html?c=hogar&sub=Cocina%20y%20mesa">Cocina y mesa</a><a href="coleccion.html?c=hogar&sub=Vasos%20y%20mugs">Vasos y mugs</a><a href="coleccion.html?c=hogar&sub=Organizaci%C3%B3n">Organización</a></details>' +
        '<a href="coleccion.html?c=novedades">Novedades ' + ic('right') + '</a><a href="coleccion.html?c=ofertas">Ofertas ' + ic('right') + '</a><a href="mayoristas.html">Mayoristas ' + ic('right') + '</a>' +
      '</div></aside>' +
      '<div class="toast" id="toast" role="status"></div>' +
      (document.body.dataset.page === 'checkout' ? '' : '<a class="wa-float" href="https://wa.me/' + WA + '?text=' + encodeURIComponent('Hola, vengo de la tienda en línea y quiero más información.') + '" target="_blank" rel="noopener" aria-label="Escríbenos por WhatsApp">' + WA_SVG + '</a>');
    while (shared.firstChild) document.body.appendChild(shared.firstChild);

    document.addEventListener('click', function (e) {
      var o = e.target.closest('[data-open]');
      if (o) { e.preventDefault(); openDrawer(o.dataset.open); return; }
      if (e.target.closest('[data-close]') || e.target.id === 'scrim') { closeDrawers(); return; }
      if (e.target.closest('[data-search]')) { var sb = $('#searchBar'); sb.classList.toggle('open'); if (sb.classList.contains('open')) $('input', sb).focus(); return; }
      if (e.target.closest('[data-account]')) { toast('Las cuentas de cliente se activan en la versión Shopify'); return; }
      var add = e.target.closest('[data-add]');
      if (add && !add.disabled) { e.preventDefault(); addToCart(add.dataset.add, add.dataset.color, 1); }
    });
    refreshCart();
  }

  /* ---------------- tarjeta de producto ---------------- */
  function card(p) {
    var first = p.colors.filter(function (x) { return !x.out; })[0], ok = inStock(p);
    var badges = (!ok ? '<span class="badge out">Agotado</span>' : '') +
      (ok && p.compare ? '<span class="badge sale">−' + Math.round((1 - p.price / p.compare) * 100) + '%</span>' : '') +
      (p.isNew ? '<span class="badge new">Nuevo</span>' : '');
    var sw = p.colors.slice(0, 5).map(function (x) { return '<span class="swatch" title="' + esc(x.n) + '" style="background:' + x.h + '"></span>'; }).join('') +
      '<small>' + (p.colors.length > 1 ? p.colors.length + ' colores' : esc(p.colors[0].n)) + '</small>';
    return '<article class="card"><a class="card-media" href="producto.html?p=' + p.id + '"><img src="' + p.img + '" alt="' + esc(p.name) + '" loading="lazy"' + pos(p) + '><span class="badges">' + badges + '</span></a>' +
      (ok ? '<button class="card-add" data-add="' + p.id + '" data-color="' + esc(first.n) + '" aria-label="Agregar ' + esc(p.name) + ' al carrito">' + ic('bag') + '<span class="lbl">Agregar al carrito</span></button>'
          : '<button class="card-add" disabled>' + ic('clock') + '<span class="lbl">Próximamente</span></button>') +
      '<div class="card-info"><div class="swatches">' + sw + '</div><a class="card-title" href="producto.html?p=' + p.id + '">' + esc(p.name) + '</a><div class="card-sub">' + esc(p.sub) + '</div>' +
      '<div class="price"><b' + (p.compare ? ' class="sale"' : '') + '>' + fmt(p.price) + '</b>' + (p.compare ? '<s>' + fmt(p.compare) + '</s>' : '') + '</div></div></article>';
  }

  /* ---------------- páginas ---------------- */
  function initSlider(root) {
    if (!root) return;
    var slides = $$('.slide', root), dots = $('.dots', root), i = 0, timer = null, x0 = null;
    var reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
    dots.innerHTML = slides.map(function (_, n) { return '<button type="button" aria-label="Ir a la diapositiva ' + (n + 1) + '"></button>'; }).join('');
    function go(n) {
      i = (n + slides.length) % slides.length;
      slides.forEach(function (s, k) {
        var on = k === i;
        s.classList.toggle('on', on); s.setAttribute('aria-hidden', on ? 'false' : 'true');
        $$('.cap-card a', s).forEach(function (a) { a.tabIndex = on ? 0 : -1; });
      });
      $$('button', dots).forEach(function (d, k) { d.classList.toggle('on', k === i); d.setAttribute('aria-current', k === i ? 'true' : 'false'); });
    }
    function stop() { clearInterval(timer); timer = null; }
    function play() { if (reduce || slides.length < 2) return; stop(); timer = setInterval(function () { go(i + 1); }, 6500); }
    $('.prev', root).addEventListener('click', function () { go(i - 1); play(); });
    $('.next', root).addEventListener('click', function () { go(i + 1); play(); });
    dots.addEventListener('click', function (e) { var b = e.target.closest('button'); if (b) { go($$('button', dots).indexOf(b)); play(); } });
    root.addEventListener('mouseenter', stop); root.addEventListener('mouseleave', play);
    root.addEventListener('focusin', stop); root.addEventListener('focusout', play);
    root.addEventListener('touchstart', function (e) { x0 = e.touches[0].clientX; stop(); }, { passive: true });
    root.addEventListener('touchend', function (e) {
      if (x0 === null) return;
      var dx = e.changedTouches[0].clientX - x0; x0 = null;
      if (Math.abs(dx) > 40) go(i + (dx < 0 ? 1 : -1));
      play();
    });
    document.addEventListener('visibilitychange', function () { if (document.hidden) stop(); else play(); });
    go(0); play();
  }

  function pageHome() {
    initSlider($('#heroSlider'));
    $$('[data-row]').forEach(function (row) {
      row.innerHTML = row.dataset.row.split(',').map(function (id) { return card(byId(id)); }).join('');
    });
    var f = $('#newsForm');
    if (f) f.addEventListener('submit', function (e) { e.preventDefault(); f.outerHTML = '<p class="ok">¡Listo! Te enviaremos novedades y tu cupón de bienvenida.</p>'; });
  }

  function pageCollection() {
    var key = COLS[qs.get('c')] ? qs.get('c') : 'todo', q = (qs.get('q') || '').trim();
    var base = q ? PRODUCTS.filter(function (p) { return norm(p.name + ' ' + p.sub + ' ' + COLS[p.col].t).indexOf(norm(q)) >= 0; }) : PRODUCTS.filter(COLS[key].f);
    var st = { subs: [], avail: false, min: '', max: '', fams: [], sort: 'best', cols: store.get('mpc_cols', 4) };
    if (qs.get('sub')) st.subs.push(qs.get('sub'));

    $('#colTitle').textContent = q ? 'Resultados para “' + q + '”' : COLS[key].t;
    $('#colDesc').textContent = q ? base.length + ' producto(s) encontrados.' : COLS[key].d;
    $('#crumbHere').textContent = q ? 'Búsqueda' : COLS[key].t;
    document.title = (q ? 'Búsqueda' : COLS[key].t) + ' — Moldes & Plásticos de Colombia';
    $('#pills').innerHTML = ['todo', 'jugueteria', 'hogar', 'novedades', 'ofertas'].map(function (k) {
      return '<a class="pill' + (!q && k === key ? ' on' : '') + '" href="coleccion.html?c=' + k + '">' + COLS[k].t.replace('Todo el catálogo', 'Todo') + '</a>';
    }).join('');

    var subs = [], fams = [];
    base.forEach(function (p) {
      if (subs.indexOf(p.sub) < 0) subs.push(p.sub);
      p.colors.forEach(function (x) { if (fams.indexOf(x.f) < 0) fams.push(x.f); });
    });
    var cnt = function (fn) { return base.filter(fn).length; };
    $('#facetBody').innerHTML =
      '<details class="facet" open><summary>Categoría ' + ic('down') + '</summary><div class="facet-body">' +
        subs.map(function (s) { return '<label class="check"><input type="checkbox" data-f="sub" value="' + esc(s) + '"' + (st.subs.indexOf(s) >= 0 ? ' checked' : '') + '>' + esc(s) + '<em>' + cnt(function (p) { return p.sub === s; }) + '</em></label>'; }).join('') +
      '</div></details>' +
      '<details class="facet" open><summary>Disponibilidad ' + ic('down') + '</summary><div class="facet-body"><label class="check"><input type="checkbox" data-f="avail">En stock<em>' + cnt(inStock) + '</em></label></div></details>' +
      '<details class="facet" open><summary>Precio ' + ic('down') + '</summary><div class="facet-body"><div class="price-range"><input type="number" inputmode="numeric" placeholder="Mín" data-f="min" aria-label="Precio mínimo"><span>–</span><input type="number" inputmode="numeric" placeholder="Máx" data-f="max" aria-label="Precio máximo"></div></div></details>' +
      '<details class="facet" open><summary>Color ' + ic('down') + '</summary><div class="facet-body"><div class="color-facets">' +
        fams.map(function (f) { return '<label title="' + f + '"><input type="checkbox" data-f="fam" value="' + f + '"><span style="background:' + FAM[f] + '"></span><b class="sr">' + f + '</b></label>'; }).join('') +
      '</div></div></details>';

    function apply() {
      var list = base.filter(function (p) {
        if (st.subs.length && st.subs.indexOf(p.sub) < 0) return false;
        if (st.avail && !inStock(p)) return false;
        if (st.min !== '' && p.price < +st.min) return false;
        if (st.max !== '' && p.price > +st.max) return false;
        if (st.fams.length && !p.colors.some(function (x) { return st.fams.indexOf(x.f) >= 0; })) return false;
        return true;
      });
      var s = {
        best: function (a, b) { return a.rank - b.rank; },
        new: function (a, b) { return (b.isNew ? 1 : 0) - (a.isNew ? 1 : 0) || a.rank - b.rank; },
        asc: function (a, b) { return a.price - b.price; },
        desc: function (a, b) { return b.price - a.price; },
        az: function (a, b) { return a.name.localeCompare(b.name, 'es'); },
        za: function (a, b) { return b.name.localeCompare(a.name, 'es'); }
      }[st.sort];
      list.sort(s);
      var grid = $('#grid');
      grid.className = 'grid' + (st.cols === 3 ? ' cols-3' : '');
      grid.innerHTML = list.length ? list.map(card).join('') : '<div class="no-results"><p>No hay productos con esos filtros.</p><button class="btn btn-line" data-clear>Limpiar filtros</button></div>';
      $('#countTxt').textContent = list.length + (list.length === 1 ? ' producto' : ' productos');
      var chips = st.subs.map(function (v) { return ['sub', v, v]; })
        .concat(st.avail ? [['avail', '', 'En stock']] : [])
        .concat(st.min !== '' ? [['min', '', 'Desde ' + fmt(+st.min)]] : [])
        .concat(st.max !== '' ? [['max', '', 'Hasta ' + fmt(+st.max)]] : [])
        .concat(st.fams.map(function (v) { return ['fam', v, v]; }));
      $('#chips').innerHTML = chips.map(function (ch) { return '<button class="chip" data-chip="' + ch[0] + '" data-v="' + esc(ch[1]) + '">' + esc(ch[2]) + ic('x') + '</button>'; }).join('') +
        (chips.length ? '<button class="chip" data-clear style="text-decoration:underline;background:none">Limpiar todo</button>' : '');
      $$('.density button').forEach(function (b) { b.classList.toggle('on', +b.dataset.cols === st.cols); });
    }
    function sync() {
      $$('[data-f="sub"]').forEach(function (i) { i.checked = st.subs.indexOf(i.value) >= 0; });
      $$('[data-f="fam"]').forEach(function (i) { i.checked = st.fams.indexOf(i.value) >= 0; });
      $('[data-f="avail"]').checked = st.avail; $('[data-f="min"]').value = st.min; $('[data-f="max"]').value = st.max;
    }
    var toggle = function (arr, v, on) { var i = arr.indexOf(v); if (on && i < 0) arr.push(v); if (!on && i >= 0) arr.splice(i, 1); };
    $('#facetBody').addEventListener('change', function (e) {
      var f = e.target.dataset.f; if (!f) return;
      if (f === 'sub') toggle(st.subs, e.target.value, e.target.checked);
      else if (f === 'fam') toggle(st.fams, e.target.value, e.target.checked);
      else if (f === 'avail') st.avail = e.target.checked;
      else st[f] = e.target.value === '' ? '' : Math.max(0, +e.target.value);
      apply();
    });
    $('#sort').addEventListener('change', function (e) { st.sort = e.target.value; apply(); });
    document.addEventListener('click', function (e) {
      var d = e.target.closest('.density button');
      if (d) { st.cols = +d.dataset.cols; store.set('mpc_cols', st.cols); apply(); return; }
      var ch = e.target.closest('[data-chip]');
      if (ch) {
        var t = ch.dataset.chip, v = ch.dataset.v;
        if (t === 'sub') toggle(st.subs, v, false); else if (t === 'fam') toggle(st.fams, v, false); else if (t === 'avail') st.avail = false; else st[t] = '';
        sync(); apply(); return;
      }
      if (e.target.closest('[data-clear]')) { st.subs = []; st.fams = []; st.avail = false; st.min = ''; st.max = ''; sync(); apply(); return; }
      if (e.target.closest('[data-filters]')) { openDrawer('facets'); }
    });
    apply();
  }

  function pageProduct() {
    var p = byId(qs.get('p')) || PRODUCTS[0];
    var color = p.colors.filter(function (x) { return !x.out; })[0] || p.colors[0], qty = 1;
    document.title = p.name + ' — Moldes & Plásticos de Colombia';
    var seen = store.get('mpc_seen', []).filter(function (id) { return id !== p.id && byId(id); });
    store.set('mpc_seen', [p.id].concat(seen).slice(0, 8));

    $('#crumbCol').textContent = COLS[p.col].t; $('#crumbCol').href = 'coleccion.html?c=' + p.col;
    $('#crumbHere').textContent = p.name;
    var off = p.compare ? Math.round((1 - p.price / p.compare) * 100) : 0;
    $('#pdp').innerHTML =
      '<div class="gallery single"><div class="main-media"><img src="' + p.img + '" alt="' + esc(p.name) + '"' + pos(p) + '><span class="badges">' +
        (p.soldout ? '<span class="badge out">Agotado</span>' : off ? '<span class="badge sale">−' + off + '%</span>' : '') + (p.isNew ? '<span class="badge new">Nuevo</span>' : '') + '</span></div></div>' +
      '<div class="info"><div class="vendor">Moldes &amp; Plásticos · ' + esc(p.sub) + '</div><h1>' + esc(p.name) + '</h1>' +
        '<div class="price"><b' + (p.compare ? ' class="sale"' : '') + '>' + fmt(p.price) + '</b>' + (p.compare ? '<s>' + fmt(p.compare) + '</s>' : '') + '</div>' +
        '<p class="installments">o 4 cuotas de <b>' + fmt(p.price / 4) + '</b> con Sistecrédito o Addi · IVA incluido</p>' +
        '<div class="opt"><div class="opt-label">Color: <span id="colorName"></span></div><div class="color-opts">' +
          p.colors.map(function (x, i) { return '<button type="button" class="color-opt' + (x.out ? ' out' : '') + '" data-ci="' + i + '" style="background:' + x.h + '" aria-label="' + esc(x.n) + (x.out ? ' (agotado)' : '') + '" title="' + esc(x.n) + '"></button>'; }).join('') +
        '</div></div>' +
        '<div class="buy"><span class="qty"><button type="button" id="qMinus" aria-label="Quitar uno">' + ic('minus') + '</button><input id="qInput" inputmode="numeric" value="1" aria-label="Cantidad"><button type="button" id="qPlus" aria-label="Agregar uno">' + ic('plus') + '</button></span>' +
          '<button class="btn btn-dark" id="addBtn">Agregar al carrito</button><button class="btn btn-line" id="buyNow">Comprar ahora</button></div>' +
        '<div class="stock" id="stock"></div>' +
        '<div class="whole"><h3>' + ic('box') + 'Precio por mayor</h3><table><tbody>' +
          '<tr data-t="1"><td>1 a 11 unidades</td><td>' + fmt(p.price) + ' c/u</td></tr>' +
          '<tr data-t="12"><td>12 a 49 unidades (−15%)</td><td>' + fmt(p.price * 0.85) + ' c/u</td></tr>' +
          '<tr data-t="50"><td>50 o más unidades (−25%)</td><td>' + fmt(p.price * 0.75) + ' c/u</td></tr>' +
          '<tr><td>Más de 500 unidades</td><td>Cotización directa</td></tr>' +
        '</tbody></table><a class="btn btn-wa btn-block" id="waQuote" target="_blank" rel="noopener">Cotizar por WhatsApp</a></div>' +
        '<div class="acc"><details open><summary>Descripción ' + ic('plus') + '</summary><div class="acc-body"><p style="margin:0">' + esc(p.desc) + '</p></div></details>' +
          '<details><summary>Especificaciones ' + ic('plus') + '</summary><div class="acc-body"><dl class="spec">' + p.specs.map(function (s) { return '<dt>' + s[0] + '</dt><dd>' + s[1] + '</dd>'; }).join('') + '</dl></div></details>' +
          '<details><summary>Envíos y cambios ' + ic('plus') + '</summary><div class="acc-body"><ul><li>Envío a toda Colombia en 3 a 5 días hábiles.</li><li>Envío gratis en compras desde ' + fmt(FREE) + '.</li><li>Cambios por defectos de fabricación dentro de los 30 días.</li><li>También puedes recoger en planta sin costo.</li></ul></div></details></div>' +
      '</div>';

    function update() {
      $('#colorName').textContent = color.n + (color.out ? ' — agotado' : '');
      $$('.color-opt').forEach(function (b) { b.classList.toggle('on', p.colors[+b.dataset.ci] === color); });
      var can = !p.soldout && !color.out;
      $('#addBtn').disabled = !can; $('#buyNow').disabled = !can;
      $('#addBtn').textContent = can ? 'Agregar al carrito · ' + fmt(p.price * qty * (1 - tier(qty))) : 'Agotado';
      var s = $('#stock'); s.className = 'stock' + (can ? '' : ' out');
      s.innerHTML = '<i></i>' + (can ? 'En stock · despacho en 24 h hábiles' : p.soldout ? 'Agotado · vuelve pronto' : 'Agotado en este color');
      var t = qty >= 50 ? '50' : qty >= 12 ? '12' : '1';
      $$('.whole tr').forEach(function (r) { r.classList.toggle('on', r.dataset.t === t); });
      $('#waQuote').href = 'https://wa.me/' + WA + '?text=' + encodeURIComponent('Hola, quiero cotizar ' + qty + ' unidad(es) de ' + p.name + ' en color ' + color.n + '. ¿Me comparten precio por mayor y tiempo de entrega?');
    }
    $('.color-opts').addEventListener('click', function (e) { var b = e.target.closest('.color-opt'); if (b) { color = p.colors[+b.dataset.ci]; update(); } });
    var setQ = function (v) { qty = Math.max(1, Math.min(999, v || 1)); $('#qInput').value = qty; update(); };
    $('#qMinus').onclick = function () { setQ(qty - 1); };
    $('#qPlus').onclick = function () { setQ(qty + 1); };
    $('#qInput').onchange = function () { setQ(parseInt(this.value, 10)); };
    $('#addBtn').onclick = function () { addToCart(p.id, color.n, qty); };
    $('#buyNow').onclick = function () { cart = cart.filter(function (l) { return !(l.id === p.id && l.c === color.n); }); cart.push({ id: p.id, c: color.n, q: qty }); store.set('mpc_cart', cart); location.href = 'checkout.html'; };
    update();

    var rel = PRODUCTS.filter(function (x) { return x.col === p.col && x.id !== p.id; }).slice(0, 4);
    $('#related').innerHTML = rel.map(card).join('');
    var rv = seen.slice(0, 4).map(byId);
    if (rv.length) { $('#seenSec').hidden = false; $('#seen').innerHTML = rv.map(card).join(''); }
  }

  function renderCartPage() {
    var el = $('#cartPage'); if (!el) return;
    var t = totals();
    if (!cart.length) { el.innerHTML = '<div style="grid-column:1/-1">' + emptyHTML() + '</div>'; return; }
    el.innerHTML = '<div>' + meterHTML(t.sub) + linesHTML() + '<p style="margin-top:22px"><a class="link" href="coleccion.html">Seguir comprando</a></p></div>' +
      '<aside class="panel"><h3>Resumen</h3><div class="sum-row"><span>Productos (' + t.n + ')</span><span>' + fmt(t.sub + t.save) + '</span></div>' +
      (t.save ? '<div class="sum-row" style="color:var(--ok)"><span>Descuento por mayor</span><span>−' + fmt(t.save) + '</span></div>' : '') +
      '<div class="sum-row"><span>Envío</span><span>' + (t.sub >= FREE ? 'Gratis' : 'Desde ' + fmt(SHIP)) + '</span></div>' +
      '<div class="sum-row total"><span>Subtotal</span><span>' + fmt(t.sub) + '</span></div>' +
      '<a class="btn btn-dark btn-block" href="checkout.html">Finalizar compra ' + ic('arrow') + '</a>' +
      '<a class="btn btn-wa btn-block" target="_blank" rel="noopener" href="' + waCartLink() + '">Cotizar por WhatsApp</a>' +
      '<p class="note" style="margin:0">Desde 12 unidades por referencia se aplica precio por mayor automáticamente.</p></aside>';
  }

  var DEPTOS = ['Amazonas', 'Antioquia', 'Arauca', 'Atlántico', 'Bogotá D.C.', 'Bolívar', 'Boyacá', 'Caldas', 'Caquetá', 'Casanare', 'Cauca', 'Cesar', 'Chocó', 'Córdoba', 'Cundinamarca', 'Guainía', 'Guaviare', 'Huila', 'La Guajira', 'Magdalena', 'Meta', 'Nariño', 'Norte de Santander', 'Putumayo', 'Quindío', 'Risaralda', 'San Andrés y Providencia', 'Santander', 'Sucre', 'Tolima', 'Valle del Cauca', 'Vaupés', 'Vichada'];

  function pageCheckout() {
    if (!cart.length) {
      $('#co').innerHTML = '<div class="wrap" style="grid-column:1/-1">' + emptyHTML() + '</div>'; return;
    }
    $('#dep').innerHTML = '<option value="">Selecciona…</option>' + DEPTOS.map(function (d) { return '<option>' + d + '</option>'; }).join('');
    var shipCost = function () {
      var m = ($('input[name=ship]:checked') || {}).value, sub = totals().sub;
      return m === 'exp' ? EXPRESS : m === 'pick' ? 0 : (sub >= FREE ? 0 : SHIP);
    };
    function summary() {
      var t = totals(), s = shipCost();
      $('#stdPrice').textContent = t.sub >= FREE ? 'Gratis' : fmt(SHIP);
      $('#coLines').innerHTML = cart.map(function (l) {
        var k = calc(l);
        return '<div class="mini-line"><div class="ph"><img src="' + k.p.img + '" alt=""' + pos(k.p) + '><span class="q">' + l.q + '</span></div><div><div class="n">' + esc(k.p.name) + '</div><div class="v">' + esc(l.c) + (k.d ? ' · por mayor −' + k.d * 100 + '%' : '') + '</div></div><div class="p">' + fmt(k.total) + '</div></div>';
      }).join('');
      $('#coTotals').innerHTML = '<div class="sum-row"><span>Subtotal</span><span>' + fmt(t.sub) + '</span></div>' +
        (t.save ? '<div class="sum-row" style="color:var(--ok)"><span>Ahorro por mayor</span><span>−' + fmt(t.save) + '</span></div>' : '') +
        '<div class="sum-row"><span>Envío</span><span>' + (s ? fmt(s) : 'Gratis') + '</span></div>' +
        '<div class="sum-row total"><span>Total</span><span>COP ' + fmt(t.sub + s) + '</span></div>';
      $('#payBtn').innerHTML = ic('lock') + 'Pagar ' + fmt(t.sub + s);
    }
    $('#coForm').addEventListener('change', summary);
    summary();

    var rules = {
      email: function (v) { return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(v); },
      phone: function (v) { return /^3\d{9}$/.test(v.replace(/\D/g, '')); }
    };
    $('#coForm').addEventListener('submit', function (e) {
      e.preventDefault();
      var bad = null;
      $$('[required]', this).forEach(function (f) {
        var v = f.value.trim(), ok = v !== '' && (!rules[f.dataset.rule] || rules[f.dataset.rule](v));
        f.classList.toggle('bad', !ok); if (!ok && !bad) bad = f;
      });
      if (bad) { bad.focus(); return; }
      var t = totals(), s = shipCost(), fd = new FormData(this);
      var order = {
        no: 'MPC-' + (1000 + Math.floor(Math.random() * 9000)),
        email: fd.get('email'), name: fd.get('first') + ' ' + fd.get('last'),
        addr: fd.get('addr') + ', ' + fd.get('city') + ', ' + fd.get('dep'),
        ship: $('input[name=ship]:checked').dataset.label, pay: $('input[name=pay]:checked').dataset.label,
        lines: cart.map(function (l) { var k = calc(l); return { n: k.p.name, c: l.c, q: l.q, t: k.total, img: k.p.img, pos: k.p.pos }; }),
        sub: t.sub, shipCost: s, total: t.sub + s
      };
      store.set('mpc_order', order); cart = []; store.set('mpc_cart', cart);
      location.href = 'confirmacion.html';
    });
    ['input', 'change'].forEach(function (ev) { $('#coForm').addEventListener(ev, function (e) { e.target.classList.remove('bad'); }); });
  }

  function pageConfirm() {
    var o = store.get('mpc_order', null), el = $('#confirm');
    if (!o) { el.innerHTML = '<h1>No encontramos un pedido reciente</h1><p><a class="btn btn-dark" href="coleccion.html">Ir al catálogo</a></p>'; return; }
    el.innerHTML = '<div class="ok-ico">' + ic('check') + '</div><h1>¡Gracias por tu compra, ' + esc(o.name.split(' ')[0]) + '!</h1>' +
      '<div class="order-no">Pedido ' + o.no + '</div><p>Enviamos la confirmación a <b>' + esc(o.email) + '</b>. Te avisaremos por WhatsApp cuando tu pedido salga de planta.</p>' +
      '<div class="confirm-box">' + o.lines.map(function (l) { return '<div class="mini-line"><div class="ph"><img src="' + l.img + '" alt=""' + pos(l) + '><span class="q">' + l.q + '</span></div><div><div class="n">' + esc(l.n) + '</div><div class="v">' + esc(l.c) + '</div></div><div class="p">' + fmt(l.t) + '</div></div>'; }).join('') +
      '<div class="totals"><div class="sum-row"><span>Subtotal</span><span>' + fmt(o.sub) + '</span></div><div class="sum-row"><span>Envío · ' + esc(o.ship) + '</span><span>' + (o.shipCost ? fmt(o.shipCost) : 'Gratis') + '</span></div>' +
      '<div class="sum-row total"><span>Total</span><span>' + fmt(o.total) + '</span></div></div>' +
      '<div class="totals"><div class="sum-row"><span>Entrega</span><span style="text-align:right">' + esc(o.addr) + '</span></div><div class="sum-row"><span>Pago</span><span>' + esc(o.pay) + '</span></div></div></div>' +
      '<div style="display:flex;gap:12px;justify-content:center;flex-wrap:wrap"><a class="btn btn-dark" href="coleccion.html">Seguir comprando</a>' +
      '<a class="btn btn-wa" target="_blank" rel="noopener" href="https://wa.me/' + WA + '?text=' + encodeURIComponent('Hola, hice el pedido ' + o.no + ' en la tienda en línea.') + '">Seguir mi pedido por WhatsApp</a></div>';
  }

  function pageWholesale() {
    var f = $('#wForm');
    f.addEventListener('submit', function (e) {
      e.preventDefault();
      var d = new FormData(f), bad = null;
      $$('[required]', f).forEach(function (x) { var ok = x.value.trim() !== ''; x.classList.toggle('bad', !ok); if (!ok && !bad) bad = x; });
      if (bad) { bad.focus(); return; }
      var msg = 'Hola, quiero la lista de precios por mayor.\nEmpresa: ' + d.get('biz') + '\nNombre: ' + d.get('name') + '\nCiudad: ' + d.get('city') + '\nTipo de negocio: ' + d.get('type') + '\nLíneas de interés: ' + d.get('line') + (d.get('note') ? '\nComentario: ' + d.get('note') : '');
      window.open('https://wa.me/' + WA + '?text=' + encodeURIComponent(msg), '_blank', 'noopener');
    });
  }

  /* ---------------- arranque ---------------- */
  renderChrome();
  ({ home: pageHome, collection: pageCollection, product: pageProduct, cart: renderCartPage, checkout: pageCheckout, confirm: pageConfirm, wholesale: pageWholesale }[document.body.dataset.page] || function () {})();
})();
