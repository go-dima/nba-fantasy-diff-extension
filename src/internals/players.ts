// Player records live in a state slice's `byId` map. The site derives
// `search_name` from the short `web_name` and matches queries against it.
export type Player = {
  web_name: string;
  search_name: string;
  first_name?: string;
  second_name?: string;
  known_name?: string;
};

type ById = Record<string, Player>;

// Same character mapping the site applies to both names and queries
const FROM = "ąàáäâãåæăćčĉęèéëêĝĥìíïîĵłľńňòóöőôõðøśșşšŝťțţŭùúüűûñÿýçżźž.";
const TO = "aaaaaaaaaccceeeeeghiiiijllnnoooooooossssstttuuuuuunyyczzz ";

export const normalizeName = (name: string) =>
  Array.from(name.toLowerCase(), (char) => {
    const index = FROM.indexOf(char);
    return index === -1 ? char : TO[index];
  }).join("");

// The site's query matcher: the query must start a word in search_name
export const matchesSearch = (searchName: string, query: string) => {
  const q = normalizeName(query).replace(/[-/\\^$*+?.()|[\]{}]/g, "\\$&");
  return new RegExp(`(^${q}| ${q})`).test(searchName);
};

const isPlayerMap = (value: unknown): value is ById => {
  if (!value || typeof value !== "object") return false;
  const first = Object.values(value)[0];
  return (
    !!first &&
    typeof first === "object" &&
    typeof first.search_name === "string" &&
    "first_name" in first
  );
};

// Builds a state transform applying `update` to every player once.
// Unchanged state keeps its identity for the site's selectors.
export const createPlayersUpdater = (update: (player: Player) => Player) => {
  const updated = new WeakSet<object>();

  const updateById = (byId: ById): ById => {
    const result: ById = {};
    for (const [id, player] of Object.entries(byId)) {
      result[id] = update(player);
    }
    updated.add(result);
    return result;
  };

  return <S>(state: S): S => {
    if (!state || typeof state !== "object") return state;

    const source = state as Record<string, unknown>;
    let next: Record<string, unknown> | null = null;
    for (const [key, slice] of Object.entries(source)) {
      const byId = (slice as { byId?: unknown } | null)?.byId;
      if (!isPlayerMap(byId) || updated.has(byId)) continue;

      const target = (next ??= { ...source });
      target[key] = { ...(slice as object), byId: updateById(byId) };
    }
    return (next as S) ?? state;
  };
};
