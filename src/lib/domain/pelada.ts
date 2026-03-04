export const PELADA_STATUS_VALUES = ["open", "voting", "closed"] as const;

export type PeladaStatus = (typeof PELADA_STATUS_VALUES)[number];

export const RANKING_TIE_POLICY =
  "Dense ranking ordered by avg desc, total ratings desc, username asc." as const;

