import { escapeHtml, formatNumber } from './format.js';

const INK = '#111827';
const INDIGO = '#18385A';
const RED = '#C63D2F';
const MUTED = '#556070';
const GRID = '#E4DFD5';
const FONT = '-apple-system, Segoe UI, Roboto, sans-serif';

function niceStep(range, ticks) {
  const raw = range / ticks;
  const mag = Math.pow(10, Math.floor(Math.log10(raw)));
  const norm = raw / mag;
  return (norm <= 1 ? 1 : norm <= 2 ? 2 : norm <= 5 ? 5 : 10) * mag;
}

function niceDomain(min, max, ticks = 5) {
  if (min === max) { min -= 1; max += 1; }
  const step = niceStep(max - min, ticks);
  return { lo: Math.floor(min / step) * step, hi: Math.ceil(max / step) * step, step };
}

export function renderSparklineSvg(values, { color = INDIGO, width = 120, height = 30 } = {}) {
  const nums = values.filter((v) => Number.isFinite(v));
  if (nums.length < 2) return '';
  const min = Math.min(...nums);
  const max = Math.max(...nums);
  const span = max - min || 1;
  const pad = 3;
  const pts = nums.map((v, i) => [pad + (i * (width - pad * 2)) / (nums.length - 1), height - pad - ((v - min) / span) * (height - pad * 2)]);
  const line = pts.map(([x, y]) => x.toFixed(1) + ',' + y.toFixed(1)).join(' ');
  const area = `${pad},${height} ${line} ${(width - pad).toFixed(1)},${height}`;
  const [ex, ey] = pts[pts.length - 1];
  return `<svg viewBox="0 0 ${width} ${height}" preserveAspectRatio="none" role="img" aria-label="Trend sparkline"><polygon points="${area}" fill="${color}" opacity="0.12"/><polyline points="${line}" fill="none" stroke="${color}" stroke-width="1.6" stroke-linejoin="round" stroke-linecap="round" vector-effect="non-scaling-stroke"/><circle cx="${ex.toFixed(1)}" cy="${ey.toFixed(1)}" r="2.4" fill="${color}"/></svg>`;
}

