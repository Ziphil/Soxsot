//

import fs from "fs";
import {
  ReadStream
} from "fs";
import readline from "readline";
import {
  Interface
} from "readline";
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


export class SingleLoader extends Loader {

  private readonly deserializer: Deserializer;
  private readonly stream: ReadStream;
  private readonly interface: Interface;
  private size: number = 0;
  private count: number = 0;

  public constructor(path: string) {
    super(path);
    this.deserializer = new Deserializer();
    this.stream = fs.createReadStream(this.path, {encoding: "utf-8"});
    this.interface = readline.createInterface(this.stream);
  }

  public start(): void {
    this.readDictionary();
    this.stream.on("error", (error) => {
      this.emit("error", error);
    });
  }

  private readDictionary(): void {
    let before = true;
    let currentType = "word";
    let currentString = "";
    let words = new Array<Word>();
    let settings = DictionarySettings.createEmpty();
    let markers = Markers.createEmpty();
    this.interface.on("line", (line) => {
      let nameMatch = line.match(/^\*\s*@(\d+)\s*(.+)/);
      let othersMatch = line.match(/^\*\*/);
      if (nameMatch || othersMatch) {
        if (!before) {
          if (currentType === "word") {
            let word = this.deserializer.deserializeWord(currentString);
            words.push(word);
          } else if (currentType === "others") {
          }
        }
        before = false;
        currentType = (nameMatch) ? "word" : "others";
        currentString = "";
      }
      currentString += line + "\n";
    });
    this.interface.on("close", () => {
      if (!before) {
        if (currentType === "word") {
          let word = this.deserializer.deserializeWord(currentString);
          words.push(word);
        } else if (currentType === "others") {
        }
      }
      let dictionary = new Dictionary(words, settings, markers, this.path);
      this.emit("end", dictionary);
    });
  }

  private emitProgress(): void {
    this.emit("progress", this.count, this.size);
  }

}