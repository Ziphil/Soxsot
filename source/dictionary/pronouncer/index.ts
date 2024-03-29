//

import {
  Pronouncer
} from "./pronouncer";
import {
  ShalPronouncer
} from "./shal-pronouncer";
import {
  StablePronouncer
} from "./stable-pronouncer";


export * from "./pronouncer";
export * from "./stable-pronouncer";


export class PronouncerCreator {

  public static createByVersion(version: string, configs?: PronouncerConfigs): Pronouncer | undefined {
    const match = version.match(/^(\w+)(?:\.(\w+))?$/);
    if (match !== null) {
      const generation = match[1] ?? "";
      const subgeneration = match[2] !== undefined ? parseInt(match[2], 10) : 0;
      if (generation === "6" || (generation === "7" && subgeneration <= 1) || generation === "S") {
        return new StablePronouncer(configs);
      } else if (generation === "7" && subgeneration >= 2) {
        return new ShalPronouncer(configs);
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

}


export type PronouncerConfigs = {
  showSyllables?: boolean,
  light?: boolean
};