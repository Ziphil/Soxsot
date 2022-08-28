//

import {
  NewHairianDate
} from "talqis";
import {
  Writable
} from "ts-essentials";
import {
  v1 as uuid
} from "uuid";
import {
  Dictionary
} from "./dictionary";
import {
  ValidationError
} from "./error";
import {
  Marker
} from "./marker";
import {
  Parser
} from "./parser";


export class Word {

  public readonly dictionary?: Dictionary;
  public readonly uid: string;
  public readonly name!: string;
  public readonly uniqueName: string;
  public readonly date: number;
  public readonly contents: Contents;
  public readonly equivalentNames!: EquivalentNames;
  private comparisonString!: string;

  public constructor(uniqueName: string, date: number, contents: Contents) {
    this.uid = uuid();
    this.uniqueName = uniqueName;
    this.date = date;
    this.contents = contents;
    this.update(false);
  }

  public static createEmpty(): Word {
    const name = "";
    const date = NewHairianDate.current().getHairia(true);
    const contents = {ja: "+ <>\n= <>\n\nM:"};
    const word = new Word(name, date, contents);
    return word;
  }

  public static fromPlain(plain: PlainWord): Word {
    const uniqueName = plain.uniqueName;
    const date = plain.date;
    const contents = plain.contents;
    const word = new Word(uniqueName, date, contents);
    word.writable.uid = plain.uid;
    return word;
  }

  public toPlain(): PlainWord {
    const uid = this.uid;
    const uniqueName = this.uniqueName;
    const date = this.date;
    const contents = this.contents;
    return {uid, uniqueName, date, contents};
  }

  // この単語オブジェクトが属する辞書オブジェクトを設定します。
  // ローダーなどを通さずに手動で単語オブジェクトを生成した際は、必ずこのメソッドを使って辞書オブジェクトを設定してください。
  public setDictionary(dictionary: Dictionary): void {
    this.writable.dictionary = dictionary;
    this.updateComparisonString();
  }

  public reissueUid(): void {
    this.writable.uid = uuid();
  }

  public refreshDate(): void {
    const date = NewHairianDate.current().getHairia(true);
    this.writable.date = date;
  }

  public copy(): Word {
    this.ensureDictionary();
    const word = new Word(this.uniqueName, this.date, this.contents);
    word.setDictionary(this.dictionary);
    return word;
  }

  // この単語オブジェクトの内容を与えられたデータで上書きします。
  // ただし、UID は上書きされません。
  public edit(newWord: PlainWord, skipValidate?: boolean): void {
    const errorType = (skipValidate) ? null : this.validateEdit(newWord);
    if (errorType === null) {
      this.writable.uniqueName = newWord.uniqueName;
      this.writable.date = newWord.date;
      this.writable.contents = Object.fromEntries(Object.entries(newWord.contents).map(([language, content]) => [language, content?.trim()]));
      this.update(true);
    } else {
      throw new ValidationError(errorType);
    }
  }

  public validateEdit(newWord: PlainWord): string | null {
    if (!Word.isValidUniqueName(newWord.uniqueName)) {
      return "invalidUniqueName";
    } else {
      return null;
    }
  }

  public get markers(): Array<Marker> {
    this.ensureDictionary();
    const markers = this.dictionary.markers.get(this.uniqueName);
    return markers;
  }

  public toggleMarker(marker: Marker): void {
    this.ensureDictionary();
    this.dictionary.markers.toggle(this.uniqueName, marker);
  }

  private update(full: boolean): void {
    this.updateName();
    this.updateEquivalentNames();
    if (full) {
      this.updateComparisonString();
    }
  }

  private updateName(): void {
    const name = this.uniqueName.replace(/~/g, "");
    this.writable.name = name;
  }

  private updateEquivalentNames(): void {
    const equivalentNames = {} as Writable<EquivalentNames>;
    const parser = Parser.createSimple();
    for (const [language] of Object.entries(this.contents)) {
      equivalentNames[language] = [...(parser.lookupEquivalentNames(this, language) ?? []), ...(parser.lookupPhraseEquivalentNames(this, language) ?? [])];
    }
    this.writable.equivalentNames = equivalentNames;
  }

  private updateComparisonString(): void {
    this.ensureDictionary();
    let comparisonString = "";
    const alphabetRule = this.dictionary.settings.alphabetRule;
    const apostrophe = alphabetRule.includes("'");
    for (let i = 0 ; i < this.uniqueName.length ; i ++) {
      const char = this.uniqueName.charAt(i);
      if ((apostrophe || char !== "'") && char !== "-" && char !== "+" && char !== "~") {
        const position = alphabetRule.indexOf(char);
        if (position >= 0) {
          comparisonString += String.fromCodePoint(position + 200);
        } else {
          comparisonString += String.fromCodePoint(1000);
        }
      }
    }
    const match = this.uniqueName.match(/^(\+)?(')?(.+?)(')?(\+)?(~*)$/);
    if (match) {
      if (match[2]) {
        comparisonString += String.fromCodePoint(150);
      }
      if (match[4]) {
        comparisonString += String.fromCodePoint(151);
      }
      if (match[1]) {
        comparisonString += String.fromCodePoint(160);
      }
      if (match[5]) {
        comparisonString += String.fromCodePoint(161);
      }
      if (match[6].length > 0) {
        comparisonString += String.fromCodePoint(match[6].length + 100);
      }
    } else {
      throw new Error("cannot happen");
    }
    this.comparisonString = comparisonString;
  }

  private ensureDictionary(): asserts this is Word & {dictionary: Dictionary} {
    if (!this.dictionary) {
      throw new Error("no dictionary set");
    }
  }

  public static sortWords(words: Array<Word>): Array<Word> {
    const sortedWords = words.sort((firstWord, secondWord) => {
      const firstComparisonString = firstWord.comparisonString;
      const secondComparisonString = secondWord.comparisonString;
      if (firstComparisonString < secondComparisonString) {
        return -1;
      } else if (firstComparisonString > secondComparisonString) {
        return 1;
      } else {
        return 0;
      }
    });
    return sortedWords;
  }

  public static isValidUniqueName(uniqueName: string): boolean {
    return uniqueName.match(/^(\+)?((?:\p{L}|-|')+?)(\+)?(~*)$/u) !== null;
  }

  private get writable(): Writable<this> {
    return this;
  }

}


export interface PlainWord {

  uid: string;
  uniqueName: string;
  date: number;
  contents: PlainContents;

}


export type EquivalentNames = {readonly [language: string]: ReadonlyArray<string> | undefined};
export type Contents = {readonly [language: string]: string | undefined};
export type PlainContents = Writable<Contents>;