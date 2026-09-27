import { describe, expect, test } from "@jest/globals";
import { DAY, START, bootstrap } from "./__fixtures__/bootstrap";
import { buildWeek, countGames } from "./schedule";

describe("buildWeek", () => {
  test("always returns 7 days, marking days beyond the gameweek as missing", () => {
    const week = buildWeek(bootstrap, [], 1, 0);

    expect(week.map((d) => d.label)).toEqual([
      "GW1.1", "GW1.2", "GW1.3", "GW1.4", "GW1.5", "GW1.6", "GW1.7",
    ]);
    expect(week.map((d) => d.exists)).toEqual([true, true, true, true, true, true, false]);
  });

  test("marks days whose deadline has passed as past", () => {
    const now = (START + 2 * DAY) * 1000;
    const week = buildWeek(bootstrap, [], 1, now);

    expect(week.map((d) => d.past)).toEqual([true, true, true, false, false, false, false]);
  });

  test("maps opponents for home and away teams by team code", () => {
    const week = buildWeek(
      bootstrap,
      [
        { event: 8, team_h: 1, team_a: 2 },
        { event: 9, team_h: 3, team_a: 1 },
      ],
      2,
      0
    );

    expect(week[1].opponents.get(1610612737)).toEqual([{ code: 1610612738, name: "Boston Celtics" }]);
    expect(week[1].opponents.get(1610612738)).toEqual([{ code: 1610612737, name: "Atlanta Hawks" }]);
    expect(week[2].opponents.get(1610612737)).toEqual([{ code: 1610612751, name: "Brooklyn Nets" }]);
    expect(week[0].opponents.size).toBe(0);
    expect(week.every((d) => d.exists)).toBe(true);
  });

  test("unknown gameweek yields 7 missing days", () => {
    expect(buildWeek(bootstrap, [], 99, 0).every((d) => !d.exists)).toBe(true);
  });
});

describe("countGames", () => {
  test("counts total and remaining games per team code", () => {
    const fixtures = [
      { event: 1, team_h: 1, team_a: 2 },
      { event: 3, team_h: 3, team_a: 1 },
      { event: 5, team_h: 1, team_a: 3 },
    ];
    const now = (START + 1 * DAY) * 1000; // days 1-2 are past
    const counts = countGames(buildWeek(bootstrap, fixtures, 1, now));

    expect(counts.get(1610612737)).toEqual({ remaining: 2, total: 3 });
    expect(counts.get(1610612738)).toEqual({ remaining: 0, total: 1 });
    expect(counts.get(1610612751)).toEqual({ remaining: 2, total: 2 });
  });
});
