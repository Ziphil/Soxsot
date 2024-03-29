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


async function getDictionary(): Promise<Dictionary> {
  const loader = new SingleLoader("testdic.xdn");
  const dictionary = await loader.asPromise();
  return dictionary;
};

describe("search from names", () => {
  beforeEach(() => {
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
  afterEach(mock.restore);
  test("prefix search with default ignore option", async () => {
    const dictionary = await getDictionary();
    const parameter = new NormalParameter("sat", "name", "prefix", "ja", "default");
    const result = dictionary.search(parameter);
    expect(result.words.map((word) => word.uniqueName)).toIncludeSameMembers(["sat", "satlos", "sâtix", "sát"]);
  });
  test("suffix search with default ignore option", async () => {
    const dictionary = await getDictionary();
    const parameter = new NormalParameter("os", "name", "suffix", "ja", "default");
    const result = dictionary.search(parameter);
    expect(result.words.map((word) => word.uniqueName)).toIncludeSameMembers(["satlos", "tufos", "denòs"]);
  });
  test("prefix search with custom ignore option", async () => {
    const dictionary = await getDictionary();
    const parameter = new NormalParameter("sat", "name", "prefix", "ja", {case: true, diacritic: false, space: true, wave: true});
    const result = dictionary.search(parameter);
    expect(result.words.map((word) => word.uniqueName)).toIncludeSameMembers(["sat", "satlos"]);
  });
  test("suffix search with custom ignore option", async () => {
    const dictionary = await getDictionary();
    const parameter = new NormalParameter("os", "name", "suffix", "ja", {case: true, diacritic: false, space: true, wave: true});
    const result = dictionary.search(parameter);
    expect(result.words.map((word) => word.uniqueName)).toIncludeSameMembers(["satlos", "tufos"]);
  });
});

describe("search from equivalents", () => {
  beforeEach(() => {
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
  afterEach(mock.restore);
  test("prefix search", async () => {
    const dictionary = await getDictionary();
    const parameter = new NormalParameter("かき", "equivalent", "prefix", "ja", "default");
    const result = dictionary.search(parameter);
    expect(result.words.map((word) => word.uniqueName)).toIncludeSameMembers(["sat"]);
  });
  test("prefix search from hidden equivalents", async () => {
    const dictionary = await getDictionary();
    const parameter = new NormalParameter("なに", "equivalent", "prefix", "ja", "default");
    const result = dictionary.search(parameter);
    expect(result.words.map((word) => word.uniqueName)).toIncludeSameMembers(["sat"]);
  });
  test("markup", async () => {
    const dictionary = await getDictionary();
    const parameters = [new NormalParameter("salos a cal", "equivalent", "exact", "ja", "default"), new NormalParameter("Sot a T", "equivalent", "exact", "ja", "default")];
    for (const parameter of parameters) {
      const result = dictionary.search(parameter);
      expect(result.words.map((word) => word.uniqueName)).toIncludeSameMembers(["s'"]);
    }
  });
});

describe("ignore options", () => {
  beforeEach(() => {
    mock({
      "testdic.xdn": dedent`
        * @1000 sat
        !JA
        + <動>
        = <動> 1 万
        * @1000 satlos
        !JA
        + <動>
        = <動> ～を, ～すると
        * @1000 sâtix
        !JA
        + <動>
        = <動> すると
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
  afterEach(mock.restore);
  test("case", async () => {
    const dictionary = await getDictionary();
    const parameter = new NormalParameter("SÂtiX", "name", "exact", "ja", {case: true, diacritic: false, space: false, wave: false});
    const result = dictionary.search(parameter);
    expect(result.words.map((word) => word.uniqueName)).toIncludeSameMembers(["sâtix"]);
  });
  test("diacritic", async () => {
    const dictionary = await getDictionary();
    const parameter = new NormalParameter("sat", "name", "exact", "ja", {case: false, diacritic: true, space: false, wave: false});
    const result = dictionary.search(parameter);
    expect(result.words.map((word) => word.uniqueName)).toIncludeSameMembers(["sat", "sát"]);
  });
  test("space", async () => {
    const dictionary = await getDictionary();
    const parameter = new NormalParameter("1万", "equivalent", "exact", "ja", {case: false, diacritic: false, space: true, wave: false});
    const result = dictionary.search(parameter);
    expect(result.words.map((word) => word.uniqueName)).toIncludeSameMembers(["sat"]);
  });
  test("wave", async () => {
    const dictionary = await getDictionary();
    const parameter = new NormalParameter("すると", "equivalent", "exact", "ja", {case: false, diacritic: false, space: false, wave: true});
    const result = dictionary.search(parameter);
    expect(result.words.map((word) => word.uniqueName)).toIncludeSameMembers(["satlos", "sâtix"]);
  });
});