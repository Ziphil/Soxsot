//

import {
  Suggestion
} from "./suggestion";
import {
  Word
} from "./word";


export class SearchResult {

  public readonly words: ReadonlyArray<Word>;
  public readonly suggestions: ReadonlyArray<Suggestion>;
  public readonly elapsedTime: number;
  public sizePerPage: number = 30;

  public constructor(words: ReadonlyArray<Word>, suggestions: ReadonlyArray<Suggestion>, elapsedTime: number) {
    this.words = words;
    this.suggestions = suggestions;
    this.elapsedTime = elapsedTime;
  }

  public static createEmpty(): SearchResult {
    const words = new Array<Word>();
    const suggestions = new Array<never>();
    const elapsedTime = 0;
    const result = new SearchResult(words, suggestions, elapsedTime);
    return result;
  }

  public static measure(search: () => [ReadonlyArray<Word>, ReadonlyArray<Suggestion>]): SearchResult {
    const beforeDate = new Date();
    const [words, suggestions] = search();
    const afterDate = new Date();
    const elapsedTime = afterDate.getTime() - beforeDate.getTime();
    const result = new SearchResult(words, suggestions, elapsedTime);
    return result;
  }

  public copy(): SearchResult {
    const result = new SearchResult(this.words, this.suggestions, this.elapsedTime);
    return result;
  }

  public sliceWords(page: number): Array<Word> {
    const words = this.words.slice(page * this.sizePerPage, page * this.sizePerPage + this.sizePerPage);
    return words;
  }

  public get minPage(): number {
    return 0;
  }

  public get maxPage(): number {
    return Math.max(Math.ceil(this.words.length / this.sizePerPage) - 1, 0);
  }

}