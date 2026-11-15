/* Medición anónima (GoatCounter): sin cookies ni datos personales. Solo se activa en la web publicada.
   Además de visitas, envía hitos contados en el propio navegador (cada uno una sola vez): primera visita,
   vuelta a los 1/2/3/7/14 días, tutorial hecho, casos resueltos (1/3/10) y capítulos de saga (1/3/5/10). */
(function () {
  try {
    if (location.hostname !== 'skyy-00.github.io') return;
    var KEY = 'misterio7:an', st;
    try { st = JSON.parse(localStorage.getItem(KEY)) || {}; } catch (e) { st = {}; }
    st.sent = st.sent || {};
    var day = Math.floor((Date.now() - new Date().getTimezoneOffset() * 6e4) / 864e5);
    if (st.fv === undefined) st.fv = day;
    function num(k) { try { return JSON.parse(localStorage.getItem('misterio7:' + k)); } catch (e) { return null; } }
    var ev = ['abre'];
    if (st.fv === day && !st.sent.nuevo) ev.push('nuevo');
    var best = 0; [1, 2, 3, 7, 14].forEach(function (n) { if (day - st.fv >= n) best = n; }); if (best) ev.push('vuelve-d' + best);
    if (localStorage.getItem('misterio7:tut')) ev.push('tutorial-hecho');
    var b = num('book'), total = b && b.total ? b.total : 0, i, k, g, caps = 0;
    [1, 3, 10].forEach(function (n) { if (total >= n) ev.push('casos-' + n); });
    for (i = 0; i < localStorage.length; i++) {
      k = localStorage.key(i);
      if (k && k.indexOf('misterio7:pk:') === 0) { try { g = JSON.parse(localStorage.getItem(k)); if (g && g.solved) caps++; } catch (e) {} }
    }
    [1, 3, 5, 10].forEach(function (n) { if (caps >= n) ev.push('saga-cap-' + n); });
    var s = document.createElement('script');
    s.async = true; s.setAttribute('data-goatcounter', 'https://misterio-diario.goatcounter.com/count'); s.src = 'https://gc.zgo.at/count.js';
    s.onload = function () {
      ev.forEach(function (e) {
        if (e === 'abre' || !st.sent[e]) { try { window.goatcounter.count({ path: 'ev/' + e, title: e, event: true }); } catch (x) {} if (e !== 'abre') st.sent[e] = 1; }
      });
      try { localStorage.setItem(KEY, JSON.stringify(st)); } catch (x) {}
    };
    document.head.appendChild(s);
  } catch (e) {}
})();
