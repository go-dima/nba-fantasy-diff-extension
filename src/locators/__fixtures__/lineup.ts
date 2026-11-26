// Captured from /my-team on 2026-11-25 (hashed classes, svgs and fixtures trimmed)
export type LineupPlayer = {
  first: string;
  last: string;
  webName: string;
  team: string;
  teamCode: number;
  headshot: string;
};

export const headshotUrl = (code: number) =>
  `https://cdn.nba.com/headshots/nba/latest/260x190/${code}.png`;

const MARKER = (variant: string) =>
  `<button title="View player information" variant="${variant}"><svg></svg></button>`;

const teamTag = ({ team, teamCode }: LineupPlayer) =>
  `<p code="${teamCode}" title="${team}"><strong>${team}</strong></p>`;

// List view: a table row per player
export const lineupListTable = (players: LineupPlayer[]) => /* html */ `
  <table><tbody>${players
    .map(
      (p) => /* html */ `
    <tr variant="">
      <td>${MARKER("list")}</td>
      <td></td>
      <td><button><div>
        <div><img alt="" role="presentation" width="60px" src="${p.headshot}"></div>
        <div><div>
          <div><div>${p.first}</div></div>
          <div><span><div>${p.last}</div></span></div>
        </div><div>
          ${teamTag(p)}
          <p elementtypeid="2" title="Front Court">FC</p>
        </div></div>
      </div></button></td>
      <td>19.9</td><td>0</td><td>361</td>
    </tr>`
    )
    .join("")}</tbody></table>
`;

// Pitch (court) view: a card per player, short name only
export const pitchCard = (p: LineupPlayer) => /* html */ `
  <div variant=""><div>
    <div elementtype="2"><button type="button">
      <div><div>
        <div><img alt="" role="presentation" src="logo.svg"></div>
        <div mr="1">${teamTag(p)}</div>
      </div><div><img alt="" role="presentation" src="${p.headshot}"></div></div>
      <div elementtypeid="2"><div>${p.webName}</div><div></div></div>
    </button></div>
    <div><div><button type="button"><svg></svg></button></div>
      <div>${MARKER("pitch")}</div></div>
    <span></span><h3>3</h3>
  </div></div>
`;

const OKC = { team: "OKC", teamCode: 1610612760 };

export const MARA: LineupPlayer = {
  first: "Aday", last: "Mara", webName: "A.Mara", team: "OKC", teamCode: 1610612760,
  headshot: headshotUrl(1643530),
};
// Two OKC players share the short name "J.Williams"
export const JALEN_WILLIAMS: LineupPlayer = {
  first: "Jalen", last: "Williams", webName: "J.Williams", ...OKC, headshot: headshotUrl(1631114),
};
export const JAYLIN_WILLIAMS: LineupPlayer = {
  first: "Jaylin", last: "Williams", webName: "J.Williams", ...OKC, headshot: headshotUrl(1631119),
};
