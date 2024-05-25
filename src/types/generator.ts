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
