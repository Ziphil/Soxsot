//

import mock from "mock-fs";
import dedent from "ts-dedent";
import {
  DirectoryLoader
} from "../source/io";


describe("directory format", () => {
  beforeAll(() => {
    mock({
      "testdic/sakil.xdnw": dedent`
        * @1150 sakil
        !JA
        + <名>
        = <名> リンゴ
        =? りんご, 林檎
        M: ?
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
      "testdic/xoq.xdnw": dedent`
        * @1035 xoq
        !JA
        + <名>
        = <名> 本, 書籍, 書物, 図書, 冊子
        M: 文章や絵や写真などを印刷した紙を束ね、 一方の端を綴じてまとめたもののうち、一般向けのもの。
        U: {xoq} は、小説やエッセイや漫画などの一般向けの本を指す。一方 {soxal} は、辞書や専門書や教科書のような専門的な内容を扱う本を指す。{faltad} は、様々な記事を載せる一般向けの定期刊行物を指す。『Newton』のような専門的な内容を扱っていても一般向けに書かれていれば {faltad} と言える。ここまでの 3 単語は、基本的に出版社から出されるものを指す。{càrat} は、そのようなものではなく個人やグループが趣味などで作るものを指す。これらの単語はどれかがどれかの下位語というわけではなく、それそれ完全な別概念として認識される。
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
        - @1211 {pe} → {á}
      `
    });
  });
  afterAll(mock.restore);
  test("load via promise", async () => {
    let loader = new DirectoryLoader("testdic");
    let dictionary = await loader.asPromise({});
    let words = dictionary.words;
    let settings = dictionary.settings;
    expect.assertions(12);
    expect(dictionary.path).toBe("testdic");
    expect(words.length).toBe(4);
    expect(words.map((word) => word.uniqueName)).toEqual(expect.arrayContaining(["sakil", "sôd", "ter", "xoq"]));
    expect(settings.version).toBe("S");
    expect(settings.alphabetRule).toBe("sztdkgfvpbcqxjlrnmyhaâáàeêéèiîíìoôòuûù");
    expect(settings.revisions.length).toBe(4);
    expect(settings.revisions[0]?.date).toBe(1139);
    expect(settings.revisions[0]?.beforeName).toBe("pacar");
    expect(settings.revisions[0]?.afterName).toBe("parec");
    expect(settings.revisions[2]?.date).toBe(1205);
    expect(settings.revisions[2]?.beforeName).toBe("'s");
    expect(settings.revisions[2]?.afterName).toBe("'c");
  });
  test("load via event emitter", (done) => {
    let loader = new DirectoryLoader("testdic");
    expect.assertions(12);
    loader.on("end", (dictionary) => {
      let words = dictionary.words;
      let settings = dictionary.settings;
      expect(dictionary.path).toBe("testdic");
      expect(words.length).toBe(4);
      expect(words.map((word) => word.uniqueName)).toEqual(expect.arrayContaining(["sakil", "sôd", "ter", "xoq"]));
      expect(settings.version).toBe("S");
      expect(settings.alphabetRule).toBe("sztdkgfvpbcqxjlrnmyhaâáàeêéèiîíìoôòuûù");
      expect(settings.revisions.length).toBe(4);
      expect(settings.revisions[0]?.date).toBe(1139);
      expect(settings.revisions[0]?.beforeName).toBe("pacar");
      expect(settings.revisions[0]?.afterName).toBe("parec");
      expect(settings.revisions[2]?.date).toBe(1205);
      expect(settings.revisions[2]?.beforeName).toBe("'s");
      expect(settings.revisions[2]?.afterName).toBe("'c");
      done();
    });
    loader.on("error", (error) => {
      done(error);
    });
    loader.start();
  });
});