/* eslint-disable @typescript-eslint/naming-convention */

import "jest-extended";
import mock from "mock-fs";
import dedent from "ts-dedent";
import {
  Dictionary,
  NormalParameter
} from "../../source";
import {
  ShalInflectionSuggester,
  StableInflectionSuggester
} from "../../source/dictionary/suggester";
import {
  SingleLoader
} from "../../source/io";


async function getDictionary(): Promise<Dictionary> {
  const loader = new SingleLoader("testdic.xdn");
  const dictionary = await loader.asPromise();
  return dictionary;
};

describe("version 6.x", () => {
  beforeEach(() => {
    mock({
      "testdic.xdn": dedent`
        **
        !VERSION
        - 6.2
        !ALPHABET
        - sztdkgfvpbcqxjlrnmyhaâáàeêéèiîíìoôòuûù
        !REVISION
        !MARKER
      `
    });
  });
  afterEach(mock.restore);
  test("test", async () => {
    const dictionary = await getDictionary();
    const parameter = new NormalParameter("", "name", "prefix", "ja", "default");
    const suggesters = parameter["createSuggesters"](dictionary);
    expect(suggesters[1]).toBeInstanceOf(StableInflectionSuggester);
  });
});

describe("version S", () => {
  beforeEach(() => {
    mock({
      "testdic.xdn": dedent`
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
  test("test", async () => {
    const dictionary = await getDictionary();
    const parameter = new NormalParameter("", "name", "prefix", "ja", "default");
    const suggesters = parameter["createSuggesters"](dictionary);
    expect(suggesters[1]).toBeInstanceOf(StableInflectionSuggester);
  });
});

describe("version 7.1", () => {
  beforeEach(() => {
    mock({
      "testdic.xdn": dedent`
        **
        !VERSION
        - 7.1
        !ALPHABET
        - sztdkgfvpbcqxjlrnmyhaâáàeêéèiîíìoôòuûù
        !REVISION
        !MARKER
      `
    });
  });
  afterEach(mock.restore);
  test("test", async () => {
    const dictionary = await getDictionary();
    const parameter = new NormalParameter("", "name", "prefix", "ja", "default");
    const suggesters = parameter["createSuggesters"](dictionary);
    expect(suggesters[1]).toBeInstanceOf(StableInflectionSuggester);
  });
});

describe("version 7.2", () => {
  beforeEach(() => {
    mock({
      "testdic.xdn": dedent`
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
  test("test", async () => {
    const dictionary = await getDictionary();
    const parameter = new NormalParameter("", "name", "prefix", "ja", "default");
    const suggesters = parameter["createSuggesters"](dictionary);
    expect(suggesters[1]).toBeInstanceOf(ShalInflectionSuggester);
  });
});