import { Bootstrap, Fixture, findGameweekPhase } from "./schedule";

export type WeekData = { bootstrap: Bootstrap; fixtures: Fixture[] };

const getJson = async <T>(path: string): Promise<T> => {
  const response = await fetch(`/api/${path}`, { credentials: "same-origin" });
  if (!response.ok) throw new Error(`${path}: ${response.status}`);
  return response.json();
};

let bootstrap: Promise<Bootstrap> | null = null;
const weeks = new Map<number, Promise<WeekData>>();

const cached = <T>(promise: Promise<T>, onError: () => void) =>
  promise.catch((error) => {
    onError();
    throw error;
  });

export const loadWeekData = (gameweek: number): Promise<WeekData> => {
  bootstrap ??= cached(getJson<Bootstrap>("bootstrap-static/"), () => {
    bootstrap = null;
  });

  let week = weeks.get(gameweek);
  if (!week) {
    week = cached(
      bootstrap.then(async (data) => {
        const phase = findGameweekPhase(data, gameweek);
        const fixtures = phase
          ? await getJson<Fixture[]>(`fixtures/?phase=${phase.id}`)
          : [];
        return { bootstrap: data, fixtures };
      }),
      () => weeks.delete(gameweek)
    );
    weeks.set(gameweek, week);
  }
  return week;
};

export const clearWeekDataCache = () => {
  bootstrap = null;
  weeks.clear();
};
