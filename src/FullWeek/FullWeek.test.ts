import { afterEach, beforeEach, describe, expect, jest, test } from "@jest/globals";
import { ShowFullWeek } from ".";
import { cells, transfersTable } from "../locators/__fixtures__/transfers";
import { clearWeekDataCache } from "./api";
import { bootstrap } from "./__fixtures__/bootstrap";

const { DASH, logo } = cells;
const ATL = 1610612737;

const mockApi = () => {
  const fetchMock = jest.fn(async (url: string) => ({
    ok: true,
    status: 200,
    json: async () =>
      url.includes("bootstrap-static")
        ? bootstrap
        : [
            { event: 2, team_h: 1, team_a: 2 },
            { event: 5, team_h: 3, team_a: 1 },
          ],
  }));
  global.fetch = fetchMock as unknown as typeof fetch;
  return fetchMock;
};

const own = (selector: string) =>
  Array.from(document.querySelectorAll<HTMLElement>(`${selector}[data-nbafx-day]`));

describe("ShowFullWeek", () => {
  beforeEach(() => {
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
    global.fetch = jest.fn(async () => ({ ok: false, status: 500 })) as unknown as typeof fetch;

    await ShowFullWeek();

    expect(own("th")).toHaveLength(0);
  });
});
