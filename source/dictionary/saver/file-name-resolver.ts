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
    const resolveWordBaseName = function (uniqueName: string): string {
      const modifiedUniqueName = uniqueName.replace(/’/g, "'");
      const match = modifiedUniqueName.match(/^(\+)?(.+?)(\+)?(~*)$/);
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
        const fileName = match[2] + modifier;
        return fileName;
      } else {
        throw new Error("cannot happen");
      }
    };
    const settingsBaseName = "#SETTINGS";
    const markersBaseName = "#MARKERS";
    const resolver = new FileNameResolver(resolveWordBaseName, settingsBaseName, markersBaseName);
    return resolver;
  }

}


type WordBaseNameResolver = (uniqueName: string) => string;