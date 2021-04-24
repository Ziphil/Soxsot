//

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
  DirectoryLoader,
  DirectorySaver
} from "../../source/io";


describe("load/save directory format", () => {
  beforeAll(() => {
    mock({
      "testdic/ter.xdnw": dedent`
        * @1128 ter
        !JA
        + <動>
        = <動> (/a/ が /e/ を) 飲む
        M: /e/ を噛まずに口から体の中へ入れる。
        U: 「飲む」という意味で一般に用いられるのが {ter}。「体の内部に入れてしまう」という意味を強調したのが {dazkut}。
        - <類> {dazkut}
        - <類> {sôd}* 
      `,
      "testdic/sôd.xdnw": dedent`
        * @1128 sôd
        !JA
        + <動>
        = <動> (/a/ が /e/ を) 食べる, 食す
        M: /e/ を何度か噛んで口から体の中へ入れる。
        U: {sôd} と {ter} の区別は口の中に入れたものを噛むか噛まないかで行う。噛むなら {sôd} で噛まないなら {ter} である。
        U: {sôd} は、とにかく何かを口にすることを表す。一方 {tonis} は、昼食や夕食などの 1 日のうちに摂るまとまった食事を食べることのみを表す。
        - <類> {ter}
        - <類> {tonis}
      `,
      "testdic/sakil.xdnw": dedent`
        * @1150 sakil
        !JA
        + <名>
        = <名> リンゴ
        =? りんご, 林檎
        M: ?
      `,
      "testdic/xoq.xdnw": dedent`
        * @1035 xoq
        !JA
        + <名>
        = <名> 本, 書籍, 書物, 図書, 冊子
        M: 文章や絵や写真などを印刷した紙を束ね、 一方の端を綴じてまとめたもののうち、一般向けのもの。
        U: {xoq} は、小説やエッセイや漫画などの一般向けの本を指す。一方 {soxal} は、辞書や専門書や教科書のような専門的な内容を扱う本を指す。
        - <類> {soxal}, {faltad}, {càrat}
      `,
      "testdic/#SETTINGS.xdns": dedent`
        **
        !VERSION
        - S
        !ALPHABET
        - sztdkgfvpbcqxjlrnmyhaâáàeêéèiîíìoôòuûù
        !REVISION
        - @1139 {pacar} → {parec}
        - @1202 {los} → {loc}
        - @1205 {'s} → {'c}
      `,
      "testdic/#MARKERS.xdns": dedent`
        **
        !MARKER
        - xoq: pentagon, circle, square
        - sôd: up
        - sakil: hexagon, diamond, heart, trapezoid, cross
      `
    });
  });
  afterAll(mock.restore);
  let check = function (dictionary: Dictionary): void {
    let words = dictionary.words;
    let settings = dictionary.settings;
    let markers = dictionary.markers;
    expect.assertions(15);
    expect(dictionary.path).toBe("testdic");
    expect(words.length).toBe(4);
    expect(words.map((word) => word.uniqueName)).toEqual(expect.arrayContaining(["ter", "sôd", "sakil", "xoq"]));
    expect(settings.version).toBe("S");
    expect(settings.alphabetRule).toBe("sztdkgfvpbcqxjlrnmyhaâáàeêéèiîíìoôòuûù");
    expect(settings.revisions.length).toBe(3);
    expect(settings.revisions[0]?.date).toBe(1139);
    expect(settings.revisions[0]?.beforeName).toBe("pacar");
    expect(settings.revisions[0]?.afterName).toBe("parec");
    expect(settings.revisions[2]?.date).toBe(1205);
    expect(settings.revisions[2]?.beforeName).toBe("'s");
    expect(settings.revisions[2]?.afterName).toBe("'c");
    expect(markers.get("xoq")).toEqual(expect.arrayContaining(["pentagon", "circle", "square"]));
    expect(markers.get("sôd")).toEqual(expect.arrayContaining(["up"]));
    expect(markers.get("sakil")).toEqual(expect.arrayContaining(["hexagon", "diamond", "heart", "trapezoid", "cross"]));
  };
  test("load via promise", async () => {
    let loader = new DirectoryLoader("testdic");
    let dictionary = await loader.asPromise();
    check(dictionary);
  });
  test("load via event emitter", (done) => {
    let loader = new DirectoryLoader("testdic");
    loader.on("end", (dictionary) => {
      check(dictionary);
      done();
    });
    loader.on("error", (error) => {
      done(error);
    });
    loader.start();
  });
  test("idempotency (saving without any modification of the data should not change the file contents)", async () => {
    let loadData = async function (): Promise<{[path: string]: string}> {
      let paths = await fs.readdir("testdic");
      let promises = paths.map((path) => fs.readFile("testdic/" + path, {encoding: "utf-8"}).then((data) => [path, data]));
      let entries = await Promise.all(promises);
      return Object.fromEntries(entries);
    };
    let loadAndSaveDictionary = async function (): Promise<void> {
      let loader = new DirectoryLoader("testdic");
      let dictionary = await loader.asPromise();
      let saver = new DirectorySaver(dictionary, "testdic");
      await saver.asPromise();
    };
    await loadAndSaveDictionary();
    let firstData = await loadData();
    await loadAndSaveDictionary();
    let secondData = await loadData();
    expect(firstData).toEqual(secondData);
  });
});

describe("directory format without system files", () => {
  beforeAll(() => {
    mock({
      "testdic/monaf.xdnw": dedent`
        * @1068 monaf
        !JA
        + <名>
        = <名> 猫
        =? ネコ, ねこ
        M: ?
      `
    });
  });
  afterAll(mock.restore);
  test("settings", async () => {
    let loader = new DirectoryLoader("testdic");
    let dictionary = await loader.asPromise();
    let settings = dictionary.settings;
    let emptySettings = DictionarySettings.createEmpty();
    expect(settings).not.toBeNil();
    expect(settings).toEqual(emptySettings);
  });
  test("markers", async () => {
    let loader = new DirectoryLoader("testdic");
    let dictionary = await loader.asPromise();
    let markers = dictionary.markers;
    let emptyMarkers = Markers.createEmpty();
    expect(markers).not.toBeNil();
    expect(markers).toEqual(emptyMarkers);
  });
});

describe("directory format with insufficient settings", () => {
  beforeAll(() => {
    mock({
      "testdic/monaf.xdnw": dedent`
        * @1068 monaf
        !JA
        + <名>
        = <名> 猫
        =? ネコ, ねこ
        M: ?
      `,
      "testdic/#SETTINGS.xdns": dedent`
        **
        !VERSION
        - S
        !REVISION
        - @1139 {pacar} → {parec}
      `
    });
  });
  afterAll(mock.restore);
  test("test", async () => {
    let loader = new DirectoryLoader("testdic");
    await expect(loader.asPromise()).toReject();
  });
});