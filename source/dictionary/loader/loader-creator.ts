//

import {
  extname
} from "path";
import {
  DirectoryLoader
} from "./directory-loader";
import {
  Loader
} from "./loader";
import {
  SingleLoader
} from "./single-loader";


export class LoaderCreator {

  public static createByKind<K extends LoaderKind>(kind: K, ...args: ConstructorParameters<LoaderClass<K>>): InstanceType<LoaderClass<K>> {
    let Loader = LOADER_DATA[kind].clazz as any;
    let loader = new Loader(...args);
    return loader;
  }

  public static createByExtension(path: string): Loader | undefined {
    let extension = extname(path);
    for (let [kind, data] of Object.entries(LOADER_DATA)) {
      if (data.extension === extension) {
        let Loader = data.clazz;
        let loader = new Loader(path);
        return loader;
      }
    }
    return undefined;
  }

}


export const LOADER_DATA = {
  directory: {clazz: DirectoryLoader, extension: ""},
  single: {clazz: SingleLoader, extension: "xdn"}
};
export type LoaderKind = keyof typeof LOADER_DATA;
export type LoaderClass<K extends LoaderKind> = (typeof LOADER_DATA)[K]["clazz"];