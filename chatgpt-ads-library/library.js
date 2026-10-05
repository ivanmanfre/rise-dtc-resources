(() => {
  const galleries = JSON.parse(document.getElementById('gallery-data').textContent);
  document.querySelectorAll('[data-gallery]').forEach(gallery => {
    const data = galleries[gallery.dataset.gallery];
    if (!data) return;
    const select = gallery.querySelector('select');
    const image = gallery.querySelector('img');
    const entry = gallery.closest('.post-entry');
    const buttons = [...gallery.querySelectorAll('[data-step]')];
    function show(index) {
      const current = Math.max(0, Math.min(data.images.length - 1, index));
      image.src = data.images[current];
      image.alt = data.alts[current];
      select.value = String(current);
      gallery.querySelector('.preview-open').href = data.originals[current];
      entry.querySelector('.original-image').href = data.originals[current];
      buttons[0].disabled = current === 0;
      buttons[1].disabled = current === data.images.length - 1;
    }
    buttons.forEach(button => button.addEventListener('click', () => show(Number(select.value) + Number(button.dataset.step))));
    select.addEventListener('change', () => show(Number(select.value)));
  });
  const filters = [...document.querySelectorAll('[data-filter]')];
  const entries = [...document.querySelectorAll('.post-entry')];
  function filter(kind) {
    filters.forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === kind)));
    entries.forEach(entry => { entry.hidden = kind !== 'all' && entry.dataset.kind !== kind; });
    document.querySelector('.filter-status').textContent = `${entries.filter(entry => !entry.hidden).length} posts shown.`;
  }
  filters.forEach(button => button.addEventListener('click', () => filter(button.dataset.filter)));
  function revealAnchor() {
    const target = document.getElementById(location.hash.slice(1));
    if (target?.matches('.post-entry') && target.hidden) {
      filter('all');
      target.scrollIntoView();
    }
  }
  window.addEventListener('hashchange', revealAnchor);
  document.querySelectorAll('[data-copy]').forEach(button => button.addEventListener('click', async () => {
    const text = document.getElementById(button.dataset.copy).textContent;
    const status = button.closest('.post-content').querySelector('.copy-status');
    try {
      await navigator.clipboard.writeText(text);
      status.textContent = 'Post copied.';
    } catch {
      const range = document.createRange();
      range.selectNodeContents(document.getElementById(button.dataset.copy));
      const selection = window.getSelection();
      selection.removeAllRanges();
      selection.addRange(range);
      status.textContent = 'Text selected. Use your device’s copy command.';
    }
  }));
  revealAnchor();
})();
