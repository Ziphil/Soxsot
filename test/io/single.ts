/* eslint-disable @typescript-eslint/naming-convention */

import {
  promises as fs
} from "fs";
import "jest-extended";
import mock from "mock-fs";
import dedent from "ts-dedent";
import {
  Dictionary,
  DictionarySettings,
  Markers
} from "../../source";
import {
  SingleLoader,
  SingleSaver
} from "../../source/io";


describe("load/save single file format", () => {
  beforeEach(() => {
    mock({
      "testdic.xdn": dedent`
        * @1128 ter
        !JA
        + <動>
        = <動> (/a/ が /e/ を) 飲む
        M: /e/ を噛まずに口から体の中へ入れる。
        U: 「飲む」という意味で一般に用いられるのが {ter}。「体の内部に入れてしまう」という意味を強調したのが {dazkut}。
        - <類> {dazkut}
        - <類> {sôd}*
        * @1128 sôd
        !JA
        + <動>
        = <動> (/a/ が /e/ を) 食べる, 食す
        M: /e/ を何度か噛んで口から体の中へ入れる。
        U: {sôd} と {ter} の区別は口の中に入れたものを噛むか噛まないかで行う。噛むなら {sôd} で噛まないなら {ter} である。
        U: {sôd} は、とにかく何かを口にすることを表す。一方 {tonis} は、昼食や夕食などの 1 日のうちに摂るまとまった食事を食べることのみを表す。
        - <類> {ter}
        - <類> {tonis}
        * @1150 sakil
        !JA
        + <名>
        = <名> リンゴ
        =? りんご, 林檎
        M: ?
        * @1035 xoq
        !JA
        + <名>
        = <名> 本, 書籍, 書物, 図書, 冊子
        M: 文章や絵や写真などを印刷した紙を束ね、 一方の端を綴じてまとめたもののうち、一般向けのもの。
        U: {xoq} は、小説やエッセイや漫画などの一般向けの本を指す。一方 {soxal} は、辞書や専門書や教科書のような専門的な内容を扱う本を指す。
        - <類> {soxal}, {faltad}, {càrat}
        **
        !VERSION
        - S
        !ALPHABET
        - sztdkgfvpbcqxjlrnmyhaâáàeêéèiîíìoôòuûù
        !REVISION
        - @1139 {pacar} → {parec}
        - @1202 {los} → {loc}
        - @1205 {'s} → {'c}
        !MARKER
        - xoq: pentagon, circle, square
        - sôd: up
        - sakil: hexagon, diamond, heart, trapezoid, cross
      `
    });
  });
  afterEach(mock.restore);
  const check = function (dictionary: Dictionary): void {
    const words = dictionary.words;
    const settings = dictionary.settings;
    const markers = dictionary.markers;
    expect.assertions(15);
    expect(dictionary.path).toBe("testdic.xdn");
    expect(words.length).toBe(4);
    expect(words.map((word) => word.uniqueName)).toIncludeSameMembers(["ter", "sôd", "sakil", "xoq"]);
    expect(settings.version).toBe("S");
    expect(settings.alphabetRule).toBe("sztdkgfvpbcqxjlrnmyhaâáàeêéèiîíìoôòuûù");
    expect(settings.revisions.length).toBe(3);
    expect(settings.revisions[0]?.date).toBe(1139);
    expect(settings.revisions[0]?.beforeName).toBe("pacar");
    expect(settings.revisions[0]?.afterName).toBe("parec");
    expect(settings.revisions[2]?.date).toBe(1205);
    expect(settings.revisions[2]?.beforeName).toBe("'s");
    expect(settings.revisions[2]?.afterName).toBe("'c");
    expect(markers.get("xoq")).toIncludeSameMembers(["pentagon", "circle", "square"]);
    expect(markers.get("sôd")).toIncludeSameMembers(["up"]);
    expect(markers.get("sakil")).toIncludeSameMembers(["hexagon", "diamond", "heart", "trapezoid", "cross"]);
  };
  test("load via promise", async () => {
    const loader = new SingleLoader("testdic.xdn");
    const dictionary = await loader.asPromise();
    check(dictionary);
  });
  test("load via event emitter", (done) => {
    const loader = new SingleLoader("testdic.xdn");
    loader.on("end", (dictionary) => {
      check(dictionary);
      done();
    });
    loader.on("error", (error) => {
      done(error);
    });
    loader.start();
  });
  test("idempotency", async () => {
    const loadData = async function (): Promise<string> {
      const data = await fs.readFile("testdic.xdn", {encoding: "utf-8"});
      return data;
    };
    const loadAndSaveDictionary = async function (): Promise<void> {
      const loader = new SingleLoader("testdic.xdn");
      const dictionary = await loader.asPromise();
      const saver = new SingleSaver(dictionary, "testdic.xdn");
      await saver.asPromise();
    };
    await loadAndSaveDictionary();
    const firstData = await loadData();
    await loadAndSaveDictionary();
    const secondData = await loadData();
    expect(firstData).toEqual(secondData);
  });
});

