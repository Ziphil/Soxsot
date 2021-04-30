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

  public static createByVersion(version: string, search: string, ignoreOptions: IgnoreOptions): Suggester | undefined {
    if (version === "S") {
      return new StableInflectionSuggester(search, ignoreOptions);
    } else {
      return undefined;
    }
  }

}