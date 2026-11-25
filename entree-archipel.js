(() => {
  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const navigation = performance.getEntriesByType('navigation')[0];
  if (reducedMotion.matches || !Element.prototype.animate ||
      (navigation && navigation.type !== 'navigate') ||
      (location.hash && location.hash !== '#site')) return;

  const root = document.documentElement;
  root.classList.add('entering-archipel');
  // Let the map own this entrance when the previous page also supports transitions.
  window.addEventListener('pagereveal', event => {
    if (root.classList.contains('entering-archipel')) event.viewTransition?.skipTransition();
  }, {once: true});

  document.addEventListener('DOMContentLoaded', async () => {
    const entry = document.querySelector('.archipel-entry');
    const frame = entry.querySelector('.entry-window');
    const original = document.querySelector('#santa-fe-vue > img');
    const photo = original.cloneNode(false);
    const skip = entry.querySelector('.entry-skip');
    const controls = new AbortController();
    const options = {signal: controls.signal};
    const animations = [];
    let playbackRate = 1;

    function finish() {
      const hadFocus = document.activeElement === skip;
      root.classList.remove('entering-archipel');
      controls.abort();
      for (const animation of animations) animation.cancel();
      entry.remove();
      if (hadFocus) {
        const title = document.querySelector('.map-title h1');
        title.tabIndex = -1;
        title.focus({preventScroll: true});
      }
    }

    function animate(element, frames, duration, delay = 0, easing = 'ease-in-out') {
      const animation = element.animate(frames, {duration, delay, easing, fill: 'both'});
      animation.playbackRate = playbackRate;
      animations.push(animation);
      return animation;
    }

    skip.addEventListener('click', finish, options);
    window.addEventListener('pagehide', finish, options);
    window.addEventListener('wheel', event => {
      if (event.ctrlKey || !event.deltaY) return;
      event.preventDefault();
      if (event.deltaY < 0 || playbackRate >= 1.65) return;

      // Wheel deltas may be reported in pixels, text lines or whole pages.
      const units = [1, 16, window.innerHeight];
      const distance = event.deltaY * (units[event.deltaMode] ?? 1);
      playbackRate = Math.min(1.65, playbackRate + distance / 550);
      for (const animation of animations) {
        if (animation.playState !== 'finished') animation.updatePlaybackRate(playbackRate);
      }
    }, {...options, passive: false});
    window.addEventListener('touchmove', finish, {...options, passive: true});
    window.addEventListener('keydown', event => {
      if (['Escape', 'Tab', 'PageDown', 'PageUp', 'ArrowDown', 'ArrowUp', ' ', 'End', 'Home'].includes(event.key)) finish();
    }, options);
    reducedMotion.addEventListener('change', finish, options);

    photo.className = 'entry-photo';
    photo.alt = '';
    photo.style.opacity = '0';
    frame.prepend(photo);

    const deadline = setTimeout(finish, 1700);
    try {
      await photo.decode();
      clearTimeout(deadline);
      if (!entry.isConnected) return;
      // Hash navigation and the sticky map must both have their final layout.
      await new Promise(requestAnimationFrame);
      if (!entry.isConnected) return;
      const width = frame.clientWidth;
      const height = frame.clientHeight;
      const ratio = photo.naturalWidth / photo.naturalHeight;
      const startWidth = Math.max(width, height * ratio) * 1.14;
      const startHeight = startWidth / ratio;
      const from = 'translate(' + (width - startWidth) / 2 + 'px,' + (height - startHeight) * .54 + 'px)';
      photo.style.width = startWidth + 'px';
      photo.style.height = startHeight + 'px';
      photo.style.transform = from;
      window.addEventListener('resize', finish, options);

      animate(photo, [{opacity: 0}, {opacity: 1}], 620);
      const shade = entry.querySelector('.entry-shade');
      animate(shade, [{opacity: 0}, {opacity: 1}], 600, 260);
      const reveal = [{opacity: 0, transform: 'translateY(10px)'}, {opacity: 1, transform: 'translateY(0)'}];
      animate(entry.querySelector('.entry-title'), reveal, 620, 460);
      await animate(entry.querySelector('.entry-place'), reveal, 510, 1090).finished;
      // Hold both lines together before releasing the image into the project.
      await animate(entry.querySelector('.entry-inscription'), [{opacity: 1}, {opacity: 0}], 390, 860).finished;

      const target = original.getBoundingClientRect();
      const style = getComputedStyle(original);
      const endWidth = (style.objectFit === 'contain' ? Math.min : Math.max)(target.width, target.height * ratio);
      const endHeight = endWidth / ratio;
      // Use the same crop and object-position as the map on this screen.
      const position = style.objectPosition.split(' ').map(value => parseFloat(value) / 100);
      const x = target.left + (target.width - endWidth) * position[0];
      const y = target.top + (target.height - endHeight) * position[1];
      const to = 'translate(' + x + 'px,' + y + 'px) scale(' + endWidth / startWidth + ')';
      const inset = [target.top, width - target.right, height - target.bottom, target.left]
        .map(value => Math.max(0, value) + 'px').join(' ');
      const easing = 'cubic-bezier(.45,0,.18,1)';
      animate(skip, [{opacity: 1}, {opacity: 0}], 170);
      animate(shade, [{opacity: 1}, {opacity: 0}], 650);
      animate(photo, [{transform: from}, {transform: to}], 920, 0, easing);
      await animate(frame, [{clipPath: 'inset(0px)'}, {clipPath: 'inset(' + inset + ')'}], 920, 0, easing).finished;
    } catch {
      // A skipped introduction or unavailable image returns directly to the project.
    } finally {
      clearTimeout(deadline);
      if (entry.isConnected) finish();
    }
  }, {once: true});
})();
