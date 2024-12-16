import { beforeEach, describe, expect, test } from "@jest/globals";
import { updatePitchElements } from "../src/pitch";
import { SELECTORS, STYLES } from "../src/pitch.consts";

describe("updatePitchElements", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test('applies disabled style when fixture field is "-"', () => {
    document.body.innerHTML = /* html */ `
      <div class="Pitch__PitchElementInner-sc-z4xh31-4 ipHIqU">
        <div class="ElementCard__ElementCardMain-sc-7e8ocu-0 caFlMC">
          <div class="PitchElementFixtures__NextFixtureWrapper-sc-1dwbi13-1 lauZne">
            <div class="PitchElementFixtures__FixtureField-sc-1dwbi13-2 hvofAh">Next</div>
            <div class="PitchElementFixtures__FixtureField-sc-1dwbi13-2 hvofAh">-</div>
          </div>
        </div>
      </div>
    `;

    updatePitchElements();
    const cardElement = document.querySelector(SELECTORS.CARD_ELEMENT);
    expect(cardElement?.getAttribute("style")).toBe(STYLES.DISABLED_ELEMENT);
  });

  test('applies active style when fixture field is not "-"', () => {
    document.body.innerHTML = /* html */ `
      <div class="Pitch__PitchElementInner-sc-z4xh31-4 ipHIqU">
        <div class="ElementCard__ElementCardMain-sc-7e8ocu-0 caFlMC">
          <div class="PitchElementFixtures__NextFixtureWrapper-sc-1dwbi13-1 lauZne">
            <div class="PitchElementFixtures__FixtureField-sc-1dwbi13-2 hvofAh">Next</div>
            <div class="PitchElementFixtures__FixtureField-sc-1dwbi13-2 hvofAh">SAS</div>
          </div>
        </div>
      </div>
    `;

    updatePitchElements();
    const parentElement = document.querySelector(
      SELECTORS.PARENT_PITCH_ELEMENT
    );
    expect(parentElement?.getAttribute("style")).toBe(STYLES.ACTIVE_ELEMENT);
  });
});
