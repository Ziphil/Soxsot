//


export function isValidUniqueName(uniqueName: string): boolean {
  return uniqueName.match(/^(\+)?((?:\p{L}|-|')+?)(\+)?(~*)$/u) !== null;
}