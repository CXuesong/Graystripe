System.register(["./utility", "./ptag"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    var Utility, Ptag, StageHistoryEntry, StageOptionViewModel, CurrentStageViewModel, PlayerViewModel, vm;
    return {
        setters: [
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
                    this.text = model.text || Utility.escapeHtml(this.target);
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
                    this.options.extend({ rateLimit: 100 });
                }
                CurrentStageViewModel.prototype.refresh = function () {
                    var _this = this;
                    this.stageName(this.stageContext.currentStage.toString());
                    this.prompt(this.stageContext.prompt);
                    this.options.removeAll();
                    this.stageContext.options.forEach(function (opt) {
                        _this.options.push(new StageOptionViewModel(opt, function (sender) {
                            _this.onOptionClick(sender);
                        }));
                    });
                };
                return CurrentStageViewModel;
            }());
            PlayerViewModel = (function () {
                function PlayerViewModel() {
                    var _this = this;
                    this._engine = new Ptag.GameEngine();
                    this.currentStageVM = new CurrentStageViewModel(this._engine.context, function (opt) { _this.gotoStageAsync(opt.target); });
                }
                PlayerViewModel.prototype.openGameAsync = function () {
                    var _this = this;
                    return this._engine.openGameAsync(new URI(window.location.href).hash("").search("").filename("data/demo/game.json").toString())
                        .done(function () { _this.currentStageVM.refresh(); }).fail(function (err) { console.error(err); });
                };
                PlayerViewModel.prototype.gotoStageAsync = function (targetStageName) {
                    var _this = this;
                    return this._engine.gotoStageAsync(new Ptag.StageName(targetStageName))
                        .done(function () { _this.currentStageVM.refresh(); }).fail(function (err) { console.error(err); });
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
