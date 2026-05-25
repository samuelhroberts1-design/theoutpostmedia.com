/* ============================================================
   OUTPOST MEDIA — app.js
   Shared utilities: nav, RSS fetching, article rendering
   ============================================================ */

// ── CONFIGURATION ─────────────────────────────────────────────
const CONFIG = {
  substackUrl: 'https://outpostmedia.substack.com',
  rssApi: 'https://api.rss2json.com/v1/api.json',
  rssFeed: 'https://outpostmedia.substack.com/feed',
  maxItems: 50,

  streams: {
    reports: {
      label: 'Outpost Reports',
      slug: 'outpost-reports',
      color: '#c49a38',
      cssVar: '--reports',
      tags: ['outpost reports', 'reports'],
      description: 'Long-form essays examining politics, society, culture, and institutions — slowing down the conversation to prioritise context, complexity, and the underdiscussed.',
    },
    presscheck: {
      label: 'Press Check',
      slug: 'press-check',
      color: '#4e8ab0',
      cssVar: '--presscheck',
      tags: ['press check', 'media criticism'],
      description: 'Media criticism focused on narratives, framing, omissions, and incentives. Not anti-media — media-aware, with a particular focus on the ABC.',
    },
    atheism: {
      label: 'Honest Atheism',
      slug: 'honest-atheism',
      color: '#b85840',
      cssVar: '--atheism',
      tags: ['honest atheism', 'atheism', 'religion'],
      description: 'Writings on religion, belief, and secularism in modern society. The principle: all ideas with significant social power should be open to honest examination.',
    },
    briefs: {
      label: 'Outpost Briefs',
      slug: 'outpost-briefs',
      color: '#5a8858',
      cssVar: '--briefs',
      tags: ['outpost briefs', 'concept file', 'atlas file', 'flashpoint file', 'briefs'],
      description: 'Concise, educational content designed to be clear, durable, and referenceable — Concept Files, Atlas Files, and Flashpoint Files.',
    },
  },
};

// ── NAV SETUP ─────────────────────────────────────────────────
function buildNav(activePage) {
  const nav = document.getElementById('site-nav');
  if (!nav) return;

  const pages = [
    { label: 'Home', href: 'index.html', key: 'home' },
    { label: 'Reports', href: 'outpost-reports.html', key: 'reports' },
    { label: 'Press Check', href: 'press-check.html', key: 'presscheck' },
    { label: 'Honest Atheism', href: 'honest-atheism.html', key: 'atheism' },
    { label: 'Outpost Briefs', href: 'outpost-briefs.html', key: 'briefs' },
    { label: 'About', href: 'about.html', key: 'about' },
  ];

  nav.innerHTML = `
    <div class="nav-inner">
      <a class="nav-logo" href="index.html">
        <img src="logo.png" alt="Outpost Media" onerror="this.style.display='none'">
        <div class="nav-wordmark">Outpost <span>Media</span></div>
      </a>

      <nav class="nav-links" aria-label="Main navigation">
        ${pages.map(p => `
          <a href="${p.href}" class="${activePage === p.key ? 'active' : ''}">${p.label}</a>
        `).join('')}
        <div class="nav-divider"></div>
        <a href="${CONFIG.substackUrl}" class="nav-substack" target="_blank" rel="noopener">Subscribe ↗</a>
      </nav>

      <button class="nav-hamburger" aria-label="Toggle menu" onclick="toggleMobileNav()">
        <span></span><span></span><span></span>
      </button>
    </div>

    <nav class="nav-mobile" id="nav-mobile" aria-label="Mobile navigation">
      ${pages.map(p => `<a href="${p.href}">${p.label}</a>`).join('')}
      <a href="${CONFIG.substackUrl}" target="_blank" rel="noopener" style="color:var(--gold)">Subscribe on Substack ↗</a>
    </nav>
  `;
}

function toggleMobileNav() {
  document.getElementById('nav-mobile').classList.toggle('open');
}

// ── FOOTER ────────────────────────────────────────────────────
function buildFooter() {
  const footer = document.getElementById('site-footer');
  if (!footer) return;

  footer.innerHTML = `
    <div class="container">
      <div class="footer-inner">
        <div class="footer-brand">
          <div class="footer-logo">
            <img src="logo.png" alt="Outpost Media" onerror="this.style.display='none'">
            <div class="footer-logo-text">Outpost <span>Media</span></div>
          </div>
          <p class="footer-tagline">Independent. Educational. Honest.</p>
        </div>

        <div class="footer-links">
          <p class="footer-links-title">Content Streams</p>
          <ul>
            <li><a href="outpost-reports.html">Outpost Reports</a></li>
            <li><a href="press-check.html">Press Check</a></li>
            <li><a href="honest-atheism.html">Honest Atheism</a></li>
            <li><a href="outpost-briefs.html">Outpost Briefs</a></li>
            <li><a href="about.html">About</a></li>
            <li><a href="${CONFIG.substackUrl}" target="_blank">Substack ↗</a></li>
          </ul>
        </div>

        <div class="footer-substack">
          <p>All writing is published free on Substack. Subscribe to receive new pieces directly.</p>
          <a href="${CONFIG.substackUrl}" class="btn btn-gold" target="_blank" rel="noopener">Subscribe Free ↗</a>
        </div>
      </div>

      <div class="footer-bottom">
        <p>© ${new Date().getFullYear()} Outpost Media. Australian in origin, global in outlook.</p>
        <p>Judge Freely. Treat Equally.</p>
      </div>
    </div>
  `;
}

