// Header captured from /leagues/671/standings/c on 2026-09-27.
// Row markup is assumed (tbody was empty pre-season).
export const standingsTable = (rows: string[][]) => /* html */ `
  <table class="sc-khLCKb">
    <thead><tr>
      <th>Rank</th><th>Team &amp; General Manager</th>
      <th><span>GD</span></th><th><span>TOT</span></th>
    </tr></thead>
    <tbody>
      ${rows
        .map((cells) => `<tr>${cells.map((c) => `<td>${c}</td>`).join("")}</tr>`)
        .join("")}
    </tbody>
  </table>
`;
