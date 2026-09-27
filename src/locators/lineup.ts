export type LineupPlayer = {
  card: HTMLElement;
  hasNextFixture: boolean;
};

const CARD = "div[elementtype]";
const FIXTURE_FIELD = "[elementtypeid]";

export const findLineupPlayers = (
  root: ParentNode = document
): LineupPlayer[] => {
  const players: LineupPlayer[] = [];

  root.querySelectorAll<HTMLElement>(CARD).forEach((card) => {
    const nextLabel = Array.from(
      card.querySelectorAll<HTMLElement>(FIXTURE_FIELD)
    ).find((field) => field.textContent?.trim() === "Next");
    const nextValue = nextLabel?.nextElementSibling;
    if (!nextValue) return;

    players.push({
      card,
      hasNextFixture: nextValue.textContent?.trim() !== "-",
    });
  });

  return players;
};
