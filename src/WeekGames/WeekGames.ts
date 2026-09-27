import {
  EXT_GAMES_ATTR,
  PlayerListTable,
  findPlayerListTables,
  findTransfersTables,
} from "../locators";
import {
  buildWeek,
  findGameweekPhase,
  gameDays,
  loadWeekData,
} from "../schedule";

const HEADER = "Days";

// The list uses a fixed table layout, so the header sets the column width
// Sized for up to 4 game days in each week ("1,3,5,6/1,3,5,6")
const STYLES = {
  HEADER: "width: 80px; white-space: nowrap;",
  CELL: "white-space: nowrap; font-size: 12px; padding-left: 2px; padding-right: 2px;",
};

type TeamDays = (teamCode: number) => string;

const formatDays = (days: number[] | undefined) => days?.join(",") || "-";

// "4,6/2,3,7": remaining game days this gameweek / game days next gameweek
export const loadTeamDays = async (gameweek: number): Promise<TeamDays> => {
  const now = Date.now();
  const current = await loadWeekData(gameweek);
  const remaining = gameDays(
    buildWeek(current.bootstrap, current.fixtures, gameweek, now),
    { remainingOnly: true }
  );

  if (!findGameweekPhase(current.bootstrap, gameweek + 1)) {
    return (code) => formatDays(remaining.get(code));
  }

  const next = await loadWeekData(gameweek + 1);
  const upcoming = gameDays(
    buildWeek(next.bootstrap, next.fixtures, gameweek + 1, now)
  );
  return (code) =>
    `${formatDays(remaining.get(code))}/${formatDays(upcoming.get(code))}`;
};

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
  teamDays: TeamDays
) => {
  const { headerRow, before, stat } = table;
  if (!headerRow.querySelector(`[${EXT_GAMES_ATTR}]`)) {
    const th = newCell(stat, HEADER, STYLES.HEADER);
    th.title = `Game days left in gameweek ${gameweek} / game days in gameweek ${gameweek + 1}`;
    headerRow.insertBefore(th, before);
  }

  table.rows.forEach(({ row, teamCode, before, stat }) => {
    const text = teamCode === null ? "" : teamDays(teamCode);
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
  let teamDays: TeamDays;
  try {
    teamDays = await loadTeamDays(gameweek);
  } catch {
    return;
  }

  // The DOM may have changed while loading
  findPlayerListTables().forEach((table) => render(table, gameweek, teamDays));
};
