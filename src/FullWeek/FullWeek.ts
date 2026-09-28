import { EXT_DAY_ATTR, TransfersTable, findTransfersTables } from "../locators";
import {
  DAYS_PER_WEEK,
  Day,
  buildWeek,
  findGameweekPhase,
  loadWeekData,
} from "../schedule";
import { NavState, renderNav } from "./nav";

// "<gameweek>:<team code>" the row's cells were rendered for
const EXT_KEY_ATTR = "data-nbafx-key";

// Gameweeks ahead (+) or behind (-) the site's current one
let offset = 0;
// Only the latest render may touch the DOM
let latestRun = 0;

const STYLES = {
  PAST_DAY: "filter: grayscale(100%) opacity(50%);",
  MISSING_DAY: "text-decoration: line-through; opacity: 50%;",
};

const logoUrl = (code: number) =>
  `//cdn.nba.com/logos/nba/${code}/global/L/logo.svg`;

// Grey "x" in the style of the site's no-game dash, for days outside the gameweek
const noDayMark = () => {
  const template = document.createElement("template");
  template.innerHTML = `<svg width="11" height="11" viewBox="0 0 11 11" fill="none" xmlns="http://www.w3.org/2000/svg"><path d="M1 1L10 10M10 1L1 10" stroke="#7A7A7A" stroke-width="2"/></svg>`;
  return template.content.firstChild!;
};

const dayStyle = (day: Day) =>
  !day.exists ? STYLES.MISSING_DAY : day.past ? STYLES.PAST_DAY : "";

const hide = (cell: HTMLElement | undefined) => {
  if (cell && cell.style.display !== "none") cell.style.display = "none";
};

const renderHeader = (table: TransfersTable, week: Day[]) => {
  const { headerRow, templates } = table;
  let own = Array.from(headerRow.querySelectorAll<HTMLElement>(`[${EXT_DAY_ATTR}]`));
  if (!own.length) {
    own = week.map((_, i) => {
      const th = templates.header.cloneNode(false) as HTMLTableCellElement;
      th.setAttribute(EXT_DAY_ATTR, String(i + 1));
      headerRow.appendChild(th);
      return th;
    });
  }

  week.forEach((day, i) => {
    const style = dayStyle(day);
    if (own[i].textContent !== day.label) own[i].textContent = day.label;
    if ((own[i].getAttribute("style") ?? "") !== style) own[i].setAttribute("style", style);
  });
};

const renderCell = (table: TransfersTable, day: Day, teamCode: number | null) => {
  const { templates } = table;
  const td = (templates.cell?.cloneNode(false) ??
    document.createElement("td")) as HTMLTableCellElement;
  td.setAttribute("style", dayStyle(day));
  if (!day.exists) {
    td.append(noDayMark());
    return td;
  }
  if (teamCode === null) return td;

  const opponents = day.opponents.get(teamCode) ?? [];
  if (!opponents.length) {
    td.append(templates.noGame?.cloneNode(true) ?? "-");
  }
  opponents.forEach(({ code, name }) => {
    const img = (templates.logo?.cloneNode(false) ??
      Object.assign(document.createElement("img"), { width: 30 })) as HTMLImageElement;
    img.src = logoUrl(code);
    img.alt = name;
    td.append(img);
  });
  return td;
};

const renderRows = (table: TransfersTable, gameweek: number, week: Day[]) => {
  table.rows.forEach(({ row, teamCode }) => {
    const key = `${gameweek}:${teamCode}`;
    const own = row.querySelectorAll(`[${EXT_DAY_ATTR}]`);
    if (own.length && own[0].getAttribute(EXT_KEY_ATTR) === key) return;
    own.forEach((cell) => cell.remove());

    week.forEach((day, i) => {
      const td = renderCell(table, day, teamCode);
      td.setAttribute(EXT_DAY_ATTR, String(i + 1));
      td.setAttribute(EXT_KEY_ATTR, key);
      row.appendChild(td);
    });
  });
};

const render = (table: TransfersTable, gameweek: number, week: Day[]) => {
  table.siteDayColumns.forEach((index) => {
    hide(table.headerRow.cells[index]);
    table.rows.forEach(({ row }) => hide(row.cells[index]));
  });
  renderHeader(table, week);
  renderRows(table, gameweek, week);
};

const navigate = (to: (offset: number) => number) => {
  offset = to(offset);
  void ShowFullWeek();
};

const actions = {
  prev: () => navigate((o) => o - 1),
  next: () => navigate((o) => o + 1),
  current: () => navigate(() => 0),
};

export const ShowFullWeek = async () => {
  const run = ++latestRun;
  const [first] = findTransfersTables();
  if (!first) {
    // Left the transfers page: start from this week next time
    offset = 0;
    return;
  }

  const siteGameweek = first.gameweek;
  const gameweek = siteGameweek + offset;
  let week: Day[];
  let nav: NavState;
  try {
    const { bootstrap, fixtures } = await loadWeekData(gameweek);
    week = buildWeek(bootstrap, fixtures, gameweek);
    nav = {
      gameweek,
      hasPrev: !!findGameweekPhase(bootstrap, gameweek - 1),
      hasNext: !!findGameweekPhase(bootstrap, gameweek + 1),
      isCurrent: offset === 0,
    };
  } catch {
    return;
  }
  if (run !== latestRun) return;

  // The DOM may have changed while loading
  const tables = findTransfersTables().filter(
    (table) => table.gameweek === siteGameweek
  );
  tables.forEach((table) => render(table, gameweek, week));
  if (tables[0]) renderNav(tables[0], nav, actions, DAYS_PER_WEEK);
};
