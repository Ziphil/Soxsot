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
  AdverbialInflectionCategory,
  CATEGORY_DATA,
  NEGATIVE_DATA,
  PARTICLE_INFLECTION_TYPE_DATA,
  ParticleInflectionType,
  SORT_DATA,
  TENSE_DATA,
  TRANSITIVITY_DATA,
  VERBAL_INFLECTION_CATEGORY_DATA,
  VerbFeature,
  VerbalInflectionCategory
} from "../data/stable-data";
import {
  Dictionary
} from "../dictionary";
import {
  Parser
} from "../parser";
import {
  Suggestion
} from "../suggestion";
import {
  Word
} from "../word";
import {
  Suggester
} from "./suggester";


export class InflectionSuggester extends Suggester {

  private search: string;
  private normalizedSearch: string;
  private ignoreOptions: IgnoreOptions;
  private candidates: Candidates;

  public constructor(search: string, ignoreOptions: IgnoreOptions) {
    super();
    this.search = search;
    this.normalizedSearch = StringNormalizer.normalize(search, ignoreOptions);
    this.ignoreOptions = ignoreOptions;
    this.candidates = {verbal: [], nominal: [], adverbial: [], particle: []};
  }

  public prepare(): void {
    this.prepareVerbalVerb();
    this.prepareVerbalOthers();
    this.prepareNominal();
    this.prepareAdverbial();
    this.prepareParticle();
  }

  private prepareVerbalVerb(): void {
    let normalizedSearch = this.normalizedSearch;
    let category = "verb" as const;
    for (let [tense, tenseData] of ObjectUtil.entries(TENSE_DATA)) {
      for (let [aspect, aspectData] of ObjectUtil.entries(ASPECT_DATA)) {
        for (let [transitivity, transitivityData] of ObjectUtil.entries(TRANSITIVITY_DATA)) {
          for (let negative of [true, false]) {
            let suffix = tenseData.suffix + aspectData.suffix[transitivity];
            let prefix = (negative) ? NEGATIVE_DATA.prefix : "";
            if (normalizedSearch.startsWith(prefix) && normalizedSearch.endsWith(suffix)) {
              let regexp = new RegExp(`^${prefix}|${suffix}$`, "g");
              let name = normalizedSearch.replaceAll(regexp, "");
              let feature = {tense, aspect, transitivity};
              this.candidates.verbal.push([name, category, feature, negative]);
            }
          }
        }
      }
    }
  }

  private prepareVerbalOthers(): void {
    let normalizedSearch = this.normalizedSearch;
    for (let category of ["adjective", "adverb", "nounAdverb"] as const) {
      for (let negative of [true, false]) {
        let categoryPrefix = VERBAL_INFLECTION_CATEGORY_DATA[category].prefix;
        let negativePrefix = (negative) ? NEGATIVE_DATA.prefix : "";
        let prefix = categoryPrefix + negativePrefix;
        if (normalizedSearch.startsWith(prefix)) {
          let regexp = new RegExp(`^${prefix}`, "g");
          let name = normalizedSearch.replaceAll(regexp, "");
          let feature = null;
          this.candidates.verbal.push([name, category, feature, negative]);
        }
      }
    }
  }

  private prepareNominal(): void {
    let normalizedSearch = this.normalizedSearch;
    let prefix = NEGATIVE_DATA.prefix;
    if (normalizedSearch.startsWith(prefix)) {
      let regexp = new RegExp(`^${prefix}`, "g");
      let name = normalizedSearch.replaceAll(regexp, "");
      this.candidates.nominal.push([name]);
    }
  }

  private prepareAdverbial(): void {
    let normalizedSearch = this.normalizedSearch;
    for (let negative of [true, false]) {
      let categoryPrefix = ADVERBIAL_INFLECTION_CATEGORY_DATA.adverb.prefix;
      let negativePrefix = (negative) ? NEGATIVE_DATA.prefix : "";
      let prefix = categoryPrefix + negativePrefix;
      if (normalizedSearch.startsWith(prefix)) {
        let regexp = new RegExp(`^${prefix}`, "g");
        let name = normalizedSearch.replaceAll(regexp, "");
        this.candidates.adverbial.push([name, negative]);
      }
    }
  }

  private prepareParticle(): void {
    let normalizedSearch = this.normalizedSearch;
    let prefix = PARTICLE_INFLECTION_TYPE_DATA.nonverb.prefix;
    if (normalizedSearch.startsWith(prefix)) {
      let regexp = new RegExp(`^${prefix}`, "g");
      let name = normalizedSearch.replaceAll(regexp, "");
      this.candidates.particle.push([name]);
    }
  }

  public presuggest(dictionary: Dictionary): Array<Suggestion> {
    return [];
  }

  public suggest(word: Word, dictionary: Dictionary): Array<Suggestion> {
    let suggestions = [];
    let normalizedName = StringNormalizer.normalize(word.name, this.ignoreOptions);
    for (let [sort, candidates] of ObjectUtil.entries(this.candidates)) {
      for (let candidate of candidates) {
        let wordSort = Parser.createKeep().lookupSort(word, "ja");
        let desiredSort = SORT_DATA[sort].abbreviations["ja"];
        if (candidate[0] === normalizedName && wordSort?.startsWith(desiredSort)) {
          let suggestion = this.createSuggestion(sort, word, candidate);
          suggestions.push(suggestion);
        }
      }
    }
    return suggestions;
  }

