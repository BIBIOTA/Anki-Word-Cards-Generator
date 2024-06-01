import { JsonTypes, KeywordType, PromptType, Status } from "../enums/generator";

export type ankiFields = {
    Word: string;
    "Word Type": string;
    Reading: string;
    Definition: string;
    "Sentence(s)": string;
    "Other(s)": string;
  };

export type ankiBody = {
  action: string;
  version: number;
  key: string;
  params: object;
};

export type ankiResponse = {
  error: string;
  result: string[];
};

export type previewCard = {
  word: string;
  wordType: string;
  reading: string;
  Definition: string;
  Sentences: string;
  Others: string;
};

export type previewCardConfig = {
  card: previewCard;
  show: boolean;
}

export type jsonField = {
  key: string;
  type: JsonTypes;
  info: string|null;
}

export type generatorConfig = {
  keywordType: KeywordType
  promptType: PromptType
  status: Status,
  message: string|null,
  showOption: boolean,
}

export type prompt = {
  keyword: string;
  message: string;
  jsonFields: jsonField[];
}
