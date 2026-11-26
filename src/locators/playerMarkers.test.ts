import { beforeEach, describe, expect, test } from "@jest/globals";
import { MARA, lineupListTable, pitchCard } from "./__fixtures__/lineup";
import { JOKIC, playerListTable } from "./__fixtures__/playerList";
import { EXT_MARKER_TITLE_ATTR, findPlayerMarkers } from "./playerMarkers";

describe("findPlayerMarkers", () => {
  beforeEach(() => {
    document.body.innerHTML = "";
  });

  test("finds the marker of a player list row", () => {
    document.body.innerHTML = playerListTable([JOKIC]);

    const [player, ...rest] = findPlayerMarkers();
    expect(rest).toHaveLength(0);
    expect(player.marker.closest("td")).toBe(document.querySelector("tbody td"));
    expect(player.teamCode).toBe(JOKIC.code);
    expect(player.texts).toEqual(new Set(["Nikola", "Jokic", "DEN", "FC", "23.0", "4464"]));
  });

  test("finds the marker, headshot and names of a lineup list row", () => {
    document.body.innerHTML = lineupListTable([MARA]);

    const [player] = findPlayerMarkers();
    expect(player.marker.getAttribute("variant")).toBe("list");
    expect(player.teamCode).toBe(1610612760);
    expect(player.playerCode).toBe(1643530);
    expect(player.texts.has("Aday") && player.texts.has("Mara")).toBe(true);
  });

  test("finds the marker, headshot and short name of a pitch card", () => {
    document.body.innerHTML = pitchCard(MARA) + pitchCard(MARA);

    const players = findPlayerMarkers();
    expect(players).toHaveLength(2);
    expect(players[0].marker.getAttribute("variant")).toBe("pitch");
    expect(players[0].teamCode).toBe(1610612760);
    expect(players[0].playerCode).toBe(1643530);
    expect(players[0].texts.has("A.Mara")).toBe(true);
  });

  test("still finds markers whose title the extension replaced", () => {
    document.body.innerHTML = pitchCard(MARA);
    const marker = document.querySelector("button[variant]")!;
    marker.setAttribute("title", "2026-11-28\nLower Leg");
    marker.setAttribute(EXT_MARKER_TITLE_ATTR, "");

    expect(findPlayerMarkers()).toHaveLength(1);
  });
});
