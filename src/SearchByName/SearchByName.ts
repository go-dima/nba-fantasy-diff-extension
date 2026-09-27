import {
  Player,
  createPlayersUpdater,
  installStateTransform,
  normalizeName,
} from "../internals";

// Append the full name to search_name so first names match too
// ("c boozer" -> "c boozer cameron boozer").
export const withFullNames = (player: Player): Player => {
  const { first_name, second_name, known_name, search_name } = player;
  const extra = [[first_name, second_name].filter(Boolean).join(" "), known_name]
    .filter((name): name is string => Boolean(name))
    .map(normalizeName)
    .filter((name) => !search_name.includes(name));

  return extra.length
    ? { ...player, search_name: [search_name, ...extra].join(" ") }
    : player;
};

export const InstallSearchByName = () =>
  installStateTransform(createPlayersUpdater(withFullNames));
