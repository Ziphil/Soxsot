//

import {
  IgnoreOptions
} from "../../util/string-normalizer";
import {
  StableInflectionSuggester
} from "./stable-inflection-suggester";
import {
  Suggester
} from "./suggester";


export class InflectionSuggesterCreator {

  public static createByVersion(version: string, text: string, ignoreOptions: IgnoreOptions): Suggester | undefined {
    if (version === "S") {
      return new StableInflectionSuggester(text, ignoreOptions);
    } else {
      return undefined;
    }
  }

}