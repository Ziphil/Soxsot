//

import {
  ObjectUtil
} from "../../util/object";
import {
  IgnoreOptions,
  StringNormalizer
} from "../../util/string-normalizer";
import {
  STABLE_DATA,
  StableSort
} from "../data/stable-data";
import {
  Dictionary
} from "../dictionary";
import {
  Parser
} from "../parser";
import {
  Suggestion,
  SuggestionDescription
} from "../suggestion";
import {
  Word
} from "../word";
import {
  Suggester
} from "./suggester";


export class StableInflectionSuggester extends Suggester {

  private candidates: Array<[StableSort, ...ConstructorParameters<typeof StableInflectionSuggestion>]>;

  public constructor(search: string, ignoreOptions: IgnoreOptions) {
    super(search, ignoreOptions);
    this.candidates = [];
  }

  public prepare(): void {
    this.prepareVerbalVerb();
    this.prepareVerbalNoun();
    this.prepareVerbalOthers();
    this.prepareNominalAdjective();
    this.prepareNominalNoun();
    this.prepareAdverbial();
    this.prepareParticle();
  }

  private prepareVerbalVerb(): void {
    let normalizedSearch = this.normalizedSearch;
    for (let [tense, tenseData] of ObjectUtil.entries(STABLE_DATA.tense)) {
      for (let [aspect, aspectData] of ObjectUtil.entries(STABLE_DATA.aspect)) {
        for (let [transitivity, transitivityData] of ObjectUtil.entries(STABLE_DATA.transitivity)) {
          for (let [polarity, polarityData] of ObjectUtil.entries(STABLE_DATA.polarity)) {
            let suffix = tenseData.suffix + aspectData.suffix[transitivity];
            let prefix = polarityData.prefix;
            if (normalizedSearch.startsWith(prefix) && normalizedSearch.endsWith(suffix)) {
              let regexp = new RegExp(`^${prefix}|${suffix}$`, "g");
              let name = normalizedSearch.replace(regexp, "");
              let descriptions = [
                {kind: "category", type: "verb"},
                {kind: "tense", type: tense},
                {kind: "aspect", type: aspect},
                {kind: "transitivity", type: transitivity},
                {kind: "polarity", type: polarity}
              ];
              this.candidates.push(["verbal", "verbalInflection", descriptions, name]);
            }
          }
        }
      }
    }
  }

  private prepareVerbalNoun(): void {
    let normalizedSearch = this.normalizedSearch;
    let prefix = STABLE_DATA.polarity.negative.prefix;
    if (normalizedSearch.startsWith(prefix)) {
      let regexp = new RegExp(`^${prefix}`, "g");
      let name = normalizedSearch.replace(regexp, "");
      let descriptions = [
        {kind: "category", type: "noun"},
        {kind: "polarity", type: "negative"}
      ];
      this.candidates.push(["verbal", "verbalInflection", descriptions, name]);
    }
  }

  private prepareVerbalOthers(): void {
    let normalizedSearch = this.normalizedSearch;
    for (let [category, categoryData] of ObjectUtil.entries(STABLE_DATA.verbalInflectionCategory)) {
      for (let [polarity, polarityData] of ObjectUtil.entries(STABLE_DATA.polarity)) {
        let categoryPrefix = categoryData.prefix;
        let polarityPrefix = polarityData.prefix;
        let prefix = categoryPrefix + polarityPrefix;
        if (normalizedSearch.startsWith(prefix)) {
          let regexp = new RegExp(`^${prefix}`, "g");
          let name = normalizedSearch.replace(regexp, "");
          let descriptions = [
            {kind: "category", type: category},
            {kind: "polarity", type: polarity}
          ];
          this.candidates.push(["verbal", "verbalInflection", descriptions, name]);
        }
      }
    }
  }

  private prepareNominalAdjective(): void {
    let normalizedSearch = this.normalizedSearch;
    for (let [polarity, polarityData] of ObjectUtil.entries(STABLE_DATA.polarity)) {
      let categoryPrefix = STABLE_DATA.nominalInflectionCategory.adjective.prefix;
      let polarityPrefix = polarityData.prefix;
      let prefix = categoryPrefix + polarityPrefix;
      if (normalizedSearch.startsWith(prefix)) {
        let regexp = new RegExp(`^${prefix}`, "g");
        let name = normalizedSearch.replace(regexp, "");
        let descriptions = [
          {kind: "category", type: "adjective"},
          {kind: "polarity", type: polarity}
        ];
        this.candidates.push(["nominal", "nominalInflection", descriptions, name]);
      }
    }
  }

