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

  protected text: string;
  protected normalizedText: string;
  protected ignoreOptions: IgnoreOptions;

  public constructor(text: string, ignoreOptions: IgnoreOptions) {
    this.text = text;
    this.normalizedText = StringNormalizer.normalize(text, ignoreOptions);
    this.ignoreOptions = ignoreOptions;
  }

  public abstract prepare(): void;

  public abstract presuggest(dictionary: Dictionary): Array<Suggestion>;

  public abstract suggest(word: Word, dictionary: Dictionary): Array<Suggestion>;

}