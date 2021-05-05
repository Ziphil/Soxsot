//

import {
  ObjectUtil
} from "../../util/object";
import {
  IgnoreOptions,
  StringNormalizer
} from "../../util/string-normalizer";
import {
  ADVERBIAL_INFLECTION_CATEGORY_DATA,
  ASPECT_DATA,
  CATEGORY_DATA,
  PARTICLE_INFLECTION_TYPE_DATA,
  POLARITY_DATA,
  SORT_DATA,
  Sort,
  TENSE_DATA,
  TRANSITIVITY_DATA,
  VERBAL_INFLECTION_CATEGORY_DATA
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

  private candidates: Array<[Sort, ...ConstructorParameters<typeof StableInflectionSuggestion>]>;

  public constructor(search: string, ignoreOptions: IgnoreOptions) {
    super(search, ignoreOptions);
    this.candidates = [];
  }

  public prepare(): void {
    this.prepareVerbalVerb();
    this.prepareVerbalNoun();
    this.prepareVerbalOthers();
    this.prepareNominal();
    this.prepareAdverbial();
    this.prepareParticle();
  }

  private prepareVerbalVerb(): void {
    let normalizedSearch = this.normalizedSearch;
    for (let [tense, tenseData] of ObjectUtil.entries(TENSE_DATA)) {
      for (let [aspect, aspectData] of ObjectUtil.entries(ASPECT_DATA)) {
        for (let [transitivity, transitivityData] of ObjectUtil.entries(TRANSITIVITY_DATA)) {
          for (let [polarity, polarityData] of ObjectUtil.entries(POLARITY_DATA)) {
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
    let prefix = POLARITY_DATA.negative.prefix;
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
    let categories = ["adjective", "adverb", "nounAdverb"] as const;
    for (let category of categories) {
      for (let [polarity, polarityData] of ObjectUtil.entries(POLARITY_DATA)) {
        let categoryPrefix = VERBAL_INFLECTION_CATEGORY_DATA[category].prefix;
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

  private prepareNominal(): void {
    let normalizedSearch = this.normalizedSearch;
    let prefix = POLARITY_DATA.negative.prefix;
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
    for (let [polarity, polarityData] of ObjectUtil.entries(POLARITY_DATA)) {
      let categoryPrefix = ADVERBIAL_INFLECTION_CATEGORY_DATA.adverb.prefix;
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
    let prefix = PARTICLE_INFLECTION_TYPE_DATA.nonverb.prefix;
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
      let desiredSort = SORT_DATA[sort].abbreviations["ja"];
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
      return ObjectUtil.get(ObjectUtil.get(CATEGORY_DATA, type)?.names, language);
    } else if (kind === "polarity") {
      return ObjectUtil.get(ObjectUtil.get(POLARITY_DATA, type)?.names, language);
    } else if (kind === "tense") {
      return ObjectUtil.get(ObjectUtil.get(TENSE_DATA, type)?.names, language);
    } else if (kind === "aspect") {
      return ObjectUtil.get(ObjectUtil.get(ASPECT_DATA, type)?.names, language);
    } else if (kind === "transitivity") {
      return ObjectUtil.get(ObjectUtil.get(TRANSITIVITY_DATA, type)?.names, language);
    } else if (kind === "form") {
      return ObjectUtil.get(ObjectUtil.get(PARTICLE_INFLECTION_TYPE_DATA, type)?.names, language);
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