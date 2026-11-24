// Pruthvi P R – portfolio v4
(function () {
  'use strict';

  const root = document.documentElement;
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const finePointer = window.matchMedia('(hover: hover) and (pointer: fine)').matches;
  const GLYPHS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ#%&*+<>/';
  const DPR = Math.min(window.devicePixelRatio || 1, 2);

  /* ------------------------------------------------------------------
     Text scramble: letters shuffle and settle into the final text
     ------------------------------------------------------------------ */
  function scramble(el, finalText, duration = 900) {
    return new Promise((resolve) => {
      if (reduceMotion) { el.textContent = finalText; return resolve(); }
      const start = performance.now();
      const from = el.textContent;
      const len = Math.max(from.length, finalText.length);
      // each letter settles at its own moment, left to right with jitter
      const settleAt = Array.from({ length: len }, (_, i) => (i / len) * 0.7 + Math.random() * 0.3);
      function frame(now) {
        const t = Math.min((now - start) / duration, 1);
        let out = '';
        for (let i = 0; i < len; i++) {
          const ch = finalText[i] || '';
          if (t >= settleAt[i] || ch === ' ') out += ch;
          else out += GLYPHS[(Math.random() * GLYPHS.length) | 0];
        }
        el.textContent = out;
        if (t < 1) requestAnimationFrame(frame); else { el.textContent = finalText; resolve(); }
      }
      requestAnimationFrame(frame);
    });
  }

  /* ------------------------------------------------------------------
     Intro: glowing dot, name decodes, then the curtain lifts
     ------------------------------------------------------------------ */
  const intro = document.querySelector('.intro');
  const ready = () => document.body.classList.add('is-ready');

  if (!intro || reduceMotion || root.classList.contains('intro-seen')) {
    ready();
  } else {
    document.body.style.overflow = 'hidden';
    const word = intro.querySelector('.intro-word');
    const count = intro.querySelector('.intro-count');
    const total = 2600;
    const t0 = performance.now();
    (function tick(now) {
      const p = Math.min((now - t0) / total, 1);
      count.textContent = Math.round(p * 100);
      if (p < 1) requestAnimationFrame(tick);
    })(t0);

    setTimeout(async () => {
      intro.classList.add('is-word');
      word.textContent = '       ';
      await scramble(word, word.dataset.a, 900);
      await new Promise((r) => setTimeout(r, 250));
      await scramble(word, word.dataset.b, 650);
      await new Promise((r) => setTimeout(r, 300));
      intro.classList.add('is-done');
      document.body.style.overflow = '';
      ready();
      try { sessionStorage.setItem('introSeen', '1'); } catch (e) {}
      setTimeout(() => intro.remove(), 1100);
    }, 650);
  }

  /* ------------------------------------------------------------------
     Header, menu, active link
     ------------------------------------------------------------------ */
  const header = document.querySelector('.header');
  const onScroll = () => header.classList.toggle('is-scrolled', window.scrollY > 30);
  window.addEventListener('scroll', onScroll, { passive: true });
  onScroll();

  const burger = document.querySelector('.burger');
  const nav = document.querySelector('.nav');
  const setMenu = (open) => {
    nav.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));
    burger.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    document.body.style.overflow = open ? 'hidden' : '';
  };
  burger.addEventListener('click', () => setMenu(!nav.classList.contains('is-open')));
  nav.addEventListener('click', (e) => { if (e.target.closest('a')) setMenu(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && nav.classList.contains('is-open')) setMenu(false); });

  const navLinks = [...nav.querySelectorAll('a[href^="#"]')];
  const spy = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (en.isIntersecting) navLinks.forEach((a) => a.classList.toggle('is-active', a.getAttribute('href') === '#' + en.target.id));
    });
  }, { rootMargin: '-50% 0px -49% 0px' });
  ['about', 'services', 'matrix', 'work', 'experience', 'stack', 'contact'].forEach((id) => { const s = document.getElementById(id); if (s) spy.observe(s); });

  /* ------------------------------------------------------------------
     Scroll reveals and heading scrambles
     ------------------------------------------------------------------ */
  const revealTargets = document.querySelectorAll('.about-text, .stats, .about-photo, .svc, .exp-list li, .tool, .mail-row, .links li, .contact-card, .contact-text, .proj-visual');
  revealTargets.forEach((el) => el.setAttribute('data-reveal', ''));

  const revealIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      en.target.classList.add('is-in');
      revealIO.unobserve(en.target);
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });
  revealTargets.forEach((el) => revealIO.observe(el));

  const scrambleIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      scrambleIO.unobserve(en.target);
      en.target.querySelectorAll('span').forEach((span, i) => {
        const text = span.dataset.text;
        setTimeout(() => scramble(span, text, 800 + text.length * 18), i * 140);
      });
    });
  }, { threshold: 0.4 });
  document.querySelectorAll('[data-scramble]').forEach((h) => {
    h.setAttribute('aria-label', h.textContent.replace(/\s+/g, ' ').trim());
    h.querySelectorAll('span').forEach((s) => { s.dataset.text = s.textContent; s.setAttribute('aria-hidden', 'true'); });
    if (!reduceMotion) scrambleIO.observe(h);
  });

  /* stats count up */
  const countIO = new IntersectionObserver((entries) => {
    entries.forEach((en) => {
      if (!en.isIntersecting) return;
      countIO.unobserve(en.target);
      en.target.querySelectorAll('[data-count]').forEach((dt) => {
        const target = parseFloat(dt.dataset.count);
        const dec = String(dt.dataset.count).includes('.') ? 1 : 0;
        const suffix = dt.dataset.suffix || '';
        const t0 = performance.now();
        (function step(now) {
          const p = Math.min((now - t0) / 1400, 1);
          const e = 1 - Math.pow(1 - p, 3);
          dt.textContent = (target * e).toFixed(dec) + suffix;
          if (p < 1) requestAnimationFrame(step);
        })(t0);
      });
    });
  }, { threshold: 0.5 });
  const stats = document.querySelector('.stats');
  if (stats && !reduceMotion) countIO.observe(stats);

  /* ------------------------------------------------------------------
     Hero particle portrait
     The photo breaks into particles that assemble into Pruthvi.
     Move the mouse over him and the particles scatter.
     ------------------------------------------------------------------ */
  (function particlePortrait() {
    const wrap = document.querySelector('.portrait');
    const canvas = wrap && wrap.querySelector('.particles');
    const img = wrap && wrap.querySelector('.portrait-img');
    if (!canvas || reduceMotion) return;
    const ctx = canvas.getContext('2d');
    let particles = [], buckets = [], W = 0, H = 0, running = false, visible = true;
    const mouse = { x: -9999, y: -9999, active: false };

    function build() {
      const r = wrap.getBoundingClientRect();
      W = Math.round(r.width); H = Math.round(r.height);
      if (!W || !H) return false;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);

      // draw the photo the same way CSS does (contain, bottom aligned)
      const off = document.createElement('canvas');
      off.width = W; off.height = H;
      const o = off.getContext('2d');
      const scale = Math.min(W / img.naturalWidth, H / img.naturalHeight);
      const dw = img.naturalWidth * scale, dh = img.naturalHeight * scale;
      o.drawImage(img, (W - dw) / 2, H - dh, dw, dh);
      let data;
      try { data = o.getImageData(0, 0, W, H).data; } catch (e) { return false; } // e.g. opened from file://

      const step = W < 420 ? 5 : 4;
      particles = [];
      for (let y = 0; y < H; y += step) {
        for (let x = 0; x < W; x += step) {
          const i = (y * W + x) * 4;
          const a = data[i + 3];
          if (a < 120) continue;
          const R0 = data[i], G0 = data[i + 1], B0 = data[i + 2];
          let lum = (0.3 * R0 + 0.59 * G0 + 0.11 * B0) / 255;
          // lift the shadows so black clothing still shows as dim particles
          lum = Math.min(1, 0.1 + Math.pow(lum, 0.75));
          const isRim = R0 > 150 && G0 < R0 * 0.56 && B0 < R0 * 0.36; // saturated orange rim light, not skin
          const angle = Math.random() * Math.PI * 2;
          const dist = 200 + Math.random() * Math.max(W, H);
          particles.push({
            hx: x, hy: y,
            x: W / 2 + Math.cos(angle) * dist, y: H / 2 + Math.sin(angle) * dist,
            vx: 0, vy: 0,
            s: step * (0.45 + lum * 0.5),
            b: isRim ? 8 : Math.min(7, Math.floor(lum * 8)),
            d: 0.028 + Math.random() * 0.04,
          });
        }
      }
      // group by brightness so each colour is set once per frame
      buckets = Array.from({ length: 9 }, () => []);
      particles.forEach((p) => buckets[p.b].push(p));
      return true;
    }

    const shades = Array.from({ length: 8 }, (_, i) => {
      const v = Math.round(48 + (i / 7) * 207);
      return `rgb(${v},${Math.round(v * 0.985)},${Math.round(v * 0.96)})`;
    });
    shades.push('#FF6A3D'); // rim-light particles glow ember

    let settledFrames = 0;
    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      let moving = 0;
      const R = 90, R2 = R * R;
      for (let b = 0; b < 9; b++) {
        ctx.fillStyle = shades[b];
        const list = buckets[b];
        for (let k = 0; k < list.length; k++) {
          const p = list[k];
          if (mouse.active) {
            const dx = p.x - mouse.x, dy = p.y - mouse.y;
            const d2 = dx * dx + dy * dy;
            if (d2 < R2) {
              const f = (1 - d2 / R2) * 7;
              const d = Math.sqrt(d2) || 1;
              p.vx += (dx / d) * f; p.vy += (dy / d) * f;
            }
          }
          p.vx += (p.hx - p.x) * p.d; p.vy += (p.hy - p.y) * p.d;
          p.vx *= 0.82; p.vy *= 0.82;
          p.x += p.vx; p.y += p.vy;
          if (Math.abs(p.vx) + Math.abs(p.vy) > 0.05) moving++;
          ctx.fillRect(p.x, p.y, p.s, p.s);
        }
      }
      // stop the loop once everything is home and the mouse is away
      settledFrames = moving < particles.length * 0.004 && !mouse.active ? settledFrames + 1 : 0;
      if (settledFrames > 30) { running = false; onSettled(); return; }
      requestAnimationFrame(frame);
    }
    function start() { if (!running && visible) { running = true; settledFrames = 0; requestAnimationFrame(frame); } }

    let photoTimer;
    function onSettled() {
      clearTimeout(photoTimer);
      photoTimer = setTimeout(() => { if (!mouse.active) wrap.classList.add('is-photo'); }, 900);
    }
    function scatter(power) {
      particles.forEach((p) => { p.vx += (Math.random() - 0.5) * power; p.vy += (Math.random() - 0.5) * power; });
    }

    function init() {
      if (!build()) return;
      document.documentElement.classList.add('has-particles');
      // wait for the intro curtain before assembling
      const go = () => start();
      if (document.body.classList.contains('is-ready')) setTimeout(go, 300);
      else new MutationObserver((m, obs) => { if (document.body.classList.contains('is-ready')) { obs.disconnect(); setTimeout(go, 300); } })
        .observe(document.body, { attributes: true, attributeFilter: ['class'] });

      if (finePointer) {
        wrap.addEventListener('pointermove', (e) => {
          const r = canvas.getBoundingClientRect();
          mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; mouse.active = true;
          clearTimeout(photoTimer);
          wrap.classList.remove('is-photo');
          start();
        });
        wrap.addEventListener('pointerleave', () => { mouse.active = false; mouse.x = mouse.y = -9999; });
      } else {
        wrap.addEventListener('click', () => {
          if (wrap.classList.contains('is-photo')) { wrap.classList.remove('is-photo'); scatter(40); start(); }
        });
      }

      new IntersectionObserver(([en]) => { visible = en.isIntersecting; if (visible && !wrap.classList.contains('is-photo')) start(); })
        .observe(wrap);

      let rt;
      window.addEventListener('resize', () => {
        clearTimeout(rt);
        rt = setTimeout(() => { const keepPhoto = wrap.classList.contains('is-photo'); if (build() && !keepPhoto) start(); }, 250);
      });
    }

    if (img.complete && img.naturalWidth) init(); else img.addEventListener('load', init, { once: true });
  })();

  /* ------------------------------------------------------------------
     Dot-matrix statement: an LED board that reacts to the cursor
     ------------------------------------------------------------------ */
  (function dotMatrix() {
    const section = document.querySelector('.matrix');
    const canvas = section && section.querySelector('.matrix-canvas');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const lines = [{ text: 'FRONT TO', color: [238, 236, 231] }, { text: 'BACK END', color: [255, 74, 28] }];
    let W, H, cell, cols, rows, cells = [], running = false, visible = false;
    const mouse = { x: -9999, y: -9999 };

    function build() {
      const r = section.getBoundingClientRect();
      W = r.width; H = r.height;
      canvas.width = W * DPR; canvas.height = H * DPR;
      ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
      cell = Math.max(6, Math.round(W / 150));
      cols = Math.floor(W / cell); rows = Math.floor(H / cell);

      const off = document.createElement('canvas');
      off.width = cols; off.height = rows;
      const o = off.getContext('2d');
      o.fillStyle = '#fff'; o.textAlign = 'center'; o.textBaseline = 'middle';
      let size = rows * 0.42;
      o.font = `400 ${size}px Anton, Impact, sans-serif`;
      const widest = Math.max(...lines.map((l) => o.measureText(l.text).width));
      if (widest > cols * 0.9) { size *= (cols * 0.9) / widest; o.font = `400 ${size}px Anton, Impact, sans-serif`; }

      cells = [];
      lines.forEach((line, li) => {
        o.clearRect(0, 0, cols, rows);
        const y = rows / 2 + (li === 0 ? -size * 0.52 : size * 0.52);
        o.fillText(line.text, cols / 2, y);
        const d = o.getImageData(0, 0, cols, rows).data;
        for (let j = 0; j < rows; j++) for (let i = 0; i < cols; i++) {
          if (d[(j * cols + i) * 4 + 3] > 110) cells.push({ i, j, x: i * cell, y: j * cell, ox: 0, oy: 0, c: line.color, flick: 0 });
        }
      });
    }

    function frame() {
      if (!running) return;
      ctx.clearRect(0, 0, W, H);
      // faint idle grid
      ctx.fillStyle = 'rgba(238,236,231,0.045)';
      const g = cell * 0.28;
      for (let j = 0; j < rows; j += 1) for (let i = 0; i < cols; i += 1) ctx.fillRect(i * cell + cell / 2 - g / 2, j * cell + cell / 2 - g / 2, g, g);

      const R = cell * 9, R2 = R * R;
      const sz = cell * 0.72;
      for (let k = 0; k < cells.length; k++) {
        const p = cells[k];
        const cx = p.x + cell / 2, cy = p.y + cell / 2;
        const dx = cx - mouse.x, dy = cy - mouse.y;
        const d2 = dx * dx + dy * dy;
        let tx = 0, ty = 0, hot = 0;
        if (d2 < R2) {
          const f = 1 - d2 / R2; const d = Math.sqrt(d2) || 1;
          tx = (dx / d) * f * cell * 2.4; ty = (dy / d) * f * cell * 2.4; hot = f;
        }
        p.ox += (tx - p.ox) * 0.18; p.oy += (ty - p.oy) * 0.18;
        if (p.flick > 0) p.flick -= 0.04; else if (Math.random() < 0.0008) p.flick = 1;
        const a = 0.35 + 0.65 * (1 - p.flick * 0.8);
        const [r, gg, b] = hot > 0.15 ? [255, 74, 28] : p.c;
        ctx.fillStyle = `rgba(${r},${gg},${b},${a})`;
        ctx.fillRect(p.x + (cell - sz) / 2 + p.ox, p.y + (cell - sz) / 2 + p.oy, sz, sz);
      }
      requestAnimationFrame(frame);
    }

    const ensureFont = document.fonts && document.fonts.load ? document.fonts.load('400 80px Anton') : Promise.resolve();
    ensureFont.then(() => {
      build();
      if (reduceMotion) { running = true; frame(); running = false; return; }
      new IntersectionObserver(([en]) => {
        visible = en.isIntersecting;
        if (visible && !running) { running = true; requestAnimationFrame(frame); }
        if (!visible) running = false;
      }).observe(section);
    });
    section.addEventListener('pointermove', (e) => { const r = section.getBoundingClientRect(); mouse.x = e.clientX - r.left; mouse.y = e.clientY - r.top; });
    section.addEventListener('pointerleave', () => { mouse.x = mouse.y = -9999; });
    let rt; window.addEventListener('resize', () => { clearTimeout(rt); rt = setTimeout(build, 250); });
  })();

  /* ------------------------------------------------------------------
     Services accordion
     ------------------------------------------------------------------ */
  const svcItems = [...document.querySelectorAll('.svc-item')];
  svcItems.forEach((item, idx) => {
    const btn = item.querySelector('.svc-head');
    const open = (state) => { item.classList.toggle('is-open', state); btn.setAttribute('aria-expanded', String(state)); };
    btn.addEventListener('click', () => {
      const willOpen = !item.classList.contains('is-open');
      svcItems.forEach((other) => { if (other !== item) { other.classList.remove('is-open'); other.querySelector('.svc-head').setAttribute('aria-expanded', 'false'); } });
      open(willOpen);
    });
    if (idx === 0) open(true);
  });

  /* ------------------------------------------------------------------
     Work: cards stack; the one underneath shrinks back a little
     ------------------------------------------------------------------ */
  const cards = [...document.querySelectorAll('.proj')];
  const stackMQ = window.matchMedia('(min-width: 1101px)');
  function stackFrame() {
    if (!stackMQ.matches || reduceMotion) { cards.forEach((c) => { c.style.transform = ''; c.style.filter = ''; }); return; }
    cards.forEach((card, i) => {
      const next = cards[i + 1];
      if (!next) return;
      const a = card.getBoundingClientRect(), b = next.getBoundingClientRect();
      const p = Math.min(Math.max((a.bottom - b.top) / a.height, 0), 1); // how much the next card covers this one
      card.style.transform = `scale(${1 - p * 0.06})`;
      card.style.filter = `brightness(${1 - p * 0.45})`;
    });
  }
  let stackTick = false;
  window.addEventListener('scroll', () => { if (!stackTick) { stackTick = true; requestAnimationFrame(() => { stackFrame(); stackTick = false; }); } }, { passive: true });
  stackFrame();

  /* supplier rows light up one after another */
  const supRows = [...document.querySelectorAll('.sup li')];
  if (supRows.length && !reduceMotion) {
    let n = 0;
    const holdSteps = 4; // pause with every row lit before starting over
    setInterval(() => {
      if (document.hidden) return;
      if (n === 0) supRows.forEach((r) => r.classList.remove('is-hit'));
      if (n < supRows.length) supRows[n].classList.add('is-hit');
      n = (n + 1) % (supRows.length + holdSteps);
    }, 420);
  } else supRows.forEach((r) => r.classList.add('is-hit'));

  /* ------------------------------------------------------------------
     Custom cursor
     ------------------------------------------------------------------ */
  if (finePointer && !reduceMotion) {
    const cur = document.querySelector('.cursor');
    cur.classList.add('is-hidden');
    const dot = cur.querySelector('.cursor-dot');
    const ring = cur.querySelector('.cursor-ring');
    let mx = innerWidth / 2, my = innerHeight / 2, rx = mx, ry = my;
    window.addEventListener('pointermove', (e) => { mx = e.clientX; my = e.clientY; cur.classList.remove('is-hidden'); }, { passive: true });
    document.addEventListener('pointerleave', () => cur.classList.add('is-hidden'));
    document.addEventListener('pointerover', (e) => cur.classList.toggle('is-link', !!e.target.closest('a, button')));
    (function loop() {
      rx += (mx - rx) * 0.18; ry += (my - ry) * 0.18;
      dot.style.transform = `translate(${mx}px, ${my}px)`;
      ring.style.transform = `translate(${rx}px, ${ry}px)`;
      requestAnimationFrame(loop);
    })();
  }

  /* ------------------------------------------------------------------
     Copy email, year
     ------------------------------------------------------------------ */
  const toast = document.querySelector('.toast');
  let toastTimer;
  document.querySelectorAll('[data-copy]').forEach((btn) => {
    btn.addEventListener('click', async () => {
      let msg = 'Email address copied';
      const label = btn.querySelector('span') || btn;
      try { await navigator.clipboard.writeText(btn.dataset.copy); label.textContent = 'Copied'; btn.classList.add('is-done'); }
      catch (e) { msg = 'Email: ' + btn.dataset.copy; }
      toast.textContent = msg; toast.classList.add('is-visible');
      clearTimeout(toastTimer); toastTimer = setTimeout(() => toast.classList.remove('is-visible'), 2200);
      setTimeout(() => { label.textContent = 'Copy'; btn.classList.remove('is-done'); }, 2000);
    });
  });
  /* live Bengaluru time in the contact card */
  const clock = document.getElementById('local-time');
  if (clock) {
    const fmt = new Intl.DateTimeFormat('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true, timeZone: 'Asia/Kolkata' });
    const tickClock = () => { clock.textContent = fmt.format(new Date()); };
    tickClock(); setInterval(tickClock, 30000);
  }

  const year = document.getElementById('year');
  if (year) year.textContent = new Date().getFullYear();
})();
