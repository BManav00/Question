const cards = [...document.querySelectorAll('.wish-card')];
const finalCard = document.querySelector('.final-wish');
const openedCount = document.getElementById('openedCount');
const toast = document.getElementById('toast');
const soundToggle = document.getElementById('soundToggle');
const soundLabel = soundToggle.querySelector('.sound-label');
const wishButton = document.getElementById('wishButton');
const wishReveal = document.getElementById('wishReveal');
const giftBoxes = [...document.querySelectorAll('[data-gift]')];
const giftCount = document.getElementById('giftCount');
const giftProgress = document.getElementById('giftProgress');
const giftFinale = document.getElementById('giftFinale');
const resetGifts = document.getElementById('resetGifts');
const opened = new Set();
let soundOn = false;
let audioContext;
let toastTimer;

function chime(note = 660) {
  if (!soundOn) return;
  audioContext ??= new (window.AudioContext || window.webkitAudioContext)();
  const oscillator = audioContext.createOscillator();
  const gain = audioContext.createGain();
  oscillator.type = 'sine';
  oscillator.frequency.value = note;
  gain.gain.setValueAtTime(.0001, audioContext.currentTime);
  gain.gain.exponentialRampToValueAtTime(.12, audioContext.currentTime + .02);
  gain.gain.exponentialRampToValueAtTime(.0001, audioContext.currentTime + .75);
  oscillator.connect(gain).connect(audioContext.destination);
  oscillator.start();
  oscillator.stop(audioContext.currentTime + .8);
}

function showToast(message) {
  toast.textContent = message;
  toast.classList.add('show');
  clearTimeout(toastTimer);
  toastTimer = setTimeout(() => toast.classList.remove('show'), 2300);
}

function petals(amount = 8) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < amount; i++) {
    const petal = document.createElement('i');
    petal.className = 'petal';
    petal.style.left = `${Math.random() * 100}vw`;
    petal.style.setProperty('--drift', `${Math.random() * 180 - 90}px`);
    petal.style.animationDuration = `${3.5 + Math.random() * 3}s`;
    petal.style.animationDelay = `${Math.random() * .6}s`;
    document.body.appendChild(petal);
    setTimeout(() => petal.remove(), 7200);
  }
}

function sparks(event) {
  if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return;
  for (let i = 0; i < 15; i++) {
    const spark = document.createElement('i');
    spark.className = 'spark';
    spark.textContent = i % 3 ? '·' : '♡';
    spark.style.left = `${event.clientX}px`;
    spark.style.top = `${event.clientY}px`;
    spark.style.setProperty('--x', `${Math.cos(i / 15 * Math.PI * 2) * (45 + Math.random() * 55)}px`);
    spark.style.setProperty('--y', `${Math.sin(i / 15 * Math.PI * 2) * (45 + Math.random() * 55)}px`);
    document.body.appendChild(spark);
    setTimeout(() => spark.remove(), 1000);
  }
}

cards.forEach((card) => {
  card.addEventListener('click', (event) => {
    const number = Number(card.dataset.wish);
    if (number === 11 && opened.size < 10) {
      showToast(`${10 - opened.size} more ${10 - opened.size === 1 ? 'wish' : 'wishes'} before the final one ♡`);
      chime(330);
      return;
    }

    const isOpening = !card.classList.contains('open');
    card.classList.toggle('open');
    card.setAttribute('aria-expanded', String(isOpening));

    if (isOpening && !opened.has(number)) {
      opened.add(number);
      openedCount.textContent = opened.size;
      card.querySelector('.seal').textContent = '♡';
      chime(520 + number * 22);
      sparks(event);

      if (opened.size === 10 && !opened.has(11)) {
        finalCard.classList.remove('locked');
        finalCard.setAttribute('aria-disabled', 'false');
        finalCard.querySelector('.seal').textContent = 'open';
        showToast('The final 11:11 wish is unlocked ✨');
        petals(12);
      }
      if (number === 11) {
        petals(30);
        setTimeout(() => document.getElementById('forever').scrollIntoView({ behavior: 'smooth' }), 1200);
      }
    }
  });
});

soundToggle.addEventListener('click', () => {
  soundOn = !soundOn;
  soundToggle.setAttribute('aria-pressed', String(soundOn));
  soundLabel.textContent = soundOn ? 'sound on' : 'sound off';
  if (soundOn) chime(740);
});

wishButton.addEventListener('click', (event) => {
  wishReveal.classList.add('show');
  wishButton.textContent = 'Wish saved forever ♡';
  wishButton.disabled = true;
  chime(880);
  sparks(event);
  petals(35);
});

function updateGifts(celebrate = false) {
  const selected = giftBoxes.filter((box) => box.checked).length;
  giftCount.textContent = selected;
  giftProgress.style.width = `${selected / 11 * 100}%`;
  giftFinale.classList.toggle('show', selected === 11);
  localStorage.setItem('rasmalai-gifts', JSON.stringify(giftBoxes.map((box) => box.checked)));
  if (selected === 11 && celebrate) {
    showToast('All 11 gifts are yours, Rasmalai ♡');
    petals(28);
    chime(880);
  }
}

try {
  const savedGifts = JSON.parse(localStorage.getItem('rasmalai-gifts') || '[]');
  giftBoxes.forEach((box, index) => { box.checked = Boolean(savedGifts[index]); });
} catch (_) {
  localStorage.removeItem('rasmalai-gifts');
}
updateGifts();

giftBoxes.forEach((box) => box.addEventListener('change', () => updateGifts(true)));
resetGifts.addEventListener('click', () => {
  giftBoxes.forEach((box) => { box.checked = false; });
  updateGifts();
  showToast('All eleven gifts are wrapped again 🎀');
});

const observer = new IntersectionObserver((entries) => {
  entries.forEach((entry) => {
    if (entry.isIntersecting) {
      entry.target.animate([
        { opacity: 0, transform: 'translateY(24px)' },
        { opacity: 1, transform: 'translateY(0)' }
      ], { duration: 700, easing: 'cubic-bezier(.2,.8,.2,1)', fill: 'both' });
      observer.unobserve(entry.target);
    }
  });
}, { threshold: .12 });

document.querySelectorAll('.letter-card, .wish-card, .gift-item, .memory-copy, .photo-wrap').forEach((element) => observer.observe(element));

setTimeout(() => petals(7), 900);

