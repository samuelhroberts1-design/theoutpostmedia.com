/* ============================================================
   OUTPOST MEDIA — app.js
   ============================================================ */

const CONFIG = {
  substackUrl: 'https://outpostmedia.substack.com',
  rssFeed: 'https://outpostmedia.substack.com/feed',
  maxItems: 50,

  streams: {
    reports: {
      label: 'Outpost Reports',
      slug: 'outpost-reports',
      color: '#c49a38',
      description: 'Long-form essays examining politics, society, culture, and institutions.',
    },
    presscheck: {
      label: 'Press Check',
      slug: 'press-check',
      color: '#4e8ab0',
      description: 'Media criticism focused on narratives, framing, omissions, and incentives.',
    },
    atheism: {
      label: 'Honest Atheism',
      slug: 'honest-atheism',
      color: '#b85840',
      description: 'Writings on religion, belief, and secularism in modern society.',
    },
    briefs: {
      label: 'Outpost Briefs',
      slug: 'outpost-briefs',
      color: '#5a8858',
      description: 'Concept Files, Atlas Files, and Flashpoint Files.',
    },
  },
};

// ── NAV ──────────────────────────────────────────────────────
function buildNav(activePage) {
  const nav = document.getElementById('site-nav');
  if (!nav) return;
  const pages = [
    { label: 'Home',           href: 'index.html',          key: 'home' },
    { label: 'Reports',        href: 'outpost-reports.html', key: 'reports' },
    { label: 'Press Check',    href: 'press-check.html',     key: 'presscheck' },
    { label: 'Honest Atheism', href: 'honest-atheism.html',  key: 'atheism' },
    { label: 'Outpost Briefs', href: 'outpost-briefs.html',  key: 'briefs' },
    { label: 'About',          href: 'about.html',           key: 'about' },
  ];
  nav.innerHTML = `
    <div class="nav-inner">
      <a class="nav-logo" href="index.html">
        <img src="logo.png" alt="Outpost Media" onerror="this.style.display='none'">
        <div class="nav-wordmark">Outpost <span>Media</span></div>
      </a>
      <nav class="nav-links" aria-label="Main navigation">
        ${pages.map(p => `<a href="${p.href}" class="${activePage === p.key ? 'active' : ''}">${p.label}</a>`).join('')}
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

// ── RSS FETCH — tries multiple proxies ────────────────────────
async function fetchRSS() {
  const proxies = [
    url => `https://corsproxy.io/?${encodeURIComponent(url)}`,
    url => `https://api.allorigins.win/raw?url=${encodeURIComponent(url)}`,
    url => `https://api.codetabs.com/v1/proxy?quest=${encodeURIComponent(url)}`,
  ];

  for (const makeUrl of proxies) {
    try {
      const res = await fetch(makeUrl(CONFIG.rssFeed));
      if (!res.ok) continue;
      const text = await res.text();
      const parser = new DOMParser();
      const xml = parser.parseFromString(text, 'text/xml');
      // Check it parsed correctly
      if (xml.querySelector('parsererror')) continue;
      const items = Array.from(xml.querySelectorAll('item'));
      if (items.length === 0) continue;
      console.log(`RSS loaded via proxy: ${makeUrl(CONFIG.rssFeed).split('?')[0]}`);
      return items.map(parseItem);
    } catch (err) {
      console.warn('Proxy failed, trying next...', err.message);
    }
  }

  console.error('All proxies failed');
  return null;
}

function parseItem(item) {
  const get = tag => {
    // Handle namespaced tags like content:encoded
    const el = item.querySelector(tag) || item.getElementsByTagNameNS('*', tag.split(':').pop())[0];
    return el?.textContent?.trim() || '';
  };

  const enclosure = item.querySelector('enclosure');
  let thumbnail = enclosure?.getAttribute('url') || '';

  // Pull first image from content if no enclosure
  if (!thumbnail) {
    const content = get('encoded') || get('description');
    const match = content.match(/src="(https:\/\/substackcdn[^"]+)"/);
    if (match) thumbnail = match[1];
  }

  return {
    title:       get('title'),
    link:        get('link'),
    pubDate:     get('pubDate'),
    description: get('description'),
    content:     get('encoded') || get('description'),
    thumbnail,
  };
}

// ── STREAM DETECTION ──────────────────────────────────────────
function getItemStream(item) {
  const title   = (item.title   || '').toLowerCase();
  const content = (item.content || '').toLowerCase().slice(0, 500);

  if (title.includes('flashpoint file'))              return 'briefs';
  if (title.includes('atlas file'))                   return 'briefs';
  if (title.includes('concept file'))                 return 'briefs';
  if (title.includes('outpost brief'))                return 'briefs';
  if (content.includes('outpost briefs are here'))    return 'briefs';

  if (title.includes('press check'))                  return 'presscheck';
  if (content.includes('press check is a series'))    return 'presscheck';

  if (title.includes('honest atheism'))               return 'atheism';
  if (content.includes('honest atheism is a space'))  return 'atheism';

  return 'reports'; // default — anything else goes to Outpost Reports
}

function getBriefType(item) {
  const title = (item.title || '').toLowerCase();
  if (title.includes('concept file'))    return 'concept';
  if (title.includes('atlas file'))      return 'atlas';
  if (title.includes('flashpoint file')) return 'flashpoint';
  return 'other';
}

function filterByStream(items, streamKey) {
  return items.filter(item => getItemStream(item) === streamKey);
}

// ── DATE ──────────────────────────────────────────────────────
function formatDate(dateStr) {
  if (!dateStr) return '';
  const d = new Date(dateStr);
  return d.toLocaleDateString('en-AU', { day: 'numeric', month: 'long', year: 'numeric' });
}

// ── EXCERPT ───────────────────────────────────────────────────
function cleanExcerpt(html, maxLen = 160) {
  const tmp = document.createElement('div');
  tmp.innerHTML = html || '';
  const text = (tmp.textContent || tmp.innerText || '').replace(/~~.*?~~/gs, '').trim();
  return text.length > maxLen ? text.slice(0, maxLen).trimEnd() + '…' : text;
}

// ── CARD HTML ─────────────────────────────────────────────────
function renderCard(item, { featured = false, streamKey = null } = {}) {
  const detectedKey  = streamKey || getItemStream(item);
  const activeStream = detectedKey ? CONFIG.streams[detectedKey] : null;
  const thumb        = item.thumbnail || '';
  const excerpt      = cleanExcerpt(item.description || item.content);

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
      </article>`;
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
    </article>`;
}

function renderError(msg) {
  return `<div class="loading-state"><p style="margin-bottom:1rem">${msg || 'Could not load articles.'}</p><a href="${CONFIG.substackUrl}" class="btn" target="_blank">Visit Substack ↗</a></div>`;
}

function escapeHtml(str) {
  if (!str) return '';
  return str.replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;').replace(/"/g,'&quot;');
}

// ── INIT ──────────────────────────────────────────────────────
document.addEventListener('DOMContentLoaded', () => {
  buildNav(document.body.dataset.page || 'home');
  buildFooter();
});
