import { EXT_NAV_ATTR, TransfersTable, dayColumnWidth } from "../locators";

export type NavState = {
  gameweek: number;
  hasPrev: boolean;
  hasNext: boolean;
  isCurrent: boolean;
};

export type NavActions = {
  prev: () => void;
  next: () => void;
  current: () => void;
};

const STYLES = {
  CELL: "padding: 2px 4px;",
  BAR: "display: flex; align-items: center; justify-content: space-between; gap: 8px;",
  ARROW:
    "background: none; border: none; color: inherit; font: inherit; font-size: 20px; line-height: 1; padding: 0 8px; cursor: pointer;",
  CURRENT:
    "background: none; border: 1px solid currentColor; border-radius: 3px; color: inherit; font: inherit; font-size: 11px; padding: 1px 6px; margin-left: 8px; cursor: pointer;",
  DISABLED: "opacity: 0.35; cursor: default;",
};

// The nav row becomes the table's first row, which sets the column
// widths: the leading cells are clones that keep theirs, and the days
// cell takes the share of `days` day columns.
const daysWidth = (table: TransfersTable, days: number) => {
  const width = dayColumnWidth(table);
  return width ? ` width: calc(${width} * ${days});` : "";
};

const button = (
  role: string,
  text: string,
  label: string,
  style: string,
  onClick: () => void
) => {
  const el = document.createElement("button");
  el.type = "button";
  el.dataset.nav = role;
  el.textContent = text;
  el.title = label;
  el.setAttribute("aria-label", label);
  el.dataset.style = style;
  el.setAttribute("style", style);
  el.addEventListener("click", (event) => {
    event.preventDefault();
    if (!el.disabled) onClick();
  });
  return el;
};

const setEnabled = (el: HTMLButtonElement, enabled: boolean) => {
  if (el.disabled === !enabled) return;
  el.disabled = !enabled;
  el.setAttribute(
    "style",
    el.dataset.style + (enabled ? "" : STYLES.DISABLED)
  );
};

const createNavRow = (
  table: TransfersTable,
  actions: NavActions,
  days: number
) => {
  const row = document.createElement("tr");
  row.setAttribute(EXT_NAV_ATTR, "");

  const spacers = table.otherHeaders.map((th) => {
    const spacer = th.cloneNode(false) as HTMLTableCellElement;
    spacer.setAttribute("style", STYLES.CELL);
    return spacer;
  });

  const cell = table.templates.header.cloneNode(false) as HTMLTableCellElement;
  cell.removeAttribute("scope");
  cell.setAttribute("style", STYLES.CELL + daysWidth(table, days));
  cell.colSpan = days;

  const bar = document.createElement("div");
  bar.setAttribute("style", STYLES.BAR);

  const middle = document.createElement("span");
  const label = document.createElement("span");
  label.dataset.nav = "label";
  middle.append(
    label,
    button("current", "This week", "Back to this week", STYLES.CURRENT, actions.current)
  );

  bar.append(
    button("prev", "‹", "Previous gameweek", STYLES.ARROW, actions.prev),
    middle,
    button("next", "›", "Next gameweek", STYLES.ARROW, actions.next)
  );
  cell.append(bar);
  row.append(...spacers, cell);
  return row;
};

export const renderNav = (
  table: TransfersTable,
  state: NavState,
  actions: NavActions,
  days: number
) => {
  let row = table.navRow;
  if (!row) {
    row = createNavRow(table, actions, days);
    table.head.insertBefore(row, table.headerRow);
  }

  const find = <T extends HTMLElement>(role: string) =>
    row!.querySelector<T>(`[data-nav="${role}"]`)!;

  const text = `Gameweek ${state.gameweek}`;
  const label = find("label");
  if (label.textContent !== text) label.textContent = text;

  setEnabled(find<HTMLButtonElement>("prev"), state.hasPrev);
  setEnabled(find<HTMLButtonElement>("next"), state.hasNext);
  setEnabled(find<HTMLButtonElement>("current"), !state.isCurrent);
};
