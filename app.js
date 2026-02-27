/* ============================================================
   Live Character Counter — app.js
   ============================================================ */

// ── State ──────────────────────────────────────────────────
let currentLimit  = 280;
let snapshots     = [];
let prevCount     = 0;

// ── Color palette per status ───────────────────────────────
const STATUS = {
  idle    : { color: '#6ee7b7', msg: '',                  boxClass: '' },
  safe    : { color: '#6ee7b7', msg: '✓ Looking good',    boxClass: '' },
  warning : { color: '#fbbf24', msg: '⚠ Getting close',   boxClass: 'warning' },
  danger  : { color: '#f97316', msg: '🔥 Almost there',   boxClass: 'danger' },
  exceeded: { color: '#ef4444', msg: '✕ Limit exceeded!', boxClass: 'exceeded' },
};

function getStatus(count, limit) {
  if (!limit) return 'idle';
  const pct = count / limit;
  if (count > limit) return 'exceeded';
  if (pct >= 0.9)    return 'danger';
  if (pct >= 0.75)   return 'warning';
  if (count === 0)   return 'idle';
  return 'safe';
}

// ── Main input handler (Event Handling + State update) ─────
function handleInput() {
  const textarea = document.getElementById('mainInput');
  const text     = textarea.value;
  const count    = text.length;
  const words    = text.trim() === '' ? 0 : text.trim().split(/\s+/).length;
  const lines    = text === ''        ? 0 : text.split('\n').length;

  const status = getStatus(count, currentLimit);
  const cfg    = STATUS[status];

  // ── Shake when exceeding limit ──────────────────────────
  if (status === 'exceeded' && count > prevCount) {
    triggerShake();
  }
  prevCount = count;

  // ── Update counters ─────────────────────────────────────
  document.getElementById('charCount').textContent = count;
  document.getElementById('wordCount').textContent = words;
  document.getElementById('lineCount').textContent = lines;

  // ── Remaining ───────────────────────────────────────────
  const remainingVal = document.getElementById('remainingVal');
  const remainingLbl = document.getElementById('remainingLbl');

  if (currentLimit) {
    const rem = currentLimit - count;
    remainingVal.textContent = rem < 0 ? `+${Math.abs(rem)}` : rem;
    remainingLbl.textContent = 'left';
    remainingVal.style.color = cfg.color;

    // pulse when exceeded
    if (status === 'exceeded') {
      remainingVal.classList.add('pulse');
    } else {
      remainingVal.classList.remove('pulse');
    }
  } else {
    remainingVal.textContent = '';
    remainingLbl.textContent = '';
  }

  // ── Status message ──────────────────────────────────────
  const statusMsg = document.getElementById('statusMsg');
  statusMsg.textContent  = cfg.msg;
  statusMsg.style.color  = cfg.color;

  // ── Progress bar ────────────────────────────────────────
  const track = document.getElementById('progressTrack');
  const fill  = document.getElementById('progressFill');

  if (currentLimit && count > 0) {
    track.style.display = 'block';
    const pct = Math.min((count / currentLimit) * 100, 100);
    fill.style.width      = pct + '%';
    fill.style.background = cfg.color;
  } else {
    track.style.display = 'none';
  }

  // ── SVG ring ────────────────────────────────────────────
  updateRing(count, cfg.color);

  // ── Textarea box border ─────────────────────────────────
  const box = document.getElementById('textareaBox');
  box.className = 'textarea-box ' + cfg.boxClass;

  // ── Accent color on title ───────────────────────────────
  document.getElementById('titleAccent').style.color = cfg.color;
  document.getElementById('ringPct').style.color     = cfg.color;

  // ── Save button state ───────────────────────────────────
  const saveBtn = document.getElementById('saveBtn');
  const canSave = status !== 'exceeded' && text.trim() !== '';
  saveBtn.disabled = !canSave;

  if (status === 'exceeded') {
    saveBtn.textContent = 'LIMIT EXCEEDED';
  } else {
    saveBtn.textContent = 'SAVE SNAPSHOT';
  }
}

// ── SVG ring update ─────────────────────────────────────────
function updateRing(count, color) {
  const circumference = 2 * Math.PI * 20; // ≈ 125.66
  const pct           = currentLimit ? Math.min((count / currentLimit) * 100, 100) : 0;
  const offset        = circumference - (pct / 100) * circumference;

  const ring = document.getElementById('ringFill');
  ring.style.strokeDashoffset = offset;
  ring.style.stroke           = color;

  document.getElementById('ringPct').textContent = Math.round(pct) + '%';
}

// ── Shake animation ─────────────────────────────────────────
function triggerShake() {
  const box = document.getElementById('textareaBox');
  box.classList.add('shake');
  setTimeout(() => box.classList.remove('shake'), 500);
}

// ── Preset chips ────────────────────────────────────────────
function applyPreset(btn) {
  // remove active from all chips
  document.querySelectorAll('.chip[data-limit]').forEach(c => c.classList.remove('active'));
  btn.classList.add('active');

  currentLimit = parseInt(btn.dataset.limit);
  document.getElementById('customInput').value = '';
  handleInput(); // re-render with new limit
}

// ── Custom limit ────────────────────────────────────────────
function applyCustom() {
  const val = parseInt(document.getElementById('customInput').value);
  if (!val || val < 1) return;

  // deactivate all preset chips
  document.querySelectorAll('.chip[data-limit]').forEach(c => c.classList.remove('active'));

  currentLimit = val;
  handleInput();
}

// ── Save snapshot ────────────────────────────────────────────
function saveSnapshot() {
  const text = document.getElementById('mainInput').value;
  if (!text.trim()) return;
  if (getStatus(text.length, currentLimit) === 'exceeded') return;

  const snap = {
    text,
    count: text.length,
    time : new Date().toLocaleTimeString(),
  };

  snapshots.unshift(snap);
  if (snapshots.length > 5) snapshots.pop(); // keep latest 5

  renderHistory();

  // Flash the button
  const btn = document.getElementById('saveBtn');
  btn.textContent = '✓ SAVED!';
  btn.classList.add('saved');
  setTimeout(() => {
    btn.classList.remove('saved');
    btn.textContent = 'SAVE SNAPSHOT';
  }, 1800);
}

// ── Render history list ──────────────────────────────────────
function renderHistory() {
  const section = document.getElementById('historySection');
  const list    = document.getElementById('historyList');

  if (snapshots.length === 0) {
    section.style.display = 'none';
    return;
  }

  section.style.display = 'block';
  list.innerHTML = '';

  snapshots.forEach((snap, i) => {
    const item = document.createElement('div');
    item.className = 'hist-item';
    item.title     = 'Click to restore';
    item.innerHTML = `
      <span class="hist-text">${escapeHtml(snap.text.slice(0, 50))}${snap.text.length > 50 ? '…' : ''}</span>
      <div class="hist-meta">
        <span class="hist-chars">${snap.count}c</span>
        <span class="hist-time">${snap.time}</span>
      </div>
    `;
    item.addEventListener('click', () => restoreSnapshot(i));
    list.appendChild(item);
  });
}

// ── Restore a snapshot ───────────────────────────────────────
function restoreSnapshot(index) {
  const snap   = snapshots[index];
  const input  = document.getElementById('mainInput');
  input.value  = snap.text;
  input.focus();
  handleInput();
}

// ── Clear all ────────────────────────────────────────────────
function clearAll() {
  document.getElementById('mainInput').value = '';
  handleInput();
}

// ── Utility: HTML escape ─────────────────────────────────────
function escapeHtml(str) {
  return str
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

// ── Init ─────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  handleInput(); // set initial state
});
