/// <reference path="../../typings/index.d.ts"/>
/// <reference path="../lib/HTMLDialogElement.d.ts"/>

import * as Utility from "./utility";
import * as VmUtility from "./vmUtility";
import * as Locale from "./locale";
import * as ObjectModel from "./objectModel";
import * as Ptag from "./ptag";
import { LR } from "./localization";

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
        this.text = model.text === null || model.text === undefined
            ? Utility.htmlEscape(this.target)
            : Ptag.parseMarkup(model.text);
    }

    public notifyClick() {
        if (this.onClick) this.onClick(this);
    }
}

class CurrentStageViewModel extends VmUtility.LocalizableViewModel {
    public readonly stageName = ko.observable("[stage]");
    public readonly prompt = ko.observable("[prompt]");
    public readonly options = ko.observableArray<StageOptionViewModel>();

    public constructor(public readonly stageContext: Ptag.StageContext,
        public readonly onOptionClick: (option: StageOptionViewModel) => void) {
        super();
    }

    public refresh() {
        try {
            this.stageName(this.stageContext.currentStage.toString());
            this.prompt(Ptag.parseMarkup(this.stageContext.prompt));
            let opts = <StageOptionViewModel[]>[];
            this.stageContext.options.forEach(opt => {
                opts.push(new StageOptionViewModel(opt, sender => {
                    this.onOptionClick(sender);
                }));
            });
            this.options(opts);
        } catch (err) {
            // E.g. XML parsing error
            VmUtility.showError(err);
        }
    }
}

class TabViewModel extends VmUtility.LocalizableViewModel {
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

class LanguageSettingsDialogViewModel extends VmUtility.LocalizableViewModel {
    // tslint:disable-next-line:member-ordering
    public selectedUILanguage = ko.observable("");
    public selectedGameLanguage = ko.observable("");
    public uiLanguages = ko.observableArray<[string, string]>();
    public gameLanguages = ko.observableArray<[string, string]>();

    public constructor() {
        super();
    }

    public prepare(uiLanguages: string[], gameLanguages: string[]) {
        let mapping = (lang: string) => {
            lang = Locale.normalizeLanguageTag(lang);
            return <[string, string]>[lang, lang];
        };
        this.uiLanguages(uiLanguages.map(mapping).sort((a, b) => a[0] > b[0] ? 1 : (a[0] < b[0] ? -1 : 0)));
        this.gameLanguages(gameLanguages.map(mapping).sort((a, b) => a[0] > b[0] ? 1 : (a[0] < b[0] ? -1 : 0)));
    }

    public cleanup() {
        this.uiLanguages.removeAll();
        this.gameLanguages.removeAll();
    }
}

/**
 * play.html main VM.
 */
class PlayerViewModel extends VmUtility.LocalizableViewModel {
    public readonly currentStageVM: CurrentStageViewModel;
    public readonly languageSettingsDialogVM = new LanguageSettingsDialogViewModel();
    public readonly gameLang = ko.observable("");

    private readonly _engine = new Ptag.GameEngine();

    public constructor() {
        super();
        this.currentStageVM = new CurrentStageViewModel(this._engine.context, opt => { this.gotoStageAsync(opt.target); });
        this.gameLang.subscribe(v => { this._engine.setCurrentLocaleAsync(v); });
    }

    // public get engine() { return this._engine; }
    public openGameAsync() {
        let t = toastr.info("<span data-bind=\"text: LC('game_loading')\">Loading…</span>", null, { timeOut: 0 });
        let gamebook = VmUtility.getQueryParameters().gamebook || "data/demo/game.json";
        this._engine.clear();
        return this._engine.openGameAsync(new URI(gamebook).absoluteTo(window.location.href).toString())
            .done(() => { this.currentStageVM.refresh(); }).fail(VmUtility.showError)
            .fail(err => {
                this.currentStageVM.stageName(LR.getString("cannot_load_gamebook_title"));
                this.currentStageVM.prompt(LR.getString("cannot_load_gamebook_prompt", gamebook));
            })
            .always(() => { t.hide(); });
    }

    public gotoStageAsync(targetStageName: string) {
        let name = new Ptag.StageName(targetStageName);
        let d = this._engine.gotoStageAsync(name);
        if (d.state() === "pending") {
            let t = toastr.info(Utility.htmlEscape(name.toString()), LR.getString("stage_loading"), { timeOut: 0 });
            d.always(() => { t.hide(); });
        }
        return d.done(() => {
            this.currentStageVM.refresh();
        }).fail(VmUtility.showError);
    }

    public restartGame() {
        if (!confirm(LR.getString("game_restart_prompt")))
            return $.Deferred().resolve();
        return this.gotoStageAsync(":").done(() => { toastr.success(LR.getString("game_restarted")); });
    }

    public saveGame() {
        if (!store.enabled) {
            toastr.error(LR.getString("local_storage_not_supported"));
            return;
        }
        let slot: ObjectModel.SessionSlot = <any>{};
        slot.time = new Date();
        slot.stageContext = this._engine.saveContext();
        store.set("context", slot);
        toastr.success(LR.getString("game_session_saved"));
    }

    public loadGame() {
        if (!store.enabled) {
            toastr.error(LR.getString("local_storage_not_supported"));
            return;
        }
        let slot: ObjectModel.SessionSlot = store.get("context");
        if (!slot) {
            toastr.warning(LR.getString("game_no_session_to_load"));
            return $.Deferred().resolve(false);
        }
        if (!window.confirm(LR.getString("game_session_load_prompt")))
            return $.Deferred().resolve(false);
        ObjectModel.reconstructSessionSlot(slot);
        // console.log(slot);
        return this._engine.loadContextAsync(slot.stageContext)
            .done(() => {
                this.currentStageVM.refresh();
                toastr.success(LR.getString("game_session_loaded"), slot.time.toString());
                return true;
            })
            .fail(VmUtility.showError);
    }

    public showLanguageSettingsDialog() {
        let dlg = <HTMLDialogElement>document.getElementById("lang-settings-dialog");
        if (dlg.open) return;
        dlg.showModal();
        // ISSUE: showModal then do the bindings, or the drop-down of <select> will automatically open
        // the issue is caused by ko & mdl-selectfield .
        Utility.delayAsync(10).then(() => {
            let vm = this.languageSettingsDialogVM;
            vm.prepare(LR.supportedLocales, this._engine.supportedLocales);
            return Utility.delayAsync(10).then(() => {
                console.log(LR.getCurrentLocale());
                console.log(this._engine.getCurrentLocale());
                vm.selectedUILanguage(LR.getCurrentLocale());
                vm.selectedGameLanguage(this._engine.getCurrentLocale());
                VmUtility.mdlSelectNotifyChanged(dlg);
                let sub1 = vm.selectedUILanguage.subscribe(lang => LR.setCurrentLocaleAsync(lang));
                let sub2 = vm.selectedGameLanguage.subscribe(lang =>
                    this._engine.setCurrentLocaleAsync(lang)
                        .then(() => this.currentStageVM.refresh()));
                $(dlg).on("close", () => {
                    sub1.dispose();
                    sub2.dispose();
                });
            });
        });
    }
}

export let vm = new PlayerViewModel();

let t1 = toastr.info("Loading localization resource…");
vm.gameLang(navigator.language);
Locale.initializeAsync().then(() => { return LR.initializeAsync(navigator.language); })
    .always(() => { t1.hide(); })
    .then(() => { document.title = LR.getString("ptag"); return vm.openGameAsync(); }, VmUtility.showError);

console.log(vm);
ko.applyBindings(vm);

