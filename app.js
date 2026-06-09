// ============================================================
// OUTPOST MEDIA — app.js
// Reads articles from 6 stream files and merges them into
// a single deduplicated array for rendering.
// ============================================================

// Merge all stream arrays into one deduplicated articles array
// (Some articles appear in multiple streams intentionally)
const articles = (() => {
  const all = [
    ...(typeof articles_reports    !== 'undefined' ? articles_reports    : []),
    ...(typeof articles_presscheck !== 'undefined' ? articles_presscheck : []),
    ...(typeof articles_atheism    !== 'undefined' ? articles_atheism    : []),
    ...(typeof articles_atlas      !== 'undefined' ? articles_atlas      : []),
    ...(typeof articles_concept    !== 'undefined' ? articles_concept    : []),
    ...(typeof articles_flashpoint !== 'undefined' ? articles_flashpoint : []),
  ];
  // Deduplicate by slug — first occurrence wins
  const seen = new Set();
  return all.filter(a => seen.has(a.slug) ? false : seen.add(a.slug));
})();

function streamLabel(stream, briefType) {
  if (stream === 'reports')    return 'Outpost Reports';
  if (stream === 'presscheck') return 'Press Check';
  if (stream === 'atheism')    return 'Honest Atheism';
  if (stream === 'briefs') {
    if (briefType === 'concept')    return 'Concept Files';
    if (briefType === 'atlas')      return 'Atlas Files';
    if (briefType === 'flashpoint') return 'Flashpoint Files';
    return 'Outpost Briefs';
  }
  return '';
}

function articleUrl(slug) {
  return `article.html?slug=${slug}`;
}

function thumbHtml(article, cls) {
  if (article.thumbnail) {
    return `<img src="${article.thumbnail}" alt="${article.title}" class="${cls}" loading="lazy">`;
  }
  return `<div class="article-card-thumb-placeholder">
    <svg width="40" height="40" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1">
      <rect x="3" y="3" width="18" height="18" rx="2"/><circle cx="8.5" cy="8.5" r="1.5"/>
      <polyline points="21 15 16 10 5 21"/>
    </svg>
  </div>`;
}

// ── Date sort ────────────────────────────────────────────────

function byDateDesc(a, b) {
  return new Date(b.date) - new Date(a.date);
}

// ── Article Card ─────────────────────────────────────────────

function buildArticleCard(article) {
  const url = articleUrl(article.slug);
  const label = streamLabel(article.stream, article.briefType);
  return `
    <a class="article-card" href="${url}">
      ${thumbHtml(article, 'article-card-thumb')}
      <div class="article-card-body">
        <div class="article-card-meta">
          <span class="article-card-stream">${label}</span>
          <span class="article-card-date">${article.date}</span>
        </div>
        <div class="article-card-title">${article.title}</div>
        <div class="article-card-subtitle">${article.subtitle || ''}</div>
        <div class="article-card-read">Read →</div>
      </div>
    </a>`;
}

// ── Render grids ─────────────────────────────────────────────

function renderGrid(containerId, filtered) {
  const el = document.getElementById(containerId);
  if (!el) return;
  if (!filtered.length) {
    el.innerHTML = '<div class="empty-state"><p>No articles yet. Check back soon.</p></div>';
    return;
  }
  el.innerHTML = `<div class="articles-grid">${filtered.map(buildArticleCard).join('')}</div>`;
}

// ── Homepage ─────────────────────────────────────────────────

function initHomepage() {
  const el = document.getElementById('recent-articles');
  if (!el) return;
  const recent = [...articles].sort(byDateDesc).slice(0, 6);
  renderGrid('recent-articles', recent);
}

// ── Stream pages ─────────────────────────────────────────────

function articleInStream(article, stream) {
  if (Array.isArray(article.stream)) return article.stream.includes(stream);
  return article.stream === stream;
}

function initStreamPage(stream) {
  const filtered = articles.filter(a => articleInStream(a, stream)).sort(byDateDesc);
  renderGrid('stream-articles', filtered);
}

// ── Briefs page ──────────────────────────────────────────────

function initBriefsPage() {
  const tabs = document.querySelectorAll('.briefs-tab');
  const container = document.getElementById('briefs-articles');
  if (!container) return;

  function showTab(type) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.type === type));
    const filtered = articles.filter(a => a.stream === 'briefs' && a.briefType === type).sort(byDateDesc);
    if (!filtered.length) {
      container.innerHTML = '<div class="empty-state"><p>No articles yet. Check back soon.</p></div>';
    } else {
      container.innerHTML = `<div class="articles-grid">${filtered.map(buildArticleCard).join('')}</div>`;
    }
  }

  tabs.forEach(tab => tab.addEventListener('click', () => showTab(tab.dataset.type)));
  showTab('concept'); // default tab
}

// ── Article reader ───────────────────────────────────────────

