// Object Model for json files

// game.json
export interface GameMeta {
    name: string;
    description: string;
    lang: GameLanguageInfo;
    stageGroups: { [name: string]: string };
}

export interface GameLanguageInfo {
    default: string;
    supported: string[];
}

// [stagegroup].json
export interface StageGroup {
    stages: { [name: string]: GameStage };
    // Runtime
    sourceUrl: string;
    localized: { [locale: string]: LocalizedStageGroup };
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

// [stagegroup].[locale].json
export interface LocalizedStageGroup {
    stages: { [name: string]: LocalizedGameStage };
    // Runtime
    sourceUrl: string;
}

export interface LocalizedGameStage {
    prompt: string;
    options: string[];
}

export interface SessionSlot {
    time: Date;
    stageContext: any;
}

export function reconstructSessionSlot(obj: SessionSlot) {
    if (!obj) return obj;
    obj.time = new Date(obj.time);
}
