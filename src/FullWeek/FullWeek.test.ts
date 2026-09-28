import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { ShowFullWeek } from ".";
import { cells, transfersTable } from "../locators/__fixtures__/transfers";
import { clearWeekDataCache } from "../schedule";
import { bootstrap } from "../schedule/__fixtures__/bootstrap";

const { DASH, logo } = cells;
const ATL = 1610612737;

// Gameweek 1 = events 1-6, gameweek 2 = events 7-13, no gameweek 3
const fixtures = [
  { event: 2, team_h: 1, team_a: 2 },
  { event: 5, team_h: 3, team_a: 1 },
  { event: 8, team_h: 2, team_a: 1 }, // GW2.2
];

const mockApi = () => {
  const fetchMock = jest.fn(async (url: string, _init?: RequestInit) => ({
    ok: true,
    status: 200,
    json: async () => {
      if (url.includes("bootstrap-static")) return bootstrap;
      const phase = bootstrap.phases.find((p) => url.endsWith(`phase=${p.id}`))!;
      return fixtures.filter((f) => f.event >= phase.start_event && f.event <= phase.stop_event);
    },
  }));
  globalThis.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
};

const own = (selector: string) =>
  Array.from(document.querySelectorAll<HTMLElement>(`${selector}[data-nbafx-day]`));

const navRow = () => document.querySelector<HTMLTableRowElement>("tr[data-nbafx-nav]");
const navButton = (role: string) =>
  navRow()!.querySelector<HTMLButtonElement>(`[data-nav="${role}"]`)!;
const navLabel = () => navRow()!.querySelector('[data-nav="label"]')!.textContent;
const alts = () => own("td").map((td) => td.querySelector("img")?.alt ?? null);

