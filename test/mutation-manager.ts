//

import {
  MutationManager
} from "../source/util/mutation-manager";


function checkManager<T>(manager: MutationManager<T>, expectedChangedNames: Array<T>, expectedDeletedNames: Array<T>): void {
  expect(manager.changedNames).toEqual(new Set(expectedChangedNames));
  expect(manager.deletedNames).toEqual(new Set(expectedDeletedNames));
}

describe("mutation manager", () => {
  test("test 1", () => {
    const manager = new MutationManager<string>();
    manager.change("A");
    manager.change("B");
    manager.delete("C");
    checkManager(manager, ["A", "B"], ["C"]);
  });
  test("test 2", () => {
    const manager = new MutationManager<string>();
    manager.rename("A", "B");
    manager.change("C");
    manager.change("B");
    checkManager(manager, ["B", "C"], ["A"]);
  });
  test("test 3", () => {
    const manager = new MutationManager<string>();
    manager.rename("A", "B");
    manager.rename("B", "C");
    manager.rename("X", "Y");
    manager.change("X");
    checkManager(manager, ["C", "X", "Y"], ["A", "B"]);
  });
  test("test 4", () => {
    const manager = new MutationManager<string>();
    manager.change("A");
    manager.change("B");
    manager.delete("A");
    manager.delete("C");
    manager.change("C");
    manager.change("B");
    manager.delete("D");
    manager.change("C");
    checkManager(manager, ["B", "C"], ["A", "D"]);
  });
});