System.register(["./utility", "./vmUtility", "./locale", "./objectModel", "./ptag", "./localization"], function (exports_1, context_1) {
    "use strict";
    var __extends = (this && this.__extends) || (function () {
        var extendStatics = Object.setPrototypeOf ||
            ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
            function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
        return function (d, b) {
            extendStatics(d, b);
            function __() { this.constructor = d; }
            d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
        };
    })();
    var __moduleName = context_1 && context_1.id;
    var Utility, VmUtility, Locale, ObjectModel, Ptag, localization_1, StageHistoryEntry, StageOptionViewModel, CurrentStageViewModel, TabViewModel, SaveLoadTabViewModel, LanguageSettingsDialogViewModel, PlayerViewModel, vm, t1;
    return {
        setters: [
            function (Utility_1) {
                Utility = Utility_1;
            },
            function (VmUtility_1) {
                VmUtility = VmUtility_1;
            },
            function (Locale_1) {
                Locale = Locale_1;
            },
            function (ObjectModel_1) {
                ObjectModel = ObjectModel_1;
            },
            function (Ptag_1) {
                Ptag = Ptag_1;
            },
            function (localization_1_1) {
                localization_1 = localization_1_1;
            }
        ],
        execute: function () {
            StageHistoryEntry = (function () {
                function StageHistoryEntry(description, selectedOption) {
                    this.description = description;
                    this.selectedOption = selectedOption;
                }
                return StageHistoryEntry;
            }());
            StageOptionViewModel = (function () {
                function StageOptionViewModel(model, onClick) {
                    this.model = model;
                    this.onClick = onClick;
                    this.target = model.target;
                    this.text = model.text === null || model.text === undefined
                        ? Utility.htmlEscape(this.target)
                        : Ptag.parseMarkup(model.text);
                }
                StageOptionViewModel.prototype.notifyClick = function () {
                    if (this.onClick)
                        this.onClick(this);
                };
                return StageOptionViewModel;
            }());
            CurrentStageViewModel = (function (_super) {
                __extends(CurrentStageViewModel, _super);
                function CurrentStageViewModel(stageContext, onOptionClick) {
                    var _this = _super.call(this) || this;
                    _this.stageContext = stageContext;
                    _this.onOptionClick = onOptionClick;
                    _this.stageName = ko.observable("[stage]");
                    _this.prompt = ko.observable("[prompt]");
                    _this.options = ko.observableArray();
                    return _this;
                }
                CurrentStageViewModel.prototype.refresh = function () {
                    var _this = this;
                    try {
                        this.stageName(this.stageContext.currentStage.toString());
                        this.prompt(Ptag.parseMarkup(this.stageContext.prompt));
                        var opts_1 = [];
                        this.stageContext.options.forEach(function (opt) {
                            opts_1.push(new StageOptionViewModel(opt, function (sender) {
                                _this.onOptionClick(sender);
                            }));
                        });
                        this.options(opts_1);
                    }
                    catch (err) {
                        VmUtility.showError(err);
                    }
                };
                return CurrentStageViewModel;
            }(VmUtility.LocalizableViewModel));
            TabViewModel = (function (_super) {
                __extends(TabViewModel, _super);
                function TabViewModel() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this._IsVisible = false;
                    return _this;
                }
                Object.defineProperty(TabViewModel.prototype, "IsVisible", {
                    get: function () { return this._IsVisible; },
                    set: function (value) {
                        if (this._IsVisible !== value) {
                            this._IsVisible = value;
                            if (value)
                                this.onShow();
                            else
                                this.onHide();
                        }
                    },
                    enumerable: true,
                    configurable: true
                });
                TabViewModel.prototype.onShow = function () { };
                TabViewModel.prototype.onHide = function () { };
                return TabViewModel;
            }(VmUtility.LocalizableViewModel));
            SaveLoadTabViewModel = (function (_super) {
                __extends(SaveLoadTabViewModel, _super);
                function SaveLoadTabViewModel() {
                    var _this = _super !== null && _super.apply(this, arguments) || this;
                    _this.IsSaving = ko.observable(false);
                    _this.Slots = ko.observableArray();
                    return _this;
                }
                return SaveLoadTabViewModel;
            }(TabViewModel));
            LanguageSettingsDialogViewModel = (function (_super) {
                __extends(LanguageSettingsDialogViewModel, _super);
                function LanguageSettingsDialogViewModel() {
                    var _this = _super.call(this) || this;
                    _this.selectedUILanguage = ko.observable("");
                    _this.selectedGameLanguage = ko.observable("");
                    _this.uiLanguages = ko.observableArray();
                    _this.gameLanguages = ko.observableArray();
                    return _this;
                }
                LanguageSettingsDialogViewModel.prototype.prepare = function (uiLanguages, gameLanguages) {
                    var mapping = function (lang) {
                        lang = Locale.normalizeLanguageTag(lang);
                        return [lang, lang];
                    };
                    this.uiLanguages(uiLanguages.map(mapping).sort(function (a, b) { return a[0] > b[0] ? 1 : (a[0] < b[0] ? -1 : 0); }));
                    this.gameLanguages(gameLanguages.map(mapping).sort(function (a, b) { return a[0] > b[0] ? 1 : (a[0] < b[0] ? -1 : 0); }));
                };
                LanguageSettingsDialogViewModel.prototype.cleanup = function () {
                    this.uiLanguages.removeAll();
                    this.gameLanguages.removeAll();
                };
                return LanguageSettingsDialogViewModel;
            }(VmUtility.LocalizableViewModel));
            PlayerViewModel = (function (_super) {
                __extends(PlayerViewModel, _super);
                function PlayerViewModel() {
                    var _this = _super.call(this) || this;
                    _this.languageSettingsDialogVM = new LanguageSettingsDialogViewModel();
                    _this.gameLang = ko.observable("");
                    _this._engine = new Ptag.GameEngine();
                    _this.currentStageVM = new CurrentStageViewModel(_this._engine.context, function (opt) { _this.gotoStageAsync(opt.target); });
                    _this.gameLang.subscribe(function (v) { _this._engine.setCurrentLocaleAsync(v); });
                    return _this;
                }
                PlayerViewModel.prototype.openGameAsync = function () {
                    var _this = this;
                    var t = toastr.info("<span data-bind=\"text: LC('game_loading')\">Loading…</span>", null, { timeOut: 0 });
                    var gamebook = VmUtility.getQueryParameters().gamebook || "data/demo/game.json";
                    this._engine.clear();
                    return this._engine.openGameAsync(new URI(gamebook).absoluteTo(window.location.href).toString())
                        .done(function () { _this.currentStageVM.refresh(); }).fail(VmUtility.showError)
                        .fail(function (err) {
                        _this.currentStageVM.stageName(localization_1.LR.getString("cannot_load_gamebook_title"));
                        _this.currentStageVM.prompt(localization_1.LR.getString("cannot_load_gamebook_prompt", gamebook));
                    })
                        .always(function () { t.hide(); });
                };
                PlayerViewModel.prototype.gotoStageAsync = function (targetStageName) {
                    var _this = this;
                    var name = new Ptag.StageName(targetStageName);
                    var d = this._engine.gotoStageAsync(name);
                    if (d.state() === "pending") {
                        var t_1 = toastr.info(Utility.htmlEscape(name.toString()), localization_1.LR.getString("stage_loading"), { timeOut: 0 });
                        d.always(function () { t_1.hide(); });
                    }
                    return d.done(function () {
                        _this.currentStageVM.refresh();
                    }).fail(VmUtility.showError);
                };
                PlayerViewModel.prototype.restartGame = function () {
                    if (!confirm(localization_1.LR.getString("game_restart_prompt")))
                        return $.Deferred().resolve();
                    return this.gotoStageAsync(":").done(function () { toastr.success(localization_1.LR.getString("game_restarted")); });
                };
                PlayerViewModel.prototype.saveGame = function () {
                    if (!store.enabled) {
                        toastr.error(localization_1.LR.getString("local_storage_not_supported"));
                        return;
                    }
                    var slot = {};
                    slot.time = new Date();
                    slot.stageContext = this._engine.saveContext();
                    store.set("context", slot);
                    toastr.success(localization_1.LR.getString("game_session_saved"));
                };
                PlayerViewModel.prototype.loadGame = function () {
                    var _this = this;
                    if (!store.enabled) {
                        toastr.error(localization_1.LR.getString("local_storage_not_supported"));
                        return;
                    }
                    var slot = store.get("context");
                    if (!slot) {
                        toastr.warning(localization_1.LR.getString("game_no_session_to_load"));
                        return $.Deferred().resolve(false);
                    }
                    if (!window.confirm(localization_1.LR.getString("game_session_load_prompt")))
                        return $.Deferred().resolve(false);
                    ObjectModel.reconstructSessionSlot(slot);
                    return this._engine.loadContextAsync(slot.stageContext)
                        .done(function () {
                        _this.currentStageVM.refresh();
                        toastr.success(localization_1.LR.getString("game_session_loaded"), slot.time.toString());
                        return true;
                    })
                        .fail(VmUtility.showError);
                };
                PlayerViewModel.prototype.showLanguageSettingsDialog = function () {
                    var _this = this;
                    var dlg = document.getElementById("lang-settings-dialog");
                    if (dlg.open)
                        return;
                    dlg.showModal();
                    Utility.delayAsync(10).then(function () {
                        var vm = _this.languageSettingsDialogVM;
                        vm.prepare(localization_1.LR.supportedLocales, _this._engine.supportedLocales);
                        return Utility.delayAsync(10).then(function () {
                            console.log(localization_1.LR.getCurrentLocale());
                            console.log(_this._engine.getCurrentLocale());
                            vm.selectedUILanguage(localization_1.LR.getCurrentLocale());
                            vm.selectedGameLanguage(_this._engine.getCurrentLocale());
                            VmUtility.mdlSelectNotifyChanged(dlg);
                            var sub1 = vm.selectedUILanguage.subscribe(function (lang) { return localization_1.LR.setCurrentLocaleAsync(lang); });
                            var sub2 = vm.selectedGameLanguage.subscribe(function (lang) {
                                return _this._engine.setCurrentLocaleAsync(lang)
                                    .then(function () { return _this.currentStageVM.refresh(); });
                            });
                            $(dlg).on("close", function () {
                                sub1.dispose();
                                sub2.dispose();
                            });
                        });
                    });
                };
                return PlayerViewModel;
            }(VmUtility.LocalizableViewModel));
            exports_1("vm", vm = new PlayerViewModel());
            t1 = toastr.info("Loading localization resource…");
            vm.gameLang(navigator.language);
            Locale.initializeAsync().then(function () { return localization_1.LR.initializeAsync(navigator.language); })
                .always(function () { t1.hide(); })
                .then(function () { document.title = localization_1.LR.getString("ptag"); return vm.openGameAsync(); }, VmUtility.showError);
            console.log(vm);
            ko.applyBindings(vm);
        }
    };
});

//# sourceMappingURL=play.js.map
