/* eslint-disable @typescript-eslint/naming-convention */


import "jest-extended";
import {
  FileNameResolver
} from "../../source";


describe("file name resolver", () => {
  test("no symbols", async () => {
    const resolver = FileNameResolver.createDefault();
    expect(resolver.resolveWordBaseName("ter")).toBe("ter");
    expect(resolver.resolveWordBaseName("sôd")).toBe("sôd");
    expect(resolver.resolveWordBaseName("tílirsítpiv")).toBe("tílirsítpiv");
  });
  test("prefix", async () => {
    const resolver = FileNameResolver.createDefault();
    expect(resolver.resolveWordBaseName("kod+")).toBe("kod_P");
    expect(resolver.resolveWordBaseName("cos+")).toBe("cos_P");
  });
  test("suffix", async () => {
    const resolver = FileNameResolver.createDefault();
    expect(resolver.resolveWordBaseName("+qix")).toBe("qix_S");
    expect(resolver.resolveWordBaseName("+tip")).toBe("tip_S");
  });
  test("same name", async () => {
    const resolver = FileNameResolver.createDefault();
    expect(resolver.resolveWordBaseName("tis")).toBe("tis");
    expect(resolver.resolveWordBaseName("tis~")).toBe("tis_2");
    expect(resolver.resolveWordBaseName("tis~~")).toBe("tis_3");
    expect(resolver.resolveWordBaseName("tis~~~")).toBe("tis_4");
    expect(resolver.resolveWordBaseName("tis~~~~~~~~~")).toBe("tis_10");
  });
  test("apostrophe", async () => {
    const resolver = FileNameResolver.createDefault();
    expect(resolver.resolveWordBaseName("s'")).toBe("s'");
    expect(resolver.resolveWordBaseName("s’")).toBe("s'");
    expect(resolver.resolveWordBaseName("'t")).toBe("'t");
    expect(resolver.resolveWordBaseName("’t")).toBe("'t");
  });
});