describe("ShowFullWeek", () => {
  beforeEach(async () => {
    // Leaving the transfers page resets the viewed week
    document.body.innerHTML = "";
    await ShowFullWeek();
    clearWeekDataCache();
    jest.useFakeTimers({ now: 0 });
    document.body.innerHTML = transfersTable(1, [
      { team: "ATL", code: ATL, days: [DASH, logo(1610612738, "Boston Celtics"), DASH, DASH, DASH] },
    ]);
  });

  afterEach(() => {
    jest.useRealTimers();
  });

  test("replaces the 5 site columns with 7 gameweek days", async () => {
    const fetchMock = mockApi();

    await ShowFullWeek();

    expect(fetchMock).toHaveBeenCalledWith("/api/fixtures/?phase=2", expect.anything());
    const siteHeads = Array.from(document.querySelectorAll<HTMLElement>("th[scope]:not([data-nbafx-day])"));
    expect(siteHeads.every((th) => th.style.display === "none")).toBe(true);

    const heads = own("th");
    expect(heads.map((th) => th.textContent)).toEqual([
      "GW1.1", "GW1.2", "GW1.3", "GW1.4", "GW1.5", "GW1.6", "GW1.7",
    ]);
    expect(heads[0].className).toBe("sc-dayhead");
    expect(heads[6].style.textDecoration).toBe("line-through");

    const tds = own("td");
    expect(tds).toHaveLength(7);
    expect(tds.map((td) => td.querySelector("img")?.alt ?? null)).toEqual([
      null, "Boston Celtics", null, null, "Brooklyn Nets", null, null,
    ]);
    expect(tds[1].querySelector("img")?.className).toBe("sc-logo");
    expect(tds[0].querySelector("svg")).not.toBeNull();
    expect(tds[6].querySelector("svg path")?.getAttribute("d")).toBe("M1 1L10 10M10 1L1 10");
  });

  test("greys out days whose deadline has passed", async () => {
    mockApi();
    jest.setSystemTime(bootstrap.events[1].deadline_time_epoch * 1000);

    await ShowFullWeek();

    const past = own("td").map((td) => td.style.filter !== "");
    expect(past).toEqual([true, true, false, false, false, false, false]);
  });

  test("is idempotent and fetches once", async () => {
    const fetchMock = mockApi();

    await ShowFullWeek();
    await ShowFullWeek();

    expect(own("th")).toHaveLength(7);
    expect(own("td")).toHaveLength(7);
    expect(fetchMock).toHaveBeenCalledTimes(2);
  });

  test("re-renders a row when its player changes team", async () => {
    mockApi();
    await ShowFullWeek();

    document.querySelector("p[code]")!.setAttribute("code", "1610612738");
    await ShowFullWeek();

    const tds = own("td");
    expect(tds).toHaveLength(7);
    expect(tds[1].querySelector("img")?.alt).toBe("Atlanta Hawks");
  });

  test("does nothing when the API fails", async () => {
    globalThis.fetch = jest.fn(async () => ({ ok: false, status: 500 })) as unknown as typeof fetch;

    await ShowFullWeek();

    expect(own("th")).toHaveLength(0);
  });

  describe("week navigation", () => {
    test("adds a nav row above the day columns", async () => {
      mockApi();
      await ShowFullWeek();
      await ShowFullWeek();

      expect(document.querySelectorAll("tr[data-nbafx-nav]")).toHaveLength(1);
      const row = navRow()!;
      expect(row.nextElementSibling?.querySelector("th[data-nbafx-day]")).not.toBeNull();
      expect(Array.from(row.cells).map((c) => c.colSpan)).toEqual([1, 1, 1, 1, 1, 7]);
      expect(row.cells[1].className).toBe(document.querySelectorAll("thead tr")[1].children[1].className);
      expect(navLabel()).toBe("Gameweek 1");
      expect(navButton("prev").disabled).toBe(true);
      expect(navButton("current").disabled).toBe(true);
      expect(navButton("next").disabled).toBe(false);
    });

    test("moves forward and back to this week", async () => {
      mockApi();
      await ShowFullWeek();

      navButton("next").click();
      await ShowFullWeek();

      expect(navLabel()).toBe("Gameweek 2");
      expect(own("th").map((th) => th.textContent)).toEqual([
        "GW2.1", "GW2.2", "GW2.3", "GW2.4", "GW2.5", "GW2.6", "GW2.7",
      ]);
      expect(own("th").every((th) => th.style.textDecoration === "")).toBe(true);
      expect(alts()).toEqual([null, "Boston Celtics", null, null, null, null, null]);
      expect(own("td")).toHaveLength(7);
      expect(navButton("prev").disabled).toBe(false);
      expect(navButton("next").disabled).toBe(true);
      expect(navButton("current").disabled).toBe(false);

      navButton("current").click();
      await ShowFullWeek();

      expect(navLabel()).toBe("Gameweek 1");
      expect(own("th")[6].style.textDecoration).toBe("line-through");
      expect(alts()).toEqual([null, "Boston Celtics", null, null, "Brooklyn Nets", null, null]);
      expect(navButton("current").disabled).toBe(true);
    });

    test("moves both squad tables but shows one nav row", async () => {
      document.body.innerHTML += transfersTable(1, [
        { team: "ATL", code: ATL, days: [DASH, DASH, DASH, DASH, DASH] },
      ]);
      mockApi();
      await ShowFullWeek();

      navButton("next").click();
      await ShowFullWeek();

      expect(document.querySelectorAll("tr[data-nbafx-nav]")).toHaveLength(1);
      const labels = Array.from(document.querySelectorAll("thead tr:not([data-nbafx-nav])")).map(
        (tr) => tr.querySelector("th[data-nbafx-day]")?.textContent
      );
      expect(labels).toEqual(["GW2.1", "GW2.1"]);
    });

    test("greys out every day of a past gameweek", async () => {
      document.body.innerHTML = transfersTable(2, [
        { team: "ATL", code: ATL, days: [DASH, DASH, DASH, DASH, DASH] },
      ]);
      mockApi();
      jest.setSystemTime(bootstrap.events[6].deadline_time_epoch * 1000);
      await ShowFullWeek();

      navButton("prev").click();
      await ShowFullWeek();

      expect(navLabel()).toBe("Gameweek 1");
      expect(own("td").slice(0, 6).every((td) => td.style.filter !== "")).toBe(true);
    });
  });
});
