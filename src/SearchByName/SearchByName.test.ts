import { describe, expect, test } from "@jest/globals";
import { Player, matchesSearch } from "../internals";
import { withFullNames } from "./SearchByName";

const boozer: Player = {
  web_name: "C.Boozer",
  search_name: "c boozer",
  first_name: "Cameron",
  second_name: "Boozer",
  known_name: "",
};

describe("withFullNames", () => {
  test("appends the full name to search_name", () => {
    const player = withFullNames(boozer);

    expect(player.search_name).toBe("c boozer cameron boozer");
    expect(player.web_name).toBe("C.Boozer");
  });

  test("lets the site's search match first names", () => {
    const { search_name } = withFullNames(boozer);

    for (const query of ["cameron", "Cameron Boo", "boozer", "c.boo"]) {
      expect(matchesSearch(search_name, query)).toBe(true);
    }
    expect(matchesSearch(search_name, "ameron")).toBe(false);
  });

  test("includes known_name when present", () => {
    expect(withFullNames({ ...boozer, known_name: "Cam Boozer" }).search_name).toBe(
      "c boozer cameron boozer cam boozer"
    );
  });

  test("normalizes accents in full names", () => {
    const luka = { web_name: "L.Dončić", search_name: "l doncic", first_name: "Luka", second_name: "Dončić" };

    expect(withFullNames(luka).search_name).toBe("l doncic luka doncic");
  });

  test("returns the same player when there is nothing to add", () => {
    const player = { web_name: "Nene", search_name: "nene", first_name: "", second_name: "Nene" };

    expect(withFullNames(player)).toBe(player);
  });
});
