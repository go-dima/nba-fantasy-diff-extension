// Captured from /transfers on 2026-09-27 (hashed classes trimmed)
const DASH = `<svg width="17" height="5" viewBox="0 0 17 5" class="sc-dash"><rect x="0.5" y="0.5" width="16" height="4" fill="#7A7A7A"></rect></svg>`;

const logo = (code: number, name: string) =>
  `<img alt="${name}" role="" src="//cdn.nba.com/logos/nba/${code}/global/L/logo.svg" width="30px" class="sc-logo">`;

export type FixtureRow = { team: string; code: number; days: string[] };

const row = ({ team, code, days }: FixtureRow) => /* html */ `
  <tr variant="" class="sc-row">
    <td><button title="View player information"></button></td>
    <td><button><div>
      <div class="sc-name">Player ${team}</div>
      <p code="${code}" title="${team}"><strong>${team}</strong></p>
      <p elementtypeid="2" title="Front Court">FC</p>
    </div></button></td>
    <td>5.0</td><td>0.0</td><td>1055</td>
    ${days.map((d) => `<td class="sc-day">${d}</td>`).join("")}
  </tr>
`;

export const transfersTable = (gameweek: number, rows: FixtureRow[], firstDay = 1) => /* html */ `
  <table elementtypeid="2" class="sc-khLCKb">
    <thead><tr>
      <th>&nbsp;</th><th><span>Front Court</span></th>
      <th><span>SS</span></th><th><span>F</span></th><th><span>TP</span></th>
      ${[0, 1, 2, 3, 4]
        .map((i) => `<th scope="colgroup" class="sc-dayhead">GW${gameweek}.${firstDay + i}</th>`)
        .join("")}
    </tr></thead>
    <tbody>${rows.map(row).join("")}</tbody>
  </table>
`;

export const cells = { DASH, logo };
