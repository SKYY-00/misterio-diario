/* Misterio diario v11 — lógica de la aplicación (menú, tutorial, expediente, tablero, packs temáticos, libreta del detective) */
(function () {
  'use strict';
  var M = window.Misterio, N = M.N, MAX_LIVES = 3, DIFFS = M.DIFFS, ORDER = M.DIFF_ORDER;
  var $ = function (id) { return document.getElementById(id); };
  var pad = function (n) { return String(n).padStart(2, '0'); };
  var fmt = function (d) { return d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()); };
  var today = fmt(new Date());
  var q = new URLSearchParams(location.search).get('fecha');
  var date = /^\d{4}-\d{2}-\d{2}$/.test(q || '') ? q : today;
  var baseTh = M.dayTheme(date);                    // escenario, situación y reparto del día: iguales para las 3 dificultades
  var th = (function () { var t = {}, k; for (k in baseTh) t[k] = baseTh[k]; t.suspects = baseTh.suspects.slice(0, 5); t.places = baseTh.places.slice(0, 5); t.weapons = baseTh.weapons.slice(0, 5); return t; })();   // (cada caso trae su propia selección: cs.th)
  var HUES = [28, 205, 335, 140, 268];

  /* ---------- almacenamiento (puede fallar en algunos contextos) ---------- */
  var KEY = 'misterio7:', OLD = 'misterio5:';   // v7 cambia los casos: el progreso antiguo no vale, pero se conservan tutorial, racha y dificultad elegida
  function load(k) {
    try {
      var v = localStorage.getItem(KEY + k);
      if (v === null && (k === 'tut' || k === 'stats' || k === 'diff')) v = localStorage.getItem(OLD + k);
      return JSON.parse(v);
    } catch (e) { return null; }
  }
  function save(k, v) { try { localStorage.setItem(KEY + k, JSON.stringify(v)); } catch (e) {} }
  function legacyStats() { try { return JSON.parse(localStorage.getItem('misterio3:stats')); } catch (e) { return null; } }
  var zeros = function () { var r = [], i, j; for (i = 0; i < N; i++) { r.push([]); for (j = 0; j < N; j++) r[i].push(0); } return r; };
  var stats = load('stats') || legacyStats() || { streak: 0, last: null };
  (function migratePackOrder() {   // v12: el reparto de cada capítulo se reordenó; las marcas guardadas de los packs ya no coinciden
    try {
      if (load('packord')) return;
      var ks = [], i, k;
      for (i = 0; i < localStorage.length; i++) { k = localStorage.key(i); if (k && k.indexOf(KEY + 'pk:') === 0) ks.push(k.slice(KEY.length)); }
      ks.forEach(function (key) {
        var g = load(key);
        localStorage.removeItem(KEY + 'marks:' + key); localStorage.removeItem(KEY + 'used:' + key);
        if (g && !g.solved) { g.wrong = []; g.lupa = false; save(key, g); }
      });
      save('packord', 1);
    } catch (e) {}
  })();
  var tutDone = !!load('tut');
  var bests = load('best') || {};            // mejor tiempo por dificultad
  var diff = load('diff'); if (!DIFFS[diff]) diff = 'normal';
  var cache = {}, pcache = {}, cs, K, game, marks, used, secs, cp, cw, fresh = null, cdate = date, hist = [];
  var ctx = { kind: 'daily' }, cdiff = diff;      // ctx: qué caso está cargado (el de hoy o un expediente de pack) · cdiff: su dificultad
  var keyOf = function (d) { return cdate + (d === 'normal' ? '' : '~' + d); };   // progreso separado por dificultad
  var pkKey = function (id, i, d) { return 'pk:' + id + ':' + i + '~' + d; };
  var caseKey = function (d) { return ctx.kind === 'pack' ? pkKey(ctx.pack, ctx.idx, d) : keyOf(d); };
  var caseOf = function (d) {
    if (ctx.kind === 'pack') { var k = pkKey(ctx.pack, ctx.idx, d); return pcache[k] || (pcache[k] = M.generatePack(ctx.pack, ctx.idx, d)); }
    return cache[cdate + d] || (cache[cdate + d] = M.generate(cdate, d));
  };
  var curPack = 'baker', pdiff = load('pdiff'); if (!DIFFS[pdiff]) pdiff = 'normal';
  function PK() { return M.packById(curView === 'pack' || curView === 'packs' || ctx.kind !== 'pack' ? curPack : ctx.pack); }
  function setHue(h) { document.documentElement.style.setProperty('--h', h); }
  var over = function () { return game.solved || game.failed; };

  setHue(th.hue);

  /* ---------- utilidades ---------- */
  function dust(el, n) {
    for (var i = 0; i < n; i++) {
      var d = document.createElement('i'), sz = 2 + Math.random() * 3;
      d.style.cssText = 'left:' + (Math.random() * 100) + '%;width:' + sz + 'px;height:' + sz + 'px;animation-duration:' + (7 + Math.random() * 9) + 's;animation-delay:-' + (Math.random() * 12) + 's';
      el.appendChild(d);
    }
  }
  function toast(msg, info, ms) {
    document.querySelectorAll('.toast').forEach(function (t) { t.remove(); });
    var t = document.createElement('div'); t.className = 'toast' + (info ? ' info' : ''); t.textContent = msg; document.body.appendChild(t);
    setTimeout(function () { t.remove(); }, ms || 2800);
  }
  /* ---------- ajustes, sonido y vibración ---------- */
  var set = (function () { var s = load('set') || {}; return { snd: s.snd !== false, vib: s.vib !== false, big: !!s.big, calm: !!s.calm }; })();
  function applySet() { document.documentElement.classList.toggle('big', set.big); document.documentElement.classList.toggle('calm', set.calm); }
  applySet();
  function buzz(ms) { if (!set.vib) return; try { if (navigator.vibrate) navigator.vibrate(ms); } catch (e) {} }
  var AC = null;
  function tone(f, t0, d, type, vol, f2) {       // un tono corto con envolvente suave (sin archivos de audio: todo se sintetiza)
    var o = AC.createOscillator(), g = AC.createGain(), t = AC.currentTime + t0;
    o.type = type || 'sine'; o.frequency.setValueAtTime(f, t); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t + d);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(vol || 0.05, t + 0.012); g.gain.exponentialRampToValueAtTime(0.0001, t + d);
    o.connect(g); g.connect(AC.destination); o.start(t); o.stop(t + d + 0.03);
  }
  function thud(t0) {                            // golpe de sello: ruido grave breve
    var len = Math.floor(AC.sampleRate * 0.16), buf = AC.createBuffer(1, len, AC.sampleRate), d = buf.getChannelData(0), i;
    for (i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / len, 3);
    var s = AC.createBufferSource(), g = AC.createGain(), f = AC.createBiquadFilter(); f.type = 'lowpass'; f.frequency.value = 380;
    s.buffer = buf; g.gain.value = 0.35; s.connect(f); f.connect(g); g.connect(AC.destination); s.start(AC.currentTime + t0);
    tone(95, t0, 0.18, 'sine', 0.12, 50);
  }
  function sfx(k) {
    if (!set.snd) return;
    try {
      AC = AC || new (window.AudioContext || window.webkitAudioContext)(); if (AC.state === 'suspended') AC.resume();
      if (k === 'x') tone(210, 0, 0.07, 'triangle', 0.05, 150);
      else if (k === 'ok') { tone(520, 0, 0.09, 'triangle', 0.05); tone(780, 0.07, 0.12, 'triangle', 0.045); }
      else if (k === 'clr') tone(170, 0, 0.06, 'triangle', 0.035);
      else if (k === 'wrong') { tone(220, 0, 0.3, 'sawtooth', 0.045, 105); tone(165, 0.05, 0.3, 'sawtooth', 0.03, 80); }
      else if (k === 'win') { thud(0); [392, 494, 587, 784].forEach(function (f, i) { tone(f, 0.22 + i * 0.1, 0.45, 'triangle', 0.05); }); }
      else if (k === 'lose') { thud(0); [294, 277, 247, 196].forEach(function (f, i) { tone(f, 0.2 + i * 0.16, 0.5, 'sine', 0.05); }); }
      else if (k === 'lupa') { tone(880, 0, 0.35, 'sine', 0.04); tone(1318, 0.09, 0.4, 'sine', 0.03); tone(1760, 0.18, 0.4, 'sine', 0.02); }
      else if (k === 'page') tone(300, 0, 0.05, 'sine', 0.02, 220);
    } catch (e) {}
  }
  function mmss(s) { return Math.floor(s / 60) + ':' + pad(s % 60); }
  function prevDay(ds) { var d = new Date(ds + 'T12:00:00'); d.setDate(d.getDate() - 1); return fmt(d); }
  var seed = M.caseNumber(date) * 31 + th.hue;   // (se recalcula en cada caso)

  /* ---------- vistas ---------- */
  var VIEWS = { arch: $('vArch'), menu: $('vMenu'), tut: $('vTut'), brief: $('vBrief'), kase: $('vCase'), packs: $('vPacks'), pack: $('vPack') }, curView = 'menu', prevView = 'menu';
  function show(v) {
    if (v === 'menu' && (ctx.kind !== 'daily' || ctx.date)) { ctx = { kind: 'daily' }; loadCase(diff); }   // al volver al menú se recupera el caso de hoy
    document.querySelectorAll('.confetti').forEach(function (x) { x.remove(); });
    if (v === 'brief') prevView = curView;
    curView = v;
    setHue(v === 'packs' || v === 'pack' ? PK().hue : (v === 'brief' || v === 'kase') ? th.hue : baseTh.hue);
    Object.keys(VIEWS).forEach(function (k) { VIEWS[k].classList.toggle('on', k === v); });
    if (v === 'menu') menuRefresh();
    if (v === 'packs') renderPacks();
    if (v === 'pack') renderPack();
    if (v === 'arch') renderArch();
    if (v !== 'menu' && v !== 'kase') sfx('page');
    if (v === 'kase') { paint(); stripCounter(); fitCase(); setTimeout(fitCase, 120); }
    if (v === 'tut') tutOpen();
    closeSheet();
  }

  /* ============================== MENÚ ============================== */
  var dt = new Date(date + 'T12:00:00');
  $('mArt').innerHTML = window.Hero.svg(th.id, seed); dust($('mDust'), 22);
  $('mDow').textContent = dt.toLocaleDateString('es-ES', { weekday: 'long' }).toUpperCase();
  $('mDay').textContent = dt.getDate();
  $('mMon').textContent = dt.toLocaleDateString('es-ES', { month: 'short' }).replace('.', '').toUpperCase() + ' ' + dt.getFullYear();
  $('mNo').textContent = 'CASO Nº ' + M.caseNumber(date);
  $('mName').textContent = th.titulo;

  // selector de dificultad
  var pills = {};
  ORDER.forEach(function (d) {
    var b = document.createElement('button'); b.className = 'dpill'; b.setAttribute('role', 'tab'); b.dataset.d = d;
    b.innerHTML = '<span class="ic">' + DIFFS[d].ico + '</span><span>' + DIFFS[d].label + '</span><span class="st"></span>';
    b.onclick = function () { if (!tutDone) { gateHint(); return; } if (d !== diff) { loadCase(d); } menuRefresh(); buzz(8); };
    $('mDiff').appendChild(b); pills[d] = b;
  });
  function hasProgress() {
    var any = false;
    ['p', 'w'].forEach(function (t) { marks[t].forEach(function (r) { r.forEach(function (v) { if (v) any = true; }); }); });
    return any || game.tries > 0 || game.started;
  }
  function streakNow() { return (stats.last === today || stats.last === prevDay(today)) ? stats.streak : 0; }
  function fitMenu() { $('vMenu').classList.toggle('cmp', innerHeight <= 780 || (!tutDone && innerHeight <= 900)); }
  window.addEventListener('resize', fitMenu);
  function menuRefresh() {
    var st = $('mStatus'), cta = $('mCta');
    $('mStreak').textContent = streakNow();
    $('mRankTxt').textContent = rankFor(bookGet().total).name.toUpperCase();
    $('mMeta').textContent = cs.clues.length + ' pistas · ' + cs.n + ' sospechosos · ' + DIFFS[diff].ico + ' ' + DIFFS[diff].label;
    $('mDesc').textContent = DIFFS[diff].desc;
    $('mTut').classList.toggle('hidden', tutDone);
    $('vMenu').classList.toggle('gated', !tutDone);
    $('mCta').textContent = tutDone ? $('mCta').textContent : '🔒 Resolver caso';
    fitMenu();
    ORDER.forEach(function (d) {
      var g = d === diff ? game : load(keyOf(d)), b = pills[d], s = b.querySelector('.st'), cls = 'dpill' + (d === diff ? ' on' : '');
      if (g && g.solved) { cls += ' ok'; s.textContent = '✓ HECHO'; }
      else if (g && g.failed) { cls += ' cold'; s.textContent = '❄ FRÍO'; }
      else if (g && (g.started || g.tries)) { cls += ' run'; s.textContent = '▶ EN CURSO'; }
      else s.textContent = '';
      b.className = cls; b.setAttribute('aria-selected', d === diff ? 'true' : 'false');
    });
    if (game.solved) { st.className = 'm-status ok'; st.textContent = '✅ Resuelto en ' + game.tries + (game.tries === 1 ? ' intento' : ' intentos'); cta.textContent = '🏁 Ver resultado'; }
    else if (game.failed) { st.className = 'm-status cold'; st.textContent = '🧊 Caso frío'; cta.textContent = '🏁 Ver resultado'; }
    else if (hasProgress()) { st.className = 'm-status run'; st.textContent = '▶ En curso · ' + used.length + '/' + cs.clues.length + ' pistas usadas'; cta.textContent = '▶ Continuar caso'; }
    else { st.className = 'm-status'; st.textContent = 'Sin empezar'; cta.textContent = '🔍 Resolver caso'; }
    if (!tutDone) cta.textContent = '🔒 Resolver caso';
  }
  // Hasta completar el tutorial no se puede entrar en ningún caso: el menú se atenúa y el tutorial destaca.
  var gateTimer = 0;
  function gateHint() {
    toast('✨ Primero el tutorial: solo 1 minuto', true); buzz([15, 30, 15]);
    var t = $('mTut'); t.classList.remove('nudge'); void t.offsetWidth; t.classList.add('nudge');
    clearTimeout(gateTimer); gateTimer = setTimeout(function () { t.classList.remove('nudge'); }, 1200);
  }
  function enter() {
    if (!tutDone) { gateHint(); return; }
    if (over()) { show('kase'); setActive(cs.culprit, 0); showOverlay(false); }
    else if (hasProgress()) show('kase');
    else show('brief');
  }
  $('mCard').onclick = enter; $('mCta').onclick = enter;
  $('mPacks').onclick = function () { if (!tutDone) { gateHint(); return; } show('packs'); };
  $('mBook').onclick = function () { openBook(); };
  document.querySelectorAll('[data-soon]').forEach(function (b) {
    b.onclick = function () { toast('🚧 ' + b.dataset.soon + ': próximamente', true); };
  });
  function countdown() {
    var n = new Date(), nx = new Date(n.getFullYear(), n.getMonth(), n.getDate() + 1), s = Math.max(0, Math.floor((nx - n) / 1000));
    $('mCount').textContent = pad(Math.floor(s / 3600)) + ':' + pad(Math.floor(s % 3600 / 60)) + ':' + pad(s % 60);
    if (fmt(n) !== today && !q) location.reload();   // nuevo día => nuevos casos
  }
  countdown(); setInterval(countdown, 1000);

  /* ============================== TUTORIAL ============================== */
  var tutI = 0, tutSlides = [];
  function chipHTML(it, extra, cls) {
    return '<button class="chip' + (cls || '') + '" ' + (extra || '') + ' title="' + it.n + '"><span class="mk"></span><span class="ic">' + it.e + '</span><span class="lb"' + (it.s.length > 7 ? ' style="font-size:.54rem"' : '') + '>' + it.s + '</span></button>';
  }
  function tutBuild() {
    var avs = th.suspects.map(function (s, r) { return '<span style="--sh:' + HUES[r % HUES.length] + '">' + s.e + '</span>'; }).join('');
    var c1 = M.renderClueHTML({ t: 'np', s: 1, p: 1, v: 0 }, th, true),
        c2 = M.renderClueHTML({ t: 'aw', w: 0, s: 2, s2: 3, v: 0 }, th, true),
        c3 = M.renderClueHTML({ t: 'wp', w: 3, p: 0, v: 0 }, th, true);
    var demoP = th.places.map(function (p, i) { return chipHTML(p, 'data-a="' + i + '"'); }).join('');
    var bulbIdx = 2, bulbRow = th.places.map(function (p, i) { return chipHTML(p, 'data-b="' + i + '"', i === bulbIdx ? ' only' : ' no inert'); }).join('');
    var s0 = th.suspects[0];
    tutSlides = [
      { ico: '🔍', h: 'Un crimen, cinco sospechosos',
        p: 'Cada uno estuvo en <b>un lugar</b> y llevaba <b>un objeto</b>, distintos para todos. El culpable es quien estaba en el lugar del crimen <b>con el arma del crimen</b>.',
        card: '<div class="tut-avs">' + avs + '</div><div class="pair"><div class="polaroid"><div class="big">' + cp.e + '</div><div class="lab">Lugar</div><b>' + cp.a + ' ' + cp.n + '</b></div><div class="plus">+</div><div class="polaroid"><div class="big">' + cw.e + '</div><div class="lab">Arma</div><b>' + cw.a + ' ' + cw.n + '</b></div></div>' },
      { ico: '📎', h: 'Las pistas dicen la verdad',
        p: 'Todas son ciertas y, juntas, bastan para resolver el caso <b>sin adivinar</b>. Toca una para tacharla cuando ya la hayas usado.',
        card: '<div class="tclue"><small>Directa</small><button class="cc" data-tc><span class="n">1</span><span class="txt">' + c1 + '</span></button></div>' +
              '<div class="tclue"><small>Dos opciones</small><button class="cc" data-tc><span class="n">2</span><span class="txt">' + c2 + '</span></button></div>' +
              '<div class="tclue"><small>Cruzada · une lugar y objeto</small><button class="cc" data-tc><span class="n">3</span><span class="txt">' + c3 + '</span></button></div>' },
      { ico: '✍️', h: 'Tu libreta: ✕ y ✓',
        p: 'Cada sospechoso tiene su ficha. Toca una casilla para <b>descartarla (✕)</b>, otra vez para <b>confirmarla (✓)</b>, y una tercera para borrarla.',
        card: '<div class="tut-who"><div class="avatar" style="--sh:' + HUES[0] + '">' + s0.e + '</div><div><b>' + s0.n + '</b><small>' + s0.d + '</small></div></div><div class="chips">' + demoP + '</div>',
        hint: 'Prueba: toca ' + th.places[1].a + ' ' + th.places[1].n + ' ' + th.places[1].e, kind: 'demoA' },
      { ico: '💡', h: 'La bombilla nunca falla',
        p: 'Cada lugar y cada objeto es de <b>una sola persona</b>. Cuando en una fila solo queda <b>una opción</b>, la casilla se enciende con una bombilla: esa es la buena.',
        card: '<div class="tut-who"><div class="avatar" style="--sh:' + HUES[0] + '">' + s0.e + '</div><div><b>' + s0.n + '</b><small>¿Dónde estaba?</small></div></div><div class="chips">' + bulbRow + '</div>',
        hint: 'Toca la casilla que brilla 💡', kind: 'demoB' },
      { ico: '🕵️', h: 'Acusa cuando lo sepas',
        p: 'Tienes <b>3 intentos</b>. Cada fallo descarta a esa persona. Elige tu dificultad en el menú: un caso nuevo cada día.',
        card: '<div class="tut-hearts">❤️❤️❤️</div><div class="tut-levels" style="margin-top:12px">' + ORDER.map(function (d) { return '<div><span class="ic">' + DIFFS[d].ico + '</span><span><b>' + DIFFS[d].label + '</b> · ' + DIFFS[d].desc.toLowerCase() + '</span></div>'; }).join('') + '</div>' }
    ];
  }
  function tutRender() {
    var s = tutSlides[tutI], body = $('tBody');
    body.innerHTML = '<div class="tut-ico">' + s.ico + '</div><h2>' + s.h + '</h2><p>' + s.p + '</p>' +
      '<div class="tut-card" data-kind="' + (s.kind || '') + '">' + s.card + (s.hint ? '<div class="tut-hint" id="tHint">' + s.hint + '</div>' : '') + '</div>';
    $('tDots').innerHTML = tutSlides.map(function (_, i) { return '<i' + (i === tutI ? ' class="on"' : '') + '></i>'; }).join('');
    $('tStep').textContent = (tutI + 1) + '/' + tutSlides.length;
    $('tPrev').disabled = tutI === 0;
    $('tNext').textContent = tutI === tutSlides.length - 1 ? '🔍 ¡A investigar!' : 'Siguiente';
    body.parentNode.scrollTop = 0;
  }
  function tutOpen() { tutBuild(); tutI = 0; tutRender(); }
  function tutFinish() {
    tutDone = true; save('tut', 1);
    show('menu'); toast('🎓 ¡Tutorial completado! Ya puedes investigar', true);
  }
  $('tutGo').onclick = function () { show('tut'); };
  var skipArm = 0;
  $('tutSkip').onclick = function () {   // omitir pide un segundo toque para evitar saltarlo sin querer
    var b = $('tutSkip');
    if (!skipArm) { b.textContent = '¿seguro? toca otra vez'; skipArm = setTimeout(function () { skipArm = 0; b.textContent = 'omitir'; }, 3000); return; }
    clearTimeout(skipArm); skipArm = 0; b.textContent = 'omitir';
    tutDone = true; save('tut', 1); menuRefresh(); toast('Tutorial omitido', true);
  };
  $('tBack').onclick = function () { show('menu'); };
  $('tPrev').onclick = function () { if (tutI > 0) { tutI--; tutRender(); } };
  $('tNext').onclick = function () { if (tutI < tutSlides.length - 1) { tutI++; tutRender(); } else tutFinish(); };
  $('tBody').addEventListener('click', function (e) {
    var tc = e.target.closest('[data-tc]');
    if (tc) { tc.classList.toggle('used'); buzz(6); return; }
    var a = e.target.closest('.chip[data-a]');
    if (a) {                                    // demo ✕ / ✓ (vacío → ✕ → ✓ → vacío)
      var st = a.classList.contains('no') ? 1 : a.classList.contains('yes') ? 2 : 0, ns = (st + 1) % 3, h = $('tHint');
      a.classList.remove('no', 'yes'); if (ns === 1) a.classList.add('no'); if (ns === 2) a.classList.add('yes');
      h.className = 'tut-hint' + (ns === 2 ? ' good' : '');
      h.textContent = ns === 1 ? '✕ Descartada: ahí no estaba. Toca otra vez…' : ns === 2 ? '✓ Confirmada: ahí estaba seguro. ¡Ya sabes marcar!' : 'Vacía de nuevo. Prueba otra casilla';
      buzz(8); return;
    }
    var b = e.target.closest('.chip[data-b]');
    if (b && b.classList.contains('only')) {    // demo 💡
      b.classList.remove('only'); b.classList.add('yes');
      var h2 = $('tHint'); h2.className = 'tut-hint good'; h2.textContent = '¡Eso es! La bombilla marca la única opción que queda.'; buzz(12);
    }
  });

  /* ============================== EXPEDIENTE ============================== */
  dust($('bDust'), 14);
  function fillBrief() {
    $('bArt').innerHTML = window.Hero.svg(th.id, seed);
    $('bEyebrow').textContent = ctx.kind === 'pack' ? PK().nombre + ' · Capítulo ' + pad(ctx.idx + 1) + ' de ' + PK().count : 'Expediente ' + pad(cs.number) + ' · ' + th.lugar;
    $('bTitle').textContent = th.titulo;
    var paras = M.story(cs, th), pk = ctx.kind === 'pack';
    $('bStory').innerHTML = paras.map(function (t) { return '<p>' + t + '</p>'; }).join('');
    $('bPrev').classList.toggle('hidden', !(pk && th.previo));
    $('bPrev').innerHTML = pk && th.previo ? '<b>⏮ Anteriormente</b><span>' + th.previo + '</span>' : '';
    $('bCast').innerHTML = '<h4>Bajo sospecha</h4>' + th.suspects.map(function (s, i) {
      return '<div class="cm" style="--sh:' + HUES[i % HUES.length] + '"><span class="ca">' + s.e + '</span><span><b>' + s.n + '</b><small>' + s.d + '</small></span></div>';
    }).join('');
  }
  $('bBack').onclick = function () { show(prevView === 'brief' ? 'menu' : prevView); };
  $('bStart').onclick = function () { game.started = true; save(K, game); show('kase'); };

  /* ============================== TABLERO ============================== */
  $('cTarget').onclick = function () { toast('El culpable estaba en ' + cp.a + ' ' + cp.n + ' y llevaba ' + cw.a + ' ' + cw.n, true); };
  $('cBack').onclick = function () { show(backView()); };
  $('cBrief').onclick = function () { show('brief'); };
  $('cResult').onclick = function () { showOverlay(false); };
  function renderLives() {
    var left = MAX_LIVES - game.tries, s = '';
    for (var i = 0; i < MAX_LIVES; i++) s += i < left ? '❤️' : '🖤';
    $('lives').textContent = s;
  }

  function backView() { return ctx.kind === 'pack' ? 'pack' : ctx.date ? 'arch' : 'menu'; }
  var strip = $('strip'), stage = $('stage'), dock = $('dock'), clueEls = [], fichas = [], dockBtns = [], chips = [], act = 0;
  function clueProg() { $('clueProg').textContent = used.length + ' usadas'; $('sheetProg').textContent = used.length + ' / ' + cs.clues.length + ' usadas'; }
  function makeClue(i) {
    var b = document.createElement('button'); b.className = 'cc' + (used.indexOf(i) >= 0 ? ' used' : '');
    b.innerHTML = '<span class="n">' + (i + 1) + '</span><span class="txt">' + M.renderClueHTML(cs.clues[i], th) + '</span>';
    b.onclick = function () {
      var at = used.indexOf(i); if (at >= 0) used.splice(at, 1); else used.push(i);
      clueEls[i].forEach(function (el) { el.classList.toggle('used', used.indexOf(i) >= 0); });
      save('used:' + K, used); clueProg(); buzz(6);
    };
    (clueEls[i] = clueEls[i] || []).push(b);
    return b;
  }
  function stripCounter() {
    var cards = strip.children, mid = strip.scrollLeft + strip.clientWidth / 2, best = 0, bd = 1e9;
    for (var i = 0; i < cards.length; i++) { var d = Math.abs(cards[i].offsetLeft + cards[i].offsetWidth / 2 - mid); if (d < bd) { bd = d; best = i; } }
    $('cNow').textContent = best + 1;
  }
  var raf = 0; strip.addEventListener('scroll', function () { cancelAnimationFrame(raf); raf = requestAnimationFrame(stripCounter); }, { passive: true });
  function openSheet() { $('sheet').classList.remove('hidden'); }
  function closeSheet() { $('sheet').classList.add('hidden'); }
  $('allBtn').onclick = openSheet; $('sheetClose').onclick = closeSheet;
  $('sheet').addEventListener('click', function (e) { if (e.target === $('sheet')) closeSheet(); });

  function setActive(r, dir) {
    r = ((r % N) + N) % N;
    var prev = act; act = r;
    var d = dir === undefined ? (r > prev ? 1 : -1) : dir;
    fichas[r].style.setProperty('--dx', (d || 1) * 28 + 'px');
    fichas.forEach(function (f, k) { f.classList.toggle('cur', k === r); });
    dockBtns.forEach(function (b, k) { b.classList.toggle('act', k === r); b.setAttribute('aria-selected', k === r ? 'true' : 'false'); });
    stage.scrollTop = 0;
  }

  // (re)construye pistas, fichas y dock del caso activo
  function buildBoard() {
    clueEls = []; fichas = []; dockBtns = []; act = 0;
    strip.innerHTML = ''; $('sheetBody').innerHTML = ''; stage.innerHTML = ''; dock.innerHTML = '';
    $('cTarget').innerHTML = '<span class="q">Busca</span><span class="em">' + cp.e + '</span><span class="q">+</span><span class="em">' + cw.e + '</span>';
    $('cTitle').innerHTML = '<small>' + (ctx.kind === 'pack' ? PK().nombre.toUpperCase() + ' · CAPÍTULO ' + pad(ctx.idx + 1) : 'CASO Nº ' + pad(cs.number)) + '</small>' + th.titulo;
    $('cTot').textContent = cs.clues.length;
    cs.clues.forEach(function (c, i) { strip.appendChild(makeClue(i)); $('sheetBody').appendChild(makeClue(i)); });
    strip.scrollLeft = 0;
    th.suspects.forEach(function (s, r) {
      var hue = HUES[r % HUES.length];
      var f = document.createElement('article'); f.className = 'ficha'; f.style.setProperty('--sh', hue);
      var n = cs.clues.filter(function (c) { return M.clueSuspects(c).indexOf(r) >= 0; }).length;
      var html = '<span class="tab">FICHA ' + (r + 1) + ' / ' + N + '</span><span class="sello"></span><div class="ft"><div class="avatar">' + s.e + '</div><div class="who"><b>' + s.n + '</b><small>' + s.d + '</small>' +
        '<button class="clipbtn" data-hl="' + r + '">📎 ' + n + ' pistas sobre ' + s.n + '</button></div><span class="badge hidden">🔎 ENCAJA</span></div>';
      [['p', '📍 ¿Dónde estaba?', th.places], ['w', '🎒 ¿Qué llevaba?', th.weapons]].forEach(function (g) {
        html += '<div class="rl"><span>' + g[1] + '</span><button class="reset" data-reset="' + g[0] + '" data-r="' + r + '">limpiar</button></div><div class="chips">';
        g[2].forEach(function (it, i) {
          html += '<button class="chip" data-t="' + g[0] + '" data-r="' + r + '" data-i="' + i + '" title="' + it.n + '"><span class="mk"></span><span class="ic">' + it.e + '</span><span class="lb"' + (it.s.length > 7 ? ' style="font-size:.54rem"' : '') + '>' + it.s + '</span></button>';
        });
        html += '</div>';
      });
      html += '<div class="ar"><button class="btn red acc">🔍 Acusar a ' + s.n + '</button><span class="tl"><button class="tool" data-undo title="Deshacer la última marca (Z)" aria-label="Deshacer">↶</button><button class="tool" data-lupa title="Lupa: te enseña un paso lógico (L)" aria-label="Usar la lupa">🔍<i class="lc"></i></button></span><div class="confirm hidden"><span>¿Seguro?</span><button class="btn red yes">Sí, acusar</button><button class="btn ghost no">Cancelar</button></div></div>';
      f.innerHTML = html; stage.appendChild(f); fichas.push(f);

      var k = document.createElement('button'); k.className = 'dk'; k.style.setProperty('--sh', hue); k.setAttribute('role', 'tab'); k.setAttribute('aria-label', s.n);
      k.innerHTML = '<span class="dav">' + s.e + '</span><span class="dbulb" aria-hidden="true">💡</span><span class="dst"><i class="dp">·</i><i class="dw">·</i></span><span class="dn">' + s.n + '</span>';
      k.onclick = function () { setActive(r); };
      dock.appendChild(k); dockBtns.push(k);
    });
    chips = Array.prototype.slice.call(stage.querySelectorAll('.chip'));
    $('overlay').classList.add('hidden'); $('cBg').innerHTML = window.Hero.svg(th.id, seed);
    $('cResult').classList.add('hidden'); $('cBrief').classList.remove('hidden');
    renderLives(); clueProg(); setActive(0, 0); paint(); lupaBadge(); stripCounter(); fitCase();
    game.wrong.forEach(function (r) { fichas[r].classList.add('out'); fichas[r].querySelector('.ar').classList.add('hidden'); });
    if (over()) lockBoard();
  }

  // Ajuste automático: la tarjeta del sospechoso debe caber sin desplazarse, sea cual sea el texto de las pistas o el tamaño del móvil
  function fitCase() {
    if (curView !== 'kase') return;
    var vc = $('vCase'), over1 = function () { return stage.scrollHeight > stage.clientHeight + 1; };
    vc.classList.remove('tight', 'tighter'); strip.classList.remove('dense', 'denser');
    if (window.innerWidth < 900) {
      if (strip.offsetHeight > 116) strip.classList.add('dense');
      if (strip.offsetHeight > 116) strip.classList.add('denser');
    }
    if (over1()) { vc.classList.add('tight'); if (over1()) vc.classList.add('tighter'); }
  }
  window.addEventListener('resize', function () { fitCase(); });

  // deslizar a izquierda / derecha para cambiar de sospechoso
  var tx = 0, ty = 0, tt = 0;
  stage.addEventListener('touchstart', function (e) { var t = e.changedTouches[0]; tx = t.clientX; ty = t.clientY; tt = Date.now(); }, { passive: true });
  stage.addEventListener('touchend', function (e) {
    var t = e.changedTouches[0], dx = t.clientX - tx, dy = t.clientY - ty;
    if (Math.abs(dx) > 55 && Math.abs(dx) > Math.abs(dy) * 1.5 && Date.now() - tt < 800) setActive(act + (dx < 0 ? 1 : -1), dx < 0 ? 1 : -1);
  }, { passive: true });
  document.addEventListener('keydown', function (e) {
    if (e.key === 'Escape') { closeSheet(); closeWhy(); closeBook(); closeSet(); closeDiary(); return; }
    if (curView !== 'kase' || !$('overlay').classList.contains('hidden') || !$('sheet').classList.contains('hidden')) return;
    if (e.target && /INPUT|TEXTAREA/.test(e.target.tagName)) return;
    if (e.key === 'ArrowRight') setActive(act + 1, 1); else if (e.key === 'ArrowLeft') setActive(act - 1, -1);
    else if (/^[1-9]$/.test(e.key) && +e.key <= N) setActive(+e.key - 1);
    else if (e.key === 'z' || e.key === 'Z' || e.key === 'u') undo();
    else if (e.key === 'l' || e.key === 'L') useLupa();
  });

  /* ----- estado de las casillas (lo atenuado se calcula, nunca se guarda: deshacer siempre funciona) ----- */
  function stateOf(t, r, i) {
    var g = marks[t], m = g[r][i], k, auto = false, conflict = false;
    for (k = 0; k < N; k++) {
      if (k !== r && g[k][i] === 2) { if (m === 2) conflict = true; else auto = true; }
      if (k !== i && g[r][k] === 2) { if (m === 2) conflict = true; else auto = true; }
    }
    return { m: m, auto: m === 0 && auto, conflict: conflict };
  }
  function isOpen(t, r, i) { var st = stateOf(t, r, i); return st.m !== 1 && !st.auto; }
  function paint() {
    var bulbs = {};          // sospechosos con alguna 💡 en sus filas: se avisa en el acceso rápido de abajo
    chips.forEach(function (b) {
      var t = b.dataset.t, r = +b.dataset.r, i = +b.dataset.i, st = stateOf(t, r, i), k, rowOpen = 0, colOpen = 0;
      for (k = 0; k < N; k++) { if (isOpen(t, r, k)) rowOpen++; if (isOpen(t, k, i)) colOpen++; }
      // REGLA FIJA: 💡 cuando en su fila o columna solo queda esta opción
      var only = st.m !== 2 && isOpen(t, r, i) && (rowOpen === 1 || colOpen === 1);
      b.className = 'chip' + (st.m === 1 ? ' no' : st.m === 2 ? ' yes' : '') + (st.auto ? ' auto' : '') + (st.conflict ? ' conflict' : '') + (only ? ' only' : '');
      if (only) bulbs[r] = (bulbs[r] || 0) + 1;
      var nm = t === 'p' ? th.places[i].n : th.weapons[i].n;
      b.setAttribute('aria-label', th.suspects[r].n + ' · ' + nm + ': ' + (st.m === 2 ? 'seguro' : st.m === 1 ? 'descartado' : only ? 'única opción posible' : st.auto ? 'imposible' : 'sin marcar'));
    });
    fichas.forEach(function (f, r) {
      var match = marks.p[r][cs.crimePlace] === 2 && marks.w[r][cs.crimeWeapon] === 2 && !over();
      f.classList.toggle('match', match); f.querySelector('.badge').classList.toggle('hidden', !match);
      var pj = marks.p[r].indexOf(2), wj = marks.w[r].indexOf(2), db = dockBtns[r];
      db.querySelector('.dp').textContent = pj >= 0 ? th.places[pj].e : '·';
      db.querySelector('.dw').textContent = wj >= 0 ? th.weapons[wj].e : '·';
      var hasBulb = !!bulbs[r] && !over() && game.wrong.indexOf(r) < 0;
      db.classList.toggle('bulb', hasBulb); db.setAttribute('aria-label', th.suspects[r].n + (hasBulb ? ' · tiene una pista clara 💡' : ''));
      db.classList.toggle('match', match); db.classList.toggle('out', game.wrong.indexOf(r) >= 0);
    });
  }
  stage.addEventListener('click', function (e) {
    var c = e.target.closest('.chip');
    if (c) {
      var t = c.dataset.t, r = +c.dataset.r, i = +c.dataset.i;
      pushHist(); marks[t][r][i] = (marks[t][r][i] + 1) % 3; buzz(8); sfx(marks[t][r][i] === 2 ? 'ok' : marks[t][r][i] === 1 ? 'x' : 'clr');
      if (!game.started) { game.started = true; save(K, game); }
      save('marks:' + K, marks); paint(); c.classList.add('pop'); setTimeout(function () { c.classList.remove('pop'); }, 280); return;
    }
    var rs = e.target.closest('[data-reset]');
    if (rs) { var rr0 = +rs.dataset.r; pushHist(); marks[rs.dataset.reset][rr0] = [0, 0, 0, 0, 0]; save('marks:' + K, marks); paint(); sfx('clr'); return; }
    if (e.target.closest('[data-undo]')) { undo(); return; }
    if (e.target.closest('[data-lupa]')) { useLupa(); return; }
    var hl = e.target.closest('.clipbtn');
    if (hl) {
      var rr = +hl.dataset.hl, first = null;
      cs.clues.forEach(function (cl, k) {
        if (M.clueSuspects(cl).indexOf(rr) >= 0) {
          var el = clueEls[k][0]; el.classList.remove('hl'); void el.offsetWidth; el.classList.add('hl');
          setTimeout(function () { el.classList.remove('hl'); }, 2400);
          if (first === null) first = el;
        }
      });
      if (first) first.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' });
      return;
    }
    var f = e.target.closest('.ficha'); if (!f) return;
    var idx = fichas.indexOf(f);
    if (e.target.closest('.acc')) {
      f.querySelector('.confirm').classList.remove('hidden'); f.querySelector('.acc').classList.add('hidden');
    } else if (e.target.closest('.no')) {
      f.querySelector('.confirm').classList.add('hidden'); f.querySelector('.acc').classList.remove('hidden');
    } else if (e.target.closest('.yes')) accuse(idx);
    else if (e.target.closest('[data-verdict]')) showOverlay(false);
  });

  /* ----- deshacer y lupa ----- */
  function pushHist() { hist.push(JSON.stringify(marks)); if (hist.length > 80) hist.shift(); }
  function undo() {
    if (over()) return;
    if (!hist.length) { toast('↶ No hay nada que deshacer', true); return; }
    marks = JSON.parse(hist.pop()); save('marks:' + K, marks); paint(); sfx('clr'); buzz(8);
  }
  function lupaBadge() {
    var left = Math.max(0, 1 - (game.lupa || 0));
    document.querySelectorAll('.tool[data-lupa]').forEach(function (b) { b.classList.toggle('spent', !left); b.querySelector('.lc').textContent = left; });
  }
  function useLupa() {
    if (over()) return;
    if ((game.lupa || 0) >= 1) { toast('🔍 Ya has usado la lupa en este caso', true); return; }
    var h = M.hintFor(cs, th, function (g, s, v) { var st = stateOf(g, s, v); return st.m === 1 || st.auto; });
    if (!h) { toast('🔍 Ya has sacado todo lo que dicen las pistas. ¡Es hora de acusar!', true, 3600); return; }
    pushHist(); marks[h.g][h.s][h.v] = 1; game.lupa = (game.lupa || 0) + 1; game.started = true;
    save(K, game); save('marks:' + K, marks); setActive(h.s); paint(); lupaBadge(); sfx('lupa'); buzz([12, 30, 12]);
    var ch = stage.querySelector('.chip[data-t="' + h.g + '"][data-r="' + h.s + '"][data-i="' + h.v + '"]');
    if (ch) { ch.classList.add('lupaflash'); setTimeout(function () { ch.classList.remove('lupaflash'); }, 2600); }
    if (h.q !== undefined && clueEls[h.q]) { var el = clueEls[h.q][0]; el.classList.add('hl'); setTimeout(function () { el.classList.remove('hl'); }, 2600); el.scrollIntoView({ behavior: 'smooth', inline: 'center', block: 'nearest' }); }
    toast('🔍 ' + h.text + ' · ' + h.why, true, 4600);
  }

  /* ----- acusación y veredicto ----- */
  function confetti() {
    var em = ['🎉', '✨', '🔍', '🕵️', '⭐', '🔑'];
    for (var i = 0; i < 40; i++) {
      var s = document.createElement('span'); s.className = 'confetti'; s.textContent = em[i % em.length];
      s.style.left = Math.random() * 92 + 'vw'; s.style.animationDuration = (2 + Math.random() * 2.2) + 's'; s.style.animationDelay = Math.random() * .7 + 's';
      document.body.appendChild(s); (function (x) { setTimeout(function () { x.remove(); }, 5200); })(s);
    }
  }
  function accuse(r) {
    if (over()) return;
    game.tries++; game.started = true;
    if (r === cs.culprit) { finish(true); return; }
    game.wrong.push(r);
    var f = fichas[r]; f.classList.add('shake', 'out'); f.querySelector('.ar').classList.add('hidden'); buzz([30, 40, 30]); sfx('wrong');
    setTimeout(function () { f.classList.remove('shake'); }, 500);
    renderLives(); paint();
    if (game.tries >= MAX_LIVES) { finish(false); return; }
    toast('No es ' + th.suspects[r].n + ' · quedan ' + (MAX_LIVES - game.tries));
    save(K, game);
  }
  function finish(won) {
    game.solved = won; game.failed = !won;
    var bk = ctx.kind === 'pack' ? ctx.pack + ':' + cdiff : cdiff;
    if (won && secs >= 3) {                       // récord personal por dificultad (solo cuenta si se jugó de verdad)
      var prev = bests[bk];
      if (!prev || secs < prev) { game.rec = !!prev; bests[bk] = secs; save('best', bests); }
    }
    game.stars = won ? Math.max(1, 4 - game.tries) : 0;     // 3 estrellas a la primera, 2 a la segunda, 1 a la tercera
    save(K, game); save('time:' + K, secs);
    fresh = won ? recordSolved() : {};
    if (won && ctx.kind === 'pack' && !ORDER.some(function (d) { var g2 = load(pkKey(ctx.pack, ctx.idx, d)); return d !== cdiff && g2 && g2.solved; })) fresh.prueba = PK().cap[ctx.idx].prueba;
    // la racha cuenta días seguidos con al menos un caso resuelto (sea cual sea la dificultad)
    if (won && ctx.kind === 'daily' && cdate === today) {
      stats.streak = stats.last === today ? stats.streak : (stats.last === prevDay(today) ? stats.streak + 1 : 1);
      stats.last = today; save('stats', stats);
    }
    document.querySelectorAll('.toast').forEach(function (t) { t.remove(); });
    lockBoard(); renderLives(); paint(); setActive(cs.culprit, 0);
    showOverlay(won); sfx(won ? 'win' : 'lose'); buzz(won ? [40, 60, 120] : [60, 40, 60]);
  }
  function lockBoard() {
    fichas.forEach(function (f, r) {
      f.querySelector('.ar').innerHTML = '<button class="btn" data-verdict>🏁 Ver veredicto</button>';
      f.querySelector('.ar').classList.remove('hidden');
      if (r === cs.culprit) { f.classList.add('culprit'); f.classList.remove('out'); }
      else if (game.wrong.indexOf(r) < 0) f.classList.add('out');
    });
    $('cResult').classList.remove('hidden'); $('cBrief').classList.add('hidden');
  }
  function nextPending() {       // otra dificultad de hoy que aún no se haya terminado
    var i0 = ORDER.indexOf(cdiff), k, d, g;
    for (k = 1; k < ORDER.length; k++) { d = ORDER[(i0 + k) % ORDER.length]; g = load(keyOf(d)); if (!g || (!g.solved && !g.failed)) return d; }
    return null;
  }
  function starsHTML(n) { var s = '', i; for (i = 0; i < 3; i++) s += '<i class="' + (i < n ? 'on' : '') + '">★</i>'; return '<div class="vstars" aria-label="' + n + ' de 3 estrellas">' + s + '</div>'; }
  function verdictInner() {
    var won = game.solved, cul = th.suspects[cs.culprit], sq = '', i, tm = mmss(secs), D = DIFFS[cdiff], pk = ctx.kind === 'pack';
    var bk = pk ? ctx.pack + ':' + cdiff : cdiff, ep = M.epilogue(cs, th, won), nx = pk ? null : nextPending(), stars = game.stars || (won ? Math.max(1, 4 - game.tries) : 0);
    for (i = 0; i < game.tries; i++) sq += (won && i === game.tries - 1) ? '🟩' : '🟥';
    var head = pk ? PK().nombre + ' · capítulo ' + pad(ctx.idx + 1) : 'Misterio diario nº ' + cs.number;
    var share = '🔍 ' + head + ' · ' + D.ico + ' ' + D.label + '\n' + (won ? '⭐'.repeat(stars) + ' Cerrado en ' + game.tries + (game.tries === 1 ? ' intento' : ' intentos') + ' · ⏱ ' + tm + (game.lupa ? ' · 🔍 con lupa' : '') : 'Caso frío 🧊') + '\n' + sq;
    var tr = '';
    th.suspects.forEach(function (s, r) {
      tr += '<div class="' + (r === cs.culprit ? 'cul' : '') + '">' + s.e + ' <span>' + s.n + '</span><span class="r">' + th.places[cs.solution.pl[r]].e + ' ' + th.places[cs.solution.pl[r]].s + ' · ' + th.weapons[cs.solution.wp[r]].e + ' ' + th.weapons[cs.solution.wp[r]].s + '</span></div>';
    });
    var ev = '';
    if (won && fresh && fresh.rankUp) ev += '<div class="vevent">🎖️ ¡Ascendes a <b>' + fresh.rankUp + '</b>!</div>';
    if (won && fresh && fresh.prueba) ev += '<div class="vevent">🧩 Nueva prueba en el tablón: <b>' + fresh.prueba.i + ' ' + fresh.prueba.t + '</b></div>';
    if (won && fresh && fresh.seal) ev += '<div class="vevent">🗂️ Nuevo sello de colección: <b>' + fresh.seal + '</b></div>';
    var epi = '<div class="epi"><div class="epi-h">📜 ' + ep.titulo + '</div>' + ep.lines.map(function (l, k) { return '<p style="animation-delay:' + (0.8 + k * 0.6).toFixed(2) + 's">' + l + '</p>'; }).join('') + '</div>' +
      (pk && ep.gancho ? '<div class="gancho"><b>' + (ctx.idx + 1 < PK().count ? '▶ Próximo capítulo' : '🏁 Fin de la temporada') + '</b><span>' + ep.gancho + '</span></div>' : '');
    var btns = '<button class="btn" data-share>Compartir resultado</button><button class="btn" data-img>🖼️ Imagen</button><button class="btn" data-why>🔎 ¿Por qué?</button>';
    if (pk) { if (ctx.idx + 1 < PK().count) btns += '<button class="btn" data-pnext>Siguiente capítulo ▶</button>'; }
    else if (nx) btns += '<button class="btn" data-next="' + nx + '">' + DIFFS[nx].ico + ' Probar nivel ' + DIFFS[nx].label + '</button>';
    btns += '<button class="btn ghost" data-close>Ver el caso</button><button class="btn ghost" data-menu>' + (pk ? 'Volver al pack' : 'Menú') + '</button>';
    return '<div class="stamp ' + (won ? 'win' : 'lose') + '">' + (won ? 'CASO CERRADO' : 'CASO FRÍO') + '</div>' +
      '<div class="bigav" style="--sh:' + HUES[cs.culprit % HUES.length] + '">' + cul.e + '</div>' +
      '<p>' + (won ? '¡Lo has resuelto!' : 'Se acabaron los intentos.') + ' El culpable era <b>' + cul.n + '</b> (' + cul.d + ').</p>' +
      (won ? starsHTML(stars) : '') +
      '<div class="vstats"><span>' + D.ico + ' ' + D.label + '</span>' + (pk ? '' : '<span>🔥 Racha ' + streakNow() + '</span>') + '<span>⏱ ' + tm + '</span></div>' +
      (won && game.rec ? '<div class="vrec">🏅 ¡Nuevo récord personal en ' + D.label + '!</div>' : (won && bests[bk] ? '<div class="vrec dim">🏅 Tu mejor tiempo en ' + D.label + ': ' + mmss(bests[bk]) + '</div>' : '')) +
      ev + epi +
      '<details class="truthd"><summary>🗂️ Ver las coartadas de todos</summary><div class="truth">' + tr + '</div></details><div class="share">' + share + '</div>' + btns +
      '<p style="font-size:.8rem;color:#8a7a4a;margin-top:10px">' + (pk ? 'La historia continúa en el siguiente capítulo.' : 'Mañana, un caso nuevo.') + '</p>';
  }

  /* ----- Tarjeta de resultado como imagen (canvas) ----- */
  function resultCard() {
    var W = 1080, H = 1350, cv = document.createElement('canvas'), x, won = game.solved, D = DIFFS[cdiff], pk = ctx.kind === 'pack', stars = game.stars || (won ? Math.max(1, 4 - game.tries) : 0), i;
    cv.width = W; cv.height = H; x = cv.getContext('2d');
    var hue = th.hue || 40, g = x.createLinearGradient(0, 0, 0, H);
    g.addColorStop(0, 'hsl(' + hue + ',35%,14%)'); g.addColorStop(1, '#07070b'); x.fillStyle = g; x.fillRect(0, 0, W, H);
    var rg = x.createRadialGradient(W / 2, 520, 40, W / 2, 520, 620); rg.addColorStop(0, 'hsla(' + hue + ',70%,55%,.28)'); rg.addColorStop(1, 'rgba(0,0,0,0)'); x.fillStyle = rg; x.fillRect(0, 0, W, H);
    x.strokeStyle = 'hsla(' + hue + ',60%,62%,.55)'; x.lineWidth = 6; x.strokeRect(36, 36, W - 72, H - 72); x.lineWidth = 2; x.strokeRect(54, 54, W - 108, H - 108);
    x.textAlign = 'center'; x.fillStyle = 'hsl(' + hue + ',60%,72%)'; x.font = '700 40px Georgia,serif';
    x.fillText('MISTERIO DIARIO', W / 2, 140);
    x.fillStyle = '#e9e1cd'; x.font = '700 64px Georgia,serif';
    x.fillText(pk ? PK().nombre : 'Caso nº ' + cs.number, W / 2, 240);
    x.fillStyle = '#a99d80'; x.font = '400 38px Georgia,serif';
    x.fillText(pk ? 'Capítulo ' + pad(ctx.idx + 1) + ' · ' + th.titulo : th.titulo, W / 2, 304, W - 160);
    x.font = '280px serif'; x.fillText(th.suspects[cs.culprit].e, W / 2, 650);
    x.save(); x.translate(W / 2, 760); x.rotate(-.08); x.strokeStyle = won ? '#d94f4f' : '#6aa9d9'; x.fillStyle = won ? '#d94f4f' : '#6aa9d9'; x.lineWidth = 10;
    x.font = '800 92px Georgia,serif'; var lab = won ? 'CASO CERRADO' : 'CASO FRÍO', tw = x.measureText(lab).width + 60; x.strokeRect(-tw / 2, -84, tw, 118); x.fillText(lab, 0, 0); x.restore();
    x.fillStyle = '#e9e1cd'; x.font = '700 54px Georgia,serif';
    x.fillText(won ? 'El culpable era ' + th.suspects[cs.culprit].n : 'El culpable escapó', W / 2, 890, W - 140);
    x.font = '90px serif'; x.fillText(won ? '⭐'.repeat(stars) + '☆'.repeat(3 - stars) : '🧊', W / 2, 1010);
    var sq = ''; for (i = 0; i < game.tries; i++) sq += (won && i === game.tries - 1) ? '🟩' : '🟥';
    x.font = '56px serif'; x.fillText(sq, W / 2, 1100);
    x.fillStyle = '#a99d80'; x.font = '400 40px Georgia,serif';
    x.fillText(D.label + ' · ' + game.tries + (game.tries === 1 ? ' intento' : ' intentos') + ' · ' + mmss(secs) + (game.lupa ? ' · con lupa' : ''), W / 2, 1180);
    x.fillStyle = 'hsl(' + hue + ',60%,72%)'; x.font = '600 34px Georgia,serif'; x.fillText('¿Puedes resolverlo tú?', W / 2, 1262);
    return cv;
  }
  function shareImage(btn) {
    var cv = resultCard();
    cv.toBlob(function (b) {
      if (!b) { btn.textContent = 'No se pudo crear'; return; }
      var f; try { f = new File([b], 'misterio-diario.png', { type: 'image/png' }); } catch (er) { f = null; }
      if (f && navigator.canShare && navigator.canShare({ files: [f] })) { navigator.share({ files: [f], text: 'Misterio diario' }).catch(function () {}); return; }
      var a = document.createElement('a'); a.href = URL.createObjectURL(b); a.download = 'misterio-diario.png'; document.body.appendChild(a); a.click(); a.remove();
      setTimeout(function () { URL.revokeObjectURL(a.href); }, 4000); btn.textContent = '¡Imagen guardada!';
    }, 'image/png');
  }
  function showOverlay(celebrate) {
    var o = $('overlay'); o.innerHTML = '<div class="verdict">' + verdictInner() + '</div>'; o.classList.remove('hidden');
    if (celebrate) confetti();
  }
  document.addEventListener('click', function (e) {
    if (e.target.closest('[data-close]')) $('overlay').classList.add('hidden');
    if (e.target.closest('[data-why]')) openWhy();
    if (e.target.closest('[data-menu]')) { $('overlay').classList.add('hidden'); show(backView()); }
    if (e.target.closest('[data-pnext]')) { $('overlay').classList.add('hidden'); openPackCase(ctx.idx + 1); return; }
    var nx = e.target.closest('[data-next]');
    if (nx) { $('overlay').classList.add('hidden'); loadCase(nx.dataset.next); enter(); return; }
    var im = e.target.closest('[data-img]'); if (im) { shareImage(im); return; }
    var sh = e.target.closest('[data-share]');
    if (sh) {
      var txt = sh.parentNode.querySelector('.share').textContent;
      if (navigator.share) { navigator.share({ text: txt }).catch(function () {}); return; }
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(txt).then(function () { sh.textContent = '¡Copiado!'; }, function () { sh.textContent = 'Copia el texto de arriba'; });
      else sh.textContent = 'Copia el texto de arriba';
    }
  });

  /* ----- «¿Por qué?»: la deducción paso a paso ----- */
  function openWhy() {
    var ex = M.explain(cs, th), h = '<p class="why-intro">Así se deducía el caso, dato a dato. Toca una <b>pista</b> para releerla. Los pasos 🎯 son los que señalan al culpable.</p>';
    ex.steps.forEach(function (s) {
      h += '<div class="wstep' + (s.culprit ? ' culprit' : '') + '"><div class="wn">' + (s.culprit ? '🎯' : s.n) + '</div><div class="wc"><div class="wh">' + s.head + '</div><ul class="wl">' + s.body + '</ul><div class="pq hidden"></div></div></div>';
    });
    $('whyBody').innerHTML = h; $('why').classList.remove('hidden'); $('whyBody').scrollTop = 0;
  }
  function closeWhy() { $('why').classList.add('hidden'); }
  $('whyClose').onclick = closeWhy;
  $('why').addEventListener('click', function (e) {
    if (e.target === $('why')) { closeWhy(); return; }
    var pr = e.target.closest('.pref'); if (!pr) return;
    var box = pr.closest('.wc').querySelector('.pq'), qn = +pr.dataset.q;
    if (!box.classList.contains('hidden') && box.dataset.q === String(qn)) { box.classList.add('hidden'); return; }
    box.dataset.q = qn; box.innerHTML = '<b>Pista ' + (qn + 1) + ':</b> ' + M.renderClueHTML(cs.clues[qn], th); box.classList.remove('hidden');
  });

  /* ----- tiempo de juego (base para futuros rankings): solo cuenta con el tablero abierto ----- */
  setInterval(function () {
    if (curView === 'kase' && !over() && document.visibilityState === 'visible' && $('overlay').classList.contains('hidden')) {
      secs++; if (secs % 5 === 0) save('time:' + K, secs);
    }
  }, 1000);

  /* ---------- cambio de caso (dificultad) ---------- */
  function loadCase(d, c) {
    if (K && game) save('time:' + K, secs);
    if (c) { ctx = c; if (c.kind === 'pack') curPack = c.pack; }
    cdate = (ctx.kind === 'daily' && ctx.date) ? ctx.date : date; hist = [];
    cdiff = d; fresh = null;
    if (ctx.kind === 'daily' && !ctx.date) { diff = d; save('diff', d); }
    K = caseKey(d); cs = caseOf(d);
    game = load(K) || { tries: 0, wrong: [], solved: false, failed: false, started: false };
    marks = load('marks:' + K) || { p: zeros(), w: zeros() };
    used = load('used:' + K) || [];
    secs = load('time:' + K) || 0;
    th = cs.th; N = cs.n;                       // cada caso trae su selección de sospechosos, lugares y objetos
    cp = th.places[cs.crimePlace]; cw = th.weapons[cs.crimeWeapon];
    seed = ctx.kind === 'pack' ? (ctx.idx + 1) * 37 + th.hue : M.caseNumber(cdate) * 31 + th.hue;
    setHue(th.hue); fillBrief();
    var pair = '<div class="polaroid"><div class="big">' + cp.e + '</div><div class="lab">Lugar del crimen</div><b>' + cp.a + ' ' + cp.n + '</b></div><div class="plus">+</div>' +
      '<div class="polaroid"><div class="big">' + cw.e + '</div><div class="lab">Arma</div><b>' + cw.a + ' ' + cw.n + '</b></div>';
    $('bPair').innerHTML = pair;
    buildBoard();
  }

  /* ============================== LIBRETA DEL DETECTIVE (rangos y colección) ============================== */
  var RANKS = [[0, 'Novato', '🔰'], [1, 'Aprendiz', '🔍'], [5, 'Agente', '🕴️'], [12, 'Detective', '🕵️'], [25, 'Inspector', '🎖️'], [50, 'Comisario', '⭐'], [100, 'Leyenda', '👑']];
  function rankFor(n) {
    var i, k = 0; for (i = 0; i < RANKS.length; i++) if (n >= RANKS[i][0]) k = i;
    return { min: RANKS[k][0], name: RANKS[k][1], ico: RANKS[k][2], next: RANKS[k + 1] || null };
  }
  function bookGet() { var b = load('book'); return b && b.keys ? b : { total: 0, themes: {}, keys: {} }; }
  function themeName(id) { var t = M.themeOf(id), p = M.packById(id); return t ? t.nombre : p ? p.nombre : id; }
  function recordSolved() {                     // cada caso (y dificultad) cuenta una sola vez
    var b = bookGet(), out = {};
    if (b.keys[K]) return out;
    var before = rankFor(b.total).name, first = !b.themes[th.id];
    b.keys[K] = 1; b.total++; b.themes[th.id] = (b.themes[th.id] || 0) + 1; save('book', b);
    if (rankFor(b.total).name !== before) out.rankUp = rankFor(b.total).name;
    if (first) out.seal = themeName(th.id);
    return out;
  }
  function renderBook() {
    var b = bookGet(), r = rankFor(b.total), nx = r.next, pct = nx ? Math.round((b.total - r.min) / (nx[0] - r.min) * 100) : 100;
    var h = '<div class="bk-rank"><div class="bk-ico">' + r.ico + '</div><div><b>' + r.name + '</b><small>' + b.total + (b.total === 1 ? ' caso resuelto' : ' casos resueltos') + ' · 🔥 racha ' + streakNow() + '</small></div></div>' +
      '<div class="bk-bar"><i style="width:' + Math.max(pct, 4) + '%"></i></div><div class="bk-next">' + (nx ? 'Próximo rango: <b>' + nx[1] + '</b> · faltan ' + (nx[0] - b.total) : 'Has alcanzado el rango máximo') + '</div>';
    h += '<h4>⏱ Tus mejores tiempos</h4><div class="bk-times">' + ORDER.map(function (d) { return '<div><span>' + DIFFS[d].ico + ' ' + DIFFS[d].label + '</span><b>' + (bests[d] ? mmss(bests[d]) : '—') + '</b></div>'; }).join('') + '</div>';
    var all = M.THEMES.map(function (t) { return { id: t.id, nombre: t.nombre, ico: t.ico }; }).concat(M.PACKS.map(function (p) { return { id: p.id, nombre: p.nombre, ico: p.ico, pack: true }; }));
    var got = all.filter(function (x) { return b.themes[x.id]; }).length;
    h += '<h4>🗂️ Colección de escenarios <span>' + got + '/' + all.length + '</span></h4><div class="bk-coll">' + all.map(function (x) {
      var n = b.themes[x.id] || 0;
      return '<div class="seal' + (n ? ' got' : '') + (x.pack ? ' pack' : '') + '"><span class="si">' + (n ? x.ico : '❔') + '</span><b>' + x.nombre + '</b><small>' + (n ? n + (n === 1 ? ' caso' : ' casos') : 'sin investigar') + '</small></div>';
    }).join('') + '</div><p class="bk-hint">Cierra un caso en cada escenario para conseguir su sello. Los escenarios van rotando cada día; los de pack se juegan cuando quieras.</p>';
    $('bookBody').innerHTML = h;
  }
  function openBook() { renderBook(); $('book').classList.remove('hidden'); }
  function closeBook() { $('book').classList.add('hidden'); }
  $('bookClose').onclick = closeBook;
  $('book').addEventListener('click', function (e) { if (e.target === $('book')) closeBook(); });

  /* ============================== PACKS TEMÁTICOS ============================== */
  var starsOf = function (g) { return g && g.solved ? (g.stars || Math.max(1, 4 - g.tries)) : 0; };
  function packStats(pk, d) {
    var solved = 0, stars = 0, i, g;
    for (i = 0; i < pk.count; i++) { g = load(pkKey(pk.id, i, d)); if (g && g.solved) { solved++; stars += starsOf(g); } }
    return { solved: solved, stars: stars };
  }
  // un capítulo se abre cuando el anterior está cerrado (resuelto o caso frío) en cualquier dificultad
  function chapOpen(pk, i) {
    if (i === 0) return true;
    return ORDER.some(function (d) { var g = load(pkKey(pk.id, i - 1, d)); return g && (g.solved || g.failed); });
  }
  function renderPacks() {
    $('pkList').innerHTML = M.PACKS.map(function (pk) {
      return '<button class="pk-card" data-pack="' + pk.id + '"><div class="pk-art">' + window.Hero.svg(pk.theme.id, 3) + '</div><div class="pk-info">' +
        '<div class="pk-tag">PACK ' + pad(M.PACKS.indexOf(pk) + 1) + ' · SAGA · BETA</div><h3>' + pk.nombre + '</h3><em>' + pk.lema + '</em><p>' + pk.desc + '</p>' +
        '<div class="pk-meta"><span>📖 ' + pk.count + ' capítulos</span><span>🎚️ 3 dificultades</span><span>🎁 ' + pk.free + ' gratis</span></div><span class="pk-go">Ver pack ▶</span></div></button>';
    }).join('');
  }
  $('pkList').addEventListener('click', function (e) { var c = e.target.closest('.pk-card'); if (c) { curPack = c.dataset.pack; show('pack'); } });
  var pDustDone = false, betaSaid = false;
  function renderPack() {
    var pk = PK(), s = packStats(pk, pdiff), i, g, th0, cls, st, tiles = '';
    if (!pDustDone) { dust($('pDust'), 14); pDustDone = true; }
    $('pArt').innerHTML = window.Hero.svg(pk.theme.id, 5);
    $('pEyebrow').textContent = 'Pack · ' + pk.lema;
    $('pTitle').textContent = pk.nombre;
    $('pIntro').textContent = pk.desc;
    $('pChips').innerHTML = '<span>📁 ' + pk.count + ' capítulos</span><span>🎁 ' + pk.free + ' gratis</span><span>💎 ' + (pk.count - pk.free) + ' premium</span>';
    $('pDiff').innerHTML = '';
    ORDER.forEach(function (d) {
      var b = document.createElement('button'), ps = packStats(pk, d);
      b.className = 'dpill' + (d === pdiff ? ' on' : ''); b.setAttribute('role', 'tab'); b.setAttribute('aria-selected', d === pdiff ? 'true' : 'false');
      b.innerHTML = '<span class="ic">' + DIFFS[d].ico + '</span><span>' + DIFFS[d].label + '</span><span class="st">' + ps.solved + '/' + pk.count + '</span>';
      b.onclick = function () { pdiff = d; save('pdiff', d); buzz(8); renderPack(); };
      $('pDiff').appendChild(b);
    });
    $('pProg').innerHTML = '<div><b>' + s.solved + '/' + pk.count + '</b><small>resueltos</small></div><div><b>★ ' + s.stars + '/' + pk.count * 3 + '</b><small>estrellas</small></div><div class="pbar"><i style="width:' + Math.round(s.solved / pk.count * 100) + '%"></i></div>';
    for (i = 0; i < pk.count; i++) {
      g = load(pkKey(pk.id, i, pdiff)); th0 = M.packTheme(pk, i);
      var lock = !chapOpen(pk, i);
      if (lock) { cls = 'lock'; st = '🔒 Cierra el anterior'; }
      else if (g && g.solved) { cls = 'ok'; st = '<span class="stars">' + '★'.repeat(starsOf(g)) + '<u>' + '★'.repeat(3 - starsOf(g)) + '</u></span>'; }
      else if (g && g.failed) { cls = 'cold'; st = '❄ Caso frío'; }
      else if (g && (g.started || g.tries)) { cls = 'run'; st = '▶ En curso'; }
      else { cls = ''; st = 'Sin empezar'; }
      tiles += '<button class="pk-tile ' + cls + (i >= pk.free ? ' prem' : '') + '" data-i="' + i + '"><span class="pn">' + pad(i + 1) + '</span><span class="pt">' + (lock ? 'Capítulo ' + (i + 1) + ' · ???' : th0.titulo) + '</span><span class="ps">' + st + '</span>' +
        '<span class="pb ' + (i < pk.free ? 'free' : 'premium') + '">' + (i < pk.free ? 'GRATIS' : '💎 PREMIUM') + '</span></button>';
    }
    $('pGrid').innerHTML = tiles;
    var got = 0, board = '';
    for (i = 0; i < pk.count; i++) {
      var pr = pk.cap[i].prueba, has = ORDER.some(function (d) { var g3 = load(pkKey(pk.id, i, d)); return g3 && g3.solved; });
      if (has) got++;
      board += has ? '<div class="ev got" style="--t:' + ((i * 37 % 7) - 3) + 'deg"><span class="pin"></span><div class="evi">' + pr.i + '</div><b>' + pr.t + '</b><small>' + pr.d + '</small><u>Cap. ' + (i + 1) + '</u></div>'
                   : '<div class="ev" style="--t:' + ((i * 37 % 7) - 3) + 'deg"><span class="pin"></span><div class="evi">❔</div><b>Sin descubrir</b><small>Cierra el capítulo ' + (i + 1) + ' para encontrar esta prueba.</small></div>';
    }
    $('pBoard').innerHTML = '<h4>🧩 Tablón de pruebas <span>' + got + '/' + pk.count + '</span></h4><div class="evg">' + board + '</div>';
    $('pBoard').innerHTML += '<button class="btn diarybtn" id="pDiary">📖 Diario del caso <span>' + diaryCount(pk) + '/' + pk.count + '</span></button>';
    $('pNote').textContent = pk.nota + ' En la beta los capítulos premium están abiertos para probar.';
  }
  $('pGrid').addEventListener('click', function (e) {
    var t = e.target.closest('.pk-tile'); if (!t) return;
    var i = +t.dataset.i;
    if (!chapOpen(PK(), i)) { toast('🔒 Cierra primero el capítulo ' + i + ': la historia sigue su orden', true); return; }
    if (i >= PK().free && !betaSaid) { betaSaid = true; toast('💎 Premium · abierto gratis durante la beta', true); }
    openPackCase(i);
  });
  function openPackCase(i) {
    if (!tutDone) { gateHint(); return; }
    loadCase(pdiff, { kind: 'pack', pack: curPack, idx: i });
    if (over()) { show('kase'); setActive(cs.culprit, 0); showOverlay(false); }
    else if (hasProgress()) show('kase');
    else show('brief');
  }
  $('pkBack').onclick = function () { show('menu'); };
  $('pBack').onclick = function () { show('packs'); };

  /* ============================== ARCHIVO (casos de días anteriores) ============================== */
  var archSel = null, DAYS_BACK = 14;
  function dayStatus(ds) {
    var res = { done: 0, cold: 0, run: 0 };
    ORDER.forEach(function (d) { var g = load(ds + (d === 'normal' ? '' : '~' + d)); if (g && g.solved) res.done++; else if (g && g.failed) res.cold++; else if (g && (g.started || g.tries)) res.run++; });
    return res;
  }
  function renderArch() {
    var h = '', k, ds, t, st, dd, dow = ['D', 'L', 'M', 'X', 'J', 'V', 'S'], total = 0, ok = 0;
    for (k = 1; k <= DAYS_BACK; k++) {
      var dd0 = new Date(date + 'T12:00:00'); dd0.setDate(dd0.getDate() - k); ds = fmt(dd0); t = M.dayTheme(ds); st = dayStatus(ds); total += 3; ok += st.done;
      h += '<button class="ad' + (st.done === 3 ? ' full' : st.done ? ' part' : '') + (archSel === ds ? ' sel' : '') + '" data-d="' + ds + '" style="--ah:' + t.hue + '"><span class="adw">' + dow[dd0.getDay()] + '</span><b>' + dd0.getDate() + '</b><span class="adi">' + t.ico + '</span><span class="adk">' + (st.done ? '✓'.repeat(st.done) : st.cold ? '❄' : '·') + '</span></button>';
    }
    $('archGrid').innerHTML = h;
    $('archProg').innerHTML = '<b>' + ok + '</b> de ' + total + ' casos resueltos en los últimos ' + DAYS_BACK + ' días';
    var box = $('archDay');
    if (!archSel) { box.classList.add('hidden'); return; }
    var T = M.dayTheme(archSel), dtt = new Date(archSel + 'T12:00:00');
    box.classList.remove('hidden');
    box.innerHTML = '<div class="adh"><span class="adhi">' + T.ico + '</span><div><small>' + dtt.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' }) + ' · caso nº ' + M.caseNumber(archSel) + '</small><b>' + T.titulo + '</b><em>' + T.lugar + '</em></div></div><div class="adbtns">' +
      ORDER.map(function (d) {
        var g = load(archSel + (d === 'normal' ? '' : '~' + d)), tag = g && g.solved ? '<i>✓ ' + '★'.repeat(starsOf(g)) + '</i>' : g && g.failed ? '<i>❄ frío</i>' : g && (g.started || g.tries) ? '<i>▶ en curso</i>' : '<i>nuevo</i>';
        return '<button class="btn" data-ad="' + d + '">' + DIFFS[d].ico + ' ' + DIFFS[d].label + tag + '</button>';
      }).join('') + '</div>';
  }
  $('archGrid').addEventListener('click', function (e) { var b = e.target.closest('.ad'); if (!b) return; archSel = b.dataset.d; buzz(6); renderArch(); $('archDay').scrollIntoView({ behavior: 'smooth', block: 'nearest' }); });
  $('archDay').addEventListener('click', function (e) {
    var b = e.target.closest('[data-ad]'); if (!b) return;
    if (!tutDone) { gateHint(); return; }
    loadCase(b.dataset.ad, { kind: 'daily', date: archSel });
    if (over()) { show('kase'); setActive(cs.culprit, 0); showOverlay(false); } else if (hasProgress()) show('kase'); else show('brief');
  });
  $('archBack').onclick = function () { show('menu'); };
  $('mArch').onclick = function () { if (!tutDone) { gateHint(); return; } show('arch'); };

  /* ============================== AJUSTES + COPIA DE SEGURIDAD ============================== */
  function allSaved() { var o = {}, i, k; try { for (i = 0; i < localStorage.length; i++) { k = localStorage.key(i); if (k.indexOf('misterio') === 0) o[k] = localStorage.getItem(k); } } catch (e) {} return o; }
  function exportCode() { return 'MD1:' + btoa(unescape(encodeURIComponent(JSON.stringify(allSaved())))); }
  function importCode(s) {
    s = (s || '').trim(); if (s.slice(0, 4) !== 'MD1:') throw new Error('formato');
    var o = JSON.parse(decodeURIComponent(escape(atob(s.slice(4))))), n = 0;
    Object.keys(o).forEach(function (k) { if (k.indexOf('misterio') === 0 && typeof o[k] === 'string') { localStorage.setItem(k, o[k]); n++; } });
    if (!n) throw new Error('vacío'); return n;
  }
  function renderSet() {
    function row(id, ico, t, d) { return '<label class="srow"><span class="si">' + ico + '</span><span class="st"><b>' + t + '</b><small>' + d + '</small></span><input type="checkbox" data-set="' + id + '"' + (set[id] ? ' checked' : '') + '><i class="sw"></i></label>'; }
    $('setBody').innerHTML = row('snd', '🔊', 'Sonido', 'Sellos, marcas y fanfarria (sintetizados, sin descargas)') + row('vib', '📳', 'Vibración', 'Respuesta háptica en el móvil') +
      row('big', '🔠', 'Texto grande', 'Más cómodo para leer pistas e historias') + row('calm', '🧘', 'Menos animaciones', 'Quita movimientos y efectos de fondo') +
      '<h4>💾 Copia de seguridad</h4><p class="sdesc">Tu progreso se guarda en este navegador. Para llevarlo a otro móvil u ordenador, copia el código y pégalo allí.</p>' +
      '<div class="sbtns"><button class="btn" id="setExp">📋 Copiar mi código</button><button class="btn ghost" id="setImpB">📥 Pegar un código</button></div>' +
      '<div class="simp hidden" id="setImp"><textarea id="setTxt" rows="3" placeholder="Pega aquí el código (empieza por MD1:)"></textarea><button class="btn" id="setGo">Restaurar progreso</button></div>' +
      '<h4>📲 Instalar como app</h4><p class="sdesc">' + (instPrompt ? 'Añade Misterio diario a tu pantalla de inicio y juega a pantalla completa, también sin conexión.' : 'Si abres el juego desde su dirección web, tu navegador te ofrecerá instalarlo (en iPhone: Compartir → Añadir a pantalla de inicio).') + '</p>' + (instPrompt ? '<button class="btn" id="setInst">Instalar</button>' : '') + '<h4>🧹 Empezar de cero</h4><p class="sdesc">Borra casos, racha, rangos y sellos de este navegador. No se puede deshacer.</p><button class="btn red" id="setWipe">Borrar todo mi progreso</button><p class="sver">Misterio diario · prototipo v12</p>';
  }
  $('setBody').addEventListener('change', function (e) {
    var c = e.target.closest('[data-set]'); if (!c) return;
    set[c.dataset.set] = c.checked; save('set', set); applySet(); sfx('ok'); buzz(10);
  });
  $('setBody').addEventListener('click', function (e) {
    var b = e.target.closest('button'); if (!b) return;
    if (b.id === 'setExp') {
      var code = exportCode();
      if (navigator.clipboard && navigator.clipboard.writeText) navigator.clipboard.writeText(code).then(function () { toast('📋 Código copiado (' + Math.round(code.length / 1024 * 10) / 10 + ' KB)', true); }, function () { $('setImp').classList.remove('hidden'); $('setTxt').value = code; $('setTxt').select(); toast('Copia el código del recuadro', true); });
      else { $('setImp').classList.remove('hidden'); $('setTxt').value = code; $('setTxt').select(); toast('Copia el código del recuadro', true); }
    } else if (b.id === 'setImpB') { $('setImp').classList.toggle('hidden'); }
    else if (b.id === 'setGo') {
      try { var n = importCode($('setTxt').value); toast('✅ Progreso restaurado (' + n + ' datos). Recargando…', true); setTimeout(function () { location.reload(); }, 900); }
      catch (err) { toast('⚠️ Ese código no es válido', false); }
    } else if (b.id === 'setWipe') {
      if (!b.dataset.sure) { b.dataset.sure = '1'; b.textContent = '¿Seguro? Pulsa otra vez para borrar'; setTimeout(function () { b.dataset.sure = ''; b.textContent = 'Borrar todo mi progreso'; }, 4000); return; }
      try { Object.keys(allSaved()).forEach(function (k) { localStorage.removeItem(k); }); } catch (x) {}
      location.reload();
    }
  });
  var instPrompt = null;
  window.addEventListener('beforeinstallprompt', function (e) { e.preventDefault(); instPrompt = e; });
  function openSet() { renderSet(); $('set').classList.remove('hidden'); }
  function closeSet() { $('set').classList.add('hidden'); }
  document.addEventListener('click', function (e) { if (e.target.closest('#setInst') && instPrompt) { instPrompt.prompt(); instPrompt = null; renderSet(); } });
  $('mSet').onclick = openSet; $('setClose').onclick = closeSet;
  $('set').addEventListener('click', function (e) { if (e.target === $('set')) closeSet(); });


  /* ----- Diario de la saga: releer los capítulos ya cerrados + final de temporada ----- */
  function chapSolved(pk, i) { return ORDER.some(function (d) { var g = load(pkKey(pk.id, i, d)); return g && g.solved; }); }
  function diaryCount(pk) { var n = 0, i; for (i = 0; i < pk.count; i++) if (chapSolved(pk, i)) n++; return n; }
  function openDiary() {
    var pk = PK(), h = '', i, c, n = diaryCount(pk);
    if (n === pk.count) {
      h += '<div class="dfin"><b>🏁 Temporada completa</b><span>Has cerrado los ' + pk.count + ' capítulos de «' + pk.nombre + '». Estos fueron los culpables:</span><ol>' +
        pk.cap.map(function (x, k) { var s = pk.theme.suspects[byNameIdx(pk.theme.suspects, x.culpable)]; return '<li><i>' + pad(k + 1) + '</i> ' + (s ? s.e : '') + ' <b>' + x.culpable + '</b><small>' + x.t + '</small></li>'; }).join('') + '</ol></div>';
    }
    for (i = 0; i < pk.count; i++) {
      c = pk.cap[i];
      if (!chapSolved(pk, i)) { h += '<section class="dch lock"><h5>🔒 Capítulo ' + (i + 1) + '</h5><p>Ciérralo para añadirlo al diario.</p></section>'; continue; }
      h += '<section class="dch"><h5><i>' + pad(i + 1) + '</i> ' + c.t + '</h5><small>' + c.l + ' · ' + c.victima + '</small>' +
        c.intro.map(function (p) { return '<p>' + p + '</p>'; }).join('') + '<div class="dsep">🔎 Lo que ocurrió de verdad</div>' + c.epi.map(function (p) { return '<p>' + p + '</p>'; }).join('') +
        (c.gancho ? '<div class="gancho"><b>▶ Y después…</b><span>' + c.gancho + '</span></div>' : '') + '<div class="dpr">' + c.prueba.i + ' <b>' + c.prueba.t + '</b> — ' + c.prueba.d + '</div></section>';
    }
    $('diaryBody').innerHTML = h; $('diaryT').textContent = '📖 ' + pk.nombre; $('diary').classList.remove('hidden'); $('diaryBody').scrollTop = 0;
  }
  function byNameIdx(list, key) { for (var i = 0; i < list.length; i++) if (list[i].n === key || list[i].s === key) return i; return -1; }
  function closeDiary() { $('diary').classList.add('hidden'); }
  document.addEventListener('click', function (e) { if (e.target.closest('#pDiary')) openDiary(); if (e.target === $('diary')) closeDiary(); });
  $('diaryClose').onclick = closeDiary;

  /* ---------- arranque ---------- */
  loadCase(diff); menuRefresh();
  window.__misterio = { cs: function () { return cs; }, openPackCase: openPackCase, ctx: function () { return ctx; }, openBook: openBook, show: show, setActive: setActive, loadCase: loadCase, state: function () { return { curView: curView, act: act, secs: secs, game: game, diff: diff, tutDone: tutDone }; } }; // ayuda para pruebas
})();
