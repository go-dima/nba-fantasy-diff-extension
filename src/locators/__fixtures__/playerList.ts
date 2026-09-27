// Captured from /transfers "Player Selection" on 2026-09-27 (hashed classes trimmed)
export type ListRow = { first: string; last: string; team: string; code: number };

const row = ({ first, last, team, code }: ListRow) => /* html */ `
  <tr class="sc-row">
    <td><button title="View player information"></button></td>
    <td class="sc-player"><button><div>
      <div>${first}</div><div>${last}</div>
      <p code="${code}" title="${team}"><strong>${team}</strong></p>
      <p elementtypeid="2" title="Front Court">FC</p>
    </div></button></td>
    <td class="sc-stat">23.0</td>
    <td class="sc-stat">4464</td>
    <td class="sc-add"><button aria-label="Add player"></button></td>
  </tr>
`;

export const playerListTable = (rows: ListRow[]) => /* html */ `
  <table elementtypeid="2" class="sc-khLCKb">
    <thead><tr>
      <th>&nbsp;</th>
      <th class="sc-head"><span>Front Court</span></th>
      <th class="sc-price"><span>$</span></th>
      <th class="sc-sort">**</th>
      <th class="sc-addhead">&nbsp;</th>
    </tr></thead>
    <tbody>${rows.map(row).join("")}</tbody>
  </table>
`;

export const JOKIC: ListRow = { first: "Nikola", last: "Jokic", team: "DEN", code: 1610612743 };
export const JOHNSON: ListRow = { first: "Jalen", last: "Johnson", team: "ATL", code: 1610612737 };