export function renderLineChartSvg(seriesList, years, options = {}) {
  const { width = 720, height = 300, unit = '%', yLabel = '', bands = [], title = 'Line chart', digits = 1 } = options;
  const m = { top: 24, right: 62, bottom: 52, left: 46 };
  const iw = width - m.left - m.right;
  const ih = height - m.top - m.bottom;
  const all = seriesList.flatMap((s) => s.values).filter((v) => Number.isFinite(v));
  const { lo, hi, step } = niceDomain(Math.min(...all, 0 > Math.min(...all) ? Math.min(...all) : Math.min(...all)), Math.max(...all));
  const x = (i) => m.left + (years.length === 1 ? iw / 2 : (i * iw) / (years.length - 1));
  const y = (v) => m.top + ih - ((v - lo) / (hi - lo)) * ih;
  let out = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(title)}" font-family="${FONT}" font-size="11">`;
  out += `<title>${escapeHtml(title)}</title>`;
  for (const band of bands) {
    const a = years.findIndex((yr) => yr >= band.from);
    let b = years.findIndex((yr) => yr > band.to);
    if (a < 0) continue;
    if (b < 0) b = years.length;
    const x0 = x(a) - (a > 0 ? iw / (years.length - 1) / 2 : 0);
    const x1 = x(b - 1) + (b < years.length ? iw / (years.length - 1) / 2 : 0);
    out += `<rect x="${x0.toFixed(1)}" y="${m.top}" width="${(x1 - x0).toFixed(1)}" height="${ih}" fill="${RED}" opacity="0.08"/>`;
    out += `<text x="${((x0 + x1) / 2).toFixed(1)}" y="${m.top + 10}" text-anchor="middle" fill="${RED}" font-size="9.5" font-weight="600">${escapeHtml(band.label)}</text>`;
  }
  for (let v = lo; v <= hi + step / 1e6; v += step) {
    const yy = y(v).toFixed(1);
    out += `<line x1="${m.left}" x2="${width - m.right}" y1="${yy}" y2="${yy}" stroke="${v === 0 ? INK : GRID}" stroke-width="${v === 0 ? 1 : 0.8}"/>`;
    out += `<text x="${m.left - 6}" y="${(Number(yy) + 3.5).toFixed(1)}" text-anchor="end" fill="${MUTED}">${formatNumber(v, step < 1 ? 1 : 0)}</text>`;
  }
  const every = Math.max(1, Math.ceil(years.length / 9));
  years.forEach((yr, i) => {
    if ((years.length - 1 - i) % every !== 0) return;
    out += `<text x="${x(i).toFixed(1)}" y="${m.top + ih + 15}" text-anchor="middle" fill="${MUTED}">${yr}</text>`;
  });
  if (yLabel) out += `<text x="${m.left}" y="${m.top - 10}" fill="${MUTED}" font-size="10.5">${escapeHtml(yLabel)}</text>`;
  seriesList.forEach((s, si) => {
    const color = s.color ?? (si ? RED : INDIGO);
    const pts = s.values.map((v, i) => (Number.isFinite(v) ? x(i).toFixed(1) + ',' + y(v).toFixed(1) : null)).filter(Boolean);
    out += `<polyline points="${pts.join(' ')}" fill="none" stroke="${color}" stroke-width="2" stroke-linejoin="round"${s.dashed ? ' stroke-dasharray="5 3"' : ''}/>`;
    s.values.forEach((v, i) => {
      if (!Number.isFinite(v)) return;
      out += `<circle class="pt" cx="${x(i).toFixed(1)}" cy="${y(v).toFixed(1)}" r="${i === s.values.length - 1 ? 3.5 : 2.5}" fill="${color}" stroke="#fff" stroke-width="1" data-series="${escapeHtml(s.name)}" data-year="${years[i]}" data-value="${v}" data-unit="${escapeHtml(unit)}" data-color="${color}"><title>${escapeHtml(s.name)} ${years[i]}: ${formatNumber(v, digits)}${escapeHtml(unit)}</title></circle>`;
    });
    const last = s.values.length - 1;
    if (Number.isFinite(s.values[last])) {
      const ly = Math.min(Math.max(y(s.values[last]), m.top + 8), m.top + ih - 8);
      const label = formatNumber(s.values[last], digits) + unit;
      out += `<rect x="${(x(last) + 7).toFixed(1)}" y="${(ly - 8).toFixed(1)}" width="${label.length * 6.4 + 8}" height="16" rx="2" fill="${color}"/><text x="${(x(last) + 11).toFixed(1)}" y="${(ly + 3.5).toFixed(1)}" fill="#fff" font-weight="700" font-size="10.5">${escapeHtml(label)}</text>`;
    }
  });
  let lx = m.left;
  const ly = height - 12;
  seriesList.forEach((s, si) => {
    const color = s.color ?? (si ? RED : INDIGO);
    out += `<line x1="${lx}" x2="${lx + 18}" y1="${ly - 4}" y2="${ly - 4}" stroke="${color}" stroke-width="2.5"${s.dashed ? ' stroke-dasharray="5 3"' : ''}/><text x="${lx + 23}" y="${ly}" fill="${INK}">${escapeHtml(s.name)}</text>`;
    lx += 36 + s.name.length * 6.2;
  });
  return out + '</svg>';
}


