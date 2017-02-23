/// <reference path="../../typings/index.d.ts"/>

import * as Utility from "./utility";

interface LocaleData {
    surrogates: { [sourceTag: string]: string };
}

let locale: LocaleData;

export function initializeAsync() {
    return Utility.getJson("data/locale.json").done(json => { locale = json; });
}

export function fallbackLanguageTag(languageTag: string) {
    let index = languageTag.lastIndexOf("-");
    if (index <= 0) return "";
    return languageTag.substr(0, index);
}

export function getSurrogateLanguage(languageTag: string) {
    return locale.surrogates[languageTag] || null;
}

export interface LocaleAware {
    getCurrentLocale(): void;
    setCurrentLocaleAsync(locale: string): void;
}
