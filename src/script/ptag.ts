/// <reference path="../../typings/index.d.ts"/>
import * as ObjectModel from "./objectModel";
import * as Utility from "./utility";
import * as Locale from "./locale";

/**
 * An immutable strcutre of full game-stage name.
 *
 * The full game-stage expression obeys the following syntax
 * `[`_`groupName`_`:][`_`localName`_]
 * the `groupName` can be neglected, which indicates a
 * relative stage name.
 */
export class StageName {
    public static Combine(stage1: StageName, stage2: StageName) {
        if (stage2.isRelative)
            return new StageName(stage1._groupName, stage2._localName);
        return stage2;
    }

    public constructor(groupName: string, localName: string);
    public constructor(stageExpr: string);
    public constructor(private readonly _groupName: string, private readonly _localName?: string) {
        if (_localName === undefined) {
            // Parse
            let segments = _groupName.split(":", 2);
            if (segments.length >= 2) {
                this._groupName = segments[0];
                this._localName = segments[1];
            } else {
                this._groupName = null;
                this._localName = segments[0];
            }
        }
        if (_groupName === undefined) this._groupName = null;
    }
    public get groupName() { return this._groupName; }
    public get localName() { return this._localName; }
    public get isRelative() { return this._groupName === null; }
    public toString() {
        if (this._groupName === null) return this._localName;
        return this._groupName + ":" + this._localName;
    }
}

export class StageMissingError extends Utility.ResourceMissingError {
    public constructor(public stageName: StageName) {
        super(stageName, "Stage");
    }
}

export class StageGroupMissingError extends Utility.ResourceMissingError {
    public constructor(public stageGroupName: string) {
        super(stageGroupName, "StageGroup");
    }
}

/**
 * Mutable stage state.
 */
export class StageContext {
    public gamebookUrl: string;
    public currentStage: StageName;
    public stateStore: { [key: string]: any } = {};
    // Current Stage
    public prompt: string;
    public options: ObjectModel.StageOption[];
    // Utility
    public getAbsUrl(path: string) {
        return new URI(this.gamebookUrl).filename(path).query("").hash("").toString();
    }
    public clear() {
        this.gamebookUrl = null;
        this.currentStage = null;
        this.stateStore = {};
        this.prompt = null;
        this.options = null;
    }
    public constructor() {
        this.clear();
    }
}

/**
 * The adventure game engine.
 */
export class GameEngine implements Locale.LocaleAware {
    private readonly _context = new StageContext();
    private _game: ObjectModel.GameMeta;
    private _loadedStageGroups: { [name: string]: ObjectModel.StageGroup } = {};
    private readonly _loadingStageGroups: { [name: string]: { [locale: string]: JQueryPromise<any> } } = {};
    private _currentLocale = "";

    public constructor() {
        this.clear();
    }

    public get gameMeta() { return this._game; }

    public getCurrentLocale() {
        return this._currentLocale;
    }

    public setCurrentLocaleAsync(locale: string) {
        if (locale === this._currentLocale) return $.Deferred().resolve();
        this._currentLocale = Locale.normalizeLanguageTag(locale);
        if (!!this._game) {
            // TODO Distingush between GOTO and REFRESH the current stage.
            return this.gotoStageAsync(this._context.currentStage);
        }
        return $.Deferred().resolve();
    }

    public clear() {
        this._loadedStageGroups = {};
        this._game = null;
        this._context.clear();
    }

    public openGameAsync(url: string) {
        return Utility.getJson(url).then((json) => {
            this._game = <ObjectModel.GameMeta>json;
            this._context.gamebookUrl = new URI(url).normalize().toString();
            return this.gotoStageAsync(new StageName(":"));
        });
    }

    public tryGetLocalizedStageGroupAsync(groupName: string, locale: string): JQueryPromise<ObjectModel.LocalizedStageGroup> {
        console.assert(!!this._game);
        let group = this._loadedStageGroups[groupName];
        if (group !== undefined) {
            let lg = group.localized[locale];
            if (lg) return $.Deferred().resolve(lg);
        }
        let dg = (this._loadingStageGroups[groupName] || {})[locale];
        if (dg) return dg;
        // Fetch
        let importUrl = new URI(this._context.getAbsUrl(this._game.stageGroups[groupName]));
        importUrl.filename(Utility.fileNameAddSuffix(importUrl.filename(), "." + locale));
        if (!importUrl) return $.Deferred().reject(new StageGroupMissingError(groupName));
        return this._loadingStageGroups[groupName][locale] = this.getStageGroupAsync(groupName).then(g => {
            group = g;
            return Utility.getJson(importUrl.toString());
        }).then(json => { return group.localized[locale] = json; }, err => {
            console.log("tryGetLocalizedStageGroupAsync", err);
            let netErr = <Utility.NetError>err;
            // Resource not found, etc.
            if (netErr.IsBadRequest) return group.localized[locale] = null;
            // Network failure, perhaps.
            return null;
        });
    }

