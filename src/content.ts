import { calculateDiff, formatNumber } from './utils/numbers';

const addDiffColumn = () => {
  // Find table
  const table = document.querySelector('.Table-sc-g4vec0-1');
  if (!table) return;

  // Add header
  const headerRow = table.querySelector('thead tr');
  if (headerRow) {
    const th = document.createElement('th');
    th.textContent = 'Diff';
    headerRow.appendChild(th);
  }

  // Get all rows
  const rows = table.querySelectorAll('tbody tr');
  if (!rows.length) return;

  // Get top score from first row
  const topScore = parseFloat(rows[0].querySelector('td:nth-child(4)')?.textContent || '0');

  // Add diff to each row
  rows.forEach((row) => {
    const score = parseFloat(row.querySelector('td:nth-child(4)')?.textContent || '0');
    const diff = calculateDiff(topScore, score);

    const td = document.createElement('td');
    td.textContent = formatNumber(diff);
    row.appendChild(td);
  });
};

// Run when DOM is ready
if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', addDiffColumn);
} else {
  addDiffColumn();
}
