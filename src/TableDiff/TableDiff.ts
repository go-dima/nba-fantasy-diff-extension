import { findStandingsTable } from "../locators";
import {
  calculateDiff as CalculateDiff,
  formatNumber as FormatNumber,
} from "./numbers";

export const AddDiffColumn = () => {
  const standings = findStandingsTable();
  if (!standings) return;

  const { headerRow, rows } = standings;
  if (headerRow.querySelector("th:last-child")?.textContent === "Diff") return;

  // Add header
  const th = document.createElement("th");
  th.textContent = "Diff";
  headerRow.appendChild(th);

  if (!rows.length) return;

  // Get top score from first row
  const topScore = rows[0].score;

  // Add diff to each row
  rows.forEach(({ row, score }) => {
    const diff = CalculateDiff(topScore, score);

    const td = document.createElement("td");
    td.textContent = FormatNumber(diff);
    row.appendChild(td);
  });
};
