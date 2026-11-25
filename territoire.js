const story = document.querySelector('.map-story');
const stage = story.querySelector('.map-stage');
const panels = [...story.querySelectorAll('.map-panel')];
const mapLinks = [...story.querySelectorAll('.map-index div a')];
const enableMotion = matchMedia('screen and (min-height: 480px) and (prefers-reduced-motion: no-preference)');
const alignedMap = story.classList.contains('aligned-map');
const stops = [0, 0.51, 1];
const limit = value => Math.max(0, Math.min(1, value));
function mix(value) {
  const t = limit(value);
  return t * t * (3 - 2 * t);
}
function renderMap() {
  if (!enableMotion.matches) return;
  const distance = story.offsetHeight - stage.offsetHeight;
  const top = parseFloat(getComputedStyle(stage).top);
  const progress = limit((top - story.getBoundingClientRect().top) / distance);
  const first = mix((progress - 0.08) / 0.30);
  const second = mix((progress - 0.60) / 0.27);
  const weights = [1 - first, first * (1 - second), second];
  if (alignedMap) {
    // Composite the registered exports over an opaque base to keep the coast stationary.
    story.style.setProperty('--road-reveal', first.toFixed(3));
    story.style.setProperty('--building-reveal', second.toFixed(3));
  }
  const active = weights.indexOf(Math.max(...weights));
  panels.forEach((panel, index) => {
    panel.style.setProperty('--visibility', weights[index].toFixed(3));
    if (alignedMap) panel.classList.toggle('current-reading', index === active);
    // Keep all three readings available in document order to assistive technology.
    if (index === active) mapLinks[index].setAttribute('aria-current', 'step');
    else mapLinks[index].removeAttribute('aria-current');
  });
  story.style.setProperty('--aerial-scale', String(1.09 - 0.09 * first));
}
function goToStep(index, smooth) {
  const offset = window.scrollY + story.getBoundingClientRect().top - parseFloat(getComputedStyle(stage).top);
  window.scrollTo({top:offset + stops[index] * (story.offsetHeight - stage.offsetHeight),behavior:smooth ? 'smooth' : 'instant'});
}
function modeChanged() {
  story.classList.toggle('is-moving',enableMotion.matches);
  if (enableMotion.matches) {
    const index = panels.findIndex(panel => '#' + panel.id === location.hash);
    if (index >= 0) goToStep(index,false);
    renderMap();
  } else mapLinks.forEach(link => link.removeAttribute('aria-current'));
}
let scheduled = false;
function queueMap() {
  if (!scheduled) {
    scheduled = true;
    requestAnimationFrame(() => { scheduled = false; renderMap(); });
  }
}
mapLinks.forEach((link,index) => link.addEventListener('click',event => {
  if (!enableMotion.matches || event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
  event.preventDefault();
  goToStep(index,true);
}));
enableMotion.addEventListener('change',modeChanged);
window.addEventListener('scroll',queueMap,{passive:true});
window.addEventListener('resize',queueMap);
modeChanged();
