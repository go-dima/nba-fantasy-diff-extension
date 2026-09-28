import { Bootstrap } from "../api";

export const DAY = 24 * 3600;
export const START = 1_800_000_000;

// Gameweek 1 has 6 days (events 1-6), gameweek 2 has 7 (events 7-13)
export const bootstrap: Bootstrap = {
  events: Array.from({ length: 13 }, (_, i) => ({
    id: i + 1,
    deadline_time_epoch: START + i * DAY,
  })),
  phases: [
    { id: 1, name: "Overall", start_event: 1, stop_event: 13 },
    { id: 2, name: "Gameweek 1", start_event: 1, stop_event: 6 },
    { id: 3, name: "Gameweek 2", start_event: 7, stop_event: 13 },
  ],
  teams: [
    { id: 1, code: 1610612737, name: "Atlanta Hawks" },
    { id: 2, code: 1610612738, name: "Boston Celtics" },
    { id: 3, code: 1610612751, name: "Brooklyn Nets" },
  ],
};
