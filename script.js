/* =========================================================
   Estúdio Filme — interações refinadas
   Preloader · progresso · reveals · navbar · parallax · topo
   ========================================================= */
(function () {
  'use strict';
  var reduce = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------- Preloader + entrada do hero ---------- */
  function boot() {
    document.body.classList.add('loaded');
    var hero = document.querySelector('.hero');
    if (hero) requestAnimationFrame(function () { hero.classList.add('lit'); });
  }
  if (document.readyState === 'complete') boot();
  else window.addEventListener('load', function () { setTimeout(boot, 350); });
  // fallback: nunca deixa o preloader travado
  setTimeout(boot, 2600);

  /* ---------- Menu ---------- */
  var toggle = document.getElementById('navToggle');
  var menu = document.getElementById('navMenu');
  var backdrop = document.createElement('div');
  backdrop.className = 'nav-backdrop';
  document.body.appendChild(backdrop);
  function openM() { menu.classList.add('open'); toggle.classList.add('open'); backdrop.classList.add('open'); toggle.setAttribute('aria-expanded', 'true'); document.body.style.overflow = 'hidden'; }
  function closeM() { menu.classList.remove('open'); toggle.classList.remove('open'); backdrop.classList.remove('open'); toggle.setAttribute('aria-expanded', 'false'); document.body.style.overflow = ''; }
  if (toggle && menu) {
    toggle.addEventListener('click', function () { menu.classList.contains('open') ? closeM() : openM(); });
    backdrop.addEventListener('click', closeM);
    menu.querySelectorAll('a').forEach(function (a) { a.addEventListener('click', closeM); });
    document.addEventListener('keydown', function (e) { if (e.key === 'Escape' && menu.classList.contains('open')) closeM(); });
  }

  /* ---------- Navbar + barra de progresso + botão topo ---------- */
  var navbar = document.getElementById('navbar');
  var progress = document.querySelector('.progress');
  var toTop = document.querySelector('.to-top');
  function onScroll() {
    var y = window.scrollY || document.documentElement.scrollTop;
    if (navbar) navbar.classList.toggle('scrolled', y > 40);
    if (progress) {
      var h = document.documentElement.scrollHeight - window.innerHeight;
      progress.style.width = (h > 0 ? (y / h) * 100 : 0) + '%';
    }
    if (toTop) toTop.classList.toggle('show', y > 700);
    // parallax
    if (!reduce) {
      pxEls.forEach(function (el) {
        var r = el.getBoundingClientRect();
        if (r.bottom < -200 || r.top > window.innerHeight + 200) return;
        var speed = parseFloat(el.getAttribute('data-parallax')) || 0.12;
        var offset = (r.top + r.height / 2 - window.innerHeight / 2) * speed;
        el.style.transform = 'translate3d(0,' + offset.toFixed(1) + 'px,0) scale(1.12)';
      });
    }
  }
  var pxEls = Array.prototype.slice.call(document.querySelectorAll('[data-parallax]'));
  window.addEventListener('scroll', onScroll, { passive: true });
  window.addEventListener('resize', onScroll);
  onScroll();

  if (toTop) toTop.addEventListener('click', function () { window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' }); });

  /* ---------- Reveals ---------- */
  var reveals = document.querySelectorAll('.reveal, .reveal-img');
  if ('IntersectionObserver' in window && !reduce) {
    var io = new IntersectionObserver(function (entries) {
      entries.forEach(function (en) { if (en.isIntersecting) { en.target.classList.add('in-view'); io.unobserve(en.target); } });
    }, { threshold: 0.14, rootMargin: '0px 0px -50px 0px' });
    reveals.forEach(function (el) { io.observe(el); });
  } else {
    reveals.forEach(function (el) { el.classList.add('in-view'); });
  }

  /* ---------- Ano ---------- */
  var y = document.getElementById('year');
  if (y) y.textContent = new Date().getFullYear();
})();
