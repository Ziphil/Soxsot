//

import {
  Section
} from "./section";


export class Part<S> {

  public readonly sections: ReadonlyArray<Section<S>>;

  public constructor(sections: ReadonlyArray<Section<S>>) {
    this.sections = sections;
  }

  public get sort(): string | null {
    let section = this.sections[0];
    if (section !== undefined) {
      return section.sort;
    } else {
      return null;
    }
  }

}