//

import {
  Dictionary
} from "../dictionary";
import {
  Suggester
} from "../suggester/suggester";
import {
  Suggestion
} from "../suggestion";
import {
  Word
} from "../word";


export abstract class Parameter {

  public abstract readonly language: string;
  private suggesters?: ReadonlyArray<Suggester>;

  protected abstract createSuggesters(dictionary: Dictionary): Array<Suggester>;

  public prepare(dictionary: Dictionary): void {
    this.suggesters = this.createSuggesters(dictionary);
    for (const suggester of this.suggesters) {
      suggester.prepare();
    }
  }

  public presuggest(dictionary: Dictionary): Array<Suggestion> {
    const suggestions = [];
    if (this.suggesters !== undefined) {
      for (const suggester of this.suggesters) {
        suggestions.push(...suggester.presuggest(dictionary));
      }
    }
    return suggestions;
  }

  public abstract match(word: Word): boolean;

  public suggest(word: Word, dictionary: Dictionary): Array<Suggestion> {
    const suggestions = [];
    if (this.suggesters !== undefined) {
      for (const suggester of this.suggesters) {
        suggestions.push(...suggester.suggest(word, dictionary));
      }
    }
    return suggestions;
  }

  protected static createCandidates(word: Word, mode: WordMode, language: string): ReadonlyArray<string> {
    if (mode === "name") {
      return [word.name];
    } else if (mode === "equivalent") {
      return word.equivalentNames[language] ?? [];
    } else if (mode === "both") {
      return [word.name, ...(word.equivalentNames[language] ?? [])];
    } else if (mode === "content") {
      return [word.contents[language] ?? ""];
    } else {
      throw new Error("cannot happen");
    }
  }

  protected static createMatcher(type: string): Matcher {
    if (type === "exact") {
      const matcher = function (text: string, candidate: string): boolean {
        return candidate === text;
      };
      return matcher;
    } else if (type === "prefix") {
      const matcher = function (text: string, candidate: string): boolean {
        return candidate.startsWith(text);
      };
      return matcher;
    } else if (type === "suffix") {
      const matcher = function (text: string, candidate: string): boolean {
        return candidate.endsWith(text);
      };
      return matcher;
    } else if (type === "part") {
      const matcher = function (text: string, candidate: string): boolean {
        return candidate.includes(text);
      };
      return matcher;
    } else if (type === "pair") {
      const matcher = function (text: string, candidate: string): boolean {
        try {
          if (text.length <= 10) {
            let predicate = false;
            for (let i = 0 ; i < text.length ; i ++) {
              const beforeText = text.substring(0, i);
              const afterText = text.substring(i + 1);
              const regexp = new RegExp("^" + beforeText + "." + afterText + "$");
              if (candidate.match(regexp) !== null) {
                predicate = true;
                break;
              }
            }
            return predicate;
          } else {
            return false;
          }
        } catch (error) {
          return false;
        }
      };
      return matcher;
    } else if (type === "regular") {
      const matcher = function (text: string, candidate: string): boolean {
        try {
          const regexp = new RegExp(text, "m");
          return candidate.match(regexp) !== null;
        } catch (error) {
          return false;
        }
      };
      return matcher;
    } else {
      throw new Error("cannot happen");
    }
  }

}


export const WORD_MODES = ["name", "equivalent", "both", "content"] as const;
export type WordMode = (typeof WORD_MODES)[number];

export const WORD_TYPES = ["exact", "prefix", "suffix", "part", "pair", "regular"] as const;
export type WordType = (typeof WORD_TYPES)[number];

export type Matcher = (text: string, candidate: string) => boolean;