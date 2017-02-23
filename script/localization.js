System.register(["./utility"], function (exports_1, context_1) {
    "use strict";
    var __moduleName = context_1 && context_1.id;
    function fallbackLanguageTag(tag) {
        var index = tag.lastIndexOf("-");
        if (index <= 0)
            return "";
        return tag.substr(0, index);
    }
    var Utility, LocalizedResourceProvider, LR;
    return {
        setters: [
            function (Utility_1) {
                Utility = Utility_1;
            }
        ],
        execute: function () {
            LocalizedResourceProvider = (function () {
                function LocalizedResourceProvider() {
                    this.loadedDicts = {};
                    this.observables = {};
                }
                LocalizedResourceProvider.prototype.initializeAsync = function (initialLocale) {
                    var _this = this;
                    return Utility.getJson(LocalizedResourceProvider.LocalizedResourcePath + "/catalog.json").then(function (data) {
                        _this._catalog = data;
                        if (initialLocale)
                            return _this.setCurrentLocaleAsync(initialLocale);
                        return $.Deferred().resolve();
                    });
                };
                LocalizedResourceProvider.prototype.getCurrentLocale = function () {
                    return this._currentLocale;
                };
                LocalizedResourceProvider.prototype.setCurrentLocaleAsync = function (value) {
                    var _this = this;
                    console.assert(!!this._catalog);
                    value = (value || "").toLowerCase();
                    while (value && this._catalog.languages.indexOf(value) < 0) {
                        var fb = this._catalog.fallbacks[value] || fallbackLanguageTag(value);
                    }
                    if (!value) {
                        console.assert(this._catalog.languages.indexOf(LocalizedResourceProvider.FallbackLanguage) >= 0);
                        value = LocalizedResourceProvider.FallbackLanguage;
                    }
                    this._currentLocale = value;
                    if (!(value in this.loadedDicts)) {
                        this.loadedDicts[value] = null;
                        return this.fetchResourceDictAsync(value).then((function (dict) {
                            _this.loadedDicts[value] = dict;
                            if (_this._currentLocale === value)
                                _this.refreshObservables();
                            return {};
                        }));
                    }
                    return $.Deferred().resolve();
                };
                LocalizedResourceProvider.prototype.getString = function () {
                    var dict = this.loadedDicts[this._currentLocale];
                    if (!dict)
                        return null;
                    var value = dict[arguments[0]];
                    if (!value)
                        return undefined;
                    if (value instanceof Array)
                        value = value.join("");
                    if (arguments.length > 1) {
                        var para = Array.apply(null, arguments);
                        para[0] = value;
                        value = Utility.formatString.apply(null, para);
                    }
                    return value;
                };
                LocalizedResourceProvider.prototype.getObservableString = function (key) {
                    var v = this.observables[key];
                    if (v)
                        return v;
                    var lv = this.getString(key);
                    v = ko.observable(lv || "[" + key + "]");
                    this.observables[key] = v;
                    return v;
                };
                LocalizedResourceProvider.prototype.refreshObservables = function () {
                    for (var key in this.observables) {
                        if (this.observables.hasOwnProperty(key)) {
                            var lv = this.getString(key);
                            if (lv)
                                this.observables[key](lv);
                        }
                    }
                };
                LocalizedResourceProvider.prototype.fetchResourceDictAsync = function (locale) {
                    console.assert(!!locale);
                    return Utility.getJson(LocalizedResourceProvider.LocalizedResourcePath + "/" + locale + "/text.json");
                };
                return LocalizedResourceProvider;
            }());
            LocalizedResourceProvider.LocalizedResourcePath = "data/localization";
            LocalizedResourceProvider.FallbackLanguage = "en";
            exports_1("LocalizedResourceProvider", LocalizedResourceProvider);
            exports_1("LR", LR = new LocalizedResourceProvider());
        }
    };
});

//# sourceMappingURL=localization.js.map
