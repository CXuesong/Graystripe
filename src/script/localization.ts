/// <reference path="../../typings/index.d.ts"/>
import * as Utility from "./utility";
import * as Locale from "./locale";

/**
 * localization/catalog.json Root.
 */
interface LocalizationCatalog {
    /**
     * Known languages.
     */
    languages: string[];
    fallbacks: { [source: string]: string };
}

type TextDict = { [key: string]: string | Array<string> };

export class LocalizedResourceProvider implements Locale.LocaleAware {

    public static readonly LocalizedResourcePath = "data/localization";
    public static readonly FallbackLanguage = "en";

    private loadedDicts: { [locale: string]: TextDict } = {};
    private observables: { [key: string]: KnockoutObservable<string> } = {};
    private _currentLocale: string;
    private _catalog: LocalizationCatalog;

    constructor() {

    }

    public initializeAsync(initialLocale: string) {
        return Utility.getJson(LocalizedResourceProvider.LocalizedResourcePath + "/catalog.json").then(
            (data: LocalizationCatalog) => {
                this._catalog = data;
                if (initialLocale)
                    return this.setCurrentLocaleAsync(initialLocale);
                return $.Deferred().resolve();
            });
    }

    public getCurrentLocale() {
        return this._currentLocale;
    }

    public setCurrentLocaleAsync(value: string) {
        console.assert(!!this._catalog);
        value = (value || "").toLowerCase();
        while (value && this._catalog.languages.indexOf(value) < 0) {
            let fb = Locale.getSurrogateLanguage(value) || Locale.fallbackLanguageTag(value);
        }
        if (!value) {
            console.assert(this._catalog.languages.indexOf(LocalizedResourceProvider.FallbackLanguage) >= 0);
            value = LocalizedResourceProvider.FallbackLanguage;
        }
        this._currentLocale = value;
        if (!(value in this.loadedDicts)) {
            this.loadedDicts[value] = null;
            return this.fetchResourceDictAsync(value).then(((dict: TextDict) => {
                // console.log(dict, "Loaded resource dictionary for ", value);
                this.loadedDicts[value] = dict;
                if (this._currentLocale === value)
                    this.refreshObservables();
                return {};
            }));
        }
        return $.Deferred().resolve();
    }

    public getString(key: string, ...args: any[]): string;
    public getString(key: string): string;
    public getString() {
        let dict = this.loadedDicts[this._currentLocale];
        if (!dict) return null;
        let value = dict[arguments[0]];
        if (!value) return undefined;
        if (value instanceof Array) value = value.join("");
        if (arguments.length > 1) {
            let para = <any[]>Array.apply(null, arguments);
            para[0] = value;
            value = Utility.formatString.apply(null, para);
        }
        return value;
    }

    public getObservableString(key: string) {
        let v = this.observables[key];
        if (v) return v;
        let lv = this.getString(key);
        v = ko.observable(lv || `[${key}]`);
        this.observables[key] = v;
        return v;
    }

    public refreshObservables() {
        for (let key in this.observables) {
            if (this.observables.hasOwnProperty(key)) {
                let lv = this.getString(key);
                // console.debug(key, lv);
                if (lv) this.observables[key](lv);
            }
        }
    }

    private fetchResourceDictAsync(locale: string) {
        console.assert(!!locale);
        return Utility.getJson(`${LocalizedResourceProvider.LocalizedResourcePath}/${locale}/text.json`);
    }
}

/**
 * Public instance of LocalizedResourceProvider.
 */
export let LR = new LocalizedResourceProvider();
