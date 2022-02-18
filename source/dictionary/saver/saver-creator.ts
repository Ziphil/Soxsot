//

import {
  extname
} from "path";
import {
  Dictionary
} from "../dictionary";
import {
  DirectoryDiffSaver
} from "./directory-diff-saver";
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

  public static createByKind<K extends SaverKind>(kind: K, ...args: ConstructorParameters<SaverClass<K>>): InstanceType<SaverClass<K>> {
    let Saver = SAVER_DATA[kind].clazz as any;
    let saver = new Saver(...args);
    return saver;
  }

  public static createByExtension(dictionary: Dictionary, path: string): Saver | undefined {
    let extension = extname(path);
    for (let [kind, data] of Object.entries(SAVER_DATA)) {
      if (data.extension === extension) {
        let Saver = data.clazz;
        let saver = new Saver(dictionary, path);
        return saver;
      }
    }
    return undefined;
  }

}


export const SAVER_DATA = {
  directory: {clazz: DirectorySaver, extension: ""},
  directoryDiff: {clazz: DirectoryDiffSaver, extension: ""},
  single: {clazz: SingleSaver, extension: "xdn"},
  oldShaleian: {clazz: OldShaleianSaver, extension: "xdc"}
};
export type SaverKind = keyof typeof SAVER_DATA;
export type SaverClass<K extends SaverKind> = (typeof SAVER_DATA)[K]["clazz"];