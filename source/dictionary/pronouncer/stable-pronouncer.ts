//

import {
  Pronouncer
} from "./pronouncer";


export class StablePronouncer extends Pronouncer {

  private showSyllables: boolean;
  private light: boolean;

  public constructor(configs?: StablePronouncerConfigs) {
    super();
    this.showSyllables = configs?.showSyllables ?? false;
    this.light = configs?.light ?? true;
  }

  public convert(name: string): string {
    if (name === "kin") {
      return "kiɴ";
    } else if (name === "'n") {
      return "ɴ";
    } else if (name === "á") {
      return "aɪ";
    } else if (name === "é") {
      return "eɪ";
    } else if (name === "à") {
      return "aʊ";
    } else if (name === "ò") {
      return "ɔɐ";
    } else if (name === "lá") {
      return "laɪ";
    } else if (name === "lé") {
      return "leɪ";
    } else if (name === "dà") {
      return "daʊ";
    } else {
      let syllableName = StablePronouncer.divideSyllables(name);
      syllableName = syllableName.replace(/<(s|z|t|d|k|g|f|v|p|b|c|q|x|j|r|l|m|n|h|y)>.<\1>/g, ".<$1>");
      syllableName = syllableName.replace(/<s>/g, "s");
      syllableName = syllableName.replace(/<z>/g, "z");
      syllableName = syllableName.replace(/<t>/g, "t");
      syllableName = syllableName.replace(/<d>/g, "d");
      syllableName = syllableName.replace(/<k>/g, "k");
      syllableName = syllableName.replace(/<g>/g, "ɡ");
      syllableName = syllableName.replace(/<f>/g, "f");
      syllableName = syllableName.replace(/<v>/g, "v");
      syllableName = syllableName.replace(/<p>/g, "p");
      syllableName = syllableName.replace(/<b>/g, "b");
      if (this.light) {
        syllableName = syllableName.replace(/<c>/g, "θ");
        syllableName = syllableName.replace(/<q>/g, "ð");
      } else {
        syllableName = syllableName.replace(/<c>/g, "t͡s");
        syllableName = syllableName.replace(/<q>/g, "d͡z");
      }
      syllableName = syllableName.replace(/<x>/g, "ʃ");
      syllableName = syllableName.replace(/<j>/g, "ʒ");
      syllableName = syllableName.replace(/<r>/g, "ɹ");
      syllableName = syllableName.replace(/<l><(a|e|i|o|u|â|ê|î|ô|û|á|é|í|ó|ú|à|è|ì|ò|ù)>/g, "l<$1>");
      syllableName = syllableName.replace(/<l>/g, "ɾ");
      syllableName = syllableName.replace(/<m>/g, "m");
      syllableName = syllableName.replace(/<n>/g, "n");
      syllableName = syllableName.replace(/<h>(\.|$)/g, "$1");
      syllableName = syllableName.replace(/<h><(a|e|i|o|u|â|ê|î|ô|û|á|é|í|ó|ú|à|è|ì|ò|ù)>/g, "h<$1>");
      syllableName = syllableName.replace(/<h>/g, "");
      syllableName = syllableName.replace(/<y>/g, "j");
      syllableName = syllableName.replace(/<(a|â|á|à)>/g, "a");
      syllableName = syllableName.replace(/<(e|ê|é|è)>/g, "e");
      syllableName = syllableName.replace(/<(i|î|í|ì)>/g, "i");
      syllableName = syllableName.replace(/<(o|ô|ó|ò)>/g, "ɔ");
      syllableName = syllableName.replace(/<(u|û|ú|ù)>/g, "u");
      if (!this.showSyllables) {
        syllableName = syllableName.replace(/\./g, "");
      }
      return syllableName;
    }
  }

  private static divideSyllables(name: string): string {
    let dividedName = name.replace(/('|-)/g, "");
    dividedName = dividedName.split("").reverse().map((char) => `<${char}>`).join("");
    dividedName = dividedName.replace(/((<[sztdkgfvpbcqxjrlmnhy]>)?<[aeiouâêîôûáéíóúàèìòù]>(<[sztdkgfvpbcqxjrlmnhy]>)?)/g, "$1.");
    let regexp = /(<.>|\.)/g;
    let array = [];
    let match;
    while ((match = regexp.exec(dividedName)) !== null) {
      array.push(match[1]);
    }
    let syllableName = array.reverse().join("");
    if (syllableName.charAt(0) === ".") {
      syllableName = syllableName.substring(1);
    }
    return syllableName;
  }

}


export type StablePronouncerConfigs = {
  showSyllables?: boolean,
  light?: boolean
};