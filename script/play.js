System.register(["./objectModel", "./utility", "./ptag"], function (exports_1, context_1) {
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
    var ObjectModel, Utility, Ptag, StageHistoryEntry, StageOptionViewModel, CurrentStageViewModel, TabViewModel, SaveLoadTabViewModel, PlayerViewModel, vm;
    return {
        setters: [
            function (ObjectModel_1) {
                ObjectModel = ObjectModel_1;
            },
            function (Utility_1) {
                Utility = Utility_1;
            },
            function (Ptag_1) {
                Ptag = Ptag_1;
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
            CurrentStageViewModel = (function () {
                function CurrentStageViewModel(stageContext, onOptionClick) {
                    this.stageContext = stageContext;
                    this.onOptionClick = onOptionClick;
                    this.stageName = ko.observable("[stage]");
                    this.prompt = ko.observable("[prompt]");
                    this.options = ko.observableArray();
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
            }());
            TabViewModel = (function () {
                function TabViewModel() {
                    this._IsVisible = false;
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
            }());
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
            PlayerViewModel = (function () {
                function PlayerViewModel() {
                    var _this = this;
                    this._engine = new Ptag.GameEngine();
                    this.currentStageVM = new CurrentStageViewModel(this._engine.context, function (opt) { _this.gotoStageAsync(opt.target); });
                }
                PlayerViewModel.prototype.openGameAsync = function () {
                    var _this = this;
                    var t = toastr.info("Loading game…");
                    return this._engine.openGameAsync(new URI(window.location.href).hash("").search("").filename("data/demo/game.json").toString())
                        .done(function () {
                        _this.currentStageVM.refresh();
                    }).fail(function (err) { toastr.error(err); })
                        .always(function () { t.hide(); });
                };
                PlayerViewModel.prototype.gotoStageAsync = function (targetStageName) {
                    var _this = this;
                    var name = new Ptag.StageName(targetStageName);
                    var d = this._engine.gotoStageAsync(name);
                    if (d.state() === "pending") {
                        var t_1 = toastr.info("Loading stage…<br />" + Utility.htmlEscape(name.toString()));
                        d.always(function () { t_1.hide(); });
                    }
                    return d.done(function () {
                        _this.currentStageVM.refresh();
                    }).fail(function (err) { toastr.error(err); });
                };
                PlayerViewModel.prototype.restartGame = function () {
                    if (!confirm("Do you wish to restart the game?"))
                        return $.Deferred().resolve();
                    return this.gotoStageAsync(":");
                };
                PlayerViewModel.prototype.saveGame = function () {
                    if (!store.enabled) {
                        toastr.error('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.');
                        return;
                    }
                    var slot = {};
                    slot.time = new Date();
                    slot.stageContext = this._engine.SaveContext();
                    store.set("context", slot);
                    toastr.success("Session has been saved to your browser.");
                };
                PlayerViewModel.prototype.loadGame = function () {
                    var _this = this;
                    if (!store.enabled) {
                        toastr.error('Local storage is not supported by your browser. Please disable "Private Mode", or upgrade to a modern browser.');
                        return;
                    }
                    var slot = store.get("context");
                    if (!slot) {
                        toastr.warning("No saved session to load.");
                        return $.Deferred().resolve();
                    }
                    ObjectModel.reconstructSessionSlot(slot);
                    console.log(slot);
                    return this._engine.LoadContextAsync(slot.stageContext)
                        .done(function () {
                        _this.currentStageVM.refresh();
                        toastr.success("Session has been loaded. <br />" + slot.time);
                    })
                        .fail(function (err) { toastr.error(err); });
                };
                return PlayerViewModel;
            }());
            vm = new PlayerViewModel();
            vm.openGameAsync();
            console.log(vm);
            ko.applyBindings(vm);
        }
    };
});

//# sourceMappingURL=play.js.map
