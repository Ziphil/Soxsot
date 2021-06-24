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
    let words = new Array<Word>();
    let suggestions = new Array<never>();
    let elapsedTime = 0;
    let result = new SearchResult(words, suggestions, elapsedTime);
    return result;
  }

  public static measure(search: () => [ReadonlyArray<Word>, ReadonlyArray<Suggestion>]): SearchResult {
    let beforeDate = new Date();
    let [words, suggestions] = search();
    let afterDate = new Date();
    let elapsedTime = afterDate.getTime() - beforeDate.getTime();
    let result = new SearchResult(words, suggestions, elapsedTime);
    return result;
  }

  public copy(): SearchResult {
    let result = new SearchResult(this.words, this.suggestions, this.elapsedTime);
    return result;
  }

  public sliceWords(page: number) {
    let words = this.words.slice(page * this.sizePerPage, page * this.sizePerPage + this.sizePerPage);
    return words;
  }

  public get minPage() {
    return 0;
  }

  public get maxPage() {
    return Math.max(Math.ceil(this.words.length / this.sizePerPage) - 1, 0);
  }

}