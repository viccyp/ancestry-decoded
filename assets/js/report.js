/* Ancestry Decoded — slide navigation
   Keyboard + click navigation between standalone slide pages. */
(function () {
  function go(sel) {
    var el = document.querySelector(sel);
    if (el && el.getAttribute('aria-disabled') !== 'true' && el.href) {
      window.location.href = el.href;
    }
  }

  document.addEventListener('keydown', function (e) {
    if (e.metaKey || e.ctrlKey || e.altKey) return;
    switch (e.key) {
      case 'ArrowRight':
      case 'PageDown':
      case ' ':
        e.preventDefault();
        go('#nav-next');
        break;
      case 'ArrowLeft':
      case 'PageUp':
        e.preventDefault();
        go('#nav-prev');
        break;
      case 'Home':
        window.location.href = 'index.html';
        break;
      case 'f':
      case 'F':
        if (!document.fullscreenElement) {
          (document.documentElement.requestFullscreen || function () {}).call(document.documentElement);
        } else {
          document.exitFullscreen();
        }
        break;
    }
  });
})();
