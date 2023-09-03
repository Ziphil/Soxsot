//

import fs from "fs";
import {
  WriteStream
} from "fs";
import {
  Dictionary
} from "../dictionary";
import {
  Word
} from "../word";
import {
  Saver
} from "./saver";
import {
  Serializer
} from "./serializer";


export class SingleSaver extends Saver {

  private readonly serializer: Serializer;
  private readonly stream: WriteStream;
  private size: number = 0;
  private count: number = 0;

  public constructor(dictionary: Dictionary, path: string) {
    super(dictionary, path);
    this.serializer = new Serializer();
    this.stream = fs.createWriteStream(this.path, {encoding: "utf-8"});
  }

  public start(): void {
    const promise = Promise.resolve().then(this.writeDictionary.bind(this));
    promise.then(() => {
      this.stream.end(() => {
        this.emit("end");
      });
    }).catch((error) => {
      this.emit("error", error);
    });
  }

  private writeDictionary(): void {
    const dictionary = this.dictionary;
    this.writeWords(dictionary.words);
    this.writeOthers(dictionary);
  }

  private writeWords(words: ReadonlyArray<Word>): void {
    for (const word of words) {
      this.writeWord(word);
    }
  }

  private writeWord(word: Word): void {
    this.stream.write(this.serializer.serializeWord(word));
    this.stream.write("\n");
    this.count ++;
    this.emitProgress();
  }

  private writeOthers(dictionary: Dictionary): void {
    this.stream.write("**\n");
    this.stream.write("\n");
    this.stream.write(this.serializer.serializeDictionarySettings(dictionary.settings, {root: true}));
    this.stream.write("\n");
    this.stream.write(this.serializer.serializeMarkers(dictionary.markers, {root: true}));
  }

  private emitProgress(): void {
    this.emit("progress", this.count, this.size);
  }

}