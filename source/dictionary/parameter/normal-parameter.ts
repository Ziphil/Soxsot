//

import {
  IgnoreOptions,
  StringNormalizer
} from "../../util/string-normalizer";
import {
  Dictionary
} from "../dictionary";
import {
  InflectionSuggesterCreator,
  RevisionSuggester,
  Suggester
} from "../suggester";
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

  /** 通常の検索パラメータを生成します。
   * `ignoreOptions` に `"default"` を指定すると、`mode` や `type` の記述に従ってデフォルトの無視設定が使用されます。*/
  public constructor(text: string, mode: WordMode, type: WordType, language: string, ignoreOptions: IgnoreOptions | "default") {
    super();
    this.text = text;
    this.mode = mode;
    this.type = type;
    this.language = language;
    this.ignoreOptions = ignoreOptions === "default" ? this.getDefaultIgnoreOptions() : ignoreOptions;
  }

  public static createEmpty(language: string): NormalParameter {
    const parameter = new NormalParameter("", "both", "prefix", language, {case: false, diacritic: false, space: true, wave: true});
    return parameter;
  }

  public match(word: Word): boolean {
    const candidates = Parameter.createCandidates(word, this.mode, this.language);
    const matcher = Parameter.createMatcher(this.type);
    const normalizedText = StringNormalizer.normalize(this.text, this.ignoreOptions);
    const predicate = candidates.some((candidate) => {
      const normalizedCandidate = StringNormalizer.normalize(candidate, this.ignoreOptions);
      return matcher(normalizedText, normalizedCandidate);
    });
    return predicate;
  }

  private getDefaultIgnoreOptions(): IgnoreOptions {
    const mode = this.mode;
    const type = this.type;
    if ((mode === "name" || mode === "both") && (type !== "pair" && type !== "regular")) {
      return {case: false, diacritic: true, space: true, wave: true};
    } else {
      return {case: false, diacritic: false, space: true, wave: true};
    }
  }

  protected createSuggesters(dictionary: Dictionary): Array<Suggester> {
    const mode = this.mode;
    const type = this.type;
    const suggesters = [];
    if ((mode === "name" || mode === "both") && (type === "exact" || type === "prefix")) {
      const revisionSuggester = new RevisionSuggester(this.text, this.ignoreOptions);
      const inflectionSuggester = InflectionSuggesterCreator.createByVersion(dictionary.settings.version, this.text, this.ignoreOptions);
      suggesters.push(revisionSuggester);
      if (inflectionSuggester !== undefined) {
        suggesters.push(inflectionSuggester);
      }
    }
    return suggesters;
  }

}