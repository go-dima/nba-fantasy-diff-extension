import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { ShowWeekGames } from ".";
import { JOHNSON, JOKIC, playerListTable } from "../locators/__fixtures__/playerList";
import { transfersTable } from "../locators/__fixtures__/transfers";
import { clearWeekDataCache } from "../schedule";
import { bootstrap } from "../schedule/__fixtures__/bootstrap";

// Bootstrap fixture: gameweek 1 = events 1-6 (phase 2), gameweek 2 =
// events 7-13 (phase 3), no gameweek 3. Team ids 1-3; add Denver as 4.
const DEN = { id: 4, code: 1610612743, name: "Denver Nuggets" };
const fixtures = [
  { event: 1, team_h: 4, team_a: 1 },
  { event: 3, team_h: 4, team_a: 2 },
  { event: 6, team_h: 3, team_a: 4 },
  { event: 7, team_h: 4, team_a: 1 }, // GW2.1
  { event: 9, team_h: 2, team_a: 4 }, // GW2.3
];

const mockApi = () => {
  globalThis.fetch = jest.fn(async (url: string, _init?: RequestInit) => ({
    ok: true,
    status: 200,
    json: async () => {
      if (url.includes("bootstrap-static")) {
        return { ...bootstrap, teams: [...bootstrap.teams, DEN] };
      }
      const phase = bootstrap.phases.find((p) => url.endsWith(`phase=${p.id}`))!;
      return fixtures.filter((f) => f.event >= phase.start_event && f.event <= phase.stop_event);
    },
  })) as unknown as typeof fetch;
};

const page = (rows = [JOKIC, JOHNSON], gameweek = 1) =>
  transfersTable(gameweek, []) + playerListTable(rows);

const days = () =>
  Array.from(document.querySelectorAll<HTMLElement>("[data-nbafx-games]")).map(
    (cell) => cell.textContent
  );

describe("ShowWeekGames", () => {
  beforeEach(() => {
    clearWeekDataCache();
    jest.useFakeTimers({ now: 0 });
    mockApi();
  });

  test("adds this week's / next week's game days before the add button", async () => {
    document.body.innerHTML = page();

    await ShowWeekGames();

    expect(days()).toEqual(["Days", "1,3,6/1,3", "1/1"]);
    const headers = Array.from(document.querySelectorAll("thead th")).map((th) => th.textContent?.trim());
    expect(headers.slice(-6)).toEqual(["", "Front Court", "$", "**", "Days", ""]);
    const row = document.querySelector("tbody tr")!;
    expect(row.lastElementChild?.className).toBe("sc-add");
    expect(row.children[4].className).toBe("sc-stat");
  });

  test("drops this week's days whose deadline has passed", async () => {
    document.body.innerHTML = page();
    jest.setSystemTime(bootstrap.events[0].deadline_time_epoch * 1000);

    await ShowWeekGames();

    expect(days()).toEqual(["Days", "3,6/1,3", "-/1"]);
  });

  test("omits next week after the last gameweek", async () => {
    document.body.innerHTML = page([JOKIC], 2);

    await ShowWeekGames();

    expect(days()).toEqual(["Days", "1,3"]);
  });

  test("is idempotent and updates reused rows", async () => {
    document.body.innerHTML = page([JOKIC]);
    await ShowWeekGames();
    await ShowWeekGames();
    expect(days()).toEqual(["Days", "1,3,6/1,3"]);

    // The site reuses the row for another player when filtering
    document.querySelector("p[code]")!.setAttribute("code", String(JOHNSON.code));
    await ShowWeekGames();
    expect(days()).toEqual(["Days", "1/1"]);
  });

  test("does nothing outside the transfers page", async () => {
    document.body.innerHTML = playerListTable([JOKIC]);

    await ShowWeekGames();

    expect(days()).toEqual([]);
  });
});