  private prepareNominalNoun(): void {
    let normalizedSearch = this.normalizedSearch;
    let prefix = STABLE_DATA.polarity.negative.prefix;
    if (normalizedSearch.startsWith(prefix)) {
      let regexp = new RegExp(`^${prefix}`, "g");
      let name = normalizedSearch.replace(regexp, "");
      let descriptions = [
        {kind: "category", type: "noun"},
        {kind: "polarity", type: "negative"}
      ];
      this.candidates.push(["nominal", "nominalInflection", descriptions, name]);
    }
  }

  private prepareAdverbial(): void {
    let normalizedSearch = this.normalizedSearch;
    for (let [polarity, polarityData] of ObjectUtil.entries(STABLE_DATA.polarity)) {
      let categoryPrefix = STABLE_DATA.adverbialInflectionCategory.adverb.prefix;
      let polarityPrefix = polarityData.prefix;
      let prefix = categoryPrefix + polarityPrefix;
      if (normalizedSearch.startsWith(prefix)) {
        let regexp = new RegExp(`^${prefix}`, "g");
        let name = normalizedSearch.replace(regexp, "");
        let descriptions = [
          {kind: "category", type: "adverb"},
          {kind: "polarity", type: polarity}
        ];
        this.candidates.push(["adverbial", "adverbialInflection", descriptions, name]);
      }
    }
  }

  private prepareParticle(): void {
    let normalizedSearch = this.normalizedSearch;
    let prefix = STABLE_DATA.particleInflectionType.nonverb.prefix;
    if (normalizedSearch.startsWith(prefix)) {
      let regexp = new RegExp(`^${prefix}`, "g");
      let name = normalizedSearch.replace(regexp, "");
      let descriptions = [
        {kind: "form", type: "nonverb"}
      ];
      this.candidates.push(["particle", "particleInflection", descriptions, name]);
    }
  }

  public presuggest(dictionary: Dictionary): Array<Suggestion> {
    return [];
  }

  public suggest(word: Word, dictionary: Dictionary): Array<Suggestion> {
    let suggestions = [];
    let normalizedName = StringNormalizer.normalize(word.name, this.ignoreOptions);
    for (let candidate of this.candidates) {
      let [sort, kind, descriptions, name] = candidate;
      let wordSort = Parser.createKeep().lookupSort(word, "ja");
      let desiredSort = STABLE_DATA.sort[sort].abbreviations["ja"];
      if (normalizedName === name && wordSort?.startsWith(desiredSort)) {
        let suggestion = new StableInflectionSuggestion(kind, descriptions, word.name);
        suggestions.push(suggestion);
      }
    }
    return suggestions;
  }

}


export class StableInflectionSuggestion<K extends StableInflectionSuggestionKind> extends Suggestion<K> {

  public constructor(kind: K, descriptions: ReadonlyArray<SuggestionDescription>, name: string) {
    super(kind, descriptions, [name]);
  }

  public getKindName(language: string): string | undefined {
    return ObjectUtil.get(STABLE_INFLECTION_SUGGESTION_KIND_DATA[this.kind].names, language);
  }

  public getDescriptionName(kind: string, type: string, language: string): string | undefined {
    if (kind === "category") {
      return ObjectUtil.get(ObjectUtil.get(STABLE_DATA.category, type)?.names, language);
    } else if (kind === "polarity") {
      return ObjectUtil.get(ObjectUtil.get(STABLE_DATA.polarity, type)?.names, language);
    } else if (kind === "tense") {
      return ObjectUtil.get(ObjectUtil.get(STABLE_DATA.tense, type)?.names, language);
    } else if (kind === "aspect") {
      return ObjectUtil.get(ObjectUtil.get(STABLE_DATA.aspect, type)?.names, language);
    } else if (kind === "transitivity") {
      return ObjectUtil.get(ObjectUtil.get(STABLE_DATA.transitivity, type)?.names, language);
    } else if (kind === "form") {
      return ObjectUtil.get(ObjectUtil.get(STABLE_DATA.particleInflectionType, type)?.names, language);
    } else {
      return undefined;
    }
  }

}


export const STABLE_INFLECTION_SUGGESTION_KIND_DATA = {
  verbalInflection: {names: {ja: "動辞の語形変化", en: "Inflection of verbal"}},
  nominalInflection: {names: {ja: "名辞の語形変化", en: "Inflection of nominal"}},
  adverbialInflection: {names: {ja: "副辞の語形変化", en: "Inflection of adverbial"}},
  particleInflection: {names: {ja: "助接辞の語形変化", en: "Inflection of particle"}}
} as const;
export type StableInflectionSuggestionKind = keyof typeof STABLE_INFLECTION_SUGGESTION_KIND_DATA;