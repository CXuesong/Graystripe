/// <reference path="../../typings/index.d.ts"/>
import * as ObjectModel from "./objectModel";
import * as Utility from "./utility";

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
    public rootUrl: string;
    public currentStage: StageName;
    public stateStore: { [key: string]: any } = {};
    // Current Stage
    public prompt: string;
    public options: ObjectModel.StageOption[];
    // Utility
    public getAbsUrl(path: string) {
        return new URI(this.rootUrl).filename(path).toString();
    }
    public constructor() {

    }
}

/**
 * The adventure game engine.
 */
export class GameEngine {
    private _context: StageContext;
    private _game: ObjectModel.GameMeta;
    private _loadedStageGroups: { [name: string]: ObjectModel.StageGroup | JQueryPromise<ObjectModel.StageGroup> };

    public constructor() {
        this.clear();
    }

    public clear() {
        this._context = new StageContext();
        this._loadedStageGroups = {};
        this._game = null;
    }

    public openGameAsync(url: string) {
        return Utility.getJson(url).then((json) => {
            this._game = <ObjectModel.GameMeta>json;
            this._context.rootUrl = new URI(url).hash("").search("").filename("").toString();
            return this.gotoStageAsync(new StageName(":"));
        });
    }

    public getStageGroupAsync(groupName: string) {
        if (!this._game) return $.Deferred().reject(new Error("Game is not ready."));
        let group = this._loadedStageGroups[groupName];
        if (!group) {
            let importUrl = this._game.stageGroups[groupName];
            if (!importUrl) return $.Deferred().reject(new StageGroupMissingError(groupName));
            return this._loadedStageGroups[groupName] = Utility.getJson(this._context.getAbsUrl(importUrl))
                .then(json => { return this._loadedStageGroups[groupName] = <ObjectModel.StageGroup>json; });
        }
        if ((<JQueryPromise<ObjectModel.StageGroup>>group).then)
            return <JQueryPromise<ObjectModel.StageGroup>>group;
        else
            return $.Deferred().resolve(group);
    }
    /**
     * Goes to the startup stage of the game.
     */
    public gotoStageAsync();
    /**
     * Goes to a specific stage of the game.
     */
    public gotoStageAsync(name: StageName);
    public gotoStageAsync(name?: StageName) {
        if (name)
            name = StageName.Combine(this._context.currentStage, name);
        else
            name = new StageName(":");
        console.log("gotoStageAsync %s", name.toString());
        return this.getStageGroupAsync(name.groupName).then(group => {
            let stage = group.stages[name.localName];
            if (stage) {
                this._context.prompt = stage.prompt;
                this._context.options = stage.options;
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
    public SaveContext() {
        return { currentStage: this._context.currentStage.toString(), stateStore: this._context.stateStore };
    }
    /**
     * Load current stage from an object dictionary.
     */
    public LoadContextAsync(obj: any) {
        this._context.stateStore = obj.stateStore || {};
        return this.gotoStageAsync(new StageName(obj.currentStage || ":"));
    }

    public get context() { return this._context; }
}
