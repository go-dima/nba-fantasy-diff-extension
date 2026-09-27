import { beforeEach, describe, expect, test } from "@jest/globals";
import { STYLES, UpdatePlayingStatus } from ".";
import { findLineupPlayers } from "../locators";

const playerCard = (fixture: string) => /* html */ `
  <div variant="" class="sc-bmxOz">
    <div class="sc-iunwHu">
      <div elementtype="2" class="sc-eqNcPs">
        <div elementtypeid="2">Next</div>
        <div elementtypeid="2">${fixture}</div>
      </div>
    </div>
  </div>
`;

describe("UpdatePlayingStatus", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test('applies disabled style when fixture field is "-"', () => {
    document.body.innerHTML = playerCard("-");

    UpdatePlayingStatus();
    const [{ card }] = findLineupPlayers();
    expect(card.getAttribute("style")).toBe(STYLES.DISABLED_ELEMENT);
  });

  test('applies active style when fixture field is not "-"', () => {
    document.body.innerHTML = playerCard(
      '<img alt="Oklahoma City Thunder" src="okc.png">'
    );

    UpdatePlayingStatus();
    const [{ card }] = findLineupPlayers();
    expect(card.getAttribute("style")).toBe(STYLES.ACTIVE_ELEMENT);
    expect(card.closest("[variant]")?.getAttribute("style")).toBeNull();
  });
});
