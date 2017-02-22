System.register(["./utility"], function (exports_1, context_1) {
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
    var Utility, StageName, StageMissingError, StageGroupMissingError, StageContext, GameEngine;
    return {
        setters: [
            function (Utility_1) {
                Utility = Utility_1;
            }
        ],
        execute: function () {
            StageName = (function () {
                function StageName(_groupName, _localName) {
                    this._groupName = _groupName;
                    this._localName = _localName;
                    if (_localName === undefined) {
                        var segments = _groupName.split(":", 2);
                        if (segments.length >= 2) {
                            this._groupName = segments[0];
                            this._localName = segments[1];
                        }
                        else {
                            this._groupName = null;
                            this._localName = segments[0];
                        }
                    }
                    if (_groupName === undefined)
                        this._groupName = null;
                }
                StageName.Combine = function (stage1, stage2) {
                    if (stage2.isRelative)
                        return new StageName(stage1._groupName, stage2._localName);
                    return stage2;
                };
                Object.defineProperty(StageName.prototype, "groupName", {
                    get: function () { return this._groupName; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StageName.prototype, "localName", {
                    get: function () { return this._localName; },
                    enumerable: true,
                    configurable: true
                });
                Object.defineProperty(StageName.prototype, "isRelative", {
                    get: function () { return this._groupName === null; },
                    enumerable: true,
                    configurable: true
                });
                StageName.prototype.toString = function () {
                    if (this._groupName === null)
                        return this._localName;
                    return this._groupName + ":" + this._localName;
                };
                return StageName;
            }());
            exports_1("StageName", StageName);
            StageMissingError = (function (_super) {
                __extends(StageMissingError, _super);
                function StageMissingError(stageName) {
                    var _this = _super.call(this, stageName, "Stage") || this;
                    _this.stageName = stageName;
                    return _this;
                }
                return StageMissingError;
            }(Utility.ResourceMissingError));
            exports_1("StageMissingError", StageMissingError);
            StageGroupMissingError = (function (_super) {
                __extends(StageGroupMissingError, _super);
                function StageGroupMissingError(stageGroupName) {
                    var _this = _super.call(this, stageGroupName, "StageGroup") || this;
                    _this.stageGroupName = stageGroupName;
                    return _this;
                }
                return StageGroupMissingError;
            }(Utility.ResourceMissingError));
            exports_1("StageGroupMissingError", StageGroupMissingError);
            StageContext = (function () {
                function StageContext() {
                    this.stateStore = {};
                }
                StageContext.prototype.getAbsUrl = function (path) {
                    return new URI(this.rootUrl).filename(path).toString();
                };
                return StageContext;
            }());
            exports_1("StageContext", StageContext);
            GameEngine = (function () {
                function GameEngine() {
                    this.clear();
                }
                GameEngine.prototype.clear = function () {
                    this._context = new StageContext();
                    this._loadedStageGroups = {};
                    this._game = null;
                };
                GameEngine.prototype.openGameAsync = function (url) {
                    var _this = this;
                    return Utility.getJson(url).then(function (json) {
                        _this._game = json;
                        _this._context.rootUrl = new URI(url).hash("").search("").filename("").toString();
                        return _this.gotoStageAsync(new StageName(":"));
                    });
                };
                GameEngine.prototype.getStageGroupAsync = function (groupName) {
                    var _this = this;
                    if (!this._game)
                        return $.Deferred().reject(new Error("Game is not ready."));
                    var group = this._loadedStageGroups[groupName];
                    if (!group) {
                        var importUrl = this._game.stageGroups[groupName];
                        if (!importUrl)
                            return $.Deferred().reject(new StageGroupMissingError(groupName));
                        return this._loadedStageGroups[groupName] = Utility.getJson(this._context.getAbsUrl(importUrl))
                            .then(function (json) { return _this._loadedStageGroups[groupName] = json; });
                    }
                    if (group.then)
                        return group;
                    else
                        return $.Deferred().resolve(group);
                };
                GameEngine.prototype.gotoStageAsync = function (name) {
                    var _this = this;
                    if (name)
                        name = StageName.Combine(this._context.currentStage, name);
                    else
                        name = new StageName(":");
                    console.log("gotoStageAsync %s", name.toString());
                    return this.getStageGroupAsync(name.groupName).then(function (group) {
                        var stage = group.stages[name.localName];
                        if (stage) {
                            _this._context.prompt = stage.prompt;
                            _this._context.options = stage.options;
                            _this._context.currentStage = name;
                            return;
                        }
                        return $.Deferred().reject(new StageMissingError(name));
                    });
                };
                GameEngine.prototype.SaveContext = function () {
                    return { currentStage: this._context.currentStage.toString(), stateStore: this._context.stateStore };
                };
                GameEngine.prototype.LoadContextAsync = function (obj) {
                    this._context.stateStore = obj.stateStore || {};
                    return this.gotoStageAsync(new StageName(obj.currentStage || ":"));
                };
                Object.defineProperty(GameEngine.prototype, "context", {
                    get: function () { return this._context; },
                    enumerable: true,
                    configurable: true
                });
                return GameEngine;
            }());
            exports_1("GameEngine", GameEngine);
        }
    };
});

//# sourceMappingURL=ptag.js.map
