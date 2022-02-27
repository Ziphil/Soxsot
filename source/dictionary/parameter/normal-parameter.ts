//

import {
  IgnoreOptions,
  StringNormalizer
} from "../../util/string-normalizer";
import {
  Dictionary
} from "../dictionary";
import {
  InflectionSuggesterCreator
} from "../suggester/inflection-suggester-creator";
import {
  RevisionSuggester
} from "../suggester/revision-suggester";
import {
  Suggester
} from "../suggester/suggester";
import {
  Word
} from "../word";
import {
  Parameter,
  WordMode,
  WordType
} from "./parameter";


export class NormalParameter extends Parameter {

  public readonly text: string;
  public readonly mode: WordMode;
  public readonly type: WordType;
  public readonly language: string;
  public readonly ignoreOptions: IgnoreOptions;

  public constructor(text: string, mode: WordMode, type: WordType, language: string, ignoreOptions?: IgnoreOptions) {
    super();
    this.text = text;
    this.mode = mode;
    this.type = type;
    this.language = language;
    this.ignoreOptions = ignoreOptions ?? this.getDefaultIgnoreOptions();
  }

  public static createEmpty(language: string): NormalParameter {
    let parameter = new NormalParameter("", "both", "prefix", language);
    return parameter;
  }

  public match(word: Word): boolean {
    let candidates = Parameter.createCandidates(word, this.mode, this.language);
    let matcher = Parameter.createMatcher(this.type);
    let normalizedText = StringNormalizer.normalize(this.text, this.ignoreOptions);
    let predicate = candidates.some((candidate) => {
      let normalizedCandidate = StringNormalizer.normalize(candidate, this.ignoreOptions);
      return matcher(normalizedText, normalizedCandidate);
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
      let revisionSuggester = new RevisionSuggester(this.text, this.ignoreOptions);
      let inflectionSuggester = InflectionSuggesterCreator.createByVersion(dictionary.settings.version, this.text, this.ignoreOptions);
      suggesters.push(revisionSuggester);
      if (inflectionSuggester !== undefined) {
        suggesters.push(inflectionSuggester);
      }
    }
    return suggesters;
  }

}