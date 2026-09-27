// Cells added by the extension carry this attribute so they are never
// mistaken for the site's own columns.
export const EXT_GAMES_ATTR = "data-nbafx-games";

const PRICE_HEADER = "$";

export type PlayerListRow = {
  row: HTMLTableRowElement;
  teamCode: number | null;
  // The site's trailing (add player button) cell; new cells go before it
  before: HTMLTableCellElement;
  // The sort-stat cell ("**" column), used as a style template
  stat: HTMLTableCellElement;
};

export type PlayerListTable = {
  headerRow: HTMLTableRowElement;
  before: HTMLTableCellElement;
  stat: HTMLTableCellElement;
  rows: PlayerListRow[];
};

const siteCells = (row: HTMLTableRowElement) =>
  Array.from(row.cells).filter((cell) => !cell.hasAttribute(EXT_GAMES_ATTR));

// The "Player Selection" list on /transfers: header is
// [ ] [Front Court] [$] [**] [ ]
export const findPlayerListTables = (
  root: ParentNode = document
): PlayerListTable[] => {
  const tables: PlayerListTable[] = [];

  root.querySelectorAll("table").forEach((table) => {
    const headerRow = table.querySelector<HTMLTableRowElement>("thead tr");
    if (!headerRow) return;

    const headers = siteCells(headerRow);
    const priceIndex = headers.findIndex(
      (th) => th.textContent?.trim() === PRICE_HEADER
    );
    if (priceIndex === -1 || priceIndex + 2 !== headers.length - 1) return;

    const rows = Array.from(
      table.querySelectorAll<HTMLTableRowElement>("tbody tr")
    ).flatMap((row) => {
      const cells = siteCells(row);
      if (cells.length !== headers.length) return [];
      const code = row.querySelector("p[code]")?.getAttribute("code");
      return [
        {
          row,
          teamCode: code ? Number(code) : null,
          before: cells[cells.length - 1],
          stat: cells[cells.length - 2],
        },
      ];
    });

    tables.push({
      headerRow,
      before: headers[headers.length - 1],
      stat: headers[headers.length - 2],
      rows,
    });
  });

  return tables;
};
