/* eslint-disable @typescript-eslint/naming-convention */

import "jest-extended";
import mock from "mock-fs";
import dedent from "ts-dedent";
import {
  ExampleInformation,
  MarkupParser,
  MarkupResolver,
  NormalInformation,
  ParsedWord,
  Parser,
  PhraseInformation,
  Word
} from "../source";
import {
  SingleLoader
} from "../source/io";


describe("markup parser", () => {
  const resolver = new MarkupResolver<string, string>({
    resolveLink: (name, children) => `<L:${name}|${children.join("")}>`,
    resolveBracket: (children) => `<B|${children.join("")}>`,
    resolveBrace: (children) => `<C|${children.join("")}>`,
    resolveSlash: (string) => `<S|${string}>`,
    resolveEscape: (char) => `<E|${char}>`,
    join: (nodes) => nodes.join("")
  });
  const parser = new MarkupParser(resolver);
  test("bracket", () => {
    expect(parser.parse("[kol]")).toBe("<B|kol>");
    expect(parser.parse("foofoo [kol]bar[ces]")).toBe("foofoo <B|kol>bar<B|ces>");
  });
  test("brace", () => {
    expect(parser.parse("{ces}")).toBe("<C|<L:ces|ces>>");
    expect(parser.parse("{salat a tel}")).toBe("<C|<L:salat|salat> <L:a|a> <L:tel|tel>>");
    expect(parser.parse("{kâkak, obâl, a cit.}")).toBe("<C|<L:kâkak|kâkak>, <L:obâl|obâl>, <L:a|a> <L:cit|cit>.>");
    expect(parser.parse("{â! pa e ayát?}")).toBe("<C|<L:â|â>! <L:pa|pa> <L:e|e> <L:ayát|ayát>?>");
    expect(parser.parse("foofoo {ces, cit}bar{cal} baz")).toBe("foofoo <C|<L:ces|ces>, <L:cit|cit>>bar<C|<L:cal|cal>> baz");
  });
  test("slash", () => {
    expect(parser.parse("/neko/")).toBe("<S|neko>");
    expect(parser.parse("foo/neko//usagi/ bar/neko/")).toBe("foo<S|neko><S|usagi> bar<S|neko>");
  });
  test("escape", () => {
    expect(parser.parse("`{`}`[`]```/")).toBe("<E|{><E|}><E|[><E|]><E|`><E|/>");
    expect(parser.parse("/`// `/ `/```/")).toBe("<S|<E|/>> <E|/> <E|/><E|`><E|/>");
  });
  test("nested", () => {
    expect(parser.parse("[/K/o/s/ a tel]")).toBe("<B|<S|K>o<S|s> a tel>");
    expect(parser.parse("{milcit/a/s}")).toBe("<C|<L:milcitas|milcit<S|a>s>>");
    expect(parser.parse("{kôm/os/, a}[ /K/, ]{e hâl.}")).toBe("<C|<L:kômos|kôm<S|os>>, <L:a|a>><B| <S|K>, ><C|<L:e|e> <L:hâl|hâl>.>");
  });
  test("mismatching syntax", () => {
    expect(parser.parse("[ces")).toBe(parser.parse("[ces]"));
    expect(parser.parse("{tel")).toBe(parser.parse("{tel}"));
    expect(parser.parse("/foo")).toBe(parser.parse("/foo/"));
    expect(parser.parse("{sôd/es")).toBe(parser.parse("{sôd/es/}"));
    expect(parser.parse("foo`")).toBe(parser.parse("foo"));
  });
});

