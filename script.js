(function () {
  'use strict';
  var EMAIL = 'samanvay.saxena.work@gmail.com'; // change here and in index.html if your email differs
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  var fine = window.matchMedia('(pointer: fine)').matches;
  document.documentElement.classList.add('js');

  /* ---------- Rotatable profile photo ---------- */
  var stage = document.getElementById('stage');
  var card = document.getElementById('card3d');
  var rx = -4, ry = 18, vx = 0, vy = reduce ? 0 : 0.18, drag = false, lx = 0, ly = 0, visible = true;

  function paint() { card.style.transform = 'rotateX(' + rx + 'deg) rotateY(' + ry + 'deg)'; }

  stage.addEventListener('pointerdown', function (e) {
    drag = true; lx = e.clientX; ly = e.clientY; stage.classList.add('drag');
    try { stage.setPointerCapture(e.pointerId); } catch (err) {}
  });
  stage.addEventListener('pointermove', function (e) {
    if (!drag) return;
    var dx = e.clientX - lx, dy = e.clientY - ly;
    lx = e.clientX; ly = e.clientY;
    vy = dx * 0.5; ry += vy;
    rx = Math.max(-35, Math.min(35, rx - dy * 0.3));
  });
  function release() { drag = false; stage.classList.remove('drag'); }
  stage.addEventListener('pointerup', release);
  stage.addEventListener('pointercancel', release);
  stage.addEventListener('lostpointercapture', release);

  function loop() {
    if (visible) {
      if (!drag) {
        ry += vy;
        var rest = reduce ? 0 : 0.18;
        vy += (rest - vy) * 0.03;   // glide back to a slow idle spin
        rx += (-4 - rx) * 0.05;     // level out vertically
      }
      paint();
    }
    requestAnimationFrame(loop);
  }
  if ('IntersectionObserver' in window) {
    new IntersectionObserver(function (en) { visible = en[0].isIntersecting; }).observe(stage);
  }
  paint(); loop();

  /* ---------- Glow that follows the pointer (mouse devices only) ---------- */
  if (fine) {
    var aura = document.querySelector('.aura');
    window.addEventListener('pointermove', function (e) {
      aura.style.setProperty('--ax', e.clientX + 'px');
      aura.style.setProperty('--ay', e.clientY + 'px');
    }, { passive: true });
    document.querySelectorAll('.glow').forEach(function (el) {
      el.addEventListener('pointermove', function (e) {
        var r = el.getBoundingClientRect();
        el.style.setProperty('--mx', e.clientX - r.left + 'px');
        el.style.setProperty('--my', e.clientY - r.top + 'px');
      });
    });
  }

  /* ---------- Section reveal (threshold 0 so tall mobile sections always appear) ---------- */
  var secs = document.querySelectorAll('section');
  if ('IntersectionObserver' in window) {
    var io = new IntersectionObserver(function (en) {
      en.forEach(function (x) {
        if (x.isIntersecting) { x.target.classList.add('in'); io.unobserve(x.target); }
      });
    }, { threshold: 0, rootMargin: '0px 0px -5% 0px' });
    secs.forEach(function (s) { io.observe(s); });
    // safety net: never leave content hidden
    setTimeout(function () { secs.forEach(function (s) { s.classList.add('in'); }); }, 4000);
  } else {
    secs.forEach(function (s) { s.classList.add('in'); });
  }

  /* ---------- Scroll progress bar + active nav link ---------- */
  var bar = document.getElementById('progress');
  var nav = document.querySelector('.nav');
  var links = Array.prototype.slice.call(document.querySelectorAll('.nav a[href^="#"]'));
  var current = null, ticking = false;

  function setActive(id) {
    if (id === current) return;
    current = id;
    links.forEach(function (a) {
      var on = a.getAttribute('href') === '#' + id;
      a.classList.toggle('on', on);
      if (on && nav.scrollWidth > nav.clientWidth) {
        nav.scrollLeft = a.offsetLeft - (nav.clientWidth - a.offsetWidth) / 2;
      }
    });
  }

  function onScroll() {
    ticking = false;
    var doc = document.documentElement;
    var max = doc.scrollHeight - window.innerHeight;
    var y = window.pageYOffset || doc.scrollTop || 0;
    if (bar) bar.style.transform = 'scaleX(' + (max > 0 ? Math.min(1, Math.max(0, y / max)) : 0) + ')';

    var id = '';
    var line = window.innerHeight * 0.4;
    secs.forEach(function (s) { if (s.getBoundingClientRect().top <= line) id = s.id; });
    if (max > 0 && y >= max - 4) id = 'contact';
    if (id) setActive(id);
  }
  function req() { if (!ticking) { ticking = true; requestAnimationFrame(onScroll); } }
  window.addEventListener('scroll', req, { passive: true });
  window.addEventListener('resize', req);
  onScroll();

  /* ---------- Contact ---------- */
  var mail = document.getElementById('mail');
  var copy = document.getElementById('copy');
  mail.textContent = EMAIL;
  mail.href = 'mailto:' + EMAIL;

  function flash(msg) {
    copy.textContent = msg;
    setTimeout(function () { copy.textContent = 'Copy email'; }, 1800);
  }
  function legacyCopy() {
    var t = document.createElement('textarea');
    t.value = EMAIL; t.setAttribute('readonly', '');
    t.style.cssText = 'position:fixed;top:0;left:0;opacity:0;font-size:16px';
    document.body.appendChild(t);
    t.focus(); t.select(); t.setSelectionRange(0, EMAIL.length);
    var ok = false;
    try { ok = document.execCommand('copy'); } catch (e) {}
    document.body.removeChild(t);
    flash(ok ? 'Email copied' : 'Copy failed, use the link');
  }
  copy.addEventListener('click', function () {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(EMAIL).then(function () { flash('Email copied'); }, legacyCopy);
    } else { legacyCopy(); }
  });
})();
