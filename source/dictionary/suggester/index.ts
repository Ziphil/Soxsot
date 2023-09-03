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
import type {
  Suggester
} from "./suggester";


export * from "./revision-suggester";
export * from "./shal-inflection-suggester";
export * from "./stable-inflection-suggester";
export * from "./suggester";


export class InflectionSuggesterCreator {

  public static createByVersion(version: string, text: string, ignoreOptions: IgnoreOptions): Suggester | undefined {
    const match = version.match(/^(\w+)(?:\.(\w+))?$/);
    const generation = match?.[1] ?? "";
    const subgeneration = match?.[2] ?? "";
    if (generation === "6" || generation === "S") {
      return new StableInflectionSuggester(text, ignoreOptions);
    } else if (version.match(/^7(\.\d+)?$/)) {
      return new ShalInflectionSuggester(text, ignoreOptions);
    } else {
      return undefined;
    }
  }

}