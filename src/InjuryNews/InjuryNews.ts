import {
  EXT_MARKER_TITLE_ATTR,
  MARKER_TITLE,
  PlayerMarker,
  findPlayerMarkers,
} from "../locators";
import { PlayerElement, loadBootstrap, parseNews } from "../schedule";

// "2026-11-28\nLower Leg"
export const formatNews = (news: string) => {
  const parsed = parseNews(news);
  return parsed ? `${parsed.returnDate}\n${parsed.reason}` : news;
};

// By headshot, else by name within the team. Pitch cards only show the
// short name, which can be shared (OKC has two "J.Williams").
const findPlayer = (elements: PlayerElement[], shown: PlayerMarker) => {
  if (shown.playerCode !== null) {
    const byCode = elements.find((p) => p.code === shown.playerCode);
    if (byCode) return byCode;
  }
  const team = elements.filter((p) => p.team_code === shown.teamCode);
  const byName = team.filter(
    (p) => shown.texts.has(p.first_name) && shown.texts.has(p.second_name)
  );
  const byWebName = team.filter((p) => shown.texts.has(p.web_name));
  return [byName, byWebName].find((found) => found.length === 1)?.[0];
};

// null restores the site's own title
const setTooltip = ({ marker }: PlayerMarker, text: string | null) => {
  if (text === null) marker.removeAttribute(EXT_MARKER_TITLE_ATTR);
  else marker.setAttribute(EXT_MARKER_TITLE_ATTR, "");
  const title = text ?? MARKER_TITLE;
  if (marker.title !== title) marker.title = title;
};

// Shows a player's injury news as the tooltip of their status marker
export const ShowInjuryNews = async () => {
  if (!findPlayerMarkers().length) return;

  let elements: PlayerElement[];
  try {
    elements = (await loadBootstrap()).elements ?? [];
  } catch {
    return;
  }

  // The DOM may have changed while loading
  findPlayerMarkers().forEach((shown) => {
    const player = findPlayer(elements, shown);
    setTooltip(shown, player?.news ? formatNews(player.news) : null);
  });
};
