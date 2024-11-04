//

import {NameSorter} from "./name-sorter";


export class GeneralNameSorter extends NameSorter {

  public readonly alphabetString: string;

  public constructor(alphabetString: string) {
    super();
    this.alphabetString = alphabetString;
  }

  public calcComparisonString(uniqueName: string): string {
    let comparisonString = "";
    const hasApostrophe = this.alphabetString.includes("'") || this.alphabetString.includes("’");
    for (let i = 0 ; i < uniqueName.length ; i ++) {
      const char = uniqueName.charAt(i);
      if ((hasApostrophe || (char !== "'" && char !== "’")) && char !== "-" && char !== "+" && char !== "~") {
        const position = this.alphabetString.indexOf(char);
        if (position >= 0) {
          comparisonString += String.fromCodePoint(position + 200);
        } else {
          comparisonString += String.fromCodePoint(1000);
        }
      }
    }
    const match = uniqueName.match(/^(\+)?('|’)?(.+?)('|’)?(\+)?(~*)$/)!;
    if (match[4]) {
      comparisonString += String.fromCodePoint(150);
    }
    if (match[2]) {
      comparisonString += String.fromCodePoint(151);
    }
    if (match[5]) {
      comparisonString += String.fromCodePoint(160);
    }
    if (match[1]) {
      comparisonString += String.fromCodePoint(161);
    }
    if (match[6].length > 0) {
      comparisonString += String.fromCodePoint(match[6].length + 100);
    }
    return comparisonString;
  }

}