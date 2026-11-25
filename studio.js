// Blend the opening photograph into the paper as the elevation enters the screen.
const opening = document.querySelector('.opening');
const cover = opening.querySelector('.introduction');
const motion = matchMedia('(prefers-reduced-motion: no-preference) and (min-height: 510px)');
let pending = false;
let lastProgress = -1;

function ease(value) {
  const t = Math.max(0, Math.min(1, value));
  return t * t * (3 - 2 * t);
}

function drawOpening() {
  pending = false;
  const progress = Math.max(0, Math.min(1, -opening.getBoundingClientRect().top / cover.offsetHeight));
  if (progress === lastProgress) return;
  lastProgress = progress;
  opening.style.setProperty('--veil', ease(progress / .24));
  opening.style.setProperty('--photo', 1 - ease((progress - .08) / .84));
  opening.style.setProperty('--type', 1 - ease((progress - .04) / .40));
}

function queueDraw() {
  if (!pending) {
    pending = true;
    requestAnimationFrame(drawOpening);
  }
}

function configureMotion() {
  window.removeEventListener('scroll', queueDraw);
  window.removeEventListener('resize', queueDraw);
  opening.classList.toggle('in-motion', motion.matches);
  if (motion.matches) {
    lastProgress = -1;
    drawOpening();
    window.addEventListener('scroll', queueDraw, {passive: true});
    window.addEventListener('resize', queueDraw);
  }
}

motion.addEventListener('change', configureMotion);
window.addEventListener('pageshow', () => { if (motion.matches) queueDraw(); });
configureMotion();
