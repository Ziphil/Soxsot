//

import {
  DictionarySettings
} from "../dictionary-settings";
import {
  ParseError
} from "../error";
import {
  Marker,
  MarkerUtil,
  Markers
} from "../marker";
import {
  Revision,
  Revisions
} from "../revision";
import {
  PlainContents,
  Word
} from "../word";


export class Deserializer {

  public deserializeWord(string: string): Word {
    let lines = string.trim().split(/\r\n|\r|\n/);
    let match = lines[0]?.match(/^\*\s*@(\d+)\s*(.+)/);
    if (match) {
      let uniqueName = match[2];
      let date = parseInt(match[1], 10);
      let contents = {} as PlainContents;
      let before = true;
      let currentLanguage = "";
      let currentContent = "";
      for (let i = 1 ; i < lines.length ; i ++) {
        let line = lines[i];
        let languageMatch = line.match(/^!(\w{2})/);
        if (languageMatch) {
          if (!before) {
            contents[currentLanguage] = currentContent.trim();
          }
          before = false;
          currentLanguage = languageMatch[1].toLowerCase();
          currentContent = "";
        } else {
          currentContent += line + "\n";
        }
      }
      if (!before) {
        contents[currentLanguage] = currentContent.trim();
      }
      let word = new Word(uniqueName, date, contents);
      return word;
    } else {
      throw new ParseError("noHeader", "no header");
    }
  }

  public deserializeOthers(string: string, skipHeader: {root?: boolean} = {}): [DictionarySettings, Markers] {
    let lines = string.trim().split(/\r\n|\r|\n/);
    let index = 0;
    if (!skipHeader.root) {
      index = this.skipOthersRootHeader(lines, index);
    }
    let version;
    let alphabetRule;
    let revisions;
    let markers = Markers.createEmpty();
    let before = true;
    let currentTag = "";
    let currentString = "";
    let outerThis = this;
    let setVariable = function (tag: string, string: string) {
      if (tag === "VERSION") {
        version = outerThis.deserializeVersion(string);
      } else if (tag === "ALPHABET") {
        alphabetRule = outerThis.deserializeAlphabetRule(string);
      } else if (tag === "REVISION") {
        revisions = outerThis.deserializeRevisions(string);
      } else if (tag === "MARKER") {
        markers = outerThis.deserializeMarkers(string, {root: true});
      }
    };
    while (index < lines.length) {
      let line = lines[index ++];
      let headerMatch = line.match(/^!(\w+)/);
      if (headerMatch) {
        if (!before) {
          setVariable(currentTag, currentString);
        }
        before = false;
        currentTag = headerMatch[1];
        currentString = "";
      }
      currentString += line + "\n";
    }
    if (!before) {
      setVariable(currentTag, currentString);
    }
    let createDictionarySettings = function (version?: string, alphabetRule?: string, revisions?: Revisions): DictionarySettings {
      if (version === undefined && alphabetRule === undefined && revisions === undefined) {
        return DictionarySettings.createEmpty();
      } else {
        if (version !== undefined && alphabetRule !== undefined && revisions !== undefined) {
          return new DictionarySettings(version, alphabetRule, revisions);
        } else {
          throw new ParseError("insufficientDictionarySettings", "there are not enough sections in the dictionary settings");
        }
      }
    };
    let settings = createDictionarySettings(version, alphabetRule, revisions);
    return [settings, markers];
  }

  public deserializeDictionarySettings(string: string): DictionarySettings {
    let [settings, markers] = this.deserializeOthers(string);
    return settings;
  }

  public deserializeVersion(string: string, skipHeader: {part?: boolean} = {}): string {
    let lines = string.trim().split(/\r\n|\r|\n/);
    let index = 0;
    if (!skipHeader.part) {
      index = this.skipOthersPartHeader(lines, "VERSION", index);
    }
    while (index < lines.length) {
      let line = lines[index ++];
      if (line.trim() !== "") {
        let match = line.match(/^\-\s*(.*)$/);
        if (match) {
          return match[1];
        } else {
          throw new ParseError("invalidVersionLine", `invalid line in version definition: '${line}'`);
        }
      }
    }
    throw new ParseError("noVersion", "no version definition");
  }

