//

import JSON_SHAL_DATA from "./shal-data.json";


export const SHAL_DATA = JSON_SHAL_DATA;

export type ShalSort = keyof typeof SHAL_DATA["sort"];
export type ShalCategory = keyof typeof SHAL_DATA["category"];
export type ShalTense = keyof typeof SHAL_DATA["tense"];
export type ShalAspect = keyof typeof SHAL_DATA["aspect"];
export type ShalVoice = keyof typeof SHAL_DATA["voice"];
export type ShalPolarity = keyof typeof SHAL_DATA["polarity"];