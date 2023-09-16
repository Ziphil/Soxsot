/* eslint-disable @typescript-eslint/naming-convention */

import "jest-extended";
import mock from "mock-fs";
import dedent from "ts-dedent";
import {
  Dictionary,
  NormalParameter
} from "../../source";
import {
  SingleLoader
} from "../../source/io";


async function getDictionary(): Promise<Dictionary> {
  const loader = new SingleLoader("testdic.xdn");
  const dictionary = await loader.asPromise();
  return dictionary;
};

function checkSuggestion(dictionary: Dictionary, text: string, kindName: string, descriptionNames: Array<string>): void {
  const parameter = new NormalParameter(text, "name", "prefix", "ja", "default");
  const result = dictionary.search(parameter);
  expect(result.suggestions.length).toBeGreaterThan(0);
  const suggestion = result.suggestions[0];
  expect(suggestion.getKindName("ja")).toBe(kindName);
  expect(suggestion.getDescriptionNames("ja")).toEqual(descriptionNames);
}

function checkNoSuggestions(dictionary: Dictionary, text: string): void {
  const parameter = new NormalParameter(text, "name", "prefix", "ja", "default");
  const result = dictionary.search(parameter);
  expect(result.suggestions.length).toBe(0);
}

describe("suggestion (version 7)", () => {
  beforeEach(() => {
    mock({
      "testdic.xdn": dedent`
        * @1000 sakil
        !JA
        + <名>
        * @1000 vilis
        !JA
        + <動>
        * @1000 may
        !JA
        + <動>
        * @1000 lof
        !JA
        + <動>
        * @1000 bam
        !JA
        + <述>
        * @1000 tut
        !JA
        + <特>
        * @1000 vo
        !JA
        + <助>
        **
        !VERSION
        - 7.2
        !ALPHABET
        - sztdkgfvpbcqxjlrnmyhaâáàeêéèiîíìoôòuûù
        !REVISION
        !MARKER
      `
    });
  });
  afterEach(mock.restore);
  test("verbal as verb", async () => {
    const dictionary = await getDictionary();
    checkSuggestion(dictionary, "vilises", "動辞の活用", ["動詞", "過去時制", "無相", "通常態", "肯定"]);
    checkSuggestion(dictionary, "vilisic", "動辞の活用", ["動詞", "未来時制", "経過相", "通常態", "肯定"]);
    checkSuggestion(dictionary, "vilisod", "動辞の活用", ["動詞", "通時時制", "継続相", "補助態", "肯定"]);
    checkSuggestion(dictionary, "duvilisak", "動辞の活用", ["動詞", "現在時制", "完了相", "通常態", "否定"]);
    checkSuggestion(dictionary, "duvilisiv", "動辞の活用", ["動詞", "未来時制", "開始相", "補助態", "否定"]);
    checkNoSuggestions(dictionary, "vilisep");
    checkNoSuggestions(dictionary, "duviliseb");
  });
  test("verbal as other categories", async () => {
    const dictionary = await getDictionary();
    checkSuggestion(dictionary, "amay", "動辞の活用", ["形容詞", "肯定"]);
    checkSuggestion(dictionary, "adumay", "動辞の活用", ["形容詞", "否定"]);
    checkSuggestion(dictionary, "olof", "動辞の活用", ["副詞", "肯定"]);
    checkSuggestion(dictionary, "odulof", "動辞の活用", ["副詞", "否定"]);
    checkSuggestion(dictionary, "iolof", "動辞の活用", ["非動詞修飾副詞", "肯定"]);
    checkSuggestion(dictionary, "iodulof", "動辞の活用", ["非動詞修飾副詞", "否定"]);
    checkSuggestion(dictionary, "duvilis", "動辞の活用", ["名詞", "否定"]);
  });
  test("nominal", async () => {
    const dictionary = await getDictionary();
    checkSuggestion(dictionary, "dusakil", "名辞の活用", ["名詞", "否定"]);
    checkSuggestion(dictionary, "asakil", "名辞の活用", ["形容詞", "肯定"]);
    checkSuggestion(dictionary, "adusakil", "名辞の活用", ["形容詞", "否定"]);
  });
  test("adpredicative", async () => {
    const dictionary = await getDictionary();
    checkSuggestion(dictionary, "ebam", "連述辞の活用", ["連述詞", "肯定"]);
    checkSuggestion(dictionary, "edubam", "連述辞の活用", ["連述詞", "否定"]);
    checkSuggestion(dictionary, "iebam", "連述辞の活用", ["非動詞修飾連述詞", "肯定"]);
    checkSuggestion(dictionary, "iedubam", "連述辞の活用", ["非動詞修飾連述詞", "否定"]);
  });
  test("special", async () => {
    const dictionary = await getDictionary();
    checkSuggestion(dictionary, "etut", "特殊辞の活用", ["特殊詞", "肯定"]);
    checkSuggestion(dictionary, "edutut", "特殊辞の活用", ["特殊詞", "否定"]);
    checkNoSuggestions(dictionary, "ietut");
    checkNoSuggestions(dictionary, "iedutut");
  });
  test("particle", async () => {
    const dictionary = await getDictionary();
    checkSuggestion(dictionary, "ivo", "助接辞の活用", ["非動詞修飾"]);
  });
});