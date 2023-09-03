/* eslint-disable @typescript-eslint/naming-convention */

import "jest-extended";
import mock from "mock-fs";
import dedent from "ts-dedent";
import {
  Dictionary,
  NormalParameter
} from "../source";
import {
  SingleLoader
} from "../source/io";


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

describe("suggester (version 7)", () => {
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
        - @1000 {sakal} → {sakil}
        !MARKER
        - sakil: circle
      `
    });
  });
  afterEach(mock.restore);
  const getDictionary = async function (): Promise<Dictionary> {
    const loader = new SingleLoader("testdic.xdn");
    const dictionary = await loader.asPromise();
    return dictionary;
  };
  test("inflection of verbal as verb", async () => {
    const dictionary = await getDictionary();
    checkSuggestion(dictionary, "vilises", "動辞の語形変化", ["動詞", "過去時制", "無相", "通常態", "肯定"]);
    checkSuggestion(dictionary, "vilisic", "動辞の語形変化", ["動詞", "未来時制", "経過相", "通常態", "肯定"]);
    checkSuggestion(dictionary, "vilisod", "動辞の語形変化", ["動詞", "通時時制", "継続相", "補助態", "肯定"]);
    checkSuggestion(dictionary, "duvilisak", "動辞の語形変化", ["動詞", "現在時制", "完了相", "通常態", "否定"]);
    checkSuggestion(dictionary, "duvilisiv", "動辞の語形変化", ["動詞", "未来時制", "開始相", "補助態", "否定"]);
    checkNoSuggestions(dictionary, "vilisep");
    checkNoSuggestions(dictionary, "duviliseb");
  });
});