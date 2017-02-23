System.register(["./utility", "./locale"], function (exports_1, context_1) {
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
    function parseMarkup(mk) {
        var x = $.parseXML("<root>" + mk + "</root>");
        $("a[href]", x).attr("target", "_blank");
        return x.documentElement.innerHTML;
    }
    exports_1("parseMarkup", parseMarkup);
    var Utility, Locale, StageName, StageMissingError, StageGroupMissingError, StageContext, GameEngine;
    return {
        setters: [
            function (Utility_1) {
                Utility = Utility_1;
            },
            function (Locale_1) {
                Locale = Locale_1;
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
                    this.clear();
                }
                StageContext.prototype.getAbsUrl = function (path) {
                    return new URI(this.rootUrl).filename(path).toString();
                };
                StageContext.prototype.clear = function () {
                    this.rootUrl = null;
                    this.currentStage = null;
                    this.stateStore = {};
                    this.prompt = null;
                    this.options = null;
                };
                return StageContext;
            }());
            exports_1("StageContext", StageContext);
            GameEngine = (function () {
                function GameEngine() {
                    this._context = new StageContext();
                    this._loadedStageGroups = {};
                    this._loadingStageGroups = {};
                    this._currentLocale = "";
                    this.clear();
                }
                GameEngine.prototype.getCurrentLocale = function () {
                    return this._currentLocale;
                };
                GameEngine.prototype.setCurrentLocaleAsync = function (locale) {
                    if (locale === this._currentLocale)
                        return $.Deferred().resolve();
                    this._currentLocale = locale;
                    if (!!this._game) {
                        return this.gotoStageAsync(this._context.currentStage);
                    }
                    return $.Deferred().resolve();
                };
                GameEngine.prototype.clear = function () {
                    this._loadedStageGroups = {};
                    this._game = null;
                    this._context.clear();
                };
                GameEngine.prototype.openGameAsync = function (url) {
                    var _this = this;
                    return Utility.getJson(url).then(function (json) {
                        _this._game = json;
                        _this._context.rootUrl = new URI(url).hash("").search("").filename("").toString();
                        return _this.gotoStageAsync(new StageName(":"));
                    });
                };
                GameEngine.prototype.tryGetLocalizedStageGroupAsync = function (groupName, locale) {
                    var _this = this;
                    console.assert(!!this._game);
                    var group = this._loadedStageGroups[groupName];
                    if (group !== undefined) {
                        var lg = group.localized[locale];
                        if (lg)
                            return $.Deferred().resolve(lg);
                    }
                    var dg = (this._loadingStageGroups[groupName] || {})[locale];
                    if (dg)
                        return dg;
                    var importUrl = new URI(this._context.getAbsUrl(this._game.stageGroups[groupName]));
                    importUrl.filename(Utility.fileNameAddSuffix(importUrl.filename(), "." + locale));
                    if (!importUrl)
                        return $.Deferred().reject(new StageGroupMissingError(groupName));
                    return this._loadingStageGroups[groupName][locale] = this.getStageGroupAsync(groupName).then(function (g) {
                        group = g;
                        return Utility.getJson(_this._context.getAbsUrl(importUrl.toString()));
                    }).then(function (json) { return group.localized[locale] = json; }, function (err) {
                        console.log("tryGetLocalizedStageGroupAsync", err);
                        var netErr = err;
                        if (netErr.IsBadRequest)
                            return group.localized[locale] = null;
                        return null;
                    });
                };
                GameEngine.prototype.getStageGroupAsync = function (groupName) {
                    var _this = this;
                    console.assert(!!this._game);
                    var group = this._loadedStageGroups[groupName];
                    if (group)
                        return $.Deferred().resolve(group);
                    var dg = (this._loadingStageGroups[groupName] || {})["*"];
                    if (dg)
                        return dg;
                    var importUrl = this._game.stageGroups[groupName];
                    if (!importUrl)
                        return $.Deferred().reject(new StageGroupMissingError(groupName));
                    if (!this._loadingStageGroups[groupName])
                        this._loadingStageGroups[groupName] = {};
                    return this._loadingStageGroups[groupName]["*"] = Utility.getJson(this._context.getAbsUrl(importUrl))
                        .then(function (json) {
                        json.sourceUrl = _this._context.getAbsUrl(importUrl);
                        json.localized = {};
                        return _this._loadedStageGroups[groupName] = json;
                    });
                };
                GameEngine.prototype.getStageAsync = function (name) {
                    var d = $.Deferred();
                    this.getStageGroupAsync(name.groupName).then(function (group) {
                        var s = group.stages[name.localName];
                        if (s)
                            d.resolve(s);
                        else
                            d.reject(new StageMissingError(name));
                    }, function () { d.reject.apply(d, arguments); });
                    return d;
                };
                GameEngine.prototype.gotoStageAsync = function (name) {
                    var _this = this;
                    if (name)
                        name = StageName.Combine(this._context.currentStage, name);
                    else
                        name = new StageName(":");
                    console.log("gotoStageAsync %s", name.toString());
                    var stage;
                    var newPrompt;
                    var newOptionsText = [];
                    return this.getStageAsync(name).then(function (s) {
                        stage = s;
                        newPrompt = stage.prompt;
                        newOptionsText = stage.options.map(function (opt) { return opt.text; });
                        if (!_this._currentLocale || _this._game.lang.default === _this._currentLocale)
                            return;
                        var ds = [_this.getLocalizedStageGroupValueAsync(name.groupName, function (lsg) { return newPrompt = lsg.stages[name.localName].prompt; })];
                        var _loop_1 = function (i) {
                            var i1 = i;
                            ds.push(_this.getLocalizedStageGroupValueAsync(name.groupName, function (lsg) {
                                return newOptionsText[i1] = lsg.stages[name.localName].options[i1];
                            }));
                        };
                        for (var i = 0; i < stage.options.length; i++) {
                            _loop_1(i);
                        }
                        return $.when.apply($, ds);
                    }).then(function () {
                        if (stage) {
                            _this._context.prompt = newPrompt;
                            _this._context.options = stage.options.map(function (opt, i) {
                                return { target: opt.target, text: newOptionsText[i] };
                            });
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
                GameEngine.prototype.getLocalizedStageGroupValueAsync = function (groupName, selector, fallback, locale) {
                    var _this = this;
                    locale = locale || this._currentLocale;
                    var attempts = 0;
                    var nextAttempt = function (lsg) {
                        if (!lsg) {
                            while (attempts < 2) {
                                attempts++;
                                var lc = void 0;
                                switch (attempts) {
                                    case 1:
                                        lc = Locale.getSurrogateLanguage(locale);
                                        break;
                                    case 2:
                                        lc = Locale.getSurrogateLanguage(Locale.fallbackLanguageTag(locale));
                                        break;
                                }
                                if (_this._game.lang.supported.indexOf(locale) > 0) {
                                    console.log("getLocalizedStageGroupValueAsync", "try locale", lc);
                                    if (locale)
                                        return _this.tryGetLocalizedStageGroupAsync(groupName, lc).then(nextAttempt);
                                }
                            }
                            ;
                            return fallback;
                        }
                        return selector(lsg);
                    };
                    return this.tryGetLocalizedStageGroupAsync(groupName, locale).then(nextAttempt);
                };
                return GameEngine;
            }());
            exports_1("GameEngine", GameEngine);
        }
    };
});

//# sourceMappingURL=ptag.js.map
