//


export class Markers extends Map<string, Array<Marker>> {

  public constructor(...args: any) {
    super(...args);
    Object.setPrototypeOf(this, new.target.prototype);
    this.normalize();
  }

  public static createEmpty(): Markers {
    const markers = new Markers();
    return markers;
  }

  public static fromPlain(plain: PlainMarkers): Markers {
    const markers = new Markers(plain);
    return markers;
  }

  public toPlain(): PlainMarkers {
    return [...this.entries()];
  }

  private normalize(): void {
    for (const [, wordMarkers] of this.entries()) {
      MarkerUtil.sort(wordMarkers);
    }
  }

  public get(uniqueName: string): Array<Marker> {
    const markers = super.get(uniqueName) ?? [];
    return markers;
  }

  public toggle(uniqueName: string, marker: Marker): void {
    const wordMarkers = [...this.get(uniqueName)];
    const index = wordMarkers.findIndex((existingMarker) => existingMarker === marker);
    if (index >= 0) {
      wordMarkers.splice(index, 1);
    } else {
      wordMarkers.push(marker);
    }
    if (wordMarkers.length > 0) {
      MarkerUtil.sort(wordMarkers);
      super.set(uniqueName, wordMarkers);
    } else {
      super.delete(uniqueName);
    }
  }

}


export class MarkerUtil {

  public static cast(value: string | number | null | undefined): Marker | undefined {
    if (typeof value === "string") {
      const anyValue = value as any;
      const index = MARKERS.indexOf(anyValue);
      if (index >= 0) {
        return MARKERS[index];
      } else {
        return undefined;
      }
    } else if (typeof value === "number") {
      if (value >= 0 && value < MARKERS.length) {
        return MARKERS[value];
      } else {
        return undefined;
      }
    } else {
      return undefined;
    }
  }

  public static sort(markers: Array<Marker>): Array<Marker> {
    return markers.sort((firstMarker, secondMarker) => this.getIndex(firstMarker) - this.getIndex(secondMarker));
  }

  public static getIndex(marker: Marker): number {
    return MARKERS.indexOf(marker);
  }

}


export interface PlainMarkers extends Array<[string, Array<Marker>]> {

}


export const MARKERS = ["circle", "square", "up", "diamond", "down", "cross", "heart", "pentagon", "hexagon", "trapezoid"] as const;
export type Marker = (typeof MARKERS)[number];