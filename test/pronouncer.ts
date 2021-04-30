//

import {
  StablePronouncer
} from "../source/dictionary/pronouncer/stable-pronouncer";


describe("pronouncer (version S)", () => {
  test("general", () => {
    let pronouncer = new StablePronouncer();
    expect(pronouncer.convert("belom")).toBe("belɔm");
    expect(pronouncer.convert("zîdtolék")).toBe("zidtɔlek");
    expect(pronouncer.convert("xár")).toBe("ʃaɹ");
    expect(pronouncer.convert("nozej")).toBe("nɔzeʒ");
    expect(pronouncer.convert("kosxoq")).toBe("kɔsʃɔð");
    expect(pronouncer.convert("fecòk")).toBe("feθɔk");
    expect(pronouncer.convert("xolàl")).toBe("ʃɔlaɾ");
    expect(pronouncer.convert("felzih")).toBe("feɾzi");
    expect(pronouncer.convert("hâlqeh")).toBe("haɾðe");
    expect(pronouncer.convert("cifèkkis")).toBe("θifekis");
    expect(pronouncer.convert("fecaqqix")).toBe("feθaðiʃ");
  });
  test("exceptions", () => {
    let pronouncer = new StablePronouncer();
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
    let pronouncer = new StablePronouncer({showSyllables: true});
    expect(pronouncer.convert("belom")).toBe("be.lɔm");
    expect(pronouncer.convert("zîdtolék")).toBe("zid.tɔ.lek");
    expect(pronouncer.convert("xár")).toBe("ʃaɹ");
    expect(pronouncer.convert("nozej")).toBe("nɔ.zeʒ");
    expect(pronouncer.convert("kosxoq")).toBe("kɔs.ʃɔð");
    expect(pronouncer.convert("fecòk")).toBe("fe.θɔk");
    expect(pronouncer.convert("xolàl")).toBe("ʃɔ.laɾ");
    expect(pronouncer.convert("felzih")).toBe("feɾ.zi");
    expect(pronouncer.convert("hâlqeh")).toBe("haɾ.ðe");
    expect(pronouncer.convert("cifèkkis")).toBe("θi.fe.kis");
    expect(pronouncer.convert("fecaqqix")).toBe("fe.θa.ðiʃ");
  });
  test("heavy pronunciation", () => {
    let pronouncer = new StablePronouncer({light: false});
    expect(pronouncer.convert("fecòk")).toBe("fet͡sɔk");
    expect(pronouncer.convert("hâlqeh")).toBe("haɾd͡ze");
    expect(pronouncer.convert("cifèkkis")).toBe("t͡sifekis");
    expect(pronouncer.convert("fecaqqix")).toBe("fet͡sad͡ziʃ");
  });
});