  public deserializeAlphabetRule(string: string, skipHeader: {part?: boolean} = {}): string {
    let lines = string.trim().split(/\r\n|\r|\n/);
    let index = 0;
    if (!skipHeader.part) {
      index = this.skipOthersPartHeader(lines, "ALPHABET", index);
    }
    while (index < lines.length) {
      let line = lines[index ++];
      if (line.trim() !== "") {
        let match = line.match(/^\-\s*(.*)$/);
        if (match) {
          return match[1];
        } else {
          throw new ParseError("invalidAlphabetRuleLine", `invalid line in alphabet definition: '${line}'`);
        }
      }
    }
    throw new ParseError("noAlphabetRule", "no alphabet definition");
  }

  public deserializeRevisions(string: string, skipHeader: {part?: boolean} = {}): Revisions {
    let lines = string.trim().split(/\r\n|\r|\n/);
    let index = 0;
    if (!skipHeader.part) {
      index = this.skipOthersPartHeader(lines, "REVISION", index);
    }
    let revisions = new Revisions();
    while (index < lines.length) {
      let line = lines[index ++];
      if (line.trim() !== "") {
        let revision = this.deserializeRevision(line.trim());
        revisions.push(revision);
      }
    }
    return revisions;
  }

  public deserializeRevision(line: string): Revision {
    let match = line.match(/^\-\s*(?:@(\d+)\s*)?\{(.*?)\}\s*→\s*\{(.*?)\}\s*$/);
    if (match) {
      let date = (match[1] !== undefined) ? parseInt(match[1], 10) : null;
      let beforeName = match[2];
      let afterName = match[3];
      let revision = new Revision(date, beforeName, afterName);
      return revision;
    } else {
      throw new ParseError("invalidRevisionLine", `invalid line in revision definition: '${line}'`);
    }
  }

  public deserializeMarkers(string: string, skipHeader: {root?: boolean, part?: boolean} = {}): Markers {
    let lines = string.trim().split(/\r\n|\r|\n/);
    let index = 0;
    if (!skipHeader.root) {
      index = this.skipOthersRootHeader(lines, index);
    }
    if (!skipHeader.part) {
      index = this.skipOthersPartHeader(lines, "MARKER", index);
    }
    let rawMarkers = new Map<string, Array<Marker>>();
    while (index < lines.length) {
      let line = lines[index ++];
      if (line.trim() !== "") {
        let [uniqueName, wordMarkers] = this.deserializeWordMarker(line.trim());
        if (wordMarkers.length > 0) {
          rawMarkers.set(uniqueName, wordMarkers);
        }
      }
    }
    let markers = new Markers(rawMarkers.entries());
    return markers;
  }

  public deserializeWordMarker(line: string): [string, Array<Marker>] {
    let match = line.match(/^\-\s*(?:\{(.*?)\}|(.*?))\s*:\s*(.*?)\s*$/);
    if (match) {
      let uniqueName = match[1] ?? match[2];
      let wordMarkers = match[3].split(/\s*,\s*/).map((value) => {
        let wordMarker = MarkerUtil.cast(value);
        if (wordMarker !== undefined) {
          return wordMarker;
        } else {
          throw new ParseError("noSuchMarker", `no such marker with name '${value}'`);
        }
      });
      return [uniqueName, wordMarkers];
    } else {
      throw new ParseError("invalidMarkerLine", `invalid line in marker definition: '${line}'`);
    }
  }

  private skipOthersRootHeader(lines: Array<string>, fromIndex: number): number {
    let index = fromIndex;
    let found = false;
    while (index < lines.length) {
      let line = lines[index ++];
      if (line.trim() !== "") {
        if (line.trim() === "**") {
          found = true;
          break;
        } else {
          throw new ParseError("invalidHeader", `invalid header: ${line}`);
        }
      }
    }
    if (!found) {
      throw new ParseError("noHeader", "no header");
    }
    return index;
  }

  private skipOthersPartHeader(lines: Array<string>, tag: string, fromIndex: number): number {
    let index = fromIndex;
    let found = false;
    while (index < lines.length) {
      let line = lines[index ++];
      if (line.trim() !== "") {
        if (line.trim() === "!" + tag) {
          found = true;
          break;
        } else {
          throw new ParseError("invalidPartHeader", `invalid part header: ${line}`);
        }
      }
    }
    if (!found) {
      throw new ParseError("noPartHeader", "no part header");
    }
    return index;
  }

}