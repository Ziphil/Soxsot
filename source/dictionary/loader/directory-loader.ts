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
  Deserializer
} from "./deserializer";
import {
  Loader
} from "./loader";


export class DirectoryLoader extends Loader {

  private readonly deserializer: Deserializer;
  private size: number = 0;
  private count: number = 0;

  public constructor(path: string) {
    super(path);
    this.deserializer = new Deserializer();
  }

  public start(): void {
    const promise = Promise.resolve().then(this.loadDictionary.bind(this));
    promise.then((dictionary) => {
      this.emit("end", dictionary);
    }).catch((error) => {
      this.emit("error", error);
    });
  }

  private async loadDictionary(): Promise<Dictionary> {
    const wordsPromise = this.loadWords();
    const othersPromise = this.loadOthers();
    const [words, [settings, markers]] = await Promise.all([wordsPromise, othersPromise]);
    const dictionary = new Dictionary(words, settings, markers, this.path);
    return dictionary;
  }

  private async loadWords(): Promise<Array<Word>> {
    const paths = await fs.readdir(this.path);
    const wordLocalPaths = paths.filter((path) => path.endsWith(".xdnw"));
    this.size = wordLocalPaths.length;
    const promises = wordLocalPaths.map((wordLocalPath) => {
      const wordPath = joinPath(this.path, wordLocalPath);
      return this.loadWord(wordPath);
    });
    const words = await Promise.all(promises);
    return words;
  }

  private async loadWord(path: string): Promise<Word> {
    const string = await fs.readFile(path, {encoding: "utf-8"});
    const word = this.deserializer.deserializeWord(string);
    this.count ++;
    this.emitProgress();
    return word;
  }

  private async loadOthers(): Promise<[DictionarySettings, Markers]> {
    const paths = await fs.readdir(this.path);
    const otherLocalPaths = paths.filter((path) => path.endsWith(".xdns"));
    let settingsPath = null as string | null;
    let markersPath = null as string | null;
    const promises = otherLocalPaths.map(async (otherLocalPath) => {
      const otherPath = joinPath(this.path, otherLocalPath);
      const string = await fs.readFile(otherPath, {encoding: "utf-8"});
      if (string.match(/^\*\*/m)) {
        if (string.match(/^!VERSION/m)) {
          settingsPath = otherPath;
        } else if (string.match(/^!MARKER/m)) {
          markersPath = otherPath;
        }
      }
    });
    await Promise.all(promises);
    const settingsPromise = this.loadSettings(settingsPath);
    const markersPromise = this.loadMarkers(markersPath);
    const [settings, markers] = await Promise.all([settingsPromise, markersPromise]);
    return [settings, markers];
  }

  private async loadSettings(path: string | null): Promise<DictionarySettings> {
    if (path !== null) {
      const string = await fs.readFile(path, {encoding: "utf-8"});
      const settings = this.deserializer.deserializeDictionarySettings(string);
      this.emitProgress();
      return settings;
    } else {
      return DictionarySettings.createEmpty();
    }
  }

  private async loadMarkers(path: string | null): Promise<Markers> {
    if (path !== null) {
      const string = await fs.readFile(path, {encoding: "utf-8"});
      const markers = this.deserializer.deserializeMarkers(string);
      this.emitProgress();
      return markers;
    } else {
      return Markers.createEmpty();
    }
  }

  private emitProgress(): void {
    this.emit("progress", this.count, this.size);
  }

}