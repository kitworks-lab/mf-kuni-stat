import { INDICATORS, SERIES_YEARS, getIndicatorById, getIndicatorsByDomain } from '../data/series.js';
import { TOPIC_DOMAINS } from '../data/headline.js';
import { renderLineChartSvg } from '../charts.js';
import { escapeHtml, formatNumber, formatSigned, toCsv, downloadTextFile } from '../format.js';

const RANGES = [1995, 2005, 2015];
const TRANSFORMS = [['level', 'Level'], ['yoy', 'YoY Δ'], ['index', 'Index = 100']];

function yoyOf(values) {
  return values.map((v, i) => (i === 0 ? null : v - values[i - 1]));
}

function indexOf(values) {
  const base = values[0] || 1;
  return values.map((v) => (v / base) * 100);
}

function round(value, digits) {
  return value === null ? null : Math.round(value * 10 ** digits) / 10 ** digits;
}

export function renderExplorerView(container, { domain, indicatorId } = {}) {
  let indicator = indicatorId ? getIndicatorById(indicatorId) : null;
  const activeDomain = indicator ? indicator.domain : TOPIC_DOMAINS.some((d) => d.id === domain) ? domain : 'economy';
  const domainIndicators = getIndicatorsByDomain(activeDomain);
  indicator = indicator ?? domainIndicators[0] ?? INDICATORS[0];
  const state = { from: 1995, transform: 'level', compareId: '', sortKey: 'year', sortDir: 'desc' };

  const tabs = TOPIC_DOMAINS.map((d) => `<a class="btn${d.id === activeDomain ? '' : ' ghost'}" href="#/topic/${escapeHtml(d.id)}"${d.id === activeDomain ? ' aria-current="page"' : ''}>${escapeHtml(d.name)}</a>`).join('');
  const sidebar = domainIndicators.map((item) => `<a href="#/indicator/${escapeHtml(item.id)}"${item.id === indicator.id ? ' aria-current="page"' : ''}>${escapeHtml(item.shortTitle)}<br><span class="muted mono">${formatNumber(item.latestValue, item.digits)} ${escapeHtml(item.unit)}</span></a>`).join('');
  const domainName = TOPIC_DOMAINS.find((d) => d.id === activeDomain)?.name ?? activeDomain;
  const compareOptions = INDICATORS.filter((item) => item.id !== indicator.id).map((item) => `<option value="${escapeHtml(item.id)}">${escapeHtml(item.shortTitle)} (${escapeHtml(item.unit)})</option>`).join('');
  const values = indicator.values;
  const lastDelta = values[values.length - 1] - values[values.length - 2];
  const lastPct = values[values.length - 2] ? (lastDelta / Math.abs(values[values.length - 2])) * 100 : 0;
  const pillTone = lastDelta === 0 ? '' : (lastDelta > 0) === (indicator.tone !== 'down') ? ' up' : ' down';

  container.innerHTML = `
<nav class="tabs" aria-label="Topic domains">${tabs}</nav>
<div class="explorer">
  <aside class="sidebar" aria-label="${escapeHtml(domainName)} indicators"><h3>${escapeHtml(domainName)}</h3>${sidebar}</aside>
  <section>
    <header class="card">
      <h1>${escapeHtml(indicator.title)}</h1>
      <p><span class="big">${formatNumber(indicator.latestValue, indicator.digits)}</span> <span class="muted">${escapeHtml(indicator.unit)} · ${indicator.latestYear}</span> <span class="pill${pillTone}">${formatSigned(lastPct, 1, '% YoY')}</span></p>
      <p class="muted">Source: ${escapeHtml(indicator.source)} · Survey: ${escapeHtml(indicator.survey)} · Updated ${escapeHtml(indicator.updated)}</p>
    </header>
    <div class="filter-bar" role="group" aria-label="Chart controls">
      <div class="toggle" id="exp-range" role="group" aria-label="Range">${RANGES.map((y) => `<button type="button" data-range="${y}" aria-pressed="${y === state.from}">${y}–2025</button>`).join('')}</div>
      <div class="toggle" id="exp-transform" role="group" aria-label="Transform">${TRANSFORMS.map(([key, label]) => `<button type="button" data-transform="${key}" aria-pressed="${key === state.transform}">${label}</button>`).join('')}</div>
      <label class="inline-field">Compare: <select id="exp-compare"><option value="">None</option>${compareOptions}</select></label>
      <button class="btn ghost" type="button" id="exp-csv">Export CSV</button>
      <button class="btn ghost" type="button" id="exp-json">Export JSON</button>
    </div>
    <div class="card">
      <div class="chart-frame" id="exp-chart"></div>
      <div class="readout" id="exp-readout" aria-live="polite"></div>
      <p class="annot muted" id="exp-note"></p>
      <div class="stats-strip" id="exp-stats"></div>
    </div>
    <div class="table-wrap"><table class="data"><caption class="sr-only">Annual values</caption><thead id="exp-head"></thead><tbody id="exp-body"></tbody></table></div>
    <div class="method"><strong>Methodology</strong><p><b>Agency source:</b> ${escapeHtml(indicator.source)}<br><b>Survey:</b> ${escapeHtml(indicator.survey)}<br><b>Base year / frequency:</b> ${escapeHtml(indicator.baseNote)} · ${escapeHtml(indicator.frequency)}</p><p>${escapeHtml(indicator.methodology)}</p></div>
  </section>
</div>`;

  const chart = container.querySelector('#exp-chart');
  const readout = container.querySelector('#exp-readout');
  const note = container.querySelector('#exp-note');
  const stats = container.querySelector('#exp-stats');
  const head = container.querySelector('#exp-head');
  const body = container.querySelector('#exp-body');
  const select = container.querySelector('#exp-compare');

  function view() {
    const start = SERIES_YEARS.indexOf(state.from);
    const years = SERIES_YEARS.slice(start);
    const compare = state.compareId ? getIndicatorById(state.compareId) : null;
    const mixed = Boolean(compare) && compare.unit !== indicator.unit;
    const mode = mixed ? 'index' : state.transform;
    const prepare = (item) => {
      const slice = item.values.slice(start);
      if (mode === 'yoy') return yoyOf(item.values).slice(start).map((v) => round(v, item.digits + 1));
      if (mode === 'index') return indexOf(slice).map((v) => round(v, 1));
      return slice;
    };
    const first = mode === 'yoy' ? 1 : 0;
    const chartYears = years.slice(first);
    const main = prepare(indicator).slice(first);
    const other = compare ? prepare(compare).slice(first) : null;
    const unit = mode === 'index' ? 'idx' : mode === 'yoy' ? ' Δ' : '';
    const series = [{ name: indicator.shortTitle, values: main, color: '#18385A' }];
    if (other) series.push({ name: compare.shortTitle, values: other, color: '#C63D2F' });
    const bands = (indicator.bands ?? []).filter((band) => band.to >= chartYears[0]);
    chart.innerHTML = renderLineChartSvg(series, chartYears, { width: 760, height: 225, unit, digits: mode === 'level' ? indicator.digits : 1, bands, yLabel: mode === 'index' ? `Index (${years[0]} = 100)` : indicator.unit, title: `${indicator.title}, ${chartYears[0]}–2025` });
    note.textContent = mixed ? `Units differ (${indicator.unit} vs ${compare.unit}); both series rebased to ${years[0]} = 100.` : mode === 'yoy' ? 'Year-over-year change in the indicator unit.' : mode === 'index' ? `Rebased so ${years[0]} = 100.` : `Values in ${indicator.unit}.`;
    const lastIndex = main.length - 1;
    const latestText = mode === 'level' ? ` (${formatSigned(lastPct, 1, '% YoY')})` : '';
    readout.textContent = ` · ${indicator.shortTitle}: ${formatNumber(main[lastIndex], mode === 'level' ? indicator.digits : 1)}${mode === 'level' ? ' ' + indicator.unit : ''}${latestText} — hover any point to inspect`;

    const slice = indicator.values.slice(start);
    const peak = slice.indexOf(Math.max(...slice));
    const trough = slice.indexOf(Math.min(...slice));
    const mean = slice.reduce((sum, v) => sum + v, 0) / slice.length;
    const tenAgo = indicator.values[indicator.values.length - 11];
    const tenChange = tenAgo ? ((indicator.latestValue - tenAgo) / Math.abs(tenAgo)) * 100 : 0;
    const cellHtml = (label, text) => `<div class="stat"><small>${label}</small><strong>${text}</strong></div>`;

    const rows = years.map((year, i) => {
      const value = slice[i];
      const previous = i > 0 ? slice[i - 1] : indicator.values[start - 1];
      const otherValue = compare ? compare.values[start + i] : null;
      return { year, value, change: previous === undefined ? null : value - previous, other: otherValue };
    });
    const dir = state.sortDir === 'asc' ? 1 : -1;
    rows.sort((a, b) => ((a[state.sortKey] ?? -Infinity) - (b[state.sortKey] ?? -Infinity)) * dir);
    const sortBtn = (key, label) => `<th scope="col" aria-sort="${state.sortKey === key ? (state.sortDir === 'asc' ? 'ascending' : 'descending') : 'none'}"><button type="button" class="btn ghost" data-sort="${key}">${label}${state.sortKey === key ? (state.sortDir === 'asc' ? ' ▲' : ' ▼') : ''}</button></th>`;
    head.innerHTML = `<tr>${sortBtn('year', 'Year')}${sortBtn('value', `Value (${escapeHtml(indicator.unit)})`)}${sortBtn('change', 'YoY Change')}${compare ? sortBtn('other', `${escapeHtml(compare.shortTitle)} (${escapeHtml(compare.unit)})`) : ''}</tr>`;
    body.innerHTML = rows.map((row) => `<tr><td class="mono">${row.year}</td><td>${formatNumber(row.value, indicator.digits)}</td><td>${row.change === null ? '–' : formatSigned(row.change, indicator.digits)}</td>${compare ? `<td>${formatNumber(row.other, compare.digits)}</td>` : ''}</tr>`).join('');
    return { years, rows, compare };
  }

  let current = view();
  const refresh = () => { current = view(); };

  container.querySelector('#exp-range').addEventListener('click', (event) => {
    const button = event.target.closest('[data-range]');
    if (!button) return;
    state.from = Number(button.dataset.range);
    container.querySelectorAll('[data-range]').forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
    refresh();
  });
  container.querySelector('#exp-transform').addEventListener('click', (event) => {
    const button = event.target.closest('[data-transform]');
    if (!button) return;
    state.transform = button.dataset.transform;
    container.querySelectorAll('[data-transform]').forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
    refresh();
  });
  select.addEventListener('change', () => { state.compareId = select.value; refresh(); });
  head.addEventListener('click', (event) => {
    const button = event.target.closest('[data-sort]');
    if (!button) return;
    const key = button.dataset.sort;
    state.sortDir = state.sortKey === key && state.sortDir === 'desc' ? 'asc' : 'desc';
    state.sortKey = key;
    refresh();
  });
  chart.addEventListener('mouseover', (event) => {
    const point = event.target.closest('.pt');
    if (point) readout.textContent = `${point.dataset.year} · ${point.dataset.series}: ${formatNumber(Number(point.dataset.value), 2)}${point.dataset.unit}`;
  });

  const exportRows = () => current.rows.slice().sort((a, b) => a.year - b.year).map((row) => {
    const out = { year: row.year, value: row.value, yoy_change: row.change === null ? '' : Math.round(row.change * 1000) / 1000, unit: indicator.unit };
    if (current.compare) out[current.compare.id] = row.other;
    return out;
  });
  container.querySelector('#exp-csv').addEventListener('click', () => {
    const rows = exportRows();
    downloadTextFile(`${indicator.id}.csv`, toCsv(rows, Object.keys(rows[0])), 'text/csv');
  });
  container.querySelector('#exp-json').addEventListener('click', () => {
    const payload = { id: indicator.id, title: indicator.title, unit: indicator.unit, source: indicator.source, survey: indicator.survey, updated: indicator.updated, data: exportRows() };
    downloadTextFile(`${indicator.id}.json`, JSON.stringify(payload, null, 2), 'application/json');
  });
}