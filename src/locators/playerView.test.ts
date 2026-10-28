import { describe, expect, test } from "@jest/globals";
import { findPlayerScheduleTables } from "./playerView";

describe("findPlayerScheduleTables", () => {
  test("finds the player view's day columns", () => {
    document.body.innerHTML = `<table><thead><tr><th>GW2.1</th><th>GW2.2</th></tr></thead><tbody><tr><td>a</td><td>b</td></tr></tbody></table>`;

    const [table, ...rest] = findPlayerScheduleTables();
    expect(rest).toHaveLength(0);
    expect(table.gameweek).toBe(2);
    expect(table.columns.get("GW2.2")?.map((td) => td.textContent)).toEqual(["b"]);
  });

  test("ignores tables with non-day columns", () => {
    document.body.innerHTML = `<table><thead><tr><th>Player</th><th>GW2.1</th></tr></thead></table>`;

    expect(findPlayerScheduleTables()).toEqual([]);
  });
});
