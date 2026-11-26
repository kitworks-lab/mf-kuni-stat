export function escapeHtml(value) {
  return String(value ?? '').replace(/[&<>"']/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' })[ch]);
}

export function formatNumber(value, digits = 0) {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '–';
  return Number(value).toLocaleString('en-US', { minimumFractionDigits: digits, maximumFractionDigits: digits });
}

export function formatSigned(value, digits = 1, suffix = '') {
  if (value === null || value === undefined || Number.isNaN(Number(value))) return '–';
  const num = Number(value);
  const sign = num > 0 ? '+' : num < 0 ? '−' : '';
  return sign + formatNumber(Math.abs(num), digits) + suffix;
}

export function formatDelta(value, unit = '%', digits = 1) {
  const label = unit === 'pp' ? 'pp' : unit;
  return formatSigned(value, digits, label);
}

export function toCsv(rows, columns) {
  const cols = columns ?? (rows.length ? Object.keys(rows[0]) : []);
  const cell = (v) => {
    const text = v === null || v === undefined ? '' : String(v);
    return /[",\n\r]/.test(text) ? '"' + text.replace(/"/g, '""') + '"' : text;
  };
  return [cols.map(cell).join(','), ...rows.map((row) => cols.map((col) => cell(row[col])).join(','))].join('\r\n') + '\r\n';
}

export function downloadTextFile(filename, text, mime = 'text/plain') {
  const blob = new Blob([text], { type: mime + ';charset=utf-8' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}