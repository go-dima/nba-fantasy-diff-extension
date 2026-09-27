import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { ShowWeekGames } from ".";
import { JOHNSON, JOKIC, playerListTable } from "../locators/__fixtures__/playerList";
import { transfersTable } from "../locators/__fixtures__/transfers";
import { clearWeekDataCache } from "../schedule";
import { bootstrap } from "../schedule/__fixtures__/bootstrap";

// Team ids 1-3 in the bootstrap fixture; add Denver as id 4
const DEN = { id: 4, code: 1610612743, name: "Denver Nuggets" };
const fixtures = [
  { event: 1, team_h: 4, team_a: 1 },
  { event: 3, team_h: 4, team_a: 2 },
  { event: 6, team_h: 3, team_a: 4 },
  { event: 7, team_h: 4, team_a: 1 }, // next gameweek
];

const mockApi = () => {
  globalThis.fetch = jest.fn(async (url: string, _init?: RequestInit) => ({
    ok: true,
    status: 200,
    json: async () =>
      url.includes("bootstrap-static")
        ? { ...bootstrap, teams: [...bootstrap.teams, DEN] }
        : fixtures,
  })) as unknown as typeof fetch;
};

const page = (rows = [JOKIC, JOHNSON]) =>
  transfersTable(1, []) + playerListTable(rows);

const games = () =>
  Array.from(document.querySelectorAll<HTMLElement>("[data-nbafx-games]")).map(
    (cell) => cell.textContent
  );

describe("ShowWeekGames", () => {
  beforeEach(() => {
    clearWeekDataCache();
    jest.useFakeTimers({ now: 0 });
    mockApi();
  });

  test("adds a remaining(total) column before the add button", async () => {
    document.body.innerHTML = page();

    await ShowWeekGames();

    expect(games()).toEqual(["Gms", "3(3)", "1(1)"]);
    const headers = Array.from(document.querySelectorAll("thead th")).map((th) => th.textContent?.trim());
    expect(headers.slice(-6)).toEqual(["", "Front Court", "$", "**", "Gms", ""]);
    const row = document.querySelector("tbody tr")!;
    expect(row.lastElementChild?.className).toBe("sc-add");
    expect(row.children[4].className).toBe("sc-stat");
    const th = document.querySelector<HTMLElement>("th[data-nbafx-games]")!;
    expect(th.style.width).toBe("40px");
  });

  test("counts only days whose deadline has not passed as remaining", async () => {
    document.body.innerHTML = page([JOKIC]);
    jest.setSystemTime(bootstrap.events[0].deadline_time_epoch * 1000);

    await ShowWeekGames();

    expect(games()).toEqual(["Gms", "2(3)"]);
  });

  test("is idempotent and updates reused rows", async () => {
    document.body.innerHTML = page([JOKIC]);
    await ShowWeekGames();
    await ShowWeekGames();
    expect(games()).toEqual(["Gms", "3(3)"]);

    // The site reuses the row for another player when filtering
    document.querySelector("p[code]")!.setAttribute("code", String(JOHNSON.code));
    await ShowWeekGames();
    expect(games()).toEqual(["Gms", "1(1)"]);
  });

  test("does nothing outside the transfers page", async () => {
    document.body.innerHTML = playerListTable([JOKIC]);

    await ShowWeekGames();

    expect(games()).toEqual([]);
  });
});
