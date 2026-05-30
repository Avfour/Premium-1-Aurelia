/* ═══════════════════════════════════════════
   AURELIA — Wedding Invitation Script
═══════════════════════════════════════════ */

'use strict';

/* ── Loading Screen ── */
window.addEventListener('load', () => {
  setTimeout(() => {
    const loader = document.getElementById('loader');
    if (loader) {
      loader.classList.add('fade-out');
      loader.addEventListener('transitionend', () => loader.remove(), { once: true });
    }
  }, 1600);
});

/* ── Open Invitation ── */
document.getElementById('openBtn')?.addEventListener('click', () => {
  const cover = document.getElementById('cover');
  const invitation = document.getElementById('invitation');
  const floatWA = document.getElementById('floatWA');
  const musicBtn = document.getElementById('musicBtn');

  // Animate cover out
  cover.style.transition = 'opacity 0.7s ease, transform 0.7s ease';
  cover.style.opacity = '0';
  cover.style.transform = 'scale(1.04)';

  setTimeout(() => {
    cover.style.display = 'none';
    invitation.classList.remove('hidden');
    floatWA.classList.remove('hidden');
    musicBtn.classList.remove('hidden');

    // Trigger first reveals
    requestAnimationFrame(() => {
      triggerReveal();
      window.scrollTo({ top: 0, behavior: 'instant' });
    });

    // Autoplay music
    tryAutoPlay();
  }, 700);
});

/* ══════════════════════════════
   SCROLL REVEAL
══════════════════════════════ */
function triggerReveal() {
  const targets = document.querySelectorAll('.reveal, .reveal-up, .reveal-left, .reveal-right');

  const observer = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      }
    });
  }, { threshold: 0.12, rootMargin: '0px 0px -40px 0px' });

  targets.forEach(el => observer.observe(el));
}

/* ══════════════════════════════
   COUNTDOWN
══════════════════════════════ */
function updateCountdown() {
  const target = new Date('2026-12-12T08:00:00+07:00');
  const now    = new Date();
  const diff   = target - now;

  if (diff <= 0) {
    ['days','hours','mins','secs'].forEach(id => {
      const el = document.getElementById(`cd-${id}`);
      if (el) el.textContent = '00';
    });
    return;
  }

  const days  = Math.floor(diff / 86400000);
  const hours = Math.floor((diff % 86400000) / 3600000);
  const mins  = Math.floor((diff % 3600000) / 60000);
  const secs  = Math.floor((diff % 60000) / 1000);

  const set = (id, val) => {
    const el = document.getElementById(`cd-${id}`);
    if (el) el.textContent = String(val).padStart(2, '0');
  };

  set('days',  days);
  set('hours', hours);
  set('mins',  mins);
  set('secs',  secs);
}

setInterval(updateCountdown, 1000);
updateCountdown();

/* ══════════════════════════════
   MUSIC PLAYER
══════════════════════════════ */
const audio     = document.getElementById('bgMusic');
const musicBtn  = document.getElementById('musicBtn');
const musicBars = document.getElementById('musicBars');
const iconOff   = document.getElementById('musicIconOff');
let   isPlaying = false;

function setMusicState(playing) {
  isPlaying = playing;
  if (playing) {
    musicBars.style.display = 'flex';
    musicBars.classList.add('playing');
    iconOff.style.display = 'none';
  } else {
    musicBars.classList.remove('playing');
    iconOff.style.display = 'block';
  }
}

function tryAutoPlay() {
  if (!audio) return;
  audio.volume = 0.65;
  const play = audio.play();
  if (play !== undefined) {
    play.then(() => setMusicState(true)).catch(() => setMusicState(false));
  }
}

musicBtn?.addEventListener('click', () => {
  if (!audio) return;
  if (isPlaying) {
    audio.pause();
    setMusicState(false);
  } else {
    audio.play().then(() => setMusicState(true)).catch(() => {});
  }
});

audio?.addEventListener('play',  () => setMusicState(true));
audio?.addEventListener('pause', () => setMusicState(false));

