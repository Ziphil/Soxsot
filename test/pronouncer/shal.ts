//

import {
  ShalPronouncer
} from "../../source/dictionary/pronouncer/shal-pronouncer";


describe("pronouncer (version 6)", () => {
  test("general", () => {
    const pronouncer = new ShalPronouncer();
    expect(pronouncer.convert("belom")).toBe("belɔm");
    expect(pronouncer.convert("gudit")).toBe("ɡudit");
    expect(pronouncer.convert("páv")).toBe("pav");
    expect(pronouncer.convert("lofyet")).toBe("lɔfjet");
    expect(pronouncer.convert("zîdtolék")).toBe("zidtɔlek");
    expect(pronouncer.convert("xár")).toBe("ʃaɹ");
    expect(pronouncer.convert("nozej")).toBe("nɔzeʒ");
    expect(pronouncer.convert("kosxoq")).toBe("kɔsʃɔð");
    expect(pronouncer.convert("fecòk")).toBe("feθɔk");
    expect(pronouncer.convert("xolàl")).toBe("ʃɔlaɾ");
    expect(pronouncer.convert("felzih")).toBe("feɾzi");
    expect(pronouncer.convert("hâlqeh")).toBe("haɾðe");
    expect(pronouncer.convert("cifèkkis")).toBe("θifekkis");
    expect(pronouncer.convert("fecaqqix")).toBe("feθaððiʃ");
  });
  test("exceptions", () => {
    const pronouncer = new ShalPronouncer();
    expect(pronouncer.convert("kin")).toBe("kiɴ");
    expect(pronouncer.convert("'n")).toBe("ɴ");
    expect(pronouncer.convert("á")).toBe("aɪ");
    expect(pronouncer.convert("é")).toBe("eɪ");
    expect(pronouncer.convert("à")).toBe("aʊ");
    expect(pronouncer.convert("ò")).toBe("ɔɐ");
    expect(pronouncer.convert("lá")).toBe("laɪ");
    expect(pronouncer.convert("lé")).toBe("leɪ");
    expect(pronouncer.convert("dà")).toBe("daʊ");
  });
  test("with syllable breaks", () => {
    const pronouncer = new ShalPronouncer({showSyllables: true});
    expect(pronouncer.convert("belom")).toBe("be.lɔm");
    expect(pronouncer.convert("zîdtolék")).toBe("zid.tɔ.lek");
    expect(pronouncer.convert("xár")).toBe("ʃaɹ");
    expect(pronouncer.convert("nozej")).toBe("nɔ.zeʒ");
    expect(pronouncer.convert("kosxoq")).toBe("kɔs.ʃɔð");
    expect(pronouncer.convert("fecòk")).toBe("fe.θɔk");
    expect(pronouncer.convert("xolàl")).toBe("ʃɔ.laɾ");
    expect(pronouncer.convert("felzih")).toBe("feɾ.zi");
    expect(pronouncer.convert("hâlqeh")).toBe("haɾ.ðe");
    expect(pronouncer.convert("cifèkkis")).toBe("θi.fek.kis");
    expect(pronouncer.convert("fecaqqix")).toBe("fe.θað.ðiʃ");
  });
  test("heavy pronunciation", () => {
    const pronouncer = new ShalPronouncer({light: false});
    expect(pronouncer.convert("fecòk")).toBe("fet͡sɔk");
    expect(pronouncer.convert("hâlqeh")).toBe("haɾd͡ze");
    expect(pronouncer.convert("cifèkkis")).toBe("t͡sifekkis");
    expect(pronouncer.convert("fecaqqix")).toBe("fet͡sad͡zd͡ziʃ");
  });
  test("extra punctuations", () => {
    const pronouncer = new ShalPronouncer();
    expect(pronouncer.convert("s'")).toBe("s");
    expect(pronouncer.convert("zîd+")).toBe("zid");
    expect(pronouncer.convert("+qix")).toBe("ðiʃ");
  });
});