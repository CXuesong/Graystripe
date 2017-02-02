/// <reference path="../../typings/index.d.ts"/>

/**
 * User state.
 */
export class GameState {
    public constructor(private _sceneName: string, private _stageName: string, private _stateStore: any) {

    }
    public get sceneName() { return this._sceneName; }
    public get stageName() { return this._stageName; }
    public get stateStore() { return this._stateStore; }
}

/**
 * An immutable representing a stage in the game.
 */
export class GameStage {
    public constructor(private _stageName: string, private _description: string, private _options: Option[]) {

    }
    public get stageName() { return this._stageName; }
    public get description() { return this._description; }
    public get options() { return this._options; }
}

/**
 * Represents an option that can be clicked in the game.
 */
export class Option {
    public constructor(private _caption: string, private _onSelected: (sender: Option) => string) {

    }

    public get enabled() { return !!this._onSelected; }

    public Select() {
        if (this._onSelected) return this._onSelected(this);
        return null;
    }
}

/**
 * The adventure game engine.
 */
export class Engine {
    private _currentStage: GameStage;
    private _currentState: GameState;
    private _storyRoot: string;
    private _loadedStages: { [stageName: string]: GameStage};

    public constructor() {

    }
}
