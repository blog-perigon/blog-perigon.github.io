/* =============================================================================
   carousel.js — progressive enhancement, zero dependencies
   No-JS: stacked images/videos with native controls, all visible.
   JS: single-item swipeable view, lazy src swap on activation.
   ============================================================================= */
(function () {
  'use strict';

  function initCarousel(el) {
    try {
      var slides = Array.prototype.slice.call(el.querySelectorAll('.carousel-slide'));
      if (slides.length === 0) return;

      var dotsWrap = el.querySelector('.carousel-dots');
      var prevBtn  = el.querySelector('.carousel-prev');
      var nextBtn  = el.querySelector('.carousel-next');
      var current  = 0;
      var total    = slides.length;

      el.classList.add('carousel-enhanced');

      /* ---- build dot buttons ---- */
      var dots = slides.map(function (_, i) {
        var dot = document.createElement('button');
        dot.className = 'carousel-dot';
        dot.setAttribute('aria-label', 'Item ' + (i + 1) + ' of ' + total);
        dot.addEventListener('click', function () { goTo(i); });
        dotsWrap.appendChild(dot);
        return dot;
      });

      /* ---- lazy src swap: defer loading until slide is activated ---- */
      function activateMedia(slide) {
        var img = slide.querySelector('img[data-src]');
        if (img && !img.src) {
          img.src = img.getAttribute('data-src');
        }
        var video = slide.querySelector('video[data-src]');
        if (video && !video.src) {
          video.src = video.getAttribute('data-src');
          video.preload = 'metadata';
        }
      }

      /* ---- navigate ---- */
      function goTo(index) {
        try {
          var prev = slides[current];
          var prevVideo = prev.querySelector('video');
          if (prevVideo) prevVideo.pause();
          prev.classList.remove('is-active');
          dots[current].classList.remove('is-active');
          dots[current].removeAttribute('aria-current');

          current = ((index % total) + total) % total;

          var next = slides[current];
          activateMedia(next);
          next.classList.add('is-active');
          dots[current].classList.add('is-active');
          dots[current].setAttribute('aria-current', 'true');
        } catch (e) { /* silent */ }
      }

      /* ---- strip src before enhancing so non-active slides don't load ---- */
      slides.forEach(function (slide, i) {
        if (i === 0) return; /* first slide loads eagerly */
        var img = slide.querySelector('img');
        if (img) {
          /* data-src already set in template; clear src to prevent load */
          img.removeAttribute('src');
        }
        var video = slide.querySelector('video');
        if (video) {
          video.removeAttribute('src');
          video.preload = 'none';
        }
      });

      goTo(0);

      /* ---- prev / next ---- */
      if (prevBtn) prevBtn.addEventListener('click', function () { goTo(current - 1); });
      if (nextBtn) nextBtn.addEventListener('click', function () { goTo(current + 1); });

      /* ---- keyboard ---- */
      el.setAttribute('tabindex', '-1');
      el.addEventListener('keydown', function (e) {
        if (e.key === 'ArrowLeft')  { goTo(current - 1); e.preventDefault(); }
        if (e.key === 'ArrowRight') { goTo(current + 1); e.preventDefault(); }
      });

      /* ---- touch swipe ---- */
      var tx = null, ty = null;

      el.addEventListener('touchstart', function (e) {
        try { tx = e.touches[0].clientX; ty = e.touches[0].clientY; }
        catch (e) { /* silent */ }
      }, { passive: true });

      el.addEventListener('touchend', function (e) {
        try {
          if (tx === null) return;
          var dx = e.changedTouches[0].clientX - tx;
          var dy = e.changedTouches[0].clientY - ty;
          if (Math.abs(dx) > Math.abs(dy) && Math.abs(dx) > 40) {
            goTo(dx < 0 ? current + 1 : current - 1);
          }
        } catch (e) { /* silent */ }
        finally { tx = null; ty = null; }
      }, { passive: true });

    } catch (e) { /* silent fail — no-JS layout intact */ }
  }

  function init() {
    try {
      Array.prototype.slice.call(document.querySelectorAll('.carousel'))
           .forEach(initCarousel);
    } catch (e) { /* silent */ }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
}());