    public getStageGroupAsync(groupName: string) {
        console.assert(!!this._game);
        let group = this._loadedStageGroups[groupName];
        if (group) return $.Deferred().resolve(group);
        let dg = (this._loadingStageGroups[groupName] || {})["*"];
        if (dg) return dg;
        let importUrl = this._game.stageGroups[groupName];
        if (!importUrl) return $.Deferred().reject(new StageGroupMissingError(groupName));
        if (!this._loadingStageGroups[groupName]) this._loadingStageGroups[groupName] = {};
        return this._loadingStageGroups[groupName]["*"] = Utility.getJson(this._context.getAbsUrl(importUrl))
            .then((json: ObjectModel.StageGroup) => {
                json.sourceUrl = this._context.getAbsUrl(importUrl);
                json.localized = {};
                return this._loadedStageGroups[groupName] = json;
            });
    }

    public getStageAsync(name: StageName): JQueryPromise<ObjectModel.GameStage> {
        let d = $.Deferred();
        // The 'arguments' object cannot be referenced in an arrow function in ES3 and ES5.
        this.getStageGroupAsync(name.groupName).then(group => {
            let s = group.stages[name.localName];
            if (s) d.resolve(s);
            else d.reject(new StageMissingError(name));
        }, function () { d.reject.apply(d, arguments); });
        return d;
    }

    /**
     * Goes to the startup stage of the game.
     */
    public gotoStageAsync(): JQueryPromise<{}>;
    /**
     * Goes to a specific stage of the game.
     */
    public gotoStageAsync(name: StageName): JQueryPromise<{}>;
    public gotoStageAsync(name?: StageName) {
        if (name)
            name = StageName.Combine(this._context.currentStage, name);
        else
            name = new StageName(":");
        console.log("gotoStageAsync %s", name.toString());
        let stage: ObjectModel.GameStage;
        let newPrompt: string;
        let newOptionsText: string[] = [];
        return this.getStageAsync(name).then(s => {
            stage = s;
            newPrompt = stage.prompt;
            newOptionsText = stage.options.map(opt => { return opt.text; });
            if (!this._currentLocale || Locale.languageTagEquals(this._game.lang.default, this._currentLocale)) return;
            // Need localization
            let ds = [this.getLocalizedStageGroupValueAsync(name.groupName, lsg => newPrompt = lsg.stages[name.localName].prompt)];
            for (let i = 0; i < stage.options.length; i++) {
                let i1 = i;
                ds.push(this.getLocalizedStageGroupValueAsync(name.groupName, lsg =>
                    newOptionsText[i1] = lsg.stages[name.localName].options[i1]));
            }
            return $.when.apply($, ds);
        }).then(() => {
            if (stage) {
                this._context.prompt = newPrompt;
                this._context.options = stage.options.map((opt, i) => {
                    return <ObjectModel.StageOption>{ target: opt.target, text: newOptionsText[i] };
                });
                // eval(stage.script);
                this._context.currentStage = name;
                return;
            }
            return $.Deferred().reject(new StageMissingError(name));
        });
    }

    /**
     * Persists current state into an object dictionary and returns it.
     */
    public saveContext() {
        return { currentStage: this._context.currentStage.toString(), stateStore: this._context.stateStore };
    }
    /**
     * Load current stage from an object dictionary.
     */
    public loadContextAsync(obj: any) {
        this._context.stateStore = obj.stateStore || {};
        return this.gotoStageAsync(new StageName(obj.currentStage || ":"));
    }

    public get context() { return this._context; }

    private getLocalizedStageGroupValueAsync<T>(groupName: string,
        selector: (lsg: ObjectModel.LocalizedStageGroup) => T, fallback?: T, locale?: string) {
        locale = locale || this._currentLocale;
        let attempts = 0;
        //  states
        //      0       original
        //      1       surrogate
        //      2       fallback + surrogate
        let nextAttempt = (lsg: ObjectModel.LocalizedStageGroup): T | JQueryPromise<T> => {
            if (!lsg) {
                while (attempts < 2) {
                    let lc: string;
                    switch (attempts) {
                        case 0: lc = locale; break;
                        case 1: lc = Locale.getSurrogateLanguage(locale); break;
                        case 2: lc = Locale.getSurrogateLanguage(Locale.fallbackLanguageTag(locale)); break;
                    }
                    // Next state
                    attempts++;
                    // This attempt is to fail…
                    if (!lc) continue;
                    // May worth a trial.
                    lc = Locale.findLanguageTag(lc, this._game.lang.supported);
                    if (lc) {
                        console.log("getLocalizedStageGroupValueAsync", "try locale", lc);
                        return this.tryGetLocalizedStageGroupAsync(groupName, lc).then(nextAttempt);
                    }
                };
                return fallback;
            }
            return selector(lsg);
        };
        return $.Deferred().resolve().then(nextAttempt);
    }

    public get supportedLocales() {
        return this._game.lang.supported;
    }
}

/**
 * Converts the short-hand markup to standard HTML.
 */
export function parseMarkup(mk: string) {
    let x = $.parseXML("<div>" + mk + "</div>");
    $("a[href]", x).attr("target", "_blank");
    return Utility.XmlToString(x);
}
