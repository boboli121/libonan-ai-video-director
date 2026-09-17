(function () {
  'use strict';
  function viewportHeight() {
    document.documentElement.style.setProperty('--app-height', window.innerHeight + 'px');
  }
  viewportHeight();
  window.addEventListener('resize', viewportHeight);
  document.addEventListener('DOMContentLoaded', function () {
    var link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = './assets/compat.css';
    document.head.appendChild(link);
    var probe = document.createElement('div');
    probe.style.cssText = 'position:absolute;visibility:hidden;display:flex;flex-direction:column;row-gap:1px';
    probe.appendChild(document.createElement('div'));
    probe.appendChild(document.createElement('div'));
    document.body.appendChild(probe);
    if (probe.scrollHeight !== 1) document.documentElement.classList.add('no-flex-gap');
    document.body.removeChild(probe);
  });
}());
