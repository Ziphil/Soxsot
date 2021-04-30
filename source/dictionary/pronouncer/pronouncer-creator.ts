//

import {
  Pronouncer
} from "./pronouncer";
import {
  StablePronouncer
} from "./stable-pronouncer";


export class PronouncerCreator {

  public static createByVersion(version: string): Pronouncer | undefined {
    if (version === "S") {
      return new StablePronouncer();
    } else {
      return undefined;
    }
  }

}