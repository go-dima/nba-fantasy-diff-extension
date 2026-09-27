import { beforeEach, describe, expect, test } from "@jest/globals";
import { AddDiffColumn } from ".";
import { standingsTable } from "../locators/__fixtures__/standings";

const headers = () =>
  Array.from(document.querySelectorAll("thead th")).map((th) => th.textContent);

const diffCells = () =>
  Array.from(document.querySelectorAll("tbody tr")).map(
    (tr) => tr.lastElementChild?.textContent
  );

describe("AddDiffColumn", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("adds a Diff column with the gap to the leader", () => {
    document.body.innerHTML = standingsTable([
      ["1", "Alpha", "50", "1,234"],
      ["2", "Beta", "40", "1,200.5"],
      ["3", "Gamma", "30", "1,000"],
    ]);

    AddDiffColumn();

    expect(headers()).toEqual(["Rank", "Team & General Manager", "GD", "TOT", "Diff"]);
    expect(diffCells()).toEqual(["-", "33.5", "234.0"]);
  });

  test("is idempotent", () => {
    document.body.innerHTML = standingsTable([
      ["1", "Alpha", "50", "100"],
      ["2", "Beta", "40", "90"],
    ]);

    AddDiffColumn();
    AddDiffColumn();

    expect(headers().filter((h) => h === "Diff")).toHaveLength(1);
    expect(
      Array.from(document.querySelectorAll("tbody tr")).map((tr) => tr.children.length)
    ).toEqual([5, 5]);
  });

  test("adds only the header when there are no rows", () => {
    document.body.innerHTML = standingsTable([]);

    AddDiffColumn();

    expect(headers()).toContain("Diff");
  });
});
