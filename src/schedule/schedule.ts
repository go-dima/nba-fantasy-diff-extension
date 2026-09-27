export const DAYS_PER_WEEK = 7;

export type Team = { id: number; code: number; name: string };

export type Bootstrap = {
  events: { id: number; deadline_time_epoch: number }[];
  phases: { id: number; name: string; start_event: number; stop_event: number }[];
  teams: Team[];
};

export type Fixture = { event: number; team_h: number; team_a: number };

export type Opponent = { code: number; name: string };

export type Day = {
  label: string;
  exists: boolean;
  past: boolean;
  // Keyed by the NBA team code shown in the table rows
  opponents: Map<number, Opponent[]>;
};

export const findGameweekPhase = (bootstrap: Bootstrap, gameweek: number) =>
  bootstrap.phases.find((phase) => phase.name === `Gameweek ${gameweek}`);

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

export type GameCount = { remaining: number; total: number };

// Games per team code across the week; remaining excludes past days
export const countGames = (week: Day[]): Map<number, GameCount> => {
  const counts = new Map<number, GameCount>();
  week.forEach((day) => {
    day.opponents.forEach((opponents, code) => {
      const count = counts.get(code) ?? { remaining: 0, total: 0 };
      count.total += opponents.length;
      if (!day.past) count.remaining += opponents.length;
      counts.set(code, count);
    });
  });
  return counts;
};
