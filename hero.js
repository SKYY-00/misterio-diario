/* Portadas ilustradas (SVG + CSS) para cada ambientación. */
(function (root) {
  'use strict';
  function lcg(seed) { var s = (seed * 9301 + 49297) % 233280; return function () { s = (s * 9301 + 49297) % 233280; return s / 233280; }; }
  var GLOW = '<filter id="glow" x="-50%" y="-50%" width="200%" height="200%"><feGaussianBlur stdDeviation="3.2" result="b"/><feMerge><feMergeNode in="b"/><feMergeNode in="SourceGraphic"/></feMerge></filter>' +
             '<filter id="blur8"><feGaussianBlur stdDeviation="9"/></filter>';

  function stars(r, n, ymax) {
    var s = '';
    for (var i = 0; i < n; i++) s += '<circle cx="' + (r() * 720).toFixed(0) + '" cy="' + (r() * ymax).toFixed(0) + '" r="' + (r() * 1.3 + .3).toFixed(1) + '" fill="#fff" opacity="' + (r() * .6 + .2).toFixed(2) + '"/>';
    return s;
  }

  function mansion(r) {
    var win = '', i, j;
    for (j = 0; j < 2; j++) for (i = 0; i < 6; i++) {
      var lit = r() < .62, cls = (j === 0 && i === 3) ? ' class="flick"' : '';
      win += '<rect x="' + (254 + i * 38) + '" y="' + (176 + j * 50) + '" width="18" height="28" rx="1.5" fill="' + (lit ? '#ffd27a' : '#1a1020') + '"' + (lit ? ' filter="url(#glow)"' : '') + cls + '/>';
    }
    [[172, 222], [524, 222]].forEach(function (p) { win += '<rect x="' + p[0] + '" y="' + p[1] + '" width="16" height="24" rx="1.5" fill="' + (r() < .5 ? '#ffd27a' : '#1a1020') + '"/>'; });
    var tree = function (x, flip) {
      var f = flip ? -1 : 1;
      return '<g stroke="#07040c" stroke-width="5" stroke-linecap="round" fill="none"><path d="M' + x + ' 310 L' + (x + 2 * f) + ' 220 M' + (x + 2 * f) + ' 250 L' + (x - 34 * f) + ' 208 M' + (x + 2 * f) + ' 232 L' + (x + 36 * f) + ' 194 M' + (x + 2 * f) + ' 214 L' + (x - 6 * f) + ' 172 M' + (x + 36 * f) + ' 194 L' + (x + 62 * f) + ' 180 M' + (x - 34 * f) + ' 208 L' + (x - 58 * f) + ' 204"/></g>';
    };
    return '<svg viewBox="0 0 720 320" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><defs>' + GLOW +
      '<linearGradient id="sk" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0e0618"/><stop offset=".55" stop-color="#3b1631"/><stop offset="1" stop-color="#8a4128"/></linearGradient>' +
      '<radialGradient id="mg"><stop offset="0" stop-color="#fff0c4" stop-opacity=".85"/><stop offset="1" stop-color="#fff0c4" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="720" height="320" fill="url(#sk)"/>' + stars(r, 34, 130) +
      '<circle cx="580" cy="78" r="96" fill="url(#mg)"/><circle cx="580" cy="78" r="31" fill="#fff4cf"/><circle cx="571" cy="70" r="6" fill="#e9dcae" opacity=".7"/><circle cx="592" cy="88" r="4" fill="#e9dcae" opacity=".6"/>' +
      '<g fill="#08050d"><rect x="232" y="150" width="256" height="142"/><polygon points="216,152 360,82 504,152"/><rect x="152" y="196" width="92" height="96"/><polygon points="142,198 198,156 254,198"/>' +
      '<rect x="476" y="196" width="92" height="96"/><polygon points="466,198 522,156 578,198"/><rect x="416" y="86" width="22" height="52"/><rect x="292" y="104" width="12" height="34"/><polygon points="286,106 298,90 310,106"/></g>' +
      win + '<path d="M344 292 V262 a16 16 0 0 1 32 0 V292Z" fill="#ffcf70" filter="url(#glow)"/>' +
      tree(70, false) + tree(650, true) +
      '<path d="M0 296 Q180 266 360 290 T720 284 V320 H0Z" fill="#07040c"/>' +
      '<g filter="url(#blur8)" fill="#fff"><ellipse class="drift" cx="200" cy="296" rx="190" ry="14" opacity=".16"/><ellipse class="drift b" cx="540" cy="300" rx="220" ry="16" opacity=".14"/></g></svg>';
  }

  function teatro(r) {
    var seats = '', i, row;
    for (row = 0; row < 2; row++) for (i = 0; i < 14; i++) {
      var x = i * 54 + (row ? 28 : 6) - 8, y = 292 + row * 20;
      seats += '<g fill="#0b0204"><circle cx="' + (x + 22) + '" cy="' + (y - 3) + '" r="9"/><rect x="' + x + '" y="' + y + '" width="44" height="40" rx="14"/></g>';
    }
    return '<svg viewBox="0 0 720 320" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><defs>' +
      '<linearGradient id="bg" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14040a"/><stop offset="1" stop-color="#3a0a16"/></linearGradient>' +
      '<linearGradient id="fold" x1="0" y1="0" x2=".13" y2="0" spreadMethod="repeat"><stop offset="0" stop-color="#5c0d1f"/><stop offset=".5" stop-color="#b3213d"/><stop offset="1" stop-color="#5c0d1f"/></linearGradient>' +
      '<linearGradient id="beam" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff3d1" stop-opacity=".9"/><stop offset="1" stop-color="#fff3d1" stop-opacity=".05"/></linearGradient>' +
      '<linearGradient id="floor" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#4a2410"/><stop offset="1" stop-color="#1c0c06"/></linearGradient>' +
      '<radialGradient id="pool"><stop offset="0" stop-color="#ffe9b0" stop-opacity=".85"/><stop offset="1" stop-color="#ffe9b0" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="720" height="320" fill="url(#bg)"/>' +
      '<polygon points="60,230 660,230 700,300 20,300" fill="url(#floor)"/>' +
      '<ellipse cx="360" cy="262" rx="150" ry="22" fill="url(#pool)"/>' +
      '<g class="sway"><polygon points="352,0 368,0 520,262 200,262" fill="url(#beam)" opacity=".55"/></g>' +
      '<circle cx="360" cy="6" r="14" fill="#fff6d8" filter="url(#glow)"/>' +
      '<path d="M0 0 H215 Q170 150 140 300 H0Z" fill="url(#fold)"/><path d="M720 0 H505 Q550 150 580 300 H720Z" fill="url(#fold)"/>' +
      '<path d="M0 0 H720 V34 Q690 56 660 34 Q630 56 600 34 Q570 56 540 34 Q510 56 480 34 Q450 56 420 34 Q390 56 360 34 Q330 56 300 34 Q270 56 240 34 Q210 56 180 34 Q150 56 120 34 Q90 56 60 34 Q30 56 0 34Z" fill="#7d1226"/>' +
      '<path d="M0 36 Q30 58 60 36 Q90 58 120 36 Q150 58 180 36 Q210 58 240 36 Q270 58 300 36 Q330 58 360 36 Q390 58 420 36 Q450 58 480 36 Q510 58 540 36 Q570 58 600 36 Q630 58 660 36 Q690 58 720 36" fill="none" stroke="#e0b04a" stroke-width="3"/>' +
      '<defs>' + GLOW + '</defs>' + seats + '</svg>';
  }

  function hotel(r) {
    var win = '', i, j, rain = '';
    for (j = 0; j < 9; j++) for (i = 0; i < 6; i++) {
      var lit = r() < .42;
      win += '<rect x="' + (252 + i * 36) + '" y="' + (92 + j * 22) + '" width="16" height="12" rx="1" fill="' + (lit ? '#ffd98a' : '#0a1a22') + '"' + (lit ? ' opacity="' + (.6 + r() * .4).toFixed(2) + '"' : '') + '/>';
    }
    for (i = 0; i < 70; i++) { var x = (r() * 780 - 30).toFixed(0), y = (r() * 300).toFixed(0); rain += '<line x1="' + x + '" y1="' + y + '" x2="' + (x - 6) + '" y2="' + (+y + 18) + '" style="animation-delay:-' + (r() * .75).toFixed(2) + 's"/>'; }
    var wave = function (cls, y, col, op) {
      var d = 'M0 ' + y; for (var k = 0; k < 6; k++) d += ' q45 -16 90 0 t90 0';
      return '<path class="wave ' + cls + '" d="' + d + ' V340 H0Z" fill="' + col + '" opacity="' + op + '"/>';
    };
    return '<svg viewBox="0 0 720 320" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><defs>' + GLOW +
      '<linearGradient id="hs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03111a"/><stop offset=".7" stop-color="#0b3a4c"/><stop offset="1" stop-color="#145a6c"/></linearGradient></defs>' +
      '<rect width="720" height="320" fill="url(#hs)"/>' +
      '<g fill="#02090e" opacity=".85"><ellipse cx="120" cy="40" rx="170" ry="34"/><ellipse cx="560" cy="26" rx="210" ry="40"/><ellipse cx="380" cy="70" rx="150" ry="22"/></g>' +
      '<g class="bolt"><polygon points="590,20 560,110 585,110 548,215 622,95 596,95 616,20" fill="#e9fbff" filter="url(#glow)"/><rect width="720" height="320" fill="#cfefff" opacity=".18"/></g>' +
      '<g fill="#04141b"><rect x="96" y="190" width="110" height="130"/><rect x="520" y="170" width="120" height="150"/><rect x="230" y="70" width="260" height="250"/><rect x="262" y="52" width="196" height="24"/><rect x="316" y="34" width="88" height="22"/></g>' +
      win +
      '<text class="neon" x="360" y="68" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="17" letter-spacing="8" fill="#7ff3ff" filter="url(#glow)">HOTEL</text>' +
      '<g fill="#04141b"><rect x="324" y="268" width="72" height="52"/></g><path d="M334 320 V286 a26 26 0 0 1 52 0 V320Z" fill="#ffd98a" opacity=".85" filter="url(#glow)"/>' +
      wave('', 296, '#082f3b', .95) + wave('b', 306, '#05212b', .95) +
      '<g class="rain" stroke="#bfe9f5" stroke-width="1.1" opacity=".42">' + rain + '</g></svg>';
  }

  function museo(r) {
    var cols = '', i, win = '';
    for (i = 0; i < 6; i++) cols += '<rect x="' + (236 + i * 50) + '" y="150" width="20" height="112" fill="#0a0414"/><rect x="' + (232 + i * 50) + '" y="144" width="28" height="9" fill="#0a0414"/><rect x="' + (232 + i * 50) + '" y="258" width="28" height="8" fill="#0a0414"/>';
    for (i = 0; i < 5; i++) win += '<rect x="' + (262 + i * 50) + '" y="180" width="18" height="70" fill="' + (r() < .55 ? '#e0b8ff' : '#2a1440') + '" opacity=".75"/>';
    return '<svg viewBox="0 0 720 320" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><defs>' + GLOW +
      '<linearGradient id="ms" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0b0420"/><stop offset=".6" stop-color="#2d1257"/><stop offset="1" stop-color="#6b2f86"/></linearGradient>' +
      '<linearGradient id="mb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#f1d9ff" stop-opacity=".8"/><stop offset="1" stop-color="#f1d9ff" stop-opacity="0"/></linearGradient></defs>' +
      '<rect width="720" height="320" fill="url(#ms)"/>' + stars(r, 40, 120) +
      '<circle cx="110" cy="70" r="26" fill="#f4e9ff" opacity=".95"/><circle cx="102" cy="64" r="5" fill="#d8c3ee" opacity=".7"/>' +
      '<g class="sway"><polygon points="70,320 110,320 330,0 300,0" fill="url(#mb)" opacity=".34"/></g>' +
      '<g class="sway b"><polygon points="620,320 660,320 440,0 410,0" fill="url(#mb)" opacity=".3"/></g>' +
      '<g fill="#0a0414"><polygon points="206,146 360,76 514,146"/><rect x="214" y="144" width="292" height="12"/>' + '<rect x="206" y="262" width="308" height="14"/><rect x="190" y="274" width="340" height="14"/><rect x="172" y="286" width="376" height="34"/></g>' +
      '<polygon points="236,142 360,88 484,142" fill="#1a0b30"/><circle cx="360" cy="120" r="10" fill="#ffd9a0" filter="url(#glow)"/>' +
      '<rect x="214" y="156" width="292" height="106" fill="#150826"/>' + win + cols +
      '<path d="M336 262 V224 a24 24 0 0 1 48 0 V262Z" fill="#ffd9a0" filter="url(#glow)"/>' +
      '<g fill="#0a0414"><rect x="40" y="248" width="30" height="72"/><circle cx="55" cy="232" r="18"/><rect x="650" y="252" width="30" height="68"/><circle cx="665" cy="238" r="16"/></g>' +
      '<g filter="url(#blur8)" fill="#e6d0ff"><ellipse class="drift" cx="200" cy="312" rx="200" ry="14" opacity=".16"/><ellipse class="drift b" cx="540" cy="316" rx="210" ry="14" opacity=".14"/></g></svg>';
  }

  function tren(r) {
    var wins = '', i, poles = '', puff = '';
    for (i = 0; i < 9; i++) wins += '<rect x="' + (66 + i * 70) + '" y="206" width="38" height="24" rx="4" fill="' + (r() < .8 ? '#ffe08a' : '#12261c') + '" filter="url(#glow)"/>';
    for (i = 0; i < 6; i++) poles += '<g stroke="#02100a" stroke-width="3"><line x1="' + (30 + i * 130) + '" y1="320" x2="' + (30 + i * 130) + '" y2="170"/><line x1="' + (12 + i * 130) + '" y1="182" x2="' + (48 + i * 130) + '" y2="182"/></g>';
    for (i = 0; i < 4; i++) puff += '<circle class="drift' + (i % 2 ? ' b' : '') + '" cx="' + (540 + i * 40) + '" cy="' + (130 - i * 12) + '" r="' + (18 + i * 7) + '" fill="#cfe9dc" opacity="' + (.2 - i * .035).toFixed(2) + '"/>';
    return '<svg viewBox="0 0 720 320" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><defs>' + GLOW +
      '<linearGradient id="ts" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#020f09"/><stop offset=".6" stop-color="#0b3a28"/><stop offset="1" stop-color="#1d6d4b"/></linearGradient></defs>' +
      '<rect width="720" height="320" fill="url(#ts)"/>' + stars(r, 36, 140) +
      '<circle cx="600" cy="62" r="24" fill="#f2ffe9" opacity=".92"/>' +
      '<path d="M0 210 L90 140 L170 190 L260 120 L350 188 L450 128 L560 196 L650 142 L720 190 V320 H0Z" fill="#05200f" opacity=".9"/>' +
      '<path d="M0 240 L120 186 L220 226 L330 176 L440 232 L560 188 L720 236 V320 H0Z" fill="#031309"/>' +
      poles + '<line x1="0" y1="188" x2="720" y2="206" stroke="#02100a" stroke-width="1.5"/>' +
      '<rect x="0" y="262" width="720" height="58" fill="#020b06"/><rect x="0" y="266" width="720" height="3" fill="#2a5a44"/>' +
      '<g fill="#03140c"><rect x="44" y="196" width="632" height="62" rx="8"/><rect x="560" y="160" width="116" height="40" rx="6"/><rect x="580" y="128" width="30" height="34"/></g>' +
      wins + '<rect x="566" y="170" width="30" height="22" rx="3" fill="#ffe08a" filter="url(#glow)"/>' +
      '<g fill="#02100a"><circle cx="90" cy="262" r="13"/><circle cx="180" cy="262" r="13"/><circle cx="440" cy="262" r="13"/><circle cx="530" cy="262" r="13"/><circle cx="620" cy="262" r="13"/></g>' +
      puff + '<g filter="url(#blur8)" fill="#d6f2e3"><ellipse class="drift" cx="220" cy="300" rx="230" ry="12" opacity=".12"/></g></svg>';
  }

  function rodaje(r) {
    var spots = '', i;
    for (i = 0; i < 5; i++) spots += '<g class="sway' + (i % 2 ? ' b' : '') + '"><polygon points="' + (90 + i * 135) + ',22 ' + (110 + i * 135) + ',22 ' + (180 + i * 135 - 120) + ',268 ' + (20 + i * 135 - 40) + ',268" fill="url(#rb)" opacity=".32"/></g>' +
      '<g fill="#12040f"><rect x="' + (84 + i * 135) + '" y="10" width="32" height="18" rx="3"/></g><circle cx="' + (100 + i * 135) + '" cy="30" r="6" fill="#ffe3f7" filter="url(#glow)"/>';
    return '<svg viewBox="0 0 720 320" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><defs>' + GLOW +
      '<linearGradient id="rs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#14041a"/><stop offset="1" stop-color="#3c0f3f"/></linearGradient>' +
      '<linearGradient id="rb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffd6f5" stop-opacity=".9"/><stop offset="1" stop-color="#ffd6f5" stop-opacity="0"/></linearGradient>' +
      '<radialGradient id="rp"><stop offset="0" stop-color="#ffc9ef" stop-opacity=".7"/><stop offset="1" stop-color="#ffc9ef" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="720" height="320" fill="url(#rs)"/>' +
      '<rect x="0" y="40" width="720" height="6" fill="#0e0312"/>' + spots +
      '<polygon points="30,270 690,270 720,320 0,320" fill="#1d0720"/><ellipse cx="360" cy="276" rx="250" ry="20" fill="url(#rp)"/>' +
      '<g fill="#0a020c"><rect x="420" y="170" width="86" height="56" rx="6"/><rect x="506" y="184" width="30" height="26" rx="3"/><circle cx="440" cy="162" r="16"/><circle cx="482" cy="162" r="16"/><line x1="440" y1="226" x2="410" y2="290" stroke="#0a020c" stroke-width="6"/><line x1="470" y1="226" x2="470" y2="292" stroke="#0a020c" stroke-width="6"/><line x1="500" y1="226" x2="536" y2="290" stroke="#0a020c" stroke-width="6"/></g>' +
      '<g transform="rotate(-9 220 214)"><rect x="130" y="196" width="190" height="86" rx="6" fill="#0a020c"/><rect x="130" y="172" width="190" height="26" rx="4" fill="#0a020c"/>' +
      '<g fill="#ffe3f7" opacity=".85"><polygon points="146,172 176,172 160,198 130,198"/><polygon points="196,172 226,172 210,198 180,198"/><polygon points="246,172 276,172 260,198 230,198"/><polygon points="296,172 322,172 308,198 280,198"/></g></g>' +
      '<g class="flick"><rect x="596" y="224" width="86" height="30" rx="5" fill="#2a0612" stroke="#ff3b5c" stroke-width="2"/><text class="neon" x="639" y="245" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="14" letter-spacing="3" fill="#ff5a78" filter="url(#glow)">ON AIR</text></g>' +
      '<g filter="url(#blur8)" fill="#ffd6f5"><ellipse class="drift" cx="200" cy="308" rx="220" ry="12" opacity=".13"/><ellipse class="drift b" cx="540" cy="312" rx="200" ry="12" opacity=".12"/></g></svg>';
  }

  function crucero(r) {
    var win = '', i, j, puff = '', glints = '';
    for (j = 0; j < 3; j++) for (i = 0; i < 18; i++) {
      var lit = r() < .7;
      win += '<rect x="' + (152 + i * 24) + '" y="' + (176 + j * 22) + '" width="12" height="10" rx="2" fill="' + (lit ? '#ffe2a0' : '#0a1330') + '"' + (lit ? ' opacity="' + (.65 + r() * .35).toFixed(2) + '"' : '') + '/>';
    }
    for (i = 0; i < 5; i++) win += '<rect x="' + (338 + i * 14) + '" y="130" width="8" height="8" rx="1.5" fill="#ffe2a0" opacity=".9"/>';
    for (i = 0; i < 4; i++) puff += '<circle class="drift' + (i % 2 ? ' b' : '') + '" cx="' + (312 + i * 30) + '" cy="' + (78 - i * 14) + '" r="' + (13 + i * 7) + '" fill="#d6e4ff" opacity="' + (.22 - i * .04).toFixed(2) + '"/>';
    for (i = 0; i < 7; i++) glints += '<rect class="drift' + (i % 2 ? ' b' : '') + '" x="' + (150 + r() * 420).toFixed(0) + '" y="' + (272 + i * 6) + '" width="' + (30 + r() * 60).toFixed(0) + '" height="2" rx="1" fill="#ffe2a0" opacity="' + (.12 + r() * .15).toFixed(2) + '"/>';
    var wave = function (cls, y, col, op) {
      var d = 'M0 ' + y; for (var k = 0; k < 6; k++) d += ' q45 -14 90 0 t90 0';
      return '<path class="wave ' + cls + '" d="' + d + ' V340 H0Z" fill="' + col + '" opacity="' + op + '"/>';
    };
    return '<svg viewBox="0 0 720 320" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><defs>' + GLOW +
      '<linearGradient id="cs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050a24"/><stop offset=".6" stop-color="#143c78"/><stop offset="1" stop-color="#2f78b0"/></linearGradient>' +
      '<radialGradient id="cm"><stop offset="0" stop-color="#eaf2ff" stop-opacity=".8"/><stop offset="1" stop-color="#eaf2ff" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="720" height="320" fill="url(#cs)"/>' + stars(r, 44, 150) +
      '<circle cx="104" cy="70" r="74" fill="url(#cm)"/><circle cx="104" cy="70" r="24" fill="#f3f8ff"/><circle cx="97" cy="64" r="5" fill="#cfdcf2" opacity=".7"/>' +
      '<g fill="#050b1c"><rect x="298" y="86" width="30" height="62"/><rect x="418" y="86" width="30" height="62"/><rect x="226" y="146" width="268" height="26"/><rect x="330" y="122" width="76" height="26"/><rect x="140" y="170" width="450" height="72"/><polygon points="116,240 622,240 592,268 150,268"/></g>' +
      '<rect x="298" y="98" width="30" height="8" fill="#c1272d"/><rect x="418" y="98" width="30" height="8" fill="#c1272d"/>' + win +
      '<line x1="140" y1="170" x2="590" y2="170" stroke="#9db8e8" stroke-width="1.5" opacity=".5"/>' + puff +
      wave('', 270, '#0a2a52', .95) + glints + wave('b', 284, '#061a38', .96) + '</svg>';
  }

  function refugio(r) {
    var snow = '', i, pines = '';
    for (i = 0; i < 70; i++) snow += '<circle cx="' + (r() * 740 - 10).toFixed(0) + '" cy="' + (r() * 320).toFixed(0) + '" r="' + (r() * 1.8 + .7).toFixed(1) + '" style="animation-delay:-' + (r() * 6).toFixed(2) + 's;animation-duration:' + (4 + r() * 4).toFixed(1) + 's"/>';
    var pine = function (x, y, s) {
      return '<g fill="#06161c" transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><polygon points="0,-62 18,-30 8,-30 24,2 -24,2 -8,-30 -18,-30"/><rect x="-4" y="2" width="8" height="12"/></g>' +
             '<g fill="#e8f3fa" opacity=".8" transform="translate(' + x + ' ' + y + ') scale(' + s + ')"><polygon points="0,-62 7,-48 -7,-48"/><polygon points="0,-38 11,-24 -11,-24" opacity=".7"/></g>';
    };
    pines = pine(70, 290, 1.5) + pine(130, 300, 1.1) + pine(610, 294, 1.4) + pine(668, 300, 1.7) + pine(560, 306, .9);
    return '<svg viewBox="0 0 720 320" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><defs>' + GLOW +
      '<linearGradient id="rfs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#050f1c"/><stop offset=".6" stop-color="#1c4363"/><stop offset="1" stop-color="#6a95b4"/></linearGradient></defs>' +
      '<rect width="720" height="320" fill="url(#rfs)"/>' + stars(r, 36, 110) +
      '<circle cx="610" cy="62" r="22" fill="#f4faff" opacity=".92"/>' +
      '<path d="M0 220 L110 112 L190 190 L300 70 L420 196 L520 100 L620 184 L720 130 V320 H0Z" fill="#12293f"/>' +
      '<path d="M300 70 L330 104 L312 100 L300 120 L288 98 L272 108Z M110 112 L132 138 L116 134 L104 150 L92 132 L80 138Z M520 100 L546 130 L528 126 L516 142 L504 124 L490 130Z" fill="#e8f3fa" opacity=".85"/>' +
      '<path d="M0 262 Q180 226 360 250 T720 244 V320 H0Z" fill="#cfe2ee"/><path d="M0 286 Q200 262 380 280 T720 276 V320 H0Z" fill="#a9c6d8"/>' +
      '<g fill="#1a0e08"><rect x="266" y="214" width="188" height="66"/></g><polygon points="250,216 360,160 470,216" fill="#241410"/><polygon points="250,216 360,160 470,216 458,214 360,168 262,214" fill="#eaf5fb"/>' +
      '<rect x="414" y="150" width="20" height="40" fill="#241410"/><rect x="410" y="146" width="28" height="8" fill="#eaf5fb"/>' +
      '<circle class="drift" cx="426" cy="128" r="12" fill="#e6f1f8" opacity=".3"/><circle class="drift b" cx="436" cy="106" r="17" fill="#e6f1f8" opacity=".22"/><circle class="drift" cx="448" cy="80" r="22" fill="#e6f1f8" opacity=".15"/>' +
      '<rect class="flick" x="288" y="232" width="26" height="22" fill="#ffcf70" filter="url(#glow)"/><rect x="334" y="232" width="26" height="22" fill="#ffcf70" filter="url(#glow)"/><rect x="406" y="232" width="26" height="22" fill="#ffcf70" filter="url(#glow)" opacity=".9"/>' +
      '<path d="M368 280 V254 a12 12 0 0 1 24 0 V280Z" fill="#ffb347" filter="url(#glow)"/>' + pines +
      '<g class="snow" fill="#fff" opacity=".8">' + snow + '</g></svg>';
  }

  function casino(r) {
    var bulbs = '', i;
    for (i = 0; i < 17; i++) bulbs += '<circle class="mq' + (i % 2 ? ' b' : '') + '" cx="' + (200 + i * 20) + '" cy="124" r="4.2" fill="#ffd36a" filter="url(#glow)"/>';
    for (i = 0; i < 17; i++) bulbs += '<circle class="mq' + (i % 2 ? '' : ' b') + '" cx="' + (200 + i * 20) + '" cy="196" r="4.2" fill="#ffd36a" filter="url(#glow)"/>';
    for (i = 0; i < 5; i++) bulbs += '<circle class="mq' + (i % 2 ? ' b' : '') + '" cx="200" cy="' + (134 + i * 15) + '" r="4.2" fill="#ffd36a"/><circle class="mq' + (i % 2 ? '' : ' b') + '" cx="520" cy="' + (134 + i * 15) + '" r="4.2" fill="#ffd36a"/>';
    var suits = '';
    ['♠', '♥', '♣', '♦'].forEach(function (s, k) { suits += '<text x="' + (92 + k * 180) + '" y="' + (84 + (k % 2) * 28) + '" font-size="34" fill="' + (k % 2 ? '#d1243f' : '#e9d6a3') + '" opacity=".28" text-anchor="middle" font-family="Georgia,serif">' + s + '</text>'; });
    return '<svg viewBox="0 0 720 320" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><defs>' + GLOW +
      '<linearGradient id="cas" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c0206"/><stop offset="1" stop-color="#3a0b18"/></linearGradient>' +
      '<linearGradient id="casb" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#ffe9a8" stop-opacity=".85"/><stop offset="1" stop-color="#ffe9a8" stop-opacity="0"/></linearGradient></defs>' +
      '<rect width="720" height="320" fill="url(#cas)"/>' + stars(r, 20, 70) + suits +
      '<g class="sway"><polygon points="60,320 100,320 250,0 215,0" fill="url(#casb)" opacity=".26"/></g><g class="sway b"><polygon points="620,320 660,320 505,0 470,0" fill="url(#casb)" opacity=".24"/></g>' +
      '<g fill="#07020a"><rect x="180" y="96" width="360" height="190"/><polygon points="160,98 360,40 560,98"/></g>' +
      '<rect x="190" y="106" width="340" height="98" fill="#1a0610" stroke="#d9b45a" stroke-width="2.5"/>' + bulbs +
      '<text class="neon" x="360" y="172" text-anchor="middle" font-family="Georgia,serif" font-weight="700" font-size="46" letter-spacing="10" fill="#ffd36a" filter="url(#glow)">CASINO</text>' +
      '<text x="360" y="192" text-anchor="middle" font-family="Georgia,serif" font-size="11" letter-spacing="9" fill="#e9d6a3" opacity=".85">★  ROYAL  ★</text>' +
      '<path d="M326 286 V240 a34 34 0 0 1 68 0 V286Z" fill="#ffcf70" filter="url(#glow)" opacity=".92"/><path d="M326 286 V240 a34 34 0 0 1 68 0 V286Z" fill="none" stroke="#d9b45a" stroke-width="3"/>' +
      '<polygon points="338,286 382,286 420,320 300,320" fill="#8a1226"/>' +
      '<g fill="#07020a"><rect x="236" y="236" width="48" height="50"/><rect x="436" y="236" width="48" height="50"/></g>' +
      '<rect x="244" y="246" width="32" height="22" fill="#ffcf70" opacity=".55"/><rect x="444" y="246" width="32" height="22" fill="#ffcf70" opacity=".55"/>' +
      '<g filter="url(#blur8)" fill="#ffd9a0"><ellipse class="drift" cx="200" cy="310" rx="220" ry="12" opacity=".12"/><ellipse class="drift b" cx="540" cy="314" rx="210" ry="12" opacity=".12"/></g></svg>';
  }

  function circo(r) {
    var tent = '', i, cols = ['#c4122f', '#f3e5c6'], bulbs = '', scallop = 'M170 250';
    for (i = 0; i < 8; i++) tent += '<polygon points="360,66 ' + (170 + i * 47.5) + ',250 ' + (170 + (i + 1) * 47.5) + ',250" fill="' + cols[i % 2] + '"/>';
    for (i = 0; i < 8; i++) scallop += ' q23.75 22 47.5 0';
    var wall = ''; for (i = 0; i < 8; i++) wall += '<rect x="' + (170 + i * 47.5) + '" y="250" width="47.5" height="46" fill="' + (i % 2 ? '#e8d9b8' : '#a8132b') + '" opacity=".92"/>';
    for (i = 0; i < 9; i++) bulbs += '<circle class="mq' + (i % 2 ? ' b' : '') + '" cx="' + (170 + i * 47.5) + '" cy="252" r="4" fill="#ffe08a" filter="url(#glow)"/>';
    return '<svg viewBox="0 0 720 320" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><defs>' + GLOW +
      '<linearGradient id="cis" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0c0418"/><stop offset=".65" stop-color="#3a0f3a"/><stop offset="1" stop-color="#8a2a34"/></linearGradient>' +
      '<linearGradient id="cib" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#fff0c4" stop-opacity=".9"/><stop offset="1" stop-color="#fff0c4" stop-opacity="0"/></linearGradient></defs>' +
      '<rect width="720" height="320" fill="url(#cis)"/>' + stars(r, 42, 120) +
      '<g class="sway"><polygon points="70,320 110,320 320,0 280,0" fill="url(#cib)" opacity=".26"/></g><g class="sway b"><polygon points="610,320 650,320 440,0 400,0" fill="url(#cib)" opacity=".24"/></g>' +
      '<g opacity=".95">' + tent + wall + '</g><rect x="170" y="246" width="380" height="6" fill="#7d0f22"/>' +
      '<path d="' + scallop + ' V262 H170Z" fill="#f3e5c6" opacity=".95"/>' + bulbs +
      '<line x1="360" y1="66" x2="360" y2="36" stroke="#e9d6a3" stroke-width="2"/><polygon points="360,36 392,44 360,52" fill="#ffd36a"/>' +
      '<path d="M334 296 V262 a26 26 0 0 1 52 0 V296Z" fill="#ffcf70" filter="url(#glow)" opacity=".92"/>' +
      '<g fill="#080210"><rect x="60" y="262" width="76" height="34"/><polygon points="52,262 98,236 144,262"/><rect x="590" y="268" width="90" height="28"/><circle cx="610" cy="298" r="9"/><circle cx="660" cy="298" r="9"/></g>' +
      '<rect x="0" y="296" width="720" height="24" fill="#10040a"/>' +
      '<g filter="url(#blur8)" fill="#ffd9a0"><ellipse class="drift" cx="200" cy="312" rx="220" ry="12" opacity=".12"/><ellipse class="drift b" cx="540" cy="314" rx="210" ry="12" opacity=".12"/></g></svg>';
  }

  function baker(r) {
    var i, win = '', wins = [[62, 170], [114, 170], [62, 214], [114, 214], [262, 214], [330, 214], [424, 170], [476, 170], [424, 214], [476, 214]];
    wins.forEach(function (w) { var lit = r() > .45; win += '<rect x="' + w[0] + '" y="' + w[1] + '" width="22" height="30" rx="2" fill="' + (lit ? '#ffc766' : '#0a1210') + '" ' + (lit ? 'filter="url(#glow)" opacity=".9"' : '') + '/><line x1="' + (w[0] + 11) + '" y1="' + w[1] + '" x2="' + (w[0] + 11) + '" y2="' + (w[1] + 30) + '" stroke="#0a1210" stroke-width="1.5"/>'; });
    var chim = ''; [[96, 126], [286, 100], [444, 120]].forEach(function (c) { chim += '<rect x="' + c[0] + '" y="' + c[1] + '" width="16" height="32" fill="#0b1410"/><rect x="' + (c[0] - 2) + '" y="' + c[1] + '" width="20" height="4" fill="#142019"/>'; });
    var cobbles = ''; for (i = 0; i < 46; i++) cobbles += '<ellipse cx="' + (r() * 720).toFixed(0) + '" cy="' + (272 + r() * 44).toFixed(0) + '" rx="' + (6 + r() * 8).toFixed(0) + '" ry="2.2" fill="#1c2a22" opacity=".7"/>';
    return '<svg viewBox="0 0 720 320" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><defs>' + GLOW +
      '<linearGradient id="bks" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#071410"/><stop offset=".55" stop-color="#1f3b30"/><stop offset="1" stop-color="#6d7a52"/></linearGradient>' +
      '<radialGradient id="bkm" cx=".5" cy=".5" r=".5"><stop offset="0" stop-color="#f4efc8" stop-opacity=".9"/><stop offset="1" stop-color="#f4efc8" stop-opacity="0"/></radialGradient></defs>' +
      '<rect width="720" height="320" fill="url(#bks)"/>' + stars(r, 26, 90) +
      '<circle cx="150" cy="62" r="56" fill="url(#bkm)"/><circle cx="150" cy="62" r="17" fill="#f2edc4" opacity=".92"/>' +
      // torre del reloj y palacio al fondo
      '<g fill="#0d1a15" opacity=".95"><rect x="560" y="206" width="160" height="60"/><rect x="574" y="190" width="14" height="18"/><rect x="690" y="186" width="14" height="22"/>' +
      '<rect x="624" y="96" width="30" height="170"/><polygon points="624,96 639,44 654,96"/><rect x="620" y="150" width="38" height="6"/></g>' +
      '<circle cx="639" cy="116" r="11" fill="#ffd98a" filter="url(#glow)"/><circle cx="639" cy="116" r="11" fill="none" stroke="#0d1a15" stroke-width="1.5"/><path d="M639 116 V108 M639 116 L645 119" stroke="#0d1a15" stroke-width="1.6"/>' +
      '<g filter="url(#blur8)" fill="#9fb59a"><ellipse class="drift" cx="600" cy="256" rx="240" ry="22" opacity=".16"/></g>' +
      // casas de ladrillo
      '<g><rect x="40" y="150" width="170" height="130" fill="#17110d"/><polygon points="34,150 125,118 216,150" fill="#0e0a08"/>' +
      '<rect x="206" y="120" width="190" height="160" fill="#1b130e"/><polygon points="198,120 301,86 404,120" fill="#0e0a08"/>' +
      '<rect x="392" y="146" width="160" height="134" fill="#16100c"/><polygon points="386,146 472,116 558,146" fill="#0e0a08"/>' + chim + '</g>' +
      win +
      // ventana del 221B con la silueta del detective y su pipa
      '<rect x="288" y="138" width="26" height="36" rx="2" fill="#ffcf6e" filter="url(#glow)"/><g fill="#1a1008"><circle cx="301" cy="153" r="5.2"/><path d="M294 146 q7 -10 14 0 l-3 2 h-8 z"/><path d="M291 150 l-5 2 l5 2 z"/><path d="M296 174 q5 -13 10 0 z"/><line x1="305" y1="157" x2="312" y2="160" stroke="#1a1008" stroke-width="1.6"/></g>' +
      '<g filter="url(#blur8)" fill="#d8d2b8"><ellipse class="drift" cx="318" cy="146" rx="9" ry="4" opacity=".4"/></g>' +
      // puerta 221B
      '<rect x="318" y="226" width="34" height="54" rx="2" fill="#2d6b46"/><path d="M318 232 a17 17 0 0 1 34 0z" fill="#ffd98a" filter="url(#glow)"/><rect x="326" y="244" width="18" height="9" fill="#f1e2b0"/><text x="335" y="252" text-anchor="middle" font-family="Georgia,serif" font-size="8" font-weight="700" fill="#171008">221B</text>' +
      '<rect x="210" y="274" width="180" height="6" fill="#241a12"/>' +
      // farola de gas
      '<g><rect x="560" y="176" width="4" height="104" fill="#0a0f0c"/><rect x="552" y="270" width="20" height="10" fill="#0a0f0c"/><polygon points="552,176 572,176 568,158 556,158" fill="#0a0f0c"/><polygon points="556,176 568,176 566,162 558,162" fill="#ffd27a" filter="url(#glow)"/></g>' +
      '<circle cx="562" cy="168" r="40" fill="#ffd27a" opacity=".2" filter="url(#blur8)"/>' +
      '<rect x="0" y="278" width="720" height="42" fill="#0b1410"/>' + cobbles +
      '<ellipse cx="562" cy="296" rx="60" ry="7" fill="#ffd27a" opacity=".16"/><ellipse cx="335" cy="298" rx="46" ry="6" fill="#ffd98a" opacity=".12"/>' +
      '<g filter="url(#blur8)" fill="#c7d6c0"><ellipse class="drift" cx="150" cy="290" rx="240" ry="14" opacity=".22"/><ellipse class="drift b" cx="520" cy="296" rx="260" ry="14" opacity=".2"/></g></svg>';
  }

  function pangea(r) {
    var i, ferns = '', stars_ = '', trees = '';
    for (i = 0; i < 14; i++) { var x = 20 + i * 52 + r() * 20, hgt = 40 + r() * 50; trees += '<path d="M' + x.toFixed(0) + ' 300 Q' + (x + 6).toFixed(0) + ' ' + (300 - hgt).toFixed(0) + ' ' + (x + 34).toFixed(0) + ' ' + (300 - hgt - 14).toFixed(0) + ' M' + x.toFixed(0) + ' 300 Q' + (x - 4).toFixed(0) + ' ' + (300 - hgt * .8).toFixed(0) + ' ' + (x - 30).toFixed(0) + ' ' + (300 - hgt - 6).toFixed(0) + '" stroke="#04100b" stroke-width="5" fill="none" stroke-linecap="round"/>'; }
    var bolt = '<path class="flick" d="M470 18 L452 74 L476 74 L450 138" stroke="#d8f5ff" stroke-width="3" fill="none" filter="url(#glow)" opacity=".85"/>';
    return '<svg viewBox="0 0 720 320" preserveAspectRatio="xMidYMax slice" xmlns="http://www.w3.org/2000/svg"><defs>' + GLOW +
      '<linearGradient id="pgs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#03120f"/><stop offset=".6" stop-color="#0f3a30"/><stop offset="1" stop-color="#2f6b4a"/></linearGradient></defs>' +
      '<rect width="720" height="320" fill="url(#pgs)"/>' + stars(r, 18, 70) + bolt +
      '<g filter="url(#blur8)" fill="#1e5446"><ellipse class="drift" cx="180" cy="70" rx="200" ry="26" opacity=".5"/><ellipse class="drift b" cx="560" cy="48" rx="190" ry="22" opacity=".45"/></g>' +
      // montaña volcánica al fondo
      '<polygon points="0,260 120,176 210,226 330,150 470,230 600,170 720,240 720,320 0,320" fill="#0a2a22"/>' +
      // verja y puerta monumental del parque
      '<g fill="#04100b"><rect x="236" y="120" width="26" height="170"/><rect x="458" y="120" width="26" height="170"/><rect x="226" y="108" width="46" height="16"/><rect x="448" y="108" width="46" height="16"/><path d="M262 140 Q360 78 458 140 L458 156 Q360 98 262 156Z"/></g>' +
      '<g stroke="#04100b" stroke-width="3">' + [0, 1, 2, 3, 4, 5].map(function (k) { return '<line x1="' + (278 + k * 33) + '" y1="148" x2="' + (278 + k * 33) + '" y2="292"/>'; }).join('') + '</g>' +
      // esqueleto de dinosaurio en la entrada
      '<g stroke="#e4dcc0" stroke-width="3.2" fill="none" stroke-linecap="round" opacity=".92"><path d="M318 220 Q340 196 372 204 Q404 212 420 192 M420 192 L440 186 L452 192 L438 198 M372 204 L366 262 M388 208 L392 262 M340 210 L330 240 M336 214 L320 214"/><path d="M322 214 q-12 -18 -30 -14 M292 200 q-10 6 -8 14 q8 2 14 -4"/></g>' +
      '<circle cx="438" cy="190" r="2.2" fill="#e4dcc0"/>' +
      '<g filter="url(#blur8)" fill="#8fb5a4"><ellipse class="drift" cx="360" cy="288" rx="300" ry="14" opacity=".28"/></g>' +
      '<rect x="0" y="288" width="720" height="32" fill="#04100b"/>' + trees +
      // luz de emergencia roja
      '<circle cx="248" cy="104" r="6" fill="#ff4a3a" filter="url(#glow)" class="flick"/><circle cx="472" cy="104" r="6" fill="#ff4a3a" filter="url(#glow)"/>' +
      '<g stroke="#bfe8ff" stroke-width="1" opacity=".22">' + (function () { var s = ''; for (var q = 0; q < 46; q++) { var rx = (r() * 720).toFixed(0), ry = (r() * 280).toFixed(0); s += '<line x1="' + rx + '" y1="' + ry + '" x2="' + (rx - 8) + '" y2="' + (+ry + 22) + '"/>'; } return s; })() + '</g></svg>';
  }

  root.Hero = { svg: function (id, seed) { var r = lcg(seed || 7); var f = { teatro: teatro, hotel: hotel, museo: museo, tren: tren, rodaje: rodaje, crucero: crucero, refugio: refugio, casino: casino, circo: circo, baker: baker, pangea: pangea }[id] || mansion; return f(r); } };
})(window);
