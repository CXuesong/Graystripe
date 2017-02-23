System.register(["./utility", "./vmUtility", "./objectModel", "./ptag", "./localization"], function (exports_1, context_1) {
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
    var Utility, VmUtility, ObjectModel, Ptag, localization_1, StageHistoryEntry, StageOptionViewModel, CurrentStageViewModel, TabViewModel, SaveLoadTabViewModel, PlayerViewModel, vm;
    return {
        setters: [
            function (Utility_1) {
                Utility = Utility_1;
            },
            function (VmUtility_1) {
                VmUtility = VmUtility_1;
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
                    this.text = model.text || Utility.htmlEscape(this.target);
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
                    this.stageName(this.stageContext.currentStage.toString());
                    this.prompt(this.stageContext.prompt);
                    var opts = [];
                    this.stageContext.options.forEach(function (opt) {
                        opts.push(new StageOptionViewModel(opt, function (sender) {
                            _this.onOptionClick(sender);
                        }));
                    });
                    this.options(opts);
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
            PlayerViewModel = (function (_super) {
                __extends(PlayerViewModel, _super);
                function PlayerViewModel() {
                    var _this = _super.call(this) || this;
                    _this._engine = new Ptag.GameEngine();
                    _this.currentStageVM = new CurrentStageViewModel(_this._engine.context, function (opt) { _this.gotoStageAsync(opt.target); });
                    return _this;
                }
                PlayerViewModel.prototype.openGameAsync = function () {
                    var _this = this;
                    var t = toastr.info("<span data-bind=\"LR('game_loading')\">Loading…</span>", null, { timeOut: 0 });
                    return this._engine.openGameAsync(new URI(window.location.href).hash("").search("").filename("data/demo/game.json").toString())
                        .done(function () {
                        _this.currentStageVM.refresh();
                    }).fail(VmUtility.showError)
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
                    slot.stageContext = this._engine.SaveContext();
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
                    return this._engine.LoadContextAsync(slot.stageContext)
                        .done(function () {
                        _this.currentStageVM.refresh();
                        toastr.success(localization_1.LR.getString("game_session_loaded"), slot.time.toString());
                        return true;
                    })
                        .fail(VmUtility.showError);
                };
                return PlayerViewModel;
            }(VmUtility.LocalizableViewModel));
            localization_1.LR.initializeAsync(navigator.language)
                .done(function () { document.title = localization_1.LR.getString("ptag"); })
                .fail(VmUtility.showError);
            vm = new PlayerViewModel();
            vm.openGameAsync();
            console.log(vm);
            ko.applyBindings(vm);
        }
    };
});

//# sourceMappingURL=play.js.map
