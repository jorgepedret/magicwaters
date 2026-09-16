var header = document.querySelector('.site-header');
var toggle = document.querySelector('.nav-toggle');
var nav = document.querySelector('.main-nav');

function onScroll(){
  if (!header) return;
  if (window.scrollY > 30) header.classList.add('scrolled');
  else header.classList.remove('scrolled');
}
onScroll();
window.addEventListener('scroll', onScroll, {passive:true});

if (toggle && nav) {
  toggle.addEventListener('click', function(){
    var open = nav.classList.toggle('open');
    toggle.classList.toggle('active', open);
    toggle.setAttribute('aria-expanded', open ? 'true' : 'false');
  });
  nav.querySelectorAll('a').forEach(function(link){
    link.addEventListener('click', function(){
      nav.classList.remove('open');
      toggle.classList.remove('active');
      toggle.setAttribute('aria-expanded', 'false');
    });
  });
}

function scrollToHashTarget(){
  if (!location.hash) return;
  var target;
  try { target = document.querySelector(location.hash); } catch (e) { return; }
  if (!target) return;
  var offset = (header ? header.offsetHeight : 0) + 24;
  var top = target.getBoundingClientRect().top + window.pageYOffset - offset;
  window.scrollTo({top: Math.max(top, 0), behavior: 'auto'});
}
scrollToHashTarget();
window.addEventListener('load', scrollToHashTarget);
window.addEventListener('hashchange', scrollToHashTarget);

// Photo gallery lightbox
(function(){
  var galleries = document.querySelectorAll('.photo-gallery');
  if (!galleries.length) return;

  var overlay = document.createElement('div');
  overlay.className = 'lightbox';
  overlay.setAttribute('aria-hidden', 'true');
  overlay.innerHTML =
    '<button class="lightbox-close" aria-label="Close">&times;</button>' +
    '<button class="lightbox-prev" aria-label="Previous photo">&#10094;</button>' +
    '<img class="lightbox-img" alt="">' +
    '<button class="lightbox-next" aria-label="Next photo">&#10095;</button>' +
    '<div class="lightbox-count"></div>';
  document.body.appendChild(overlay);

  var imgEl = overlay.querySelector('.lightbox-img');
  var closeBtn = overlay.querySelector('.lightbox-close');
  var prevBtn = overlay.querySelector('.lightbox-prev');
  var nextBtn = overlay.querySelector('.lightbox-next');
  var countEl = overlay.querySelector('.lightbox-count');

  var currentSet = [];
  var currentIndex = 0;
  var touchStartX = null;

  function show(index){
    if (!currentSet.length) return;
    currentIndex = (index + currentSet.length) % currentSet.length;
    var src = currentSet[currentIndex];
    imgEl.src = src.getAttribute('src');
    imgEl.alt = src.getAttribute('alt') || '';
    countEl.textContent = (currentIndex + 1) + ' / ' + currentSet.length;
  }

  function open(set, index){
    currentSet = set;
    show(index);
    overlay.classList.add('open');
    overlay.setAttribute('aria-hidden', 'false');
    document.body.classList.add('lightbox-locked');
  }

  function close(){
    overlay.classList.remove('open');
    overlay.setAttribute('aria-hidden', 'true');
    document.body.classList.remove('lightbox-locked');
  }

  galleries.forEach(function(gallery){
    var imgs = Array.prototype.slice.call(gallery.querySelectorAll('img'));
    imgs.forEach(function(img, i){
      img.style.cursor = 'zoom-in';
      img.addEventListener('click', function(){
        open(imgs, i);
      });
    });
  });

  closeBtn.addEventListener('click', close);
  prevBtn.addEventListener('click', function(){ show(currentIndex - 1); });
  nextBtn.addEventListener('click', function(){ show(currentIndex + 1); });

  overlay.addEventListener('click', function(e){
    if (e.target === overlay) close();
  });

  document.addEventListener('keydown', function(e){
    if (!overlay.classList.contains('open')) return;
    if (e.key === 'Escape') close();
    else if (e.key === 'ArrowLeft') show(currentIndex - 1);
    else if (e.key === 'ArrowRight') show(currentIndex + 1);
  });

  overlay.addEventListener('touchstart', function(e){
    touchStartX = e.changedTouches[0].clientX;
  }, {passive:true});

  overlay.addEventListener('touchend', function(e){
    if (touchStartX === null) return;
    var dx = e.changedTouches[0].clientX - touchStartX;
    if (Math.abs(dx) > 40) {
      if (dx < 0) show(currentIndex + 1);
      else show(currentIndex - 1);
    }
    touchStartX = null;
  }, {passive:true});
})();
