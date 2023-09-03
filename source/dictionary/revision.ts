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
    const rawRevisions = plain.map((plainRevision) => Revision.fromPlain(plainRevision));
    const revisions = new Revisions(...rawRevisions);
    return revisions;
  }

  public toPlain(): PlainRevisions {
    return this.map((revision) => revision.toPlain());
  }

  public resolve(name: string, ignoreOptions?: IgnoreOptions): Array<string> {
    const outerThis = this;
    const resolveRec = function (currentName: string, beforeNames: Array<string>): Array<string> {
      const normalizedCurrentName = StringNormalizer.normalize(currentName, ignoreOptions);
      const revisions = outerThis.filter((revision) => {
        const normalizedBeforeName = StringNormalizer.normalize(revision.beforeName, ignoreOptions);
        return normalizedBeforeName === normalizedCurrentName;
      });
      const resultNames = [];
      for (const revision of revisions) {
        if (beforeNames.includes(revision.afterName)) {
        } else {
          const result = resolveRec(revision.afterName, [...beforeNames, revision.afterName]);
          resultNames.push(revision.afterName, ...result);
        }
      }
      return resultNames;
    };
    const resultNames = resolveRec(name, [name]);
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
    const date = plain.date;
    const beforeName = plain.beforeName;
    const afterName = plain.afterName;
    const revision = new Revision(date, beforeName, afterName);
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