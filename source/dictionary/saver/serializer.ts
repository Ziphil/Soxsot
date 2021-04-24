//

import {
  PlainDictionarySettings
} from "../dictionary-settings";
import {
  PlainMarkers
} from "../marker";
import {
  PlainRevision,
  PlainRevisions
} from "../revision";
import {
  PlainWord
} from "../word";


export class Serializer {

  public serializeWord(word: PlainWord): string {
    let string = "";
    string += `* @${word.date} ${word.uniqueName}\n`;
    string += "\n";
    let first = true;
    for (let [language, content] of Object.entries(word.contents)) {
      if (content !== undefined && content.trim() !== "") {
        if (!first) {
          string += "\n";
        }
        string += `!${language.toUpperCase()}\n`;
        string += content.replace(/\r\n|\r|\n/g, "\n").trim();
        string += "\n";
        first = false;
      }
    }
    return string;
  }

  public serializeDictionarySettings(settings: PlainDictionarySettings, skipHeader: {root?: boolean} = {}): string {
    let string = "";
    if (!skipHeader.root) {
      string += "**\n";
      string += "\n";
    }
    string += this.serializeVersion(settings.version);
    string += "\n";
    string += this.serializeAlphabetRule(settings.alphabetRule);
    string += "\n";
    string += this.serializeRevisions(settings.revisions);
    return string;
  }

  public serializeVersion(version: string, skipHeader: {part?: boolean} = {}): string {
    let string = "";
    if (!skipHeader.part) {
      string += "!VERSION\n";
    }
    string += `- ${version}\n`;
    return string;
  }

  public serializeAlphabetRule(alphabetRule: string, skipHeader: {part?: boolean} = {}): string {
    let string = "";
    if (!skipHeader.part) {
      string += "!ALPHABET\n";
    }
    string += `- ${alphabetRule}\n`;
    return string;
  }

  public serializeRevisions(revisions: PlainRevisions, skipHeader: {part?: boolean} = {}): string {
    let string = "";
    if (!skipHeader.part) {
      string += "!REVISION\n";
    }
    for (let revision of revisions) {
      string += this.serializeRevision(revision);
    }
    return string;
  }

  public serializeRevision(revision: PlainRevision): string {
    let line = "";
    line += "- ";
    if (revision.date !== null) {
      line += `@${revision.date} `;
    }
    line += `{${revision.beforeName}} → {${revision.afterName}}\n`;
    return line;
  }

  public serializeMarkers(markers: PlainMarkers, skipHeader: {root?: boolean, part?: boolean} = {}): string {
    let string = "";
    if (!skipHeader.root) {
      string += "**\n";
      string += "\n";
    }
    if (!skipHeader.part) {
      string += "!MARKER\n";
    }
    for (let [uniqueName, wordMarkers] of markers.entries()) {
      string += `- ${uniqueName}: ${wordMarkers.join(", ")}\n`;
    }
    return string;
  }

}