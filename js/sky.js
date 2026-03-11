// sky.js — memories rendered as interactive stars on canvas

let skyCanvas, skyCtx;
let stars = [];            // { x, y, r, pulse, media, folder, hovered, opacity }
let skyFolder = 'All';
let skyMedia  = [];
let skyAnimId = null;

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   INIT
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function initSky() {
  skyCanvas = document.getElementById('sky-canvas');
  skyCtx    = skyCanvas.getContext('2d');
  resizeSky();
  window.addEventListener('resize', resizeSky);

  skyCanvas.addEventListener('mousemove', onSkyMove);
  skyCanvas.addEventListener('click',     onSkyClick);
  skyCanvas.addEventListener('touchend',  onSkyTouch);

  // background nebula dust (static small stars)
  buildDust();
  // start render loop
  renderSky();
}

function resizeSky() {
  skyCanvas.width  = innerWidth;
  skyCanvas.height = innerHeight;
  buildDust();
  placeStars();
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DUST (ambient background stars)
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
let dust = [];
function buildDust() {
  dust = [];
  for (let i = 0; i < 320; i++) {
    dust.push({
      x: Math.random() * innerWidth,
      y: Math.random() * innerHeight,
      r: .3 + Math.random() * 1.2,
      alpha: .05 + Math.random() * .35,
      twinkleSpeed: .005 + Math.random() * .015,
      twinklePhase: Math.random() * Math.PI * 2,
      col: ['#ffffff','#ffc8d8','#d4a843','#b48fff'][Math.floor(Math.random()*4)]
    });
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   PLACE MEMORY STARS
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function placeStars() {
  const visible = skyFolder === 'All'
    ? skyMedia
    : skyMedia.filter(m => m.folder === skyFolder);

  // Organic placement — avoid edges and nav
  const navW  = window.innerWidth <= 768 ? 0 : 72;
  const pad   = 80;
  const W     = innerWidth  - navW - pad;
  const H     = innerHeight - pad;
  const offX  = navW + pad / 2;
  const offY  = pad / 2;

  stars = visible.map((m, i) => {
    // Pseudo-random but deterministic per item name
    const seed  = hashStr(m.name + m.folder);
    const angle = seed * 2.399963; // golden angle
    const rad   = Math.sqrt(i / Math.max(visible.length, 1)) * Math.min(W, H) * .44;
    const cx    = offX + W / 2 + Math.cos(angle) * rad;
    const cy    = offY + H / 2 + Math.sin(angle) * rad;

    return {
      x: cx, y: cy,
      r: 4 + Math.random() * 5,
      pulse: Math.random() * Math.PI * 2,
      pulseSpeed: .018 + Math.random() * .012,
      media: m,
      hovered: false,
      opacity: 0,
      targetOpacity: 1,
      img: null
    };
  });

  // Pre-load thumbnails for image stars
  stars.forEach(s => {
    if (s.media.type === 'image') {
      const img = new Image();
      img.src = s.media.url;
      img.onload = () => { s.img = img; };
    }
  });

  const empty = document.getElementById('sky-empty');
  if (visible.length === 0) empty.classList.remove('hidden');
  else empty.classList.add('hidden');
}

function hashStr(str) {
  let h = 0;
  for (let i = 0; i < str.length; i++) h = (Math.imul(31, h) + str.charCodeAt(i)) | 0;
  return Math.abs(h) / 2147483648;
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   RENDER LOOP
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
let skyT = 0;
function renderSky() {
  requestAnimationFrame(renderSky);
  const ctx = skyCtx;
  const W = skyCanvas.width, H = skyCanvas.height;
  ctx.clearRect(0, 0, W, H);
  skyT += 0.01;

  // — Dust —
  dust.forEach(d => {
    d.twinklePhase += d.twinkleSpeed;
    const a = d.alpha * (.6 + .4 * Math.sin(d.twinklePhase));
    ctx.globalAlpha = a;
    ctx.fillStyle   = d.col;
    ctx.beginPath();
    ctx.arc(d.x, d.y, d.r, 0, Math.PI * 2);
    ctx.fill();
  });

  // — Memory stars —
  stars.forEach((s, idx) => {
    // fade in
    if (s.opacity < s.targetOpacity) s.opacity = Math.min(s.targetOpacity, s.opacity + .02);

    s.pulse += s.pulseSpeed;
    const scale = s.hovered
      ? 1 + .3 * Math.sin(skyT * 4)
      : 1 + .15 * Math.sin(s.pulse);
    const r = s.r * scale;

    // glow layers
    const grd = ctx.createRadialGradient(s.x, s.y, 0, s.x, s.y, r * 5);
    if (s.hovered) {
      grd.addColorStop(0,   'rgba(255,45,107,.9)');
      grd.addColorStop(.3,  'rgba(255,45,107,.3)');
      grd.addColorStop(1,   'rgba(255,45,107,0)');
    } else {
      grd.addColorStop(0,   'rgba(255,200,220,.8)');
      grd.addColorStop(.25, 'rgba(255,100,150,.2)');
      grd.addColorStop(1,   'rgba(255,100,150,0)');
    }

    ctx.globalAlpha = s.opacity;
    ctx.fillStyle   = grd;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r * 5, 0, Math.PI * 2);
    ctx.fill();

    // core dot
    ctx.globalAlpha = s.opacity;
    ctx.fillStyle   = s.hovered ? '#ff2d6b' : '#ffc8d8';
    ctx.shadowColor = s.hovered ? '#ff2d6b' : 'rgba(255,150,180,.5)';
    ctx.shadowBlur  = s.hovered ? 30 : 12;
    ctx.beginPath();
    ctx.arc(s.x, s.y, r, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowBlur = 0;

    // thumbnail preview on hover
    if (s.hovered && s.img) {
      const size = 100;
      const tx = Math.min(Math.max(s.x - size / 2, 10), W - size - 10);
      const ty = s.y > H / 2 ? s.y - size - r * 6 - 10 : s.y + r * 6 + 10;
      ctx.globalAlpha = .9;
      ctx.save();
      ctx.beginPath();
      ctx.arc(tx + size/2, ty + size/2, size/2, 0, Math.PI*2);
      ctx.clip();
      ctx.drawImage(s.img, tx, ty, size, size);
      ctx.restore();
      // circle border
      ctx.globalAlpha = .6;
      ctx.strokeStyle = '#ff2d6b';
      ctx.lineWidth = 1.5;
      ctx.beginPath();
      ctx.arc(tx + size/2, ty + size/2, size/2, 0, Math.PI*2);
      ctx.stroke();
    }

    // hover label
    if (s.hovered) {
      const label = s.media.name.replace(/^\d+_/, '').replace(/\.[^.]+$/, '');
      ctx.globalAlpha = .8;
      ctx.font = `200 11px 'Jost', sans-serif`;
      ctx.fillStyle = '#fef8f0';
      ctx.textAlign = 'center';
      const ly = s.img
        ? (s.y > H/2 ? s.y - r*6 - 115 : s.y + r*6 + 120)
        : (s.y > H/2 ? s.y - r - 14    : s.y + r + 18);
      ctx.fillText(label, s.x, ly);
    }

    ctx.globalAlpha = 1;
  });

  // star count label
  if (stars.length > 0) {
    ctx.globalAlpha = .25;
    ctx.font = `200 10px 'Jost', sans-serif`;
    ctx.fillStyle = '#fef8f0';
    ctx.textAlign = 'right';
    ctx.fillText(`${stars.length} memory${stars.length !== 1 ? 's' : ''}`,
      innerWidth - 20, innerHeight - 16);
    ctx.globalAlpha = 1;
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   INTERACTION
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function starAt(x, y) {
  return stars.find(s => {
    const dx = s.x - x, dy = s.y - y;
    return Math.sqrt(dx*dx + dy*dy) < Math.max(s.r * 4, 24);
  });
}

function onSkyMove(e) {
  const rect = skyCanvas.getBoundingClientRect();
  const x = e.clientX - rect.left;
  const y = e.clientY - rect.top;
  const hit = starAt(x, y);
  stars.forEach(s => { s.hovered = (s === hit); });
  skyCanvas.style.cursor = hit ? 'none' : 'none';
}

function onSkyClick(e) {
  const rect = skyCanvas.getBoundingClientRect();
  const hit  = starAt(e.clientX - rect.left, e.clientY - rect.top);
  if (hit) {
    emitSparks(e.clientX, e.clientY, 16, '#ff2d6b');
    const idx = (skyFolder === 'All' ? skyMedia : skyMedia.filter(m => m.folder === skyFolder))
      .findIndex(m => m.name === hit.media.name);
    openLightbox(idx);
  }
}

function onSkyTouch(e) {
  const t = e.changedTouches[0];
  const rect = skyCanvas.getBoundingClientRect();
  const hit = starAt(t.clientX - rect.left, t.clientY - rect.top);
  if (hit) {
    const idx = (skyFolder === 'All' ? skyMedia : skyMedia.filter(m => m.folder === skyFolder))
      .findIndex(m => m.name === hit.media.name);
    openLightbox(idx);
  }
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   FOLDER FILTER UI
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
function renderFolderOrbit(folders) {
  const el = document.getElementById('folder-orbit');
  el.innerHTML = folders.map(f =>
    `<button class="fo-pill${f === skyFolder ? ' on' : ''}" onclick="setSkyFolder('${f}')">${f}</button>`
  ).join('');
}

function setSkyFolder(f) {
  skyFolder = f;
  placeStars();
  renderFolderOrbit(window._folders || ['All']);
}

/* ━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━
   DATA LOAD
━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━ */
async function loadSkyMedia() {
  try {
    skyMedia = [];
    const { data, error } = await sb.storage.from('memories')
      .list('', { limit: 500, sortBy: { column: 'created_at', order: 'desc' } });
    if (error) throw error;
    await scanBucket('', data);
    placeStars();
  } catch (e) {
    showToast('Could not load memories: ' + e.message, 'err');
  }
}

async function scanBucket(prefix, items) {
  if (!items) return;
  for (const it of items) {
    if (it.id === null) {
      const { data } = await sb.storage.from('memories').list(prefix + it.name, { limit: 500 });
      await scanBucket(prefix + it.name + '/', data || []);
    } else {
      const { data: { publicUrl } } = sb.storage.from('memories').getPublicUrl(prefix + it.name);
      const isVid = /\.(mp4|webm|mov|avi)$/i.test(it.name);
      skyMedia.push({
        url: publicUrl,
        name: it.name,
        folder: prefix ? prefix.replace(/\/$/, '') : 'All',
        type: isVid ? 'video' : 'image'
      });
    }
  }
}

function getLbItems() {
  return skyFolder === 'All' ? skyMedia : skyMedia.filter(m => m.folder === skyFolder);
}
