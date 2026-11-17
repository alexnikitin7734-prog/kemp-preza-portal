(function () {
  var stage = document.getElementById('stage'), slides = [].slice.call(document.querySelectorAll('.slide'));
  var pager = document.getElementById('pager'), black = document.getElementById('black');
  var figs = [].slice.call(document.querySelectorAll('.supr .f'));

  // одна супрематическая композиция: [x, y] в долях зоны, поворот, масштаб — порядок как в svg
  var BASE = {
    square: [.35, .38, 15, 1], bar: [.55, .62, -32, 1], sun: [.72, .2, 0, 1], small: [.18, .76, 25, 1],
    line: [.5, .5, -32, 1], cross: [.84, .8, 10, .8], trap: [.64, .88, -8, .9], ring: [.72, .2, 0, 1.1],
    bars: [.28, .1, -10, 1], lilac: [.08, .44, -18, .8], half: [.4, .94, 0, .9], line2: [.6, .34, 58, 1], dot: [.9, .5, 0, 1]
  };
  // где композиция на каждом слайде: зона x, y, w, h, масштаб, поворот, зеркало
  var ZONE = [
    [1340, 70, 500, 940, 1.05, 0, 0],
    [1440, 90, 400, 880, .8, 18, 1],
    [1260, 110, 580, 840, 1, -14, 0],
    [1500, 80, 360, 900, .72, 34, 1],
    [1500, 120, 320, 840, .7, -22, 0],
    [1380, 90, 470, 900, .9, 8, 1],
    [1400, 110, 440, 860, .85, -30, 0],
    [1400, 90, 450, 900, .85, 24, 1],
    [1520, 110, 330, 860, .7, -10, 0],
    [1330, 40, 540, 400, .72, 0, 1]
  ];
  var cur = -1;
  slides.forEach(function () { pager.appendChild(document.createElement('i')); });
  figs.forEach(function (f, i) {
    f.style.setProperty('--d', (i * .05) + 's');
    f.querySelector('.in').style.setProperty('--t', (7 + (i * 37 % 6)) + 's');
    f.addEventListener('mouseenter', function () {
      f.classList.add('lit');
      clearTimeout(f._t); f._t = setTimeout(function () { f.classList.remove('lit'); }, 700);
    });
  });

  function compose(i) {
    var z = ZONE[i], cx = z[0] + z[2] / 2, cy = z[1] + z[3] / 2, a = z[5] * Math.PI / 180;
    figs.forEach(function (f, n) {
      var b = BASE[f.dataset.k], u = z[6] ? 1 - b[0] : b[0];
      var x = z[0] + u * z[2] - cx, y = z[1] + b[1] * z[3] - cy;
      var px = cx + x * Math.cos(a) - y * Math.sin(a), py = cy + x * Math.sin(a) + y * Math.cos(a);
      var rot = (z[6] ? -b[2] : b[2]) + z[5];
      f.style.transform = 'translate(' + px.toFixed(1) + 'px,' + py.toFixed(1) + 'px) rotate(' + rot + 'deg) scale(' + (b[3] * z[4]) + ')';
      // композиция «загорается» по мере рассказа: к последнему слайду — вся в полную силу
      f.classList.toggle('on', n < Math.round(figs.length * (i + 1) / slides.length));
    });
  }

  function fit() {
    var k = Math.min(innerWidth / 1920, innerHeight / 1080);
    stage.style.transform = 'scale(' + k + ') translate(-50%, -50%)';
  }
  function go(i) {
    i = Math.max(0, Math.min(slides.length - 1, i));
    if (i === cur) return;
    if (cur >= 0) slides[cur].classList.remove('on');
    cur = i;
    slides[i].classList.add('on');
    [].forEach.call(pager.children, function (d, k) { d.classList.toggle('on', k === i); });
    compose(i);
    history.replaceState(null, '', '#' + (i + 1));
  }

  // раз в три секунды вспыхивает одна случайная фигура
  if (!matchMedia('(prefers-reduced-motion: reduce)').matches) {
    setInterval(function () {
      var f = figs[Math.floor(Math.random() * figs.length)];
      f.classList.add('flash');
      setTimeout(function () { f.classList.remove('flash'); }, 650);
    }, 3000);
  }

  // кликер шлёт PageDown/PageUp или стрелки; F5 — во весь экран, B или точка — чёрный экран
  addEventListener('keydown', function (e) {
    var k = e.key;
    if (k === 'b' || k === 'B' || k === 'и' || k === 'И' || k === '.' || k === 'ю') { black.hidden = !black.hidden; return; }
    if (k === 'F5' || k === 'f' || k === 'F' || k === 'а' || k === 'А') {
      e.preventDefault();
      if (!document.fullscreenElement) document.documentElement.requestFullscreen().catch(function () {}); else document.exitFullscreen();
      return;
    }
    if (!black.hidden) black.hidden = true;
    if (['ArrowRight', 'ArrowDown', 'PageDown', ' ', 'Enter'].indexOf(k) >= 0) { e.preventDefault(); go(cur + 1); }
    else if (['ArrowLeft', 'ArrowUp', 'PageUp', 'Backspace'].indexOf(k) >= 0) { e.preventDefault(); go(cur - 1); }
    else if (k === 'Home') go(0);
    else if (k === 'End') go(slides.length - 1);
  });

  var hideT;
  addEventListener('mousemove', function () {
    document.body.classList.add('mouse');
    clearTimeout(hideT); hideT = setTimeout(function () { document.body.classList.remove('mouse'); }, 1500);
  });
  addEventListener('resize', fit);
  fit();
  go((parseInt(location.hash.slice(1), 10) || 1) - 1);
})();
