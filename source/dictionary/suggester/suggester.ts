//

import {
  IgnoreOptions,
  StringNormalizer
} from "../../util/string-normalizer";
import {
  Dictionary
} from "../dictionary";
import {
  Suggestion
} from "../suggestion";
import {
  Word
} from "../word";


export abstract class Suggester {

  protected search: string;
  protected normalizedSearch: string;
  protected ignoreOptions: IgnoreOptions;

  public constructor(search: string, ignoreOptions: IgnoreOptions) {
    this.search = search;
    this.normalizedSearch = StringNormalizer.normalize(search, ignoreOptions);
    this.ignoreOptions = ignoreOptions;
  }

  public abstract prepare(): void;

  public abstract presuggest(dictionary: Dictionary): Array<Suggestion>;

  public abstract suggest(word: Word, dictionary: Dictionary): Array<Suggestion>;

}