//


export class FileNameResolver {

  public readonly resolveWordBaseName: WordBaseNameResolver;
  public readonly settingsBaseName: string;
  public readonly markersBaseName: string;

  public constructor(resolveWordBaseName: WordBaseNameResolver, settingsBaseName: string, markersBaseName: string) {
    this.resolveWordBaseName = resolveWordBaseName;
    this.settingsBaseName = settingsBaseName;
    this.markersBaseName = markersBaseName;
  }

  public static createDefault(): FileNameResolver {
    let resolveWordBaseName = function (uniqueName: string): string {
      let match = uniqueName.match(/^(\+)?(.+?)(\+)?(~*)$/);
      if (match) {
        let modifier = "";
        if (match[1]) {
          modifier += "S";
        }
        if (match[3]) {
          modifier += "P";
        }
        if (match[4].length > 0) {
          modifier += (match[4].length + 1).toString();
        }
        if (modifier.length > 0) {
          modifier = "_" + modifier;
        }
        let fileName = match[2] + modifier;
        return fileName;
      } else {
        throw new Error("cannot happen");
      }
    };
    let settingsBaseName = "#SETTINGS";
    let markersBaseName = "#MARKERS";
    let resolver = new FileNameResolver(resolveWordBaseName, settingsBaseName, markersBaseName);
    return resolver;
  }

}


type WordBaseNameResolver = (uniqueName: string) => string;