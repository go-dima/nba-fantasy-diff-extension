import {
  calculateDiff as CalculateDiff,
  formatNumber as FormatNumber,
} from "./numbers";

export const AddDiffColumn = () => {
  // Find tables that contain StandingsRow using attribute selector
  const standingsRow = document.querySelector('[class^="StandingsRow-"]');
  if (!standingsRow) return;

  // Get the parent table
  const table = standingsRow.closest(".Table-sc-g4vec0-1");
  if (!table || table.querySelector("th:last-child")?.textContent === "Diff")
    return;

  // Add header
  const headerRow = table.querySelector("thead tr");
  if (headerRow) {
    const th = document.createElement("th");
    th.textContent = "Diff";
    headerRow.appendChild(th);
  }

  // Get all rows using the same attribute selector
  const rows = table.querySelectorAll('[class^="StandingsRow-"]');
  if (!rows.length) return;

  // Get top score from first row
  const topScoreCell = rows[0].querySelector("td:nth-child(4)");
  const topScore = parseFloat(
    topScoreCell?.textContent?.replace(/,/g, "") || "0"
  );

  // Add diff to each row
  rows.forEach((row) => {
    const scoreCell = row.querySelector("td:nth-child(4)");
    const score = parseFloat(scoreCell?.textContent?.replace(/,/g, "") || "0");
    const diff = CalculateDiff(topScore, score);

    const td = document.createElement("td");
    td.textContent = FormatNumber(diff);
    row.appendChild(td);
  });
};
