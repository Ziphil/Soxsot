//

import {
  extname
} from "path";
import {
  Dictionary
} from "../dictionary";
import {
  DirectorySaver
} from "./directory-saver";
import {
  OldShaleianSaver
} from "./old-shaleian-saver";
import {
  Saver
} from "./saver";
import {
  SingleSaver
} from "./single-saver";


export class SaverCreator {

  public static createByKind(kind: SaverKind, dictionary: Dictionary, path: string): Saver {
    if (kind === "directory") {
      return new DirectorySaver(dictionary, path);
    } else if (kind === "single") {
      return new SingleSaver(dictionary, path);
    } else if (kind === "oldShaleian") {
      return new OldShaleianSaver(dictionary, path);
    } else {
      throw new Error("cannot happen");
    }
  }

  public static createByExtension(dictionary: Dictionary, path: string): Saver | null {
    let extension = extname(path);
    if (extension === "") {
      return new DirectorySaver(dictionary, path);
    } else if (extension === "xdn") {
      return new SingleSaver(dictionary, path);
    } else if (extension === "xdc") {
      return new OldShaleianSaver(dictionary, path);
    } else {
      return null;
    }
  }

}


export const SAVER_KIND = ["directory", "single", "oldShaleian"] as const;
export type SaverKind = (typeof SAVER_KIND)[number];