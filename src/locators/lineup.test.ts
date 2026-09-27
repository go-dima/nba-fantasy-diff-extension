import { beforeEach, describe, expect, test } from "@jest/globals";
import { findLineupPlayers } from "./lineup";

// Captured from /my-team on 2026-09-27 (hashed classes trimmed)
const card = (id: string, fixture: string) => /* html */ `
  <div variant="" class="sc-bmxOz" data-testid="${id}">
    <div class="sc-iunwHu">
      <div elementtype="2" class="sc-eqNcPs">
        <div class="sc-name">Player ${id}</div>
        ${fixture}
      </div>
    </div>
  </div>
`;

const nextFixture = (value: string) => /* html */ `
  <div class="sc-fixtures">
    <div elementtypeid="2">Next</div>
    <div elementtypeid="2">${value}</div>
  </div>
`;

describe("findLineupPlayers", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("detects a card with a next fixture logo", () => {
    document.body.innerHTML = card(
      "sas",
      nextFixture('<img alt="Oklahoma City Thunder" src="okc.png">')
    );

    const [player, ...rest] = findLineupPlayers();
    expect(rest).toHaveLength(0);
    expect(player.hasNextFixture).toBe(true);
    expect(player.card.getAttribute("elementtype")).toBe("2");
  });

  test('detects a card without a next fixture ("-")', () => {
    document.body.innerHTML = card("bench", nextFixture("-"));

    const [player] = findLineupPlayers();
    expect(player.hasNextFixture).toBe(false);
  });

  test("skips cards without a Next block", () => {
    document.body.innerHTML =
      card("no-next", "") + card("ok", nextFixture("-"));

    const players = findLineupPlayers();
    expect(players).toHaveLength(1);
    expect(
      players[0].card.closest<HTMLElement>("[variant]")?.dataset.testid
    ).toBe("ok");
  });
});
