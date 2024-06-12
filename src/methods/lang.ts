import { Languages } from "../enums/generator";

export const getLang = (): Languages => {
  const queryLang = new URLSearchParams(window.location.search).get('lang');

  // check queryLang exists in Enum Languages
  if (queryLang && Object.values(Languages).includes(queryLang as Languages)) {
    return queryLang as Languages;
  }

  return Languages.En;
}