describe("parser", () => {
  beforeEach(() => {
    mock({
      "testdic.xdn": dedent`
        * @1036 lic+~~
        !JA
        + <動>
        = <動> (格組) 訳語 1, 訳語 2, 訳語 3
        =? 隠し訳語 1, 隠し訳語 2
        M: 語義。
        E: 語源。
        U: 語法。
        U: @3380 日付付き。
        U?: 隠しフィールド。
        U?: @1191 両方。
        O: タスク。
        N: 備考。
        H: 履歴。
        P: {te tesil acál} → 次の瞬間に
        P: @5003 {fi qelar} → 声に出して, 声を出して | 説明あり成句。
        S: {pîtas e tel, dà kelitas e tel te lôk avév.} → 私は怖かったが、同時に安心もしていた。
        - <類> {likom}*, {káz}, {valcas}
        - <対> {sakil}
        + <動当>
        = <副動> 急に, 突然, 突如
        = <形> (/†'n/) 急の, 突然の
        M: 予兆が全くなく。
        E: < {tud} ＋ [kol] (< {kolcav})。
        - <類> {bâl}, {bazis}
        !EN
        + <V>
        = <V> (frame) equivalent 1, equivalent 2, equivalent 3
        =? hidden equivalent 1, hidden equivalent 2
        M: Meaning.
        E: Etymology.
        U: Usage.
        U: @3380 With date.
        U?: Hidden field.
        U?: @1191 Both.
        O: Task.
        N: Note.
        H: History.
        P: {te tesil acál} → in another moment
        P: {fi qelar} → aloud, out loud | Phrase.
        S: {pîtas e tel, dà kelitas e tel te lôk avév.} → I was scared, but at the same time, I was also relieved.
        - <S> {likom}*, {káz}, {valcas}
        - <A> {sakil}
        + <Vk>
        = <Bv> suddenly, adruptly
        = <A> (/†'n/) sudden, adrupt
        M: With no signs at all.
        E: < {tud} + [kol] (< {kolcav}).
        - <S> {bâl}, {bazis}
      `
    });
  });
  afterEach(mock.restore);
  const resolver = MarkupResolver.createKeep();
  const parser = new Parser(resolver);
  const getWord = async function (): Promise<[Word, ParsedWord<string>]> {
    const loader = new SingleLoader("testdic.xdn");
    const dictionary = await loader.asPromise();
    const rawWord = dictionary.words[0];
    const word = parser.parse(dictionary.words[0]);
    return [rawWord, word];
  };
  test("basic", async () => {
    const [rawWord, word] = await getWord();
    expect(rawWord).not.toBeNil();
    expect(rawWord.contents).toHaveProperty("ja");
    expect(rawWord.contents).toHaveProperty("en");
    expect(word.uniqueName).toBe("lic+~~");
    expect(word.name).toBe("lic+");
    expect(word.date).toBe(1036);
    expect(word.parts).toHaveProperty("ja");
    expect(word.parts).toHaveProperty("en");
    expect(word.parts["ja"]!.sort).toBe("動");
    expect(word.parts["en"]!.sort).toBe("V");
  });
  test("sections", async () => {
    const [, word] = await getWord();
    expect(word.parts["ja"]!.sections[0].sort).toBe("動");
    expect(word.parts["ja"]!.sections[1].sort).toBe("動当");
    expect(word.parts["en"]!.sections[0].sort).toBe("V");
    expect(word.parts["en"]!.sections[1].sort).toBe("Vk");
    for (const language of ["ja", "en"]) {
      const sections = word.parts[language]!.sections;
      expect(sections.length).toBe(2);
      expect(sections[0].getFields(true).length).toBe(13);
      expect(sections[0].getFields(false).length).toBe(16);
      expect(sections[0].equivalents.length).toBe(2);
      expect(sections[0].getEquivalents(true).length).toBe(1);
      expect(sections[0].getEquivalents(false).length).toBe(2);
      expect(sections[0].informations.length).toBe(12);
      expect(sections[0].getInformations(true).length).toBe(10);
      expect(sections[0].getInformations(false).length).toBe(12);
      expect(sections[0].relations.length).toBe(2);
      expect(sections[1].equivalents.length).toBe(2);
      expect(sections[1].informations.length).toBe(2);
      expect(sections[1].relations.length).toBe(1);
    }
  });
  test("part japanese, section 0, equivalents", async () => {
    const [, word] = await getWord();
    const equivalents = word.parts["ja"]!.sections[0].equivalents;
    expect(equivalents[0].category).toBe("動");
    expect(equivalents[0].frame).toBe("格組");
    expect(equivalents[0].hidden).toBeFalse();
    expect(equivalents[0].names.length).toBe(3);
    expect(equivalents[0].names[0]).toBe("訳語 1");
    expect(equivalents[0].names[1]).toBe("訳語 2");
    expect(equivalents[0].names[2]).toBe("訳語 3");
    expect(equivalents[1].hidden).toBeTrue();
    expect(equivalents[1].names.length).toBe(2);
  });
  test("part japanese, section 0, normal informations", async () => {
    const [, word] = await getWord();
    const informations = word.parts["ja"]!.sections[0].informations.slice(0, 9) as Array<NormalInformation<string>>;
    const normalInformations = word.parts["ja"]!.sections[0].getNormalInformations(false);
    for (const information of informations) {
      expect(information).toBeInstanceOf(NormalInformation);
    }
    expect(informations).toEqual(normalInformations);
    expect(informations[0].kind).toBe("meaning");
    expect(informations[1].kind).toBe("etymology");
    expect(informations[2].kind).toBe("usage");
    expect(informations[3].kind).toBe("usage");
    expect(informations[4].kind).toBe("usage");
    expect(informations[5].kind).toBe("usage");
    expect(informations[6].kind).toBe("task");
    expect(informations[7].kind).toBe("note");
    expect(informations[8].kind).toBe("history");
    expect(informations[0].text).toBe("語義。");
    expect(informations[1].text).toBe("語源。");
    expect(informations[2].date).toBeNull();
    expect(informations[2].hidden).toBeFalse();
    expect(informations[3].date).toBe(3380);
    expect(informations[3].hidden).toBeFalse();
    expect(informations[4].date).toBeNull();
    expect(informations[4].hidden).toBeTrue();
    expect(informations[5].date).toBe(1191);
    expect(informations[5].hidden).toBeTrue();
  });
  test("part japanese, section 0, phrase informations", async () => {
    const [, word] = await getWord();
    const informations = word.parts["ja"]!.sections[0].informations.slice(9, 11) as Array<PhraseInformation<string>>;
    const phraseInformations = word.parts["ja"]!.sections[0].getPhraseInformations(false);
    for (const information of informations) {
      expect(information).toBeInstanceOf(PhraseInformation);
      expect(information.kind).toBe("phrase");
    }
    expect(informations).toEqual(phraseInformations);
    expect(informations[0].expression).toBe("{te tesil acál}");
    expect(informations[0].equivalentNames).toEqual(["次の瞬間に"]);
    expect(informations[0].text).toBeNull();
    expect(informations[1].expression).toBe("{fi qelar}");
    expect(informations[1].equivalentNames).toEqual(["声に出して", "声を出して"]);
    expect(informations[1].text).toBe("説明あり成句。");
  });
  test("part japanese, section 0, example informations", async () => {
    const [, word] = await getWord();
    const informations = word.parts["ja"]!.sections[0].informations.slice(11, 12) as Array<ExampleInformation<string>>;
    const exampleInformations = word.parts["ja"]!.sections[0].getExampleInformations(false);
    for (const information of informations) {
      expect(information).toBeInstanceOf(ExampleInformation);
      expect(information.kind).toBe("example");
    }
    expect(informations).toEqual(exampleInformations);
    expect(informations[0].sentence).toBe("{pîtas e tel, dà kelitas e tel te lôk avév.}");
    expect(informations[0].translation).toBe("私は怖かったが、同時に安心もしていた。");
  });
  test("part japanese, section 0, relations", async () => {
    const [, word] = await getWord();
    const relations = word.parts["ja"]!.sections[0].relations;
    expect(relations[0].title).toBe("類");
    expect(relations[0].entries[0].name).toBe("{likom}");
    expect(relations[0].entries[0].refer).toBeTrue();
    expect(relations[0].entries[1].name).toBe("{káz}");
    expect(relations[0].entries[1].refer).toBeFalse();
    expect(relations[0].entries[2].name).toBe("{valcas}");
    expect(relations[0].entries[2].refer).toBeFalse();
    expect(relations[1].title).toBe("対");
    expect(relations[1].entries[0].name).toBe("{sakil}");
  });
});