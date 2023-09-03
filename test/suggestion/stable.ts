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
  const parameter = new NormalParameter(text, "name", "prefix", "ja");
  const result = dictionary.search(parameter);
  expect(result.suggestions.length).toBeGreaterThan(0);
  const suggestion = result.suggestions[0];
  expect(suggestion.getKindName("ja")).toBe(kindName);
  expect(suggestion.getDescriptionNames("ja")).toEqual(descriptionNames);
}

function checkNoSuggestions(dictionary: Dictionary, text: string): void {
  const parameter = new NormalParameter(text, "name", "prefix", "ja");
  const result = dictionary.search(parameter);
  expect(result.suggestions.length).toBe(0);
}

describe("suggestion (version 6)", () => {
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
        + <副>
        * @1000 tut
        !JA
        + <副>
        * @1000 vo
        !JA
        + <助>
        **
        !VERSION
        - S
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
    checkSuggestion(dictionary, "vilises", "動辞の語形変化", ["動詞", "過去時制", "無相", "通常態", "肯定"]);
    checkSuggestion(dictionary, "vilisic", "動辞の語形変化", ["動詞", "未来時制", "経過相", "通常態", "肯定"]);
    checkSuggestion(dictionary, "vilisod", "動辞の語形変化", ["動詞", "通時時制", "継続相", "補助態", "肯定"]);
    checkSuggestion(dictionary, "vilisep", "動辞の語形変化", ["動詞", "過去時制", "終了相", "通常態", "肯定"]);
    checkSuggestion(dictionary, "duvilisak", "動辞の語形変化", ["動詞", "現在時制", "完了相", "通常態", "否定"]);
    checkSuggestion(dictionary, "duvilisiv", "動辞の語形変化", ["動詞", "未来時制", "開始相", "補助態", "否定"]);
    checkSuggestion(dictionary, "duviliseb", "動辞の語形変化", ["動詞", "過去時制", "終了相", "補助態", "否定"]);
  });
  test("verbal as other categories", async () => {
    const dictionary = await getDictionary();
    checkSuggestion(dictionary, "amay", "動辞の語形変化", ["形容詞", "肯定"]);
    checkSuggestion(dictionary, "adumay", "動辞の語形変化", ["形容詞", "否定"]);
    checkSuggestion(dictionary, "olof", "動辞の語形変化", ["副詞", "肯定"]);
    checkSuggestion(dictionary, "odulof", "動辞の語形変化", ["副詞", "否定"]);
    checkSuggestion(dictionary, "iolof", "動辞の語形変化", ["名詞修飾副詞", "肯定"]);
    checkSuggestion(dictionary, "iodulof", "動辞の語形変化", ["名詞修飾副詞", "否定"]);
    checkSuggestion(dictionary, "duvilis", "動辞の語形変化", ["名詞", "否定"]);
  });
  test("nominal", async () => {
    const dictionary = await getDictionary();
    checkSuggestion(dictionary, "dusakil", "名辞の語形変化", ["名詞", "否定"]);
    checkSuggestion(dictionary, "asakil", "名辞の語形変化", ["形容詞", "肯定"]);
    checkSuggestion(dictionary, "adusakil", "名辞の語形変化", ["形容詞", "否定"]);
  });
  test("adverbial", async () => {
    const dictionary = await getDictionary();
    checkSuggestion(dictionary, "ebam", "副辞の語形変化", ["副詞", "肯定"]);
    checkSuggestion(dictionary, "edubam", "副辞の語形変化", ["副詞", "否定"]);
    checkSuggestion(dictionary, "etut", "副辞の語形変化", ["副詞", "肯定"]);
    checkSuggestion(dictionary, "edutut", "副辞の語形変化", ["副詞", "否定"]);
    checkNoSuggestions(dictionary, "iebam");
    checkNoSuggestions(dictionary, "iedubam");
  });
  test("particle", async () => {
    const dictionary = await getDictionary();
    checkSuggestion(dictionary, "ivo", "助接辞の語形変化", ["非動詞修飾"]);
  });
});