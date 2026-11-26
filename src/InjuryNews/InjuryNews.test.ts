import { beforeEach, describe, expect, jest, test } from "@jest/globals";
import { ShowInjuryNews, formatNews } from ".";
import {
  JALEN_WILLIAMS,
  JAYLIN_WILLIAMS,
  LineupPlayer,
  MARA,
  lineupListTable,
  pitchCard,
} from "../locators/__fixtures__/lineup";
import { JOHNSON, JOKIC, playerListTable } from "../locators/__fixtures__/playerList";
import { PlayerElement, clearWeekDataCache } from "../schedule";
import { bootstrap } from "../schedule/__fixtures__/bootstrap";

const SITE_TITLE = "View player information";

const element = (p: LineupPlayer, code: number, news = ""): PlayerElement => ({
  code, web_name: p.webName, first_name: p.first, second_name: p.last, team_code: p.teamCode, news,
});

const elements: PlayerElement[] = [
  { code: 203999, web_name: "N.Jokic", first_name: "Nikola", second_name: "Jokic", team_code: JOKIC.code, news: "Lower Leg expected back 2026-11-28" },
  { code: 1630552, web_name: "J.Johnson", first_name: "Jalen", second_name: "Johnson", team_code: JOHNSON.code, news: "" },
  element(MARA, 1643530, "Lower Leg expected back 2026-11-28"),
  element(JALEN_WILLIAMS, 1631114, "Wrist expected back 2026-12-01"),
  element(JAYLIN_WILLIAMS, 1631119),
];

const mockApi = (players = elements) => {
  globalThis.fetch = jest.fn(async () => ({
    ok: true,
    status: 200,
    json: async () => ({ ...bootstrap, elements: players }),
  })) as unknown as typeof fetch;
};

const titles = () =>
  Array.from(document.querySelectorAll<HTMLButtonElement>("button[variant], tbody td:first-child button")).map(
    (button) => button.title
  );

describe("ShowInjuryNews", () => {
  beforeEach(() => {
    clearWeekDataCache();
    mockApi();
  });

  test("formats news as return date over reason", () => {
    expect(formatNews("Lower Leg expected back 2026-11-28")).toBe("2026-11-28\nLower Leg");
    expect(formatNews("Suspended")).toBe("Suspended");
  });

  test("sets the marker tooltip of players with news only", async () => {
    document.body.innerHTML = playerListTable([JOKIC, JOHNSON]);

    await ShowInjuryNews();

    expect(titles()).toEqual(["2026-11-28\nLower Leg", SITE_TITLE]);
  });

  test("sets the marker tooltip in the lineup list view", async () => {
    document.body.innerHTML = lineupListTable([MARA]);

    await ShowInjuryNews();

    expect(titles()).toEqual(["2026-11-28\nLower Leg"]);
  });

  test("tells apart pitch cards sharing a short name by headshot", async () => {
    document.body.innerHTML = pitchCard(JAYLIN_WILLIAMS) + pitchCard(JALEN_WILLIAMS);

    await ShowInjuryNews();

    expect(titles()).toEqual([SITE_TITLE, "2026-12-01\nWrist"]);
  });

  test("skips an ambiguous short name without a headshot", async () => {
    document.body.innerHTML = pitchCard({ ...JALEN_WILLIAMS, headshot: "fallback.svg" });

    await ShowInjuryNews();

    expect(titles()).toEqual([SITE_TITLE]);
  });

  test("restores the site's title when news clears", async () => {
    document.body.innerHTML = playerListTable([JOKIC]);
    await ShowInjuryNews();

    clearWeekDataCache();
    mockApi(elements.map((p) => ({ ...p, news: "" })));
    await ShowInjuryNews();

    expect(titles()).toEqual([SITE_TITLE]);
  });
});
