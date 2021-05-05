//


export abstract class Suggestion<K extends string = string> {

  public readonly kind: K;
  public readonly descriptions: ReadonlyArray<SuggestionDescription>;
  public readonly names: ReadonlyArray<string>;

  public constructor(kind: K, descriptions: ReadonlyArray<SuggestionDescription>, names: ReadonlyArray<string>) {
    this.kind = kind;
    this.descriptions = descriptions;
    this.names = names;
  }

  public abstract getKindName(language: string): string | undefined;

  protected abstract getDescriptionName(kind: string, type: string, language: string): string | undefined;

  public getDescriptionNames(language: string): Array<string | undefined> {
    let names = this.descriptions.map((description) => this.getDescriptionName(description.kind, description.type, language));
    return names;
  }

}


export type SuggestionDescription = {kind: string, type: string};