//


export abstract class NameSorter {

  public abstract calcComparisonString(uniqueName: string): string;

  public compare(firstUniqueName: string, secondUniqueName: string): -1 | 0 | 1 {
    const firstComparisonString = this.calcComparisonString(firstUniqueName);
    const secondComparisonString = this.calcComparisonString(secondUniqueName);
    const sign = NameSorter.compareComparisonString(firstComparisonString, secondComparisonString);
    return sign;
  }

  public sort(strings: Array<string>): Array<string>;
  public sort<V>(values: Array<V>, getName: (value: V) => string): Array<V>;
  public sort<V>(values: Array<V>, getName?: (value: V) => string): Array<V> {
    const comparisonStrings = new Map<V, string>();
    const sortedValues = values.sort((firstValue, secondValue) => {
      const firstComparisonString = comparisonStrings.get(firstValue) ?? (() => {
        const name = getName?.(firstValue) ?? firstValue as string;
        const comparisonString = this.calcComparisonString(name);
        comparisonStrings.set(firstValue, comparisonString);
        return comparisonString;
      })();
      const secondComparisonString = comparisonStrings.get(secondValue) ?? (() => {
        const name = getName?.(secondValue) ?? secondValue as string;
        const comparisonString = this.calcComparisonString(name);
        comparisonStrings.set(secondValue, comparisonString);
        return comparisonString;
      })();
      const sign = NameSorter.compareComparisonString(firstComparisonString, secondComparisonString);
      return sign;
    });
    return sortedValues;
  }

  public toSorted(strings: Array<string>): Array<string>;
  public toSorted<V>(values: Array<V>, getName: (value: V) => string): Array<V>;
  public toSorted<V>(values: Array<V>, getName?: (value: V) => string): Array<V> {
    return this.sort([...values], getName as any);
  }

  /** 計算済みの比較用文字列を比較します。 */
  public static compareComparisonString(firstComparisonString: string, secondComparisonString: string): -1 | 0 | 1 {
    if (firstComparisonString < secondComparisonString) {
      return -1;
    } else if (firstComparisonString > secondComparisonString) {
      return 1;
    } else {
      return 0;
    }
  }

  /** 計算済みの比較用文字列を用いて配列をソートします。
   * ソート中に各要素の比較用文字列を計算しないので、`sort` メソッドを使うよりも高速です。*/
  public static sortPrecalced<V>(values: Array<V>, getComparisonString: (value: V) => string): Array<V> {
    const sortedValues = values.sort((firstValue, secondValue) => {
      const firstComparisonString = getComparisonString(firstValue);
      const secondComparisonString = getComparisonString(secondValue);
      const sign = NameSorter.compareComparisonString(firstComparisonString, secondComparisonString);
      return sign;
    });
    return sortedValues;
  }

  /** 計算済みの比較用文字列を用いてソートした新しい配列を返します。
   * ソート中に各要素の比較用文字列を計算しないので、`sort` メソッドを使うよりも高速です。*/
  public static toSortedPrecalced<V>(values: Array<V>, getComparisonString: (value: V) => string): Array<V> {
    return this.sortPrecalced([...values], getComparisonString);
  }

}