// ── RSS FETCHING ───────────────────────────────────────────────
async function fetchRSS() {
  const url = `${CONFIG.rssApi}?rss_url=${encodeURIComponent(CONFIG.rssFeed)}&count=${CONFIG.maxItems}`;
  try {
    const res = await fetch(url);
    if (!res.ok) throw new Error(`HTTP ${res.status}`);
    const data = await res.json();
    if (data.status !== 'ok') throw new Error('RSS parse error');
    return data.items || [];
  } catch (err) {
    console.error('RSS fetch failed:', err);
    return null;
  }
}

// ── ITEM CATEGORISATION ────────────────────────────────────────
function getItemStream(item) {
  const cats = (item.categories || []).map(c => c.toLowerCase());
  const title = (item.title || '').toLowerCase();

  for (const [key, stream] of Object.entries(CONFIG.streams)) {
    for (const tag of stream.tags) {
      if (cats.some(c => c.includes(tag)) || title.includes(tag)) return key;
    }
  }
  return null;
}

function filterByStream(items, streamKey) {
  return items.filter(item => getItemStream(item) === streamKey);
}

// ── DATE FORMATTING ────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── EXCERPT CLEANING ───────────────────────────────────────────
function cleanExcerpt(html, maxLen = 160) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  const text = tmp.textContent || tmp.innerText || '';
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + '…' : text;
}

// ── CARD RENDERING ─────────────────────────────────────────────
function renderCard(item, { featured = false, streamKey = null } = {}) {
  const stream = streamKey ? CONFIG.streams[streamKey] : null;
  const detectedKey = getItemStream(item);
  const detectedStream = detectedKey ? CONFIG.streams[detectedKey] : null;
  const activeStream = stream || detectedStream;
  const activeKey = streamKey || detectedKey;

  const thumb = item.thumbnail && item.thumbnail !== '' ? item.thumbnail : null;
  const excerpt = cleanExcerpt(item.description);

  if (featured && thumb) {
    return `
      <article class="article-card featured fade-up">
        <img class="article-thumb" src="${thumb}" alt="${escapeHtml(item.title)}" loading="lazy">
        <div>
          <div class="article-card-top">
            ${activeStream ? `<span class="stream-tag" style="color:${activeStream.color};border-color:${activeStream.color}">${activeStream.label}</span>` : '<span></span>'}
            <span class="article-date">${formatDate(item.pubDate)}</span>
          </div>
          <h2 class="article-title">${escapeHtml(item.title)}</h2>
          <p class="article-excerpt">${escapeHtml(excerpt)}</p>
          <div class="article-footer">
            <a href="${item.link}" class="article-read-link" target="_blank" rel="noopener">Read on Substack</a>
          </div>
        </div>
      </article>
    `;
  }

  return `
    <article class="article-card fade-up">
      ${thumb ? `<img class="article-thumb" src="${thumb}" alt="${escapeHtml(item.title)}" loading="lazy">` : ''}
      <div class="article-card-top">
        ${activeStream ? `<span class="stream-tag" style="color:${activeStream.color};border-color:${activeStream.color}">${activeStream.label}</span>` : '<span></span>'}
        <span class="article-date">${formatDate(item.pubDate)}</span>
      </div>
      <h2 class="article-title">${escapeHtml(item.title)}</h2>
      <p class="article-excerpt">${escapeHtml(excerpt)}</p>
      <div class="article-footer">
        <a href="${item.link}" class="article-read-link" target="_blank" rel="noopener">Read on Substack</a>
      </div>
    </article>
  `;
}

function renderLoading(colspan = 3) {
  return `<div class="loading-state"><span class="loading-dots">Loading</span></div>`;
}

function renderError(message = 'Could not load articles. Visit Substack directly.') {
  return `
    <div class="loading-state">
      <p style="margin-bottom:1rem">${message}</p>
      <a href="${CONFIG.substackUrl}" class="btn" target="_blank">Visit Substack ↗</a>
    </div>
  `;
}

// ── HELPER ────────────────────────────────────────────────────
function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  // Active nav detection
  const page = document.body.dataset.page || 'home';
  buildNav(page);
  buildFooter();
});
