// The site's status marker (info / doubtful / injured icon) is the
// "View player information" button shown with each player: in table rows
// (squad tables, player list, lineup list view) and on lineup pitch cards.
export const MARKER_TITLE = "View player information";
// Set on markers whose title the extension replaced
export const EXT_MARKER_TITLE_ATTR = "data-nbafx-title";

// Headshots are named by the player's code: ".../1643530.png"
const HEADSHOT = /\/(\d+)\.(?:png|jpe?g|webp)(?:$|\?)/;

export type PlayerMarker = {
  marker: HTMLButtonElement;
  teamCode: number | null;
  // From the headshot; matches the API's player `code`
  playerCode: number | null;
  // Texts of the player's leaf elements: first and last name (tables) or
  // the short "A.Mara" name (pitch cards)
  texts: Set<string>;
};

export const findPlayerMarkers = (
  root: ParentNode = document
): PlayerMarker[] =>
  Array.from(
    root.querySelectorAll<HTMLButtonElement>(
      `button[title="${MARKER_TITLE}"], button[${EXT_MARKER_TITLE_ATTR}]`
    )
  ).flatMap((marker) => {
    // A table row, or the pitch card's wrapper
    const player = marker.parentElement?.closest("tr, [variant]");
    if (!player) return [];

    const team = player.querySelector("p[code]")?.getAttribute("code");
    const headshot = Array.from(player.querySelectorAll("img"))
      .map((img) => img.getAttribute("src")?.match(HEADSHOT)?.[1])
      .find(Boolean);
    const texts = new Set(
      Array.from(player.querySelectorAll("*"))
        .filter((el) => !el.children.length)
        .map((el) => el.textContent?.trim() ?? "")
        .filter(Boolean)
    );

    return [
      {
        marker,
        teamCode: team ? Number(team) : null,
        playerCode: headshot ? Number(headshot) : null,
        texts,
      },
    ];
  });
