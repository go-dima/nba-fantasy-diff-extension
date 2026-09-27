import { EXT_DAY_ATTR, TransfersTable, findTransfersTables } from "../locators";
import { Day, buildWeek, loadWeekData } from "../schedule";

const EXT_TEAM_ATTR = "data-nbafx-team";

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
  if (headerRow.querySelector(`[${EXT_DAY_ATTR}]`)) return;

  week.forEach((day, i) => {
    const th = templates.header.cloneNode(false) as HTMLTableCellElement;
    th.setAttribute(EXT_DAY_ATTR, String(i + 1));
    th.setAttribute("style", dayStyle(day));
    th.textContent = day.label;
    headerRow.appendChild(th);
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

const renderRows = (table: TransfersTable, week: Day[]) => {
  table.rows.forEach(({ row, teamCode }) => {
    const own = row.querySelectorAll(`[${EXT_DAY_ATTR}]`);
    if (own.length && own[0].getAttribute(EXT_TEAM_ATTR) === String(teamCode)) {
      return;
    }
    own.forEach((cell) => cell.remove());

    week.forEach((day, i) => {
      const td = renderCell(table, day, teamCode);
      td.setAttribute(EXT_DAY_ATTR, String(i + 1));
      td.setAttribute(EXT_TEAM_ATTR, String(teamCode));
      row.appendChild(td);
    });
  });
};

const render = (table: TransfersTable, week: Day[]) => {
  table.siteDayColumns.forEach((index) => {
    hide(table.headerRow.cells[index]);
    table.rows.forEach(({ row }) => hide(row.cells[index]));
  });
  renderHeader(table, week);
  renderRows(table, week);
};

export const ShowFullWeek = async () => {
  const [first] = findTransfersTables();
  if (!first) return;

  const { gameweek } = first;
  let week: Day[];
  try {
    const { bootstrap, fixtures } = await loadWeekData(gameweek);
    week = buildWeek(bootstrap, fixtures, gameweek);
  } catch {
    return;
  }

  // The DOM may have changed while loading
  findTransfersTables()
    .filter((table) => table.gameweek === gameweek)
    .forEach((table) => render(table, week));
};
