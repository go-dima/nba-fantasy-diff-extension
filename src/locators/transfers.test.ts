import { beforeEach, describe, expect, test } from "@jest/globals";
import { cells, transfersTable } from "./__fixtures__/transfers";
import { EXT_DAY_ATTR, EXT_NAV_ATTR, findTransfersTables } from "./transfers";

const { DASH, logo } = cells;

describe("findTransfersTables", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("finds day columns, gameweek, rows and templates", () => {
    document.body.innerHTML = transfersTable(3, [
      { team: "ATL", code: 1610612737, days: [DASH, logo(1610612753, "Orlando Magic"), DASH, DASH, DASH] },
    ]);

    const [table, ...rest] = findTransfersTables();
    expect(rest).toHaveLength(0);
    expect(table.gameweek).toBe(3);
    expect(table.siteDayColumns).toEqual([5, 6, 7, 8, 9]);
    expect(table.otherHeaders.map((th) => th.textContent?.trim())).toEqual(["", "Front Court", "SS", "F", "TP"]);
    expect(table.rows.map((r) => r.teamCode)).toEqual([1610612737]);
    expect(table.templates.header.textContent).toBe("GW3.1");
    expect(table.templates.cell?.className).toBe("sc-day");
    expect(table.templates.logo?.className).toBe("sc-logo");
    expect(table.templates.noGame?.tagName.toLowerCase()).toBe("svg");
  });

  test("ignores columns added by the extension", () => {
    document.body.innerHTML = transfersTable(1, []);
    const headerRow = document.querySelector("thead tr")!;
    const own = document.createElement("th");
    own.setAttribute(EXT_DAY_ATTR, "1");
    own.textContent = "GW1.1";
    headerRow.appendChild(own);

    expect(findTransfersTables()[0].siteDayColumns).toEqual([5, 6, 7, 8, 9]);
  });

  test("skips the extension's nav row when finding the header row", () => {
    document.body.innerHTML = transfersTable(2, []);
    const thead = document.querySelector("thead")!;
    const nav = document.createElement("tr");
    nav.setAttribute(EXT_NAV_ATTR, "");
    nav.innerHTML = "<th>GW9.9</th>";
    thead.insertBefore(nav, thead.firstChild);

    const [table] = findTransfersTables();
    expect(table.gameweek).toBe(2);
    expect(table.headerRow.hasAttribute(EXT_NAV_ATTR)).toBe(false);
  });

  test("ignores tables without GW day headers", () => {
    document.body.innerHTML = `<table><thead><tr><th>Rank</th><th>TOT</th></tr></thead></table>`;

    expect(findTransfersTables()).toEqual([]);
  });
});
