//

import {
  ObjectUtil
} from "../../util/object";
import {
  IgnoreOptions
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
import {
  Suggester
} from "./suggester";


export class RevisionSuggester extends Suggester {

  private search: string;
  private ignoreOptions: IgnoreOptions;

  public constructor(search: string, ignoreOptions: IgnoreOptions) {
    super();
    this.search = search;
    this.ignoreOptions = ignoreOptions;
  }

  public prepare(): void {
  }

  public presuggest(dictionary: Dictionary): Array<Suggestion> {
    let revisions = dictionary.settings.revisions;
    let names = revisions.resolve(this.search, this.ignoreOptions);
    if (names.length > 0) {
      let suggestion = new RevisionSuggestion(names);
      return [suggestion];
    } else {
      return [];
    }
  }

  public suggest(word: Word, dictionary: Dictionary): Array<Suggestion> {
    return [];
  }

}


export class RevisionSuggestion extends Suggestion<"revision"> {

  public constructor(names: ReadonlyArray<string>) {
    super("revision", names);
  }

  public getKindName(language: string): string | undefined {
    return ObjectUtil.get(REVISION_SUGGESTION_NAMES, language);
  }

  public getKeywords(language: string): Array<string | undefined> {
    return [];
  }

}


export const REVISION_SUGGESTION_NAMES = {ja: "綴り改定", en: "Spelling revision"};