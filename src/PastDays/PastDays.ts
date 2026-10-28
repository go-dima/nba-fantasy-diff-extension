import { findPlayerScheduleTables } from "../locators";
import { buildWeek, loadWeekData } from "../schedule";

// Same look as past days in the transfers tables
const PAST_DAY = "grayscale(100%) opacity(50%)";

// Greys the player view's games on days whose deadline has passed
export const ShowPastDays = async () => {
  const [first] = findPlayerScheduleTables();
  if (!first) return;

  let past: Set<string>;
  try {
    const { bootstrap, fixtures } = await loadWeekData(first.gameweek);
    past = new Set(
      buildWeek(bootstrap, fixtures, first.gameweek)
        .filter((day) => day.past)
        .map((day) => day.label)
    );
  } catch {
    return;
  }

  // The DOM may have changed while loading
  findPlayerScheduleTables().forEach(({ columns }) => {
    columns.forEach((cells, label) => {
      if (!past.has(label)) return;
      cells.forEach((cell) => {
        if (cell.style.filter !== PAST_DAY) cell.style.filter = PAST_DAY;
      });
    });
  });
};
