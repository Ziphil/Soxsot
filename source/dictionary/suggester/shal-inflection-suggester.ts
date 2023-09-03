//

import {
  ObjectUtil
} from "../../util/object";
import {
  IgnoreOptions,
  StringNormalizer
} from "../../util/string-normalizer";
import {
  SHAL_DATA,
  ShalSort
} from "../data/shal-data";
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


export class ShalInflectionSuggester extends Suggester {

  private candidates: Array<[ShalSort, ...ConstructorParameters<typeof ShalInflectionSuggestion>]>;

  public constructor(text: string, ignoreOptions: IgnoreOptions) {
    super(text, ignoreOptions);
    this.candidates = [];
  }

  public prepare(): void {
    this.prepareVerbalVerb();
    this.prepareVerbalNoun();
    this.prepareVerbalOthers();
    this.prepareNominalAdjective();
    this.prepareNominalNoun();
    this.prepareAdpredicative();
    this.prepareSpecial();
    this.prepareParticle();
  }

  private prepareVerbalVerb(): void {
    const normalizedText = this.normalizedText;
    for (const [tense, tenseData] of ObjectUtil.entries(SHAL_DATA.tense)) {
      for (const [aspect, aspectData] of ObjectUtil.entries(SHAL_DATA.aspect)) {
        for (const [voice, voiceData] of ObjectUtil.entries(SHAL_DATA.voice)) {
          for (const [polarity, polarityData] of ObjectUtil.entries(SHAL_DATA.polarity)) {
            const suffix = tenseData.suffix + aspectData.suffix[voice];
            const prefix = polarityData.prefix;
            if (normalizedText.startsWith(prefix) && normalizedText.endsWith(suffix)) {
              const regexp = new RegExp(`^${prefix}|${suffix}$`, "g");
              const name = normalizedText.replace(regexp, "");
              const descriptions = [
                {kind: "category", type: "verb"},
                {kind: "tense", type: tense},
                {kind: "aspect", type: aspect},
                {kind: "voice", type: voice},
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
    const normalizedText = this.normalizedText;
    const prefix = SHAL_DATA.polarity.negative.prefix;
    if (normalizedText.startsWith(prefix)) {
      const regexp = new RegExp(`^${prefix}`, "g");
      const name = normalizedText.replace(regexp, "");
      const descriptions = [
        {kind: "category", type: "noun"},
        {kind: "polarity", type: "negative"}
      ];
      this.candidates.push(["verbal", "verbalInflection", descriptions, name]);
    }
  }

  private prepareVerbalOthers(): void {
    const normalizedText = this.normalizedText;
    for (const [category, categoryData] of ObjectUtil.entries(SHAL_DATA.verbalInflectionCategory)) {
      for (const [polarity, polarityData] of ObjectUtil.entries(SHAL_DATA.polarity)) {
        const prefix = categoryData.prefix + polarityData.prefix;
        if (normalizedText.startsWith(prefix)) {
          const regexp = new RegExp(`^${prefix}`, "g");
          const name = normalizedText.replace(regexp, "");
          const descriptions = [
            {kind: "category", type: category},
            {kind: "polarity", type: polarity}
          ];
          this.candidates.push(["verbal", "verbalInflection", descriptions, name]);
        }
      }
    }
  }

  private prepareNominalAdjective(): void {
    const normalizedText = this.normalizedText;
    for (const [polarity, polarityData] of ObjectUtil.entries(SHAL_DATA.polarity)) {
      const prefix = SHAL_DATA.nominalInflectionCategory.adjective.prefix + polarityData.prefix;
      if (normalizedText.startsWith(prefix)) {
        const regexp = new RegExp(`^${prefix}`, "g");
        const name = normalizedText.replace(regexp, "");
        const descriptions = [
          {kind: "category", type: "adjective"},
          {kind: "polarity", type: polarity}
        ];
        this.candidates.push(["nominal", "nominalInflection", descriptions, name]);
      }
    }
  }

  private prepareNominalNoun(): void {
    const normalizedText = this.normalizedText;
    const prefix = SHAL_DATA.polarity.negative.prefix;
    if (normalizedText.startsWith(prefix)) {
      const regexp = new RegExp(`^${prefix}`, "g");
      const name = normalizedText.replace(regexp, "");
      const descriptions = [
        {kind: "category", type: "noun"},
        {kind: "polarity", type: "negative"}
      ];
      this.candidates.push(["nominal", "nominalInflection", descriptions, name]);
    }
  }

  private prepareAdpredicative(): void {
    const normalizedText = this.normalizedText;
    for (const [category, categoryData] of ObjectUtil.entries(SHAL_DATA.adpredicativeInflectionCategory)) {
      for (const [polarity, polarityData] of ObjectUtil.entries(SHAL_DATA.polarity)) {
        const prefix = categoryData.prefix + polarityData.prefix;
        if (normalizedText.startsWith(prefix)) {
          const regexp = new RegExp(`^${prefix}`, "g");
          const name = normalizedText.replace(regexp, "");
          const descriptions = [
            {kind: "category", type: category},
            {kind: "polarity", type: polarity}
          ];
          this.candidates.push(["adpredicative", "adpredicativeInflection", descriptions, name]);
        }
      }
    }
  }

  private prepareSpecial(): void {
    const normalizedText = this.normalizedText;
    for (const [category, categoryData] of ObjectUtil.entries(SHAL_DATA.specialInflectionCategory)) {
      for (const [polarity, polarityData] of ObjectUtil.entries(SHAL_DATA.polarity)) {
        const prefix = categoryData.prefix + polarityData.prefix;
        if (normalizedText.startsWith(prefix)) {
          const regexp = new RegExp(`^${prefix}`, "g");
          const name = normalizedText.replace(regexp, "");
          const descriptions = [
            {kind: "category", type: category},
            {kind: "polarity", type: polarity}
          ];
          this.candidates.push(["special", "specialInflection", descriptions, name]);
        }
      }
    }
  }

  private prepareParticle(): void {
    const normalizedText = this.normalizedText;
    const prefix = SHAL_DATA.particleInflectionType.nonverb.prefix;
    if (normalizedText.startsWith(prefix)) {
      const regexp = new RegExp(`^${prefix}`, "g");
      const name = normalizedText.replace(regexp, "");
      const descriptions = [
        {kind: "form", type: "nonverb"}
      ];
      this.candidates.push(["particle", "particleInflection", descriptions, name]);
    }
  }

  public presuggest(dictionary: Dictionary): Array<Suggestion> {
    return [];
  }

  public suggest(word: Word, dictionary: Dictionary): Array<Suggestion> {
    const suggestions = [];
    const normalizedName = StringNormalizer.normalize(word.name, this.ignoreOptions);
    for (const candidate of this.candidates) {
      const [sort, kind, descriptions, name] = candidate;
      const wordSort = Parser.createKeep().lookupSort(word, "ja");
      const desiredSort = SHAL_DATA.sort[sort].abbreviations["ja"];
      if (normalizedName === name && wordSort?.startsWith(desiredSort)) {
        const suggestion = new ShalInflectionSuggestion(kind, descriptions, word.name);
        suggestions.push(suggestion);
      }
    }
    return suggestions;
  }

}


export class ShalInflectionSuggestion<K extends ShalInflectionSuggestionKind> extends Suggestion<K> {

  public constructor(kind: K, descriptions: ReadonlyArray<SuggestionDescription>, name: string) {
    super(kind, descriptions, [name]);
  }

  public getKindName(language: string): string | undefined {
    return ObjectUtil.get(SHAL_INFLECTION_SUGGESTION_KIND_DATA[this.kind].names, language);
  }

  public getDescriptionName(kind: string, type: string, language: string): string | undefined {
    if (kind === "category") {
      return ObjectUtil.get(ObjectUtil.get(SHAL_DATA.category, type)?.names, language);
    } else if (kind === "polarity") {
      return ObjectUtil.get(ObjectUtil.get(SHAL_DATA.polarity, type)?.names, language);
    } else if (kind === "tense") {
      return ObjectUtil.get(ObjectUtil.get(SHAL_DATA.tense, type)?.names, language);
    } else if (kind === "aspect") {
      return ObjectUtil.get(ObjectUtil.get(SHAL_DATA.aspect, type)?.names, language);
    } else if (kind === "voice") {
      return ObjectUtil.get(ObjectUtil.get(SHAL_DATA.voice, type)?.names, language);
    } else if (kind === "form") {
      return ObjectUtil.get(ObjectUtil.get(SHAL_DATA.particleInflectionType, type)?.names, language);
    } else {
      return undefined;
    }
  }

}


export const SHAL_INFLECTION_SUGGESTION_KIND_DATA = {
  verbalInflection: {names: {ja: "動辞の語形変化", en: "Inflection of verbal"}},
  nominalInflection: {names: {ja: "名辞の語形変化", en: "Inflection of nominal"}},
  adpredicativeInflection: {names: {ja: "連述辞の語形変化", en: "Inflection of adpredicative"}},
  specialInflection: {names: {ja: "特殊辞の語形変化", en: "Inflection of special"}},
  particleInflection: {names: {ja: "助接辞の語形変化", en: "Inflection of particle"}}
} as const;
export type ShalInflectionSuggestionKind = keyof typeof SHAL_INFLECTION_SUGGESTION_KIND_DATA;