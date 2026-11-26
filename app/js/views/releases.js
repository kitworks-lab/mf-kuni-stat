import { RELEASE_CALENDAR, OPEN_DATA_PACKS, METHODOLOGY_GLOSSARY } from '../data/releases.js';
import { INDICATORS, SERIES_YEARS } from '../data/series.js';
import { PREFECTURES, REGIONAL_METRICS } from '../data/regions.js';
import { escapeHtml, toCsv, downloadTextFile } from '../format.js';

const PACK_DOMAINS = {
  'macro-panel': ['economy', 'trade', 'society'],
  'demographics-pack': ['population'],
  'prices-wages': ['prices', 'labour'],
};

function packRows(pack) {
  if (pack.id === 'prefectures-47') {
    const columns = ['code', 'name', 'region', ...REGIONAL_METRICS.map((m) => m.key), 'netMigration', 'highlight'];
    return { rows: PREFECTURES.map((p) => Object.fromEntries(columns.map((key) => [key, p[key]]))), columns };
  }
  const domains = PACK_DOMAINS[pack.id] ?? [];
  const chosen = INDICATORS.filter((item) => domains.includes(item.domain));
  const rows = chosen.flatMap((item) => SERIES_YEARS.map((year, index) => ({ indicator_id: item.id, indicator: item.title, year, value: item.values[index], unit: item.unit, source: item.source })));
  return { rows, columns: ['indicator_id', 'indicator', 'year', 'value', 'unit', 'source'] };
}

export function renderReleasesView(container) {
  const state = { status: 'All', agency: '', query: '' };
  const agencies = [...new Set(RELEASE_CALENDAR.map((r) => r.agency))].sort();

  container.innerHTML = `
<section class="banner" aria-label="Releases introduction"><div><strong>Releases, Open Data and Methodology</strong><span class="sub">Calendar, downloadable packages and definitions</span></div></section>
<section class="section"><h2>Official Release Calendar</h2>
  <div class="filter-bar">
    <div class="toggle" id="rel-status" role="group" aria-label="Status">${['All', 'Published', 'Scheduled'].map((s) => `<button type="button" data-status="${s}" aria-pressed="${s === 'All'}">${s}</button>`).join('')}</div>
    <label class="field">Agency <select id="rel-agency"><option value="">All agencies</option>${agencies.map((a) => `<option value="${escapeHtml(a)}">${escapeHtml(a)}</option>`).join('')}</select></label>
    <label class="field">Search <input type="search" id="rel-search" placeholder="Title or headline"></label>
  </div>
  <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Date</th><th scope="col">Agency</th><th scope="col">Release</th><th scope="col">Frequency</th><th scope="col">Status</th><th scope="col">Headline</th></tr></thead><tbody id="rel-body"></tbody></table></div>
  <p class="muted" id="rel-count" aria-live="polite"></p>
</section>
<section class="section"><h2>Open Data Packages</h2><div class="cards">${OPEN_DATA_PACKS.map((pack) => `<article class="card"><h3>${escapeHtml(pack.title)}</h3><p>${escapeHtml(pack.description)}</p><p class="muted">${escapeHtml(pack.coverage)} · ${escapeHtml(String(pack.records))} records</p><p class="muted">${escapeHtml(pack.source)}</p><p><span class="pill">${escapeHtml(pack.license)}</span></p><div class="dl"><button type="button" class="btn" data-pack="${escapeHtml(pack.id)}" data-format="csv">Download CSV</button><button type="button" class="btn ghost" data-pack="${escapeHtml(pack.id)}" data-format="json">Download JSON</button></div></article>`).join('')}</div></section>
<section class="section"><h2>Statistical Methodology and Definitions</h2><div class="tools-grid">${METHODOLOGY_GLOSSARY.map((entry) => `<div class="card"><h3>${escapeHtml(entry.term)}</h3><p>${escapeHtml(entry.summary)}</p><p class="muted">${escapeHtml(entry.agency)}</p></div>`).join('')}</div></section>`;

  const body = container.querySelector('#rel-body');
  function drawCalendar() {
    const query = state.query.trim().toLowerCase();
    const rows = RELEASE_CALENDAR.filter((r) => (state.status === 'All' || r.status === state.status) && (!state.agency || r.agency === state.agency) && (!query || `${r.title} ${r.headline}`.toLowerCase().includes(query)));
    body.innerHTML = rows.map((r) => `<tr><td class="mono">${escapeHtml(r.date)}</td><td>${escapeHtml(r.agency)}</td><td><a href="#/indicator/${escapeHtml(r.indicatorId)}">${escapeHtml(r.title)}</a></td><td>${escapeHtml(r.frequency)}</td><td><span class="pill${r.status === 'Published' ? ' up' : ''}">${escapeHtml(r.status)}</span></td><td>${escapeHtml(r.headline)}</td></tr>`).join('') || '<tr><td colspan="6">No releases match the filters.</td></tr>';
    container.querySelector('#rel-count').textContent = `${rows.length} of ${RELEASE_CALENDAR.length} releases shown.`;
  }

  container.querySelector('#rel-status').addEventListener('click', (event) => {
    const button = event.target.closest('[data-status]');
    if (!button) return;
    state.status = button.dataset.status;
    container.querySelectorAll('[data-status]').forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
    drawCalendar();
  });
  container.querySelector('#rel-agency').addEventListener('change', (event) => { state.agency = event.target.value; drawCalendar(); });
  container.querySelector('#rel-search').addEventListener('input', (event) => { state.query = event.target.value; drawCalendar(); });
  container.addEventListener('click', (event) => {
    const button = event.target.closest('[data-pack]');
    if (!button) return;
    const pack = OPEN_DATA_PACKS.find((item) => item.id === button.dataset.pack);
    const { rows, columns } = packRows(pack);
    if (button.dataset.format === 'csv') downloadTextFile(`${pack.id}.csv`, toCsv(rows, columns), 'text/csv');
    else downloadTextFile(`${pack.id}.json`, JSON.stringify({ id: pack.id, title: pack.title, source: pack.source, license: pack.license, coverage: pack.coverage, data: rows }, null, 2), 'application/json');
  });

  drawCalendar();
}