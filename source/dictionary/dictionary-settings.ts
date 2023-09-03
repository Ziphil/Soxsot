//

import {
  PlainRevisions,
  Revisions
} from "./revision";


export class DictionarySettings {

  public version: string;
  public alphabetRule: string;
  public revisions: Revisions;

  public constructor(version: string, alphabetRule: string, revisions: Revisions) {
    this.version = version;
    this.alphabetRule = alphabetRule;
    this.revisions = revisions;
  }

  public static createEmpty(): DictionarySettings {
    const version = "";
    const alphabetRule = "";
    const revisions = new Revisions();
    const settings = new DictionarySettings(version, alphabetRule, revisions);
    return settings;
  }

  public static fromPlain(plain: PlainDictionarySettings): DictionarySettings {
    const version = plain.version;
    const alphabetRule = plain.alphabetRule;
    const revisions = Revisions.fromPlain(plain.revisions);
    const settings = new DictionarySettings(version, alphabetRule, revisions);
    return settings;
  }

  public toPlain(): PlainDictionarySettings {
    const version = this.version;
    const alphabetRule = this.alphabetRule;
    const revisions = this.revisions.toPlain();
    return {version, alphabetRule, revisions};
  }

}


export interface PlainDictionarySettings {

  version: string;
  alphabetRule: string;
  revisions: PlainRevisions;

}