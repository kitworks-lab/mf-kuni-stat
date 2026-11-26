import { SERIES_YEARS, getIndicatorById } from '../data/series.js';
import { PREFECTURES, getPrefectureByCode } from '../data/regions.js';
import { renderLineChartSvg, renderGroupedBarSvg } from '../charts.js';
import { escapeHtml, formatNumber, formatSigned } from '../format.js';

const yen = (value) => '¥' + formatNumber(Math.round(value));
const yearOptions = (selected) => SERIES_YEARS.map((y) => `<option value="${y}"${y === selected ? ' selected' : ''}>${y}</option>`).join('');
const prefOptions = (selected) => PREFECTURES.map((p) => `<option value="${escapeHtml(p.code)}"${p.code === selected ? ' selected' : ''}>${escapeHtml(p.name)}</option>`).join('');

export function renderToolsView(container) {
  const cpi = getIndicatorById('cpi-headline');
  const cpiAt = (year) => cpi.values[SERIES_YEARS.indexOf(Number(year))];

  container.innerHTML = `
<section class="banner" aria-label="Tools introduction"><div><strong>Citizen Calculators</strong><span class="sub">Built on CPI, wage and prefectural statistics</span></div></section>
<div class="tools-grid">
  <article class="card" aria-labelledby="t1">
    <h2 id="t1">Yen Purchasing Power and Inflation (1995–2025)</h2>
    <label class="field">Amount (¥)<input type="number" id="pp-amount" min="1" step="1000" value="100000"></label>
    <label class="field">From year<select id="pp-from">${yearOptions(2000)}</select></label>
    <label class="field">To year<select id="pp-to">${yearOptions(2025)}</select></label>
    <div aria-live="polite"><p class="muted">Equivalent amount</p><div class="big" id="pp-result"></div><p id="pp-detail" class="muted"></p></div>
    <div class="chart-frame" id="pp-chart"></div>
    <p class="annot muted">Source: ${escapeHtml(cpi.source)}, ${escapeHtml(cpi.survey)}. Annual all-items CPI.</p>
  </article>
  <article class="card" aria-labelledby="t2">
    <h2 id="t2">Real vs. Nominal Wage Check</h2>
    <label class="field">Base year<select id="wg-year">${yearOptions(2015)}</select></label>
    <label class="field">Base annual salary (¥)<input type="number" id="wg-base" min="0" step="10000" value="4500000"></label>
    <label class="field">Current annual salary (¥)<input type="number" id="wg-now" min="0" step="10000" value="4950000"></label>
    <div aria-live="polite" id="wg-result"></div>
    <div class="bars" id="wg-bars"></div>
    <p class="annot muted" id="wg-note"></p>
  </article>
</div>
<article class="card section" aria-labelledby="t3">
  <h2 id="t3">Prefecture Cost-of-Living and Real Earnings Comparator</h2>
  <div class="filter-bar"><label class="field">Prefecture A<select id="pf-a">${prefOptions('TKY')}</select></label><label class="field">Prefecture B<select id="pf-b">${prefOptions('FUK')}</select></label></div>
  <div class="table-wrap"><table class="data"><thead><tr><th scope="col">Measure</th><th scope="col" id="pf-ha"></th><th scope="col" id="pf-hb"></th></tr></thead><tbody id="pf-body"></tbody></table></div>
  <div class="callout" id="pf-gap" aria-live="polite"></div>
  <div class="chart-frame" id="pf-chart"></div>
  <p class="annot muted">Real earnings = monthly earnings × 100 ÷ regional price index (Japan = 100). Sources: MHLW Basic Survey on Wage Structure; Statistics Bureau Retail Price Survey, 2024.</p>
</article>`;

  const pick = (id) => container.querySelector('#' + id);

  const amount = pick('pp-amount');
  const from = pick('pp-from');
  const to = pick('pp-to');
  function updatePower() {
    const value = Number(amount.value) || 0;
    const fromYear = Number(from.value);
    const toYear = Number(to.value);
    const converted = (value * cpiAt(toYear)) / cpiAt(fromYear);
    const cumulative = (cpiAt(toYear) / cpiAt(fromYear) - 1) * 100;
    const span = toYear - fromYear;
    const annual = span === 0 ? 0 : ((cpiAt(toYear) / cpiAt(fromYear)) ** (1 / Math.abs(span)) - 1) * 100 * (span < 0 ? -1 : 1);
    pick('pp-result').textContent = yen(converted);
    pick('pp-detail').textContent = `${yen(value)} in ${fromYear} has the purchasing power of ${yen(converted)} in ${toYear}. Cumulative inflation ${formatSigned(cumulative, 1, '%')}; annualized ${formatSigned(annual, 2, '%')}.`;
    const low = Math.min(fromYear, toYear);
    const high = Math.max(fromYear, toYear);
    const years = SERIES_YEARS.filter((y) => y >= low && y <= high);
    pick('pp-chart').innerHTML = years.length > 1
      ? renderLineChartSvg([{ name: 'CPI (2020 = 100)', values: years.map(cpiAt), color: '#18385A' }], years, { width: 460, height: 220, unit: '', digits: 1, yLabel: 'CPI, 2020 = 100', title: `Consumer price index ${low}–${high}` })
      : '<p class="muted">Choose two different years to see the CPI trend.</p>';
  }
  [amount, from, to].forEach((el) => el.addEventListener('input', updatePower));

  const wageYear = pick('wg-year');
  const wageBase = pick('wg-base');
  const wageNow = pick('wg-now');
  function updateWage() {
    const year = Number(wageYear.value);
    const base = Number(wageBase.value) || 0;
    const now = Number(wageNow.value) || 0;
    const nominal = base ? (now / base - 1) * 100 : 0;
    const inflation = (cpiAt(2025) / cpiAt(year) - 1) * 100;
    const baseInToday = (base * cpiAt(2025)) / cpiAt(year);
    const realYen = now - baseInToday;
    const realPct = baseInToday ? (realYen / baseInToday) * 100 : 0;
    const wageIdx = getIndicatorById('wage-index');
    const indexChange = (wageIdx.values[wageIdx.values.length - 1] / wageIdx.values[SERIES_YEARS.indexOf(year)] - 1) * 100;
    pick('wg-result').innerHTML = `<p class="muted">Real purchasing-power change vs. ${year}</p><div class="big">${realYen < 0 ? '−' : '+'}${yen(Math.abs(realYen))} <span class="pill ${realYen >= 0 ? 'up' : 'down'}">${formatSigned(realPct, 1, '%')}</span></div><p>Nominal change ${formatSigned(nominal, 1, '%')} · CPI inflation ${year}–2025 ${formatSigned(inflation, 1, '%')} · Your ${year} salary is worth ${yen(baseInToday)} in 2025 yen.</p>`;
    const top = Math.max(Math.abs(nominal), Math.abs(inflation), Math.abs(realPct), 1);
    const bar = (label, value, alt) => `<div class="bar"><span>${label}</span><span class="track"><span class="fill${alt ? ' alt' : ''}" style="width:${Math.min(100, (Math.abs(value) / top) * 100).toFixed(1)}%"></span></span><span>${formatSigned(value, 1, '%')}</span></div>`;
    pick('wg-bars').innerHTML = bar('Nominal pay', nominal, false) + bar('CPI inflation', inflation, true) + bar('Real pay', realPct, realPct < 0);
    pick('wg-note').textContent = `For reference, the national nominal wage index moved ${formatSigned(indexChange, 1, '%')} over ${year}–2025.`;
  }
  [wageYear, wageBase, wageNow].forEach((el) => el.addEventListener('input', updateWage));

  const prefA = pick('pf-a');
  const prefB = pick('pf-b');
  function updatePrefs() {
    const left = getPrefectureByCode(prefA.value);
    const right = getPrefectureByCode(prefB.value);
    const real = (p) => (p.monthlyWageK * 100) / p.costIndex;
    pick('pf-ha').textContent = left.name;
    pick('pf-hb').textContent = right.name;
    const rows = [
      ['Monthly earnings', (p) => `¥${formatNumber(p.monthlyWageK)}k`],
      ['Regional price index (Japan = 100)', (p) => formatNumber(p.costIndex, 1)],
      ['Cost-adjusted real monthly earnings', (p) => `¥${formatNumber(real(p), 1)}k`],
      ['Aging rate (65+)', (p) => `${formatNumber(p.agingPct, 1)}%`],
    ];
    pick('pf-body').innerHTML = rows.map(([label, fn]) => `<tr><td>${label}</td><td>${fn(left)}</td><td>${fn(right)}</td></tr>`).join('');
    const gap = (real(left) - real(right)) * 12 * 1000;
    const leader = gap >= 0 ? left : right;
    pick('pf-gap').innerHTML = `<strong>Annual real earnings gap: ${yen(Math.abs(gap))}</strong> in favour of ${escapeHtml(leader.name)} after adjusting for local prices.`;
    const items = [];
    [['Earnings (¥k)', 'monthlyWageK'], ['Price index', 'costIndex'], ['Real earnings (¥k)', null]].forEach(([label, key]) => {
      items.push({ label: `${label}: ${left.name}`, value: key ? left[key] : real(left), color: '#18385A' });
      items.push({ label: `${label}: ${right.name}`, value: key ? right[key] : real(right), color: '#C63D2F' });
    });
    pick('pf-chart').innerHTML = renderGroupedBarSvg(items, { width: 680, digits: 1, title: `${left.name} versus ${right.name}: earnings, prices and real earnings` });
  }
  [prefA, prefB].forEach((el) => el.addEventListener('input', updatePrefs));

  updatePower();
  updateWage();
  updatePrefs();
}