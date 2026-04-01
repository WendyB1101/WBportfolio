/* ===== 3D UNIVERSE BACKGROUND ===== */
let buildStars; // exposed so theme toggle can call it
(function () {
  const cv  = document.getElementById('universe');
  const ctx = cv.getContext('2d');
  let W, H, scrollY = 0, mouseX = 0, mouseY = 0;

  function resize() {
    W = cv.width  = window.innerWidth;
    H = cv.height = window.innerHeight;
  }
  window.addEventListener('resize', () => { resize(); buildStars(); });
  resize();

  window.addEventListener('scroll', () => { scrollY = window.scrollY; });
  window.addEventListener('mousemove', e => { mouseX = e.clientX; mouseY = e.clientY; });

  /* ---- Nebula cloud blobs ---- */
  const DARK_NEBULAS = [
    { x: 0.15, y: 0.20, r: 0.38, c: 'rgba(194,96,122,',   a: 0.07 },
    { x: 0.80, y: 0.15, r: 0.30, c: 'rgba(124,111,205,',  a: 0.08 },
    { x: 0.50, y: 0.60, r: 0.25, c: 'rgba(249,215,126,',  a: 0.04 },
    { x: 0.10, y: 0.75, r: 0.28, c: 'rgba(124,111,205,',  a: 0.06 },
    { x: 0.85, y: 0.70, r: 0.32, c: 'rgba(194,96,122,',   a: 0.05 },
    { x: 0.40, y: 0.10, r: 0.22, c: 'rgba(165,243,252,',  a: 0.04 },
  ];

  const BLUE_NEBULAS = [
    { x: 0.15, y: 0.20, r: 0.38, c: 'rgba(59,130,246,',   a: 0.10 },
    { x: 0.80, y: 0.15, r: 0.30, c: 'rgba(124,58,237,',   a: 0.08 },
    { x: 0.50, y: 0.60, r: 0.25, c: 'rgba(96,165,250,',   a: 0.07 },
    { x: 0.10, y: 0.75, r: 0.28, c: 'rgba(59,130,246,',   a: 0.08 },
    { x: 0.85, y: 0.70, r: 0.32, c: 'rgba(167,139,250,',  a: 0.06 },
    { x: 0.40, y: 0.10, r: 0.22, c: 'rgba(186,230,253,',  a: 0.05 },
  ];

  function getNebulas() {
    return document.documentElement.getAttribute('data-theme') === 'light'
      ? BLUE_NEBULAS : DARK_NEBULAS;
  }

  /* ---- Star layers (depth 1=far, 3=near) ---- */
  const LAYERS = [
    { count: 320, rMin: 0.3, rMax: 0.8,  speed: 0.04, parallax: 0.008, alpha: 0.55 },
    { count: 180, rMin: 0.6, rMax: 1.4,  speed: 0.08, parallax: 0.018, alpha: 0.75 },
    { count:  80, rMin: 1.2, rMax: 2.4,  speed: 0.14, parallax: 0.032, alpha: 0.95 },
  ];

  const DARK_STAR_COLORS = [
    '#ffffff', '#fdf4f8', '#fbc8d4',
    '#c4b5fd', '#a5f3fc', '#f9d77e',
    '#e0e7ff', '#fbcfe8',
  ];

  const BLUE_STAR_COLORS = [
    '#ffffff', '#f0f9ff', '#93c5fd',
    '#60a5fa', '#bae6fd', '#a78bfa',
    '#e0f2fe', '#ddd6fe',
  ];

  function getStarColors() {
    return document.documentElement.getAttribute('data-theme') === 'light'
      ? BLUE_STAR_COLORS : DARK_STAR_COLORS;
  }

  let stars = [];

  buildStars = function () {
    stars = [];
    LAYERS.forEach((layer, li) => {
      for (let i = 0; i < layer.count; i++) {
        stars.push({
          x:       Math.random(),
          y:       Math.random(),
          r:       Math.random() * (layer.rMax - layer.rMin) + layer.rMin,
          color:   getStarColors()[Math.floor(Math.random() * getStarColors().length)],
          alpha:   Math.random() * 0.5 + layer.alpha * 0.5,
          twinkle: Math.random() * Math.PI * 2,
          twinkleSpeed: Math.random() * 0.025 + 0.008,
          layer:   li,
          parallax: layer.parallax,
          // some stars get a cross-flare
          flare:   Math.random() > 0.82,
        });
      }
    });
  }
  buildStars();

  /* ---- Shooting stars ---- */
  let shooters = [];
  function spawnShooter() {
    const angle = Math.random() * 0.4 + 0.1; // shallow diagonal
    const speed = Math.random() * 6 + 5;
    shooters.push({
      x:     Math.random() * W,
      y:     Math.random() * H * 0.5,
      vx:    Math.cos(angle) * speed,
      vy:    Math.sin(angle) * speed,
      len:   Math.random() * 120 + 60,
      alpha: 1,
      color: getStarColors()[Math.floor(Math.random() * getStarColors().length)],
      life:  0,
      maxLife: Math.random() * 40 + 30,
    });
  }

  // Spawn a shooter every 2.5–5s
  setInterval(spawnShooter, Math.random() * 2500 + 2500);
  setInterval(() => { spawnShooter(); }, 3800);

  /* ---- Draw nebula ---- */
  function drawNebulas() {
    const px = (mouseX / W - 0.5) * 30;
    const py = (mouseY / H - 0.5) * 20;
    getNebulas().forEach(n => {
      const gx = n.x * W + px * 0.3;
      const gy = n.y * H + py * 0.3 - scrollY * 0.05;
      const gr = n.r * Math.min(W, H);
      const g  = ctx.createRadialGradient(gx, gy, 0, gx, gy, gr);
      g.addColorStop(0,   n.c + (n.a * 1.4) + ')');
      g.addColorStop(0.4, n.c + n.a + ')');
      g.addColorStop(1,   n.c + '0)');
      ctx.fillStyle = g;
      ctx.beginPath();
      ctx.ellipse(gx, gy, gr, gr * 0.65, Math.PI * 0.15, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* ---- Draw stars ---- */
  function drawStars(t) {
    const px = (mouseX / W - 0.5);
    const py = (mouseY / H - 0.5);

    stars.forEach(s => {
      s.twinkle += s.twinkleSpeed;
      const twinkleA = 0.5 + 0.5 * Math.sin(s.twinkle);
      const a = s.alpha * (0.4 + 0.6 * twinkleA);

      // Parallax offset from mouse + scroll
      const ox = px * s.parallax * W * 60;
      const oy = py * s.parallax * H * 60 - scrollY * s.parallax * 2.5;

      const sx = s.x * W + ox;
      const sy = s.y * H + oy;

      // Pulse radius
      const pr = s.r * (0.85 + 0.15 * twinkleA);

      // Glow
      const glowR = pr * (s.layer === 2 ? 5 : 3.5);
      const grd = ctx.createRadialGradient(sx, sy, 0, sx, sy, glowR);
      grd.addColorStop(0,   hexToRgba(s.color, a));
      grd.addColorStop(0.3, hexToRgba(s.color, a * 0.5));
      grd.addColorStop(1,   hexToRgba(s.color, 0));
      ctx.fillStyle = grd;
      ctx.beginPath();
      ctx.arc(sx, sy, glowR, 0, Math.PI * 2);
      ctx.fill();

      // Core
      ctx.fillStyle = hexToRgba(s.color, Math.min(1, a * 1.4));
      ctx.beginPath();
      ctx.arc(sx, sy, pr, 0, Math.PI * 2);
      ctx.fill();

      // Cross flare on bright near stars
      if (s.flare && s.layer === 2 && twinkleA > 0.6) {
        const flen = pr * 5 * twinkleA;
        ctx.strokeStyle = hexToRgba(s.color, a * 0.5 * twinkleA);
        ctx.lineWidth = 0.6;
        ctx.beginPath();
        ctx.moveTo(sx - flen, sy); ctx.lineTo(sx + flen, sy);
        ctx.moveTo(sx, sy - flen); ctx.lineTo(sx, sy + flen);
        ctx.stroke();
      }
    });
  }

  /* ---- Draw shooters ---- */
  function drawShooters() {
    shooters = shooters.filter(s => s.life < s.maxLife);
    shooters.forEach(s => {
      s.life++;
      s.x += s.vx;
      s.y += s.vy;
      const progress = s.life / s.maxLife;
      const a = progress < 0.3
        ? progress / 0.3
        : 1 - (progress - 0.3) / 0.7;

      const tailX = s.x - s.vx / Math.hypot(s.vx, s.vy) * s.len;
      const tailY = s.y - s.vy / Math.hypot(s.vx, s.vy) * s.len;

      const grad = ctx.createLinearGradient(tailX, tailY, s.x, s.y);
      grad.addColorStop(0, hexToRgba(s.color, 0));
      grad.addColorStop(0.7, hexToRgba(s.color, a * 0.4));
      grad.addColorStop(1,   hexToRgba(s.color, a));

      ctx.strokeStyle = grad;
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.moveTo(tailX, tailY);
      ctx.lineTo(s.x, s.y);
      ctx.stroke();

      // Head glow
      const hg = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, 6);
      hg.addColorStop(0, hexToRgba('#ffffff', a));
      hg.addColorStop(1, hexToRgba(s.color, 0));
      ctx.fillStyle = hg;
      ctx.beginPath();
      ctx.arc(s.x, s.y, 6, 0, Math.PI * 2);
      ctx.fill();
    });
  }

  /* ---- Helper ---- */
  function hexToRgba(hex, a) {
    const r = parseInt(hex.slice(1,3),16);
    const g = parseInt(hex.slice(3,5),16);
    const b = parseInt(hex.slice(5,7),16);
    return `rgba(${r},${g},${b},${Math.max(0,Math.min(1,a))})`;
  }

  /* ---- Main loop ---- */
  let t = 0;
  function loop() {
    t++;
    ctx.clearRect(0, 0, W, H);

    // Deep space gradient
    const isBlue = document.documentElement.getAttribute('data-theme') === 'light';
    const bg = ctx.createRadialGradient(W*0.5, H*0.4, 0, W*0.5, H*0.5, Math.max(W,H)*0.85);
    if (isBlue) {
      bg.addColorStop(0,   '#0a1535');
      bg.addColorStop(0.5, '#060d1f');
      bg.addColorStop(1,   '#020610');
    } else {
      bg.addColorStop(0,   '#0e0820');
      bg.addColorStop(0.5, '#080612');
      bg.addColorStop(1,   '#030208');
    }
    ctx.fillStyle = bg;
    ctx.fillRect(0, 0, W, H);

    drawNebulas();
    drawStars(t);
    drawShooters();

    requestAnimationFrame(loop);
  }
  loop();
})();

/* ===== Theme toggle — DARK by default, always ===== */
const html     = document.documentElement;
const themeBtn = document.getElementById('themeBtn');

// Always start dark on first visit; only respect saved pref after user toggles
const saved = localStorage.getItem('theme');
html.setAttribute('data-theme', saved || 'dark');

themeBtn.addEventListener('click', () => {
  const next = html.getAttribute('data-theme') === 'dark' ? 'light' : 'dark';
  html.setAttribute('data-theme', next);
  localStorage.setItem('theme', next);
  // Rebuild stars with new color palette
  setTimeout(buildStars, 50);
});

/* ===== Custom cursor ===== */
const cursorDot  = document.getElementById('cursorDot');
const cursorRing = document.getElementById('cursorRing');

let mouseX = 0, mouseY = 0;
let ringX  = 0, ringY  = 0;
let lastTrail = 0;
let speed = 0, lastX = 0, lastY = 0;

document.addEventListener('mousemove', e => {
  mouseX = e.clientX;
  mouseY = e.clientY;

  // Measure speed for trail density
  const dx = mouseX - lastX, dy = mouseY - lastY;
  speed = Math.sqrt(dx*dx + dy*dy);
  lastX = mouseX; lastY = mouseY;

  cursorDot.style.left = mouseX + 'px';
  cursorDot.style.top  = mouseY + 'px';

  // Spawn trail — only when moving, one particle at a time
  const now = Date.now();
  if (now - lastTrail > 50 && speed > 3) {
    lastTrail = now;
    spawnTrail(mouseX, mouseY);
  }
});

// Smooth lagging ring
(function animateRing() {
  ringX += (mouseX - ringX) * 0.1;
  ringY += (mouseY - ringY) * 0.1;
  cursorRing.style.left = ringX + 'px';
  cursorRing.style.top  = ringY + 'px';
  requestAnimationFrame(animateRing);
})();

// Hover state
document.querySelectorAll('a, button, .skill-card, .exp-card, .project-card, .stat-item, .theme-btn, .scroll-top, .nav-logo').forEach(el => {
  el.addEventListener('mouseenter', () => { cursorDot.classList.add('hovering'); cursorRing.classList.add('hovering'); });
  el.addEventListener('mouseleave', () => { cursorDot.classList.remove('hovering'); cursorRing.classList.remove('hovering'); });
});

document.addEventListener('mouseleave', () => { cursorDot.style.opacity = '0'; cursorRing.style.opacity = '0'; });
document.addEventListener('mouseenter', () => { cursorDot.style.opacity = '1'; cursorRing.style.opacity = '1'; });

// Click burst — removed (too distracting)

/* ---- Trail particle — subtle ---- */
const TRAIL_COLORS = ['#fbc8d4', '#f4a7b9', '#c4b5fd', '#f9d77e'];

function spawnTrail(x, y) {
  const el = document.createElement('div');
  el.className = 'cursor-trail';
  const size  = Math.random() * 3 + 1.5;
  const color = TRAIL_COLORS[Math.floor(Math.random() * TRAIL_COLORS.length)];
  const ox    = (Math.random() - 0.5) * 10;
  const oy    = (Math.random() - 0.5) * 10;
  const dur   = Math.random() * 300 + 300;
  el.style.cssText = `
    left:${x + ox}px; top:${y + oy}px;
    width:${size}px; height:${size}px;
    background:${color};
    box-shadow: 0 0 ${size*2}px ${color}88;
    animation: trailFade ${dur}ms ease-out forwards;
  `;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), dur + 50);
}

/* ===== Nav scroll + Scroll-to-top ===== */
const nav       = document.getElementById('nav');
const scrollTop = document.getElementById('scrollTop');

window.addEventListener('scroll', () => {
  nav.classList.toggle('scrolled', window.scrollY > 20);
  scrollTop.classList.toggle('visible', window.scrollY > 400);
});

scrollTop.addEventListener('click', () => {
  window.scrollTo({ top: 0, behavior: 'smooth' });
});

/* ===== Hamburger ===== */
const hamburger = document.getElementById('hamburger');
const navLinks  = document.getElementById('navLinks');
hamburger.addEventListener('click', () => navLinks.classList.toggle('open'));
navLinks.querySelectorAll('a').forEach(l => l.addEventListener('click', () => navLinks.classList.remove('open')));

/* ===== Floating sparkle particles ===== */
const canvas = document.getElementById('petals');
const ctx    = canvas.getContext('2d');

function resize() {
  canvas.width  = canvas.offsetWidth;
  canvas.height = canvas.offsetHeight;
}
window.addEventListener('resize', () => { resize(); initParticles(); });
resize();

const COLORS = [
  'rgba(244,167,185,',   // rose
  'rgba(196,181,253,',   // lavender
  'rgba(249,215,126,',   // gold
  'rgba(251,200,212,',   // rose bright
];

let particles = [];

function initParticles() {
  particles = Array.from({ length: 90 }, () => makeParticle(true));
}

function makeParticle(randomY = false) {
  const color = COLORS[Math.floor(Math.random() * COLORS.length)];
  return {
    x:     Math.random() * canvas.width,
    y:     randomY ? Math.random() * canvas.height : canvas.height + 10,
    r:     Math.random() * 1.8 + 0.4,
    vx:    (Math.random() - 0.5) * 0.3,
    vy:    -(Math.random() * 0.35 + 0.08),
    alpha: Math.random() * 0.45 + 0.08,
    color,
    twinkle: Math.random() * Math.PI * 2,
    twinkleSpeed: Math.random() * 0.03 + 0.01,
  };
}

initParticles();

function draw() {
  ctx.clearRect(0, 0, canvas.width, canvas.height);
  particles.forEach(p => {
    p.x += p.vx;
    p.y += p.vy;
    p.twinkle += p.twinkleSpeed;
    const a = p.alpha * (0.6 + 0.4 * Math.sin(p.twinkle));

    if (p.y < -6) Object.assign(p, makeParticle(false));
    if (p.x < -6) p.x = canvas.width + 6;
    if (p.x > canvas.width + 6) p.x = -6;

    // Draw as a small 4-point star for some, circle for others
    ctx.save();
    ctx.globalAlpha = a;
    ctx.fillStyle = p.color + a + ')';
    if (p.r > 1.4) {
      // tiny star
      ctx.translate(p.x, p.y);
      ctx.beginPath();
      for (let i = 0; i < 4; i++) {
        const angle = (i / 4) * Math.PI * 2;
        const inner = p.r * 0.4;
        const outer = p.r * 1.2;
        ctx.lineTo(Math.cos(angle) * outer, Math.sin(angle) * outer);
        ctx.lineTo(Math.cos(angle + Math.PI / 4) * inner, Math.sin(angle + Math.PI / 4) * inner);
      }
      ctx.closePath();
      ctx.fill();
    } else {
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.restore();
  });
  requestAnimationFrame(draw);
}
draw();

/* ===== Contact form ===== */
const contactForm = document.getElementById('contactForm');
if (contactForm) {
  const submitBtn = document.getElementById('formSubmit');
  const successMsg = document.getElementById('formSuccess');
  const errorMsg = document.getElementById('formError');

  contactForm.addEventListener('submit', async e => {
    e.preventDefault();
    submitBtn.disabled = true;
    submitBtn.textContent = 'Sending…';
    successMsg.classList.remove('show');
    errorMsg.classList.remove('show');

    // file:// protocol can't make cross-origin fetch — warn user
    if (location.protocol === 'file:') {
      errorMsg.textContent = 'Please host this site on a server to enable form submission.';
      errorMsg.classList.add('show');
      submitBtn.disabled = false;
      submitBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send message`;
      return;
    }

    try {
      const res = await fetch(contactForm.action, {
        method: 'POST',
        body: new FormData(contactForm),
        headers: { 'Accept': 'application/json' }
      });
      if (res.ok) {
        contactForm.reset();
        successMsg.classList.add('show');
        submitBtn.innerHTML = `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><line x1="22" y1="2" x2="11" y2="13"/><polygon points="22 2 15 22 11 13 2 9 22 2"/></svg> Send message`;
      } else {
        errorMsg.textContent = 'Something went wrong. Please try again.';
        errorMsg.classList.add('show');
      }
    } catch {
      errorMsg.textContent = 'Something went wrong. Please try again.';
      errorMsg.classList.add('show');
    } finally {
      submitBtn.disabled = false;
    }
  });
}

/* ===== Scroll reveal ===== */
const revealEls = document.querySelectorAll('.timeline-item, .project-card, .exp-card');
const observer  = new IntersectionObserver((entries) => {
  entries.forEach((entry, i) => {
    if (entry.isIntersecting) {
      setTimeout(() => entry.target.classList.add('visible'), i * 110);
      observer.unobserve(entry.target);
    }
  });
}, { threshold: 0.1 });

revealEls.forEach(el => observer.observe(el));

/* ===== 3D Mouse tilt on cards ===== */
const tiltCards = document.querySelectorAll('.skill-card, .exp-card, .project-card, .stat-item');

tiltCards.forEach(card => {
  card.addEventListener('mousemove', e => {
    const rect = card.getBoundingClientRect();
    const cx = rect.left + rect.width  / 2;
    const cy = rect.top  + rect.height / 2;
    const dx = (e.clientX - cx) / (rect.width  / 2);
    const dy = (e.clientY - cy) / (rect.height / 2);
    const rotX = -dy * 8;
    const rotY =  dx * 8;
    card.style.transform = `perspective(900px) rotateX(${rotX}deg) rotateY(${rotY}deg) translateY(-6px)`;
  });

  card.addEventListener('mouseleave', () => {
    card.style.transform = '';
  });
});

