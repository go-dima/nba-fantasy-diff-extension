import { beforeEach, describe, expect, test } from "@jest/globals";
import { standingsTable } from "./__fixtures__/standings";
import { findStandingsTable } from "./standings";

describe("findStandingsTable", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("returns the table with no rows when tbody is empty", () => {
    document.body.innerHTML = standingsTable([]);

    const standings = findStandingsTable();
    expect(standings).not.toBeNull();
    expect(standings?.headerRow.cells).toHaveLength(4);
    expect(standings?.rows).toEqual([]);
  });

  test("parses scores from the TOT column", () => {
    document.body.innerHTML = standingsTable([
      ["1", "Alpha", "50", "1,234"],
      ["2", "Beta", "40", "987.5"],
    ]);

    const scores = findStandingsTable()?.rows.map((r) => r.score);
    expect(scores).toEqual([1234, 987.5]);
  });

  test("ignores tables without a TOT header", () => {
    document.body.innerHTML = /* html */ `
      <table>
        <thead><tr><th>Rank</th><th>League</th></tr></thead>
        <tbody><tr><td>1</td><td>Foo</td></tr></tbody>
      </table>
    `;

    expect(findStandingsTable()).toBeNull();
  });
});
