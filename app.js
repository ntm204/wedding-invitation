(() => {
  'use strict';
  document.documentElement.classList.add('js');
  const motionPreference = matchMedia('(prefers-reduced-motion: reduce)');
  const connection = navigator.connection;
  const saveData = connection?.saveData || /(^|-)2g$/.test(connection?.effectiveType || '');

  // Only smooth wheel input. Touch, trackpad momentum, keyboard and scrollbar stay native.
  let targetY = scrollY;
  let wheelFrame = 0;
  let lastFrame = 0;
  const stopWheel = () => { cancelAnimationFrame(wheelFrame); wheelFrame = 0; targetY = scrollY; };
  const maxScroll = () => Math.max(0, document.documentElement.scrollHeight - innerHeight);
  function animateWheel(time) {
    const elapsed = Math.min(time - lastFrame, 64);
    lastFrame = time;
    targetY = Math.max(0, Math.min(targetY, maxScroll()));
    const nextY = scrollY + (targetY - scrollY) * (1 - Math.exp(-elapsed / 95));
    window.scrollTo({ top: Math.abs(targetY - nextY) < 1 ? targetY : nextY, behavior: 'instant' });
    if (Math.abs(targetY - scrollY) > 1) wheelFrame = requestAnimationFrame(animateWheel);
    else wheelFrame = 0;
  }
  addEventListener('wheel', event => {
    if (motionPreference.matches || event.ctrlKey || event.metaKey || event.shiftKey || Math.abs(event.deltaX) > Math.abs(event.deltaY) || !event.deltaY || !event.cancelable) { stopWheel(); return; }
    // Small pixel deltas are generally trackpads, which already supply inertia.
    if (event.deltaMode === 0 && Math.abs(event.deltaY) < 50) { stopWheel(); return; }
    if (event.target.closest('input, textarea, select, [contenteditable="true"], video')) { stopWheel(); return; }
    for (let node = event.target; node && node !== document.body; node = node.parentElement) {
      if (/(auto|scroll)/.test(getComputedStyle(node).overflowY) && node.scrollHeight > node.clientHeight) { stopWheel(); return; }
    }
    const delta = event.deltaY * (event.deltaMode === 1 ? 20 : event.deltaMode === 2 ? innerHeight : 1);
    if (!wheelFrame) targetY = scrollY;
    const nextTarget = Math.max(0, Math.min(targetY + delta, maxScroll()));
    if (nextTarget === targetY) return;
    event.preventDefault();
    targetY = nextTarget;
    if (!wheelFrame) { lastFrame = performance.now(); wheelFrame = requestAnimationFrame(animateWheel); }
  }, { passive: false });
  ['pointerdown', 'touchstart', 'keydown', 'resize', 'hashchange', 'pagehide'].forEach(type => addEventListener(type, stopWheel, { passive: true }));
  document.addEventListener('click', event => { if (event.target.closest('a[href^="#"]')) stopWheel(); });
  motionPreference.addEventListener('change', stopWheel);
  const nav = document.querySelector('.navigation');
  const menuButton = document.querySelector('.menu-toggle');
  const mobileMenu = document.querySelector('.mobile-menu');
  const closeMenu = () => { mobileMenu.hidden = true; menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open menu'); };
  menuButton.addEventListener('click', () => {
    const open = menuButton.getAttribute('aria-expanded') !== 'true';
    menuButton.setAttribute('aria-expanded', String(open));
    menuButton.setAttribute('aria-label', open ? 'Close menu' : 'Open menu');
    mobileMenu.hidden = !open;
  });
  document.querySelectorAll('a[href^="#"]').forEach(link => link.addEventListener('click', closeMenu));
  document.addEventListener('keydown', event => { if (event.key === 'Escape' && !mobileMenu.hidden) { closeMenu(); menuButton.focus(); } });
  document.addEventListener('click', event => { if (!nav.contains(event.target)) closeMenu(); });
  matchMedia('(min-width: 810px)').addEventListener('change', event => { if (event.matches) closeMenu(); });

  const memoryGroup = document.querySelector('.memory-group');
  const memoryCopy = memoryGroup.cloneNode(true);
  memoryCopy.setAttribute('aria-hidden', 'true');
  memoryCopy.querySelectorAll('img').forEach(image => image.alt = '');
  document.querySelector('.memory-track').append(memoryCopy);

  // Keep below-the-fold URLs out of the browser's preload scanner.
  const loadImage = image => {
    if (!image.dataset.src) return;
    image.loading = 'eager';
    if (image.dataset.srcset) image.srcset = image.dataset.srcset;
    image.src = image.dataset.src;
    image.removeAttribute('data-srcset');
    image.removeAttribute('data-src');
  };
  const imageObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      loadImage(entry.target);
      imageObserver.unobserve(entry.target);
    });
  }, { rootMargin: saveData ? '0px' : '160px 0px', threshold: 0 });
  document.querySelectorAll('img[data-src]').forEach(image => imageObserver.observe(image));

  const memories = document.querySelector('.memories');
  let memoriesVisible = false;
  const syncMemories = () => memories.classList.toggle('is-in-view', memoriesVisible && !document.hidden && !motionPreference.matches && !saveData);
  new IntersectionObserver(entries => {
    memoriesVisible = entries[0].isIntersecting;
    syncMemories();
  }, { threshold: 0 }).observe(memories);
  motionPreference.addEventListener('change', syncMemories);

  const textObserver = new IntersectionObserver(entries => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('is-revealed');
        textObserver.unobserve(entry.target);
      }
    });
  }, { threshold: .1 });
  document.querySelectorAll('.word-reveal').forEach(element => {
    const text = element.textContent.trim();
    element.setAttribute('aria-label', text);
    element.textContent = '';
    text.split(/\s+/).forEach((word, index) => {
      const span = document.createElement('span');
      span.className = 'word'; span.textContent = word; span.setAttribute('aria-hidden', 'true');
      span.style.setProperty('--word-index', index);
      element.append(span, document.createTextNode(' '));
    });
    textObserver.observe(element);
  });
  const photoStack = document.querySelector('.photo-stack');
  const previewPhotos = open => {
    photoStack.classList.toggle('is-open', open);
    photoStack.setAttribute('aria-pressed', String(open));
  };
  photoStack.addEventListener('pointerenter', event => { if (event.pointerType === 'mouse') previewPhotos(true); });
  photoStack.addEventListener('pointerleave', event => { if (event.pointerType === 'mouse') previewPhotos(false); });
  photoStack.addEventListener('pointerup', event => {
    if (event.pointerType !== 'mouse') previewPhotos(!photoStack.classList.contains('is-open'));
  });
  photoStack.addEventListener('keydown', event => {
    if (event.key === 'Enter' || event.key === ' ') {
      event.preventDefault();
      previewPhotos(!photoStack.classList.contains('is-open'));
    } else if (event.key === 'Escape') previewPhotos(false);
  });
  photoStack.addEventListener('blur', () => previewPhotos(false));
  const events = [...document.querySelectorAll('.event')];
  const timeline = document.querySelector('.timeline');
  const timelineLine = document.querySelector('.timeline-line');
  const sectionLinks = [...document.querySelectorAll('.nav-links a')];
  let ticking = false;
  function updateScroll() {
    const height = innerHeight;
    nav.classList.toggle('scrolled', scrollY > 30);
    timeline.style.setProperty('--timeline-band-y', `${-timelineLine.getBoundingClientRect().top}px`);
    events.forEach(event => event.classList.toggle('active', event.getBoundingClientRect().top < height * .5));
    let active = '';
    sectionLinks.forEach(link => { const section = document.querySelector(link.hash); if (section.getBoundingClientRect().top < height * .38) active = link.hash; });
    sectionLinks.forEach(link => { if (link.hash === active) link.setAttribute('aria-current', 'location'); else link.removeAttribute('aria-current'); });
    ticking = false;
  }
  addEventListener('scroll', () => { if (!ticking) { requestAnimationFrame(updateScroll); ticking = true; } }, { passive: true });
  addEventListener('resize', updateScroll);
  updateScroll();

  document.querySelectorAll('.question button').forEach(button => button.addEventListener('click', () => {
    const opening = button.getAttribute('aria-expanded') !== 'true';
    document.querySelectorAll('.question').forEach(question => { question.classList.remove('open'); question.querySelector('button').setAttribute('aria-expanded', 'false'); });
    if (opening) { button.closest('.question').classList.add('open'); button.setAttribute('aria-expanded', 'true'); }
  }));

  const form = document.querySelector('#rsvp-form');
  const submit = form.querySelector('button[type="submit"]');
  const status = form.querySelector('.form-status');
  const syncButton = () => { submit.disabled = !form.checkValidity() || form.elements.name.value.trim().length < 2; };
  form.addEventListener('input', syncButton);
  form.addEventListener('submit', event => {
    event.preventDefault();
    if (!form.reportValidity()) return;
    const response = Object.fromEntries(new FormData(form));
    response.name = response.name.trim();
    response.guests = Number(response.guests);
    response.savedAt = new Date().toISOString();
    try {
      localStorage.setItem('evelyn-arthur-rsvp', JSON.stringify(response));
      submit.textContent = 'Saved ✓';
      status.textContent = 'Thank you! This preview saved your response on this device. It has not been sent to the couple.';
      setTimeout(() => { submit.textContent = 'Submit'; }, 3000);
    } catch {
      status.textContent = 'Your browser could not save this response. Please allow local storage and try again.';
    }
  });
  try {
    const draft = JSON.parse(localStorage.getItem('evelyn-arthur-rsvp') || 'null');
    if (draft) ['name', 'email', 'guests', 'message'].forEach(key => { if (draft[key] !== undefined) form.elements[key].value = String(draft[key]); });
  } catch { /* A fresh form is fine when no browser storage is available. */ }
  syncButton();
  const video = document.querySelector('.hero-film');
  let heroVisible = false;
  let videoReady = false;
  const syncVideo = () => {
    if (!videoReady || !heroVisible || document.hidden || motionPreference.matches || saveData) { video.pause(); return; }
    if (!video.dataset.loaded) {
      const source = video.querySelector('source');
      source.src = matchMedia('(max-width: 767px)').matches ? source.dataset.mobileSrc || source.dataset.src : source.dataset.src;
      video.dataset.loaded = 'true';
      video.load();
    }
    video.play().catch(() => { /* The poster remains visible if autoplay is blocked. */ });
  };
  // Let the poster, page and fonts finish loading before fetching the film.
  const queueVideo = () => {
    const ready = () => { videoReady = true; syncVideo(); };
    if ('requestIdleCallback' in window) window.requestIdleCallback(ready, { timeout: 1500 });
    else setTimeout(ready, 200);
  };
  if (document.readyState === 'complete') queueVideo();
  else addEventListener('load', queueVideo, { once: true });
  new IntersectionObserver(entries => { heroVisible = entries[0].isIntersecting; syncVideo(); }, { threshold: .01 }).observe(video);
  document.addEventListener('visibilitychange', () => { stopWheel(); syncMemories(); syncVideo(); });
  motionPreference.addEventListener('change', syncVideo);
})();
