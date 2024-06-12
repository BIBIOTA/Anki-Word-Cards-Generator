import { KeywordType } from "../enums/generator";


interface PromptMessage {
  type: KeywordType;

  getMessage(): string
}

export class EnglishPromptMessage implements PromptMessage {
  type: KeywordType;

  constructor(keywordType: KeywordType) {
    this.type = keywordType;
  }

  getMessage(): string {
    if (this.type === KeywordType.Word) {
      return `
        Please make above-mentioned word's detail like a Cambridge English-Chinese Dictionary format.
        The response key and type of json that required: \n
      `;
    }

    return `
        Please convert above-mentioned dictionary word to Json.
        The response key and type of json that required: \n
    `;
  }
}

export class SpanlishPromptMessage implements PromptMessage {
  type: KeywordType;

  constructor(keywordType: KeywordType) {
    this.type = keywordType;
  }

  getMessage(): string {
    if (this.type === KeywordType.Word) {
      return `
        Please make above-mentioned word's detail like a SpanlishDict format.
        The response key and type of json that required: \n
      `;
    }

    return `
        Please convert above-mentioned dictionary word to Json.
        The response key and type of json that required: \n
    `;
  }
}