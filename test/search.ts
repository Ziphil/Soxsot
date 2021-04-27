//

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


describe("search from names", () => {
  beforeAll(() => {
    mock({
      "testdic.xdn": dedent`
        * @1000 sat
        !JA
        + <動>
        * @1000 satlos
        !JA
        + <動>
        * @1000 sâtix
        !JA
        + <動>
        * @1000 sát
        !JA
        + <動>
        * @1000 tufos
        !JA
        + <動>
        * @1000 denòs
        !JA
        + <動>
      `
    });
  });
  afterAll(mock.restore);
  let getDictionary = async function (): Promise<Dictionary> {
    let loader = new SingleLoader("testdic.xdn");
    let dictionary = await loader.asPromise();
    return dictionary;
  };
  test("prefix search with default ignore option", async () => {
    let dictionary = await getDictionary();
    let parameter = new NormalParameter("sat", "name", "prefix", "ja");
    let result = dictionary.search(parameter);
    expect(result.words.map((word) => word.uniqueName)).toIncludeSameMembers(["sat", "satlos", "sâtix", "sát"]);
  });
  test("suffix search with default ignore option", async () => {
    let dictionary = await getDictionary();
    let parameter = new NormalParameter("os", "name", "suffix", "ja");
    let result = dictionary.search(parameter);
    expect(result.words.map((word) => word.uniqueName)).toIncludeSameMembers(["satlos", "tufos", "denòs"]);
  });
  test("prefix search with custom ignore option", async () => {
    let dictionary = await getDictionary();
    let parameter = new NormalParameter("sat", "name", "prefix", "ja", {case: true, diacritic: false});
    let result = dictionary.search(parameter);
    expect(result.words.map((word) => word.uniqueName)).toIncludeSameMembers(["sat", "satlos"]);
  });
  test("suffix search with custom ignore option", async () => {
    let dictionary = await getDictionary();
    let parameter = new NormalParameter("os", "name", "suffix", "ja", {case: true, diacritic: false});
    let result = dictionary.search(parameter);
    expect(result.words.map((word) => word.uniqueName)).toIncludeSameMembers(["satlos", "tufos"]);
  });
});

describe("search from equivalents", () => {
  beforeAll(() => {
    mock({
      "testdic.xdn": dedent`
        * @1000 sat
        !JA
        + <動>
        = <動> あいう, かきく, さしす
        =? たちつ, なにぬ
        * @1000 s'
        !JA
        + <縮>
        = <縮> (格組) {sal/os/ a cal}, {sal/os/ a cit}
        =? [/So/t ]{a}[ /T/]
      `
    });
  });
  afterAll(mock.restore);
  let getDictionary = async function (): Promise<Dictionary> {
    let loader = new SingleLoader("testdic.xdn");
    let dictionary = await loader.asPromise();
    return dictionary;
  };
  test("prefix search", async () => {
    let dictionary = await getDictionary();
    let parameter = new NormalParameter("かき", "equivalent", "prefix", "ja");
    let result = dictionary.search(parameter);
    expect(result.words.map((word) => word.uniqueName)).toIncludeSameMembers(["sat"]);
  });
  test("prefix search from hidden equivalents", async () => {
    let dictionary = await getDictionary();
    let parameter = new NormalParameter("なに", "equivalent", "prefix", "ja");
    let result = dictionary.search(parameter);
    expect(result.words.map((word) => word.uniqueName)).toIncludeSameMembers(["sat"]);
  });
  test("markup", async () => {
    let dictionary = await getDictionary();
    let parameters = [new NormalParameter("salos a cal", "equivalent", "exact", "ja"), new NormalParameter("Sot a T", "equivalent", "exact", "ja")];
    for (let parameter of parameters) {
      let result = dictionary.search(parameter);
      expect(result.words.map((word) => word.uniqueName)).toIncludeSameMembers(["s'"]);
    }
  });
});