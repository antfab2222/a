/* HABITER L'ARCHIPEL — progressive case study interactions */
(() => {
  'use strict';
  const $ = (s, root = document) => root.querySelector(s);
  const $$ = (s, root = document) => [...root.querySelectorAll(s)];
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const clamp = (v, a = 0, b = 1) => Math.min(b, Math.max(a, v));
  const between = (v, a, b) => clamp((v - a) / (b - a));
  const smooth = t => { const n = clamp(t); return n * n * (3 - 2 * n); };

  // Scroll entrance, no text hidden when IntersectionObserver is unsupported.
  if ('IntersectionObserver' in window && !reducedMotion) {
    const enter = new IntersectionObserver(entries => {
      entries.forEach(entry => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
          enter.unobserve(entry.target);
        }
      });
    }, { threshold: .09, rootMargin: '0px 0px -20px 0px' });
    $$('.reveal').forEach(el => enter.observe(el));
  } else {
    $$('.reveal').forEach(el => el.classList.add('is-visible'));
  }
  $$('.fade-up').forEach((el, idx) => {
    el.style.opacity = '0';
    el.style.transform = 'translateY(22px)';
    el.style.transition = reducedMotion ? 'none' : 'opacity 1s ease, transform 1s ease';
    el.style.transitionDelay = reducedMotion ? '0s' : `${idx * .12}s`;
    requestAnimationFrame(() => requestAnimationFrame(() => {
      el.style.opacity = '1'; el.style.transform = 'none';
    }));
  });

  // Responsive map and in-page scroll choreography.
  // Precise plot coordinates were NOT supplied. The map identifies Santa Fe
  // in General Luna, NOT a guessed pinpoint on the project parcel.
  const santaFe = [9.8402, 126.1390];
  const mapScenes = [
    { center: [10.00, 125.90], zoom: 7.2 },
    { center: [9.98, 126.07], zoom: 9.7 },
    { center: santaFe, zoom: 12.1 },
    { center: santaFe, zoom: 13.7 },
  ];
  let map = null;
  if (typeof window.L !== 'undefined') {
    try {
      map = window.L.map('geo-map', {
        zoomControl: false, attributionControl: false, dragging: false,
        touchZoom: false, doubleClickZoom: false, scrollWheelZoom: false,
        boxZoom: false, keyboard: false, zoomSnap: 0, preferCanvas: true,
      });
      window.L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
        minZoom: 4, maxZoom: 17, opacity: 1,
        attribution: '© OpenStreetMap contributors',
      }).addTo(map);
      map.setView(mapScenes[0].center, mapScenes[0].zoom, { animate: false });
    } catch (_err) { map = null; }
  }
  const geoStory = $('.geo-story');
  const geoAerial = $('#geo-aerial');
  const geoDrawing = $('#geo-drawing');
  const geoLine = $('#geo-line-progress');
  const geoLabel = $('#geo-label');
  const geoTitle = $('#geo-title');
  const geoDescription = $('#geo-description');
  const geoCoords = $('#geo-coords');
  const geoCounter = $('#geo-counter');
  const geoText = $('#geo-text');
  const geography = [
    { label: 'ÉCHELLE TERRITORIALE', title: 'Tout commence<br><i>par un lieu.</i>', desc: "Au large de Mindanao, l’île de Siargao constitue le premier cadre de réflexion : un territoire façonné par l’eau, la végétation et l’habitat.", loc: 'SIARGAO / PHILIPPINES', number: '01 — 04' },
    { label: 'L’ÎLE DE SIARGAO', title: 'Un paysage<br><i>à habiter.</i>', desc: "La côte, la végétation et les villages dessinent une relation singulière entre l’habité et le paysage.", loc: 'SIARGAO / SURIGAO DEL NORTE', number: '02 — 04' },
    { label: 'SANTA FE / GENERAL LUNA', title: 'Se rapprocher<br><i>du contexte.</i>', desc: "Le parcours s’approche de Santa Fe, puis des documents d’analyse réalisés pour le projet.", loc: 'SANTA FE / SECTEUR DU PROJET', number: '03 — 04' },
    { label: 'ANALYSE SATELLITE ORIGINALE', title: 'Observer<br><i>les traces.</i>', desc: "Depuis le ciel, les axes, le bâti et le littoral révèlent les premières structures du territoire.", loc: 'DOCUMENT ORIGINAL / ANALYSE DE SITE', number: '04 — 04' },
    { label: 'DU TERRITOIRE À LA PARCELLE', title: 'L’architecture<br><i>commence ici.</i>', desc: "Le dessin du site fait apparaître la végétation, les accès et les conditions dans lesquelles le bâtiment s’insère.", loc: 'DOCUMENT ORIGINAL / LECTURE DU SITE', number: '04 — 04' },
  ];
  let lastGeography = -1;
  const setGeography = i => {
    if (i === lastGeography) return;
    lastGeography = i;
    const s = geography[i];
    geoLabel.textContent = s.label;
    geoTitle.innerHTML = s.title;
    geoDescription.textContent = s.desc;
    geoCoords.textContent = s.loc;
    geoCounter.textContent = s.number;
  };
  const updateGeography = () => {
    if (!geoStory) return;
    const bounds = geoStory.getBoundingClientRect();
    const distance = Math.max(1, geoStory.offsetHeight - window.innerHeight);
    const p = clamp(-bounds.top / distance);
    // Long, calm reveal rather than one giant scale transform.
    if (p < .22) setGeography(0);
    else if (p < .44) setGeography(1);
    else if (p < .67) setGeography(2);
    else if (p < .85) setGeography(3);
    else setGeography(4);
    const satelliteOpacity = smooth(between(p, .60, .73)) * (1 - smooth(between(p, .84, .96)));
    const sketchOpacity = smooth(between(p, .84, .96));
    geoAerial.style.opacity = String(satelliteOpacity);
    geoDrawing.style.opacity = String(sketchOpacity);
    const satelliteScale = 1.12 + smooth(between(p, .65, .84)) * .13;
    geoAerial.style.transform = `scale(${satelliteScale.toFixed(3)})`;
    geoDrawing.style.transform = `scale(${(1.07 - smooth(between(p, .86, .99)) * .07).toFixed(3)})`;
    geoLine.style.width = `${(p * 100).toFixed(2)}%`;
    if (map && p < .79) {
      const time = clamp(p / .76) * (mapScenes.length - 1);
      const idx = Math.min(Math.floor(time), mapScenes.length - 2);
      const t = smooth(time - idx);
      const from = mapScenes[idx], to = mapScenes[idx + 1];
      map.setView([
        from.center[0] + (to.center[0] - from.center[0]) * t,
        from.center[1] + (to.center[1] - from.center[1]) * t,
      ], from.zoom + (to.zoom - from.zoom) * t, { animate: false });
    }
    // Lightweight fade at the image transitions.
    geoText.style.opacity = String(1 - .12 * smooth(between(p, .70, .84)));
  };

  const header = $('#header');
  const rail = $('.section-rail');
  const progress = $('#reading-progress');
  const anchors = $$('.section-rail a');
  const sections = anchors.map(a => document.getElementById(a.dataset.link));
  const darkIds = new Set(['territoire', 'climat', 'architecture', 'plans']);
  let raf = 0;
  const updateGlobalScroll = () => {
    raf = 0;
    const top = window.scrollY || document.documentElement.scrollTop || 0;
    const range = Math.max(1, document.documentElement.scrollHeight - window.innerHeight);
    progress.style.width = `${(clamp(top / range) * 100).toFixed(2)}%`;
    header.classList.toggle('scrolled', top > window.innerHeight * .82);
    updateGeography();
    if (rail) {
      const visible = top > window.innerHeight * 1.2 && top < $('.ending').offsetTop - window.innerHeight * .3;
      rail.classList.toggle('visible', visible);
      let active = 'territoire';
      sections.forEach((s, i) => {
        if (s && s.getBoundingClientRect().top <= window.innerHeight * .43) active = anchors[i].dataset.link;
      });
      rail.style.color = darkIds.has(active) ? '#eef1e8' : '#20332d';
      anchors.forEach(a => {
        const isActive = a.dataset.link === active;
        a.classList.toggle('active', isActive);
        if (isActive) a.setAttribute('aria-current', 'location');
        else a.removeAttribute('aria-current');
      });
    }
  };
  const requestScrollUpdate = () => {
    if (!raf) raf = requestAnimationFrame(updateGlobalScroll);
  };
  window.addEventListener('scroll', requestScrollUpdate, { passive: true });
  window.addEventListener('resize', () => {
    if (map) map.invalidateSize({ pan: false });
    requestScrollUpdate();
  });
  requestScrollUpdate();

  // Accessible tab utility; supports arrow keys and keeps aria/tabpanel aligned.
  const setupTabs = (selector, onChange) => {
    const buttons = $$(selector);
    let current = 0;
    const activate = (index, focus = false) => {
      current = (index + buttons.length) % buttons.length;
      buttons.forEach((btn, i) => {
        btn.classList.toggle('selected', i === current);
        btn.setAttribute('aria-selected', i === current ? 'true' : 'false');
        btn.tabIndex = i === current ? 0 : -1;
      });
      if (focus) buttons[current].focus();
      onChange(buttons[current], current);
    };
    buttons.forEach((btn, i) => {
      btn.addEventListener('click', () => activate(i));
      btn.addEventListener('keydown', e => {
        if (!['ArrowLeft', 'ArrowRight', 'Home', 'End'].includes(e.key)) return;
        e.preventDefault();
        const index = e.key === 'Home' ? 0 : e.key === 'End' ? buttons.length - 1 : current + (e.key === 'ArrowRight' ? 1 : -1);
        activate(index, true);
      });
    });
    return { activate, next: () => activate(current + 1) };
  };
  const climateDetails = {
    soleil: { title: 'Se protéger<br>du soleil.', desc: 'Limiter les apports solaires directs et privilégier les espaces ombragés : débords de toiture, protection et filtre végétal.', alt: 'Analyse climatique originale : trajectoire solaire sur le site' },
    vent: { title: 'Laisser circuler<br>l’air.', desc: 'Favoriser la ventilation naturelle et des circulations d’air traversantes dans une architecture ouverte sur le paysage.', alt: 'Analyse climatique originale : direction des vents sur la parcelle' },
    pluie: { title: 'Accueillir<br>la pluie.', desc: 'Évacuer rapidement les fortes précipitations par des toitures adaptées, et ménager des espaces de transition protégés.', alt: 'Analyse climatique originale : précipitations sur la parcelle' },
    humidite: { title: 'Composer avec<br>l’humidité.', desc: 'Décoller et ouvrir l’architecture afin de limiter l’humidité et de favoriser le séchage des espaces.', alt: 'Analyse climatique originale : humidité du site' },
  };
  const climateImage = $('#climate-image');
  const climateTabs = setupTabs('.climate-tab', (btn, i) => {
    const data = climateDetails[btn.dataset.climate];
    const file = `archipel-page/assets/climat-${btn.dataset.climate}.webp`;
    climateImage.classList.add('switching');
    const preload = new Image();
    preload.onload = () => {
      climateImage.src = file;
      climateImage.alt = data.alt;
      climateImage.classList.remove('switching');
    };
    preload.onerror = () => { climateImage.classList.remove('switching'); };
    preload.src = file;
    $('#climate-title').innerHTML = data.title;
    $('#climate-desc').textContent = data.desc;
    $('#climate-mini-num').textContent = String(i + 1).padStart(2, '0');
    $('#climate-photo-index').textContent = `${String(i + 1).padStart(2, '0')} / 04`;
    $('#climate-panel').setAttribute('aria-labelledby', btn.id);
  });
  $('#climate-next').addEventListener('click', climateTabs.next);
  const planDetails = {
    rdc: { name: 'Le niveau collectif.', alt: 'Plan original du rez-de-chaussée : restauration et travail' },
    r1: { name: 'Les espaces de repos.', alt: 'Plan original du R+1 : dortoirs et zones calmes' },
    r2: { name: 'L’intimité et les terrasses.', alt: 'Plan original du R+2 : chambres et terrasses' },
  };
  const planImage = $('#plan-image');
  setupTabs('.plan-tab', (btn, i) => {
    const data = planDetails[btn.dataset.plan];
    const file = `archipel-page/assets/plan-${btn.dataset.plan}.webp`;
    planImage.classList.add('switching');
    const preload = new Image();
    preload.onload = () => {
      planImage.src = file;
      planImage.alt = data.alt;
      planImage.classList.remove('switching');
    };
    preload.onerror = () => planImage.classList.remove('switching');
    preload.src = file;
    $('#plan-id').textContent = `PLAN / ${String(i + 1).padStart(2, '0')}`;
    $('#plan-name').textContent = data.name;
    $('#plan-panel').setAttribute('aria-labelledby', btn.id);
  });

  // Lightbox: content is always the user's original image, no substitutions.
  const viewer = $('#image-viewer');
  const viewerImage = $('#viewer-image');
  const viewerCaption = $('#viewer-caption');
  const viewerClose = $('#viewer-close');
  let focusBefore = null;
  const openViewer = img => {
    if (!img || !img.src) return;
    focusBefore = document.activeElement;
    viewerImage.src = img.currentSrc || img.src;
    viewerImage.alt = img.alt || 'Dessin du projet';
    viewerCaption.textContent = img.alt || '';
    viewer.classList.add('open');
    viewer.setAttribute('aria-hidden', 'false');
    document.body.style.overflow = 'hidden';
    viewerClose.focus();
  };
  const closeViewer = () => {
    viewer.classList.remove('open');
    viewer.setAttribute('aria-hidden', 'true');
    viewerImage.removeAttribute('src');
    document.body.style.overflow = '';
    if (focusBefore && typeof focusBefore.focus === 'function') focusBefore.focus();
  };
  $$('.lightbox-trigger').forEach(img => {
    img.setAttribute('role', 'button');
    img.setAttribute('aria-label', `Agrandir : ${img.alt || 'image'}`);
    img.addEventListener('click', () => openViewer(img));
    img.addEventListener('keydown', e => {
      if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); openViewer(img); }
    });
  });
  $('#plan-expand').addEventListener('click', () => openViewer(planImage));
  $$('[data-for="site-plate"]').forEach(btn => btn.addEventListener('click', () => openViewer($('.site-plate img'))));
  viewerClose.addEventListener('click', closeViewer);
  viewer.addEventListener('click', e => { if (e.target === viewer) closeViewer(); });
  document.addEventListener('keydown', e => {
    if (!viewer.classList.contains('open')) return;
    if (e.key === 'Escape') closeViewer();
    // Simple focus containment: one action button inside the dialog.
    if (e.key === 'Tab') { e.preventDefault(); viewerClose.focus(); }
  });
})();
