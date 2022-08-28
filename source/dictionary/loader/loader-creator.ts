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
    const Loader = LOADER_DATA[kind].clazz as any;
    const loader = new Loader(...args);
    return loader;
  }

  public static createByExtension(path: string): Loader | undefined {
    const extension = extname(path);
    for (const [kind, data] of Object.entries(LOADER_DATA)) {
      if (data.extension === extension) {
        const Loader = data.clazz;
        const loader = new Loader(path);
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