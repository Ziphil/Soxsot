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
    let outerThis = this;
    let setVariable = function (type: string, string: string) {
      if (currentType === "word") {
        let word = outerThis.deserializer.deserializeWord(currentString);
        words.push(word);
      } else if (currentType === "others") {
        [settings, markers] = outerThis.deserializer.deserializeOthers(currentString);
      }
    };
    this.interface.on("line", (line) => {
      try {
        let nameMatch = line.match(/^\*\s*@(\d+)\s*(.+)/);
        let othersMatch = line.match(/^\*\*/);
        if (nameMatch || othersMatch) {
          if (!before) {
            setVariable(currentType, currentString);
          }
          before = false;
          currentType = (nameMatch) ? "word" : "others";
          currentString = "";
        }
        currentString += line + "\n";
      } catch (error) {
        this.emit("error", error);
      }
    });
    this.interface.on("close", () => {
      try {
        if (!before) {
          setVariable(currentType, currentString);
        }
        let dictionary = new Dictionary(words, settings, markers, this.path);
        this.emit("end", dictionary);
      } catch (error) {
        this.emit("error", error);
      }
    });
  }

  private emitProgress(): void {
    this.emit("progress", this.count, this.size);
  }

}