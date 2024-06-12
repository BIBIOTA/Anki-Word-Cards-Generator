import { JsonTypes, KeywordType, Languages, PromptType, Status } from "../enums/generator";

export type ankiFields = {
    Word: string;
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

export type previewCardConfig = {
  template: any;
  card: any;
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
  language: Languages,
}

export type prompt = {
  keyword: string;
  message: string;
  jsonFields: jsonField[];
}
