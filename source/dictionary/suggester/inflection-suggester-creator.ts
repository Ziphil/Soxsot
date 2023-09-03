//

import {
  IgnoreOptions
} from "../../util/string-normalizer";
import {
  ShalInflectionSuggester
} from "./shal-inflection-suggester";
import {
  StableInflectionSuggester
} from "./stable-inflection-suggester";
import {
  Suggester
} from "./suggester";


export class InflectionSuggesterCreator {

  public static createByVersion(version: string, text: string, ignoreOptions: IgnoreOptions): Suggester | undefined {
    if (version.match(/^6(\.\d+)?$/) || version === "S") {
      return new StableInflectionSuggester(text, ignoreOptions);
    } else if (version.match(/^7(\.\d+)?$/)) {
      return new ShalInflectionSuggester(text, ignoreOptions);
    } else {
      return undefined;
    }
  }

}