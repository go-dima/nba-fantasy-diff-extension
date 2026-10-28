const DAY_HEADER = /^GW(\d+)\.\d+$/;

export type PlayerScheduleTable = {
  gameweek: number;
  // Body cells of each column, keyed by the column's "GWx.y" label
  columns: Map<string, HTMLTableCellElement[]>;
};

// The player view's gameweek table: every header cell is a "GWx.y" day
export const findPlayerScheduleTables = (
  root: ParentNode = document
): PlayerScheduleTable[] => {
  const tables: PlayerScheduleTable[] = [];

  root.querySelectorAll("table").forEach((table) => {
    const headerRow = table.querySelector<HTMLTableRowElement>("thead tr");
    if (!headerRow) return;
    const labels = Array.from(headerRow.cells).map((th) => th.textContent?.trim() ?? "");
    if (!labels.length || !labels.every((label) => DAY_HEADER.test(label))) return;

    const rows = Array.from(table.querySelectorAll<HTMLTableRowElement>("tbody tr"));
    tables.push({
      gameweek: Number(labels[0].match(DAY_HEADER)![1]),
      columns: new Map(
        labels.map((label, index) => [
          label,
          rows.map((row) => row.cells[index]).filter(Boolean),
        ])
      ),
    });
  });

  return tables;
};
