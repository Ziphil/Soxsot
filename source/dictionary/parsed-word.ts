//

import {
  Part
} from "./part";


export class ParsedWord<S> {

  public readonly name: string;
  public readonly uniqueName: string;
  public readonly date: number;
  public readonly pronunciation: string | null;
  public readonly parts: Parts<S>;

  public constructor(name: string, uniqueName: string, date: number, pronunciation: string | null, parts: Parts<S>) {
    this.name = name;
    this.uniqueName = uniqueName;
    this.date = date;
    this.pronunciation = pronunciation;
    this.parts = parts;
  }

}


export type Parts<S> = {readonly [language: string]: Part<S> | undefined};