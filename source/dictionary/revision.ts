//

import {
  IgnoreOptions,
  StringNormalizer
} from "../util/string-normalizer";


export class Revisions extends Array<Revision> {

  public constructor(...args: any) {
    super(...args);
    Object.setPrototypeOf(this, new.target.prototype);
  }

  public static fromPlain(plain: PlainRevisions): Revisions {
    let rawRevisions = plain.map((plainRevision) => Revision.fromPlain(plainRevision));
    let revisions = new Revisions(...rawRevisions);
    return revisions;
  }

  public toPlain(): PlainRevisions {
    return this.map((revision) => revision.toPlain());
  }

  public resolve(name: string, ignoreOptions?: IgnoreOptions): Array<string> {
    let outerThis = this;
    let resolveRec = function (currentName: string, beforeNames: Array<string>): Array<string> {
      let normalizedCurrentName = StringNormalizer.normalize(currentName, ignoreOptions);
      let revisions = outerThis.filter((revision) => {
        let normalizedBeforeName = StringNormalizer.normalize(revision.beforeName, ignoreOptions);
        return normalizedBeforeName === normalizedCurrentName;
      });
      let resultNames = [];
      for (let revision of revisions) {
        if (beforeNames.includes(revision.afterName)) {
        } else {
          let result = resolveRec(revision.afterName, [...beforeNames, revision.afterName]);
          resultNames.push(revision.afterName, ...result);
        }
      }
      return resultNames;
    };
    let resultNames = resolveRec(name, [name]);
    return resultNames;
  }

}


export class Revision implements PlainRevision {

  public date: number | null;
  public beforeName: string;
  public afterName: string;

  public constructor(date: number | null, beforeName: string, afterName: string) {
    this.date = date;
    this.beforeName = beforeName;
    this.afterName = afterName;
  }

  public static fromPlain(plain: PlainRevision): Revision {
    let date = plain.date;
    let beforeName = plain.beforeName;
    let afterName = plain.afterName;
    let revision = new Revision(date, beforeName, afterName);
    return revision;
  }

  public toPlain(): PlainRevision {
    return this;
  }

}


export interface PlainRevision {

  date: number | null;
  beforeName: string;
  afterName: string;

}


export interface PlainRevisions extends Array<PlainRevision> {

}