export function renderPopulationPyramidSvg(bands, options = {}) {
  const { width = 460, height = 320, title = 'Population pyramid', maleLabel = 'Male', femaleLabel = 'Female', currentYear = 2025, referenceYear = 2000 } = options;
  const m = { top: 30, right: 14, bottom: 40, left: 14 };
  const cx = width / 2;
  const half = cx - m.left - 20;
  const maxVal = Math.max(...bands.flatMap((b) => [b.male, b.female, b.male2000, b.female2000]));
  const { hi, step } = niceDomain(0, maxVal, 4);
  const sx = (v) => (v / hi) * half;
  const rowH = (height - m.top - m.bottom) / bands.length;
  const rows = bands.slice().reverse();
  let out = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="${escapeHtml(title)}" font-family="${FONT}" font-size="10.5"><title>${escapeHtml(title)}</title>`;
  for (let v = 0; v <= hi + 1e-9; v += step) {
    for (const dir of [-1, 1]) {
      if (v === 0 && dir === 1) continue;
      const xx = cx + dir * sx(v);
      out += `<line x1="${xx.toFixed(1)}" x2="${xx.toFixed(1)}" y1="${m.top}" y2="${height - m.bottom}" stroke="${GRID}" stroke-width="0.8"/>`;
      out += `<text x="${xx.toFixed(1)}" y="${height - m.bottom + 13}" text-anchor="middle" fill="${MUTED}">${formatNumber(v)}%</text>`;
    }
  }
  rows.forEach((b, i) => {
    const top = m.top + i * rowH;
    const bh = rowH * 0.66;
    const by = top + (rowH - bh) / 2;
    const mw = sx(b.male);
    const fw = sx(b.female);
    out += `<g data-band="${escapeHtml(b.label)}"><rect x="${(cx - mw).toFixed(1)}" y="${by.toFixed(1)}" width="${mw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${INDIGO}"><title>${escapeHtml(b.label)} ${maleLabel} ${currentYear}: ${formatNumber(b.male, 2)}%</title></rect>`;
    out += `<rect x="${cx}" y="${by.toFixed(1)}" width="${fw.toFixed(1)}" height="${bh.toFixed(1)}" fill="${RED}"><title>${escapeHtml(b.label)} ${femaleLabel} ${currentYear}: ${formatNumber(b.female, 2)}%</title></rect>`;
    out += `<rect x="${(cx - sx(b.male2000)).toFixed(1)}" y="${by.toFixed(1)}" width="${sx(b.male2000).toFixed(1)}" height="${bh.toFixed(1)}" fill="none" stroke="${INK}" stroke-width="1.1" stroke-dasharray="3 2"/>`;
    out += `<rect x="${cx}" y="${by.toFixed(1)}" width="${sx(b.female2000).toFixed(1)}" height="${bh.toFixed(1)}" fill="none" stroke="${INK}" stroke-width="1.1" stroke-dasharray="3 2"/>`;
    out += `<text x="${cx}" y="${(by + bh / 2 + 3.5).toFixed(1)}" text-anchor="middle" fill="${INK}" font-weight="700" paint-order="stroke" stroke="#fff" stroke-width="3">${escapeHtml(b.label)}</text></g>`;
  });
  out += `<text x="${m.left}" y="14" fill="${INDIGO}" font-weight="700">◀ ${escapeHtml(maleLabel)}</text><text x="${width - m.right}" y="14" text-anchor="end" fill="${RED}" font-weight="700">${escapeHtml(femaleLabel)} ▶</text>`;
  out += `<text x="${cx}" y="14" text-anchor="middle" fill="${MUTED}">% of total population</text>`;
  const ly = height - 6;
  out += `<rect x="${m.left}" y="${ly - 9}" width="12" height="9" fill="${INDIGO}"/><rect x="${m.left + 12}" y="${ly - 9}" width="12" height="9" fill="${RED}"/><text x="${m.left + 30}" y="${ly}" fill="${INK}">${currentYear}</text>`;
  out += `<rect x="${m.left + 72}" y="${ly - 9}" width="24" height="9" fill="none" stroke="${INK}" stroke-dasharray="3 2"/><text x="${m.left + 102}" y="${ly}" fill="${INK}">${referenceYear} reference</text>`;

  return out + '</svg>';
}
export function renderGroupedBarSvg(items, options = {}) {
  const { width = 520, height = 0, orientation = 'horizontal', unit = '', digits = 1, color = INDIGO, title = 'Bar chart' } = options;
  const max = Math.max(...items.map((it) => Math.abs(it.value)), 1e-9);
  const min = Math.min(0, ...items.map((it) => it.value));
  const colorFor = (it, i) => it.color ?? (i % 2 && options.alternate ? RED : color);
  if (orientation === 'vertical') {
    const h = height || 260;
    const m = { top: 20, right: 10, bottom: 34, left: 10 };
    const slot = (width - m.left - m.right) / items.length;
    const scale = (h - m.top - m.bottom) / (max - min);
    const zero = m.top + max * scale;
    let out = `<svg viewBox="0 0 ${width} ${h}" role="img" aria-label="${escapeHtml(title)}" font-family="${FONT}" font-size="11"><title>${escapeHtml(title)}</title><line x1="${m.left}" x2="${width - m.right}" y1="${zero}" y2="${zero}" stroke="${INK}"/>`;
    items.forEach((it, i) => {
      const bh = Math.abs(it.value) * scale;
      const bx = m.left + i * slot + slot * 0.15;
      const by = it.value >= 0 ? zero - bh : zero;
      out += `<rect x="${bx.toFixed(1)}" y="${by.toFixed(1)}" width="${(slot * 0.7).toFixed(1)}" height="${bh.toFixed(1)}" fill="${colorFor(it, i)}"><title>${escapeHtml(it.label)}: ${formatNumber(it.value, digits)}${escapeHtml(unit)}</title></rect>`;
      out += `<text x="${(bx + slot * 0.35).toFixed(1)}" y="${(it.value >= 0 ? by - 4 : by + bh + 11).toFixed(1)}" text-anchor="middle" fill="${INK}" font-weight="600">${formatNumber(it.value, digits)}${escapeHtml(unit)}</text>`;
      out += `<text x="${(bx + slot * 0.35).toFixed(1)}" y="${h - 12}" text-anchor="middle" fill="${MUTED}">${escapeHtml(it.label)}</text>`;
    });
    return out + '</svg>';
  }
  const rowH = 24;
  const h = height || items.length * rowH + 12;
  const labelW = 112;
  const valueW = 64;
  const plotW = width - labelW - valueW;
  let out = `<svg viewBox="0 0 ${width} ${h}" role="img" aria-label="${escapeHtml(title)}" font-family="${FONT}" font-size="11.5"><title>${escapeHtml(title)}</title>`;
  items.forEach((it, i) => {
    const yy = 6 + i * rowH;
    const bw = (Math.abs(it.value) / max) * plotW;
    out += `<text x="${labelW - 8}" y="${yy + 13}" text-anchor="end" fill="${INK}">${escapeHtml(it.label)}</text><rect x="${labelW}" y="${yy + 3}" width="${bw.toFixed(1)}" height="${rowH - 9}" fill="${colorFor(it, i)}"><title>${escapeHtml(it.label)}: ${formatNumber(it.value, digits)}${escapeHtml(unit)}</title></rect><text x="${(labelW + bw + 6).toFixed(1)}" y="${yy + 14}" fill="${INK}" font-weight="600">${formatNumber(it.value, digits)}${escapeHtml(unit)}</text>`;
  });
  return out + '</svg>';
}

const REGION_FILL = { Hokkaido: '#18385A', Tohoku: '#1E6B52', Kanto: '#C63D2F', Chubu: '#8A6D1F', Kinki: '#6B3F86', Chugoku: '#2F6F8A', Shikoku: '#9A5B1E', Kyushu: '#4A5568' };

export const CARTOGRAM_GRID = {
  HKD: [14, 0], AOM: [14, 2], AKT: [13, 3], IWT: [14, 3], YGT: [13, 4], MYG: [14, 4],
  NGT: [12, 5], TCG: [13, 5], FKS: [14, 5], TYM: [11, 6], GNM: [12, 6], SIT: [13, 6], IBR: [14, 6],
  ISK: [10, 6], FKI: [9, 7], GIF: [10, 7], NGN: [11, 7], YMN: [12, 7], TKY: [13, 7], CHB: [14, 7],
  SHG: [9, 8], AIC: [10, 8], SZO: [12, 8], KNG: [13, 8],
  SMN: [4, 9], TTR: [5, 9], HYG: [6, 9], KYT: [7, 9], NAR: [8, 9], MIE: [9, 9],
  YGC: [3, 10], HRS: [4, 10], OKY: [5, 10], OSK: [7, 10], WKY: [8, 10],
  FUK: [2, 10], SAG: [1, 10], NGS: [0, 10],
  EHM: [5, 11], KGW: [6, 11], TKS: [7, 11], KMM: [1, 11], OIT: [2, 11],
  KOC: [6, 12], MYZ: [2, 12], KGS: [1, 12], OKN: [0, 12],
};

function shade(t) {
  const from = [230, 235, 241];
  const mid = [143, 166, 190];
  const to = [24, 56, 90];
  const [a, b, f] = t < 0.5 ? [from, mid, t * 2] : [mid, to, (t - 0.5) * 2];
  return a.map((c, i) => Math.round(c + (b[i] - c) * f));
}

export function renderJapanCartogramSvg(prefectures, metricKey, selectedCode, compareCode, scale = {}) {
  const cell = 34;
  const cols = 16;
  const rows = 13;
  const width = cols * cell;
  const height = rows * cell;
  const values = prefectures.map((p) => p[metricKey]).filter((v) => Number.isFinite(v));
  const lo = scale.min ?? Math.min(...values);
  const hi = scale.max ?? Math.max(...values);
  const fmt = scale.format ?? ((v) => formatNumber(v, hi < 20 ? 1 : 0));
  let out = `<svg viewBox="0 0 ${width} ${height}" role="img" aria-label="Tile cartogram of 47 prefectures" font-family="${FONT}">`;
  for (const p of prefectures) {
    const pos = CARTOGRAM_GRID[p.code];
    if (!pos) continue;
    const v = p[metricKey];
    const t = Number.isFinite(v) && hi > lo ? (v - lo) / (hi - lo) : 0;
    const [r, g, b] = shade(Math.max(0, Math.min(1, t)));
    const light = t < 0.55;
    const tx = pos[0] * cell;
    const ty = pos[1] * cell;
    const ring = p.code === selectedCode ? ` stroke="${RED}" stroke-width="3"` : p.code === compareCode ? ` stroke="#1E6B52" stroke-width="3" stroke-dasharray="4 2"` : ` stroke="${REGION_FILL[p.region] ?? '#999'}" stroke-width="1.2"`;
    out += `<g data-pref="${escapeHtml(p.code)}" tabindex="0" role="button" aria-label="${escapeHtml(p.name ?? p.code)} ${Number.isFinite(v) ? fmt(v) : ''}"><rect x="${tx + 1.5}" y="${ty + 1.5}" width="${cell - 3}" height="${cell - 3}" rx="2" fill="rgb(${r},${g},${b})"${ring}/>`;
    out += `<text x="${tx + cell / 2}" y="${ty + 15}" text-anchor="middle" font-size="9.5" font-weight="700" fill="${light ? INK : '#fff'}">${escapeHtml(p.code)}</text>`;
    out += `<text x="${tx + cell / 2}" y="${ty + 27}" text-anchor="middle" font-size="9" fill="${light ? INK : '#fff'}">${Number.isFinite(v) ? escapeHtml(fmt(v)) : '–'}</text><title>${escapeHtml(p.name ?? p.code)}: ${Number.isFinite(v) ? escapeHtml(fmt(v)) : 'n/a'}</title></g>`;
  }
  const ranked = prefectures.filter((p) => Number.isFinite(p[metricKey])).sort((a, b) => b[metricKey] - a[metricKey]);
  if (ranked.length) {
    const top = ranked[0];
    const bottom = ranked[ranked.length - 1];
    const avg = scale.average ?? values.reduce((sum, v) => sum + v, 0) / values.length;
    const rowsOut = [['Japan average', fmt(avg)], ['Highest', `${top.name ?? top.code} ${fmt(top[metricKey])}`], ['Lowest', `${bottom.name ?? bottom.code} ${fmt(bottom[metricKey])}`], ['Spread', fmt(top[metricKey] - bottom[metricKey])]];
    out += `<g aria-label="National extremes"><rect x="10" y="10" width="230" height="130" rx="3" fill="#F7F6F2" stroke="#DDD7CC"/><text x="22" y="30" font-size="10" font-weight="700" fill="${INK}" letter-spacing=".6">NATIONAL EXTREMES</text>`;
    rowsOut.forEach(([label, text], index) => {
      const y = 54 + index * 24;
      out += `<text x="22" y="${y}" font-size="10" fill="#556070">${label}</text><text x="228" y="${y}" text-anchor="end" font-size="11" font-weight="700" fill="${index === 1 ? RED : INK}">${escapeHtml(text)}</text><line x1="22" y1="${y + 7}" x2="228" y2="${y + 7}" stroke="#DDD7CC" stroke-width=".6"/>`;
    });
    out += '</g>';
  }
  return out + '</svg>';
}