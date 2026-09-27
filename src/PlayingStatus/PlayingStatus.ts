import { findLineupPlayers } from "../locators";
import { STYLES } from "./PlayingStatus.consts";

export const UpdatePlayingStatus = () => {
  findLineupPlayers().forEach(({ card, hasNextFixture }) => {
    card.setAttribute(
      "style",
      hasNextFixture ? STYLES.ACTIVE_ELEMENT : STYLES.DISABLED_ELEMENT
    );
  });
};
