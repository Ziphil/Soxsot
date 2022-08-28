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

  public constructor(text: string, ignoreOptions: IgnoreOptions) {
    super(text, ignoreOptions);
  }

  public prepare(): void {
  }

  public presuggest(dictionary: Dictionary): Array<Suggestion> {
    const revisions = dictionary.settings.revisions;
    const names = revisions.resolve(this.text, this.ignoreOptions);
    if (names.length > 0) {
      const suggestion = new RevisionSuggestion(names);
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
    super("revision", [], names);
  }

  public getKindName(language: string): string | undefined {
    return ObjectUtil.get(REVISION_SUGGESTION_NAMES, language);
  }

  protected getDescriptionName(kind: string, type: string, language: string): string | undefined {
    return undefined;
  }

}


export const REVISION_SUGGESTION_NAMES = {ja: "綴り改定", en: "Spelling revision"};