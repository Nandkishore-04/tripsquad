export const MONTHS = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];
export const WEEKDAYS = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

export const dateKey = (y, m, d) =>
  `${y}-${String(m + 1).padStart(2, '0')}-${String(d).padStart(2, '0')}`;

export const todayKey = () => {
  const t = new Date();
  return dateKey(t.getFullYear(), t.getMonth(), t.getDate());
};

export function monthMatrix(year, month) {
  const first = new Date(year, month, 1).getDay();
  const days = new Date(year, month + 1, 0).getDate();
  const cells = [];
  for (let i = 0; i < first; i++) cells.push(null);
  for (let d = 1; d <= days; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);
  return cells;
}

export function prettyDate(key) {
  const [y, m, d] = key.split('-').map(Number);
  return `${MONTHS[m - 1].slice(0, 3)} ${d}, ${y}`;
}

export function daysUntil(key) {
  const [y, m, d] = key.split('-').map(Number);
  const target = new Date(y, m - 1, d);
  const now = new Date();
  now.setHours(0, 0, 0, 0);
  return Math.round((target - now) / 86400000);
}

// Days where the most squad members are free, soonest first on ties.
export function bestDates(availability, memberIds, topN = 3) {
  const counts = {};
  for (const id of memberIds) {
    for (const key of availability[id] || []) {
      counts[key] = (counts[key] || 0) + 1;
    }
  }
  const today = todayKey();
  return Object.entries(counts)
    .filter(([key]) => key >= today)
    .sort((a, b) => b[1] - a[1] || (a[0] < b[0] ? -1 : 1))
    .slice(0, topN)
    .map(([key, count]) => ({ key, count }));
}
