//


export function normalizeString(string: string, ignoreOptions?: IgnoreOptions): string {
  if (ignoreOptions !== undefined) {
    if (ignoreOptions.case) {
      string = string.toLowerCase();
    }
    if (ignoreOptions.diacritic) {
      string = string.normalize("NFD").replace(/[\u0300-\u036f]/g, "");
    }
    if (ignoreOptions.space) {
      string = string.replace(/\s/g, "");
    }
    if (ignoreOptions.wave) {
      string = string.replace(/～/g, "");
    }
  }
  return string;
}

export type IgnoreOptions = {
  case: boolean,
  diacritic: boolean,
  space: boolean,
  wave: boolean
};