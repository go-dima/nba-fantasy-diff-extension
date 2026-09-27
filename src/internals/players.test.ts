import { describe, expect, jest, test } from "@jest/globals";
import { Player, createPlayersUpdater, matchesSearch, normalizeName } from "./players";

const boozer: Player & { id: number } = {
  id: 1,
  web_name: "C.Boozer",
  search_name: "c boozer",
  first_name: "Cameron",
  second_name: "Boozer",
  known_name: "",
};

const state = () => ({
  elements: { byId: { 1: { ...boozer } }, controls: { search: "" } },
  teams: { byId: { 1: { id: 1, name: "Atlanta Hawks" } } },
});

const shout = (player: Player) => ({ ...player, search_name: player.search_name.toUpperCase() });

describe("normalizeName", () => {
  test("lowercases, strips accents and turns dots into spaces", () => {
    expect(normalizeName("N.Jokić")).toBe("n jokic");
    expect(normalizeName("Dončić")).toBe("doncic");
  });
});

describe("matchesSearch", () => {
  test("matches queries at word starts, like the site", () => {
    expect(matchesSearch("c boozer", "boo")).toBe(true);
    expect(matchesSearch("c boozer", "C.Boo")).toBe(true);
    expect(matchesSearch("c boozer", "cameron")).toBe(false);
    expect(matchesSearch("c boozer", "oozer")).toBe(false);
  });
});

describe("createPlayersUpdater", () => {
  test("updates players in any byId slice", () => {
    const next = createPlayersUpdater(shout)(state());

    expect(next.elements.byId[1].search_name).toBe("C BOOZER");
  });

  test("updates each player map once and keeps identity otherwise", () => {
    const update = jest.fn(shout);
    const updater = createPlayersUpdater(update);
    const s = state();
    const next = updater(s);

    expect(next).not.toBe(s);
    expect(next.teams).toBe(s.teams);
    expect(next.elements.controls).toBe(s.elements.controls);
    expect(updater(next)).toBe(next);
    expect(update).toHaveBeenCalledTimes(1);
  });

  test("ignores non-player state", () => {
    const updater = createPlayersUpdater(shout);
    const s = { teams: state().teams, ui: null };

    expect(updater(s)).toBe(s);
    expect(updater(undefined)).toBeUndefined();
  });
});
