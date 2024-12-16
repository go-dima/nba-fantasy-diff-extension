import { SELECTORS, STYLES } from "./pitch.consts";

export const updatePitchElements = () => {
  const pitchElements = document.querySelectorAll(
    SELECTORS.PARENT_PITCH_ELEMENT
  );
  if (!pitchElements.length) return;

  pitchElements.forEach((pitch) => {
    const cardElement = pitch.querySelector(SELECTORS.CARD_ELEMENT);
    if (!cardElement) return;

    const fixtureWrapper = pitch.querySelector(
      '[class^="PitchElementFixtures__NextFixtureWrapper"]'
    );
    if (!fixtureWrapper) return;

    const fixtureFields = fixtureWrapper.querySelectorAll(
      '[class^="PitchElementFixtures__FixtureField"]'
    );
    if (fixtureFields.length < 2) return;

    const secondFixtureField = fixtureFields[1];

    if (secondFixtureField.textContent?.trim() === "-") {
      cardElement.setAttribute("style", STYLES.DISABLED_ELEMENT);
    } else {
      pitch.setAttribute("style", STYLES.ACTIVE_ELEMENT);
    }
  });
};
