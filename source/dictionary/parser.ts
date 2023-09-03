//

import {
  Writable
} from "ts-essentials";
import {
  Equivalent
} from "./equivalent";
import {
  ExampleInformation,
  Information,
  NormalInformation,
  PhraseInformation
} from "./information";
import {
  InformationKindUtil
} from "./information";
import {
  ParsedWord,
  Parts
} from "./parsed-word";
import {
  Part
} from "./part";
import {
  PronouncerCreator
} from "./pronouncer/pronouncer-creator";
import {
  Relation
} from "./relation";
import {
  Section
} from "./section";
import {
  Word
} from "./word";


export class Parser<S> {

  private readonly markupParser: MarkupParser<S, unknown>;

  public constructor(resolver: MarkupResolver<S, any>) {
    this.markupParser = new MarkupParser(resolver);
  }

  public static createSimple(): Parser<string> {
    const resolver = MarkupResolver.createSimple();
    const parser = new Parser(resolver);
    return parser;
  }

  public static createKeep(): Parser<string> {
    const resolver = MarkupResolver.createKeep();
    const parser = new Parser(resolver);
    return parser;
  }

  /** 与えられた単語データをパースして、`ParsedWord` オブジェクトとして返します。
   * パースした全てのデータではなく一部の項目の内容のみが必要な場合は、`lookup` から始まるメソッドを使用した方が軽量です。*/
  public parse(word: Word): ParsedWord<S> {
    const pronouncer = PronouncerCreator.createByVersion(word.dictionary?.settings.version ?? "");
    const name = word.name;
    const uniqueName = word.uniqueName;
    const date = word.date;
    const pronunciation = pronouncer?.convert(name) ?? null;
    const parts = {} as Writable<Parts<S>>;
    for (const [language, content] of Object.entries(word.contents)) {
      if (content !== undefined) {
        const part = this.parsePart(content);
        parts[language] = part;
      }
    }
    const parsedWord = new ParsedWord(name, uniqueName, date, pronunciation, parts);
    return parsedWord;
  }

  private parsePart(content: string): Part<S> {
    const lines = content.split(/\r\n|\r|\n/);
    const sections = [];
    let before = true;
    let currentSort = null as string | null;
    let currentEquivalents = [];
    let currentInformations = [];
    let currentRelations = [];
    for (const line of lines) {
      const sortMatch = line.match(/^\+\s*(?:<(.*?)>)/);
      if (sortMatch) {
        if (!before) {
          const section = new Section(currentSort, currentEquivalents, currentInformations, currentRelations);
          sections.push(section);
        }
        before = false;
        currentSort = sortMatch[1] || null;
        currentEquivalents = [];
        currentInformations = [];
        currentRelations = [];
      }
      const field = this.parseField(line);
      if (field !== null) {
        if (field instanceof Equivalent) {
          currentEquivalents.push(field);
        } else if (field instanceof Information) {
          currentInformations.push(field);
        } else if (field instanceof Relation) {
          currentRelations.push(field);
        }
      }
    }
    if (!before) {
      const section = new Section(currentSort, currentEquivalents, currentInformations, currentRelations);
      sections.push(section);
    }
    const part = new Part(sections);
    return part;
  }

  private parseField(line: string): Equivalent<S> | Information<S> | Relation<S> | null {
    if (line.match(/^=\??/)) {
      return this.parseEquivalent(line);
    } else if (line.match(/^\w\??:/)) {
      return this.parseInformation(line);
    } else if (line.match(/^\-/)) {
      return this.parseRelation(line);
    } else {
      return null;
    }
  }

  private parseEquivalent(line: string): Equivalent<S> | null {
    const match = line.match(/^=(\?)?\s*(?:<(.*?)>\s*)?(?:\((.*?)\)\s*)?(.*)$/);
    if (match) {
      const hidden = match[1] !== undefined;
      const category = (match[2] !== undefined && match[2] !== "") ? match[2] : null;
      const frame = (match[3] !== undefined && match[3] !== "") ? this.markupParser.parse(match[3]) : null;
      const names = match[4].split(/\s*,\s*/).map((rawName) => this.markupParser.parse(rawName));
      const equivalent = new Equivalent(category, frame, names, hidden);
      return equivalent;
    } else {
      return null;
    }
  }

