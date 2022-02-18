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
    let promise = Promise.resolve().then(this.saveDictionary.bind(this));
    promise.then(() => {
      this.emit("end");
    }).catch((error) => {
      this.emit("error", error);
    });
  }

  private async saveDictionary(): Promise<void> {
    let dictionary = this.dictionary;
    let mutationManager = dictionary.mutationManager;
    this.size = mutationManager.changedNames.size + mutationManager.deletedNames.size;
    let wordsPromise = this.saveWords(dictionary);
    let settingsPromise = this.saveSettings(dictionary.settings);
    let markersPromise = this.saveMarkers(dictionary.markers);
    await Promise.all([wordsPromise, settingsPromise, markersPromise]);
  }

  private async saveWords(dictionary: Dictionary): Promise<void> {
    let mutationManager = dictionary.mutationManager;
    let changePromises = [...mutationManager.changedNames.values()].map((uniqueName) => {
      let wordPath = joinPath(this.path, this.resolver.resolveWordBaseName(uniqueName) + ".xdnw");
      let word = dictionary.findByUniqueName(uniqueName);
      if (word !== undefined) {
        return this.changeWord(word, wordPath);
      }
    });
    let deletePromises = [...mutationManager.deletedNames.values()].map((uniqueName) => {
      let wordPath = joinPath(this.path, this.resolver.resolveWordBaseName(uniqueName) + ".xdnw");
      return this.deleteWord(wordPath);
    });
    await Promise.all([...changePromises, ...deletePromises]);
  }

  private async changeWord(word: Word, path: string): Promise<void> {
    let string = this.serializer.serializeWord(word);
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
    let path = joinPath(this.path, this.resolver.settingsBaseName + ".xdns");
    let string = this.serializer.serializeDictionarySettings(settings);
    await fs.writeFile(path, string, {encoding: "utf-8"});
    this.emitProgress();
  }

  private async saveMarkers(markers: Markers): Promise<void> {
    let path = joinPath(this.path, this.resolver.markersBaseName + ".xdns");
    let string = this.serializer.serializeMarkers(markers);
    await fs.writeFile(path, string, {encoding: "utf-8"});
    this.emitProgress();
  }

  private emitProgress(): void {
    this.emit("progress", this.count, this.size);
  }

}