function initArticleReader() {
  const params = new URLSearchParams(window.location.search);
  const slug = params.get('slug');
  const article = articles.find(a => a.slug === slug);

  const errorEl = document.getElementById('article-error');
  const contentEl = document.getElementById('article-content');

  if (!article) {
    if (errorEl) errorEl.style.display = 'block';
    if (contentEl) contentEl.style.display = 'none';
    return;
  }

  // Set page title
  document.title = `${article.title} — Outpost Media`;

  const label = streamLabel(article.stream, article.briefType);

  contentEl.innerHTML = `
    <div class="article-reader-header">
      <div class="article-reader-stream">${label}</div>
      <h1 class="article-reader-title">${article.title}</h1>
      ${article.subtitle ? `<p class="article-reader-subtitle">${article.subtitle}</p>` : ''}
      <div class="article-reader-meta">
        <span class="article-reader-date">${article.date}</span>
        <span class="article-reader-author">Sam Roberts</span>
        <a href="${article.substackUrl}" class="article-reader-substack" target="_blank" rel="noopener">
          View on Substack ↗
        </a>
      </div>
    </div>
    <div class="article-body">
      ${article.content}
    </div>
    <div class="article-footer">
      <span class="article-footer-label">← <a href="javascript:history.back()" style="color:var(--muted)">Back</a></span>
      <a href="${article.substackUrl}" class="article-reader-substack" target="_blank" rel="noopener">
        View on Substack ↗
      </a>
    </div>`;
}

// ── Random article ───────────────────────────────────────────

function initRandomButton() {
  const btn = document.getElementById('btn-random');
  if (!btn) return;
  btn.addEventListener('click', () => {
    const pool = articles;
    const pick = pool[Math.floor(Math.random() * pool.length)];
    if (pick) window.location.href = articleUrl(pick.slug);
  });
}

// ── Search bar ───────────────────────────────────────────────

function initSearch() {
  const input = document.getElementById('nav-search-input');
  const dropdown = document.getElementById('search-dropdown');
  if (!input || !dropdown) return;

  const pool = articles;

  function renderResults(query) {
    const q = query.trim().toLowerCase();
    if (!q) {
      dropdown.classList.remove('open');
      return;
    }
    const matches = pool.filter(a =>
      a.title.toLowerCase().includes(q) ||
      (a.subtitle || '').toLowerCase().includes(q)
    ).slice(0, 8);

    if (!matches.length) {
      dropdown.innerHTML = `<div class="search-no-results">No results for "${query}"</div>`;
    } else {
      dropdown.innerHTML = matches.map(a => {
        const label = streamLabel(a.stream, a.briefType);
        const thumb = a.thumbnail
          ? `<img src="${a.thumbnail}" class="search-result-thumb" alt="" loading="lazy">`
          : `<div class="search-result-thumb" style="display:flex;align-items:center;justify-content:center;"><svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5"><rect x="3" y="3" width="18" height="18" rx="2"/><polyline points="21 15 16 10 5 21"/></svg></div>`;
        return `<a class="search-result" href="${articleUrl(a.slug)}">
          ${thumb}
          <div class="search-result-info">
            <div class="search-result-title">${a.title}</div>
            <div class="search-result-meta">${label} · ${a.date}</div>
          </div>
        </a>`;
      }).join('');
    }
    dropdown.classList.add('open');
  }

  input.addEventListener('input', () => renderResults(input.value));

  // Close on click outside
  document.addEventListener('click', e => {
    if (!input.contains(e.target) && !dropdown.contains(e.target)) {
      dropdown.classList.remove('open');
    }
  });

  // Close on Escape
  input.addEventListener('keydown', e => {
    if (e.key === 'Escape') {
      dropdown.classList.remove('open');
      input.blur();
    }
    // Navigate to first result on Enter
    if (e.key === 'Enter') {
      const first = dropdown.querySelector('.search-result');
      if (first) window.location.href = first.getAttribute('href');
    }
  });
}

// ── All Articles page ────────────────────────────────────────

function initAllArticlesPage() {
  const grid = document.getElementById('all-articles-grid');
  const filterBar = document.getElementById('all-articles-filters');
  if (!grid || !filterBar) return;

  function getStream(a) {
    if (a.stream === 'briefs') return a.briefType;
    if (Array.isArray(a.stream)) return a.stream[0];
    return a.stream;
  }

  const pool = articles.sort(byDateDesc);

  function render(filter) {
    const filtered = filter === 'all'
      ? pool
      : pool.filter(a => getStream(a) === filter);
    renderGrid('all-articles-grid', filtered);
  }

  filterBar.addEventListener('click', e => {
    const btn = e.target.closest('.filter-btn');
    if (!btn) return;
    filterBar.querySelectorAll('.filter-btn').forEach(b => b.classList.remove('active'));
    btn.classList.add('active');
    render(btn.dataset.filter);
  });

  render('all');
}

// ── Nav active state ─────────────────────────────────────────

function setActiveNav() {
  const path = window.location.pathname.split('/').pop() || 'index.html';
  document.querySelectorAll('.nav-links a').forEach(a => {
    const href = a.getAttribute('href').split('/').pop();
    a.classList.toggle('active', href === path);
  });
}

// ── Mobile nav toggle ────────────────────────────────────────

function initMobileNav() {
  const toggle = document.getElementById('nav-toggle');
  const links = document.getElementById('nav-links');
  if (toggle && links) {
    toggle.addEventListener('click', () => links.classList.toggle('open'));
  }
}

// ── Init ─────────────────────────────────────────────────────

document.addEventListener('DOMContentLoaded', () => {
  setActiveNav();
  initMobileNav();
  initRandomButton();
  initSearch();

  const body = document.body.dataset.page;
  if (body === 'home')         initHomepage();
  if (body === 'reports')      initStreamPage('reports');
  if (body === 'presscheck')   initStreamPage('presscheck');
  if (body === 'atheism')      initStreamPage('atheism');
  if (body === 'briefs')       initBriefsPage();
  if (body === 'article')      initArticleReader();
  if (body === 'all-articles') initAllArticlesPage();
});
