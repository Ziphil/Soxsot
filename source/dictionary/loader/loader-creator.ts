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

  public static createByKind(kind: LoaderKind, path: string): Loader {
    if (kind === "directory") {
      return new DirectoryLoader(path);
    } else if (kind === "single") {
      return new SingleLoader(path);
    } else {
      throw new Error("cannot happen");
    }
  }

  public static createByExtension(path: string): Loader | null {
    let extension = extname(path);
    if (extension === "") {
      return new DirectoryLoader(path);
    } else if (extension === "xdn") {
      return new SingleLoader(path);
    } else {
      return null;
    }
  }

}


export const LOADER_KIND = ["directory", "single"] as const;
export type LoaderKind = (typeof LOADER_KIND)[number];