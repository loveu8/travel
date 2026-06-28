var sidebar = document.getElementById('sidebar');
var handleHint = document.getElementById('handleHint');

function toggleSidebar() {
  if (window.innerWidth >= 768) return;
  var expanded = sidebar.classList.toggle('expanded');
  handleHint.textContent = expanded ? '▼ 收起' : '▲ 查看行程';
}

function setActiveChip(chipKey) {
  var strip = document.getElementById('chip-day' + currentDay);
  if (!strip) return;
  strip.querySelectorAll('.chip').forEach(function(c) { c.classList.remove('active'); });
  if (!chipKey) return;
  var target = strip.querySelector('[data-chip="' + chipKey + '"]');
  if (target) {
    target.classList.add('active');
    target.scrollIntoView({ behavior: 'smooth', block: 'nearest', inline: 'center' });
  }
}

function switchDay(day, tabEl) {
  currentDay = day;
  document.querySelectorAll('.day-tab').forEach(function(t) { t.classList.remove('active'); });
  tabEl.classList.add('active');

  document.querySelectorAll('.day-content').forEach(function(c) { c.classList.remove('active'); });
  document.getElementById('day' + day + '-content').classList.add('active');

  document.querySelectorAll('.map-wrap').forEach(function(m) { m.classList.remove('active'); });
  document.getElementById('map-day' + day).classList.add('active');

  document.querySelectorAll('.chip-strip').forEach(function(s) { s.style.display = 'none'; });
  var strip = document.getElementById('chip-day' + day);
  if (strip) strip.style.display = 'flex';
  setActiveChip(null);

  if (window.innerWidth < 768) {
    sidebar.classList.add('expanded');
    handleHint.textContent = '▼ 收起';
    document.querySelector('.sidebar-body').scrollTop = 0;
  }
}

document.querySelector('.sidebar-header').addEventListener('click', function() {
  if (window.innerWidth < 768) toggleSidebar();
});

var currentDay = 1;

function convertToEmbed(href) {
  try {
    var u = new URL(href);
    var q = u.searchParams.get('query');
    if (q) return 'https://maps.google.com/maps?q=' + encodeURIComponent(q) + '&output=embed&z=15';
    var dest = u.searchParams.get('destination');
    if (dest) return 'https://maps.google.com/maps?q=' + encodeURIComponent(dest) + '&output=embed&z=14';
  } catch (e) {}
  return null;
}

function showMapToast() {
  if (window.innerWidth >= 768) return;
  var t = document.getElementById('mapToast');
  t.classList.add('show');
  clearTimeout(window._toastTimer);
  window._toastTimer = setTimeout(function() { t.classList.remove('show'); }, 2200);
}

// 拖曳分隔條 resize
(function() {
  var divider = document.getElementById('resizeDivider');
  var sidebarEl = document.getElementById('sidebar');
  var isDragging = false;

  function startDrag(e) {
    if (window.innerWidth < 768) return;
    isDragging = true;
    divider.classList.add('dragging');
    document.body.style.cursor = 'col-resize';
    document.body.style.userSelect = 'none';
    e.preventDefault();
  }

  function onDrag(clientX) {
    if (!isDragging) return;
    var minW = Math.floor(window.innerWidth / 4);
    var maxW = Math.floor(window.innerWidth / 2);
    var newW = window.innerWidth - clientX;
    newW = Math.max(minW, Math.min(maxW, newW));
    sidebarEl.style.width = newW + 'px';
  }

  function stopDrag() {
    if (!isDragging) return;
    isDragging = false;
    divider.classList.remove('dragging');
    document.body.style.cursor = '';
    document.body.style.userSelect = '';
  }

  divider.addEventListener('mousedown', startDrag);
  document.addEventListener('mousemove', function(e) { onDrag(e.clientX); });
  document.addEventListener('mouseup', stopDrag);

  divider.addEventListener('touchstart', function(e) { startDrag(e.touches[0]); }, { passive: false });
  document.addEventListener('touchmove', function(e) { if (isDragging) { onDrag(e.touches[0].clientX); e.preventDefault(); } }, { passive: false });
  document.addEventListener('touchend', stopDrag);

  window.addEventListener('resize', function() {
    if (window.innerWidth < 768) return;
    var minW = Math.floor(window.innerWidth / 4);
    var maxW = Math.floor(window.innerWidth / 2);
    var currentW = parseInt(sidebarEl.style.width) || 420;
    if (currentW > maxW) sidebarEl.style.width = maxW + 'px';
    if (currentW < minW) sidebarEl.style.width = minW + 'px';
  });
})();

function openLightbox(src) {
  document.getElementById('lightbox-img').src = src;
  document.getElementById('lightbox').classList.add('open');
}
function closeLightbox() {
  document.getElementById('lightbox').classList.remove('open');
}
document.addEventListener('keydown', function(e) {
  if (e.key === 'Escape') closeLightbox();
});

document.querySelector('.sidebar-body').addEventListener('click', function(e) {
  var tlLink = e.target.closest('a.tl-link');

  if (tlLink) {
    if (window.innerWidth < 768) {
      e.preventDefault();
      var itemFromLink = tlLink.closest('.tl-item');
      if (itemFromLink) {
        document.querySelectorAll('.tl-item').forEach(function(t) { t.classList.remove('selected'); });
        itemFromLink.classList.add('selected');
        setActiveChip(itemFromLink.dataset.chip || null);
        var eu = convertToEmbed(tlLink.href);
        if (eu) {
          var fr = document.querySelector('.map-wrap.active iframe');
          if (fr) fr.src = eu;
        }
        showMapToast();
      }
    }
    return;
  }

  if (e.target.closest('a')) return;

  var item = e.target.closest('.tl-item');
  if (!item) return;

  document.querySelectorAll('.tl-item').forEach(function(t) { t.classList.remove('selected'); });
  item.classList.add('selected');
  setActiveChip(item.dataset.chip || null);

  var link = item.querySelector('.tl-link');
  if (link) {
    var embedUrl = convertToEmbed(link.href);
    if (embedUrl) {
      var iframe = document.querySelector('.map-wrap.active iframe');
      if (iframe) iframe.src = embedUrl;
      showMapToast();
    }
  }
});
