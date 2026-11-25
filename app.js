const viewer = document.querySelector('dialog');
const chapters = [...document.querySelectorAll('.chapter')];
const menu = document.querySelector('.chapternav');
let openChapter = null;
let trigger = null;

function selectDrawing(chapter, choice) {
  const link = chapter.querySelector('.expand');
  const image = link.querySelector('img');
  const name = choice.textContent;
  image.removeAttribute('srcset');
  image.src = choice.href;
  image.removeAttribute('width');
  image.removeAttribute('height');
  image.alt = name;
  link.href = choice.href;
  link.setAttribute('aria-label', 'Agrandir — ' + name);
  chapter.querySelector('figcaption span').textContent = name;
  for (const item of chapter.querySelectorAll('[data-document]')) {
    item.setAttribute('aria-current', String(item === choice));
  }
}

function zoom(enlarged) {
  const pane = viewer.querySelector('.viewerbody');
  pane.classList.toggle('large', enlarged);
  pane.scrollTo(0, 0);
  const toggle = viewer.querySelector('.toggle');
  toggle.setAttribute('aria-pressed', String(enlarged));
  toggle.textContent = enlarged ? 'Vue entière' : 'Zoom +';
}

function displayDrawing(link) {
  const image = viewer.querySelector('img');
  image.src = link.href;
  image.alt = link.querySelector('img').alt;
  viewer.querySelector('.viewerbar p').textContent = image.alt;
  const steps = viewer.querySelector('.viewersteps');
  steps.hidden = !openChapter;
  if (openChapter) {
    const choices = [...openChapter.querySelectorAll('[data-document]')];
    const current = choices.findIndex(choice => choice.getAttribute('aria-current') === 'true');
    steps.querySelector('span').textContent = (current + 1) + ' / ' + choices.length;
    steps.querySelector('.prev').disabled = current === 0;
    steps.querySelector('.next').disabled = current === choices.length - 1;
  }
  zoom(false);
}

function openDrawing(link, opener) {
  openChapter = link.closest('.chapter');
  trigger = opener;
  displayDrawing(link);
  viewer.showModal();
}

function step(direction) {
  if (!openChapter) return;
  const current = openChapter.querySelector('[aria-current="true"]');
  const next = direction < 0 ? current.previousElementSibling : current.nextElementSibling;
  if (next) {
    selectDrawing(openChapter, next);
    displayDrawing(openChapter.querySelector('.expand'));
  }
}

for (const chapter of chapters) {
  for (const choice of chapter.querySelectorAll('[data-document]')) {
    choice.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      selectDrawing(chapter, choice);
    });
  }
  if (viewer?.showModal) {
    const enlarge = chapter.querySelector('.enlarge');
    enlarge.hidden = false;
    enlarge.addEventListener('click', () => openDrawing(chapter.querySelector('.expand'), enlarge));
  }
}

if (viewer?.showModal) {
  document.querySelectorAll('.expand').forEach(link => link.addEventListener('click', event => {
    if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
    event.preventDefault();
    openDrawing(link, link);
  }));
  viewer.querySelector('.close').addEventListener('click', () => viewer.close());
  viewer.querySelector('.prev').addEventListener('click', () => step(-1));
  viewer.querySelector('.next').addEventListener('click', () => step(1));
  viewer.querySelector('.toggle').addEventListener('click', event => zoom(event.currentTarget.getAttribute('aria-pressed') !== 'true'));
  viewer.addEventListener('close', () => trigger?.focus({preventScroll:true}));
  viewer.addEventListener('keydown', event => {
    if (viewer.querySelector('.viewerbody').classList.contains('large')) return;
    if (event.key === 'ArrowLeft' || event.key === 'ArrowRight') {
      event.preventDefault();
      step(event.key === 'ArrowLeft' ? -1 : 1);
    }
  });
}

if (menu) {
  const links = [...menu.querySelectorAll('a')];
  const destinations = links.map(link => document.getElementById(link.hash.slice(1)));
  let pending = false;
  function updateLocation() {
    const active = destinations.filter(chapter => chapter.getBoundingClientRect().top <= menu.offsetHeight + 20).pop();
    links.forEach(link => {
      if (active && link.hash === '#' + active.id) link.setAttribute('aria-current', 'location');
      else link.removeAttribute('aria-current');
    });
    pending = false;
  }
  window.addEventListener('scroll', () => {
    if (!pending) requestAnimationFrame(updateLocation);
    pending = true;
  }, {passive:true});
  updateLocation();
}

const hero = document.querySelector('.projecthero:has(.hero-choices)');
if (hero) {
  const choices = hero.querySelectorAll('[data-caption]');
  const link = hero.querySelector('.expand');
  const image = link.querySelector('img');
  const project = document.querySelector('.titleblock h1').textContent;
  for (const choice of choices) {
    choice.addEventListener('click', event => {
      if (event.ctrlKey || event.metaKey || event.shiftKey || event.altKey) return;
      event.preventDefault();
      const label = project + ' — ' + choice.dataset.caption;
      link.href = choice.href;
      link.setAttribute('aria-label', 'Agrandir — ' + label);
      image.removeAttribute('srcset');
      image.src = choice.href;
      image.alt = label;
      image.style.objectFit = choice.dataset.caption === 'Élévation' ? 'contain' : 'cover';
      hero.querySelector('.hero-caption').textContent = choice.dataset.caption + ' · Santa Fe, Siargao';
      for (const option of choices) option.setAttribute('aria-current', String(option === choice));
    });
  }
}
