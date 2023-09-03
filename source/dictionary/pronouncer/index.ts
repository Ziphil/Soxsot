//

import {
  Pronouncer
} from "./pronouncer";
import {
  StablePronouncer
} from "./stable-pronouncer";


export * from "./pronouncer";
export * from "./stable-pronouncer";


export class PronouncerCreator {

  public static createByVersion(version: string): Pronouncer | undefined {
    if (version.match(/^6(\.\d+)?$/) || version.match(/^7(\.\d+)?$/) || version === "S") {
      return new StablePronouncer();
    } else {
      return undefined;
    }
  }

}