// Cells added by the extension carry this attribute so they are never
// mistaken for the site's own columns.
export const EXT_DAY_ATTR = "data-nbafx-day";
// Header row added by the extension above the site's header row
export const EXT_NAV_ATTR = "data-nbafx-nav";

const DAY_HEADER = /^GW(\d+)\.\d+$/;

export type TransfersRow = {
  row: HTMLTableRowElement;
  teamCode: number | null;
};

export type TransfersTable = {
  head: HTMLTableSectionElement;
  headerRow: HTMLTableRowElement;
  // The extension's nav row, when already added (goes before headerRow)
  navRow: HTMLTableRowElement | null;
  gameweek: number;
  // Indexes of the site's own "GWx.y" columns
  siteDayColumns: number[];
  // The site's other (non-day) header cells, which precede the days
  otherHeaders: HTMLTableCellElement[];
  rows: TransfersRow[];
  templates: {
    header: HTMLTableCellElement;
    cell: HTMLTableCellElement | null;
    logo: HTMLImageElement | null;
    noGame: Element | null;
  };
};

// Logos the site shows for teams, by NBA team code
export const teamLogoUrl = (code: number) =>
  `//cdn.nba.com/logos/nba/${code}/global/L/logo.svg`;

// The table has a fixed layout with percentage column widths (e.g. 12% per
// day). Only readable once the site's day headers are hidden: a hidden
// cell's computed width is its specified one.
export const dayColumnWidth = (table: TransfersTable): string | null => {
  const width = getComputedStyle(table.templates.header).width;
  return width.endsWith("%") ? width : null;
};

const isSiteCell = (cell: Element) => !cell.hasAttribute(EXT_DAY_ATTR);

export const findTransfersTables = (
  root: ParentNode = document
): TransfersTable[] => {
  const tables: TransfersTable[] = [];

  root.querySelectorAll("table").forEach((table) => {
    const headerRow = table.querySelector<HTMLTableRowElement>(
      `thead tr:not([${EXT_NAV_ATTR}])`
    );
    if (!headerRow) return;

    const cells = Array.from(headerRow.cells);
    const siteDayColumns = cells
      .map((th, index) => ({ th, index }))
      .filter(({ th }) => isSiteCell(th) && DAY_HEADER.test(th.textContent?.trim() ?? ""))
      .map(({ index }) => index);
    if (!siteDayColumns.length) return;

    const header = cells[siteDayColumns[0]];
    const gameweek = Number(header.textContent!.trim().match(DAY_HEADER)![1]);

    const rows = Array.from(
      table.querySelectorAll<HTMLTableRowElement>("tbody tr")
    ).map((row) => {
      const code = row.querySelector("p[code]")?.getAttribute("code");
      return { row, teamCode: code ? Number(code) : null };
    });

    const dayCells = rows.flatMap(({ row }) =>
      siteDayColumns.map((index) => row.cells[index]).filter(Boolean)
    );

    tables.push({
      head: headerRow.parentElement as HTMLTableSectionElement,
      headerRow,
      navRow: table.querySelector<HTMLTableRowElement>(
        `thead tr[${EXT_NAV_ATTR}]`
      ),
      gameweek,
      siteDayColumns,
      otherHeaders: cells.filter(
        (th, index) => isSiteCell(th) && !siteDayColumns.includes(index)
      ),
      rows,
      templates: {
        header,
        cell: dayCells[0] ?? null,
        logo:
          dayCells
            .map((cell) => cell.querySelector("img"))
            .find((img) => img !== null) ?? null,
        noGame:
          dayCells
            .map((cell) => cell.querySelector("svg"))
            .find((svg) => svg !== null) ?? null,
      },
    });
  });

  return tables;
};