  private parseInformation(line: string): Information<S> | null {
    const match = line.match(/^(\w)(\?)?:\s*(?:@(\d+)\s*)?(.*)$/);
    if (match) {
      const kind = InformationKindUtil.fromTag(match[1]);
      const hidden = match[2] !== undefined;
      const date = (match[3] !== undefined) ? parseInt(match[3], 10) : null;
      const rawText = match[4];
      if (kind === "phrase") {
        const textMatch = rawText.match(/^(.*?)\s*→\s*(.*?)(?:\s*\|\s*(.*))?$/);
        if (textMatch) {
          const expression = this.markupParser.parse(textMatch[1]);
          const equivalents = textMatch[2].split(/\s*,\s*/).map((rawName) => this.markupParser.parse(rawName));
          const text = (textMatch[3] !== undefined && textMatch[3] !== "") ? this.markupParser.parse(textMatch[3]) : null;
          const information = new PhraseInformation(expression, equivalents, text, date, hidden);
          return information;
        } else {
          return null;
        }
      } else if (kind === "example") {
        const textMatch = rawText.match(/^(.*?)\s*→\s*(.*?)$/);
        if (textMatch) {
          const sentence = this.markupParser.parse(textMatch[1]);
          const translation = this.markupParser.parse(textMatch[2]);
          const information = new ExampleInformation(sentence, translation, date, hidden);
          return information;
        } else {
          return null;
        }
      } else if (kind !== undefined) {
        const text = this.markupParser.parse(rawText);
        const information = new NormalInformation(kind, text, date, hidden);
        return information;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }

  private parseRelation(line: string): Relation<S> | null {
    const match = line.match(/^\-\s*(?:<(.*?)>\s*)?(.*)$/);
    if (match) {
      const title = (match[1] !== undefined && match[1] !== "") ? match[1] : null;
      const entries = match[2].split(/\s*,\s*/).map((rawName) => {
        if (rawName.endsWith("*")) {
          const name = this.markupParser.parse(rawName.substring(0, rawName.length - 1));
          return {name, refer: true};
        } else {
          const name = this.markupParser.parse(rawName);
          return {name, refer: false};
        }
      });
      const relation = new Relation(title, entries);
      return relation;
    } else {
      return null;
    }
  }

  public lookupSort(word: Word, language: string): string | null | undefined {
    const content = word.contents[language];
    if (content !== undefined) {
      const match = content.match(/^\+\s*(?:<(.*?)>)/m);
      if (match) {
        return match[1];
      } else {
        return null;
      }
    } else {
      return undefined;
    }
  }

  public lookupEquivalentNames(word: Word, language: string, onlyVisible?: boolean): Array<S> | undefined {
    const content = word.contents[language];
    if (content !== undefined) {
      const names = [];
      const regexp = /^=(\?)?\s*(?:<(.*?)>\s*)?(?:\((.*?)\)\s*)?(.*)$/mg;
      let match;
      while (match = regexp.exec(content)) {
        if (!onlyVisible || !match[1]) {
          names.push(...match[4].split(/\s*,\s*/).map((rawName) => this.markupParser.parse(rawName)));
        }
      }
      return names;
    } else {
      return undefined;
    }
  }

  public lookupPhraseEquivalentNames(word: Word, language: string, onlyVisible?: boolean): Array<S> | undefined {
    const content = word.contents[language];
    if (content !== undefined) {
      const names = [];
      const regexp = /^(P)(\?)?:\s*(?:@(\d+)\s*)?(.*?)\s*→\s*(.*?)(?:\s*\|\s*(.*))?$/mg;
      let match;
      while (match = regexp.exec(content)) {
        if (!onlyVisible || !match[1]) {
          names.push(...match[5].split(/\s*,\s*/).map((rawName) => this.markupParser.parse(rawName)));
        }
      }
      return names;
    } else {
      return undefined;
    }
  }

}


export class MarkupParser<S, E> {

  private readonly resolver: MarkupResolver<S, E>;
  private source: string = "";
  private pointer: number = 0;

  public constructor(resolver: MarkupResolver<S, E>) {
    this.resolver = resolver;
  }

  public parse(source: string): S {
    this.source = source;
    this.pointer = 0;
    const node = this.consume();
    return node;
  }

  public consume(): S {
    const children = [];
    while (true) {
      const char = this.source.charAt(this.pointer);
      const remaining = this.source.substring(this.pointer);
      if (char === "{") {
        const element = this.consumeBrace();
        children.push(element);
      } else if (char === "[") {
        const element = this.consumeBracket();
        children.push(element);
      } else if (char === "/") {
        const [, element] = this.consumeSlash();
        children.push(element);
      } else if (remaining.match(/^H(\d+)/)) {
        const element = this.consumeHairia();
        children.push(element);
      } else if (char === "") {
        break;
      } else {
        const string = this.consumeString();
        children.push(string);
      }
    }
    const node = this.resolver.join(children);
    return node;
  }

  private consumeBrace(): E | string {
    this.pointer ++;
    const children = this.consumeBraceChildren();
    const element = this.resolver.resolveBrace(children);
    this.pointer ++;
    return element;
  }

  private consumeBracket(): E | string {
    this.pointer ++;
    const children = this.consumeBracketChildren();
    const element = this.resolver.resolveBracket(children);
    this.pointer ++;
    return element;
  }

  private consumeSlash(): [string, E | string] {
    this.pointer ++;
    const string = this.consumeSlashString();
    const element = this.resolver.resolveSlash(string);
    this.pointer ++;
    return [string, element];
  }

  private consumeHairia(): E | string {
    this.pointer ++;
    let hairiaString = "";
    while (true) {
      const char = this.source.charAt(this.pointer);
      if (char.match(/^\d$/)) {
        this.pointer ++;
        hairiaString += char;
      } else {
        break;
      }
    }
    const hairia = parseInt(hairiaString, 10);
    const element = this.resolver.resolveHairia(hairia);
    return element;
  }

  private consumeBraceChildren(): Array<E | string> {
    const children = [];
    let currentChildren = [];
    let currentName = "";
    while (true) {
      const char = this.source.charAt(this.pointer);
      if (char === " " || char === "," || char === "." || char === "!" || char === "?") {
        if (currentChildren.length > 0) {
          children.push(this.resolver.resolveLink(currentName, currentChildren));
          currentChildren = [];
          currentName = "";
        }
        this.pointer ++;
        children.push(char);
      } else if (char === "}" || char === "") {
        if (currentChildren.length > 0) {
          children.push(this.resolver.resolveLink(currentName, currentChildren));
          currentChildren = [];
          currentName = "";
        }
        break;
      } else if (char === "/") {
        const [slashName, slashElement] = this.consumeSlash();
        currentChildren.push(slashElement);
        currentName += slashName;
      } else {
        const string = this.consumeBraceString();
        currentChildren.push(string);
        currentName += string;
      }
    }
    return children;
  }

  private consumeBracketChildren(): Array<E | string> {
    const children = [];
    while (true) {
      const char = this.source.charAt(this.pointer);
      if (char === "/") {
        const [, slashElement] = this.consumeSlash();
        children.push(slashElement);
      } else if (char === "]" || char === "") {
        break;
      } else {
        const string = this.consumeBracketString();
        children.push(string);
      }
    }
    return children;
  }

  private consumeString(): string {
    let string = "";
    while (true) {
      const char = this.source.charAt(this.pointer);
      const remaining = this.source.substring(this.pointer);
      if (char === "{" || char === "[" || char === "/" || char === "") {
        break;
      } else if (remaining.match(/^H(\d+)/)) {
        break;
      } else if (char === "`") {
        string += this.consumeEscape();
      } else {
        this.pointer ++;
        string += char;
      }
    }
    if (this.resolver.modifyPunctuations) {
      string = string.replace(/、/g, "、 ");
      string = string.replace(/。/g, "。 ");
      string = string.replace(/「/g, " 「");
      string = string.replace(/」/g, "」 ");
      string = string.replace(/『/g, " 『");
      string = string.replace(/』/g, "』 ");
      string = string.replace(/〈/g, " 〈");
      string = string.replace(/〉/g, "〉 ");
      string = string.replace(/(、|。)\s+(」|』)/g, "$1$2");
      string = string.replace(/(」|』|〉)\s+(、|。|,|\.)/g, "$1$2");
      string = string.replace(/(\(|「|『)\s+(「|『)/g, "$1$2");
    }
    return string;
  }

  private consumeBraceString(): string {
    let string = "";
    while (true) {
      const char = this.source.charAt(this.pointer);
      if (char === "}" || char === "/" || char === "" || char === " " || char === "," || char === "." || char === "!" || char === "?") {
        break;
      } else if (char === "`") {
        string += this.consumeEscape();
      } else {
        this.pointer ++;
        string += char;
      }
    }
    return string;
  }

  private consumeBracketString(): string {
    let string = "";
    while (true) {
      const char = this.source.charAt(this.pointer);
      if (char === "]" || char === "/" || char === "") {
        break;
      } else if (char === "`") {
        string += this.consumeEscape();
      } else {
        this.pointer ++;
        string += char;
      }
    }
    return string;
  }

  private consumeSlashString(): string {
    let string = "";
    while (true) {
      const char = this.source.charAt(this.pointer);
      if (char === "/" || char === "") {
        break;
      } else if (char === "`") {
        string += this.consumeEscape();
      } else {
        this.pointer ++;
        string += char;
      }
    }
    return string;
  }

  private consumeEscape(): string {
    this.pointer ++;
    const char = this.source.charAt(this.pointer);
    if (char !== "") {
      const string = this.resolver.resolveEscape(char);
      this.pointer ++;
      return string;
    } else {
      return "";
    }
  }

}


export class MarkupResolver<S, E> {

  public readonly resolveLink: LinkResolver<E>;
  public readonly resolveBracket: BracketResolver<E>;
  public readonly resolveBrace: BracketResolver<E>;
  public readonly resolveSlash: SlashResolver<E>;
  public readonly resolveHairia: HairiaResolver<E>;
  public readonly resolveEscape: EscapeResolver;
  public readonly join: Joiner<S, E>;
  public readonly modifyPunctuations: boolean;

  public constructor(spec: MarkupResolverSpec<S, E>) {
    this.resolveLink = spec.resolveLink;
    this.resolveBracket = spec.resolveBracket;
    this.resolveBrace = spec.resolveBrace ?? spec.resolveBracket;
    this.resolveSlash = spec.resolveSlash;
    this.resolveHairia = spec.resolveHairia ?? MarkupResolver.createNoopHairiaResolver();
    this.resolveEscape = spec.resolveEscape ?? MarkupResolver.createNoopEscapeResolver();
    this.join = spec.join;
    this.modifyPunctuations = spec.modifyPunctuations ?? false;
  }

  private static createNoopEscapeResolver(): EscapeResolver {
    const resolve = function (char: string): string {
      return char;
    };
    return resolve;
  }

  private static createNoopHairiaResolver<E>(): HairiaResolver<E> {
    const resolve = function (hairia: number): string {
      return "H" + hairia.toString();
    };
    return resolve;
  }

  /** マークアップを全て取り除いてプレーンテキストにするリゾルバを作成します。 */
  public static createSimple(): MarkupResolver<string, string> {
    const resolveLink = function (name: string, children: Array<string>): string {
      return children.join("");
    };
    const resolveBracket = function (children: Array<string>): string {
      return children.join("");
    };
    const resolveSlash = function (string: string): string {
      return string;
    };
    const join = function (nodes: Array<string>): string {
      return nodes.join("");
    };
    const resolver = new MarkupResolver({resolveLink, resolveBracket, resolveSlash, join});
    return resolver;
  }

  /** マークアップの特殊文字などをそのまま残すリゾルバを作成します。*/
  public static createKeep(): MarkupResolver<string, string> {
    const resolveLink = function (name: string, children: Array<string>): string {
      return children.join("");
    };
    const resolveBracket = function (children: Array<string>): string {
      return "[" + children.join("") + "]";
    };
    const resolveBrace = function (children: Array<string>): string {
      return "{" + children.join("") + "}";
    };
    const resolveSlash = function (string: string): string {
      return "/" + string + "/";
    };
    const resolveEscape = function (char: string): string {
      return "`" + char;
    };
    const join = function (nodes: Array<string>): string {
      return nodes.join("");
    };
    const resolver = new MarkupResolver({resolveLink, resolveBracket, resolveBrace, resolveSlash, resolveEscape, join});
    return resolver;
  }

}


type MarkupResolverSpec<S, E> = {
  resolveLink: LinkResolver<E>,
  resolveBracket: BracketResolver<E>,
  resolveBrace?: BracketResolver<E>,
  resolveSlash: SlashResolver<E>,
  resolveHairia?: HairiaResolver<E>,
  resolveEscape?: EscapeResolver,
  join: Joiner<S, E>,
  modifyPunctuations?: boolean
};

type LinkResolver<E> = (name: string, children: Array<E | string>) => E | string;
type BracketResolver<E> = (children: Array<E | string>) => E | string;
type SlashResolver<E> = (string: string) => E | string;
type HairiaResolver<E> = (hairia: number) => E | string;
type EscapeResolver = (char: string) => string;
type Joiner<S, E> = (nodes: Array<E | string>) => S;