  private createSuggestion(sort: keyof Candidates, word: Word, candidate: any): Suggestion {
    if (sort === "verbal") {
      return new VerbalInflectionSuggestion(word.name, candidate[1], candidate[2], candidate[3]);
    } else if (sort === "nominal") {
      return new NominalInflectionSuggestion(word.name);
    } else if (sort === "adverbial") {
      return new AdverbialInflectionSuggestion(word.name, candidate[1]);
    } else if (sort === "particle") {
      return new ParticleInflectionSuggestion(word.name);
    } else {
      throw new Error("cannot happen");
    }
  }

}


export abstract class InflectionSuggestion<K extends InflectionSuggestionKind> extends Suggestion<K> {

  public constructor(kind: K, name: string) {
    super(kind, [name]);
  }

  public getKindName(language: string): string | undefined {
    return ObjectUtil.get(INFLECTION_SUGGESTION_KIND_DATA[this.kind].names, language);
  }

}


export class VerbalInflectionSuggestion extends InflectionSuggestion<"verbalInflection"> {

  public readonly category: VerbalInflectionCategory;
  public readonly feature: VerbFeature | null;
  public readonly negative: boolean;

  public constructor(name: string, category: VerbalInflectionCategory, feature: VerbFeature | null, negative: boolean) {
    super("verbalInflection", name);
    this.category = category;
    this.feature = feature;
    this.negative = negative;
  }

  public getKeywords(language: string): Array<string | undefined> {
    let keywords = [];
    keywords.push(ObjectUtil.get(VERBAL_INFLECTION_CATEGORY_DATA[this.category].names, language));
    if (this.feature !== null) {
      keywords.push(ObjectUtil.get(TENSE_DATA[this.feature.tense].names, language));
      keywords.push(ObjectUtil.get(ASPECT_DATA[this.feature.aspect].names, language));
      keywords.push(ObjectUtil.get(TRANSITIVITY_DATA[this.feature.transitivity].names, language));
    }
    if (this.negative) {
      keywords.push(ObjectUtil.get(NEGATIVE_DATA.names, language));
    }
    return keywords;
  }

}


export class NominalInflectionSuggestion extends InflectionSuggestion<"nominalInflection"> {

  public readonly category: "noun";
  public readonly negative: true;

  public constructor(name: string) {
    super("nominalInflection", name);
    this.category = "noun";
    this.negative = true;
  }

  public getKeywords(language: string): Array<string | undefined> {
    let keywords = [];
    keywords.push(ObjectUtil.get(CATEGORY_DATA[this.category].names, language));
    if (this.negative) {
      keywords.push(ObjectUtil.get(NEGATIVE_DATA.names, language));
    }
    return keywords;
  }

}


export class AdverbialInflectionSuggestion extends InflectionSuggestion<"adverbialInflection"> {

  public readonly category: AdverbialInflectionCategory;
  public readonly negative: boolean;

  public constructor(name: string, negative: boolean) {
    super("adverbialInflection", name);
    this.category = "adverb";
    this.negative = negative;
  }

  public getKeywords(language: string): Array<string | undefined> {
    let keywords = [];
    keywords.push(ObjectUtil.get(CATEGORY_DATA[this.category].names, language));
    if (this.negative) {
      keywords.push(ObjectUtil.get(NEGATIVE_DATA.names, language));
    }
    return keywords;
  }

}


export class ParticleInflectionSuggestion extends InflectionSuggestion<"particleInflection"> {

  public readonly type: ParticleInflectionType;

  public constructor(name: string) {
    super("particleInflection", name);
    this.type = "nonverb";
  }

  public getKeywords(language: string): Array<string | undefined> {
    let keywords = [];
    keywords.push(ObjectUtil.get(PARTICLE_INFLECTION_TYPE_DATA[this.type].names, language));
    return keywords;
  }

}


export const INFLECTION_SUGGESTION_KIND_DATA = {
  verbalInflection: {names: {ja: "動辞の語形変化", en: "Inflection of verbal"}},
  nominalInflection: {names: {ja: "名辞の語形変化", en: "Inflection of nominal"}},
  adverbialInflection: {names: {ja: "副辞の語形変化", en: "Inflection of adverbial"}},
  particleInflection: {names: {ja: "助接辞の語形変化", en: "Inflection of particle"}}
} as const;

export type InflectionSuggestionKind = keyof typeof INFLECTION_SUGGESTION_KIND_DATA;

type Candidates = {
  verbal: Array<Readonly<ConstructorParameters<typeof VerbalInflectionSuggestion>>>,
  nominal: Array<Readonly<ConstructorParameters<typeof NominalInflectionSuggestion>>>,
  adverbial: Array<Readonly<ConstructorParameters<typeof AdverbialInflectionSuggestion>>>,
  particle: Array<Readonly<ConstructorParameters<typeof ParticleInflectionSuggestion>>>
};