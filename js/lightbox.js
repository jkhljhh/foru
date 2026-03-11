// lightbox.js — cinematic lightbox with supernova particles

let lbIndex = 0;
let lbSuperCtx, lbSuperParts = [];
const LB_FX = ['lb-supernova', 'lb-portal', 'lb-fall', 'lb-unfold'];

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   INIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initLightbox() {
  const cv = document.getElementById('supernova-canvas');
  lbSuperCtx = cv.getContext('2d');
  cv.width = innerWidth; cv.height = innerHeight;
  window.addEventListener('resize', () => {
    cv.width = innerWidth; cv.height = innerHeight;
  });

  // particle loop
  (function loop() {
    requestAnimationFrame(loop);
    lbSuperCtx.clearRect(0, 0, cv.width, cv.height);
    lbSuperParts = lbSuperParts.filter(p => p.life > 0);
    lbSuperParts.forEach(p => {
      p.x  += p.vx; p.y += p.vy;
      p.vy += .12; p.vx *= .985; p.vy *= .985;
      p.life -= 1.4;
      p.angle += p.spin;

      lbSuperCtx.globalAlpha = Math.max(0, p.life / 80) * .8;
      lbSuperCtx.save();
      lbSuperCtx.translate(p.x, p.y);
      lbSuperCtx.rotate(p.angle);
      lbSuperCtx.fillStyle = p.c;
      if (p.shape === 'rect') {
        lbSuperCtx.fillRect(-p.r, -p.r * .4, p.r * 2, p.r * .8);
      } else {
        lbSuperCtx.beginPath();
        lbSuperCtx.arc(0, 0, p.r, 0, Math.PI * 2);
        lbSuperCtx.fill();
      }
      lbSuperCtx.restore();
    });
    lbSuperCtx.globalAlpha = 1;
  })();

  // keyboard
  document.addEventListener('keydown', e => {
    const lb = document.getElementById('lightbox');
    if (lb.classList.contains('hidden')) return;
    if (e.key === 'Escape')     closeLightbox();
    if (e.key === 'ArrowLeft')  lbNav(-1);
    if (e.key === 'ArrowRight') lbNav(1);
  });

  // touch swipe
  let tx0 = 0;
  const lb = document.getElementById('lightbox');
  lb.addEventListener('touchstart', e => { tx0 = e.touches[0].clientX; });
  lb.addEventListener('touchend',   e => {
    const dx = e.changedTouches[0].clientX - tx0;
    if (Math.abs(dx) > 50) lbNav(dx < 0 ? 1 : -1);
  });
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   SUPERNOVA BURST
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function supernovaBurst() {
  const cx = innerWidth / 2, cy = innerHeight / 2;
  const cols = ['#ff2d6b','#ffb3c6','#d4a843','#fff','#b48fff','#ffe4a0','#ff85aa'];

  for (let i = 0; i < 120; i++) {
    const a   = Math.random() * Math.PI * 2;
    const spd = 2 + Math.random() * 9;
    lbSuperParts.push({
      x: cx, y: cy,
      vx: Math.cos(a) * spd,
      vy: Math.sin(a) * spd - 3,
      r:  .5 + Math.random() * 4,
      c:  cols[Math.floor(Math.random() * cols.length)],
      life: 55 + Math.random() * 45,
      angle: Math.random() * Math.PI * 2,
      spin:  (.02 + Math.random() * .08) * (Math.random() < .5 ? 1 : -1),
      shape: Math.random() < .3 ? 'rect' : 'circle'
    });
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   OPEN / CLOSE / NAV
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function openLightbox(idx) {
  lbIndex = idx;
  document.getElementById('lightbox').classList.remove('hidden');
  document.body.style.overflow = 'hidden';
  showLbMedia();
  supernovaBurst();
}

function closeLightbox() {
  document.getElementById('lightbox').classList.add('hidden');
  document.body.style.overflow = '';
  const v = document.getElementById('lb-vid');
  v.pause(); v.src = '';
  document.getElementById('lb-img').src = '';
}

function lbNav(dir) {
  const items = getLbItems();
  lbIndex = (lbIndex + dir + items.length) % items.length;
  showLbMedia();
  supernovaBurst();
  emitSparks(innerWidth / 2, innerHeight / 2, 8);
}

function showLbMedia() {
  const items = getLbItems();
  const m     = items[lbIndex];
  if (!m) return;

  const img = document.getElementById('lb-img');
  const vid = document.getElementById('lb-vid');
  const fx  = LB_FX[Math.floor(Math.random() * LB_FX.length)];

  document.getElementById('lb-name').textContent =
    m.name.replace(/^\d+_/, '').replace(/\.[^.]+$/, '');
  document.getElementById('lb-pos').textContent =
    `${lbIndex + 1}  ·  ${items.length}`;

  if (m.type === 'video') {
    img.style.display = 'none'; img.src = '';
    vid.style.display = 'block';
    vid.src = m.url;
    vid.className = fx;
  } else {
    vid.style.display = 'none'; vid.pause(); vid.src = '';
    img.style.display = 'block';
    img.className = '';
    void img.offsetWidth;
    img.className = fx;
    img.src = m.url;
  }
}