describe("single file format without system data (neither)", () => {
  beforeEach(() => {
    mock({
      "testdic.xdn": dedent`
        * @1068 monaf
        !JA
        + <名>
        = <名> 猫
        =? ネコ, ねこ
        M: ?
      `
    });
  });
  afterEach(mock.restore);
  test("settings", async () => {
    const loader = new SingleLoader("testdic.xdn");
    const dictionary = await loader.asPromise();
    const settings = dictionary.settings;
    const emptySettings = DictionarySettings.createEmpty();
    expect(settings).not.toBeNil();
    expect(settings).toEqual(emptySettings);
  });
  test("markers", async () => {
    const loader = new SingleLoader("testdic.xdn");
    const dictionary = await loader.asPromise();
    const markers = dictionary.markers;
    const emptyMarkers = Markers.createEmpty();
    expect(markers).not.toBeNil();
    expect(markers).toEqual(emptyMarkers);
  });
});

describe("single file format without system data (no settings)", () => {
  beforeEach(() => {
    mock({
      "testdic.xdn": dedent`
        * @1068 monaf
        !JA
        + <名>
        = <名> 猫
        =? ネコ, ねこ
        M: ?
        **
        !MARKER
        - xoq: pentagon, circle, square
      `
    });
  });
  afterEach(mock.restore);
  test("settings", async () => {
    const loader = new SingleLoader("testdic.xdn");
    const dictionary = await loader.asPromise();
    const settings = dictionary.settings;
    const emptySettings = DictionarySettings.createEmpty();
    expect(settings).not.toBeNil();
    expect(settings).toEqual(emptySettings);
  });
});

describe("single file format without system data (no markers)", () => {
  beforeEach(() => {
    mock({
      "testdic.xdn": dedent`
        * @1068 monaf
        !JA
        + <名>
        = <名> 猫
        =? ネコ, ねこ
        M: ?
        **
        !VERSION
        - S
        !ALPHABET
        - sztdkgfvpbcqxjlrnmyhaâáàeêéèiîíìoôòuûù
        !REVISION
        - @1139 {pacar} → {parec}
      `
    });
  });
  afterEach(mock.restore);
  test("markers", async () => {
    const loader = new SingleLoader("testdic.xdn");
    const dictionary = await loader.asPromise();
    const markers = dictionary.markers;
    const emptyMarkers = Markers.createEmpty();
    expect(markers).not.toBeNil();
    expect(markers).toEqual(emptyMarkers);
  });
});

describe("single file format with insufficient settings", () => {
  beforeEach(() => {
    mock({
      "testdic.xdn": dedent`
        * @1068 monaf
        !JA
        + <名>
        = <名> 猫
        =? ネコ, ねこ
        M: ?
        **
        !VERSION
        - S
        !REVISION
        - @1139 {pacar} → {parec}
        !MARKER
        - xoq: pentagon, circle, square
      `
    });
  });
  afterEach(mock.restore);
  test("test", async () => {
    const loader = new SingleLoader("testdic.xdn");
    await expect(loader.asPromise()).toReject();
  });
});