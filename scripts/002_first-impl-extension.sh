#!/bin/bash

# Create utils directory
mkdir -p src/utils

# Update content.ts
cat > src/content.ts << EOF
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
EOF

# Create utils/numbers.ts
cat > src/utils/numbers.ts << EOF
export const calculateDiff = (topScore: number, currentScore: number): number => {
  return topScore - currentScore;
};

export const formatNumber = (num: number): string => {
  return num.toFixed(1);
};
EOF

# Update manifest.json
cat > public/manifest.json << EOF
{
  "manifest_version": 3,
  "name": "Table Diff Extension",
  "version": "1.0.0",
  "description": "Adds difference column to tables",
  "permissions": ["activeTab"],
  "content_scripts": [
    {
      "matches": ["<all_urls>"],
      "js": ["src/content.ts"],
      "css": ["src/styles.css"]
    }
  ]
}
EOF

# Create basic styles
cat > src/styles.css << EOF
/* Match existing table styles */
.Table-sc-g4vec0-1 td:last-child,
.Table-sc-g4vec0-1 th:last-child {
  text-align: right;
  padding: 8px;
}
EOF

echo "Files updated successfully!"