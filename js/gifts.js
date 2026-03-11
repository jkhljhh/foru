// gifts.js
async function loadGifts() {
  try {
    const { data } = await sb.from('gifts').select('*').order('created_at', { ascending: false });
    renderGiftBlooms(data || []);
  } catch { renderGiftBlooms([]); }
}

function renderGiftBlooms(list) {
  const el = document.getElementById('gift-blooms');
  if (!list.length) {
    el.innerHTML = `<div style="padding:4rem;text-align:center;color:rgba(254,248,240,.2);grid-column:1/-1">
      <div style="font-size:3rem;margin-bottom:1rem;opacity:.3">❋</div>
      <p style="font-family:'Cormorant',serif;font-style:italic;font-size:1.1rem">Every gift begins with a thought of her.</p>
    </div>`;
    return;
  }
  el.innerHTML = list.map(g => `
    <div class="gift-bloom">
      <span class="gb-icon">${g.icon || '🎁'}</span>
      <div class="gb-name">${g.name}</div>
      <div class="gb-occ">${g.occasion || ''}</div>
      <div class="gb-note">${g.note || ''}</div>
      <button class="gb-del" onclick="deleteGift('${g.id}')">✕</button>
    </div>`).join('');
}

function openGiftCompose() {
  ['g-icon','g-name','g-occ','g-note'].forEach(id => {
    document.getElementById(id).value = '';
  });
  openPanel('gift-panel');
}

async function saveGift() {
  const name = document.getElementById('g-name').value.trim();
  if (!name) { showToast('Enter a gift name', 'err'); return; }
  const { error } = await sb.from('gifts').insert({
    name,
    occasion: document.getElementById('g-occ').value.trim(),
    note:     document.getElementById('g-note').value.trim(),
    icon:     document.getElementById('g-icon').value.trim() || '🎁'
  });
  if (error) { showToast('Could not save', 'err'); return; }
  closePanel('gift-panel');
  showToast('Gift planted ❋', 'ok');
  await loadGifts();
}

async function deleteGift(id) {
  if (!confirm('Remove this gift?')) return;
  await sb.from('gifts').delete().eq('id', id);
  await loadGifts();
  showToast('Removed', 'ok');
}
