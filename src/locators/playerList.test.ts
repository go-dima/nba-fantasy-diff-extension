import { beforeEach, describe, expect, test } from "@jest/globals";
import { JOHNSON, JOKIC, playerListTable } from "./__fixtures__/playerList";
import { transfersTable } from "./__fixtures__/transfers";
import { EXT_GAMES_ATTR, findPlayerListTables } from "./playerList";

describe("findPlayerListTables", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("finds rows, team codes and the insertion point", () => {
    document.body.innerHTML = playerListTable([JOKIC, JOHNSON]);

    const [table, ...rest] = findPlayerListTables();
    expect(rest).toHaveLength(0);
    expect(table.before.className).toBe("sc-addhead");
    expect(table.stat.className).toBe("sc-sort");
    expect(table.rows.map((r) => r.teamCode)).toEqual([1610612743, 1610612737]);
    expect(table.rows[0].before.className).toBe("sc-add");
    expect(table.rows[0].stat.textContent).toBe("4464");
  });

  test("ignores cells added by the extension", () => {
    document.body.innerHTML = playerListTable([JOKIC]);
    const own = document.createElement("td");
    own.setAttribute(EXT_GAMES_ATTR, "");
    const row = document.querySelector("tbody tr")!;
    row.insertBefore(own, row.lastElementChild);

    const [table] = findPlayerListTables();
    expect(table.rows[0].before.className).toBe("sc-add");
    expect(table.rows[0].stat.textContent).toBe("4464");
  });

  test("ignores the squad and standings tables", () => {
    document.body.innerHTML =
      transfersTable(1, []) +
      `<table><thead><tr><th>Rank</th><th>TOT</th></tr></thead></table>`;

    expect(findPlayerListTables()).toEqual([]);
  });
});
