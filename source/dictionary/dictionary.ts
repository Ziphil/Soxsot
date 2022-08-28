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
    for (const word of words) {
      word.setDictionary(this);
    }
  }

  public static fromPlain(plain: PlainDictionary): Dictionary {
    const words = plain.words.map((plainWord) => Word.fromPlain(plainWord));
    const settings = DictionarySettings.fromPlain(plain.settings);
    const markers = Markers.fromPlain(plain.markers);
    const path = plain.path;
    const dictionary = new Dictionary(words, settings, markers, path);
    return dictionary;
  }

  public toPlain(): PlainDictionary {
    const words = this.words.map((word) => word.toPlain());
    const settings = this.settings.toPlain();
    const markers = this.markers.toPlain();
    const path = this.path;
    return {words, settings, markers, path};
  }

  public search(parameter: Parameter): SearchResult {
    const result = SearchResult.measure(() => {
      const words = [];
      const suggestions = [];
      parameter.prepare(this);
      suggestions.push(...parameter.presuggest(this));
      for (const word of this.words) {
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
    const word = this.words.find((word) => word.uid === uid);
    return word;
  }

  public findByUniqueName(uniqueName: string, excludedUid?: string): Word | undefined {
    const word = this.words.find((word) => {
      if (excludedUid !== undefined) {
        return word.uid !== excludedUid && word.uniqueName === uniqueName;
      } else {
        return word.uniqueName === uniqueName;
      }
    });
    return word;
  }

  public addWord(newWord: PlainWord, skipValidate?: boolean): void {
    const errorType = (skipValidate) ? null : this.validateEditWord(null, newWord);
    if (errorType === null) {
      const newRealWord = Word.fromPlain(newWord);
      newRealWord.setDictionary(this);
      newRealWord.reissueUid();
      this.writableWords.push(newRealWord);
      this.mutationManager.change(newWord.uniqueName);
    } else {
      throw new ValidationError(errorType);
    }
  }

  // 指定された UID をもつ単語オブジェクトの内容を newWord として与えられたデータで上書きします。
  // UID として null が指定された場合は、新規単語の作成と見なされ、既存の単語オブジェクトの変更は行われずに新たな単語オブジェクトが追加されます。
  // なお、引数の newWord の UID は完全に無視されます。
  // すなわち、既存単語の編集の場合は該当単語の UID は書き換えられず保たれ、新規単語の作成の場合はその単語の UID は新たに発行されます。
  public editWord(uid: string | null, newWord: PlainWord, skipValidate?: boolean): void {
    const errorType = (skipValidate) ? null : this.validateEditWord(uid, newWord);
    if (errorType === null) {
      if (uid !== null) {
        const oldWord = this.words.find((word) => word.uid === uid);
        if (oldWord !== undefined) {
          oldWord.edit(newWord);
          this.mutationManager.rename(oldWord.uniqueName, newWord.uniqueName);
        }
      } else {
        const newRealWord = Word.fromPlain(newWord);
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
    const oldWordIndex = this.words.findIndex((word) => word.uid === uid);
    if (oldWordIndex >= 0) {
      const oldWord = this.words[oldWordIndex];
      this.writableWords.splice(oldWordIndex, 1);
      this.mutationManager.delete(oldWord.uniqueName);
    }
  }

  public validateEditWord(uid: string | null, newWord: PlainWord): string | null {
    if (uid !== null) {
      const oldWord = this.words.find((word) => word.uid === uid);
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
    const newRealSettings = DictionarySettings.fromPlain(newSettings);
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