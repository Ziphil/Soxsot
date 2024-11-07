//

import {ShalNameSorter} from "../../source/dictionary/name-sorter/shal-name-sorter";


describe("name sorter (version 6)", () => {
  test("comparison", () => {
    const sorter = new ShalNameSorter();
    expect(sorter.compare("sas", "taz")).toBe(-1);
    expect(sorter.compare("saz", "sas")).toBe(1);
    expect(sorter.compare("zas", "saz")).toBe(1);
    expect(sorter.compare("sas", "sàs")).toBe(-1);
    expect(sorter.compare("sâs", "sàs")).toBe(-1);
  });
  test("comparison with symbols", () => {
    const sorter = new ShalNameSorter();
    expect(sorter.compare("s’", "’s")).toBe(-1);
    expect(sorter.compare("’s", "s")).toBe(1);
    expect(sorter.compare("+s", "s+")).toBe(1);
    expect(sorter.compare("s", "+s")).toBe(-1);
    expect(sorter.compare("taz", "taz~")).toBe(-1);
    expect(sorter.compare("taz~~~", "taz~~")).toBe(1);
  });
  test("apostrophe", () => {
    const sorter = new ShalNameSorter();
    expect(sorter.compare("s’", "s'")).toBe(0);
    expect(sorter.compare("'s", "’s")).toBe(0);
  });
  test("sorting", () => {
    const sorter = new ShalNameSorter();
    expect(sorter.toSorted(["zat", "saz", "sas", "tas", "zas", "sat", "zaz"])).toEqual(["sas", "saz", "sat", "zas", "zaz", "zat", "tas"]);
    expect(sorter.toSorted(["zat", "saz", "sas", "tas", "zas", "sat", "zaz"])).toEqual(["sas", "saz", "sat", "zas", "zaz", "zat", "tas"]);
    expect(sorter.toSorted(["sat", "tas", "sâs", "tàs", "sàs", "sát", "sas", "sás", "tâs"])).toEqual(["sas", "sâs", "sás", "sàs", "sat", "sát", "tas", "tâs", "tàs"]);
  });
  test("complex with symbols", () => {
    const sorter = new ShalNameSorter();
    expect(sorter.toSorted(["sas~~", "sas’", "sas", "+sas", "sás", "sâs", "’sas", "sas~", "sas+", "’sas~", "sàs"])).toEqual(["sas", "sas~", "sas~~", "sas’", "’sas", "’sas~", "sas+", "+sas", "sâs", "sás", "sàs"]);
  });
});