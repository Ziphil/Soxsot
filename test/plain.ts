/* eslint-disable @typescript-eslint/naming-convention */

import "jest-extended";
import mock from "mock-fs";
import dedent from "ts-dedent";
import {
  Dictionary,
  DictionarySettings,
  Markers,
  Revisions,
  Word
} from "../source";
import {
  SingleLoader
} from "../source/io";
import {
  MutationManager
} from "../source/util/mutation-manager";


async function getEditedDictionary(): Promise<Dictionary> {
  const loader = new SingleLoader("testdic.xdn");
  const dictionary = await loader.asPromise();
  const deletedWord = dictionary.findByUniqueName("copàl")!;
  dictionary.addWord({
    uid: "0",
    uniqueName: "sas",
    date: 1067,
    contents: {
      ja: dedent`
        !JA
        + <動>
        = <形> (/†/) 良い
        = <副> 良く
        H: @3536 語義に「そうあるべき様子の」とあったが、それはむしろ「正常」の説明であるように思えたので、一旦語義の記述を削除した。        
        - <類> {salaf}
        - <対> {bûd}
      `
    }
  });
  dictionary.deleteWord(deletedWord.uid);
  return dictionary;
};

describe("plain objects", () => {
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
        * @1150 copàl
        !JA
        + <動>
        = <動> (/a/ が /e/ を) 消す, 消去する
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
  test("inverse", async () => {
    const dictionary = await getEditedDictionary();
    const plainDictionary = JSON.stringify(dictionary.toPlain());
    const restoredDictionary = Dictionary.fromPlain(JSON.parse(plainDictionary));
    expect(restoredDictionary.words.length).toBe(dictionary.words.length);
    for (let i = 0 ; i ++ ; i < restoredDictionary.words.length) {
      const word = dictionary.words[i];
      const restoredWord = restoredDictionary.words[i];
      expect(restoredWord).toBeInstanceOf(Word);
      expect(restoredWord.dictionary === restoredDictionary).toBe(true);
      expect(restoredWord.uid).toBe(word.uid);
      expect(restoredWord.uniqueName).toBe(word.uniqueName);
      expect(restoredWord.date).toBe(word.date);
      expect(restoredWord.contents).toEqual(word.contents);
    }
    expect(restoredDictionary.settings).toBeInstanceOf(DictionarySettings);
    expect(restoredDictionary.settings.revisions).toBeInstanceOf(Revisions);
    expect(restoredDictionary.markers).toBeInstanceOf(Markers);
    expect(restoredDictionary.mutationManager).toBeInstanceOf(MutationManager);
    expect(restoredDictionary.settings).toEqual(dictionary.settings);
    expect(restoredDictionary.markers).toEqual(dictionary.markers);
    expect(restoredDictionary.mutationManager.changedNames).toEqual(dictionary.mutationManager.changedNames);
    expect(restoredDictionary.mutationManager.deletedNames).toEqual(dictionary.mutationManager.deletedNames);
    expect(restoredDictionary.path).toEqual(dictionary.path);
  });
});