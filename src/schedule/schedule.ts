import { Bootstrap, Fixture, findGameweekPhase } from "./api";

export const DAYS_PER_WEEK = 7;

export type Opponent = { code: number; name: string };

export type Day = {
  label: string;
  exists: boolean;
  past: boolean;
  // Keyed by the NBA team code shown in the table rows
  opponents: Map<number, Opponent[]>;
};

export const buildWeek = (
  bootstrap: Bootstrap,
  fixtures: Fixture[],
  gameweek: number,
  now: number = Date.now()
): Day[] => {
  const phase = findGameweekPhase(bootstrap, gameweek);
  const teams = new Map(bootstrap.teams.map((team) => [team.id, team]));
  const events = new Map(bootstrap.events.map((event) => [event.id, event]));

  return Array.from({ length: DAYS_PER_WEEK }, (_, i) => {
    const label = `GW${gameweek}.${i + 1}`;
    const eventId = phase ? phase.start_event + i : -1;
    const event = phase && eventId <= phase.stop_event ? events.get(eventId) : undefined;
    const opponents = new Map<number, Opponent[]>();

    if (!event) return { label, exists: false, past: false, opponents };

    const addOpponent = (teamId: number, opponentId: number) => {
      const team = teams.get(teamId);
      const opponent = teams.get(opponentId);
      if (!team || !opponent) return;
      const list = opponents.get(team.code) ?? [];
      list.push({ code: opponent.code, name: opponent.name });
      opponents.set(team.code, list);
    };

    fixtures
      .filter((fixture) => fixture.event === event.id)
      .forEach(({ team_h, team_a }) => {
        addOpponent(team_h, team_a);
        addOpponent(team_a, team_h);
      });

    return {
      label,
      exists: true,
      past: event.deadline_time_epoch * 1000 <= now,
      opponents,
    };
  });
};

// Day numbers (1-7) each team code plays in the week, optionally
// skipping days whose deadline has passed
export const gameDays = (
  week: Day[],
  { remainingOnly = false } = {}
): Map<number, number[]> => {
  const days = new Map<number, number[]>();
  week.forEach((day, i) => {
    if (remainingOnly && day.past) return;
    day.opponents.forEach((_, code) => {
      days.set(code, [...(days.get(code) ?? []), i + 1]);
    });
  });
  return days;
};
