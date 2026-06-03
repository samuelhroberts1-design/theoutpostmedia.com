// ============================================================
// OUTPOST MEDIA — app.js
// Reads articles from articles.js and renders them on each page.
// ============================================================

// ── Helpers ──────────────────────────────────────────────────

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
  const recent = [...articles].slice(0, 6);
  renderGrid('recent-articles', recent);
}

// ── Stream pages ─────────────────────────────────────────────

function articleInStream(article, stream) {
  if (Array.isArray(article.stream)) return article.stream.includes(stream);
  return article.stream === stream;
}

function initStreamPage(stream) {
  const filtered = articles.filter(a => articleInStream(a, stream));
  renderGrid('stream-articles', filtered);
}

// ── Briefs page ──────────────────────────────────────────────

function initBriefsPage() {
  const tabs = document.querySelectorAll('.briefs-tab');
  const container = document.getElementById('briefs-articles');
  if (!container) return;

  function showTab(type) {
    tabs.forEach(t => t.classList.toggle('active', t.dataset.type === type));
    const filtered = articles.filter(a => a.stream === 'briefs' && a.briefType === type);
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

  const body = document.body.dataset.page;
  if (body === 'home')       initHomepage();
  if (body === 'reports')    initStreamPage('reports');
  if (body === 'presscheck') initStreamPage('presscheck');
  if (body === 'atheism')    initStreamPage('atheism');
  if (body === 'briefs')     initBriefsPage();
  if (body === 'article')    initArticleReader();
});
