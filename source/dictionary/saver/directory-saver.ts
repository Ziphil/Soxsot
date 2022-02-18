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


export class DirectorySaver extends Saver {

  private readonly serializer: Serializer;
  private readonly resolver: FileNameResolver;
  private size: number = 0;
  private count: number = 0;
  private deleteSize: number = 0;
  private deleteCount: number = 0;

  public constructor(dictionary: Dictionary, path: string | null, resolver?: FileNameResolver) {
    super(dictionary, path);
    this.serializer = new Serializer();
    this.resolver = resolver ?? FileNameResolver.createDefault();
  }

  public start(): void {
    let promise = Promise.resolve().then(this.deleteFiles.bind(this)).then(this.saveDictionary.bind(this));
    promise.then(() => {
      this.emit("end");
    }).catch((error) => {
      this.emit("error", error);
    });
  }

  private async deleteFiles(): Promise<void> {
    let dictionary = this.dictionary;
    let paths = await fs.readdir(this.path);
    let fileLocalPaths = paths.filter((path) => path.endsWith(".xdnw") || path.endsWith(".xdns"));
    this.size = dictionary.words.length;
    this.deleteSize = fileLocalPaths.length;
    let promises = fileLocalPaths.map((fileLocalPath) => {
      let filePath = joinPath(this.path, fileLocalPath);
      return this.deleteFile(filePath);
    });
    await Promise.all(promises);
  }

  private async deleteFile(path: string): Promise<void> {
    await fs.unlink(path);
    this.deleteCount ++;
    this.emitProgress();
  }

  private async saveDictionary(): Promise<void> {
    let dictionary = this.dictionary;
    await fs.mkdir(this.path, {recursive: true});
    let wordsPromise = this.saveWords(dictionary.words);
    let settingsPromise = this.saveSettings(dictionary.settings);
    let markersPromise = this.saveMarkers(dictionary.markers);
    await Promise.all([wordsPromise, settingsPromise, markersPromise]);
  }

  private async saveWords(words: ReadonlyArray<Word>): Promise<void> {
    let promises = words.map((word) => {
      let wordPath = joinPath(this.path, this.resolver.resolveWordBaseName(word.uniqueName) + ".xdnw");
      return this.saveWord(word, wordPath);
    });
    await Promise.all(promises);
  }

  private async saveWord(word: Word, path: string): Promise<void> {
    let string = this.serializer.serializeWord(word);
    await fs.writeFile(path, string, {encoding: "utf-8"});
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
    this.emit("progress", this.count + this.deleteCount, this.size + this.deleteSize);
  }

}