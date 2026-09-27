import {
  EXT_GAMES_ATTR,
  PlayerListTable,
  findPlayerListTables,
  findTransfersTables,
} from "../locators";
import { GameCount, buildWeek, countGames, loadWeekData } from "../schedule";

const HEADER = "Gms";

// The list uses a fixed table layout, so the header sets the column width
const STYLES = {
  HEADER: "width: 40px; white-space: nowrap;",
  CELL: "white-space: nowrap;",
};

export const formatGames = ({ remaining, total }: GameCount) =>
  `${remaining}(${total})`;

const newCell = (
  template: HTMLTableCellElement,
  text: string,
  style: string
) => {
  const cell = template.cloneNode(false) as HTMLTableCellElement;
  cell.setAttribute(EXT_GAMES_ATTR, "");
  cell.setAttribute("style", style);
  cell.textContent = text;
  return cell;
};

const render = (
  table: PlayerListTable,
  gameweek: number,
  counts: Map<number, GameCount>
) => {
  const { headerRow, before, stat } = table;
  if (!headerRow.querySelector(`[${EXT_GAMES_ATTR}]`)) {
    const th = newCell(stat, HEADER, STYLES.HEADER);
    th.title = `Games remaining (total) in gameweek ${gameweek}`;
    headerRow.insertBefore(th, before);
  }

  table.rows.forEach(({ row, teamCode, before, stat }) => {
    const text =
      teamCode === null
        ? ""
        : formatGames(counts.get(teamCode) ?? { remaining: 0, total: 0 });
    const existing = row.querySelector(`[${EXT_GAMES_ATTR}]`);
    if (existing) {
      // Rows are reused when the list is filtered or paged
      if (existing.textContent !== text) existing.textContent = text;
      return;
    }
    row.insertBefore(newCell(stat, text, STYLES.CELL), before);
  });
};

export const ShowWeekGames = async () => {
  const [transfers] = findTransfersTables();
  if (!transfers || !findPlayerListTables().length) return;

  const { gameweek } = transfers;
  let counts: Map<number, GameCount>;
  try {
    const { bootstrap, fixtures } = await loadWeekData(gameweek);
    counts = countGames(buildWeek(bootstrap, fixtures, gameweek));
  } catch {
    return;
  }

  // The DOM may have changed while loading
  findPlayerListTables().forEach((table) => render(table, gameweek, counts));
};
