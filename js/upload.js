// upload.js
let selectedFolder = 'All';
let _folders = ['All', 'Dates', 'Travel', 'Selfies', 'Special Days', 'Together'];
window._folders = _folders;

function loadFolders() {
  const saved = localStorage.getItem('muskan_folders');
  if (saved) { _folders = JSON.parse(saved); window._folders = _folders; }
  renderFolderPills();
  renderFolderOrbit(_folders);
}

function saveFolders() {
  localStorage.setItem('muskan_folders', JSON.stringify(_folders));
}

function addFolder() {
  const nm = document.getElementById('fp-new-inp').value.trim();
  if (!nm || _folders.includes(nm)) return;
  _folders.push(nm);
  saveFolders();
  document.getElementById('fp-new-inp').value = '';
  renderFolderPills();
  renderFolderOrbit(_folders);
  showToast(`"${nm}" created`, 'ok');
}

function renderFolderPills() {
  const el = document.getElementById('fp-pills');
  el.innerHTML = _folders.map(f =>
    `<button class="fp-pill${f === selectedFolder ? ' on' : ''}" onclick="pickFolder('${f}')">${f}</button>`
  ).join('');
}

function pickFolder(f) {
  selectedFolder = f;
  renderFolderPills();
}

function initUpload() {
  const fi = document.getElementById('file-in');
  fi.addEventListener('change', e => handleFiles(e.target.files));

  const orb = document.getElementById('upload-orb');
  orb.addEventListener('dragover', e => { e.preventDefault(); orb.classList.add('drag'); });
  orb.addEventListener('dragleave', () => orb.classList.remove('drag'));
  orb.addEventListener('drop', e => {
    e.preventDefault();
    orb.classList.remove('drag');
    handleFiles(e.dataTransfer.files);
  });
}

async function handleFiles(files) {
  if (!files.length) return;
  const queue = document.getElementById('upload-queue');
  queue.innerHTML = '';

  // Build queue UI
  const items = Array.from(files).map((f, i) => {
    const div = document.createElement('div');
    div.className = 'uq-item';
    div.id = `uqi-${i}`;
    div.innerHTML = `
      <div class="uqi-name">${f.name.replace(/^\d+_/, '')}</div>
      <div class="uqi-status" id="uqs-${i}">waiting</div>`;
    queue.appendChild(div);
    return f;
  });

  // Show progress ring
  const ring = document.getElementById('progress-ring');
  ring.classList.remove('hidden');
  const fill = document.getElementById('pr-fill');
  const pct  = document.getElementById('pr-text');
  const circumference = 213.6;

  let done = 0;
  for (let i = 0; i < items.length; i++) {
    const f = items[i];
    const statusEl = document.getElementById(`uqs-${i}`);
    statusEl.textContent = 'uploading…';

    const folder = selectedFolder === 'All' ? '' : selectedFolder + '/';
    const path   = folder + Date.now() + '_' + f.name;

    const { error } = await sb.storage.from('memories').upload(path, f, { upsert: true });

    done++;
    const p = done / items.length;
    fill.style.strokeDashoffset = circumference * (1 - p);
    pct.textContent = Math.round(p * 100) + '%';

    if (error) {
      statusEl.textContent = 'failed';
      statusEl.classList.add('err');
    } else {
      statusEl.textContent = 'added ✦';
      statusEl.classList.add('done');
    }
  }

  setTimeout(() => { ring.classList.add('hidden'); fill.style.strokeDashoffset = circumference; pct.textContent = '0%'; }, 1500);

  await loadSkyMedia();
  renderFolderOrbit(_folders);
  showToast(`${done} star${done !== 1 ? 's' : ''} added to the sky ✦`, 'ok');
}
