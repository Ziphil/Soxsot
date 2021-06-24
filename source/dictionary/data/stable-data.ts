//

import JSON_STABLE_DATA from "./stable-data.json";


export const STABLE_DATA = JSON_STABLE_DATA;

export type StableSort = keyof typeof STABLE_DATA["sort"];
export type StableCategory = keyof typeof STABLE_DATA["category"];
export type StableTense = keyof typeof STABLE_DATA["tense"];
export type StableAspect = keyof typeof STABLE_DATA["aspect"];
export type StableTransitivity = keyof typeof STABLE_DATA["transitivity"];
export type StablePolarity = keyof typeof STABLE_DATA["polarity"];