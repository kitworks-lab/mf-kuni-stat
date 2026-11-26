import { renderOverviewView } from './views/overview.js';
import { SEARCH_INDEX } from './data/headline.js';

const app = document.getElementById('app');
const nav = document.getElementById('main-nav');
const navToggle = document.getElementById('nav-toggle');
const searchInput = document.getElementById('global-search');
const searchResults = document.getElementById('search-results');
const BASE_TITLE = 'KUNI STAT · Japan National Statistics';
let renderToken = 0;
let firstRender = true;

function parseHash() {
  const raw = window.location.hash.replace(/^#/, '') || '/';
  const [path, query = ''] = raw.split('?');
  return { path: path.replace(/\/+$/, '') || '/', params: new URLSearchParams(query) };
}

function titleCase(slug) {
  return slug.charAt(0).toUpperCase() + slug.slice(1);
}

function setCurrent(href) {
  nav.querySelectorAll('a').forEach((link) => {
    if (link.getAttribute('href') === href) link.setAttribute('aria-current', 'page');
    else link.removeAttribute('aria-current');
  });
}

async function resolve({ path, params }) {
  const segments = path.split('/').filter(Boolean);
  const [head, arg] = segments;
  if (!head) {
    return { title: BASE_TITLE, current: '#/', render: () => renderOverviewView(app) };
  }
  if (head === 'topic' && arg) {
    const { renderExplorerView } = await import('./views/explorer.js');
    return { title: `${titleCase(arg)} · ${BASE_TITLE}`, current: `#/topic/${arg}`, render: () => renderExplorerView(app, { domain: arg }) };
  }
  if (head === 'indicator' && arg) {
    const { renderExplorerView } = await import('./views/explorer.js');
    const entry = SEARCH_INDEX.find((item) => item.id === arg);
    return { title: `${entry ? entry.label : arg} · ${BASE_TITLE}`, current: entry && entry.topic ? `#/topic/${entry.topic}` : '', render: () => renderExplorerView(app, { indicatorId: arg }) };
  }
  if (head === 'regions') {
    const { renderRegionsView } = await import('./views/regions.js');
    return { title: `Regions · ${BASE_TITLE}`, current: '#/regions', render: () => renderRegionsView(app, { prefCode: params.get('pref') || undefined }) };
  }
  if (head === 'tools') {
    const { renderToolsView } = await import('./views/tools.js');
    return { title: `Tools · ${BASE_TITLE}`, current: '#/tools', render: () => renderToolsView(app) };
  }
  if (head === 'releases') {
    const { renderReleasesView } = await import('./views/releases.js');
    return { title: `Releases · ${BASE_TITLE}`, current: '#/releases', render: () => renderReleasesView(app) };
  }
  return { title: `Not found · ${BASE_TITLE}`, current: '', render: () => { app.innerHTML = '<section class="section"><h1>Page not found</h1><p><a href="#/">Return to the overview</a></p></section>'; } };
}

async function route() {
  const token = ++renderToken;
  window.__KUNI_READY = false;
  try {
    const view = await resolve(parseHash());
    if (token !== renderToken) return;
    view.render();
    document.title = view.title;
    setCurrent(view.current);
  } catch (error) {
    if (token !== renderToken) return;
    app.innerHTML = '<section class="section"><h1>Unable to load this page</h1><p><a href="#/">Return to the overview</a></p></section>';
  }
  nav.classList.remove('open');
  navToggle.setAttribute('aria-expanded', 'false');
  if (!firstRender) window.scrollTo({ top: 0, behavior: 'smooth' });
  firstRender = false;
  window.__KUNI_READY = true;
}

navToggle.addEventListener('click', () => {
  const open = nav.classList.toggle('open');
  navToggle.setAttribute('aria-expanded', String(open));
});

function hideResults() {
  searchResults.hidden = true;
  searchResults.innerHTML = '';
}

function showResults() {
  const query = searchInput.value.trim().toLowerCase();
  if (!query) return hideResults();
  const matches = SEARCH_INDEX.filter((item) => `${item.label} ${item.type} ${item.topic || ''}`.toLowerCase().includes(query)).slice(0, 8);
  searchResults.innerHTML = '';
  if (!matches.length) {
    const empty = document.createElement('li');
    empty.textContent = 'No matches';
    empty.className = 'muted';
    empty.style.padding = '7px 10px';
    searchResults.appendChild(empty);
  }
  matches.forEach((item) => {
    const row = document.createElement('li');
    const link = document.createElement('a');
    link.href = item.href;
    const label = document.createElement('span');
    label.textContent = item.label;
    const kind = document.createElement('small');
    kind.textContent = item.type;
    link.append(label, kind);
    link.addEventListener('click', () => { hideResults(); searchInput.value = ''; });
    row.appendChild(link);
    searchResults.appendChild(row);
  });
  searchResults.hidden = false;
}

searchInput.addEventListener('input', showResults);
searchInput.addEventListener('focus', showResults);
searchInput.addEventListener('keydown', (event) => {
  if (event.key === 'Escape') { hideResults(); searchInput.blur(); }
  if (event.key === 'Enter') {
    const first = searchResults.querySelector('a');
    if (first) { event.preventDefault(); first.click(); }
  }
});
document.addEventListener('keydown', (event) => {
  const tag = (event.target && event.target.tagName) || '';
  if (event.key === '/' && !event.ctrlKey && !event.metaKey && !event.altKey && !/^(INPUT|TEXTAREA|SELECT)$/.test(tag)) {
    event.preventDefault();
    searchInput.focus();
    searchInput.select();
  }
});
document.addEventListener('click', (event) => {
  if (!event.target.closest('.search')) hideResults();
});

window.addEventListener('hashchange', route);
route();