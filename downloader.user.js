// ==UserScript==
// @name        pdfremote downloader
// @namespace   Violentmonkey Scripts
// @icon        https://pdfremote.com/build/images/icons/fav.png
// @version     1.0.0
//
// @match       https://pdfremote.com/*
// @grant       none
//
// @author      -
// @description
// ==/UserScript==

(function () {
  'use strict';

  // Ищем URL PDF среди ресурсов, которые страница уже загрузила
  function findPdfUrls() {
    const urls = new Set();

    performance.getEntriesByType('resource').forEach(e => {
      if (/\.pdf(\?|#|$)/i.test(e.name)) urls.add(e.name);
    });

    document.querySelectorAll('iframe, embed, object').forEach(el => {
      const src = el.src || el.data;
      if (src && /\.pdf(\?|#|$)|^blob:/i.test(src)) urls.add(src);
    });

    return [...urls];
  }

  async function downloadPdf(url) {
    const res = await fetch(url, { credentials: 'include' });
    if (!res.ok) throw new Error('HTTP ' + res.status);
    const blob = await res.blob();

    let name = decodeURIComponent(url.split('/').pop().split('?')[0].split('#')[0]);
    if (!name.toLowerCase().endsWith('.pdf')) name = 'document.pdf';

    const a = document.createElement('a');
    a.href = URL.createObjectURL(blob);
    a.download = name;
    document.body.appendChild(a);
    a.click();
    a.remove();
    setTimeout(() => URL.revokeObjectURL(a.href), 10000);
  }

  // Кнопка на странице
  const btn = document.createElement('button');
  btn.textContent = '⬇ Download PDF';
  Object.assign(btn.style, {
    position: 'fixed', right: '20px', bottom: '20px', zIndex: 999999,
    padding: '10px 16px', background: '#2563eb', color: '#fff',
    border: 'none', borderRadius: '8px', cursor: 'pointer', fontSize: '14px'
  });

  btn.onclick = async () => {
    const urls = findPdfUrls();
    if (!urls.length) {
      alert('PDF не найден. Откройте документ и попробуйте снова.');
      return;
    }
    try {
      for (const url of urls) await downloadPdf(url);
    } catch (e) {
      alert('Ошибка скачивания: ' + e.message);
    }
  };

  document.body.appendChild(btn);
})();
