// app.js — main boot, hero, view switching, quotes, utils

window.addEventListener('DOMContentLoaded', () => {
  initAurora();
  initCursor();
  initSparks();
  initSky();
  initLightbox();
  initUpload();
  loadFolders();
  animateHeroLetters();
  startQuoteRain();
  initEdgeNav();

  // make sky canvas interactive immediately
  const skyCv = document.getElementById('sky-canvas');
  skyCv.style.pointerEvents = 'all';
  skyCv.style.opacity = '1';

  // SVG gradient for progress ring
  const svg = document.querySelector('#progress-ring svg');
  const defs = document.createElementNS('http://www.w3.org/2000/svg', 'defs');
  defs.innerHTML = `<linearGradient id="ring-grad" x1="0%" y1="0%" x2="100%" y2="0%">
    <stop offset="0%"   stop-color="#ff2d6b"/>
    <stop offset="100%" stop-color="#d4a843"/>
  </linearGradient>`;
  svg.prepend(defs);
  document.querySelector('.pr-fill').style.stroke = 'url(#ring-grad)';
});

function animateHeroLetters() {
  document.querySelectorAll('.letter').forEach((l, i) => {
    setTimeout(() => l.classList.add('in'), 200 + i * 80);
  });
}

async function enterApp() {
  emitSparks(innerWidth / 2, innerHeight / 2, 30, '#d4a843');

  loadStories();
  loadGifts();
  await loadSkyMedia();

  document.getElementById('hero').classList.add('out');
  setTimeout(() => {
    document.getElementById('hero').style.display = 'none';
    document.getElementById('app').classList.remove('hidden');
    document.getElementById('edge-nav').style.display = 'flex';
    switchView('sky', document.querySelector('[data-view="sky"]'));
  }, 800);
}

function initEdgeNav() {
  // nav is always visible — nothing to do
}

function switchView(name, btn) {
  document.querySelectorAll('.view').forEach(v => v.classList.remove('active'));
  document.querySelectorAll('.nav-item').forEach(b => b.classList.remove('active'));
  document.getElementById('view-' + name).classList.add('active');
  if (btn) btn.classList.add('active');

  // show/hide sky canvas
  const skyCv = document.getElementById('sky-canvas');
  if (name === 'sky') {
    skyCv.style.display = 'block';
    skyCv.style.pointerEvents = 'all';
    placeStars();
  } else {
    skyCv.style.display = 'none';
    skyCv.style.pointerEvents = 'none';
  }
}

function openPanel(id) {
  document.getElementById(id).classList.remove('hidden');
  requestAnimationFrame(() => document.getElementById(id).classList.add('open'));
}
function closePanel(id) {
  document.getElementById(id).classList.remove('open');
  setTimeout(() => document.getElementById(id).classList.add('hidden'), 550);
}

let toastTimer;
function showToast(msg, type = 'ok') {
  const t = document.getElementById('toast');
  t.textContent = msg;
  t.className   = 'show ' + type;
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => { t.className = type; }, 3200);
}

const QUOTES = [
  'you are my favourite kind of forever',
  'every heartbeat whispers your name',
  'in a room full of art, I\'d still stare at you',
  'with you, even silence feels like music',
  'you are the reason I believe in magic',
  'my heart knew you before my eyes did',
  '🦉 even your name sounds like a smile',
  'I choose you, every single time',
  'you are home',
  'every moment with you is a universe',
  'the world is more beautiful because you exist',
  'you are the poem I never knew how to write',
];
let qIdx = 0;

function startQuoteRain() {
  function drop() {
    const q = document.createElement('div');
    q.style.cssText =
      'position:fixed;z-index:600;pointer-events:none;' +
      'font-family:"Mrs Saint Delafield",cursive;' +
      'font-size:clamp(1rem,2.5vw,1.5rem);' +
      'color:rgba(255,255,255,.95);' +
      'text-shadow:0 0 12px #fff, 0 0 30px rgba(255,255,255,.8), 0 0 60px rgba(255,200,220,.6);' +
      'left:' + (6 + Math.random() * 78) + '%;' +
      'top:'  + (10 + Math.random() * 70) + '%;' +
      'animation:quoteFade 7s ease forwards;' +
      'max-width:260px;text-align:center;line-height:1.4;';
    q.textContent = QUOTES[qIdx % QUOTES.length]; qIdx++;
    document.body.appendChild(q);
    setTimeout(() => q.remove(), 7200);
    setTimeout(drop, 11000 + Math.random() * 9000);
  }
  setTimeout(drop, 6000);

  const s = document.createElement('style');
  s.textContent =
    '@keyframes quoteFade{' +
    '0%{opacity:0;transform:translateY(14px) scale(.97)}' +
    '12%{opacity:1;transform:translateY(0) scale(1)}' +
    '80%{opacity:.8}' +
    '100%{opacity:0;transform:translateY(-22px)}}';
  document.head.appendChild(s);
}
