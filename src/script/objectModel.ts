// Object Model for json files

// game.json
export interface GameMeta {
    name: string;
    description: string;
    stageGroups: { [name: string]: string };
}

// [stategroup].json
export interface StageGroup {
    stages: { [name: string]: GameStage };
    sourceUrl: string;
}

export interface GameStage {
    prompt: string;
    options: StageOption[];
    script: string;
}

// A user-selectable option item.
export interface StageOption {
    target: string;
    text: string;
}
