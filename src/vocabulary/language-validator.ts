import { Lang } from "../types";

class LanguageValidator {
  private languageRegexps: Record<Lang, RegExp> = {
    [Lang.ru]: /[а-я, ]+/gi,
    [Lang.en]: /[\w, ]+/gi,
  };

  validate(text: string, lang: Lang) {
    return Boolean(text.match(this.languageRegexps[lang]));
  }
}

export const languageValidator = new LanguageValidator();
