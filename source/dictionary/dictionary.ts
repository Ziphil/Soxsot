//

import {
  Writable
} from "ts-essentials";
import {
  MutationManager
} from "../util/mutation-manager";
import {
  DictionarySettings,
  PlainDictionarySettings
} from "./dictionary-settings";
import {
  ValidationError
} from "./error";
import {
  Markers,
  PlainMarkers
} from "./marker";
import {
  Parameter
} from "./parameter/parameter";
import {
  SearchResult
} from "./search-result";
import {
  PlainWord,
  Word
} from "./word";


export class Dictionary {

  public readonly words: ReadonlyArray<Word>;
  public readonly settings: DictionarySettings;
  public readonly markers: Markers;
  public readonly path: string | null;
  public readonly mutationManager: MutationManager<string>;

  public constructor(words: ReadonlyArray<Word>, settings: DictionarySettings, markers: Markers, path: string | null) {
    this.words = words;
    this.settings = settings;
    this.markers = markers;
    this.path = path;
    this.mutationManager = new MutationManager();
    for (let word of words) {
      word.setDictionary(this);
    }
  }

  public static fromPlain(plain: PlainDictionary): Dictionary {
    let words = plain.words.map((plainWord) => Word.fromPlain(plainWord));
    let settings = DictionarySettings.fromPlain(plain.settings);
    let markers = Markers.fromPlain(plain.markers);
    let path = plain.path;
    let dictionary = new Dictionary(words, settings, markers, path);
    return dictionary;
  }

  public toPlain(): PlainDictionary {
    let words = this.words.map((word) => word.toPlain());
    let settings = this.settings.toPlain();
    let markers = this.markers.toPlain();
    let path = this.path;
    return {words, settings, markers, path};
  }

  public search(parameter: Parameter): SearchResult {
    let result = SearchResult.measure(() => {
      let words = [];
      let suggestions = [];
      parameter.prepare(this);
      suggestions.push(...parameter.presuggest(this));
      for (let word of this.words) {
        if (parameter.match(word)) {
          words.push(word);
        }
        suggestions.push(...parameter.suggest(word, this));
      }
      Word.sortWords(words);
      return [words, suggestions];
    });
    return result;
  }

  public findByUid(uid: string): Word | undefined {
    let word = this.words.find((word) => word.uid === uid);
    return word;
  }

  public findByUniqueName(uniqueName: string, excludedUid?: string): Word | undefined {
    let word = this.words.find((word) => {
      if (excludedUid !== undefined) {
        return word.uid !== excludedUid && word.uniqueName === uniqueName;
      } else {
        return word.uniqueName === uniqueName;
      }
    });
    return word;
  }

  public addWord(newWord: PlainWord, skipValidate?: boolean): void {
    let errorType = (skipValidate) ? null : this.validateEditWord(null, newWord);
    if (errorType === null) {
      let newRealWord = Word.fromPlain(newWord);
      newRealWord.setDictionary(this);
      newRealWord.reissueUid();
      this.writableWords.push(newRealWord);
      this.mutationManager.change(newWord.uniqueName);
    } else {
      throw new ValidationError(errorType);
    }
  }

  // ??????????????? UID ????????????????????????????????????????????? newWord ?????????????????????????????????????????????????????????
  // UID ????????? null ??????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????????
  // ?????????????????? newWord ??? UID ?????????????????????????????????
  // ??????????????????????????????????????????????????????????????? UID ???????????????????????????????????????????????????????????????????????????????????? UID ?????????????????????????????????
  public editWord(uid: string | null, newWord: PlainWord, skipValidate?: boolean): void {
    let errorType = (skipValidate) ? null : this.validateEditWord(uid, newWord);
    if (errorType === null) {
      if (uid !== null) {
        let oldWord = this.words.find((word) => word.uid === uid);
        if (oldWord !== undefined) {
          oldWord.edit(newWord);
          this.mutationManager.rename(oldWord.uniqueName, newWord.uniqueName);
        }
      } else {
        let newRealWord = Word.fromPlain(newWord);
        newRealWord.setDictionary(this);
        newRealWord.reissueUid();
        this.writableWords.push(newRealWord);
        this.mutationManager.change(newWord.uniqueName);
      }
    } else {
      throw new ValidationError(errorType);
    }
  }

  public deleteWord(uid: string): void {
    let oldWordIndex = this.words.findIndex((word) => word.uid === uid);
    if (oldWordIndex >= 0) {
      let oldWord = this.words[oldWordIndex];
      this.writableWords.splice(oldWordIndex, 1);
      this.mutationManager.delete(oldWord.uniqueName);
    }
  }

  public validateEditWord(uid: string | null, newWord: PlainWord): string | null {
    if (uid !== null) {
      let oldWord = this.words.find((word) => word.uid === uid);
      if (oldWord !== undefined) {
        if (this.findByUniqueName(newWord.uniqueName, oldWord.uid) !== undefined) {
          return "duplicateUniqueName";
        } else {
          return oldWord.validateEdit(newWord);
        }
      } else {
        return "noSuchWord";
      }
    } else {
      if (this.findByUniqueName(newWord.uniqueName) !== undefined) {
        return "duplicateUniqueName";
      } else {
        return null;
      }
    }
  }

  public changeSettings(newSettings: PlainDictionarySettings): void {
    let newRealSettings = DictionarySettings.fromPlain(newSettings);
    this.writable.settings = newRealSettings;
  }

  private get writable(): Writable<this> {
    return this;
  }

  private get writableWords(): Array<Word> {
    return this.words as any;
  }

}


export interface PlainDictionary {

  words: Array<PlainWord>;
  settings: PlainDictionarySettings;
  markers: PlainMarkers;
  path: string | null;

}