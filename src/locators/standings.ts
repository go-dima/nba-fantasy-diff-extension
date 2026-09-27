export type StandingsRow = {
  row: HTMLTableRowElement;
  score: number;
};

export type StandingsTable = {
  table: HTMLTableElement;
  headerRow: HTMLTableRowElement;
  rows: StandingsRow[];
};

const SCORE_HEADER = "TOT";

const parseScore = (text: string | null | undefined): number =>
  parseFloat(text?.replace(/,/g, "") || "0") || 0;

export const findStandingsTable = (
  root: ParentNode = document
): StandingsTable | null => {
  for (const table of Array.from(root.querySelectorAll("table"))) {
    const headerRow = table.querySelector<HTMLTableRowElement>("thead tr");
    if (!headerRow) continue;

    const scoreIndex = Array.from(headerRow.cells).findIndex(
      (th) => th.textContent?.trim() === SCORE_HEADER
    );
    if (scoreIndex === -1) continue;

    const rows = Array.from(
      table.querySelectorAll<HTMLTableRowElement>("tbody tr")
    ).map((row) => ({
      row,
      score: parseScore(row.cells[scoreIndex]?.textContent),
    }));

    return { table, headerRow, rows };
  }

  return null;
};
