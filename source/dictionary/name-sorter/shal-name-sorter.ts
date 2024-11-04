//

import {SHAL_DATA} from "../data/shal-data";
import {NameSorter} from "./name-sorter";


export class ShalNameSorter extends NameSorter {

  public constructor() {
    super();
  }

  public calcComparisonString(uniqueName: string): string {
    const match = uniqueName.match(/^(\+)?('|’)?(.+?)('|’)?(\+)?(~*)$/)!;
    const suffix = !!match[1];
    const prefix = !!match[5];
    const beforeApostrophe = !!match[2];
    const afterApostrophe = !!match[4];
    const tildeCount = match[6].length;
    const mainName = match[3];
    const alphabetIndices = [];
    const diacriticIndices = [];
    for (let i = 0; i < mainName.length; i ++) {
      const char = mainName.charAt(i);
      const normalizedChar = char.normalize("NFD");
      const alphabetIndex = SHAL_DATA.order.alphabet.indexOf(normalizedChar.charAt(0));
      const diacriticIndex = (normalizedChar.length > 1) ? SHAL_DATA.order.diacritic.indexOf(normalizedChar.charAt(1)) + 1 : 0;
      alphabetIndices.push(alphabetIndex);
      diacriticIndices.push(diacriticIndex);
    }
    let comparisonString = "";
    comparisonString += alphabetIndices.map((index) => (index >= 0) ? String.fromCodePoint(index + 300) : String.fromCodePoint(1100)).join("");
    comparisonString += diacriticIndices.map((index) => (index >= 0) ? String.fromCodePoint(index + 200) : String.fromCodePoint(1000)).join("");
    if (prefix) {
      comparisonString += String.fromCodePoint(161);
    } else if (suffix) {
      comparisonString += String.fromCodePoint(162);
    } else {
      comparisonString += String.fromCodePoint(160);
    }
    if (afterApostrophe) {
      comparisonString += String.fromCodePoint(151);
    } else if (beforeApostrophe) {
      comparisonString += String.fromCodePoint(152);
    } else {
      comparisonString += String.fromCodePoint(150);
    }
    if (tildeCount > 0) {
      comparisonString += String.fromCodePoint(tildeCount + 100);
    }
    return comparisonString;
  }

}