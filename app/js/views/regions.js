import { REGION_NAMES, REGIONAL_METRICS, NATIONAL_BENCHMARK, PREFECTURES, getPrefectureByCode } from '../data/regions.js';
import { renderJapanCartogramSvg } from '../charts.js';
import { escapeHtml, formatNumber, formatSigned, toCsv, downloadTextFile } from '../format.js';

const BAR_METRICS = [
  ['agingPct', 'Aging 65+ (%)', 1],
  ['grpPerCapita', 'GRP per Capita (¥k)', 0],
  ['monthlyWageK', 'Monthly Earnings (¥k)', 0],
  ['costIndex', 'Regional Price Index (JP=100)', 1],
];

export function renderRegionsView(container, { prefCode } = {}) {
  const known = (code) => (code && getPrefectureByCode(code) ? code : null);
  const state = {
    metric: 'agingPct',
    region: 'All',
    primary: known(prefCode) ?? 'TKY',
    compare: 'AKT',
    query: '',
    sortKey: 'name',
    sortDir: 'asc',
  };
  if (known(prefCode) === 'AKT') state.compare = 'TKY';
  else if (state.primary === 'AKT') state.compare = 'TKY';

  const metricOf = (key) => REGIONAL_METRICS.find((m) => m.key === key);
  const options = (selected) => PREFECTURES.map((p) => `<option value="${escapeHtml(p.code)}"${p.code === selected ? ' selected' : ''}>${escapeHtml(p.name)}</option>`).join('');

  container.innerHTML = `
<section class="banner" aria-label="Regional overview"><div><strong>47 Prefectures at a Glance</strong><span class="sub">Tile cartogram, inspector and head-to-head comparison</span></div></section>
<div class="filter-bar">
  <div class="toggle" id="reg-metric" role="group" aria-label="Metric">${REGIONAL_METRICS.map((m) => `<button type="button" data-metric="${m.key}" aria-pressed="${m.key === state.metric}">${escapeHtml(m.key === 'agingPct' ? '65+ Aging Rate (%)' : m.label)}</button>`).join('')}</div>
</div>
<nav class="tabs" id="reg-region" aria-label="Region filter">${['All', ...REGION_NAMES].map((r) => `<button type="button" class="btn${r === 'All' ? '' : ' ghost'}" data-region="${escapeHtml(r)}" aria-pressed="${r === 'All'}">${r === 'All' ? 'All 8 Regions' : escapeHtml(r)}</button>`).join('')}</nav>
<div class="region-layout">
  <article class="card"><h2 id="reg-title"></h2><div class="cartogram" id="reg-map"></div><div class="legend" id="reg-legend"></div><p class="annot muted" id="reg-source"></p></article>
  <article class="card"><h2>Prefecture Inspector and Comparator</h2>
    <div class="filter-bar"><label class="field">Primary <select id="reg-primary">${options(state.primary)}</select></label><label class="field">Compare <select id="reg-compare">${options(state.compare)}</select></label></div>
    <div class="compare" id="reg-cards"></div>
    <div class="chart-frame" id="reg-bars"></div>
  </article>
</div>
<section class="section"><h2>All 47 Prefectures</h2>
  <div class="filter-bar"><label class="field">Search <input type="search" id="reg-search" placeholder="Name or region"></label><button type="button" class="btn ghost" id="reg-csv">Export 47-Prefecture CSV</button></div>
  <div class="table-wrap"><table class="data"><thead id="reg-head"></thead><tbody id="reg-body"></tbody></table></div>
</section>`;

  const mapEl = container.querySelector('#reg-map');
  const cardsEl = container.querySelector('#reg-cards');
  const barsEl = container.querySelector('#reg-bars');
  const bodyEl = container.querySelector('#reg-body');
  const headEl = container.querySelector('#reg-head');
  const primarySelect = container.querySelector('#reg-primary');
  const compareSelect = container.querySelector('#reg-compare');

  const visible = () => PREFECTURES.filter((p) => state.region === 'All' || p.region === state.region);

  function drawMap() {
    const metric = metricOf(state.metric);
    const list = visible();
    const values = list.map((p) => p[state.metric]);
    const min = Math.min(...values);
    const max = Math.max(...values);
    const fmt = (v) => formatNumber(v, metric.digits);
    mapEl.innerHTML = renderJapanCartogramSvg(list, state.metric, state.primary, state.compare, { min, max, format: fmt, average: NATIONAL_BENCHMARK[state.metric] });
    container.querySelector('#reg-title').textContent = `${metric.label} (${metric.unit}) by Prefecture`;
    container.querySelector('#reg-legend').innerHTML = `<span>${fmt(min)}</span><span class="ramp" aria-hidden="true"></span><span>${fmt(max)}</span><span>· Japan ${fmt(NATIONAL_BENCHMARK[state.metric])}</span>`;
    container.querySelector('#reg-source').textContent = `${metric.source}, ${metric.year}.`;
  }

  function prefCard(pref, role) {
    const metric = metricOf(state.metric);
    const value = pref[state.metric];
    const delta = value - NATIONAL_BENCHMARK[state.metric];
    return `<div class="card"><small class="muted">${role}</small><h3>${escapeHtml(pref.name)}</h3><p class="muted">${escapeHtml(pref.region)}</p><p>${escapeHtml(pref.highlight)}</p><p><span class="big">${formatNumber(value, metric.digits)}</span> <span class="muted">${escapeHtml(metric.unit)}</span></p><span class="pill">${formatSigned(delta, metric.digits)} vs Japan</span></div>`;
  }

  function drawInspector() {
    const primary = getPrefectureByCode(state.primary);
    const other = getPrefectureByCode(state.compare);
    cardsEl.innerHTML = prefCard(primary, 'Primary') + prefCard(other, 'Compare');
    const rowHtml = BAR_METRICS.map(([key, label, digits]) => {
      const entries = [[primary.name, primary[key], 'p'], [other.name, other[key], 'c'], ['Japan', NATIONAL_BENCHMARK[key], 'j']];
      const top = Math.max(...entries.map((entry) => entry[1])) || 1;
      return `<div class="mrow"><h4>${escapeHtml(label)}</h4>${entries.map(([name, value, tone]) => `<div class="mbar"><span class="mname">${escapeHtml(name)}</span><span class="mtrack"><span class="mfill ${tone}" style="width:${Math.max(2, (value / top) * 100).toFixed(1)}%"></span></span><span class="mval">${formatNumber(value, digits)}</span></div>`).join('')}</div>`;
    }).join('');
    barsEl.innerHTML = `<div class="mrows" aria-label="${escapeHtml(primary.name)} vs ${escapeHtml(other.name)} vs Japan average">${rowHtml}</div>`;  }

  function drawTable() {
    const query = state.query.trim().toLowerCase();
    const rows = visible().filter((p) => !query || p.name.toLowerCase().includes(query) || p.region.toLowerCase().includes(query));
    const dir = state.sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => {
      const left = a[state.sortKey];
      const right = b[state.sortKey];
      return (typeof left === 'string' ? left.localeCompare(right) : left - right) * dir;
    });
    const columns = [['name', 'Prefecture'], ['region', 'Region'], ...REGIONAL_METRICS.map((m) => [m.key, `${m.shortLabel} (${m.unit})`])];
    headEl.innerHTML = `<tr>${columns.map(([key, label]) => `<th scope="col" aria-sort="${state.sortKey === key ? (state.sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}"><button type="button" class="btn ghost" data-sort="${key}">${escapeHtml(label)}${state.sortKey === key ? (state.sortDir === 'asc' ? ' ▲' : ' ▼') : ''}</button></th>`).join('')}</tr>`;
    bodyEl.innerHTML = rows.map((p) => `<tr><td><a href="#/regions?pref=${escapeHtml(p.code)}">${escapeHtml(p.name)}</a></td><td>${escapeHtml(p.region)}</td>${REGIONAL_METRICS.map((m) => `<td>${formatNumber(p[m.key], m.digits)}</td>`).join('')}</tr>`).join('') || '<tr><td colspan="8">No prefectures match.</td></tr>';
  }

  const redrawSelection = () => {
    primarySelect.value = state.primary;
    compareSelect.value = state.compare;
    drawMap();
    drawInspector();
  };
  const pick = (code) => {
    if (code === state.primary) return;
    state.compare = state.primary === code ? state.compare : state.primary;
    state.primary = code;
    if (state.compare === state.primary) state.compare = code === 'TKY' ? 'AKT' : 'TKY';
    redrawSelection();
  };

  container.querySelector('#reg-metric').addEventListener('click', (event) => {
    const button = event.target.closest('[data-metric]');
    if (!button) return;
    state.metric = button.dataset.metric;
    container.querySelectorAll('[data-metric]').forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
    drawMap();
    drawInspector();
  });
  container.querySelector('#reg-region').addEventListener('click', (event) => {
    const button = event.target.closest('[data-region]');
    if (!button) return;
    state.region = button.dataset.region;
    container.querySelectorAll('[data-region]').forEach((other) => {
      other.setAttribute('aria-pressed', String(other === button));
      other.classList.toggle('ghost', other !== button);
    });
    drawMap();
    drawTable();
  });
  primarySelect.addEventListener('change', () => { state.primary = primarySelect.value; drawMap(); drawInspector(); });
  compareSelect.addEventListener('change', () => { state.compare = compareSelect.value; drawMap(); drawInspector(); });
  mapEl.addEventListener('click', (event) => {
    const tile = event.target.closest('[data-pref]');
    if (tile) pick(tile.dataset.pref);
  });
  mapEl.addEventListener('keydown', (event) => {
    if (event.key !== 'Enter' && event.key !== ' ') return;
    const tile = event.target.closest('[data-pref]');
    if (!tile) return;
    event.preventDefault();
    const code = tile.dataset.pref;
    pick(code);
    mapEl.querySelector(`[data-pref="${code}"]`)?.focus();
  });
  container.querySelector('#reg-search').addEventListener('input', (event) => { state.query = event.target.value; drawTable(); });
  headEl.addEventListener('click', (event) => {
    const button = event.target.closest('[data-sort]');
    if (!button) return;
    const key = button.dataset.sort;
    state.sortDir = state.sortKey === key && state.sortDir === 'asc' ? 'desc' : 'asc';
    state.sortKey = key;
    drawTable();
  });
  container.querySelector('#reg-csv').addEventListener('click', () => {
    const columns = ['code', 'name', 'region', ...REGIONAL_METRICS.map((m) => m.key), 'netMigration', 'highlight'];
    downloadTextFile('kuni-stat-47-prefectures.csv', toCsv(PREFECTURES, columns), 'text/csv');
  });

  drawMap();
  drawInspector();
  drawTable();
}