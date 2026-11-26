import { NATIONAL_KPIS, MACRO_PULSE, AGE_PYRAMID, TOPIC_DOMAINS, HEADLINE_RELEASES } from '../data/headline.js';
import { renderSparklineSvg, renderLineChartSvg, renderPopulationPyramidSvg } from '../charts.js';
import { escapeHtml, formatNumber, formatSigned } from '../format.js';

const YEN_PER_1995 = { 1995: 1, 2000: 0.99, 2005: 0.96, 2010: 0.92, 2015: 0.98, 2020: 0.99, 2022: 1.03, 2023: 1.06, 2024: 1.09, 2025: 1.12 };
const CPI_YEARS = Object.keys(YEN_PER_1995).map(Number);

function kpiCard(kpi) {
  const color = kpi.tone === 'up' ? '#1E6B52' : '#C63D2F';
  return `<a class="kpi" href="#/indicator/${escapeHtml(kpi.id)}"><div class="kpi-label">${escapeHtml(kpi.label)}</div><div class="kpi-figure">${escapeHtml(kpi.figure)}</div><span class="pill ${kpi.tone}">${escapeHtml(kpi.deltaText)}</span>${renderSparklineSvg(kpi.spark, { color: '#18385A', width: 120, height: 30 })}<div class="kpi-src">${escapeHtml(kpi.source)}</div></a>`;
}

function pulseChart(fromYear) {
  const start = MACRO_PULSE.years.indexOf(fromYear);
  const years = MACRO_PULSE.years.slice(start);
  return renderLineChartSvg(
    [
      { name: 'Real GDP growth (%)', values: MACRO_PULSE.gdp.slice(start), color: '#18385A' },
      { name: 'Core CPI YoY (%)', values: MACRO_PULSE.cpi.slice(start), color: '#C63D2F' },
    ],
    years,
    { width: 720, height: 290, unit: '%', yLabel: 'Annual change, %', bands: MACRO_PULSE.bands, title: 'Real GDP growth versus core CPI inflation, Japan' },
  );
}

function yenValue(amount, fromYear, toYear) {
  return (amount * YEN_PER_1995[toYear]) / YEN_PER_1995[fromYear];
}

export function renderOverviewView(container) {
  const releaseRows = HEADLINE_RELEASES.map((r) => `<tr><td class="mono">${escapeHtml(r.date)}</td><td>${escapeHtml(r.agency)}</td><td><a href="${escapeHtml(r.link)}">${escapeHtml(r.title)}</a></td><td>${escapeHtml(r.figure)}</td></tr>`).join('');
  const domains = TOPIC_DOMAINS.map((d) => `<a class="domain" href="#/topic/${escapeHtml(d.id)}"><h3>${escapeHtml(d.name)}</h3><b>${d.count} indicators</b><p>${escapeHtml(d.summary)}</p><p><strong>${escapeHtml(d.highlight)}</strong></p></a>`).join('');
  const yearOptions = CPI_YEARS.map((y) => `<option value="${y}"${y === 1995 ? ' selected' : ''}>${y}</option>`).join('');
  const toOptions = CPI_YEARS.map((y) => `<option value="${y}"${y === 2025 ? ' selected' : ''}>${y}</option>`).join('');

  container.innerHTML = `
<section class="banner" aria-label="Portal introduction"><div><strong>Japan National Statistics Reference</strong><span class="sub">Benchmarked to 2025 Official Releases</span></div><nav aria-label="Quick links"><a href="#/topic/economy">Data Explorer</a><a href="#/regions">47-Prefecture Map</a><a href="#/tools">Purchasing Power Calculator</a></nav></section>
<section class="kpi-grid" aria-label="Headline indicators">${NATIONAL_KPIS.map(kpiCard).join('')}</section>
<section class="flagship">
  <article class="card"><div class="panel-head"><div><h2>Macroeconomic Pulse (2000–2025): Real GDP Growth vs. Core CPI</h2><p>Annual % change. Shaded: 2008–09 global financial crisis, 2020 COVID-19.</p></div><div class="toggle" role="group" aria-label="Range"><button type="button" data-range="2000" aria-pressed="true">2000–2025</button><button type="button" data-range="2015" aria-pressed="false">2015–2025</button></div></div><div class="chart chart-lg" id="pulse-chart">${pulseChart(2000)}</div><div class="readout" id="pulse-readout" aria-live="polite">2025 · Real GDP growth: +1.1% · Core CPI: +2.7% (hover any point to inspect)</div></article>
  <article class="card"><div class="panel-head"><div><h2>Japan Population Pyramid (2025 vs. 2000)</h2><p>Share of total population by age band and sex.</p></div></div><div class="chart chart-lg">${renderPopulationPyramidSvg(AGE_PYRAMID, { width: 460, height: 300, title: 'Population pyramid of Japan, 2025 compared with 2000' })}</div><div class="callout"><strong>Median age 49.5 yrs · 65+ share 29.3%</strong></div></article>
</section>
<section class="section"><h2>Topic Domains</h2><div class="domain-grid">${domains}</div></section>
<section class="section"><h2>Latest Official Statistical Releases</h2><div class="table-wrap"><table class="data"><thead><tr><th>Date</th><th>Agency</th><th>Release</th><th>Headline</th></tr></thead><tbody>${releaseRows}</tbody></table></div></section>
<section class="section"><h2>Quick Yen Purchasing Power (1995–2025)</h2><div class="card widget"><div><label class="field">Amount (¥)<input type="number" id="yen-amount" min="1" step="1000" value="100000"></label><label class="field">From<select id="yen-from">${yearOptions}</select></label><label class="field">To<select id="yen-to">${toOptions}</select></label><a class="btn ghost" href="#/tools">Open full calculator</a></div><div aria-live="polite"><p class="muted">Equivalent purchasing power</p><div class="big" id="yen-result"></div><p class="muted" id="yen-note"></p></div></div></section>`;

  const chart = container.querySelector('#pulse-chart');
  const readout = container.querySelector('#pulse-readout');
  const buttons = container.querySelectorAll('[data-range]');
  buttons.forEach((button) => button.addEventListener('click', () => {
    chart.innerHTML = pulseChart(Number(button.dataset.range));
    buttons.forEach((other) => other.setAttribute('aria-pressed', String(other === button)));
    readout.textContent = '2025 · Real GDP growth: +1.1% · Core CPI: +2.7% (hover any point to inspect)';
  }));
  chart.addEventListener('mouseover', (event) => {
    const point = event.target.closest('.pt');
    if (point) readout.textContent = `${point.dataset.year} · ${point.dataset.series}: ${formatSigned(Number(point.dataset.value), 1, '%')}`;
  });

  const amount = container.querySelector('#yen-amount');
  const from = container.querySelector('#yen-from');
  const to = container.querySelector('#yen-to');
  const result = container.querySelector('#yen-result');
  const note = container.querySelector('#yen-note');
  const update = () => {
    const value = Number(amount.value) || 0;
    const converted = yenValue(value, Number(from.value), Number(to.value));
    result.textContent = '¥' + formatNumber(Math.round(converted));
    note.textContent = `¥${formatNumber(value)} in ${from.value} ≈ ¥${formatNumber(Math.round(converted))} in ${to.value}. Illustrative CPI-based index (Statistics Bureau of Japan, 2025).`;
  };
  [amount, from, to].forEach((el) => el.addEventListener('input', update));
  update();
}