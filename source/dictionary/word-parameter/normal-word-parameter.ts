//

import {
  IgnoreOptions,
  StringNormalizer
} from "../../util/string-normalizer";
import {
  Dictionary
} from "../dictionary";
import {
  RevisionSuggester
} from "../suggester/revision-suggester";
import {
  InflectionSuggester
} from "../suggester/stable-inflection-suggester";
import {
  Suggester
} from "../suggester/suggester";
import {
  Word
} from "../word";
import {
  WordMode,
  WordParameter,
  WordType
} from "./word-parameter";


export class NormalWordParameter extends WordParameter {

  public search: string;
  public mode: WordMode;
  public type: WordType;
  public language: string;
  public ignoreOptions: IgnoreOptions;

  public constructor(search: string, mode: WordMode, type: WordType, language: string, ignoreOptions?: IgnoreOptions) {
    super();
    this.search = search;
    this.mode = mode;
    this.type = type;
    this.language = language;
    this.ignoreOptions = ignoreOptions ?? this.getDefaultIgnoreOptions();
  }

  public static createEmpty(language: string): NormalWordParameter {
    let parameter = new NormalWordParameter("", "both", "prefix", language);
    return parameter;
  }

  public match(word: Word): boolean {
    let candidates = WordParameter.createCandidates(word, this.mode, this.language);
    let matcher = WordParameter.createMatcher(this.type);
    let normalizedSearch = StringNormalizer.normalize(this.search, this.ignoreOptions);
    let predicate = candidates.some((candidate) => {
      let normalizedCandidate = StringNormalizer.normalize(candidate, this.ignoreOptions);
      return matcher(normalizedSearch, normalizedCandidate);
    });
    return predicate;
  }

  private getDefaultIgnoreOptions(): IgnoreOptions {
    let mode = this.mode;
    let type = this.type;
    if ((mode === "name" || mode === "both") && (type !== "pair" && type !== "regular")) {
      return {case: false, diacritic: true};
    } else {
      return {case: false, diacritic: false};
    }
  }

  protected createSuggesters(dictionary: Dictionary): Array<Suggester> {
    let mode = this.mode;
    let type = this.type;
    let suggesters = [];
    if ((mode === "name" || mode === "both") && (type === "exact" || type === "prefix")) {
      suggesters.push(new RevisionSuggester(this.search, this.ignoreOptions));
      if (dictionary.settings.version === "S") {
        suggesters.push(new InflectionSuggester(this.search, this.ignoreOptions));
      }
    }
    return suggesters;
  }

}