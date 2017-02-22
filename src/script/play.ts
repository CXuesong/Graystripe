/// <reference path="../../typings/index.d.ts"/>
import * as ObjectModel from "./objectModel";
import * as Utility from "./utility";
import * as Ptag from "./ptag";

class StageHistoryEntry {
    public constructor(public readonly description: string, public readonly selectedOption: string) { }
}

/**
 * An immutable view model.
 */
class StageOptionViewModel {
    public readonly target: string;
    public readonly text: string;

    public constructor(public readonly model: ObjectModel.StageOption,
        public readonly onClick: (sender: StageOptionViewModel) => void) {
        this.target = model.target;
        this.text = model.text || Utility.escapeHtml(this.target);
    }

    public notifyClick() {
        if (this.onClick) this.onClick(this);
    }
}

class CurrentStageViewModel {
    public readonly stageName = ko.observable("[stage]");
    public readonly prompt = ko.observable("[prompt]");
    public readonly options = ko.observableArray<StageOptionViewModel>();

    public constructor(public readonly stageContext: Ptag.StageContext,
        public readonly onOptionClick: (option: StageOptionViewModel) => void) {
    }

    public refresh() {
        this.stageName(this.stageContext.currentStage.toString());
        this.prompt(this.stageContext.prompt);
        let opts = [];
        this.stageContext.options.forEach(opt => {
            opts.push(new StageOptionViewModel(opt, sender => {
                this.onOptionClick(sender);
            }));
        });
        this.options(opts);
    }
}

class TabViewModel {
    private _IsVisible = false;

    public get IsVisible() { return this._IsVisible; }
    public set IsVisible(value: boolean) {
        if (this._IsVisible !== value) {
            this._IsVisible = value;
            if (value) this.onShow(); else this.onHide();
        }
    }

    protected onShow() { }
    protected onHide() { }
}

class SaveLoadTabViewModel extends TabViewModel {
    public readonly IsSaving = ko.observable(false);
    public readonly Slots = ko.observableArray();
}

/**
 * play.html main VM.
 */
class PlayerViewModel {
    public readonly currentStageVM: CurrentStageViewModel;
    private readonly _engine = new Ptag.GameEngine();

    public constructor() {
        this.currentStageVM = new CurrentStageViewModel(this._engine.context, opt => { this.gotoStageAsync(opt.target); });
    }

    // public get engine() { return this._engine; }
    public openGameAsync() {
        return this._engine.openGameAsync(new URI(window.location.href).hash("").search("").filename("data/demo/game.json").toString())
            .done(() => { this.currentStageVM.refresh(); }).fail(err => { console.error(err); });
    }

    public gotoStageAsync(targetStageName: string) {
        return this._engine.gotoStageAsync(new Ptag.StageName(targetStageName))
            .done(() => { this.currentStageVM.refresh(); }).fail(err => { console.error(err); });
    }

    public restartGame() {
        if (!confirm("Do you wish to restart the game?"))
            return $.Deferred().resolve();
        return this.gotoStageAsync(":");
    }

    public saveGame() {
        if (!store.enabled) {
            alert('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.');
            return;
        }
        store.set("context", this._engine.SaveContext());
    }

    public loadGame() {
        if (!store.enabled) {
            alert('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.');
            return;
        }
        let data = store.get("context");
        if (!data) {
            alert("No saved session to load.");
            return $.Deferred().resolve();
        }
        return this._engine.LoadContextAsync(data)
            .done(() => { this.currentStageVM.refresh(); }).fail(err => { console.error(err); });;
    }
}

let vm = new PlayerViewModel();
vm.openGameAsync();
console.log(vm);

ko.applyBindings(vm);
