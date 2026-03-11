// stories.js
async function loadStories() {
  try {
    const { data } = await sb.from('stories').select('*').order('created_at', { ascending: false });
    renderStoryOrbs(data || []);
  } catch { renderStoryOrbs([]); }
}

function renderStoryOrbs(list) {
  const el = document.getElementById('story-orbs');
  if (!list.length) {
    el.innerHTML = `<div style="padding:4rem 0;text-align:center;color:rgba(254,248,240,.2)">
      <div style="font-size:3rem;margin-bottom:1rem;opacity:.3">✦</div>
      <p style="font-family:'Cormorant',serif;font-style:italic;font-size:1.1rem">No stories yet. Write the first one.</p>
    </div>`;
    return;
  }
  el.innerHTML = '';
  list.forEach((s, i) => {
    const orb = document.createElement('div');
    orb.className = 'story-orb';
    orb.style.animationDelay = i * .08 + 's';
    orb.innerHTML = `
      <div class="so-date">${new Date(s.created_at).toLocaleDateString('en-IN', { month: 'short', day: 'numeric', year: 'numeric' })}</div>
      <div class="so-title">${s.title || 'Untitled'}</div>
      <div class="so-preview">${(s.body || '').slice(0, 60)}…</div>`;
    orb.addEventListener('click', () => openStoryRead(s));
    el.appendChild(orb);
  });
}

function openStoryCompose() {
  document.getElementById('story-title').value = '';
  document.getElementById('story-body').value  = '';
  document.getElementById('story-date').textContent =
    new Date().toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  openPanel('story-panel');
}

async function saveStory() {
  const title = document.getElementById('story-title').value.trim();
  const body  = document.getElementById('story-body').value.trim();
  if (!body) { showToast('Write something first', 'err'); return; }
  const { error } = await sb.from('stories').insert({ title, body });
  if (error) { showToast('Could not save', 'err'); return; }
  closePanel('story-panel');
  showToast('Story preserved forever ✦', 'ok');
  await loadStories();
}

function openStoryRead(s) {
  document.getElementById('srp-date').textContent =
    new Date(s.created_at).toLocaleDateString('en-IN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' });
  document.getElementById('srp-title').textContent = s.title || 'Untitled';
  document.getElementById('srp-body').textContent  = s.body  || '';
  document.getElementById('srp-del').onclick = async () => {
    if (!confirm('Delete this story?')) return;
    await sb.from('stories').delete().eq('id', s.id);
    closePanel('story-read-panel');
    showToast('Deleted', 'ok');
    await loadStories();
  };
  openPanel('story-read-panel');
}
