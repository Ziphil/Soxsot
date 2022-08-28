//

import {
  promises as fs
} from "fs";
import {
  join as joinPath
} from "path";
import {
  Dictionary
} from "../dictionary";
import {
  DictionarySettings
} from "../dictionary-settings";
import {
  Markers
} from "../marker";
import {
  Word
} from "../word";
import {
  FileNameResolver
} from "./file-name-resolver";
import {
  Saver
} from "./saver";
import {
  Serializer
} from "./serializer";


export class DirectoryDiffSaver extends Saver {

  private readonly serializer: Serializer;
  private readonly resolver: FileNameResolver;
  private size: number = 0;
  private count: number = 0;

  public constructor(dictionary: Dictionary, path: string | null, resolver?: FileNameResolver) {
    super(dictionary, path);
    this.serializer = new Serializer();
    this.resolver = resolver ?? FileNameResolver.createDefault();
    if (path !== null) {
      throw new Error("cannot save incrementally in different location");
    }
  }

  public start(): void {
    const promise = Promise.resolve().then(this.saveDictionary.bind(this));
    promise.then(() => {
      this.emit("end");
    }).catch((error) => {
      this.emit("error", error);
    });
  }

  private async saveDictionary(): Promise<void> {
    const dictionary = this.dictionary;
    const mutationManager = dictionary.mutationManager;
    this.size = mutationManager.changedNames.size + mutationManager.deletedNames.size;
    const wordsPromise = this.saveWords(dictionary);
    const settingsPromise = this.saveSettings(dictionary.settings);
    const markersPromise = this.saveMarkers(dictionary.markers);
    await Promise.all([wordsPromise, settingsPromise, markersPromise]);
  }

  private async saveWords(dictionary: Dictionary): Promise<void> {
    const mutationManager = dictionary.mutationManager;
    const changePromises = [...mutationManager.changedNames.values()].map((uniqueName) => {
      const wordPath = joinPath(this.path, this.resolver.resolveWordBaseName(uniqueName) + ".xdnw");
      const word = dictionary.findByUniqueName(uniqueName);
      if (word !== undefined) {
        return this.changeWord(word, wordPath);
      } else {
        return undefined;
      }
    });
    const deletePromises = [...mutationManager.deletedNames.values()].map((uniqueName) => {
      const wordPath = joinPath(this.path, this.resolver.resolveWordBaseName(uniqueName) + ".xdnw");
      return this.deleteWord(wordPath);
    });
    await Promise.all([...changePromises, ...deletePromises]);
  }

  private async changeWord(word: Word, path: string): Promise<void> {
    const string = this.serializer.serializeWord(word);
    await fs.writeFile(path, string, {encoding: "utf-8"});
    this.count ++;
    this.emitProgress();
  }

  private async deleteWord(path: string): Promise<void> {
    await fs.unlink(path).catch(() => null);
    this.count ++;
    this.emitProgress();
  }

  private async saveSettings(settings: DictionarySettings): Promise<void> {
    const path = joinPath(this.path, this.resolver.settingsBaseName + ".xdns");
    const string = this.serializer.serializeDictionarySettings(settings);
    await fs.writeFile(path, string, {encoding: "utf-8"});
    this.emitProgress();
  }

  private async saveMarkers(markers: Markers): Promise<void> {
    const path = joinPath(this.path, this.resolver.markersBaseName + ".xdns");
    const string = this.serializer.serializeMarkers(markers);
    await fs.writeFile(path, string, {encoding: "utf-8"});
    this.emitProgress();
  }

  private emitProgress(): void {
    this.emit("progress", this.count, this.size);
  }

}