/* ══════════════════════════════
   GALLERY SLIDER
══════════════════════════════ */
(function galleryInit() {
  const track = document.getElementById('galleryTrack');
  if (!track) return;

  const slides      = track.querySelectorAll('.gallery-slide:not(.clone)');
  const SLIDE_W     = 192; // 180px + 12px gap
  const TOTAL_ORIG  = slides.length;
  let   offset      = 0;
  let   maxOffset   = SLIDE_W * TOTAL_ORIG; // one full set
  let   autoTimer   = null;
  let   isDragging  = false;
  let   startX      = 0;
  let   startOffset = 0;
  let   velocity    = 0;
  let   lastX       = 0;
  let   lastT       = 0;
  let   rafId       = null;

  function setTranslate(x, animate) {
    track.style.transition = animate ? 'transform 0.3s ease' : 'none';
    track.style.transform  = `translateX(${-x}px)`;
  }

  function normalise() {
    if (offset >= maxOffset) offset -= maxOffset;
    if (offset <  0)         offset += maxOffset;
  }

  function autoSlide() {
    offset += 0.5;
    normalise();
    setTranslate(offset, false);
    highlightActive();
    autoTimer = requestAnimationFrame(autoSlide);
  }

  function highlightActive() {
    const center = offset + window.innerWidth / 2;
    track.querySelectorAll('.gallery-slide').forEach(s => {
      const left = s.offsetLeft;
      const dist = Math.abs(left - center + SLIDE_W / 2);
      s.classList.toggle('active', dist < SLIDE_W);
    });
  }

  function stopAuto() {
    if (autoTimer) { cancelAnimationFrame(autoTimer); autoTimer = null; }
  }

  function startAuto(delay = 1200) {
    stopAuto();
    setTimeout(() => { autoTimer = requestAnimationFrame(autoSlide); }, delay);
  }

  // Pointer / touch events
  function onDragStart(x) {
    isDragging  = true;
    startX      = x;
    startOffset = offset;
    lastX       = x;
    lastT       = Date.now();
    velocity    = 0;
    stopAuto();
    if (rafId) { cancelAnimationFrame(rafId); rafId = null; }
    track.style.transition = 'none';
  }

  function onDragMove(x) {
    if (!isDragging) return;
    const now = Date.now();
    velocity  = (x - lastX) / (now - lastT + 1);
    lastX = x; lastT = now;
    offset = startOffset - (x - startX);
    normalise();
    setTranslate(offset, false);
    highlightActive();
  }

  function onDragEnd() {
    if (!isDragging) return;
    isDragging = false;

    // Momentum
    const momentum = -velocity * 220;
    let   target   = offset + momentum;
    const snap     = Math.round(target / SLIDE_W) * SLIDE_W;

    let cur = offset;
    function glide() {
      cur += (snap - cur) * 0.12;
      if (Math.abs(snap - cur) < 0.5) { cur = snap; }
      offset = cur; normalise(); setTranslate(offset, false); highlightActive();
      if (Math.abs(snap - cur) > 0.5) { rafId = requestAnimationFrame(glide); }
      else { startAuto(1200); }
    }
    rafId = requestAnimationFrame(glide);
  }

  // Mouse
  track.addEventListener('mousedown',  e => { e.preventDefault(); onDragStart(e.clientX); });
  window.addEventListener('mousemove', e => onDragMove(e.clientX));
  window.addEventListener('mouseup',   ()  => onDragEnd());

  // Touch
  track.addEventListener('touchstart', e => onDragStart(e.touches[0].clientX), { passive: true });
  track.addEventListener('touchmove',  e => onDragMove(e.touches[0].clientX),  { passive: true });
  track.addEventListener('touchend',   ()  => onDragEnd());

  // Start
  setTranslate(0, false);
  startAuto(400);
  highlightActive();
})();

/* ══════════════════════════════
   COPY TO CLIPBOARD
══════════════════════════════ */
document.querySelectorAll('.btn-copy').forEach(btn => {
  btn.addEventListener('click', () => {
    const value = btn.dataset.value;
    navigator.clipboard.writeText(value).then(() => {
      btn.textContent = '✓ Tersalin!';
      btn.classList.add('copied');
      showToast('Nomor rekening berhasil disalin');
      setTimeout(() => {
        btn.classList.remove('copied');
        btn.innerHTML = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="9" y="9" width="13" height="13" rx="2"/><path d="M5 15H4a2 2 0 01-2-2V4a2 2 0 012-2h9a2 2 0 012 2v1"/></svg> Salin Nomor`;
      }, 2500);
    }).catch(() => showToast('Gagal menyalin'));
  });
});

/* ══════════════════════════════
   WISHES FORM
══════════════════════════════ */
document.getElementById('wishSubmit')?.addEventListener('click', () => {
  const nameEl = document.getElementById('wishName');
  const msgEl  = document.getElementById('wishMsg');
  const feed   = document.getElementById('wishesFeed');

  const name = nameEl.value.trim();
  const msg  = msgEl.value.trim();
  if (!name || !msg) { showToast('Nama dan ucapan wajib diisi'); return; }

  const initial = name.charAt(0).toUpperCase();
  const item = document.createElement('div');
  item.className = 'wish-item';
  item.innerHTML = `
    <div class="wish-avatar">${initial}</div>
    <div class="wish-body">
      <p class="wish-name">${escapeHtml(name)}</p>
      <p class="wish-msg">"${escapeHtml(msg)}"</p>
    </div>`;

  feed.appendChild(item);
  feed.scrollTop = feed.scrollHeight;

  nameEl.value = '';
  msgEl.value  = '';
  showToast('Ucapan berhasil dikirim 💛');
});

function escapeHtml(str) {
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

/* ══════════════════════════════
   TOAST
══════════════════════════════ */
function showToast(msg) {
  const existing = document.querySelector('.toast');
  if (existing) existing.remove();

  const el = document.createElement('div');
  el.className   = 'toast';
  el.textContent = msg;
  document.body.appendChild(el);
  el.addEventListener('animationend', () => el.remove());
}