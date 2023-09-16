//


export class MutationManager<N> {

  public readonly changedNames: Set<N>;
  public readonly deletedNames: Set<N>;

  public constructor(changedName?: Iterable<N>, deletedName?: Iterable<N>) {
    this.changedNames = new Set(changedName);
    this.deletedNames = new Set(deletedName);
  }

  public static fromPlain<N>(plain: PlainMutationManager<N>): MutationManager<N> {
    const markers = new MutationManager(plain.changedNames, plain.deletedNames);
    return markers;
  }

  public toPlain(): PlainMutationManager<N> {
    return {changedNames: [...this.changedNames], deletedNames: [...this.deletedNames]};
  }

  public change(name: N): void {
    this.changedNames.add(name);
    if (this.deletedNames.has(name)) {
      this.deletedNames.delete(name);
    }
  }

  public rename(oldName: N, newName: N): void {
    if (oldName === newName) {
      this.change(newName);
    } else {
      this.delete(oldName);
      this.change(newName);
    }
  }

  public delete(name: N): void {
    this.deletedNames.add(name);
    if (this.changedNames.has(name)) {
      this.changedNames.delete(name);
    }
  }

  public reset(): void {
    this.changedNames.clear();
    this.deletedNames.clear();
  }

}


export interface PlainMutationManager<N> {

  changedNames: Array<N>;
  deletedNames: Array<N>;

}